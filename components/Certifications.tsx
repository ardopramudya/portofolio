"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { certifications } from "@/data/certifications";
import type { Certification } from "@/data/certifications";

export default function Certifications() {
  const ref = useRef<HTMLElement>(null);
  const [list, setList] = useState<Certification[]>(certifications);
  const [active, setActive] = useState<Certification>(certifications[0]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/certifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled) return;
        const arr =
          Array.isArray(data) && data.length ? (data as Certification[]) : certifications;
        setList(arr);
        setActive((current) => arr.find((c) => c.number === current.number) ?? arr[0]);
      })
      .catch(() => {
        /* pakai data statis */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const current = list.find((c) => c.number === active.number) ?? list[0];

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let ctx: gsap.Context | null = null;
    import("gsap/ScrollTrigger").then((mod) => {
      gsap.registerPlugin(mod.ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(".cert-head", {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
        gsap.from(".cert-list", {
          y: 18,
          opacity: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: ".cert-list", start: "top 90%", once: true },
        });
        gsap.from(".cert-viewer", {
          y: 22,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".cert-viewer", start: "top 90%", once: true },
        });
      }, ref);
    });
    return () => ctx?.revert();
  }, []);

  return (
    <section ref={ref} className="bg-transparent border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-8 py-16 md:py-20">
        <p className="cert-head text-[11px] tracking-[0.2em] text-white/40 font-medium">
          CERTIFICATIONS — 06
        </p>
        <div className="cert-head mt-3 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h2 className="font-display text-[34px] md:text-[52px] font-bold tracking-[-0.05em] leading-none text-white">
            CERTIFICATIONS
          </h2>
          <span className="text-[11px] tracking-[0.18em] text-white/25">
            DICODING INDONESIA · 2026
          </span>
        </div>
        <p className="cert-head mt-4 max-w-[60ch] text-[13px] leading-relaxed text-white/40">
          Klik salah satu sertifikat untuk melihat pratinjau PDF langsung di halaman. File tersimpan di{" "}
          <code className="text-white/60">public/certificates/</code> dan dapat dibuka di tab baru.
        </p>

        {/* Layout: list kiri + viewer kanan */}
        <div className="mt-10 grid lg:grid-cols-[380px_1fr] gap-6 lg:gap-8 items-start">
          {/* List */}
          <div className="cert-list rounded-[20px] overflow-hidden border border-white/[0.07] bg-[#141414] divide-y divide-white/[0.07]">
            {list.map((c) => {
              const isActive = active.number === c.number;
              return (
                <button
                  key={c.number}
                  onClick={() => setActive(c)}
                  className={`w-full text-left flex items-start gap-4 px-5 md:px-6 py-5 transition-colors ${
                    isActive ? "bg-white text-black" : "bg-[#141414] hover:bg-[#1a1a1a] text-white"
                  }`}
                >
                  <span
                    className={`font-display text-[12px] tracking-[0.18em] pt-0.5 shrink-0 ${
                      isActive ? "text-black/40" : "text-white/25"
                    }`}
                  >
                    {c.number}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span
                      className={`block text-[13px] md:text-[14px] font-medium leading-tight tracking-[-0.02em] ${
                        isActive ? "text-black" : "text-white"
                      }`}
                    >
                      {c.title}
                    </span>
                    <span
                      className={`block mt-1 text-[11px] tracking-[0.12em] ${
                        isActive ? "text-black/50" : "text-white/35"
                      }`}
                    >
                      {c.issuer} · {c.year}
                    </span>
                  </span>
                  <span
                    className={`hidden sm:inline-flex h-7 w-7 items-center justify-center rounded-full border text-[11px] shrink-0 mt-0.5 ${
                      isActive
                        ? "border-black/15 text-black/50 bg-black/[0.04]"
                        : "border-white/10 text-white/30"
                    }`}
                  >
                    ↗
                  </span>
                </button>
              );
            })}
          </div>

          {/* Viewer */}
          {current ? (
            <div className="cert-viewer rounded-[20px] overflow-hidden border border-white/[0.07] bg-[#141414] flex flex-col">
              {/* Viewer header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 md:px-6 py-4 border-b border-white/[0.07] bg-white/[0.02]">
                <div className="min-w-0">
                  <p className="text-[10px] tracking-[0.18em] text-white/30">
                    {current.number} · PREVIEW
                  </p>
                  <h3 className="mt-1 text-[13px] md:text-[14px] font-medium tracking-[-0.02em] text-white truncate">
                    {current.title}
                  </h3>
                  <p className="text-[11px] tracking-[0.10em] text-white/35">
                    {current.issuer} · {current.year}
                  </p>
                </div>
                {current.href && (
                  <a
                    href={current.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-white text-black px-4 h-8 text-[11px] tracking-[0.12em] font-semibold hover:bg-white/90 transition-colors shrink-0"
                  >
                    BUKA PDF ↗
                  </a>
                )}
              </div>

              {/* PDF embed */}
              <div className="relative bg-transparent p-2 md:p-3">
                {current.href ? (
                  <object
                    key={current.href}
                    data={`${current.href}#view=FitH&toolbar=0`}
                    type="application/pdf"
                    className="w-full h-[420px] md:h-[560px] lg:h-[620px] rounded-[14px] bg-white"
                    aria-label={`Pratinjau sertifikat ${current.title}`}
                  >
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#1a1a1a] rounded-[14px]">
                      <p className="text-sm text-white/60">
                        Browser tidak dapat menampilkan PDF inline.
                      </p>
                      <a
                        href={current.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center rounded-full bg-white text-black px-5 h-9 text-xs font-semibold"
                      >
                        Buka PDF di tab baru ↗
                      </a>
                    </div>
                  </object>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[420px] md:h-[560px] rounded-[14px] bg-[#1a1a1a]">
                    <p className="text-sm text-white/40">Sertifikat ini belum memiliki file PDF.</p>
                  </div>
                )}
                {/* fallback message for browsers that hide object on error */}
                <p className="mt-3 text-center text-[11px] tracking-wide text-white/25">
                  Jika pratinjau tidak muncul, gunakan tombol BUKA PDF di atas — file akan terbuka
                  di tab baru.
                </p>
              </div>
            </div>
          ) : (
            <div className="cert-viewer flex flex-col items-center justify-center rounded-[20px] border border-white/[0.07] bg-[#141414] p-12 text-center">
              <p className="text-sm text-white/40">Belum ada sertifikat untuk ditampilkan.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
