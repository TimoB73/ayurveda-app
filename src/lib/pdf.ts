import { jsPDF } from "jspdf";
import regularFontUrl from "../assets/fonts/NotoSans-Regular.ttf?url";
import boldFontUrl from "../assets/fonts/NotoSans-Bold.ttf?url";
import {
  DISCLAIMER,
  DOSHA_COLOR,
  DOSHA_INFO,
  DOSHA_NAME,
  GLOSSARY,
  MODE_LABEL,
  MODE_QUESTION,
  TYPE_INFO,
  kindLabel,
  typeIntro,
  typeLabel,
} from "../data/content";
import { DOSHAS } from "../schema/questions.schema";
import type { ScoringConfig } from "../schema/scoring.schema";
import { classify } from "./classify";
import { comparePrakritiVikriti } from "./compare";
import { roundPercentages } from "./scoring";
import type { SavedResult } from "./storage";

/**
 * Erzeugt das PDF vollständig im Browser (keine Datenübertragung).
 * Eingebettet ist Noto Sans (SIL Open Font License), damit Diakritika wie ā, ṛ, ṇ korrekt erscheinen.
 * Dieses Modul wird erst beim Klick auf „Als PDF herunterladen“ nachgeladen.
 */

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - 2 * MARGIN;

/** Lädt eine mitgelieferte Schriftdatei (gleiche Herkunft, keine externe Anfrage) als Base64. */
async function loadFontBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Schrift konnte nicht geladen werden: ${url}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

class Writer {
  y = MARGIN;
  constructor(public doc: jsPDF) {}

  ensure(height: number) {
    if (this.y + height > PAGE_H - MARGIN) {
      this.doc.addPage();
      this.y = MARGIN;
    }
  }

  text(str: string, opts: { size?: number; bold?: boolean; color?: string; indent?: number; gap?: number } = {}) {
    const { size = 10.5, bold = false, color = "#1c1917", indent = 0, gap = 1.5 } = opts;
    const { doc } = this;
    doc.setFont("NotoSans", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...hexToRgb(color));
    const lineH = size * 0.42;
    const lines: string[] = doc.splitTextToSize(str, CONTENT_W - indent);
    for (const line of lines) {
      this.ensure(lineH);
      doc.text(line, MARGIN + indent, this.y + lineH * 0.8);
      this.y += lineH;
    }
    this.y += gap;
  }

  bullets(items: string[]) {
    for (const item of items) {
      const { doc } = this;
      doc.setFont("NotoSans", "normal");
      doc.setFontSize(10.5);
      this.ensure(5);
      doc.setTextColor(28, 25, 23);
      doc.text("•", MARGIN + 2, this.y + 10.5 * 0.42 * 0.8);
      this.text(item, { indent: 6, gap: 0.6 });
    }
    this.y += 1.5;
  }

  heading(str: string, size = 14) {
    this.ensure(14);
    this.y += 2;
    this.text(str, { size, bold: true, gap: 2 });
  }
}

