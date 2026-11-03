import { NextResponse } from "next/server";
import { connection } from "next/server";
import { adminOk } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { toPublicCustomer } from "@/lib/format";

export async function GET() {
  await connection();
  if (!(await adminOk())) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const db = await readDb();
  return NextResponse.json({ customers: db.customers.map(toPublicCustomer) });
}
