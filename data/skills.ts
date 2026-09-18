export interface SkillGroup {
  number: string;
  title: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    number: "01",
    title: "FRONTEND DEVELOPMENT",
    items: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Web Development"],
  },
  {
    number: "02",
    title: "BACKEND DEVELOPMENT",
    items: ["Node.js", "Laravel", "REST API"],
  },
  {
    number: "03",
    title: "DATABASE",
    items: ["Supabase", "SQL / Database Management"],
  },
  {
    number: "04",
    title: "TOOLS & OTHER",
    items: ["Git", "GitHub", "Discord.js", "Google Workspace"],
  },
];
