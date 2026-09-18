import { isSupabaseConfigured, supabaseUrl } from "@/lib/supabase/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { SECTIONS, type Section } from "@/lib/sections";
import {
  normalizeName as localNormalizeName,
  deleteFileLocal,
  nextNumber,
  persistLocal,
  readLocal,
  saveFileLocal,
} from "./localData";

export const BUCKET = "certificates";
export type { Section } from "@/lib/sections";

type Item = Record<string, unknown>;

export interface CreateInput {
  fields: Record<string, string>;
  file?: File | null;
  docLabel?: string;
  manualHref?: string;
}

export interface UpdateInput extends CreateInput {
  removeDoc?: boolean;
}

function publicFileUrl(fileName: string) {
  return `${supabaseUrl()}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(fileName)}`;
}

function fileNameFromUrl(href?: string) {
  if (!href) return null;
  const prefix = `${BUCKET}/`;
  const at = href.lastIndexOf(prefix);
  if (at < 0) return null;
  const tail = href.slice(at + prefix.length).split("?")[0];
  try {
    return decodeURIComponent(tail);
  } catch {
    return tail;
  }
}

export async function readItems(section: Section): Promise<Item[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("portfolio_items")
      .select("data")
      .eq("section", section)
      .order("number", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => row.data as Item);
  }
  return readLocal(section);
}

export async function uploadFile(section: Section, file: File): Promise<string> {
  if (typeof file.arrayBuffer !== "function") throw new Error("File tidak valid.");

  const name = localNormalizeName(file.name);
  const lower = name.toLowerCase();
  const isPdf = lower.endsWith(".pdf");
  const isImage = /\.(png|jpe?g|webp|gif)$/.test(lower);
  if (!isPdf && !(SECTIONS[section].format === "pdf-image" && isImage)) {
    throw new Error("Format file tidak diizinkan untuk jenis ini.");
  }
  if (file.size > 20 * 1024 * 1024) throw new Error("Ukuran file maksimal 20MB.");

  if (isSupabaseConfigured()) {
    const fileName = `${section}-${Date.now()}-${name}`;
    const contentType = isPdf ? "application/pdf" : file.type || "image/*";
    const { error } = await getSupabaseAdmin()
      .storage.from(BUCKET)
      .upload(fileName, file, { contentType, upsert: false });
    if (error) throw new Error(error.message || "Gagal mengunggah file ke Supabase Storage.");
    return publicFileUrl(fileName);
  }

  return saveFileLocal(section, file);
}

export async function removeFile(section: Section, href?: string) {
  if (!href) return;
  if (isSupabaseConfigured()) {
    const name = fileNameFromUrl(href);
    if (!name) return;
    await getSupabaseAdmin().storage.from(BUCKET).remove([name]);
    return;
  }
  deleteFileLocal(section, href);
}

export async function createItem(section: Section, input: CreateInput): Promise<Item> {
  const def = SECTIONS[section];
  const fields = { ...input.fields };

  if (isSupabaseConfigured()) {
    const list = await readItems(section);
    if (!fields.number) fields.number = nextNumber(section, list);

    let item: Item = { ...fields };
    if (input.file) {
      const url = await uploadFile(section, input.file);
      if (def.hasCertificate) {
        item = {
          ...fields,
          certificate: {
            href: url,
            label:
              input.docLabel?.trim() ||
              input.file.name ||
              fields.title ||
              "Sertifikat",
          },
        };
      } else {
        item = { ...fields, href: url };
      }
    } else if (input.manualHref?.trim()) {
      if (def.hasCertificate) {
        item = {
          ...fields,
          certificate: {
            href: input.manualHref.trim(),
            label: input.docLabel?.trim() || fields.title || "Sertifikat",
          },
        };
      } else {
        item = { ...fields, href: input.manualHref.trim() };
      }
    } else if (def.hasCertificate) {
      // dokumen tidak wajib untuk experience/achievements
      item = { ...fields };
    } else {
      throw new Error("Unggah file PDF atau isi tautan dokumen.");
    }

    const { error } = await getSupabaseAdmin().from("portfolio_items").insert({
      section,
      number: fields.number,
      data: item,
    });
    if (error) throw new Error(uniqueError(error.message, fields.number));
    return item;
  }

  const list = readLocal(section);
  if (!fields.number) fields.number = nextNumber(section, list);
  if (list.some((c) => c.number === fields.number)) {
    throw new Error(`Nomor "${fields.number}" sudah digunakan.`);
  }

  let item: Item = { ...fields };
  if (input.file) {
    const url = await saveFileLocal(section, input.file);
    if (def.hasCertificate) {
      item = {
        ...fields,
        certificate: {
          href: url,
          label: input.docLabel?.trim() || input.file.name || fields.title || "Sertifikat",
        },
      };
    } else {
      item = { ...fields, href: url };
    }
  } else if (input.manualHref?.trim()) {
    if (def.hasCertificate) {
      item = {
        ...fields,
        certificate: {
          href: input.manualHref.trim(),
          label: input.docLabel?.trim() || fields.title || "Sertifikat",
        },
      };
    } else {
      item = { ...fields, href: input.manualHref.trim() };
    }
  } else if (def.hasCertificate) {
    item = { ...fields };
  } else {
    throw new Error("Unggah file PDF atau isi tautan dokumen.");
  }

  persistLocal(section, [...list, item]);
  return item;
}

