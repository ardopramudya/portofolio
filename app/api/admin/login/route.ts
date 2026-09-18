import { NextResponse } from "next/server";
import { COOKIE_NAME, createSessionToken, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = typeof body.password === "string" ? body.password : "";
    if (!verifyPassword(input)) {
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