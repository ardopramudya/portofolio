import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import {
  nextCertNumber,
  persistCertifications,
  readCertifications,
  savePdf,
} from "@/lib/certStorage";

export const dynamic = "force-dynamic";

function str(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value;
}

export async function GET() {
  return NextResponse.json(readCertifications());
}

export async function POST(req: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ ok: false, error: "Tidak diizinkan." }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const title = str(form.get("title"));
    const issuer = str(form.get("issuer"));
    const year = str(form.get("year"));
    const file = form.get("file");

    if (!title || !issuer || !year) {
      return NextResponse.json(
        { ok: false, error: "Judul, penerbit, dan tahun wajib diisi." },
        { status: 400 }
      );
    }

    const list = readCertifications();
    let href = str(form.get("href"));
    if (isFile(file) && file.size > 0) {
      try {
        href = await savePdf(file);
      } catch (err) {
        return NextResponse.json(
          { ok: false, error: err instanceof Error ? err.message : "Gagal menyimpan PDF." },
          { status: 400 }
        );
      }
    }

    if (!href) {
      return NextResponse.json(
        { ok: false, error: "Unggah file PDF atau isi kolom tautan." },
        { status: 400 }
      );
    }

    const item = {
      number: str(form.get("number")) || nextCertNumber(list),
      title,
      issuer,
      year,
      ...(href ? { href } : {}),
    };
    const next = [...list, item];
    persistCertifications(next);
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, error: "Request tidak valid." }, { status: 400 });
  }
}