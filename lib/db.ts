import fs from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import type { Database } from "./types";
import { createSeed } from "./seed";

const filePath = path.join(process.cwd(), "data", "store.json");

let chain: Promise<unknown> = Promise.resolve();
let supabaseClient: SupabaseClient | null = null;

function normalize(db: Database): Database {
  if (!Array.isArray(db.customers)) db.customers = [];
  if (!Array.isArray(db.orders)) db.orders = [];
  if (!Array.isArray(db.products)) db.products = [];
  if (!Array.isArray(db.categories)) db.categories = [];
  for (const product of db.products) {
    if (typeof product.stock !== "number") product.stock = product.inStock ? 40 : 0;
    if (typeof product.minimumWholesaleQuantity !== "number" || product.minimumWholesaleQuantity < 1) {
      product.minimumWholesaleQuantity = product.id === "beauty-soap" || product.id === "chocolate-box" ? 3 : 1;
    }
    if (typeof product.imageUrl !== "string") product.imageUrl = "";
    product.inStock = product.stock > 0;
  }
  for (const order of db.orders) {
    if (!order.customerId) order.customerId = "";
    if (!order.paymentMethod) order.paymentMethod = "cod";
    if (typeof order.deliveryCharge !== "number") order.deliveryCharge = 0;
    if (typeof order.subtotal !== "number") order.subtotal = order.total ?? 0;
    if (!order.areaId) order.areaId = "";
    if (!order.areaName) order.areaName = "";
  }
  return db;
}

function readFileDb(): Database {
  if (!fs.existsSync(filePath)) {
    const seed = createSeed();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(seed, null, 2));
    return seed;
  }
  return normalize(JSON.parse(fs.readFileSync(filePath, "utf8")) as Database);
}

function writeFileDb(db: Database) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
}

function configured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

function supabase() {
  if (!supabaseClient) {
    supabaseClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseClient;
}

type Remote = Database | "missing" | "empty";

function functionMissing(error: { message?: string; code?: string }) {
  const message = error.message ?? "";
  return error.code === "PGRST202" || /schema cache|could not find the function/i.test(message);
}

async function fetchRemote(): Promise<Remote> {
  if (!configured()) return "missing";
  const { data, error } = await supabase().rpc("load_store");
  if (error) {
    if (functionMissing(error)) return "missing";
    throw new Error(error.message);
  }
  const parsed = typeof data === "string" ? (JSON.parse(data) as Database) : (data as Database | null);
  if (!parsed?.settings) return "empty";
  return normalize(parsed);
}

function quoteIds(ids: string[]) {
  return `(${ids.map((id) => `"${id.replaceAll('"', '""')}"`).join(",")})`;
}

async function replaceRows(table: string, rows: Record<string, unknown>[]) {
  const client = supabase();
  if (rows.length === 0) {
    const { error } = await client.from(table).delete().neq("id", "");
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await client.from(table).upsert(rows);
  if (error) throw new Error(error.message);
  const { error: deleteError } = await client.from(table).delete().not("id", "in", quoteIds(rows.map((row) => String(row.id))));
  if (deleteError) throw new Error(deleteError.message);
}

async function persist(db: Database) {
  const { error: settingsError } = await supabase().from("settings").upsert({
    id: 1,
    store_name: db.settings.storeName,
    tagline: db.settings.tagline,
    city: db.settings.city,
    address: db.settings.address,
    whatsapp: db.settings.whatsapp,
    phone_display: db.settings.phoneDisplay,
  });
  if (settingsError) throw new Error(settingsError.message);

  await replaceRows(
    "categories",
    db.categories.map((category, index) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      emoji: category.emoji,
      sort_order: index,
    })),
  );
  await replaceRows(
    "products",
    db.products.map((product, index) => ({
      id: product.id,
      category_id: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      retail_price: product.retailPrice,
      wholesale_price: product.wholesalePrice,
      unit_label: product.unitLabel,
      stock: product.stock,
      minimum_wholesale_quantity: product.minimumWholesaleQuantity,
      in_stock: product.stock > 0,
      image_url: product.imageUrl ?? "",
      sort_order: index,
    })),
  );
  await replaceRows(
    "customers",
    db.customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
      shop_name: customer.shopName,
      account_type: customer.accountType,
      status: customer.status,
      salt: customer.salt,
      password_hash: customer.passwordHash,
      created_at: customer.createdAt,
    })),
  );
  await replaceRows(
    "orders",
    db.orders.map((order) => ({
      id: order.id,
      created_at: order.createdAt,
      customer_id: order.customerId,
      customer_name: order.customerName,
      phone: order.phone,
      address: order.address,
      city: order.city,
      area_id: order.areaId,
      area_name: order.areaName,
      note: order.note,
      price_mode: order.priceMode,
      payment_method: order.paymentMethod,
      items: order.items,
      subtotal: order.subtotal,
      delivery_charge: order.deliveryCharge,
      total: order.total,
      status: order.status,
    })),
  );
}

export function updateDb<T>(fn: (db: Database) => T): Promise<T> {
  const run = chain.then(async () => {
    await connection();
    const remote = await fetchRemote();
    if (remote === "missing") {
      const db = readFileDb();
      const result = fn(db);
      writeFileDb(db);
      return result;
    }
    const db = remote === "empty" ? readFileDb() : remote;
    const result = fn(db);
    await persist(db);
    return result;
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function readDb(): Promise<Database> {
  const run = chain.then(async () => {
    await connection();
    const remote = await fetchRemote();
    if (remote === "missing") return structuredClone(readFileDb());
    if (remote === "empty") {
      const seeded = readFileDb();
      await persist(seeded);
      return structuredClone(seeded);
    }
    return structuredClone(remote);
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
