/// <reference types="cypress" />

const STAMP = Date.now().toString().slice(-4);
const TEST_NUM = STAMP;
const TEST_TITLE = `AUTOTEST ${STAMP}`;
const TEST_ISSUER = "Cypress QA";
const TEST_YEAR = "2026";
const EDIT_TITLE = `AUTOTEST EDIT ${STAMP}`;

const ADMIN_HEADING = "Kelola Sertifikat, Pengalaman & Achievements";

function loginFlow(env) {
  cy.visit("/admin");
  cy.get("body").then(($body) => {
    const hasLoginForm = $body.find('input[type="password"]').length > 0;
    if (!hasLoginForm) return;
    if ($body.find('input[type="email"]').length > 0) {
      cy.get('input[type="email"]').type(env.ADMIN_EMAIL);
    }
    cy.get('input[type="password"]').type(env.ADMIN_PASSWORD, { log: false });
    cy.get("button").contains("MASUK").click();
  });
  return cy.contains(ADMIN_HEADING, { timeout: 20000 });
}

after(() => {
  // Bersihkan data AUTOTEST bila kredensial tersedia & valid
  cy.env(["ADMIN_EMAIL", "ADMIN_PASSWORD"]).then((env) => {
    const email = env.ADMIN_EMAIL;
    const password = env.ADMIN_PASSWORD;
    if (!email || !password) return;

    cy.request({
      method: "POST",
      url: "/api/admin/login",
      body: { email, password },
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status !== 200 || !res.body?.ok) {
        cy.log("Kredensial admin tidak valid — pembersihan di-skip.");
        return;
      }
      cy.visit("/admin");
      cy.contains(ADMIN_HEADING, { timeout: 15000 }).should("be.visible");
      cy.get("body").then(($body) => {
        if ($body.find('div:contains("AUTOTEST")').length > 0) {
          cy.contains("div", "AUTOTEST")
            .first()
            .closest("div")
            .find('button[title="Hapus"]')
            .click();
          cy.contains("div", "AUTOTEST").should("not.exist");
        }
      });
    });
  });
});

describe("Dashboard — tombol & field publik", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("semua section dirender", () => {
    cy.contains("SELECTED WORK").should("exist");
    cy.contains("CERTIFICATIONS").should("exist");
    cy.contains("ACHIEVEMENTS").should("exist");
    cy.contains("CONTACT — LET'S TALK").should("exist");
  });

  it("navbar desktop — klik links navigasi", () => {
    cy.viewport(1280, 800);
    const links = [
      ["WORK", "#work"],
      ["SKILLS", "#skills"],
      ["EXPERIENCE", "#experience"],
      ["CONTACT", "#contact"],
    ];
    links.forEach(([label, href]) => {
      cy.get(`header a[href="${href}"]`).first().should("contain", label).click();
    });
    cy.get('header a[href="#contact"]').contains("LET'S TALK").should("be.visible");
  });

  it("navbar mobile — buka/tutup menu", () => {
    cy.viewport(375, 720);
    cy.get('button[aria-label="Open menu"]').click();
    cy.get('a[href="#work"]').should("be.visible");
    cy.get('a[href="#contact"]').last().should("be.visible");
    cy.get('button[aria-label="Close menu"]').click();
    cy.get("#contact").should("exist");
  });

  it("certifications — klik item list & pratinjau berubah", () => {
    cy.get(".cert-list button").then(($btns) => {
      expect($btns.length).to.be.greaterThan(1);
      // Judul = span pertama yang memakai class "block" di dalam tombol ke-2.
      const title = $btns.eq(1).find("span.block").first().text().trim();
      cy.wrap($btns.eq(1)).click();
      cy.get(".cert-viewer h3").should("have.text", title);
      cy.get(".cert-viewer a")
        .filter('[href*="/"]')
        .first()
        .should("have.attr", "href")
        .and("not.be.empty");
    });
  });

  it("experience — toggle pratinjau sertifikat", () => {
    cy.get("button").contains("SERTIFIKAT RUMAH DIGICRAFT").click();
    cy.contains("BUKA FILE").should("be.visible");
    cy.get("button").contains("TUTUP PRATINJAU").click();
    cy.contains("BUKA FILE").should("not.exist");
  });

  it("achievements — toggle pratinjau sertifikat", () => {
    cy.get("button").contains("E-SERTIFIKAT FINALIS LO KREATIF").click();
    cy.contains("BUKA FILE").should("be.visible");
    cy.get("button").contains("TUTUP PRATINJAU").click();
  });

  it("footer — link ADMIN & BACK TO TOP", () => {
    cy.get('a[href="/admin"]').should("contain", "ADMIN");
    cy.contains("button", "BACK TO TOP").click({ force: true });
  });

  it("contact — tombol CTA punya mailto benar", () => {
    cy.contains("a", "GET IN TOUCH")
      .should("have.attr", "href")
      .and("match", /^mailto:/);
  });
});

