"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, Lock, LogOut, Plus, Pencil, Trash2, X } from "lucide-react";
import { SECTIONS, SECTION_KEYS, type Section } from "@/lib/sections";

type AuthState = "loading" | "login" | "ready";
type Item = Record<string, unknown>;
type FieldType = "text" | "textarea";

const FIELD_TYPE: Record<string, FieldType> = {
  description: "textarea",
};

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/40 focus:bg-white/[0.06]";

const labelCls = "block text-[10px] tracking-[0.16em] text-white/40 font-medium mb-1.5 uppercase";

function text(item: Item, key: string) {
  const v = item[key];
  return typeof v === "string" ? v : "";
}

function docHref(section: Section, item: Item) {
  if (!SECTIONS[section].hasCertificate) return text(item, "href");
  const cert = item.certificate;
  if (cert && typeof cert === "object") return text(cert as Item, "href");
  return "";
}

function docLabelOf(section: Section, item: Item) {
  const cert = item.certificate;
  if (cert && typeof cert === "object") return text(cert as Item, "label");
  return "";
}

function nextNumberOf(items: Item[]) {
  const max = items.reduce((acc, c) => {
    const n = parseInt(text(c, "number"), 10);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return String(max + 1).padStart(2, "0");
}

function summaryOf(section: Section, item: Item) {
  switch (section) {
    case "certifications":
      return { primary: text(item, "title"), secondary: `${text(item, "issuer")} · ${text(item, "year")}` };
    case "experience":
      return { primary: text(item, "role"), secondary: `${text(item, "company")} · ${text(item, "year")}` };
    case "achievements":
      return {
        primary: text(item, "title"),
        secondary: `${text(item, "tag")} · ${text(item, "event")} · ${text(item, "year")}`,
      };
  }
}

function Field({
  field,
  value,
  onChange,
}: {
  field: { key: string; label: string };
  value: string;
  onChange: (key: string, value: string) => void;
}) {
  const type = FIELD_TYPE[field.key] ?? "text";
  return (
    <div>
      <label className={labelCls}>{field.label}</label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          rows={4}
          className={`${inputCls} resize-none`}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={inputCls}
        />
      )}
    </div>
  );
}

