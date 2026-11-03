import { NextResponse } from "next/server";
import { connection } from "next/server";
import { clearCustomerCookie, currentCustomerId, setCustomerCookie } from "@/lib/auth";
import { updateDb } from "@/lib/db";
import { phoneKey, toPublicCustomer } from "@/lib/format";
import { passwordsMatch } from "@/lib/passwords";

export async function GET() {
  await connection();
  const id = await currentCustomerId();
  if (!id) return NextResponse.json({ customer: null });
  const customer = await updateDb((db) => db.customers.find((item) => item.id === id) ?? null);
  return NextResponse.json({ customer: customer ? toPublicCustomer(customer) : null });
}

export async function POST(request: Request) {
  await connection();
  const body = (await request.json()) as { phone?: string; password?: string };
  const key = phoneKey(body.phone ?? "");
  const password = body.password ?? "";
  if (key.length < 10 || !password) {
    return NextResponse.json({ error: "Phone and password are required" }, { status: 400 });
  }
  const customer = await updateDb((db) => db.customers.find((item) => phoneKey(item.phone) === key) ?? null);
  if (!customer || !passwordsMatch(password, customer.salt, customer.passwordHash)) {
    return NextResponse.json({ error: "Wrong phone or password" }, { status: 401 });
  }
  const response = NextResponse.json({ customer: toPublicCustomer(customer) });
  setCustomerCookie(response, customer.id);
  return response;
}

export async function DELETE() {
  await connection();
  const response = NextResponse.json({ ok: true });
  clearCustomerCookie(response);
  return response;
}
