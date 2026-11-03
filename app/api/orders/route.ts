import { NextResponse } from "next/server";
import { connection } from "next/server";
import { adminOk, currentCustomerId } from "@/lib/auth";
import { findArea } from "@/lib/delivery";
import { updateDb } from "@/lib/db";
import { priceOf } from "@/lib/format";
import type { Order, PriceMode } from "@/lib/types";

type IncomingItem = { productId?: string; qty?: number };

export async function GET(request: Request) {
  await connection();
  const isAdmin = await adminOk();
  const customerId = await currentCustomerId();
  const scope = new URL(request.url).searchParams.get("scope");
  if (scope === "admin") {
    if (!isAdmin) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  } else if (!customerId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const orders = await updateDb((db) => {
    const list = [...db.orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    if (scope === "admin") return list;
    return list.filter((order) => order.customerId === customerId);
  });
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  await connection();
  const customerId = await currentCustomerId();
  if (!customerId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = (await request.json()) as {
    address?: string;
    city?: string;
    areaId?: string;
    note?: string;
    priceMode?: PriceMode;
    items?: IncomingItem[];
  };
  const address = body.address?.trim() ?? "";
  const city = body.city === "Islamabad" ? "Islamabad" : body.city === "Rawalpindi" ? "Rawalpindi" : "";
  const area = findArea(body.areaId ?? "");
  const items = Array.isArray(body.items) ? body.items : [];
  const mode: PriceMode = body.priceMode === "wholesale" ? "wholesale" : "retail";
  if (!address || !city || !area || area.city !== city || items.length === 0) {
    return NextResponse.json({ error: "Address, city, delivery area, and items are required" }, { status: 400 });
  }

  const result = await updateDb((db) => {
    const customer = db.customers.find((item) => item.id === customerId);
    if (!customer) return { error: "Sign in required", status: 401 as const };
    const wholesaleOk = customer.accountType === "wholesale" && customer.status === "active";
    if (mode === "wholesale" && !wholesaleOk) {
      return { error: "Wholesale prices need an approved shopkeeper account", status: 403 as const };
    }
    const orderItems = [];
    for (const raw of items) {
      const product = db.products.find((item) => item.id === raw.productId);
      const qty = Math.max(1, Number(raw.qty) || 1);
      if (!product) return { error: "A product in the cart is no longer available", status: 400 as const };
      if (product.stock < qty) {
        return { error: `${product.name} only has ${product.stock} left`, status: 400 as const };
      }
      if (mode === "wholesale" && qty < product.minimumWholesaleQuantity) {
        return { error: `${product.name} wholesale minimum is ${product.minimumWholesaleQuantity}`, status: 400 as const };
      }
      orderItems.push({
        productId: product.id,
        name: product.name,
        qty,
        unitPrice: priceOf(product, mode),
        unitLabel: product.unitLabel,
      });
    }
    for (const item of orderItems) {
      const product = db.products.find((entry) => entry.id === item.productId);
      if (!product) continue;
      product.stock -= item.qty;
      product.inStock = product.stock > 0;
    }
    const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
    const order: Order = {
      id: `KT-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      address,
      city,
      areaId: area.id,
      areaName: area.name,
      note: body.note?.trim() ?? "",
      priceMode: mode,
      paymentMethod: "cod",
      items: orderItems,
      subtotal,
      deliveryCharge: area.charge,
      total: subtotal + area.charge,
      status: "new",
    };
    customer.address = address;
    customer.city = city;
    db.orders.unshift(order);
    return { order };
  });

  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ order: result.order });
}
