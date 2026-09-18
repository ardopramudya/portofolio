"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { education } from "@/data/education";

export default function Education() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let ctx: gsap.Context | null = null;
    import("gsap/ScrollTrigger").then((mod) => {
      gsap.registerPlugin(mod.ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(".edu-head", {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
        gsap.from(".edu-item", {
          y: 22,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: ".edu-list", start: "top 88%", once: true },
        });
      }, ref);
    });
    return () => ctx?.revert();
  }, []);

  return (
    <section ref={ref} id="education" className="bg-transparent border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-8 py-16 md:py-20">
        <p className="edu-head text-[11px] tracking-[0.2em] text-white/40 font-medium">
          EDUCATION — 04
        </p>
        <h2 className="edu-head mt-3 font-display text-[34px] md:text-[52px] font-bold tracking-[-0.05em] leading-none text-white">
          EDUCATION
        </h2>

        <div className="edu-list mt-10">
          {education.map((item) => (
            <div
              key={item.school + item.year}
              className="edu-item grid lg:grid-cols-[200px_1fr_auto] gap-6 md:gap-8 py-8 border-t border-white/[0.07] items-start"
            >
              <div>
                <div className="font-display text-[18px] md:text-[20px] font-bold tracking-[-0.04em] leading-none text-white">
                  {item.year}
                </div>
                {item.gpa && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                    <span className="text-[10px] tracking-[0.14em] text-white/40">IPK</span>
                    <span className="font-display text-[13px] font-bold tracking-[-0.02em] text-white">
                      {item.gpa}
                    </span>
                    <span className="text-[10px] text-white/25">/ 4.00</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-[15px] md:text-[17px] font-semibold tracking-[-0.02em] text-white">
                  {item.degree}
                </h3>
                <p className="mt-1 text-[13px] md:text-[14px] text-white/60">{item.school}</p>
                {item.location && (
                  <p className="mt-2 text-[11px] tracking-[0.08em] leading-relaxed text-white/25 max-w-[42ch]">
                    {item.location}
                  </p>
                )}
                {item.detail && (
                  <p className="mt-2 text-[11px] tracking-[0.12em] text-white/30">{item.detail}</p>
                )}
              </div>

              <div className="text-[11px] tracking-[0.16em] text-white/25 lg:text-right whitespace-nowrap">
                PURWOKERTO · ID
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
