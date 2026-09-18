"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { services } from "@/data/services";

export default function Services() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let ctx: gsap.Context | null = null;
    import("gsap/ScrollTrigger").then((mod) => {
      gsap.registerPlugin(mod.ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(".services-head", {
          y: 24,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 84%", once: true },
        });
        // Card grid — scale + lift with stagger; feels premium vs plain y
        gsap.from(".service-card", {
          y: 34,
          scale: 0.985,
          opacity: 0,
          duration: 0.95,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: ".services-grid", start: "top 88%", once: true },
        });
        // Inner divider line draws
        gsap.from(".service-line", {
          scaleX: 0,
          transformOrigin: "0 0",
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.07,
          scrollTrigger: { trigger: ".services-grid", start: "top 88%", once: true },
        });
        // Subtle parallax on whole grid
        gsap.fromTo(
          ".services-grid",
          { yPercent: 1.5 },
          {
            yPercent: -1.2,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          }
        );
      }, ref);
    });
    return () => ctx?.revert();
  }, []);

  return (
    <section ref={ref} id="services" className="bg-transparent border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-8 py-16 md:py-20">
        <p className="services-head text-[11px] tracking-[0.2em] text-white/40 font-medium">SERVICES — 07</p>
        <h2 className="services-head mt-3 font-display text-[34px] md:text-[52px] font-bold tracking-[-0.05em] leading-none text-white">
          WHAT I DO
        </h2>
        <p className="services-head mt-4 max-w-[48ch] text-[14px] leading-relaxed text-white/45">
          End-to-end product development — from interface to infrastructure. Focused on quality,
          speed, and long-term maintainability.
        </p>

        <div className="services-grid mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/[0.06] rounded-[20px] overflow-hidden border border-white/[0.06] will-change-transform">
          {services.map((s) => (
            <div
              key={s.number}
              className="service-card will-change-transform group relative bg-[#141414] p-7 md:p-8 hover:bg-[#1a1a1a] transition-colors lg:last:col-span-1 md:last:col-span-2 lg:[&:nth-child(4)]:col-span-1"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-[11px] tracking-[0.18em] text-white/30 font-medium">
                  {s.number}
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/40 group-hover:bg-white group-hover:text-black group-hover:border-white transition-colors text-xs">
                  ↗
                </span>
              </div>

              <h3 className="mt-6 font-display text-[18px] md:text-[20px] font-semibold tracking-[-0.03em] leading-tight text-white">
                {s.title}
              </h3>
              <p className="mt-3 text-[13px] md:text-[14px] leading-relaxed text-white/45 max-w-[32ch]">
                {s.description}
              </p>

              <div className="service-line mt-8 h-px w-full bg-white/[0.06] group-hover:bg-white/10 transition-colors origin-left" />
              <div className="mt-4 text-[11px] tracking-[0.14em] text-white/20 group-hover:text-white/40 transition-colors">
                0{s.number} · 05
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
