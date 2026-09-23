-- ============================================================
-- SEED: Isi semua data portfolio ke tabel `portfolio_items`
-- Kolom: section (text), number (text), data (jsonb)
-- Jalankan langsung di Supabase SQL Editor.
-- ============================================================

-- (OPSIONAL) Hapus data lama dulu jika ingin reset:
-- delete from portfolio_items;

-- ========== CERTIFICATIONS (5 item) ==========
insert into portfolio_items (section, number, data) values
  ('certifications', '01', '{"number":"01","title":"Belajar Dasar Pemrograman Web","issuer":"Dicoding Indonesia","year":"2026","href":"/certificates/sertifikat_course_123_602340_230826220442.pdf"}'::jsonb),
  ('certifications', '02', '{"number":"02","title":"Belajar Membuat Front-End Web untuk Pemula","issuer":"Dicoding Indonesia","year":"2026","href":"/certificates/sertifikat_course_256_602340_050826212652.pdf"}'::jsonb),
  ('certifications', '03', '{"number":"03","title":"Belajar Dasar Pemrograman JavaScript","issuer":"Dicoding Indonesia","year":"2026","href":"/certificates/sertifikat_course_315_602340_050826212726.pdf"}'::jsonb),
  ('certifications', '04', '{"number":"04","title":"Belajar Dasar AI","issuer":"Dicoding Indonesia","year":"2026","href":"/certificates/sertifikat_course_600_602340_090826213535.pdf"}'::jsonb),
  ('certifications', '05', '{"number":"05","title":"Memulai Pemrograman dengan Python","issuer":"Dicoding Indonesia","year":"2026","href":"/certificates/sertifikat_course_653_602340_070826130946.pdf"}'::jsonb);

-- ========== EXPERIENCE (2 item) ==========
insert into portfolio_items (section, number, data) values
  ('experience', '01', '{"number":"01","year":"April 2026 — Mei 2026","company":"RUMAH DIGICRAFT","location":"Sumampir, Purwokerto Utara, Kab. Banyumas, Jawa Tengah","role":"Front End Developer","description":"Developing modern websites with responsive design, implementing interactive frontend interfaces, and contributing to web development projects.","certificate":{"href":"/experience/sertifikat-rumah-digicraft-bernardo.pdf","label":"Sertifikat Rumah Digicraft"}}'::jsonb),
  ('experience', '02', '{"number":"02","year":"Agustus 2024 — Oktober 2024","company":"PT ANGKASA PURA INDONESIA (PERSERO) — BANDARA INTERNASIONAL YOGYAKARTA","location":"Palihan, Temon, Kab. Kulon Progo, Daerah Istimewa Yogyakarta","role":"Airport Technology Section","description":"Magang di seksi Airport Technology, mendukung operasional dan sistem teknologi bandara di Yogyakarta International Airport — Kulon Progo.","certificate":{"href":"/experience/sertifikat-angkasa-pura-yogyakarta.pdf","label":"Sertifikat PKL Angkasa Pura Yogyakarta"}}'::jsonb);

-- ========== ACHIEVEMENTS (1 item) ==========
insert into portfolio_items (section, number, data) values
  ('achievements', '01', '{"number":"01","title":"Finalis Lomba Aplikasi Web / Mobile","event":"LO KREATIF","year":"2021","tag":"FINALIST","certificate":{"href":"/achievements/sertifikat-finalis-lo-kreatif-3241.png","label":"E-Sertifikat Finalis LO Kreatif"}}'::jsonb);

-- ========== PROJECTS (3 item) ==========
insert into portfolio_items (section, number, data) values
  ('projects', '01', '{"number":"01","name":"H4L","category":"Creative Digital Studio","tech":"Next.js · Tailwind CSS · Vercel","description":"Premium digital visuals, branding, motion graphics and creative assets for creators, communities and digital brands.","href":"https://h4l-zeta.vercel.app/","year":"2026"}'::jsonb),
  ('projects', '02', '{"number":"02","name":"CVROASTER","category":"AI Platform","tech":"React · Firebase · AI","description":"AI-powered platform to score & analyze ATS-friendly CVs — brutal roast, detailed insights, and actionable feedback.","href":"https://cvroaster.id/","year":"2026"}'::jsonb),
  ('projects', '03', '{"number":"03","name":"COMING SOON","category":"Web Application","tech":"Next.js · TypeScript","description":"New product in the making — crafted with precision and modern engineering.","href":"#","year":"2026"}'::jsonb);
