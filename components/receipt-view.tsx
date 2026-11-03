"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/components/store";
import { pkr, statusLabel } from "@/lib/format";
import type { Order } from "@/lib/types";

export function ReceiptView({ id }: { id: string }) {
  const { settings, customerReady } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customerReady) return;
    fetch(`/api/orders/${id}`, { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as { order?: Order; error?: string };
        if (!response.ok || !data.order) {
          setError(data.error || "Order not found");
          return;
        }
        setOrder(data.order);
      })
      .catch(() => setError("Order not found"));
  }, [customerReady, id]);

  if (!customerReady || (!order && !error)) return <p className="py-24 text-center text-sm text-gray-400">Loading receipt...</p>;
  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-gray-500">{error}</p>
        <Link href="/login?next=/my-orders" className="mt-4 inline-block text-sm font-semibold text-brand">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-heading text-xl font-bold">{settings.storeName}</p>
            <p className="text-xs text-gray-400">{settings.address}</p>
          </div>
          <p className="text-right text-sm">
            <span className="block font-bold">{order.id}</span>
            <span className="text-gray-400">{new Date(order.createdAt).toLocaleString()}</span>
          </p>
        </div>
        <p className="mt-4 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-brand">{statusLabel(order.status)}</p>
        <div className="mt-5 text-sm text-gray-600">
          <p className="font-semibold text-gray-900">{order.customerName}</p>
          <p>{order.phone}</p>
          <p>{order.address}</p>
          <p>{order.areaName}, {order.city}</p>
          <p className="mt-1 capitalize">{order.priceMode} · Cash on delivery</p>
        </div>
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId} className="border-b border-gray-50">
                <td className="py-2">{item.name} × {item.qty}</td>
                <td className="py-2 text-right">{pkr(item.unitPrice * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Items</span><span>{pkr(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>{pkr(order.deliveryCharge)}</span></div>
          <div className="flex justify-between text-base font-bold"><span>Total due</span><span>{pkr(order.total)}</span></div>
        </div>
        {order.note ? <p className="mt-4 text-sm text-gray-500">Note: {order.note}</p> : null}
      </article>
      <button type="button" onClick={() => window.print()} className="no-print mt-4 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white">Print receipt</button>
    </div>
  );
}
