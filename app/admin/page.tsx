"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, Lock, LogOut, Plus, Pencil, Trash2, X } from "lucide-react";
import type { Certification } from "@/data/certifications";

type AuthState = "loading" | "login" | "ready";

interface FormState {
  number: string;
  title: string;
  issuer: string;
  year: string;
}

const emptyForm: FormState = { number: "", title: "", issuer: "", year: "" };

function nextNumberOf(list: Certification[]) {
  const max = list.reduce((acc, c) => {
    const n = parseInt(c.number, 10);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return String(max + 1).padStart(2, "0");
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/40 focus:bg-white/[0.06]";

const labelCls = "block text-[10px] tracking-[0.16em] text-white/40 font-medium mb-1.5 uppercase";

export default function AdminPage() {
  const [auth, setAuth] = useState<AuthState>("loading");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [list, setList] = useState<Certification[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [editFile, setEditFile] = useState<File | null>(null);

  const loadList = async () => {
    try {
      const res = await fetch("/api/certifications", { cache: "no-store" });
      if (res.ok) setList(await res.json());
    } catch {
      // jaringan bermasalah
    }
  };

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => {
        setAuth(d.ok ? "ready" : "login");
        if (d.ok) return loadList();
      })
      .catch(() => setAuth("login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal.");
        return;
      }
      setAuth("ready");
      setPassword("");
      await loadList();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuth("login");
    setList([]);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("number", form.number || nextNumberOf(list));
      fd.append("title", form.title);
      fd.append("issuer", form.issuer);
      fd.append("year", form.year);
      if (file) fd.append("file", file);
      const res = await fetch("/api/certifications", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menambahkan.");
        return;
      }
      setFile(null);
      setForm({ ...emptyForm, number: nextNumberOf([...list, data.item]) });
      await loadList();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (item: Certification) => {
    setEditingId(item.number);
    setEditForm({ number: item.number, title: item.title, issuer: item.issuer, year: item.year });
    setEditFile(null);
  };

  const handleSaveEdit = async (number: string, e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("number", editForm.number);
      fd.append("title", editForm.title);
      fd.append("issuer", editForm.issuer);
      fd.append("year", editForm.year);
      if (editFile) fd.append("file", editFile);
      const res = await fetch(`/api/certifications/${number}`, { method: "PATCH", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan.");
        return;
      }
      setEditingId(null);
      await loadList();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (item: Certification) => {
    if (!confirm(`Hapus sertifikat "${item.title}"? File PDF ikut dihapus.`)) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/certifications/${item.number}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Gagal menghapus.");
        return;
      }
      await loadList();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setBusy(false);
    }
  };

  const totalPdf = useMemo(() => list.filter((c) => c.href).length, [list]);

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
              <p className="text-[11px] tracking-[0.16em] text-white/35">UPLOAD SERTIFIKASI</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={busy || !password}
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
            Kelola Sertifikasi &amp; PDF
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

      <div className="mx-auto max-w-6xl mt-8 flex flex-wrap gap-3">
        <div className="rounded-2xl border border-white/[0.07] bg-surface px-5 py-3">
          <p className="text-[10px] tracking-[0.16em] text-white/35">TOTAL</p>
          <p className="font-display text-xl font-bold text-white mt-0.5">{list.length}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-surface px-5 py-3">
          <p className="text-[10px] tracking-[0.16em] text-white/35">DENGAN PDF</p>
          <p className="font-display text-xl font-bold text-white mt-0.5">{totalPdf}</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl mt-8 grid lg:grid-cols-[360px_1fr] gap-6 items-start">
        {/* Form tambah */}
        <form
          onSubmit={handleAdd}
          className="rounded-[20px] border border-white/[0.08] bg-surface p-6 lg:sticky lg:top-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
              <Plus size={14} />
            </div>
            <h2 className="font-display text-sm font-bold tracking-[-0.02em]">TAMBAH SERTIFIKAT</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Nomor</label>
              <input
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                placeholder="Auto"
                className={inputCls}
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Tahun</label>
              <input
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="2026"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Judul</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Belajar Dasar Pemrograman Web"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Penerbit</label>
            <input
              value={form.issuer}
              onChange={(e) => setForm({ ...form, issuer: e.target.value })}
              placeholder="Dicoding Indonesia"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>File PDF</label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-6 text-center hover:border-white/40 transition">
              <Download size={18} className="text-white/60" />
              <span className="text-xs text-white/60">
                {file ? file.name : "Klik untuk pilih file PDF"}
              </span>
              <span className="text-[10px] tracking-wide text-white/30">maks. 20MB · .pdf</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {file && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="mt-2 inline-flex items-center gap-1 text-[11px] text-white/40 hover:text-white"
              >
                <X size={12} /> Hapus pilihan file
              </button>
            )}
          </div>

          {form.number && form.number !== nextNumberOf(list) && (
            <p className="text-[11px] text-white/40">Nomor sebelumnya: {nextNumberOf(list)}</p>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={busy || !form.title || !form.issuer || !form.year}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black h-11 text-[12px] tracking-[0.14em] font-semibold hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Plus size={14} />
            {busy ? "MENYIMPAN…" : "SIMPAN SERTIFIKAT"}
          </button>
        </form>

        {/* Daftar */}
        <div className="rounded-[20px] border border-white/[0.08] bg-surface divide-y divide-white/[0.06] overflow-hidden">
          {list.length === 0 ? (
            <div className="p-10 text-center text-sm text-white/40">
              Belum ada sertifikat. Tambahkan lewat form di samping.
            </div>
          ) : (
            list.map((item) => {
              const editing = editingId === item.number;
              return (
                <div key={item.number} className="px-5 md:px-6 py-4">
                  {editing ? (
                    <form
                      onSubmit={(e) => handleSaveEdit(item.number, e)}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] tracking-[0.16em] text-white/35">
                          EDIT · {item.number}
                        </p>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-white/40 hover:text-white"
                        >
                          <X size={15} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Nomor</label>
                          <input
                            value={editForm.number}
                            onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Tahun</label>
                          <input
                            value={editForm.year}
                            onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="Judul"
                        className={inputCls}
                      />
                      <input
                        value={editForm.issuer}
                        onChange={(e) => setEditForm({ ...editForm, issuer: e.target.value })}
                        placeholder="Penerbit"
                        className={inputCls}
                      />
                      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-3 text-xs text-white/60 hover:border-white/40 transition">
                        {editFile ? editFile.name : "Ganti file PDF (opsional)"}
                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          className="hidden"
                          onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={busy}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white text-black h-10 text-[11px] tracking-[0.12em] font-semibold hover:bg-white/90 disabled:opacity-40"
                        >
                          {busy ? "MENYIMPAN…" : "SIMPAN"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="font-display text-[12px] tracking-[0.18em] text-white/25 shrink-0">
                        {item.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{item.title}</p>
                        <p className="text-[11px] tracking-[0.1em] text-white/35 mt-0.5">
                          {item.issuer} · {item.year}
                        </p>
                      </div>
                      {item.href && (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 text-white/50 hover:text-white hover:border-white/40 transition"
                          title="Buka PDF"
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
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}