describe("Admin panel — login, CRUD & tombol (jika kredensial tersedia & valid)", () => {
  before(function () {
    cy.env(["ADMIN_EMAIL", "ADMIN_PASSWORD"]).then((env) => {
      if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
        cy.log("ADMIN_EMAIL / ADMIN_PASSWORD tidak diset — tes admin di-skip.");
        this.skip();
        return;
      }
      cy.request({
        method: "POST",
        url: "/api/admin/login",
        body: { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD },
        failOnStatusCode: false,
      }).then((res) => {
        if (res.status !== 200 || !res.body?.ok) {
          cy.log("Kredensial admin tidak valid — tes admin di-skip.");
          this.skip();
        }
      });
    });
  });

  beforeEach(() => {
    cy.session("adminLogin", () => {
      cy.env(["ADMIN_EMAIL", "ADMIN_PASSWORD"]).then((env) => loginFlow(env));
    });
    cy.visit("/admin");
    cy.contains(ADMIN_HEADING, { timeout: 15000 }).should("be.visible");
  });

  it("tab section — klik satu per satu", () => {
    cy.contains("button", "SERTIFIKAT KEAHLIAN").click();
    cy.contains("button", "PENGALAMAN").click();
    cy.contains("button", "ACHIEVEMENTS").click();
    cy.contains("button", "SERTIFIKAT KEAHLIAN").click();
    cy.contains("TAMBAH SERTIFIKAT KEAHLIAN").should("be.visible");
  });

  it("CRUD sertifikat — tambah (upload file), edit, hapus", () => {
    // --- TAMBAH ---
    const form = cy.get("form").first();
    form.contains("label", "Nomor").next("input").clear().type(TEST_NUM);
    form.contains("label", "Judul").next("input").type(TEST_TITLE);
    form.contains("label", "Penerbit").next("input").type(TEST_ISSUER);
    form.contains("label", "Tahun").next("input").type(TEST_YEAR);
    form
      .find('input[type="file"]')
      .selectFile("cypress/fixtures/test.pdf", { force: true });
    form.contains("button", "SIMPAN").click();

    cy.contains(TEST_TITLE, { timeout: 20000 }).should("be.visible");

    // --- EDIT ---
    cy.contains(TEST_TITLE).closest("div").find('button[title="Edit"]').click();
    const editForm = cy
      .get("form")
      .filter(':has(button:contains("SIMPAN PERUBAHAN"))');
    editForm.contains("label", "Judul").next("input").clear().type(EDIT_TITLE);
    editForm.find("button").contains("SIMPAN PERUBAHAN").click();

    cy.contains(EDIT_TITLE, { timeout: 15000 }).should("be.visible");
    cy.contains(TEST_TITLE).should("not.exist");

    // --- HAPUS ---
    cy.contains(EDIT_TITLE).closest("div").find('button[title="Hapus"]').click();
    cy.contains("div", "AUTOTEST").should("not.exist");
  });

  it("logout — kembali ke form login", () => {
    cy.contains("button", "KELUAR").click();
    cy.get('input[type="password"]').should("exist");
  });
});