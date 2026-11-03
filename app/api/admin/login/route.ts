import { NextResponse } from "next/server";
import { connection } from "next/server";
import { ADMIN_COOKIE, adminOk, adminPassword, expectedToken } from "@/lib/auth";

export async function GET() {
  await connection();
  return NextResponse.json({ ok: await adminOk() });
}

export async function POST(request: Request) {
  await connection();
  const body = (await request.json()) as { password?: string };
  if (body.password !== adminPassword()) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function DELETE() {
  await connection();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
