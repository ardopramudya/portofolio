import fs from "fs";
import path from "path";
import { SECTIONS, type Section } from "@/lib/sections";

const INTERFACES: Record<Section, string> = {
  certifications: `export interface Certification {
  number: string;
  title: string;
  issuer: string;
  year: string;
  href?: string;
}`,
  experience: `export interface ExperienceItem {
  number: string;
  year: string;
  company: string;
  location: string;
  role: string;
  description: string;
  certificate?: {
    href: string;
    label: string;
  };
}`,
  achievements: `export interface Achievement {
  number: string;
  title: string;
  event: string;
  year: string;
  tag: string;
  certificate?: {
    href: string;
    label: string;
  };
}`,
};

function jsonPath(section: Section) {
  return path.join(process.cwd(), "data", `${section}.json`);
}

function tsPath(section: Section) {
  return path.join(process.cwd(), "data", `${section}.ts`);
}

export function localFolder(section: Section) {
  return path.join(process.cwd(), "public", SECTIONS[section].folder);
}

export function readLocal(section: Section): Record<string, unknown>[] {
  try {
    const raw = fs.readFileSync(jsonPath(section), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}

export function persistLocal(section: Section, list: Record<string, unknown>[]) {
  fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
  fs.writeFileSync(jsonPath(section), JSON.stringify(list, null, 2) + "\n", "utf8");

  const def = SECTIONS[section];
  const lines = list.map((c) => `  ${JSON.stringify(c)},`).join("\n");
  const ts = `${INTERFACES[section]}

// File ini digenerate otomatis oleh admin panel. Jangan edit manual.
export const ${def.exportName}: ${def.typeName}[] = [
${lines}
];
`;
  fs.writeFileSync(tsPath(section), ts, "utf8");
}

export function nextNumber(section: Section, list: Record<string, unknown>[]) {
  const max = list.reduce((acc, c) => {
    const n = parseInt(String(c.number), 10);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return String(max + 1).padStart(2, "0");
}

export function normalizeName(name: string) {
  const base = name
    .replace(/\\/g, "-")
    .replace(/[/<>:"|?*\u0000-\u001f]/g, "-")
    .trim()
    .slice(0, 80);
  return base || "document";
}

function allowedExt(section: Section, name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return true;
  if (SECTIONS[section].format === "pdf-image") {
    return /\.(png|jpe?g|webp|gif)$/.test(lower);
  }
  return false;
}

export async function saveFileLocal(section: Section, file: File): Promise<string> {
  if (typeof file.arrayBuffer !== "function") throw new Error("File tidak valid.");
  if (!allowedExt(section, file.name)) {
    throw new Error("Format file tidak diizinkan untuk jenis ini.");
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("Ukuran file maksimal 20MB.");
  }

  const folder = localFolder(section);
  fs.mkdirSync(folder, { recursive: true });

  let finalName = normalizeName(file.name);
  const existing = new Set(fs.readdirSync(folder));
  if (existing.has(finalName)) {
    const dot = finalName.lastIndexOf(".");
    const stem = dot > 0 ? finalName.slice(0, dot) : finalName;
    const ext = dot > 0 ? finalName.slice(dot) : "";
    finalName = `${stem}-${Date.now()}${ext}`;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(folder, finalName), buffer);
  return `/${SECTIONS[section].folder}/${finalName}`;
}

export function deleteFileLocal(section: Section, href?: string) {
  if (!href) return;
  const prefix = `/${SECTIONS[section].folder}/`;
  if (!href.startsWith(prefix)) return;
  const filename = path.basename(decodeURIComponent(href));
  if (!filename) return;
  const filePath = path.join(localFolder(section), filename);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // abaikan jika gagal menghapus
  }
}