import { NextResponse } from "next/server";
import { connection } from "next/server";
import { adminOk } from "@/lib/auth";
import { updateDb } from "@/lib/db";
import type { Product } from "@/lib/types";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  await connection();
  if (!(await adminOk())) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = (await request.json()) as Partial<Product>;
  const updated = await updateDb((db) => {
    const product = db.products.find((item) => item.id === id);
    if (!product) return null;
    if (body.name !== undefined) product.name = body.name.trim();
    if (body.categoryId !== undefined) product.categoryId = body.categoryId;
    if (body.description !== undefined) product.description = body.description.trim();
    if (body.retailPrice !== undefined) product.retailPrice = Number(body.retailPrice) || 0;
    if (body.wholesalePrice !== undefined) product.wholesalePrice = Number(body.wholesalePrice) || 0;
    if (body.unitLabel !== undefined) product.unitLabel = body.unitLabel.trim() || "per piece";
    if (body.stock !== undefined) product.stock = Math.max(0, Number(body.stock) || 0);
    if (body.minimumWholesaleQuantity !== undefined) {
      product.minimumWholesaleQuantity = Math.max(1, Number(body.minimumWholesaleQuantity) || 1);
    }
    product.inStock = product.stock > 0;
    if (body.imageUrl !== undefined) product.imageUrl = body.imageUrl.trim();
    return product;
  });
  if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product: updated });
}

export async function DELETE(_request: Request, context: Context) {
  await connection();
  if (!(await adminOk())) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const { id } = await context.params;
  const removed = await updateDb((db) => {
    const before = db.products.length;
    db.products = db.products.filter((item) => item.id !== id);
    return before !== db.products.length;
  });
  if (!removed) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
