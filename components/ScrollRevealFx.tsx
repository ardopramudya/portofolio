"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Decorative scroll FX pinned behind content */
export default function ScrollRevealFx() {
  const wordRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    if (window.innerWidth < 768) return;
    let ctx: gsap.Context | null = null;
    import("gsap/ScrollTrigger").then((mod) => {
      gsap.registerPlugin(mod.ScrollTrigger);
      ctx = gsap.context(() => {
        if (wordRef.current) {
          gsap.fromTo(
            wordRef.current,
            { yPercent: 5, opacity: 0.03 },
            {
              yPercent: -10,
              opacity: 0.055,
              ease: "none",
              scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.8,
              },
            }
          );
        }
        if (vignetteRef.current) {
          gsap.fromTo(
            vignetteRef.current,
            { opacity: 0.16 },
            {
              opacity: 0.3,
              ease: "none",
              scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom top",
                scrub: 0.6,
              },
            }
          );
        }
      });
    });
    return () => ctx?.revert();
  }, []);

  return (
    <>
      <div
        ref={wordRef}
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-[52%] -z-[1] hidden md:flex -translate-x-1/2 -translate-y-1/2 select-none items-center justify-center overflow-hidden"
        style={{ width: "120vw" }}
      >
        <span
          className="font-display font-bold tracking-[-0.06em] leading-none text-white whitespace-nowrap will-change-transform"
          style={{ fontSize: "min(22vw, 520px)" }}
        >
          BERNARDO
        </span>
      </div>
      <div
        ref={vignetteRef}
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-[1] h-[42vh]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.07), rgba(255,255,255,0.02) 45%, transparent 82%)",
        }}
      />
    </>
  );
}
