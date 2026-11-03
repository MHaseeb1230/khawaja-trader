"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/components/store";
import type { PublicCustomer } from "@/lib/types";

const field = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { refreshCustomer } = useStore();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    const data = (await response.json()) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(data.error || "Could not sign in");
      return;
    }
    await refreshCustomer();
    router.push(next);
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-16 w-full max-w-sm rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h1 className="font-heading text-2xl font-bold text-gray-900">Login</h1>
      <p className="mt-1 text-sm text-gray-500">Use the phone number on your Khawaja Traders account.</p>
      <input required className={`${field} mt-5`} inputMode="tel" placeholder="03XXXXXXXXX" value={phone} onChange={(event) => setPhone(event.target.value)} />
      <input required type="password" className={`${field} mt-3`} placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <button disabled={busy} className="mt-4 w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white">{busy ? "Signing in..." : "Sign in"}</button>
      <p className="mt-4 text-center text-sm text-gray-500">
        New here? <Link className="font-semibold text-brand" href={`/register?next=${encodeURIComponent(next)}`}>Create an account</Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { refreshCustomer } = useStore();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    city: "Rawalpindi",
    address: "",
    shopName: "",
    accountType: "retail" as "retail" | "wholesale",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = (await response.json()) as { error?: string; customer?: PublicCustomer };
    setBusy(false);
    if (!response.ok) {
      setError(data.error || "Could not create the account");
      return;
    }
    await refreshCustomer();
    router.push(next);
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-10 w-full max-w-md space-y-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h1 className="font-heading text-2xl font-bold text-gray-900">Create account</h1>
      <p className="text-sm text-gray-500">Retail can order immediately. Wholesale prices start after the shop approves your account.</p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setForm({ ...form, accountType: "retail" })} className={`rounded-xl py-2 text-sm font-semibold ${form.accountType === "retail" ? "bg-brand text-white" : "bg-gray-100 text-gray-600"}`}>Retail</button>
        <button type="button" onClick={() => setForm({ ...form, accountType: "wholesale" })} className={`rounded-xl py-2 text-sm font-semibold ${form.accountType === "wholesale" ? "bg-brand text-white" : "bg-gray-100 text-gray-600"}`}>Wholesale</button>
      </div>
      <input required className={field} placeholder="Your name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      <input required className={field} inputMode="tel" placeholder="03XXXXXXXXX" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
      <input required type="password" minLength={6} className={field} placeholder="Password, at least 6 characters" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
      <select className={field} value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })}>
        <option>Rawalpindi</option>
        <option>Islamabad</option>
      </select>
      <textarea required rows={2} className={field} placeholder="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
      {form.accountType === "wholesale" ? (
        <input required className={field} placeholder="Shop name" value={form.shopName} onChange={(event) => setForm({ ...form, shopName: event.target.value })} />
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button disabled={busy} className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white">{busy ? "Creating..." : "Create account"}</button>
      <p className="text-center text-sm text-gray-500">
        Already registered? <Link className="font-semibold text-brand" href={`/login?next=${encodeURIComponent(next)}`}>Login</Link>
      </p>
    </form>
  );
}
