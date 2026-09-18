"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function AnimatedBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let ctx: gsap.Context | null = null;
    import("gsap/ScrollTrigger").then((mod) => {
      gsap.registerPlugin(mod.ScrollTrigger);
      ctx = gsap.context(() => {
        // Parallax drift tied to scroll — very subtle, scrub
        gsap.to(".ab-blob-1", {
          y: 140,
          x: 18,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
          },
        });
        gsap.to(".ab-blob-2", {
          y: 220,
          x: -20,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.6,
          },
        });
        gsap.to(".ab-blob-3", {
          y: -90,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.4,
          },
        });
        // Grid drifts a bit faster on scroll too
        gsap.to(".ab-grid", {
          y: 80,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.9,
          },
        });
      }, rootRef);
    });
    return () => ctx?.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0a]"
    >
      <div className="absolute inset-0">
        <div className="ab-blob ab-blob-1 will-change-transform" />
        <div className="ab-blob ab-blob-2 will-change-transform" />
        <div className="ab-blob ab-blob-3 will-change-transform" />
      </div>
      <div className="ab-grid absolute inset-0 will-change-transform" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(900px 700px at 95% 85%, rgba(255,255,255,0.03), transparent 65%), radial-gradient(900px 700px at 0% 100%, rgba(255,255,255,0.02), transparent 65%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-[280px] bg-gradient-to-b from-black/20 to-transparent" />
    </div>
  );
}
