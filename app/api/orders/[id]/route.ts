import { NextResponse } from "next/server";
import { connection } from "next/server";
import { adminOk, currentCustomerId } from "@/lib/auth";
import { updateDb } from "@/lib/db";
import type { OrderStatus } from "@/lib/types";

type Context = { params: Promise<{ id: string }> };

const statuses: OrderStatus[] = ["new", "confirmed", "out_for_delivery", "delivered", "cancelled"];

export async function GET(_request: Request, context: Context) {
  await connection();
  const { id } = await context.params;
  const isAdmin = await adminOk();
  const customerId = await currentCustomerId();
  if (!isAdmin && !customerId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const order = await updateDb((db) => db.orders.find((item) => item.id === id) ?? null);
  if (!order || (!isAdmin && order.customerId !== customerId)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order });
}

export async function PATCH(request: Request, context: Context) {
  await connection();
  if (!(await adminOk())) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json()) as { status?: OrderStatus };
  if (!body.status || !statuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const order = await updateDb((db) => {
    const found = db.orders.find((item) => item.id === id);
    if (!found) return null;
    const next = body.status as OrderStatus;
    if (found.status !== "cancelled" && next === "cancelled") {
      for (const item of found.items) {
        const product = db.products.find((entry) => entry.id === item.productId);
        if (!product) continue;
        product.stock += item.qty;
        product.inStock = product.stock > 0;
      }
    }
    if (found.status === "cancelled" && next !== "cancelled") {
      for (const item of found.items) {
        const product = db.products.find((entry) => entry.id === item.productId);
        if (!product || product.stock < item.qty) return null;
      }
      for (const item of found.items) {
        const product = db.products.find((entry) => entry.id === item.productId);
        if (!product) continue;
        product.stock -= item.qty;
        product.inStock = product.stock > 0;
      }
    }
    found.status = next;
    return found;
  });
  if (!order) return NextResponse.json({ error: "Could not update this order" }, { status: 400 });
  return NextResponse.json({ order });
}
