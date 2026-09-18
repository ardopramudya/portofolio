import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getRouteHandlerSupabase } from "@/lib/supabase/server";
import { COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  if (isSupabaseConfigured()) {
    const supabase = getRouteHandlerSupabase();
    await supabase.auth.signOut();
    return NextResponse.json({ ok: true });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}