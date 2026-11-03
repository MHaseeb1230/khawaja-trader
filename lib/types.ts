export type PriceMode = "retail" | "wholesale";

export type Category = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  retailPrice: number;
  wholesalePrice: number;
  unitLabel: string;
  stock: number;
  minimumWholesaleQuantity: number;
  inStock: boolean;
  imageUrl: string;
};

export type AccountType = "retail" | "wholesale";
export type AccountStatus = "active" | "pending" | "rejected";

export type PublicCustomer = {
  id: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  shopName: string;
  accountType: AccountType;
  status: AccountStatus;
  createdAt: string;
};

export type Customer = PublicCustomer & {
  salt: string;
  passwordHash: string;
};

export type Settings = {
  storeName: string;
  tagline: string;
  city: string;
  address: string;
  whatsapp: string;
  phoneDisplay: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  unitLabel: string;
};

export type OrderStatus = "new" | "confirmed" | "out_for_delivery" | "delivered" | "cancelled";

export type Order = {
  id: string;
  createdAt: string;
  customerId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  areaId: string;
  areaName: string;
  note: string;
  priceMode: PriceMode;
  paymentMethod: "cod";
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: OrderStatus;
};

export type CartLine = {
  productId: string;
  qty: number;
};

export type Database = {
  settings: Settings;
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
};
