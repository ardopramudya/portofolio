export interface ExperienceItem {
  number: string;
  year: string;
  company: string;
  location: string;
  role: string;
  description: string;
  certificate?: {
    href: string;
    label: string;
  };
}

// File ini digenerate otomatis oleh admin panel. Jangan edit manual.
export const experiences: ExperienceItem[] = [
  {"number":"01","year":"April 2026 — Mei 2026","company":"RUMAH DIGICRAFT","location":"Sumampir, Purwokerto Utara, Kab. Banyumas, Jawa Tengah","role":"Front End Developer","description":"Developing modern websites with responsive design, implementing interactive frontend interfaces, and contributing to web development projects.","certificate":{"href":"/experience/sertifikat-rumah-digicraft-bernardo.pdf","label":"Sertifikat Rumah Digicraft"}},
  {"number":"02","year":"Agustus 2024 — Oktober 2024","company":"PT ANGKASA PURA INDONESIA (PERSERO) — BANDARA INTERNASIONAL YOGYAKARTA","location":"Palihan, Temon, Kab. Kulon Progo, Daerah Istimewa Yogyakarta","role":"Airport Technology Section","description":"Magang di seksi Airport Technology, mendukung operasional dan sistem teknologi bandara di Yogyakarta International Airport — Kulon Progo.","certificate":{"href":"/experience/sertifikat-angkasa-pura-yogyakarta.pdf","label":"Sertifikat PKL Angkasa Pura Yogyakarta"}},
];
