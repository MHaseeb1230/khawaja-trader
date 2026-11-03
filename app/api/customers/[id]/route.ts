import { NextResponse } from "next/server";
import { connection } from "next/server";
import { adminOk } from "@/lib/auth";
import { updateDb } from "@/lib/db";
import { toPublicCustomer } from "@/lib/format";
import type { AccountStatus } from "@/lib/types";

type Context = { params: Promise<{ id: string }> };

const statuses: AccountStatus[] = ["active", "pending", "rejected"];

export async function PATCH(request: Request, context: Context) {
  await connection();
  if (!(await adminOk())) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json()) as { status?: AccountStatus };
  if (!body.status || !statuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const customer = await updateDb((db) => {
    const found = db.customers.find((item) => item.id === id);
    if (!found) return null;
    found.status = body.status as AccountStatus;
    return found;
  });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json({ customer: toPublicCustomer(customer) });
}
