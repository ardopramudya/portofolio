import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/serverAuth";
import { isSection, SECTIONS } from "@/lib/sections";
import { createItem, readItems } from "@/lib/repo";

export const dynamic = "force-dynamic";

function str(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value;
}

export async function GET(_req: Request, { params }: { params: { section: string } }) {
  if (!isSection(params.section)) {
    return NextResponse.json({ ok: false, error: "Section tidak dikenal." }, { status: 404 });
  }
  try {
    return NextResponse.json(await readItems(params.section));
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Gagal memuat data." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: { params: { section: string } }) {
  const section = params.section;
  if (!isSection(section)) {
    return NextResponse.json({ ok: false, error: "Section tidak dikenal." }, { status: 404 });
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Tidak diizinkan." }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const fields: Record<string, string> = {};
    for (const f of SECTIONS[section].fields) {
      const v = str(form.get(f.key));
      if (v) fields[f.key] = v;
    }

    const required = SECTIONS[section].fields.filter((f) => f.key !== "number");
    const missing = required.find((f) => !fields[f.key]);
    if (missing) {
      return NextResponse.json(
        { ok: false, error: `Kolom "${missing.label}" wajib diisi.` },
        { status: 400 }
      );
    }

    const file = form.get("file");
    const item = await createItem(section, {
      fields,
      file: isFile(file) && file.size > 0 ? file : null,
      docLabel: str(form.get("docLabel")),
      manualHref: str(form.get("manualHref")),
    });

    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Request tidak valid." },
      { status: 400 }
    );
  }
}