function DocPicker({
  section,
  file,
  setFile,
  docLabel,
  setDocLabel,
  manualHref,
  setManualHref,
}: {
  section: Section;
  file: File | null;
  setFile: (f: File | null) => void;
  docLabel: string;
  setDocLabel: (v: string) => void;
  manualHref: string;
  setManualHref: (v: string) => void;
}) {
  const def = SECTIONS[section];
  const multiple = def.format === "pdf-image";
  const accept = multiple ? ".pdf,.png,.jpg,.jpeg,.webp,.gif" : ".pdf";
  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>{def.hasCertificate ? "File Sertifikat (opsional)" : "File PDF"}</label>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-5 text-center hover:border-white/40 transition">
          <Download size={18} className="text-white/60" />
          <span className="text-xs text-white/60">
            {file ? file.name : "Klik untuk pilih file (PDF / gambar)"}
          </span>
          <span className="text-[10px] tracking-wide text-white/30">maks. 20MB</span>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {def.hasCertificate && (
        <div>
          <label className={labelCls}>Label Sertifikat</label>
          <input
            value={docLabel}
            onChange={(e) => setDocLabel(e.target.value)}
            placeholder="E-Sertifikat Finalis…"
            className={inputCls}
          />
        </div>
      )}

      <div>
        <label className={labelCls}>Tautan Manual (opsional)</label>
        <input
          value={manualHref}
          onChange={(e) => setManualHref(e.target.value)}
          placeholder="/certificates/nama.pdf atau https://…"
          className={inputCls}
        />
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [auth, setAuth] = useState<AuthState>("loading");
  const [mode, setMode] = useState<"supabase" | "local">("local");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [active, setActive] = useState<Section>("certifications");
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [docLabel, setDocLabel] = useState("");
  const [manualHref, setManualHref] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editDocLabel, setEditDocLabel] = useState("");
  const [editManualHref, setEditManualHref] = useState("");
  const [removeDoc, setRemoveDoc] = useState(false);

  const def = SECTIONS[active];
  const totalDocs = useMemo(
    () => items.filter((c) => docHref(active, c)).length,
    [items, active]
  );

  const loadList = useCallback(async (section: Section) => {
    try {
      const res = await fetch(`/api/${section}`, { cache: "no-store" });
      if (res.ok) setItems(await res.json());
    } catch {
      // jaringan bermasalah
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.mode === "supabase") setMode("supabase");
      })
      .catch(() => {});
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => {
        setAuth(d.ok ? "ready" : "login");
        if (d.ok) return loadList(active);
      })
      .catch(() => setAuth("login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchSection = (section: Section) => {
    setActive(section);
    resetForm();
    setEditing(null);
    loadList(section);
  };

  const resetForm = () => {
    setForm({});
    setFile(null);
    setDocLabel("");
    setManualHref("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "supabase" ? { email, password } : { password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal.");
        return;
      }
      setAuth("ready");
      setEmail("");
      setPassword("");
      await loadList(active);
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuth("login");
    setItems([]);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      const number = form.number?.trim() || nextNumberOf(items);
      fd.append("number", number);
      for (const f of def.fields) {
        if (f.key !== "number" && form[f.key]?.trim()) fd.append(f.key, form[f.key].trim());
      }
      if (file) fd.append("file", file);
      if (docLabel.trim()) fd.append("docLabel", docLabel.trim());
      if (manualHref.trim()) fd.append("manualHref", manualHref.trim());

      const res = await fetch(`/api/${active}`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menambahkan.");
        return;
      }
      resetForm();
      setForm({ number: nextNumberOf([...items, data.item]) });
      await loadList(active);
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (item: Item) => {
    const initial: Record<string, string> = {};
    for (const f of def.fields) {
      const v = text(item, f.key);
      if (v) initial[f.key] = v;
    }
    setEditing(text(item, "number"));
    setEditForm(initial);
    setEditFile(null);
    setEditDocLabel(docLabelOf(active, item));
    setEditManualHref("");
    setRemoveDoc(false);
  };

  const handleSaveEdit = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      for (const f of def.fields) {
        if (editForm[f.key]?.trim()) fd.append(f.key, editForm[f.key].trim());
      }
      if (editFile) fd.append("file", editFile);
      if (editDocLabel.trim()) fd.append("docLabel", editDocLabel.trim());
      if (editManualHref.trim()) fd.append("manualHref", editManualHref.trim());
      if (removeDoc) fd.append("removeDoc", "1");

      const res = await fetch(`/api/${active}/${id}`, { method: "PATCH", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan.");
        return;
      }
      setEditing(null);
      await loadList(active);
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (item: Item) => {
    if (!confirm(`Hapus data "${text(item, "title") || text(item, "role")}"? File ikut dihapus.`)) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/${active}/${text(item, "number")}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Gagal menghapus.");
        return;
      }
      await loadList(active);
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setBusy(false);
    }
  };

  if (auth === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-[11px] tracking-[0.2em] text-white/40">MEMUAT ADMIN…</p>
      </div>
    );
  }

  if (auth === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-6">
        <div className="w-full max-w-sm rounded-[20px] border border-white/[0.08] bg-surface p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70">
              <Lock size={16} />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-[-0.03em] text-white">
                ADMIN PANEL
              </h1>
              <p className="text-[11px] tracking-[0.16em] text-white/35">
                {mode === "supabase" ? "SUPABASE AUTH" : "UPLOAD SERTIFIKASI"}
              </p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            {mode === "supabase" && (
              <div>
                <label className={labelCls}>Email Admin</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  className={inputCls}
                  autoFocus
                />
              </div>
            )}
            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
                autoFocus={mode === "local"}
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={busy || !password || (mode === "supabase" && !email)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black h-11 text-[12px] tracking-[0.14em] font-semibold hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Lock size={14} />
              {busy ? "MENGIRIM…" : "MASUK"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg px-4 md:px-8 py-6">
      <header className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] text-white/30 font-medium">ADMIN DASHBOARD</p>
          <h1 className="font-display text-xl md:text-2xl font-bold tracking-[-0.03em] text-white mt-1">
            Kelola Sertifikat, Pengalaman &amp; Achievements
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 h-10 text-[11px] tracking-[0.12em] text-white/80 hover:bg-white/10 transition"
          >
            <ExternalLink size={13} /> LIHAT PORTFOLIO
          </a>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-red-400/25 px-4 h-10 text-[11px] tracking-[0.12em] text-red-300 hover:bg-red-400/10 transition"
          >
            <LogOut size={13} /> KELUAR
          </button>
        </div>
      </header>

      {/* Tabs section */}
      <div className="mx-auto max-w-6xl mt-8 flex flex-wrap gap-2">
        {SECTION_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => switchSection(key)}
            className={`inline-flex items-center rounded-full px-4 h-9 text-[11px] tracking-[0.12em] font-medium transition ${
              active === key
                ? "bg-white text-black"
                : "border border-white/15 text-white/70 hover:bg-white/10"
            }`}
          >
            {SECTIONS[key].label.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-6xl mt-5 flex flex-wrap gap-3">
        <div className="rounded-2xl border border-white/[0.07] bg-surface px-5 py-3">
          <p className="text-[10px] tracking-[0.16em] text-white/35">TOTAL {def.label.toUpperCase()}</p>
          <p className="font-display text-xl font-bold text-white mt-0.5">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-surface px-5 py-3">
          <p className="text-[10px] tracking-[0.16em] text-white/35">DENGAN FILE</p>
          <p className="font-display text-xl font-bold text-white mt-0.5">{totalDocs}</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl mt-8 grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Form tambah */}
        <form
          onSubmit={handleAdd}
          className="rounded-[20px] border border-white/[0.08] bg-surface p-6 lg:sticky lg:top-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
              <Plus size={14} />
            </div>
            <h2 className="font-display text-sm font-bold tracking-[-0.02em]">
              TAMBAH {def.label.toUpperCase()}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nomor</label>
              <input
                value={form.number ?? ""}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                placeholder={nextNumberOf(items)}
                className={inputCls}
              />
            </div>
          </div>

          {def.fields
            .filter((f) => f.key !== "number")
            .map((f) => (
              <Field
                key={f.key}
                field={f}
                value={form[f.key] ?? ""}
                onChange={(key, value) => setForm({ ...form, [key]: value })}
              />
            ))}

          <DocPicker
            section={active}
            file={file}
            setFile={setFile}
            docLabel={docLabel}
            setDocLabel={setDocLabel}
            manualHref={manualHref}
            setManualHref={setManualHref}
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black h-11 text-[12px] tracking-[0.14em] font-semibold hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Plus size={14} />
            {busy ? "MENYIMPAN…" : "SIMPAN"}
          </button>
        </form>

        {/* Daftar */}
        <div className="rounded-[20px] border border-white/[0.08] bg-surface divide-y divide-white/[0.06] overflow-hidden">
          {items.length === 0 ? (
            <div className="p-10 text-center text-sm text-white/40">
              Belum ada data. Tambahkan lewat form di samping.
            </div>
          ) : (
            items.map((item) => {
              const id = text(item, "number");
              const isEditing = editing === id;
              const sum = summaryOf(active, item);
              const href = docHref(active, item);

              if (isEditing) {
                return (
                  <div key={id} className="px-5 md:px-6 py-4">
                    <form onSubmit={(e) => handleSaveEdit(id, e)} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] tracking-[0.16em] text-white/35">
                          EDIT · {def.singular.toUpperCase()} {id}
                        </p>
                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          className="text-white/40 hover:text-white"
                        >
                          <X size={15} />
                        </button>
                      </div>
                      {def.fields
                        .filter((f) => f.key !== "number")
                        .map((f) => (
                          <Field
                            key={f.key}
                            field={f}
                            value={editForm[f.key] ?? ""}
                            onChange={(key, value) => setEditForm({ ...editForm, [key]: value })}
                          />
                        ))}
                      <DocPicker
                        section={active}
                        file={editFile}
                        setFile={setEditFile}
                        docLabel={editDocLabel}
                        setDocLabel={setEditDocLabel}
                        manualHref={editManualHref}
                        setManualHref={setEditManualHref}
                      />
                      {href && (
                        <label className="flex items-center gap-2 text-xs text-white/60">
                          <input
                            type="checkbox"
                            checked={removeDoc}
                            onChange={(e) => setRemoveDoc(e.target.checked)}
                            className="accent-white"
                          />
                          Hapus file dokumen ini
                        </label>
                      )}
                      <button
                        type="submit"
                        disabled={busy}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white text-black h-10 text-[11px] tracking-[0.12em] font-semibold hover:bg-white/90 disabled:opacity-40"
                      >
                        {busy ? "MENYIMPAN…" : "SIMPAN PERUBAHAN"}
                      </button>
                    </form>
                  </div>
                );
              }

              return (
                <div key={id} className="px-5 md:px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className="font-display text-[12px] tracking-[0.18em] text-white/25 shrink-0">
                      {id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{sum.primary}</p>
                      <p className="text-[11px] tracking-[0.1em] text-white/35 mt-0.5 truncate">
                        {sum.secondary}
                      </p>
                    </div>
                    {href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 text-white/50 hover:text-white hover:border-white/40 transition"
                        title="Buka file"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                    <button
                      onClick={() => startEdit(item)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 text-white/50 hover:text-white hover:border-white/40 transition"
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={busy}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-400/20 text-red-300/70 hover:text-red-300 hover:border-red-400/40 disabled:opacity-40 transition"
                      title="Hapus"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}