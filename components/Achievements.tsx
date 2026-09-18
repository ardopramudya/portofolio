"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { achievements } from "@/data/achievements";
import type { Achievement } from "@/data/achievements";

export default function Achievements() {
  const ref = useRef<HTMLElement>(null);
  const [list, setList] = useState<Achievement[]>(achievements);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/achievements", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled) return;
        const arr = Array.isArray(data) && data.length ? (data as Achievement[]) : achievements;
        setList(arr);
      })
      .catch(() => {
        /* pakai data statis */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let ctx: gsap.Context | null = null;
    import("gsap/ScrollTrigger").then((mod) => {
      gsap.registerPlugin(mod.ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(".ach-head", {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
        gsap.from(".ach-grid", {
          y: 18,
          opacity: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: ".ach-grid", start: "top 90%", once: true },
        });
      }, ref);
    });
    return () => ctx?.revert();
  }, []);

  const isImage = (href: string) => /\.(png|jpe?g|webp|gif)$/i.test(href);

  return (
    <section ref={ref} className="bg-transparent border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-8 py-16 md:py-20">
        <p className="ach-head text-[11px] tracking-[0.2em] text-white/40 font-medium">
          ACHIEVEMENTS — 05
        </p>
        <h2 className="ach-head mt-3 font-display text-[34px] md:text-[52px] font-bold tracking-[-0.05em] leading-none text-white">
          ACHIEVEMENTS
        </h2>
        <p className="ach-head mt-4 max-w-[60ch] text-[13px] leading-relaxed text-white/40">
          Pencapaian kompetisi — klik sertifikat untuk pratinjau inline.
        </p>

        <div className="ach-grid mt-10 space-y-6">
          {list.map((a: Achievement) => {
            const hasCert = Boolean(a.certificate?.href);
            const isOpen = active === a.number;
            const href = a.certificate?.href ?? "";

            return (
              <div
                key={a.number}
                className="rounded-[20px] overflow-hidden border border-white/[0.07] bg-[#141414]"
              >
                {/* Card header */}
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-[11px] tracking-[0.18em] text-white/25">
                        {a.number}
                      </span>
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] tracking-[0.16em] text-white/40">
                        {a.tag}
                      </span>
                      <span className="text-[11px] tracking-[0.12em] text-white/20">
                        {a.event} · {a.year}
                      </span>
                    </div>
                    {hasCert && (
                      <span className="hidden sm:inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/30 text-[11px]">
                        ↗
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 font-display text-[18px] md:text-[20px] font-semibold leading-tight tracking-[-0.03em] text-white">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-[12px] tracking-[0.14em] text-white/40">
                    {a.event} — {a.year}
                  </p>
                  <p className="mt-3 max-w-[60ch] text-[12px] leading-relaxed text-white/35">
                    National creative competition — web & mobile application category.
                  </p>

                  {hasCert && (
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setActive(isOpen ? null : a.number)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 h-8 text-[11px] tracking-[0.12em] font-medium transition-colors ${
                          isOpen
                            ? "bg-white text-black"
                            : "border border-white/15 text-white hover:bg-white hover:text-black"
                        }`}
                      >
                        {isOpen ? "TUTUP PRATINJAU ✕" : `${a.certificate!.label.toUpperCase()} ↗`}
                      </button>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] tracking-[0.12em] text-white/30 hover:text-white transition-colors"
                      >
                        BUKA DI TAB BARU ↗
                      </a>
                    </div>
                  )}
                </div>

                {/* Inline viewer */}
                {hasCert && isOpen && (
                  <div className="border-t border-white/[0.07] bg-transparent p-2 md:p-3">
                    <div className="flex items-center justify-between px-3 md:px-4 py-2">
                      <p className="text-[11px] tracking-[0.14em] text-white/30 truncate">
                        {a.number} · {a.certificate!.label}
                      </p>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 ml-3 inline-flex items-center rounded-full bg-white text-black px-3 h-7 text-[11px] font-semibold hover:bg-white/90 transition-colors"
                      >
                        BUKA FILE ↗
                      </a>
                    </div>

                    {isImage(href) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={href}
                        alt={`Sertifikat ${a.title} — ${a.event}`}
                        className="w-full h-auto rounded-[12px] bg-white"
                        loading="lazy"
                      />
                    ) : (
                      <object
                        data={`${href}#view=FitH&toolbar=0`}
                        type="application/pdf"
                        className="w-full h-[480px] md:h-[560px] rounded-[12px] bg-white"
                        aria-label={`Sertifikat ${a.title}`}
                      >
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#1a1a1a] rounded-[12px]">
                          <p className="text-sm text-white/60">Browser tidak dapat menampilkan file inline.</p>
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center rounded-full bg-white text-black px-5 h-9 text-xs font-semibold"
                          >
                            Buka file di tab baru ↗
                          </a>
                        </div>
                      </object>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
