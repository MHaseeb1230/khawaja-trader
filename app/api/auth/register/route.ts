import { NextResponse } from "next/server";
import { connection } from "next/server";
import { setCustomerCookie } from "@/lib/auth";
import { updateDb } from "@/lib/db";
import { phoneKey, toPublicCustomer } from "@/lib/format";
import { hashPassword, makeSalt } from "@/lib/passwords";
import type { AccountType, Customer } from "@/lib/types";

export async function POST(request: Request) {
  await connection();
  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    password?: string;
    city?: string;
    address?: string;
    shopName?: string;
    accountType?: AccountType;
  };
  const name = body.name?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const password = body.password ?? "";
  const city = body.city === "Islamabad" ? "Islamabad" : "Rawalpindi";
  const address = body.address?.trim() ?? "";
  const accountType: AccountType = body.accountType === "wholesale" ? "wholesale" : "retail";
  const shopName = body.shopName?.trim() ?? "";
  if (!name || phoneKey(phone).length < 10 || password.length < 6 || !address) {
    return NextResponse.json({ error: "Name, phone, address, and a password of at least 6 characters are required" }, { status: 400 });
  }
  if (accountType === "wholesale" && !shopName) {
    return NextResponse.json({ error: "Shop name is required for a wholesale account" }, { status: 400 });
  }
  const salt = makeSalt();
  const customer: Customer = {
    id: crypto.randomUUID(),
    name,
    phone,
    city,
    address,
    shopName,
    accountType,
    status: accountType === "wholesale" ? "pending" : "active",
    createdAt: new Date().toISOString(),
    salt,
    passwordHash: hashPassword(password, salt),
  };
  const saved = await updateDb((db) => {
    if (db.customers.some((item) => phoneKey(item.phone) === phoneKey(phone))) return null;
    db.customers.unshift(customer);
    return customer;
  });
  if (!saved) return NextResponse.json({ error: "An account with this phone already exists" }, { status: 409 });
  const response = NextResponse.json({ customer: toPublicCustomer(saved) });
  setCustomerCookie(response, saved.id);
  return response;
}
