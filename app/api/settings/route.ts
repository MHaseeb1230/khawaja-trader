import { NextResponse } from "next/server";
import { connection } from "next/server";
import { adminOk } from "@/lib/auth";
import { updateDb } from "@/lib/db";
import type { Settings } from "@/lib/types";

export async function PUT(request: Request) {
  await connection();
  if (!(await adminOk())) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const body = (await request.json()) as Partial<Settings>;
  const settings = await updateDb((db) => {
    db.settings = {
      ...db.settings,
      storeName: body.storeName?.trim() || db.settings.storeName,
      tagline: body.tagline?.trim() || db.settings.tagline,
      city: body.city?.trim() || db.settings.city,
      address: body.address?.trim() || db.settings.address,
      whatsapp: body.whatsapp?.trim() ?? db.settings.whatsapp,
      phoneDisplay: body.phoneDisplay?.trim() || db.settings.phoneDisplay,
    };
    return db.settings;
  });
  return NextResponse.json({ settings });
}
