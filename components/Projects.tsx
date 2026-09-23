"use client";

import { useEffect, useState } from "react";
import { projects as staticProjects } from "@/data/projects";
import type { Project } from "@/data/projects";
import ProjectCard from "./ProjectCard";

export default function Projects() {
  const [list, setList] = useState<Project[]>(staticProjects);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/projects", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length) setList(data as Project[]);
      })
      .catch(() => {
        /* pakai data statis */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="work" className="bg-transparent border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-8 py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h2 className="font-display text-[34px] md:text-[52px] font-bold tracking-[-0.05em] leading-none text-white">
            SELECTED WORK
            <span className="align-super text-[14px] tracking-[0.18em] font-medium text-white/30 ml-3">
              ({String(list.length).padStart(2, "0")})
            </span>
          </h2>
          <p className="max-w-[36ch] text-[13px] md:text-[14px] leading-relaxed text-white/45">
            A curated set of recent builds — from platforms to systems. Each one crafted for performance,
            usability, and scale.
          </p>
        </div>

        <div className="mt-10 md:mt-14">
          {list.map((p, i) => (
            <ProjectCard key={p.number} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}