"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/components/store";
import { deliveryAreas } from "@/lib/delivery";
import { orderMessage, pkr, whatsappLink } from "@/lib/format";
import type { Order } from "@/lib/types";

const field = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15";

export function CheckoutView() {
  const { lines, cartTotal, priceMode, settings, clearCart, customer, customerReady, refresh } = useStore();
  const [address, setAddress] = useState("");
  const [city, setCity] = useState<"Rawalpindi" | "Islamabad">("Rawalpindi");
  const [areaId, setAreaId] = useState(deliveryAreas[0].id);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const areas = useMemo(() => deliveryAreas.filter((area) => area.city === city), [city]);
  const area = areas.find((item) => item.id === areaId) ?? areas[0];

  useEffect(() => {
    if (!customer) return;
    setAddress(customer.address);
    if (customer.city === "Islamabad" || customer.city === "Rawalpindi") setCity(customer.city);
  }, [customer]);

  useEffect(() => {
    if (!areas.some((item) => item.id === areaId)) setAreaId(areas[0].id);
  }, [areas, areaId]);

  async function placeOrder() {
    setError("");
    if (!customer || lines.length === 0 || !area) return;
    setBusy(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          city,
          areaId: area.id,
          note,
          priceMode,
          items: lines.map((line) => ({ productId: line.product.id, qty: line.qty })),
        }),
      });
      const data = (await response.json()) as { order?: Order; error?: string };
      if (!response.ok || !data.order) {
        setError(data.error || "Could not place the order");
        return;
      }
      setOrder(data.order);
      clearCart();
      await refresh();
      const link = whatsappLink(settings.whatsapp, messageFor(data.order));
      if (link) window.open(link, "_blank", "noopener,noreferrer");
    } catch {
      setError("Could not place the order. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function messageFor(current: Order) {
    return orderMessage({
      storeName: settings.storeName,
      priceMode: current.priceMode,
      items: current.items,
      total: current.total,
      customerName: current.customerName,
      phone: current.phone,
      address: `${current.address}, ${current.areaName}`,
      city: current.city,
      note: `Cash on delivery. Delivery ${pkr(current.deliveryCharge)}. ${current.note}`.trim(),
    });
  }

  if (!customerReady) return <p className="py-24 text-center text-sm text-gray-400">Loading checkout...</p>;

  if (!customer) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-3xl bg-white px-6 py-10 shadow-sm ring-1 ring-gray-100">
          <h1 className="font-heading text-2xl font-bold text-gray-900">Sign in to place an order</h1>
          <p className="mt-2 text-sm text-gray-500">Your cart stays saved. Retail accounts can order right away. Wholesale opens after approval.</p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/login?next=/checkout" className="rounded-xl bg-brand py-2.5 text-sm font-semibold text-white">Login</Link>
            <Link href="/register?next=/checkout" className="rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700">Create account</Link>
          </div>
        </div>
      </div>
    );
  }

  if (order) {
    const link = whatsappLink(settings.whatsapp, messageFor(order));
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-3xl bg-white px-6 py-10 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Order saved</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-gray-900">{order.id}</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Cash on delivery. Total {pkr(order.total)}, including {pkr(order.deliveryCharge)} delivery to {order.areaName}.
            {link ? " WhatsApp should have opened with the same list." : ""}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href={`/orders/${order.id}`} className="rounded-xl bg-brand py-2.5 text-sm font-semibold text-white">View receipt</Link>
            {link ? <a href={link} target="_blank" rel="noreferrer" className="rounded-xl bg-[#25D366] py-2.5 text-sm font-semibold text-white">Open WhatsApp again</a> : null}
            <Link href="/my-orders" className="rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700">My orders</Link>
          </div>
        </div>
      </div>
    );
  }

  const delivery = area?.charge ?? 0;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="mt-1 text-sm text-gray-500">Cash on delivery in Rawalpindi and Islamabad. Signed in as {customer.name}.</p>
        {customer.accountType === "wholesale" && customer.status !== "active" ? (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Your wholesale account is {customer.status}. This order will use retail prices until it is approved.
          </p>
        ) : null}
        <form
          className="mt-6 space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
          onSubmit={(event) => {
            event.preventDefault();
            void placeOrder();
          }}
        >
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Name</span>
            <input className={field} value={customer.name} readOnly />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Phone</span>
            <input className={field} value={customer.phone} readOnly />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">City</span>
            <select className={field} value={city} onChange={(event) => setCity(event.target.value as "Rawalpindi" | "Islamabad")}>
              <option>Rawalpindi</option>
              <option>Islamabad</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Delivery area</span>
            <select className={field} value={area?.id} onChange={(event) => setAreaId(event.target.value)}>
              {areas.map((item) => (
                <option key={item.id} value={item.id}>{item.name} — {pkr(item.charge)}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Address</span>
            <textarea required rows={3} className={field} value={address} onChange={(event) => setAddress(event.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Note</span>
            <input className={field} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional" />
          </label>
          <p className="text-xs text-gray-400">Payment: cash on delivery. Pay the rider when the order arrives.</p>
          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <button disabled={busy || lines.length === 0} className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:bg-gray-200 disabled:text-gray-400">
            {busy ? "Placing order..." : "Place order"}
          </button>
        </form>
      </div>
      <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="font-semibold text-gray-900">Order summary</h2>
        <p className="mt-1 text-xs uppercase tracking-wide text-brand">{priceMode} prices</p>
        {lines.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">Cart is empty. <Link className="text-brand" href="/">Add products</Link></p>
        ) : (
          <ul className="mt-4 space-y-3">
            {lines.map((line) => (
              <li key={line.product.id} className="flex justify-between gap-3 text-sm">
                <span className="text-gray-600">{line.product.name} × {line.qty}</span>
                <span className="font-medium">{pkr(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Items</span><span>{pkr(cartTotal)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>{pkr(delivery)}</span></div>
          <div className="flex justify-between font-bold"><span>Total</span><span>{pkr(cartTotal + delivery)}</span></div>
        </div>
      </aside>
    </div>
  );
}
