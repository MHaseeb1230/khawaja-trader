import type { Customer, OrderItem, OrderStatus, PriceMode, Product, PublicCustomer } from "./types";

export function pkr(amount: number) {
  return `Rs ${Math.round(amount).toLocaleString("en-PK")}`;
}

export function priceOf(product: Product, mode: PriceMode) {
  return mode === "wholesale" ? product.wholesalePrice : product.retailPrice;
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function phoneKey(value: string) {
  const digits = digitsOnly(value);
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function whatsappNumber(raw: string) {
  const digits = digitsOnly(raw);
  if (!digits) return "";
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  if (digits.length === 10) return `92${digits}`;
  return digits;
}

export function whatsappLink(rawNumber: string, text: string) {
  const number = whatsappNumber(rawNumber);
  if (!number) return "";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function orderMessage(input: {
  storeName: string;
  priceMode: PriceMode;
  items: OrderItem[];
  total: number;
  customerName?: string;
  phone?: string;
  address?: string;
  city?: string;
  note?: string;
}) {
  const lines = [
    `Assalam o Alaikum, ${input.storeName}`,
    "",
    `Order (${input.priceMode === "wholesale" ? "Wholesale" : "Retail"})`,
    ...input.items.map(
      (item, index) =>
        `${index + 1}. ${item.name} x ${item.qty} — ${pkr(item.unitPrice * item.qty)} (${item.unitLabel})`,
    ),
    "",
    `Total: ${pkr(input.total)}`,
  ];
  if (input.customerName) lines.push(`Name: ${input.customerName}`);
  if (input.phone) lines.push(`Phone: ${input.phone}`);
  if (input.city) lines.push(`City: ${input.city}`);
  if (input.address) lines.push(`Address: ${input.address}`);
  if (input.note) lines.push(`Note: ${input.note}`);
  return lines.join("\n");
}

export function toPublicCustomer(customer: Customer): PublicCustomer {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    city: customer.city,
    address: customer.address,
    shopName: customer.shopName,
    accountType: customer.accountType,
    status: customer.status,
    createdAt: customer.createdAt,
  };
}

export function canUseWholesale(customer: PublicCustomer | null) {
  return customer?.accountType === "wholesale" && customer.status === "active";
}

export function statusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    new: "New",
    confirmed: "Confirmed",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status];
}

export function slugify(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "item"}-${Math.random().toString(36).slice(2, 6)}`;
}
