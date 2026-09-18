"use client";

import { useEffect } from "react";
import gsap from "gsap";

/**
 * Fade in / fade out KHUSUS pas di-scroll (scrub).
 * - Tidak ada animasi auto pas load — kalau belum scroll, hero tetap kelihatan,
 *   section lain di bawah tetap hidden sampai kescroll mendekat.
 * - Satu timeline per section (scrub) = tidak ada 2 tween yang berantem di property yang sama.
 * - Hero: cuma fade-out + blur scrub pas discroll turun.
 */
export default function ScrollSectionFade() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: gsap.Context | null = null;

    import("gsap/ScrollTrigger").then((mod) => {
      gsap.registerPlugin(mod.ScrollTrigger);

      const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
      const footer = document.querySelector<HTMLElement>("footer");
      if (!sections.length) return;

      ctx = gsap.context(() => {
        sections.forEach((sec) => {
          const inner = (sec.firstElementChild as HTMLElement | null) ?? sec;
          const isHero = sec.getAttribute("aria-label") === "Hero";

          if (isHero) {
            // Hero cuma fade-out scrub — tanpa fade-in, jadi pas load langsung kelihatan 1:1
            gsap.fromTo(
              inner,
              { autoAlpha: 1, filter: "blur(0px)", y: 0 },
              {
                autoAlpha: 0.16,
                filter: "blur(5px)",
                y: -30,
                ease: "none",
                scrollTrigger: {
                  trigger: sec,
                  start: "top top",
                  end: "bottom 18%",
                  scrub: 1,
                },
              }
            );
            return;
          }

          // Satu timeline = satu ScrollTrigger yang kontrol fade in → hold → fade out
          // Range panjang: dari section baru nyentuh bawah viewport sampai sudah lewat atas
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sec,
              start: "top 95%",
              end: "bottom -12%",
              scrub: 1.1,
            },
          });

          // 0% — 32% timeline: fade IN + lift + blur in (pas section masuk)
          tl.fromTo(
            inner,
            { autoAlpha: 0, y: 30, filter: "blur(10px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", ease: "none", duration: 0.32 },
            0
          );
          // 32% — 64% timeline: hold (tetap kelihatan jelas)
          tl.to(inner, { autoAlpha: 1, y: 0, filter: "blur(0px)", ease: "none", duration: 0.32 }, 0.32);
          // 64% — 100% timeline: fade OUT + lift + blur pas lewat ke atas
          tl.to(
            inner,
            { autoAlpha: 0.28, y: -24, filter: "blur(7px)", ease: "none", duration: 0.36 },
            0.64
          );
        });

        if (footer) {
          const fInner = (footer.firstElementChild as HTMLElement | null) ?? footer;
          const ftl = gsap.timeline({
            scrollTrigger: {
              trigger: footer,
              start: "top 96%",
              end: "top 62%",
              scrub: 0.9,
            },
          });
          ftl.fromTo(
            fInner,
            { autoAlpha: 0, y: 18, filter: "blur(8px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", ease: "none", duration: 1 },
            0
          );
        }

        mod.ScrollTrigger.refresh();
      });
    });

    return () => ctx?.revert();
  }, []);

  return null;
}
