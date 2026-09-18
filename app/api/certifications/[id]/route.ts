import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { deletePdf, persistCertifications, readCertifications, savePdf } from "@/lib/certStorage";

export const dynamic = "force-dynamic";

function str(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value;
}

async function getParams(req: Request) {
  const form = await req.formData();
  const patch: Record<string, string> = {};
  for (const key of ["title", "issuer", "year", "number"] as const) {
    const val = str(form.get(key));
    if (val) patch[key] = val;
  }
  const href = str(form.get("href"));
  if (href) patch.href = href;
  return { patch, href, file: form.get("file") };
}

async function handle(req: Request, id: string, method: "PATCH" | "DELETE") {
  if (!isAdminRequest()) {
    return NextResponse.json({ ok: false, error: "Tidak diizinkan." }, { status: 401 });
  }

  const list = readCertifications();
  const item = list.find((c) => c.number === id);
  if (!item) {
    return NextResponse.json({ ok: false, error: "Sertifikat tidak ditemukan." }, { status: 404 });
  }

  if (method === "DELETE") {
    const next = list.filter((c) => c.number !== id);
    persistCertifications(next);
    deletePdf(item.href);
    return NextResponse.json({ ok: true });
  }

  try {
    const { patch, href, file } = await getParams(req);

    if (isFile(file) && file.size > 0) {
      try {
        patch.href = await savePdf(file);
        if (href) patch.href = href;
      } catch (err) {
        return NextResponse.json(
          { ok: false, error: err instanceof Error ? err.message : "Gagal menyimpan PDF." },
          { status: 400 }
        );
      }
    } else if (href) {
      patch.href = href;
    }

    if (patch.number && patch.number !== id) {
      if (list.some((c) => c.number === patch.number)) {
        return NextResponse.json({ ok: false, error: "Nomor sudah digunakan." }, { status: 400 });
      }
    }

    const sameFile = !patch.href || patch.href === item.href;
    const merged = { ...item, ...patch };
    const next = list.map((c) => (c.number === id ? merged : c));
    persistCertifications(next);
    if (!sameFile) deletePdf(item.href);
    return NextResponse.json({ ok: true, item: merged });
  } catch {
    return NextResponse.json({ ok: false, error: "Request tidak valid." }, { status: 400 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return handle(req, params.id, "PATCH");
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handle(req, params.id, "DELETE");
}