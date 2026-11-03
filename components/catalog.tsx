"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/components/store";
import { orderMessage, pkr, priceOf, whatsappLink } from "@/lib/format";

const tones: Record<string, string> = {
  cosmetics: "from-rose-50 to-orange-50",
  chocolates: "from-amber-50 to-orange-100",
  soaps: "from-sky-50 to-teal-50",
  "oral-care": "from-cyan-50 to-emerald-50",
  "tobacco-smoking": "from-stone-100 to-amber-50",
  "pest-control": "from-lime-50 to-emerald-50",
  "blades-razor": "from-slate-100 to-zinc-50",
  "condoms-supply": "from-violet-50 to-fuchsia-50",
  "general-items": "from-gray-100 to-slate-50",
  "pan-supari": "from-green-50 to-lime-50",
};

export function Catalog() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get("category") ?? "";
  const { products, categories, settings, loading, error, priceMode, setPriceMode, addToCart } = useStore();
  const [query, setQuery] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const categoryOk = !category || categories.find((item) => item.id === product.categoryId)?.slug === category;
      const text = `${product.name} ${product.description}`.toLowerCase();
      return categoryOk && (!needle || text.includes(needle));
    });
  }, [products, category, categories, query]);

  const activeCategory = categories.find((item) => item.slug === category);

  function selectCategory(slug: string) {
    router.push(slug ? `/?category=${slug}` : "/");
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
      <aside className="sticky top-28 hidden h-fit w-56 shrink-0 lg:block">
        <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] text-gray-400">CATEGORIES</p>
        <button
          type="button"
          onClick={() => selectCategory("")}
          className={`mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${
            !category ? "bg-teal-50 text-brand" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span className="text-base">▦</span>
          All Products
        </button>
        <ul>
          {categories.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => selectCategory(item.slug)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${
                  category === item.slug ? "bg-teal-50 font-semibold text-brand" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-gray-300">•</span>
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="min-w-0 flex-1">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-900">{activeCategory?.name ?? "All Products"}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {loading ? "Loading catalog..." : `${visible.length} products`} · prices in PKR
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
              <ModeButton active={priceMode === "retail"} onClick={() => setPriceMode("retail")} label="Retail" />
              <ModeButton active={priceMode === "wholesale"} onClick={() => setPriceMode("wholesale")} label="Wholesale" />
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand sm:w-64"
            />
          </div>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          <Chip active={!category} onClick={() => selectCategory("")} label="All" />
          {categories.map((item) => (
            <Chip key={item.id} active={category === item.slug} onClick={() => selectCategory(item.slug)} label={item.name} />
          ))}
        </div>

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        {!loading && visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <p className="font-semibold text-gray-900">No products in this view</p>
            <p className="mt-1 text-sm text-gray-400">Try another category or clear the search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((product) => {
              const categoryInfo = categories.find((item) => item.id === product.categoryId);
              const count = qty[product.id] ?? 1;
              const activePrice = priceOf(product, priceMode);
              const message = orderMessage({
                storeName: settings.storeName,
                priceMode,
                items: [{ productId: product.id, name: product.name, qty: count, unitPrice: activePrice, unitLabel: product.unitLabel }],
                total: activePrice * count,
              });
              const wa = whatsappLink(settings.whatsapp, message);
              return (
                <article key={product.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <Link href={`/product/${product.id}`} className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${tones[product.categoryId] ?? "from-teal-50 to-gray-50"}`}>
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-4xl" aria-hidden="true">{categoryInfo?.emoji ?? "🛍️"}</span>
                    )}
                    {!product.inStock ? (
                      <span className="absolute left-2 top-2 rounded-full bg-gray-900/80 px-2 py-0.5 text-[10px] font-semibold text-white">Out of stock</span>
                    ) : null}
                  </Link>
                  <div className="flex flex-1 flex-col p-3">
                    <p className="text-[11px] font-medium text-brand">{categoryInfo?.name}</p>
                    <Link href={`/product/${product.id}`} className="mt-0.5 text-sm font-semibold leading-snug text-gray-900 hover:text-brand">{product.name}</Link>
                    <p className="mt-1 text-xs text-gray-400">{product.unitLabel}</p>
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      <PriceBox label="Retail" amount={product.retailPrice} active={priceMode === "retail"} />
                      <PriceBox label="Wholesale" amount={product.wholesalePrice} active={priceMode === "wholesale"} />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-gray-200">
                        <button type="button" className="px-2 py-1 text-gray-500" onClick={() => setQty((current) => ({ ...current, [product.id]: Math.max(1, count - 1) }))}>−</button>
                        <span className="w-5 text-center text-xs">{count}</span>
                        <button type="button" className="px-2 py-1 text-gray-500" onClick={() => setQty((current) => ({ ...current, [product.id]: count + 1 }))}>+</button>
                      </div>
                      <button
                        type="button"
                        disabled={!product.inStock}
                        onClick={() => addToCart(product.id, count)}
                        className="flex-1 rounded-xl bg-brand py-2 text-xs font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                      >
                        Add
                      </button>
                      {wa ? (
                        <a href={wa} target="_blank" rel="noreferrer" className="rounded-xl border border-[#25D366] px-2 py-2 text-[11px] font-bold text-[#128C7E]" aria-label="Order on WhatsApp">
                          WA
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ModeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${active ? "bg-brand text-white" : "text-gray-500"}`}
    >
      {label}
    </button>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${active ? "bg-brand text-white" : "bg-white text-gray-600 ring-1 ring-gray-200"}`}
    >
      {label}
    </button>
  );
}

function PriceBox({ label, amount, active }: { label: string; amount: number; active: boolean }) {
  return (
    <div className={`rounded-lg px-2 py-1.5 ${active ? "bg-teal-50 ring-1 ring-brand" : "bg-gray-50"}`}>
      <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`text-sm font-bold ${active ? "text-brand" : "text-gray-800"}`}>{pkr(amount)}</p>
    </div>
  );
}
