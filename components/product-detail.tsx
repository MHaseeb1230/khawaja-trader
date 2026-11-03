"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/components/store";
import { orderMessage, pkr, priceOf, whatsappLink } from "@/lib/format";

export function ProductDetail({ id }: { id: string }) {
  const { products, categories, settings, loading, priceMode, setPriceMode, addToCart, wholesaleUnlocked } = useStore();
  const product = products.find((item) => item.id === id);
  const [qty, setQty] = useState(1);
  const category = categories.find((item) => item.id === product?.categoryId);

  if (loading) return <p className="py-24 text-center text-sm text-gray-400">Loading product...</p>;
  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold">Product not found</h1>
        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-brand">Back to catalog</Link>
      </div>
    );
  }

  const active = priceOf(product, priceMode);
  const wa = whatsappLink(
    settings.whatsapp,
    orderMessage({
      storeName: settings.storeName,
      priceMode,
      items: [{ productId: product.id, name: product.name, qty, unitPrice: active, unitLabel: product.unitLabel }],
      total: active * qty,
    }),
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-2">
      <div className="flex min-h-72 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-50 to-amber-50">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="h-full max-h-[420px] w-full rounded-3xl object-cover" />
        ) : (
          <span className="text-7xl" aria-hidden="true">{category?.emoji ?? "🛍️"}</span>
        )}
      </div>
      <div>
        <Link href={category ? `/?category=${category.slug}` : "/"} className="text-sm font-medium text-brand">{category?.name ?? "Catalog"}</Link>
        <h1 className="mt-2 font-heading text-3xl font-bold text-gray-900">{product.name}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">{product.description || "Available at Khawaja Traders."}</p>
        <p className="mt-2 text-sm text-gray-400">{product.unitLabel} · {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
        {product.minimumWholesaleQuantity > 1 ? (
          <p className="mt-1 text-sm text-gray-400">Wholesale minimum: {product.minimumWholesaleQuantity}</p>
        ) : null}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setPriceMode("retail")} className={`rounded-xl px-3 py-3 text-left ${priceMode === "retail" ? "bg-teal-50 ring-1 ring-brand" : "bg-white ring-1 ring-gray-200"}`}>
            <span className="block text-[11px] uppercase text-gray-400">Retail</span>
            <span className="text-lg font-bold">{pkr(product.retailPrice)}</span>
          </button>
          <button type="button" onClick={() => setPriceMode("wholesale")} className={`rounded-xl px-3 py-3 text-left ${priceMode === "wholesale" ? "bg-teal-50 ring-1 ring-brand" : "bg-white ring-1 ring-gray-200"}`}>
            <span className="block text-[11px] uppercase text-gray-400">Wholesale</span>
            <span className="text-lg font-bold">{pkr(product.wholesalePrice)}</span>
          </button>
        </div>
        {!wholesaleUnlocked ? <p className="mt-2 text-xs text-gray-400">Wholesale ordering needs an approved shopkeeper account.</p> : null}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-gray-200">
            <button type="button" className="px-3 py-2" onClick={() => setQty((current) => Math.max(1, current - 1))}>−</button>
            <span className="w-8 text-center text-sm">{qty}</span>
            <button type="button" className="px-3 py-2" onClick={() => setQty((current) => current + 1)}>+</button>
          </div>
          <button type="button" disabled={!product.inStock} onClick={() => addToCart(product.id, qty)} className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:bg-gray-200">
            Add to cart
          </button>
          {wa ? <a href={wa} target="_blank" rel="noreferrer" className="rounded-xl border border-[#25D366] px-3 py-2.5 text-sm font-bold text-[#128C7E]">WhatsApp</a> : null}
        </div>
      </div>
    </div>
  );
}
