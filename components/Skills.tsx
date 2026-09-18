"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { skillGroups } from "@/data/skills";

export default function Skills() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let ctx: gsap.Context | null = null;
    import("gsap/ScrollTrigger").then((mod) => {
      gsap.registerPlugin(mod.ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(".skills-head", {
          y: 28,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: ref.current, start: "top 84%", once: true },
        });
        gsap.from(".skill-group", {
          y: 32,
          scale: 0.985,
          opacity: 0,
          duration: 0.95,
          ease: "power3.out",
          stagger: 0.11,
          scrollTrigger: { trigger: ".skills-grid", start: "top 88%", once: true },
        });
        gsap.from(".skill-pill", {
          y: 10,
          opacity: 0,
          scale: 0.96,
          duration: 0.45,
          ease: "power3.out",
          stagger: 0.035,
          scrollTrigger: { trigger: ".skills-grid", start: "top 88%", once: true },
          delay: 0.35,
        });
        gsap.fromTo(
          ".skills-grid",
          { yPercent: 1.2 },
          {
            yPercent: -1,
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
    <section ref={ref} id="skills" className="bg-transparent border-y border-white/[0.06]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-8 py-16 md:py-20">
        <p className="skills-head text-[11px] tracking-[0.2em] text-white/40 font-medium">
          SKILLS — 02
        </p>
        <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h2 className="skills-head font-display text-[34px] md:text-[52px] font-bold tracking-[-0.05em] leading-none text-white">
            WHAT I<br className="md:hidden" /> WORK WITH
          </h2>
          <p className="skills-head max-w-[40ch] text-[13px] md:text-[14px] leading-relaxed text-white/45">
            Focused stack for building fast, maintainable products — from interface to data layer.
          </p>
        </div>

        <div className="skills-grid mt-10 grid md:grid-cols-2 gap-[1px] bg-white/[0.06] rounded-[20px] overflow-hidden border border-white/[0.06] will-change-transform">
          {skillGroups.map((g) => (
            <div
              key={g.number}
              className="skill-group will-change-transform group bg-[#141414] p-6 md:p-8 hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-[0.18em] text-white/30 font-medium">
                  {g.number}
                </span>
                <span className="h-px w-12 bg-white/[0.08] group-hover:bg-white/20 transition-colors" />
                <span className="text-[10px] tracking-[0.16em] text-white/20">
                  {String(g.items.length).padStart(2, "0")} ITEMS
                </span>
              </div>

              <h3 className="mt-5 font-display text-[16px] md:text-[18px] font-semibold tracking-[-0.03em] text-white">
                {g.number} — {g.title}
              </h3>

              <div className="mt-4 flex flex-wrap gap-2">
                {g.items.map((item) => (
                  <span
                    key={item}
                    className="skill-pill will-change-transform rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[12px] leading-none tracking-[-0.01em] text-white/70 group-hover:text-white/90 group-hover:border-white/15 transition-colors"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
