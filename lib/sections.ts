export interface SectionDef {
  label: string;
  singular: string;
  format: "pdf" | "pdf-image";
  folder: string; // local folder di public/ dan nama bucket path
  jsonFile: string;
  tsFile: string;
  typeName: string;
  exportName: string;
  fields: Array<{ key: string; label: string }>;
  hasCertificate: boolean;
}

export const SECTIONS = {
  certifications: {
    label: "Sertifikat Keahlian",
    singular: "Sertifikat",
    format: "pdf",
    folder: "certificates",
    jsonFile: "data/certifications.json",
    tsFile: "data/certifications.ts",
    typeName: "Certification",
    exportName: "certifications",
    fields: [
      { key: "number", label: "Nomor" },
      { key: "title", label: "Judul" },
      { key: "issuer", label: "Penerbit" },
      { key: "year", label: "Tahun" },
    ],
    hasCertificate: false,
  },
  experience: {
    label: "Pengalaman",
    singular: "Pengalaman",
    format: "pdf-image",
    folder: "experience",
    jsonFile: "data/experience.json",
    tsFile: "data/experience.ts",
    typeName: "ExperienceItem",
    exportName: "experiences",
    fields: [
      { key: "number", label: "Nomor" },
      { key: "year", label: "Periode" },
      { key: "company", label: "Perusahaan" },
      { key: "location", label: "Lokasi" },
      { key: "role", label: "Posisi" },
      { key: "description", label: "Deskripsi" },
    ],
    hasCertificate: true,
  },
  achievements: {
    label: "Achievements",
    singular: "Pencapaian",
    format: "pdf-image",
    folder: "achievements",
    jsonFile: "data/achievements.json",
    tsFile: "data/achievements.ts",
    typeName: "Achievement",
    exportName: "achievements",
    fields: [
      { key: "number", label: "Nomor" },
      { key: "title", label: "Judul" },
      { key: "event", label: "Event" },
      { key: "year", label: "Tahun" },
      { key: "tag", label: "Tag" },
    ],
    hasCertificate: true,
  },
} as const satisfies Record<string, SectionDef>;

export type Section = keyof typeof SECTIONS;
export const SECTION_KEYS = Object.keys(SECTIONS) as Section[];

export function isSection(value: string): value is Section {
  return SECTION_KEYS.includes(value as Section);
}