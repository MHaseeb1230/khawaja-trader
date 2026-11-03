"use client";

import Link from "next/link";
import { useStore } from "@/components/store";
import { pkr } from "@/lib/format";

export function CartView() {
  const { lines, cartTotal, setQty, clearCart, priceMode, setPriceMode } = useStore();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-gray-900">Shopping cart</h1>
      <p className="mt-1 text-sm text-gray-500">Prices follow the mode you choose. Switch anytime before checkout.</p>

      <div className="mt-4 inline-flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
        <button type="button" onClick={() => setPriceMode("retail")} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${priceMode === "retail" ? "bg-brand text-white" : "text-gray-500"}`}>Retail</button>
        <button type="button" onClick={() => setPriceMode("wholesale")} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${priceMode === "wholesale" ? "bg-brand text-white" : "text-gray-500"}`}>Wholesale</button>
      </div>

      {lines.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <p className="font-semibold text-gray-900">Your cart is empty</p>
          <Link href="/" className="mt-4 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white">Browse products</Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <ul className="divide-y divide-gray-100">
            {lines.map((line) => (
              <li key={line.product.id} className="flex items-center gap-3 px-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{line.product.name}</p>
                  <p className="text-xs text-gray-400">{pkr(line.unitPrice)} · {line.product.unitLabel}</p>
                </div>
                <div className="flex items-center rounded-lg border border-gray-200">
                  <button className="px-2.5 py-1" onClick={() => setQty(line.product.id, line.qty - 1)}>−</button>
                  <span className="w-6 text-center text-sm">{line.qty}</span>
                  <button className="px-2.5 py-1" onClick={() => setQty(line.product.id, line.qty + 1)}>+</button>
                </div>
                <p className="w-20 text-right text-sm font-bold">{pkr(line.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={clearCart} className="text-sm text-gray-400 hover:text-red-600">Clear cart</button>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">Total <span className="font-bold text-gray-900">{pkr(cartTotal)}</span></p>
              <Link href="/checkout" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">Checkout</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
