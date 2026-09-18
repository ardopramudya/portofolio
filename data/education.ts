export interface EducationItem {
  year: string;
  degree: string;
  school: string;
  detail?: string;
  gpa?: string;
  location?: string;
}

export const education: EducationItem[] = [
  {
    year: "2021 — 2026",
    degree: "S1 — Teknik Informatika",
    school: "Telkom University Purwokerto",
    detail: "Bachelor of Informatics Engineering",
    gpa: "3.41",
    location: "Purwokerto Kidul, Purwokerto Selatan, Kab. Banyumas, Jawa Tengah",
  },
];
