import crypto from "crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "admin_session";
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 hari

function secret() {
  return process.env.ADMIN_SECRET || "portofolio-admin-secret-change-me";
}

function password() {
  return process.env.ADMIN_PASSWORD || "admin123";
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyPassword(input: string) {
  return safeEqual(input, password());
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

function parseToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [expStr, nonce, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp)) return null;
  return { exp, payload: `${expStr}.${nonce}`, sig };
}

export function createSessionToken() {
  const exp = Date.now() + SESSION_TTL;
  const payload = `${exp}.${crypto.randomBytes(16).toString("hex")}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string) {
  const parsed = parseToken(token);
  if (!parsed) return false;
  if (parsed.exp < Date.now()) return false;
  return safeEqual(parsed.sig, sign(parsed.payload));
}

export function isAdminRequest() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}