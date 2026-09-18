import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdminEmail } from "@/lib/supabase/config";
import { getRouteHandlerSupabase } from "@/lib/supabase/server";
import { COOKIE_NAME, createSessionToken, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (isSupabaseConfigured()) {
      const supabase = getRouteHandlerSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return NextResponse.json({ ok: false, error: "Email atau password salah." }, { status: 401 });
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const adminEmail = supabaseAdminEmail();
      if (adminEmail && user?.email !== adminEmail) {
        await supabase.auth.signOut();
        return NextResponse.json(
          { ok: false, error: "Akun ini bukan admin." },
          { status: 403 }
        );
      }
      return NextResponse.json({ ok: true });
    }

    if (!verifyPassword(password)) {
      return NextResponse.json({ ok: false, error: "Password salah." }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, createSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Request tidak valid." }, { status: 400 });
  }
}