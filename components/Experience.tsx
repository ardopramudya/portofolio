"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { experiences } from "@/data/experience";
import type { ExperienceItem } from "@/data/experience";

export default function Experience() {
  const ref = useRef<HTMLElement>(null);
  const [list, setList] = useState<ExperienceItem[]>(experiences);
  const [activeCert, setActiveCert] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/experience", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled) return;
        const arr = Array.isArray(data) && data.length ? (data as ExperienceItem[]) : experiences;
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
        gsap.from(".exp-head", {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
        gsap.from(".exp-item", {
          y: 22,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.14,
          scrollTrigger: { trigger: ".exp-list", start: "top 88%", once: true },
        });
      }, ref);
    });
    return () => ctx?.revert();
  }, []);

  return (
    <section ref={ref} id="experience" className="bg-transparent border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-8 py-16 md:py-20">
        <p className="exp-head text-[11px] tracking-[0.2em] text-white/40 font-medium">
          EXPERIENCE — 03
        </p>
        <div className="exp-head mt-3 flex items-end justify-between gap-6">
          <h2 className="font-display text-[34px] md:text-[52px] font-bold tracking-[-0.05em] leading-none text-white">
            EXPERIENCE
          </h2>
          <span className="hidden md:inline text-[11px] tracking-[0.18em] text-white/25">TIMELINE</span>
        </div>
        <p className="exp-head mt-4 max-w-[60ch] text-[13px] leading-relaxed text-white/40">
          Pengalaman magang & kerja — klik sertifikat untuk pratinjau inline tanpa pindah halaman.
        </p>

        <div className="exp-list mt-10 space-y-0">
          {list.map((item: ExperienceItem) => {
            const hasCert = Boolean(item.certificate?.href);
            const isOpen = activeCert === item.number;

            return (
              <div
                key={item.number + item.company}
                className="exp-item border-t border-white/[0.07] py-8 first:pt-0"
              >
                <div className="grid lg:grid-cols-[200px_1fr] gap-6 md:gap-8">
                  {/* Left — year + company */}
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-[12px] tracking-[0.18em] text-white/25">
                        {item.number}
                      </span>
                      <span className="h-px w-6 bg-white/10" />
                      <span className="text-[11px] tracking-[0.14em] text-white/30">0{item.number} / 02</span>
                    </div>
                    <div className="mt-3 font-display text-[15px] md:text-[16px] font-bold tracking-[-0.04em] leading-tight text-white">
                      {item.year}
                    </div>
                    <div className="mt-2 text-[11px] tracking-[0.14em] leading-relaxed text-white/30 break-words">
                      {item.company}
                    </div>
                  </div>

                  {/* Right — role + desc + cert */}
                  <div>
                    <h3 className="text-[15px] md:text-[17px] font-semibold tracking-[-0.02em] text-white">
                      {item.role}
                      <span className="font-normal text-white/30"> · </span>
                      <span className="text-[12px] tracking-[0.10em] font-normal text-white/40">
                        {item.company.split("—")[0].trim()}
                      </span>
                    </h3>
                    <p className="mt-1 text-[11px] tracking-[0.10em] text-white/25 leading-relaxed">
                      {item.location}
                    </p>
                    <p className="mt-4 max-w-[62ch] text-[13px] md:text-[14px] leading-relaxed text-white/50">
                      {item.description}
                    </p>

                    {/* Certificate action */}
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {hasCert ? (
                        <>
                          <button
                            onClick={() => setActiveCert(isOpen ? null : item.number)}
                            className={`inline-flex items-center gap-2 rounded-full px-4 h-8 text-[11px] tracking-[0.12em] font-medium transition-colors ${
                              isOpen
                                ? "bg-white text-black"
                                : "border border-white/15 text-white hover:bg-white hover:text-black"
                            }`}
                          >
                            {isOpen ? "TUTUP PRATINJAU ✕" : `${item.certificate!.label.toUpperCase()} ↗`}
                          </button>
                          <a
                            href={item.certificate!.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] tracking-[0.12em] text-white/30 hover:text-white transition-colors"
                          >
                            BUKA DI TAB BARU ↗
                          </a>
                        </>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] tracking-[0.12em] text-white/25">
                          SERTIFIKAT — BELUM TERSEDIA
                        </span>
                      )}
                    </div>

                    {/* Inline viewer — auto PDF / gambar */}
                    {hasCert && isOpen &&
                      (() => {
                        const href = item.certificate!.href;
                        const isImg = /\.(png|jpe?g|webp|gif)$/i.test(href);
                        const isPdf = /\.pdf(\?|#|$)/i.test(href);
                        return (
                          <div className="mt-6 rounded-[16px] overflow-hidden border border-white/[0.07] bg-[#141414]">
                            <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-white/[0.07] bg-white/[0.02]">
                              <p className="text-[11px] tracking-[0.14em] text-white/40 truncate">
                                {item.number} · {item.certificate!.label} — {item.company}
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
                            <div className="p-2 md:p-3 bg-transparent">
                              {isImg ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={href}
                                  alt={`Sertifikat ${item.role} — ${item.company}`}
                                  className="w-full h-auto rounded-[12px] bg-white"
                                  loading="lazy"
                                />
                              ) : isPdf ? (
                                <object
                                  data={`${href}#view=FitH&toolbar=0`}
                                  type="application/pdf"
                                  className="w-full h-[480px] md:h-[560px] rounded-[12px] bg-white"
                                  aria-label={`Sertifikat ${item.role} — ${item.company}`}
                                >
                                  <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#1a1a1a] rounded-[12px]">
                                    <p className="text-sm text-white/60">Browser tidak dapat menampilkan PDF inline.</p>
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-4 inline-flex items-center rounded-full bg-white text-black px-5 h-9 text-xs font-semibold"
                                    >
                                      Buka PDF di tab baru ↗
                                    </a>
                                  </div>
                                </object>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-[#1a1a1a] rounded-[12px]">
                                  <p className="text-sm text-white/50">Format file tidak didukung untuk pratinjau inline.</p>
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center rounded-full bg-white text-black px-5 h-9 text-xs font-semibold"
                                  >
                                    Buka file di tab baru ↗
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                    {/* Hint untuk Angkasa Pura bila PDF belum ada */}
                    {!hasCert && (
                      <p className="mt-3 text-[11px] leading-relaxed text-white/20">
                        Simpan file PDF ke <code className="text-white/30">public/experience/sertifikat-angkasa-pura-yogyakarta.pdf</code>{" "}
                        lalu isi <code className="text-white/30">certificate.href</code> di{" "}
                        <code className="text-white/30">data/experience.ts</code>.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