export async function exportResultPdf({
  result,
  scoring,
  comparison,
}: {
  result: SavedResult;
  scoring: ScoringConfig;
  comparison: { prakriti: SavedResult; vikriti: SavedResult } | null;
}): Promise<void> {
  const [regular, bold] = await Promise.all([loadFontBase64(regularFontUrl), loadFontBase64(boldFontUrl)]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("NotoSans-Regular.ttf", regular);
  doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  doc.addFileToVFS("NotoSans-Bold.ttf", bold);
  doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
  doc.setProperties({ title: "Ayurveda-Konstitutionstest", subject: `Ergebnis ${MODE_LABEL[result.mode]}` });

  const w = new Writer(doc);
  const c = classify(result.percentages, scoring);
  const rounded = roundPercentages(result.percentages);

  // Titel
  w.text("Ayurveda-Konstitutionstest", { size: 20, bold: true, color: "#78350f", gap: 1 });
  w.text(`Ergebnis ${MODE_LABEL[result.mode]} vom ${formatDate(result.createdAt)} – „${MODE_QUESTION[result.mode]}“`, {
    size: 10,
    color: "#57534e",
    gap: 4,
  });

  // Hinweis (Kasten)
  doc.setFont("NotoSans", "bold");
  doc.setFontSize(10.5);
  const disclaimerLines: string[] = doc.splitTextToSize(`Wichtiger Hinweis: ${DISCLAIMER}`, CONTENT_W - 8);
  const boxH = disclaimerLines.length * 4.6 + 6;
  doc.setDrawColor(180, 83, 9);
  doc.setFillColor(255, 251, 235);
  doc.setLineWidth(0.6);
  doc.roundedRect(MARGIN, w.y, CONTENT_W, boxH, 2, 2, "FD");
  doc.setTextColor(69, 26, 3);
  disclaimerLines.forEach((line, i) => doc.text(line, MARGIN + 4, w.y + 6.5 + i * 4.6));
  w.y += boxH + 6;

  // Typ
  w.text(result.mode === "prakriti" ? "Ihre Grundkonstitution (Prakṛti)" : "Ihr aktueller Zustand (Vikṛti)", {
    size: 11,
    color: "#57534e",
    gap: 0.5,
  });
  w.text(typeLabel(c.kind, c.doshas), { size: 18, bold: true, gap: 0.5 });
  w.text(kindLabel(c.kind), { size: 10.5, color: "#57534e", gap: 4 });

  // Balken
  const labelW = 22;
  const barMax = CONTENT_W - labelW - 16;
  for (const d of DOSHAS) {
    w.ensure(9);
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(28, 25, 23);
    doc.text(DOSHA_NAME[d], MARGIN, w.y + 4.5);
    doc.setFillColor(231, 229, 228);
    doc.rect(MARGIN + labelW, w.y, barMax, 6, "F");
    doc.setFillColor(...hexToRgb(DOSHA_COLOR[d]));
    if (rounded[d] > 0) doc.roundedRect(MARGIN + labelW, w.y, (barMax * rounded[d]) / 100, 6, 1, 1, "F");
    doc.text(`${rounded[d]} %`, MARGIN + labelW + barMax + 2, w.y + 4.5);
    w.y += 9;
  }
  w.y += 1;
  w.text(`Berechnet aus ${result.scored} von ${result.total} Antworten („trifft nicht zu / weiß nicht“ wird nicht gewertet).`, {
    size: 9,
    color: "#57534e",
    gap: 2,
  });
  if (c.borderline) {
    w.text("Grenzfall: Die Werte liegen zwischen zwei Typen; die Bezeichnung entspricht dem nächstliegenden Typ.", {
      size: 9.5,
      bold: true,
    });
  }
  if (result.total > 0 && result.scored / result.total < scoring.minAnsweredRatio) {
    w.text(
      `Wenig aussagekräftig: Weniger als ${Math.round(scoring.minAnsweredRatio * 100)} % der Fragen wurden gewertet.`,
      { size: 9.5, bold: true },
    );
  }

  // Beschreibung
  w.heading(result.mode === "prakriti" ? "Was bedeutet das?" : "Was steht derzeit im Vordergrund?");
  w.text(typeIntro(c.typeKey, result.mode, c.doshas));
  w.text(TYPE_INFO[c.typeKey].balanceNote);

  // Vergleich
  if (comparison) {
    const cmp = comparePrakritiVikriti(comparison.prakriti.percentages, comparison.vikriti.percentages, scoring);
    const p = roundPercentages(comparison.prakriti.percentages);
    const v = roundPercentages(comparison.vikriti.percentages);
    w.heading("Prakriti und Vikriti im Vergleich");
    w.text(
      `Prakriti vom ${formatDate(comparison.prakriti.createdAt)}, Vikriti vom ${formatDate(comparison.vikriti.createdAt)}`,
      { size: 9, color: "#57534e" },
    );
    w.bullets(
      cmp.deltas.map((d) => {
        const r = Math.round(d.delta);
        const sign = r > 0 ? "+" : r < 0 ? "−" : "±";
        return `${DOSHA_NAME[d.dosha]}: Prakriti ${p[d.dosha]} %, Vikriti ${v[d.dosha]} % (${sign}${Math.abs(r)} Pkt.)`;
      }),
    );
    if (cmp.balanced) {
      w.text("Kein Dosha ist derzeit deutlich erhöht. Ihr aktueller Zustand entspricht weitgehend Ihrer Prakriti.");
    } else {
      for (const d of cmp.elevated) {
        w.text(`${DOSHA_NAME[d.dosha]} ist derzeit erhöht.`, { bold: true, gap: 0.5 });
        w.text(`Typische Zeichen: ${DOSHA_INFO[d.dosha].imbalance.slice(0, 4).join("; ")}.`);
      }
    }
  }

  // Doshas im Detail
  for (const d of c.doshas) {
    const info = DOSHA_INFO[d];
    w.heading(info.sanskrit !== DOSHA_NAME[d] ? `${DOSHA_NAME[d]} (${info.sanskrit})` : DOSHA_NAME[d], 13);
    w.text(`Elemente: ${info.elements}. ${info.principle}`);
    w.text(`Gunas (Eigenschaften): ${info.gunas.join(", ")}`, { bold: true, gap: 2 });
    w.text("Typische Stärken", { bold: true, gap: 0.5 });
    w.bullets(info.strengths);
    w.text("Typische Zeichen eines Ungleichgewichts", { bold: true, gap: 0.5 });
    w.bullets(info.imbalance);
    w.text("Allgemeine ausgleichende Hinweise – Tagesrhythmus", { bold: true, gap: 0.5 });
    w.bullets(info.balance.rhythm);
    w.text("Klima", { bold: true, gap: 0.5 });
    w.bullets(info.balance.climate);
    w.text("Ernährungsqualitäten", { bold: true, gap: 0.5 });
    w.bullets(info.balance.nutrition);
  }

  // Begriffe
  w.heading("Begriffe", 12);
  for (const g of GLOSSARY) {
    w.text(`${g.term} (${g.simple}): ${g.text}`, { size: 9.5, gap: 1 });
  }

  // Fußzeile auf jeder Seite
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 113, 108);
    doc.text(`Selbsteinschätzung – keine medizinische Diagnose · Seite ${i} von ${pages}`, MARGIN, PAGE_H - 8);
  }

  const date = result.createdAt.slice(0, 10);
  doc.save(`ayurveda-${result.mode}-${date}.pdf`);
}
