import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: await isAdminRequest() });
}