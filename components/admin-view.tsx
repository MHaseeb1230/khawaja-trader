"use client";

import { useEffect, useState } from "react";
import type { AccountStatus, Category, Order, OrderStatus, Product, PublicCustomer, Settings } from "@/lib/types";
import { pkr, statusLabel } from "@/lib/format";

const field = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand";

type Tab = "products" | "orders" | "customers" | "settings";

const emptyProduct = {
  name: "",
  categoryId: "cosmetics",
  description: "",
  retailPrice: "",
  wholesalePrice: "",
  unitLabel: "per piece",
  stock: "40",
  minimumWholesaleQuantity: "1",
  imageUrl: "",
};

export function AdminView() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<PublicCustomer[]>([]);
  const [form, setForm] = useState(emptyProduct);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadCatalog() {
    const response = await fetch("/api/products", { cache: "no-store" });
    const data = (await response.json()) as { products: Product[]; categories: Category[]; settings: Settings };
    setProducts(data.products);
    setCategories(data.categories);
    setSettings(data.settings);
    setForm((current) => ({ ...current, categoryId: current.categoryId || data.categories[0]?.id || "" }));
  }

  async function loadOrders() {
    const response = await fetch("/api/orders?scope=admin", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { orders: Order[] };
    setOrders(data.orders);
  }

  async function loadCustomers() {
    const response = await fetch("/api/customers", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { customers: PublicCustomer[] };
    setCustomers(data.customers);
  }

  useEffect(() => {
    fetch("/api/admin/login")
      .then((response) => response.json())
      .then((data: { ok: boolean }) => {
        setAuthed(data.ok);
        if (data.ok) {
          void loadCatalog();
          void loadOrders();
          void loadCustomers();
        }
      })
      .catch(() => setAuthed(false));
  }, []);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoginError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      setLoginError("Wrong password");
      return;
    }
    setAuthed(true);
    await loadCatalog();
    await loadOrders();
    await loadCustomers();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
  }

  function editProduct(product: Product) {
    setEditing(product.id);
    setForm({
      name: product.name,
      categoryId: product.categoryId,
      description: product.description,
      retailPrice: String(product.retailPrice),
      wholesalePrice: String(product.wholesalePrice),
      unitLabel: product.unitLabel,
      stock: String(product.stock ?? 0),
      minimumWholesaleQuantity: String(product.minimumWholesaleQuantity ?? 1),
      imageUrl: product.imageUrl,
    });
    setTab("products");
  }

  async function saveProduct(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const payload = {
      ...form,
      retailPrice: Number(form.retailPrice) || 0,
      wholesalePrice: Number(form.wholesalePrice) || 0,
      stock: Number(form.stock) || 0,
      minimumWholesaleQuantity: Number(form.minimumWholesaleQuantity) || 1,
    };
    const response = await fetch(editing ? `/api/products/${editing}` : "/api/products", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setMessage("Could not save the product");
      return;
    }
    setEditing(null);
    setForm({ ...emptyProduct, categoryId: categories[0]?.id ?? "cosmetics" });
    setMessage(editing ? "Product updated" : "Product added");
    await loadCatalog();
  }

  async function removeProduct(id: string) {
    if (!window.confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    await loadCatalog();
  }

  async function setCustomerStatus(id: string, status: AccountStatus) {
    await fetch(`/api/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadCustomers();
  }

  async function setStatus(id: string, status: OrderStatus) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadOrders();
  }

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    if (!settings) return;
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      setMessage("Could not save settings");
      return;
    }
    const data = (await response.json()) as { settings: Settings };
    setSettings(data.settings);
    setMessage("Settings saved. WhatsApp buttons now use this number.");
  }

  if (authed === null) {
    return <p className="py-24 text-center text-sm text-gray-400">Loading admin...</p>;
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <form onSubmit={login} className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-sm font-bold text-white">KT</div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Khawaja Traders</h1>
          <p className="mt-1 text-sm text-gray-500">Admin sign in</p>
          <input type="password" required className={`${field} mt-5`} placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {loginError ? <p className="mt-2 text-sm text-red-600">{loginError}</p> : null}
          <button className="mt-4 w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white">Sign in</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="font-heading text-lg font-bold text-gray-900">Admin</p>
            <p className="text-xs text-gray-400">Khawaja Traders</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <a href="/" className="text-gray-500 hover:text-brand">View shop</a>
            <button onClick={() => void logout()} className="rounded-xl border border-gray-200 px-3 py-1.5">Sign out</button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex gap-2">
          {(["products", "orders", "customers", "settings"] as Tab[]).map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`rounded-xl px-3 py-2 text-sm font-semibold capitalize ${tab === item ? "bg-brand text-white" : "bg-white text-gray-600 ring-1 ring-gray-200"}`}>
              {item}
            </button>
          ))}
        </div>
        {message ? <p className="mb-4 rounded-xl bg-teal-50 px-3 py-2 text-sm text-brand">{message}</p> : null}

        {tab === "products" ? (
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <form onSubmit={saveProduct} className="h-fit space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <h2 className="font-semibold">{editing ? "Edit product" : "Add product"}</h2>
              <p className="text-xs leading-relaxed text-gray-400">Sample items are already in the catalog. Replace them with your own name, prices, and photo link.</p>
              <input required className={field} placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <select className={field} value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input required className={field} inputMode="numeric" placeholder="Retail Rs" value={form.retailPrice} onChange={(event) => setForm({ ...form, retailPrice: event.target.value })} />
                <input required className={field} inputMode="numeric" placeholder="Wholesale Rs" value={form.wholesalePrice} onChange={(event) => setForm({ ...form, wholesalePrice: event.target.value })} />
              </div>
              <input className={field} placeholder="Unit, e.g. per piece" value={form.unitLabel} onChange={(event) => setForm({ ...form, unitLabel: event.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className={field} inputMode="numeric" placeholder="Stock" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
                <input className={field} inputMode="numeric" placeholder="Min wholesale qty" value={form.minimumWholesaleQuantity} onChange={(event) => setForm({ ...form, minimumWholesaleQuantity: event.target.value })} />
              </div>
              <input className={field} placeholder="Image URL (optional)" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
              <textarea className={field} rows={2} placeholder="Short description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              <button className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white">{editing ? "Update" : "Add product"}</button>
              {editing ? (
                <button type="button" className="w-full text-sm text-gray-400" onClick={() => { setEditing(null); setForm({ ...emptyProduct, categoryId: categories[0]?.id ?? "" }); }}>
                  Cancel edit
                </button>
              ) : null}
            </form>
            <div className="space-y-2">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-gray-100">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400">
                      {categories.find((category) => category.id === product.categoryId)?.name} · Retail {pkr(product.retailPrice)} · Wholesale {pkr(product.wholesalePrice)} · Stock {product.stock}
                      {product.minimumWholesaleQuantity > 1 ? ` · Min wholesale ${product.minimumWholesaleQuantity}` : ""}
                    </p>
                  </div>
                  <button className="text-sm text-brand" onClick={() => editProduct(product)}>Edit</button>
                  <button className="text-sm text-red-500" onClick={() => void removeProduct(product.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "orders" ? (
          <div className="space-y-3">
            {orders.length === 0 ? <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-gray-400">No orders yet.</p> : null}
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl bg-white p-4 ring-1 ring-gray-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{order.id} · {order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.phone} · {order.city} · {order.priceMode} · {new Date(order.createdAt).toLocaleString()}</p>
                    <p className="mt-1 text-sm text-gray-600">{order.address}{order.areaName ? `, ${order.areaName}` : ""}</p>
                  </div>
                  <select className="rounded-xl border border-gray-200 px-2 py-1.5 text-sm" value={order.status} onChange={(event) => void setStatus(order.id, event.target.value as OrderStatus)}>
                    <option value="new">New</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="out_for_delivery">Out for delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <ul className="mt-3 text-sm text-gray-600">
                  {order.items.map((item) => (
                    <li key={`${order.id}-${item.productId}-${item.name}`}>{item.name} × {item.qty} — {pkr(item.unitPrice * item.qty)}</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-gray-500">Items {pkr(order.subtotal || order.total)} · Delivery {pkr(order.deliveryCharge || 0)} · <span className="font-bold text-gray-900">{pkr(order.total)}</span> · {statusLabel(order.status)}</p>
              </article>
            ))}
          </div>
        ) : null}

        {tab === "customers" ? (
          <div className="space-y-3">
            {customers.length === 0 ? <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-gray-400">No customer accounts yet.</p> : null}
            {customers.map((person) => (
              <article key={person.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-gray-100">
                <div>
                  <p className="font-semibold">{person.name} · {person.accountType}</p>
                  <p className="text-xs text-gray-400">{person.phone}{person.shopName ? ` · ${person.shopName}` : ""} · {person.city}</p>
                </div>
                <select className="rounded-xl border border-gray-200 px-2 py-1.5 text-sm capitalize" value={person.status} onChange={(event) => void setCustomerStatus(person.id, event.target.value as AccountStatus)}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </article>
            ))}
          </div>
        ) : null}

        {tab === "settings" && settings ? (
          <form onSubmit={saveSettings} className="max-w-xl space-y-3 rounded-2xl bg-white p-5 ring-1 ring-gray-100">
            <h2 className="font-semibold">Shop settings</h2>
            <p className="text-xs leading-relaxed text-gray-400">Put your WhatsApp number here, with or without 0. Example: 03001234567. Product and cart buttons will open that chat.</p>
            <input className={field} placeholder="Store name" value={settings.storeName} onChange={(event) => setSettings({ ...settings, storeName: event.target.value })} />
            <input className={field} placeholder="Tagline" value={settings.tagline} onChange={(event) => setSettings({ ...settings, tagline: event.target.value })} />
            <input className={field} placeholder="City" value={settings.city} onChange={(event) => setSettings({ ...settings, city: event.target.value })} />
            <input className={field} placeholder="Address" value={settings.address} onChange={(event) => setSettings({ ...settings, address: event.target.value })} />
            <input className={field} placeholder="WhatsApp number" value={settings.whatsapp} onChange={(event) => setSettings({ ...settings, whatsapp: event.target.value })} />
            <input className={field} placeholder="Phone shown on the site" value={settings.phoneDisplay} onChange={(event) => setSettings({ ...settings, phoneDisplay: event.target.value })} />
            <button className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white">Save settings</button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
