import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const ADMIN_COOKIE = "kt_admin";
export const CUSTOMER_COOKIE = "kt_customer";

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || "khawaja123";
}

export function expectedToken() {
  return crypto.createHash("sha256").update(`khawaja-traders:${adminPassword()}`).digest("hex");
}

export async function adminOk() {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === expectedToken();
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function customerToken(id: string) {
  const signature = crypto.createHmac("sha256", adminPassword()).update(id).digest("hex");
  return `${id}.${signature}`;
}

export function customerIdFromToken(token: string | undefined) {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const id = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = crypto.createHmac("sha256", adminPassword()).update(id).digest("hex");
  if (!safeEqual(signature, expected)) return null;
  return id;
}

export async function currentCustomerId() {
  const jar = await cookies();
  return customerIdFromToken(jar.get(CUSTOMER_COOKIE)?.value);
}

export function setCustomerCookie(response: NextResponse, id: string) {
  response.cookies.set(CUSTOMER_COOKIE, customerToken(id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearCustomerCookie(response: NextResponse) {
  response.cookies.set(CUSTOMER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
