import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/serverAuth";
import { isSection, SECTIONS } from "@/lib/sections";
import { deleteItem, updateItem } from "@/lib/repo";

export const dynamic = "force-dynamic";

function str(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value;
}

async function handle(
  req: Request,
  section: string,
  id: string,
  method: "PATCH" | "DELETE"
) {
  if (!isSection(section)) {
    return NextResponse.json({ ok: false, error: "Section tidak dikenal." }, { status: 404 });
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Tidak diizinkan." }, { status: 401 });
  }

  if (method === "DELETE") {
    try {
      await deleteItem(section, id);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : "Gagal menghapus." },
        { status: 400 }
      );
    }
  }

  try {
    const form = await req.formData();
    const fields: Record<string, string> = {};
    for (const f of SECTIONS[section].fields) {
      const v = str(form.get(f.key));
      if (v) fields[f.key] = v;
    }

    const file = form.get("file");
    const item = await updateItem(section, id, {
      fields,
      file: isFile(file) && file.size > 0 ? file : null,
      docLabel: str(form.get("docLabel")),
      manualHref: str(form.get("manualHref")),
      removeDoc: str(form.get("removeDoc")) === "1",
    });

    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Request tidak valid." },
      { status: 400 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { section: string; id: string } }
) {
  return handle(req, params.section, params.id, "PATCH");
}

export async function DELETE(
  req: Request,
  { params }: { params: { section: string; id: string } }
) {
  return handle(req, params.section, params.id, "DELETE");
}