export async function updateItem(
  section: Section,
  id: string,
  input: UpdateInput
): Promise<Item> {
  const def = SECTIONS[section];
  const currentList = await readItems(section);
  const current = currentList.find((c) => c.number === id);
  if (!current) throw new Error("Data tidak ditemukan.");

  const fields: Record<string, string> = {};
  for (const f of def.fields) {
    const v = input.fields[f.key];
    if (v && v.trim() !== "") fields[f.key] = v.trim();
  }

  let merged: Item = { ...current, ...fields };
  let hrefToDelete: string | undefined;

  const currentDoc = def.hasCertificate
    ? (merged.certificate as Item | undefined)?.href as string | undefined
    : (merged.href as string | undefined);

  if (input.removeDoc) {
    hrefToDelete = currentDoc;
    if (def.hasCertificate) delete merged.certificate;
    else delete merged.href;
  } else if (input.file) {
    const url = await uploadFile(section, input.file);
    hrefToDelete = currentDoc;
    if (def.hasCertificate) {
      merged = {
        ...merged,
        certificate: {
          href: url,
          label: input.docLabel?.trim() || currentDocLabel(current) || input.file.name || "Sertifikat",
        },
      };
    } else {
      merged = { ...merged, href: url };
    }
  } else if (input.manualHref?.trim()) {
    hrefToDelete = currentDoc;
    if (def.hasCertificate) {
      merged = {
        ...merged,
        certificate: {
          href: input.manualHref.trim(),
          label: input.docLabel?.trim() || currentDocLabel(current) || "Sertifikat",
        },
      };
    } else {
      merged = { ...merged, href: input.manualHref.trim() };
    }
  } else if (input.docLabel?.trim() && def.hasCertificate && merged.certificate) {
    merged = {
      ...merged,
      certificate: {
        ...(merged.certificate as Item),
        label: input.docLabel.trim(),
      },
    };
  }

  if (isSupabaseConfigured()) {
    let number = id;
    if (fields.number && fields.number !== id) {
      const { data: dup } = await getSupabaseAdmin()
        .from("portfolio_items")
        .select("number")
        .eq("section", section)
        .eq("number", fields.number)
        .maybeSingle();
      if (dup) throw new Error(`Nomor "${fields.number}" sudah digunakan.`);
      number = fields.number;
    }
    const { error } = await getSupabaseAdmin()
      .from("portfolio_items")
      .update({ number, data: merged })
      .eq("section", section)
      .eq("number", id);
    if (error) throw new Error(error.message);
    if (hrefToDelete && hrefToDelete !== currentDocValue(merged, def.hasCertificate)) {
      await removeFile(section, hrefToDelete);
    }
    return merged;
  }

  const list = readLocal(section);
  if (fields.number && fields.number !== id && list.some((c) => c.number === fields.number)) {
    throw new Error(`Nomor "${fields.number}" sudah digunakan.`);
  }
  const idx = list.findIndex((c) => c.number === id);
  if (idx < 0) throw new Error("Data tidak ditemukan.");
  const next = [...list];
  next[idx] = merged;
  persistLocal(section, next);
  if (hrefToDelete && hrefToDelete !== currentDocValue(merged, def.hasCertificate)) {
    deleteFileLocal(section, hrefToDelete);
  }
  return merged;
}

export async function deleteItem(section: Section, id: string): Promise<void> {
  const currentList = await readItems(section);
  const current = currentList.find((c) => c.number === id);
  const href = current
    ? SECTIONS[section].hasCertificate
      ? (current.certificate as Item | undefined)?.href as string | undefined
      : (current.href as string | undefined)
    : undefined;

  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("portfolio_items")
      .delete()
      .eq("section", section)
      .eq("number", id);
    if (error) throw new Error(error.message);
  } else {
    const list = readLocal(section);
    const next = list.filter((c) => c.number !== id);
    if (next.length === list.length) throw new Error("Data tidak ditemukan.");
    persistLocal(section, next);
  }
  await removeFile(section, href);
}

function currentDocLabel(item: Item) {
  const cert = item.certificate as Item | undefined;
  return typeof cert?.label === "string" ? cert.label : "";
}

function currentDocValue(item: Item, hasCertificate: boolean) {
  if (hasCertificate) {
    const cert = item.certificate as Item | undefined;
    return typeof cert?.href === "string" ? cert.href : "";
  }
  return typeof item.href === "string" ? item.href : "";
}

function uniqueError(message: string, number?: string) {
  if (/duplicate key value/i.test(message)) {
    return `Nomor "${number ?? ""}" sudah digunakan.`;
  }
  return message;
}