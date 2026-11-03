import { NextResponse } from "next/server";
import { connection } from "next/server";
import { adminOk } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";
import { slugify } from "@/lib/format";
import type { Product } from "@/lib/types";

export async function GET() {
  await connection();
  const db = await readDb();
  return NextResponse.json({
    settings: db.settings,
    categories: db.categories,
    products: db.products,
  });
}

export async function POST(request: Request) {
  await connection();
  if (!(await adminOk())) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const body = (await request.json()) as Partial<Product>;
  const name = body.name?.trim() ?? "";
  if (!name || !body.categoryId) {
    return NextResponse.json({ error: "Name and category are required" }, { status: 400 });
  }
  const stock = Math.max(0, Number(body.stock) || 0);
  const product: Product = {
    id: crypto.randomUUID(),
    categoryId: body.categoryId,
    name,
    slug: slugify(name),
    description: body.description?.trim() ?? "",
    retailPrice: Number(body.retailPrice) || 0,
    wholesalePrice: Number(body.wholesalePrice) || 0,
    unitLabel: body.unitLabel?.trim() || "per piece",
    stock,
    minimumWholesaleQuantity: Math.max(1, Number(body.minimumWholesaleQuantity) || 1),
    inStock: stock > 0,
    imageUrl: body.imageUrl?.trim() ?? "",
  };
  await updateDb((db) => {
    db.products.unshift(product);
  });
  return NextResponse.json({ product });
}
