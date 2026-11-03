"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/components/store";
import { pkr, whatsappLink } from "@/lib/format";

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M7 18a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 18zm10 0a2 2 0 1 0 .001 4.001A2 2 0 0 0 17 18zM1 2h2l3.6 7.59-1.35 2.45A2 2 0 0 0 7 15h12v-2H7.42l.9-1.63h7.45a2 2 0 0 0 1.75-1.03l3.58-6.49A1 1 0 0 0 20.2 2H5.21L4.27 0H1v2z" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5L14 3.5zM8 12h8v2H8v-2zm0 4h8v2H8v-2z" />
    </svg>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings, cartCount, cartOpen, setCartOpen, lines, cartTotal, setQty, priceMode, customer, logout } = useStore();
  const hideChrome = pathname.startsWith("/admin");
  const hello = whatsappLink(
    settings.whatsapp,
    `Assalam o Alaikum, ${settings.storeName}. I want to place an order.`,
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {hideChrome ? null : (
        <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
          <div className="bg-amber-500 px-4 py-1.5 text-center text-white">
            <p className="text-xs font-medium tracking-wide">
              Sign in to order. Cash on delivery in {settings.city}. Wholesale prices open after approval.
            </p>
          </div>
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
                KT
              </div>
              <div className="leading-tight">
                <p className="font-heading text-sm font-bold text-gray-900">{settings.storeName}</p>
                <p className="hidden text-[10px] text-gray-400 sm:block">{settings.tagline}</p>
              </div>
            </Link>
            <nav className="hidden flex-1 items-center gap-1 md:flex">
              <NavLink href="/" active={pathname === "/"} icon={<ProductsIcon />} label="All Products" />
              <NavLink href="/my-orders" active={pathname.startsWith("/my-orders")} icon={<OrdersIcon />} label="My Orders" />
            </nav>
            <div className="ml-auto flex items-center gap-2">
              {customer ? (
                <button type="button" onClick={() => void logout()} className="hidden max-w-28 truncate text-sm font-medium text-gray-600 hover:text-brand sm:block">
                  {customer.name.split(" ")[0]}
                </button>
              ) : (
                <Link href="/login" className="text-sm font-semibold text-brand">Login</Link>
              )}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-brand/40 hover:bg-brand/5 hover:text-brand"
              >
                <CartIcon />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={hideChrome ? "flex-1" : "flex-1 pb-16 sm:pb-0"}>{children}</main>

      {hideChrome ? null : (
        <>
          <footer className="bg-gray-900 text-gray-300">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-24 pt-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:pb-14">
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
                    KT
                  </div>
                  <div>
                    <p className="font-heading font-bold text-white">{settings.storeName}</p>
                    <p className="text-xs text-gray-500">{settings.tagline}</p>
                  </div>
                </div>
                <p className="mb-6 max-w-xs text-sm leading-relaxed text-gray-400">
                  General store and cosmetics in {settings.city}. Shop retail or wholesale, then order on WhatsApp or from the cart.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>📞 {settings.phoneDisplay}</p>
                  <p>📍 {settings.address}</p>
                </div>
              </div>
              <div>
                <h2 className="mb-5 text-sm font-bold text-white">Quick links</h2>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><Link className="hover:text-white" href="/">Browse catalog</Link></li>
                  <li><Link className="hover:text-white" href="/cart">Shopping cart</Link></li>
                  <li><Link className="hover:text-white" href="/my-orders">My orders</Link></li>
                  <li><Link className="hover:text-white" href="/about">About</Link></li>
                  <li><Link className="hover:text-white" href="/contact">Contact</Link></li>
                  <li><Link className="hover:text-white" href="/admin">Admin</Link></li>
                </ul>
              </div>
              <div>
                <h2 className="mb-5 text-sm font-bold text-white">Categories</h2>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><Link className="hover:text-white" href="/?category=cosmetics">Cosmetics</Link></li>
                  <li><Link className="hover:text-white" href="/?category=soaps">Soaps</Link></li>
                  <li><Link className="hover:text-white" href="/?category=oral-care">Oral care</Link></li>
                  <li><Link className="hover:text-white" href="/?category=general-items">General items</Link></li>
                  <li><Link className="hover:text-white" href="/?category=chocolates">Chocolates</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800">
              <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-gray-500 sm:flex-row sm:px-6">
                <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
                <div className="flex gap-3">
                  <Link href="/privacy" className="hover:text-white">Privacy</Link>
                  <Link href="/terms" className="hover:text-white">Terms</Link>
                </div>
                <Link href="/admin" className="rounded-lg border border-gray-700 px-2.5 py-1.5 hover:border-gray-500 hover:text-white">
                  Admin portal
                </Link>
              </div>
            </div>
          </footer>

          <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white sm:hidden">
            <div className="grid h-16 grid-cols-3">
              <MobileLink href="/" active={pathname === "/"} icon={<ProductsIcon />} label="Products" />
              <MobileLink href="/cart" active={pathname.startsWith("/cart")} icon={<CartIcon />} label="Cart" badge={cartCount} />
              <MobileLink href="/my-orders" active={pathname.startsWith("/my-orders")} icon={<OrdersIcon />} label="My Orders" />
            </div>
          </nav>

          {hello ? (
            <a
              href={hello}
              target="_blank"
              rel="noreferrer"
              className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg sm:bottom-6"
              aria-label="WhatsApp"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                <path d="M20.5 3.5A11 11 0 0 0 2.1 16.8L1 23l6.4-1.1A11 11 0 0 0 20.5 3.5zM12 20.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.8.6.6-3.7-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.3a.5.5 0 0 0 0-.5c0-.1-.5-1.3-.7-1.7s-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.2 3.7 14 14 0 0 0 1.4.5 3.4 3.4 0 0 0 1.6.1 2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.2-.2-.4-.3z" />
              </svg>
            </a>
          ) : null}
        </>
      )}

      {cartOpen ? (
        <div className="fixed inset-0 z-[60]">
          <button className="absolute inset-0 bg-black/40" aria-label="Close cart" onClick={() => setCartOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Your cart</h2>
                <p className="text-xs text-gray-400">{priceMode === "wholesale" ? "Wholesale prices" : "Retail prices"}</p>
              </div>
              <button className="rounded-xl p-2 text-gray-400 hover:bg-gray-100" onClick={() => setCartOpen(false)} aria-label="Close cart">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">
              {lines.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-300">
                    <CartIcon />
                  </div>
                  <p className="font-semibold text-gray-900">Your cart is empty</p>
                  <p className="mt-1 text-sm text-gray-400">Add products from the catalog to get started.</p>
                  <Link href="/" onClick={() => setCartOpen(false)} className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
                    Browse products
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {lines.map((line) => (
                    <li key={line.product.id} className="flex items-center gap-3 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{line.product.name}</p>
                        <p className="text-xs text-gray-400">{pkr(line.unitPrice)} · {line.product.unitLabel}</p>
                      </div>
                      <div className="flex items-center rounded-lg border border-gray-200">
                        <button className="px-2 py-1 text-gray-500" onClick={() => setQty(line.product.id, line.qty - 1)} aria-label="Decrease">−</button>
                        <span className="w-6 text-center text-sm">{line.qty}</span>
                        <button className="px-2 py-1 text-gray-500" onClick={() => setQty(line.product.id, line.qty + 1)} aria-label="Increase">+</button>
                      </div>
                      <p className="w-16 text-right text-sm font-semibold">{pkr(line.lineTotal)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {lines.length > 0 ? (
              <div className="border-t border-gray-100 px-5 py-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-gray-900">{pkr(cartTotal)}</span>
                </div>
                <Link href="/checkout" onClick={() => setCartOpen(false)} className="block rounded-xl bg-brand py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark">
                  Checkout
                </Link>
                <Link href="/cart" onClick={() => setCartOpen(false)} className="mt-2 block py-2 text-center text-sm font-medium text-gray-500 hover:text-brand">
                  View cart
                </Link>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function NavLink({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-brand/10 text-brand" : "text-gray-600 hover:bg-brand/5 hover:text-brand"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileLink({
  href,
  active,
  icon,
  label,
  badge = 0,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <Link href={href} className={`relative flex flex-col items-center justify-center gap-0.5 ${active ? "text-brand" : "text-gray-400"}`}>
      <span className="relative">
        {icon}
        {badge > 0 ? (
          <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </span>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </Link>
  );
}
