create table if not exists settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null,
  tagline text not null,
  city text not null,
  address text not null,
  whatsapp text not null default '',
  phone_display text not null default ''
);

create table if not exists categories (
  id text primary key,
  name text not null,
  slug text not null,
  emoji text not null default '',
  sort_order integer not null default 0
);

create table if not exists products (
  id text primary key,
  category_id text not null,
  name text not null,
  slug text not null,
  description text not null default '',
  retail_price integer not null,
  wholesale_price integer not null,
  unit_label text not null,
  stock integer not null default 0,
  minimum_wholesale_quantity integer not null default 1,
  in_stock boolean not null default false,
  image_url text not null default '',
  sort_order integer not null default 0
);

create table if not exists customers (
  id text primary key,
  name text not null,
  phone text not null,
  city text not null default '',
  address text not null default '',
  shop_name text not null default '',
  account_type text not null,
  status text not null,
  salt text not null,
  password_hash text not null,
  created_at timestamptz not null
);

create table if not exists orders (
  id text primary key,
  created_at timestamptz not null,
  customer_id text not null default '',
  customer_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  area_id text not null default '',
  area_name text not null default '',
  note text not null default '',
  price_mode text not null,
  payment_method text not null default 'cod',
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null,
  delivery_charge integer not null,
  total integer not null,
  status text not null
);

alter table settings enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;

revoke all on table settings from anon, authenticated;
revoke all on table categories from anon, authenticated;
revoke all on table products from anon, authenticated;
revoke all on table customers from anon, authenticated;
revoke all on table orders from anon, authenticated;

create or replace function load_store()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'settings', (
      select jsonb_build_object(
        'storeName', store_name,
        'tagline', tagline,
        'city', city,
        'address', address,
        'whatsapp', whatsapp,
        'phoneDisplay', phone_display
      )
      from settings
      where id = 1
    ),
    'categories', coalesce((
      select jsonb_agg(
        jsonb_build_object('id', id, 'name', name, 'slug', slug, 'emoji', emoji)
        order by sort_order
      )
      from categories
    ), '[]'::jsonb),
    'products', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', id,
          'categoryId', category_id,
          'name', name,
          'slug', slug,
          'description', description,
          'retailPrice', retail_price,
          'wholesalePrice', wholesale_price,
          'unitLabel', unit_label,
          'stock', stock,
          'minimumWholesaleQuantity', minimum_wholesale_quantity,
          'inStock', in_stock,
          'imageUrl', image_url
        )
        order by sort_order
      )
      from products
    ), '[]'::jsonb),
    'customers', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'phone', phone,
          'city', city,
          'address', address,
          'shopName', shop_name,
          'accountType', account_type,
          'status', status,
          'salt', salt,
          'passwordHash', password_hash,
          'createdAt', created_at
        )
        order by created_at
      )
      from customers
    ), '[]'::jsonb),
    'orders', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', id,
          'createdAt', created_at,
          'customerId', customer_id,
          'customerName', customer_name,
          'phone', phone,
          'address', address,
          'city', city,
          'areaId', area_id,
          'areaName', area_name,
          'note', note,
          'priceMode', price_mode,
          'paymentMethod', payment_method,
          'items', items,
          'subtotal', subtotal,
          'deliveryCharge', delivery_charge,
          'total', total,
          'status', status
        )
        order by created_at desc
      )
      from orders
    ), '[]'::jsonb)
  );
$$;

create or replace function save_store(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into settings (id, store_name, tagline, city, address, whatsapp, phone_display)
  values (
    1,
    payload->'settings'->>'storeName',
    payload->'settings'->>'tagline',
    payload->'settings'->>'city',
    payload->'settings'->>'address',
    coalesce(payload->'settings'->>'whatsapp', ''),
    coalesce(payload->'settings'->>'phoneDisplay', '')
  )
  on conflict (id) do update set
    store_name = excluded.store_name,
    tagline = excluded.tagline,
    city = excluded.city,
    address = excluded.address,
    whatsapp = excluded.whatsapp,
    phone_display = excluded.phone_display;

  delete from categories where id is not null;
  delete from products where id is not null;
  delete from customers where id is not null;
  delete from orders where id is not null;

  insert into categories (id, name, slug, emoji, sort_order)
  select
    item->>'id',
    item->>'name',
    item->>'slug',
    coalesce(item->>'emoji', ''),
    (ord - 1)::integer
  from jsonb_array_elements(coalesce(payload->'categories', '[]'::jsonb)) with ordinality as rows(item, ord);

  insert into products (
    id, category_id, name, slug, description, retail_price, wholesale_price,
    unit_label, stock, minimum_wholesale_quantity, in_stock, image_url, sort_order
  )
  select
    item->>'id',
    item->>'categoryId',
    item->>'name',
    item->>'slug',
    coalesce(item->>'description', ''),
    (item->>'retailPrice')::integer,
    (item->>'wholesalePrice')::integer,
    item->>'unitLabel',
    coalesce((item->>'stock')::integer, 0),
    greatest(coalesce((item->>'minimumWholesaleQuantity')::integer, 1), 1),
    coalesce((item->>'inStock')::boolean, coalesce((item->>'stock')::integer, 0) > 0),
    coalesce(item->>'imageUrl', ''),
    (ord - 1)::integer
  from jsonb_array_elements(coalesce(payload->'products', '[]'::jsonb)) with ordinality as rows(item, ord);

  insert into customers (
    id, name, phone, city, address, shop_name, account_type, status, salt, password_hash, created_at
  )
  select
    item->>'id',
    item->>'name',
    item->>'phone',
    coalesce(item->>'city', ''),
    coalesce(item->>'address', ''),
    coalesce(item->>'shopName', ''),
    item->>'accountType',
    item->>'status',
    item->>'salt',
    item->>'passwordHash',
    (item->>'createdAt')::timestamptz
  from jsonb_array_elements(coalesce(payload->'customers', '[]'::jsonb)) with ordinality as rows(item, ord);

  insert into orders (
    id, created_at, customer_id, customer_name, phone, address, city,
    area_id, area_name, note, price_mode, payment_method, items,
    subtotal, delivery_charge, total, status
  )
  select
    item->>'id',
    (item->>'createdAt')::timestamptz,
    coalesce(item->>'customerId', ''),
    item->>'customerName',
    item->>'phone',
    item->>'address',
    item->>'city',
    coalesce(item->>'areaId', ''),
    coalesce(item->>'areaName', ''),
    coalesce(item->>'note', ''),
    item->>'priceMode',
    coalesce(item->>'paymentMethod', 'cod'),
    coalesce(item->'items', '[]'::jsonb),
    coalesce((item->>'subtotal')::integer, (item->>'total')::integer, 0),
    coalesce((item->>'deliveryCharge')::integer, 0),
    coalesce((item->>'total')::integer, 0),
    item->>'status'
  from jsonb_array_elements(coalesce(payload->'orders', '[]'::jsonb)) with ordinality as rows(item, ord);
end;
$$;

revoke all on function load_store() from public, anon, authenticated;
revoke all on function save_store(jsonb) from public, anon, authenticated;
grant execute on function load_store() to service_role;
grant execute on function save_store(jsonb) to service_role;
