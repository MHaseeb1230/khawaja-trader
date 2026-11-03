"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine, Category, PriceMode, Product, PublicCustomer, Settings } from "@/lib/types";
import { canUseWholesale, priceOf } from "@/lib/format";

const CART_KEY = "kt-cart";
const MODE_KEY = "kt-price-mode";

const fallbackSettings: Settings = {
  storeName: "Khawaja Traders",
  tagline: "General Store & Cosmetics",
  city: "Rawalpindi / Islamabad",
  address: "Rawalpindi / Islamabad, Pakistan",
  whatsapp: "",
  phoneDisplay: "WhatsApp number coming soon",
};

type CatalogResponse = {
  settings: Settings;
  categories: Category[];
  products: Product[];
};

type StoreValue = {
  loading: boolean;
  error: string;
  products: Product[];
  categories: Category[];
  settings: Settings;
  cart: CartLine[];
  priceMode: PriceMode;
  cartOpen: boolean;
  notice: string;
  customer: PublicCustomer | null;
  customerReady: boolean;
  wholesaleUnlocked: boolean;
  setPriceMode: (mode: PriceMode) => void;
  setCartOpen: (open: boolean) => void;
  addToCart: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  refresh: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
  logout: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
  lines: Array<{
    product: Product;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  categoryName: (id: string) => string;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings>(fallbackSettings);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [priceMode, setPriceModeState] = useState<PriceMode>("retail");
  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  const [customer, setCustomer] = useState<PublicCustomer | null>(null);
  const [customerReady, setCustomerReady] = useState(false);
  const wholesaleUnlocked = canUseWholesale(customer);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/products", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load the catalog");
    const data = (await response.json()) as CatalogResponse;
    setProducts(data.products);
    setCategories(data.categories);
    setSettings(data.settings);
  }, []);

  const refreshCustomer = useCallback(async () => {
    const response = await fetch("/api/auth/login", { cache: "no-store" });
    const data = (await response.json()) as { customer: PublicCustomer | null };
    setCustomer(data.customer);
    setCustomerReady(true);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    setCustomer(null);
    setPriceModeState("retail");
  }, []);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      const savedMode = localStorage.getItem(MODE_KEY);
      if (savedCart) setCart(JSON.parse(savedCart) as CartLine[]);
      if (savedMode === "wholesale" || savedMode === "retail") setPriceModeState(savedMode);
    } catch {
      /* ignore broken local storage */
    }
    setReady(true);
    refresh()
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load the catalog"))
      .finally(() => setLoading(false));
    refreshCustomer().catch(() => setCustomerReady(true));
  }, [refresh, refreshCustomer]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(MODE_KEY, priceMode);
  }, [priceMode, ready]);

  useEffect(() => {
    if (!customerReady) return;
    if (priceMode === "wholesale" && !wholesaleUnlocked) setPriceModeState("retail");
  }, [customerReady, priceMode, wholesaleUnlocked]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const setPriceMode = useCallback((mode: PriceMode) => {
    if (mode === "wholesale" && !wholesaleUnlocked) {
      setNotice(
        customer?.accountType === "wholesale"
          ? "Wholesale is waiting for approval. You can order at retail prices for now."
          : "Wholesale prices open after a shopkeeper account is approved.",
      );
      setPriceModeState("retail");
      return;
    }
    setPriceModeState(mode);
  }, [customer, wholesaleUnlocked]);

  const addToCart = useCallback((productId: string, qty = 1) => {
    const product = products.find((item) => item.id === productId);
    if (!product || product.stock <= 0) {
      setNotice("Out of stock");
      return;
    }
    let nextQty = qty;
    if (priceMode === "wholesale" && nextQty < product.minimumWholesaleQuantity) {
      nextQty = product.minimumWholesaleQuantity;
      setNotice(`Wholesale minimum is ${product.minimumWholesaleQuantity}. Added that many.`);
    } else {
      setNotice("Added to cart");
    }
    setCart((current) => {
      const existing = current.find((line) => line.productId === productId);
      const combined = (existing?.qty ?? 0) + nextQty;
      const capped = Math.min(combined, product.stock);
      if (existing) return current.map((line) => (line.productId === productId ? { ...line, qty: capped } : line));
      return [...current, { productId, qty: capped }];
    });
  }, [priceMode, products]);

  const setQty = useCallback((productId: string, qty: number) => {
    const product = products.find((item) => item.id === productId);
    if (qty <= 0) {
      setCart((current) => current.filter((line) => line.productId !== productId));
      return;
    }
    let next = qty;
    if (product && priceMode === "wholesale" && next < product.minimumWholesaleQuantity) {
      next = product.minimumWholesaleQuantity;
      setNotice(`Wholesale minimum is ${product.minimumWholesaleQuantity}`);
    }
    if (product && next > product.stock) {
      next = product.stock;
      setNotice(`Only ${product.stock} in stock`);
    }
    setCart((current) => current.map((line) => (line.productId === productId ? { ...line, qty: next } : line)));
  }, [priceMode, products]);

  const clearCart = useCallback(() => setCart([]), []);

  const lines = useMemo(() => {
    return cart.flatMap((line) => {
      const product = products.find((item) => item.id === line.productId);
      if (!product) return [];
      const unitPrice = priceOf(product, priceMode);
      return [{ product, qty: line.qty, unitPrice, lineTotal: unitPrice * line.qty }];
    });
  }, [cart, products, priceMode]);

  const cartCount = lines.reduce((sum, line) => sum + line.qty, 0);
  const cartTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  const categoryName = useCallback(
    (id: string) => categories.find((category) => category.id === id)?.name ?? "",
    [categories],
  );

  const value: StoreValue = {
    loading,
    error,
    products,
    categories,
    settings,
    cart,
    priceMode,
    cartOpen,
    notice,
    customer,
    customerReady,
    wholesaleUnlocked,
    setPriceMode,
    setCartOpen,
    addToCart,
    setQty,
    clearCart,
    refresh,
    refreshCustomer,
    logout,
    cartCount,
    cartTotal,
    lines,
    categoryName,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
      {notice ? (
        <div className="fixed bottom-20 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg md:bottom-6">
          {notice}
        </div>
      ) : null}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}
