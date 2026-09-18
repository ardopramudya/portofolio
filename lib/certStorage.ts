import fs from "fs";
import path from "path";
import type { Certification } from "@/data/certifications";

const DATA_DIR = path.join(process.cwd(), "data");
const JSON_PATH = path.join(DATA_DIR, "certifications.json");
const TS_PATH = path.join(DATA_DIR, "certifications.ts");
const UPLOAD_DIR = path.join(process.cwd(), "public", "certificates");

export function readCertifications(): Certification[] {
  try {
    const raw = fs.readFileSync(JSON_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Certification[]) : [];
  } catch {
    return [];
  }
}

export function persistCertifications(list: Certification[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(JSON_PATH, JSON.stringify(list, null, 2) + "\n", "utf8");

  const lines = list.map((c) => `  ${JSON.stringify(c)},`).join("\n");
  const ts = `export interface Certification {
  number: string;
  title: string;
  issuer: string;
  year: string;
  href?: string;
}

// File ini digenerate otomatis oleh admin panel. Jangan edit manual.
export const certifications: Certification[] = [
${lines}
];
`;
  fs.writeFileSync(TS_PATH, ts, "utf8");
}

export function nextCertNumber(list: Certification[]) {
  const max = list.reduce((acc, c) => {
    const n = parseInt(c.number, 10);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return String(max + 1).padStart(2, "0");
}

function sanitizeName(name: string) {
  const base = name
    .replace(/\\/g, "-")
    .replace(/[/<>:"|?*\u0000-\u001f]/g, "-")
    .trim()
    .slice(0, 80);
  const ext = base.toLowerCase().endsWith(".pdf") ? ".pdf" : "";
  const stem = ext ? base.slice(0, -4) : base;
  return `${stem || "sertifikat"}${ext}`;
}

export async function savePdf(file: File): Promise<string> {
  if (typeof file.arrayBuffer !== "function") {
    throw new Error("File tidak valid.");
  }
  const name = sanitizeName(file.name);
  if (!name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Hanya file PDF yang diizinkan.");
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("Ukuran file maksimal 20MB.");
  }

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());

  let finalName = name;
  const existing = new Set(fs.existsSync(UPLOAD_DIR) ? fs.readdirSync(UPLOAD_DIR) : []);
  if (existing.has(finalName)) {
    const stem = finalName.slice(0, -4);
    finalName = `${stem}-${Date.now()}${finalName.slice(-4)}`;
  }
  fs.writeFileSync(path.join(UPLOAD_DIR, finalName), buffer);
  return `/certificates/${finalName}`;
}

export function deletePdf(href?: string) {
  if (!href || !href.startsWith("/certificates/")) return;
  const filename = path.basename(decodeURIComponent(href));
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // abaikan jika gagal hapus
  }
}