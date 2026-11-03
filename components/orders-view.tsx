"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/components/store";
import { pkr, statusLabel } from "@/lib/format";
import type { Order } from "@/lib/types";

export function OrdersView() {
  const { customer, customerReady } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer) return;
    fetch("/api/orders", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as { orders?: Order[]; error?: string };
        if (!response.ok) {
          setError(data.error || "Could not load orders");
          return;
        }
        setOrders(data.orders ?? []);
      })
      .catch(() => setError("Could not load orders"));
  }, [customer]);

  if (!customerReady) return <p className="py-24 text-center text-sm text-gray-400">Loading orders...</p>;

  if (!customer) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold text-gray-900">My orders</h1>
        <p className="mt-2 text-sm text-gray-500">Sign in to see orders placed from your account.</p>
        <Link href="/login?next=/my-orders" className="mt-6 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white">Login</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-gray-900">My orders</h1>
      <p className="mt-1 text-sm text-gray-500">{customer.name} · {customer.phone}</p>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-6 space-y-3">
        {orders.length === 0 && !error ? (
          <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-gray-400">No orders yet.</p>
        ) : null}
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{order.id}</p>
                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()} · {order.priceMode} · {order.areaName}</p>
              </div>
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-brand">{statusLabel(order.status)}</span>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-gray-600">
              {order.items.map((item) => (
                <li key={`${order.id}-${item.productId}`}>{item.name} × {item.qty}</li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-900">{pkr(order.total)}</p>
              <Link href={`/orders/${order.id}`} className="text-sm font-semibold text-brand">Receipt</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
