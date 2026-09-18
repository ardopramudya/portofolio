"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const year = 2026;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let ctx: gsap.Context | null = null;
    import("gsap/ScrollTrigger").then((mod) => {
      gsap.registerPlugin(mod.ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(".footer-line", {
          scaleX: 0,
          transformOrigin: "0 0",
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 98%", once: true },
        });
        gsap.from(".footer-item", {
          y: 12,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 96%", once: true },
        });
      }, ref);
    });
    return () => ctx?.revert();
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer ref={ref} className="bg-transparent border-t border-white/[0.06] overflow-hidden">
      <div className="footer-line h-px bg-white/[0.06] origin-left" />
      <div className="mx-auto max-w-[1440px] px-6 md:px-8 h-[72px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <span className="footer-item font-display text-[14px] font-bold tracking-[-0.03em] text-white">
            BERNARDO
          </span>
          <span className="footer-item hidden sm:inline text-[11px] tracking-[0.14em] text-white/25">
            © {year} All Rights Reserved.
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/admin"
            className="footer-item hidden md:inline text-[11px] tracking-[0.16em] font-medium text-white/30 hover:text-white transition-colors"
          >
            ADMIN ↗
          </a>
          <button
            onClick={scrollTop}
            className="footer-item inline-flex items-center gap-2 text-[11px] tracking-[0.16em] font-medium text-white/60 hover:text-white transition-colors"
          >
            BACK TO TOP <span className="text-[11px]">↗</span>
          </button>
        </div>
      </div>
      <div className="footer-item sm:hidden px-6 pb-4 text-[11px] tracking-[0.14em] text-white/25">
        © {year} All Rights Reserved.
      </div>
    </footer>
  );
}
