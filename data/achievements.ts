export interface Achievement {
  number: string;
  title: string;
  event: string;
  year: string;
  tag: string;
  certificate?: {
    href: string;
    label: string;
  };
}

export const achievements: Achievement[] = [
  {
    number: "01",
    title: "Finalis Lomba Aplikasi Web / Mobile",
    event: "LO KREATIF",
    year: "2021",
    tag: "FINALIST",
    certificate: {
      href: "/achievements/sertifikat-finalis-lo-kreatif-3241.png",
      label: "E-Sertifikat Finalis LO Kreatif",
    },
  },
];
