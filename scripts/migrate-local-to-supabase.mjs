/**
 * Migrate file PDF/gambar + metadata dari local filesystem ke Supabase.
 *
 * Prasyarat:
 *  1. .env sudah terisi:
 *     - NEXT_PUBLIC_SUPABASE_URL
 *     - NEXT_PUBLIC_SUPABASE_ANON_KEY
 *     - SUPABASE_SERVICE_ROLE_KEY
 *  2. Jalankan supabase/schema.sql di Supabase SQL Editor
 *  3. Jalankan:
 *       node scripts/migrate-local-to-supabase.mjs
 */

import { readFileSync, existsSync } from "fs";
import { join, basename } from "path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus diset di .env");
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const BUCKET = "certificates";

const SECTIONS = [
  { section: "certifications", file: "data/certifications.json", folder: "certificates" },
  { section: "experience", file: "data/experience.json", folder: "experience" },
  { section: "achievements", file: "data/achievements.json", folder: "achievements" },
];

function documentOf(section, item) {
  if (section === "certifications") return { ref: item.href, hrefKey: "href" };
  return { ref: item.certificate?.href, hrefKey: "href" };
}

function uploadFileName(section, name) {
  const safe = name.replace(/[\\/:*?"<>| ]/g, "-");
  return `${section}-${Date.now()}-${safe}`;
}

const results = { success: 0, skipped: 0, failed: 0 };

for (const { section, file, folder } of SECTIONS) {
  const jsonPath = join(process.cwd(), file);
  if (!existsSync(jsonPath)) {
    console.log(`(lewati) ${file} tidak ditemukan`);
    results.skipped++;
    continue;
  }
  const items = JSON.parse(readFileSync(jsonPath, "utf8"));
  if (!Array.isArray(items) || items.length === 0) continue;

  console.log(`\n==== ${section.toUpperCase()} (${items.length} item) ====`);

  for (const item of items) {
    console.log(`[${item.number}] ${item.title || item.role}`);

    const data = { ...item };
    const doc = documentOf(section, item);
    let uploaded = false;

    if (doc.ref && doc.ref.startsWith(`/${folder}/`)) {
      const localFile = join(process.cwd(), "public", doc.ref);
      if (existsSync(localFile)) {
        const buffer = readFileSync(localFile);
        const fileName = uploadFileName(section, basename(decodeURIComponent(localFile)));
        const { error } = await db.storage
          .from(BUCKET)
          .upload(fileName, buffer, {
            contentType: doc.ref.endsWith(".pdf") ? "application/pdf" : "image/*",
            upsert: true,
          });
        if (error) {
          console.error(`   Upload gagal: ${error.message}`);
          results.failed++;
          continue;
        }
        const href = `${url}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(fileName)}`;
        if (section === "certifications") {
          data.href = href;
        } else {
          data.certificate = { ...data.certificate, href };
        }
        uploaded = true;
        console.log(`   File uploaded ✓`);
      } else {
        console.log(`   File lokal tidak ditemukan, link lama dipakai: ${doc.ref}`);
      }
    }

    const { error } = await db.from("portfolio_items").upsert(
      { section, number: item.number, data },
      { onConflict: "section,number" }
    );
    if (error) {
      console.error(`   DB insert gagal: ${error.message}`);
      results.failed++;
      continue;
    }
    results.success++;
    console.log(`   Metadata tersimpan ✓${uploaded ? "" : " (tanpa upload)"}`);
  }
}

console.log("\nSelesai!");
console.log(`   Berhasil : ${results.success}`);
console.log(`   Dilewati : ${results.skipped}`);
console.log(`   Gagal    : ${results.failed}`);