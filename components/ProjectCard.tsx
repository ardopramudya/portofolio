"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/data/projects";
import gsap from "gsap";

export default function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let ctx: gsap.Context | null = null;
    import("gsap/ScrollTrigger").then((mod) => {
      gsap.registerPlugin(mod.ScrollTrigger);
      ctx = gsap.context(() => {
        const el = cardRef.current;
        if (!el) return;

        // Border draws
        gsap.from(el, {
          // @ts-ignore — css var trick for border draw via clip
          clipPath: "inset(0 100% 0 0)",
          duration: 1.1,
          ease: "power4.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });

        // Card lift
        gsap.from(el, {
          y: 48,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });

        // Media — entrance scale + subtle reveal
        const media = el.querySelector(".pc-media") as HTMLElement | null;
        if (media) {
          gsap.from(media, {
            scale: 0.985,
            y: 16,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            delay: 0.08,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
          // Inner image parallax
          if (imgRef.current) {
            gsap.fromTo(
              imgRef.current,
              { yPercent: -7, scale: 1.04 },
              {
                yPercent: 7,
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: el,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.9,
                },
              }
            );
          }
          // Subtle tilt on scroll for depth
          gsap.fromTo(
            media,
            { rotateX: 0 },
            {
              rotateX: 0,
              yPercent: 0,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            }
          );
        }

        // Text stagger — direction based on layout
        const textEls = el.querySelectorAll(".pc-stagger");
        if (textEls.length) {
          gsap.from(textEls, {
            y: 18,
            opacity: 0,
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.07,
            delay: 0.14,
            scrollTrigger: { trigger: el, start: "top 84%", once: true },
          });
        }
      }, cardRef);
    });
    return () => ctx?.revert();
  }, []);

  const isReverse = index % 2 === 1;

  return (
    <article
      ref={cardRef}
      className="group border-t border-white/[0.07] py-10 md:py-14"
    >
      <div
        className={`flex flex-col gap-8 md:gap-10 lg:gap-16 ${
          isReverse ? "lg:flex-row-reverse" : "lg:flex-row"
        }`}
      >
        {/* Image */}
        <div className="pc-media lg:w-[58%] overflow-hidden rounded-[20px] md:rounded-[24px] bg-[#141414] border border-white/[0.06] will-change-transform">
          <div
            ref={imgRef}
            className="relative aspect-[16/10] md:aspect-[16/10] overflow-hidden will-change-transform"
          >
            {/* placeholder visual */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#141414] to-[#0f0f0f]" />
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent 0 28px, rgba(255,255,255,0.5) 28px 29px)`
            }}/>
            {/* centered label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <span className="text-[10px] tracking-[0.22em] text-white/30 font-medium">
                {project.category.toUpperCase()} · {project.year}
              </span>
              <span className="mt-4 font-display text-[28px] md:text-[40px] font-bold tracking-[-0.04em] text-white/90 leading-none">
                {project.name}
              </span>
              <span className="mt-3 text-[12px] tracking-[0.14em] text-white/25">
                {project.tech}
              </span>
              <span className="mt-8 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 text-lg group-hover:bg-white group-hover:text-black group-hover:border-white transition-colors">
                ↗
              </span>
            </div>

            {/* hover scale layer */}
            <div className="absolute inset-0 bg-white/[0.00] group-hover:bg-white/[0.02] transition-colors duration-500" />
          </div>
        </div>

        {/* Text */}
        <div className="lg:w-[42%] flex flex-col justify-center py-2">
          <div className="pc-stagger flex items-center gap-4">
            <span className="font-display text-[13px] tracking-[0.18em] text-white/30">
              {project.number}
            </span>
            <span className="h-px flex-1 bg-white/[0.08] max-w-[80px]" />
            <span className="text-[11px] tracking-[0.16em] text-white/40">
              {project.year}
            </span>
          </div>

          <h3 className="pc-stagger mt-4 font-display text-[36px] md:text-[44px] font-bold tracking-[-0.05em] leading-[0.9] text-white">
            {project.name}
          </h3>

          <div className="pc-stagger mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] tracking-[0.14em] text-white/60">
              {project.category}
            </span>
            <span className="text-[11px] tracking-[0.12em] text-white/25">
              {project.tech}
            </span>
          </div>

          <p className="pc-stagger mt-5 max-w-[44ch] text-[14px] md:text-[15px] leading-relaxed text-white/55">
            {project.description}
          </p>

          <a
            href={project.href}
            target={project.href.startsWith("http") ? "_blank" : undefined}
            rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="pc-stagger mt-8 inline-flex items-center gap-2 text-[12px] tracking-[0.14em] font-medium text-white hover:text-white/70 transition-colors"
          >
            VIEW PROJECT
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-[11px] group-hover:bg-white group-hover:text-black group-hover:border-white transition-colors">
              ↗
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}
