import type { Dosha, Mode } from "../schema/questions.schema";
import type { TypeKey } from "../lib/classify";

/**
 * Fachtexte der Ergebnisseite.
 * Sanskrit-Begriffe werden auf jeder Seite einmal mit Diakritika eingeführt
 * (siehe GLOSSARY) und danach in vereinfachter Schreibweise verwendet.
 */

export const DOSHA_NAME: Record<Dosha, string> = {
  vata: "Vata",
  pitta: "Pitta",
  kapha: "Kapha",
};

export const DOSHA_SHORT: Record<Dosha, string> = { vata: "V", pitta: "P", kapha: "K" };

/** Farben mit Kontrast ≥ 4,5 : 1 auf Weiß (WCAG AA) */
export const DOSHA_COLOR: Record<Dosha, string> = {
  vata: "#3a64c8",
  pitta: "#c2410c",
  kapha: "#0f7a5a",
};

export const MODE_LABEL: Record<Mode, string> = {
  prakriti: "Prakriti",
  vikriti: "Vikriti",
};

export const MODE_QUESTION: Record<Mode, string> = {
  prakriti: "Wie war es die meiste Zeit Ihres Lebens?",
  vikriti: "Wie ist es in den letzten Wochen?",
};

export const MODE_DESCRIPTION: Record<Mode, string> = {
  prakriti:
    "Ihre angeborene Grundkonstitution – sie bleibt ein Leben lang stabil. Antworten Sie so, wie es die meiste Zeit Ihres Lebens war, nicht nur in letzter Zeit.",
  vikriti:
    "Ihr aktueller Zustand – zeigt, welches Dosha derzeit aus dem Gleichgewicht geraten ist. Antworten Sie so, wie es in den letzten 4–6 Wochen war.",
};

export const GLOSSARY: { term: string; simple: string; text: string }[] = [
  {
    term: "Doṣa",
    simple: "Dosha",
    text: "Eine der drei funktionellen Grundkräfte im Ayurveda: Vāta, Pitta und Kapha.",
  },
  {
    term: "Prakṛti",
    simple: "Prakriti",
    text: "Die angeborene Grundkonstitution – das individuelle Verhältnis der Doshas, lebenslang stabil.",
  },
  {
    term: "Vikṛti",
    simple: "Vikriti",
    text: "Der aktuelle Zustand – die Abweichung von der Prakriti, etwa durch Jahreszeit, Ernährung oder Stress.",
  },
  {
    term: "Guṇa",
    simple: "Guna",
    text: "Eigenschaft oder Qualität (z. B. trocken, heiß, schwer), die ein Dosha kennzeichnet. Gleiches verstärkt Gleiches, Gegensätzliches gleicht aus.",
  },
];

export interface DoshaInfo {
  /** Schreibweise mit Diakritika für die Ersteinführung */
  sanskrit: string;
  elements: string;
  gunas: string[];
  principle: string;
  strengths: string[];
  imbalance: string[];
  balance: {
    rhythm: string[];
    climate: string[];
    nutrition: string[];
  };
}

export const DOSHA_INFO: Record<Dosha, DoshaInfo> = {
  vata: {
    sanskrit: "Vāta",
    elements: "Äther (Raum) und Luft",
    gunas: ["trocken", "leicht", "kalt", "rau", "beweglich"],
    principle: "Prinzip der Bewegung: Atmung, Kreislauf, Nervenimpulse, Ausscheidung.",
    strengths: [
      "Kreativität und Ideenreichtum",
      "schnelle Auffassungsgabe",
      "Begeisterungsfähigkeit",
      "Beweglichkeit und Anpassungsfähigkeit",
      "Kommunikationsfreude",
    ],
    imbalance: [
      "trockene Haut, spröde Lippen und Nägel",
      "Blähungen oder Verstopfung",
      "Ein- und Durchschlafstörungen",
      "innere Unruhe, Sorgen, Ängstlichkeit",
      "kalte Hände und Füße",
      "schnelle Erschöpfung, ungewollter Gewichtsverlust",
    ],
    balance: {
      rhythm: [
        "feste Zeiten für Mahlzeiten, Arbeit und Schlaf",
        "früh zu Bett gehen (vor 22 Uhr)",
        "sanfte, regelmäßige Bewegung wie Spazierengehen oder ruhiges Yoga",
        "warme Ölmassagen und bewusste Ruhephasen",
      ],
      climate: [
        "Wärme suchen, vor Wind, Kälte und Zugluft schützen",
        "im Herbst und Frühwinter besonders auf Ausgleich achten",
      ],
      nutrition: [
        "Qualitäten: warm, gekocht, leicht ölig, feucht, nährend",
        "Geschmacksrichtungen: süß, sauer, salzig",
        "weniger: kalte, rohe, trockene Speisen sowie viel Kaffee",
      ],
    },
  },
  pitta: {
    sanskrit: "Pitta",
    elements: "Feuer und Wasser",
    gunas: ["heiß", "scharf", "leicht ölig", "intensiv"],
    principle: "Prinzip der Umwandlung: Verdauung, Stoffwechsel, Körperwärme, Urteilskraft.",
    strengths: [
      "Zielstrebigkeit und Entschlusskraft",
      "Konzentrationsfähigkeit und scharfer Verstand",
      "Organisationstalent und Führungsstärke",
      "kräftige Verdauung",
      "Mut und Begeisterung für Herausforderungen",
    ],
    imbalance: [
      "Sodbrennen, Übersäuerung, weicher Stuhl",
      "Hautrötungen oder -ausschläge",
      "starkes Hitzegefühl, übermäßiges Schwitzen",
      "Gereiztheit, Ungeduld, Neigung zu Kritik",
      "Perfektionismus und Überarbeitung",
      "Heißhunger, Gereiztheit bei ausgelassenen Mahlzeiten",
    ],
    balance: {
      rhythm: [
        "regelmäßige Pausen einplanen, Mahlzeiten nicht auslassen",
        "die Hauptmahlzeit zur Mittagszeit einnehmen",
        "Anstrengung in der Mittagshitze vermeiden",
        "Zeit ohne Leistungsdruck: Natur, Wasser, gemeinsames Lachen",
      ],
      climate: [
        "Kühle und Schatten suchen, pralle Sonne meiden",
        "im Sommer und Frühherbst besonders auf Ausgleich achten",
      ],
      nutrition: [
        "Qualitäten: kühlend (nicht eiskalt), mild, mäßig ölig",
        "Geschmacksrichtungen: süß, bitter, herb",
        "weniger: scharfe, saure, salzige und frittierte Speisen sowie Alkohol",
      ],
    },
  },
  kapha: {
    sanskrit: "Kapha",
    elements: "Wasser und Erde",
    gunas: ["schwer", "kühl", "ölig", "stabil", "weich"],
    principle: "Prinzip der Struktur: Körperbau, Zusammenhalt, Gelenkschmiere, Abwehrkraft.",
    strengths: [
      "Ausdauer und körperliche Stabilität",
      "Gelassenheit und Geduld",
      "Loyalität und Fürsorglichkeit",
      "gutes Langzeitgedächtnis",
      "starke Abwehrkraft",
    ],
    imbalance: [
      "Trägheit und Antriebslosigkeit",
      "Gewichtszunahme, Wassereinlagerungen",
      "Schweregefühl und Müdigkeit nach dem Essen",
      "verschleimte Atemwege",
      "langer Schlaf ohne Erholung",
      "Festhalten an Gewohnheiten und Dingen",
    ],
    balance: {
      rhythm: [
        "früh aufstehen (möglichst vor 6 Uhr), kein Mittagsschlaf",
        "täglich anregende Bewegung, gern bis zum leichten Schwitzen",
        "Abwechslung und neue Reize in den Alltag bringen",
      ],
      climate: [
        "Wärme und Trockenheit suchen, nasskaltes Wetter meiden",
        "im Spätwinter und Frühling besonders auf Ausgleich achten",
      ],
      nutrition: [
        "Qualitäten: leicht, warm, trocken, anregend gewürzt",
        "Geschmacksrichtungen: scharf, bitter, herb",
        "weniger: süße, saure, salzige, schwere und fettreiche Speisen; ein leichtes, frühes Abendessen",
      ],
    },
  },
};

export interface TypeInfo {
  /** Kurzer Einführungstext zum Konstitutionstyp */
  intro: string;
  /** Typübergreifender Ausgleichshinweis */
  balanceNote: string;
}

export const TYPE_INFO: Record<TypeKey, TypeInfo> = {
  vata: {
    intro:
      "Vata prägt Ihre Konstitution deutlich. Typisch sind ein leichter Körperbau, ein reger Geist und wechselhafte Energie.",
    balanceNote:
      "Ausgleichend wirkt alles, was den Vata-Gunas entgegengesetzt ist: Wärme, Regelmäßigkeit, Ruhe und nährende, leicht ölige Kost.",
  },
  pitta: {
    intro:
      "Pitta prägt Ihre Konstitution deutlich. Typisch sind ein mittlerer, gut proportionierter Körperbau, eine kräftige Verdauung und ein zielgerichteter Geist.",
    balanceNote:
      "Ausgleichend wirkt alles, was den Pitta-Gunas entgegengesetzt ist: Kühle, Gelassenheit, Mäßigung und milde Kost.",
  },
  kapha: {
    intro:
      "Kapha prägt Ihre Konstitution deutlich. Typisch sind ein kräftiger, stabiler Körperbau, gleichmäßige Ausdauer und ein ruhiges Gemüt.",
    balanceNote:
      "Ausgleichend wirkt alles, was den Kapha-Gunas entgegengesetzt ist: Anregung, Bewegung, Wärme und leichte, trockene Kost.",
  },
  "vata-pitta": {
    intro:
      "Vata und Pitta prägen Ihre Konstitution gemeinsam. Beide teilen die Qualität „leicht“; sie unterscheiden sich vor allem in kalt (Vata) und heiß (Pitta).",
    balanceNote:
      "Regelmäßigkeit und Ruhe gleichen beide Doshas aus; der süße Geschmack wirkt auf beide ausgleichend. Achten Sie im Herbst und Winter stärker auf Vata, im Sommer stärker auf Pitta.",
  },
  "pitta-kapha": {
    intro:
      "Pitta und Kapha prägen Ihre Konstitution gemeinsam. Beide teilen die Qualität „ölig“; sie unterscheiden sich vor allem in heiß und leicht (Pitta) gegenüber kühl und schwer (Kapha).",
    balanceNote:
      "Bitterer und herber Geschmack sowie regelmäßige Bewegung gleichen beide Doshas aus. Achten Sie im Sommer stärker auf Pitta, im Spätwinter und Frühling stärker auf Kapha.",
  },
  "vata-kapha": {
    intro:
      "Vata und Kapha prägen Ihre Konstitution gemeinsam. Beide teilen die Qualität „kalt“; sie unterscheiden sich vor allem in leicht und trocken (Vata) gegenüber schwer und ölig (Kapha).",
    balanceNote:
      "Wärme in jeder Form – Klima, Speisen, Gewürze – gleicht beide Doshas aus. Achten Sie im Herbst und Frühwinter stärker auf Vata, im Spätwinter und Frühling stärker auf Kapha.",
  },
  tridosha: {
    intro:
      "Alle drei Doshas sind bei Ihnen annähernd gleich stark ausgeprägt (Tridosha, klassisch auch Sama-Prakriti genannt). Diese Konstitution gilt als gut ausgewogen und anpassungsfähig.",
    balanceNote:
      "Da jedes Dosha aus dem Gleichgewicht geraten kann, richten Sie sich nach der Jahreszeit und Ihrem aktuellen Befinden: Der Vikriti-Test zeigt, welches Dosha derzeit erhöht ist.",
  },
};

export function typeLabel(kind: "single" | "dual" | "tri", doshas: Dosha[]): string {
  if (kind === "tri") return "Vata-Pitta-Kapha (Tridosha)";
  return doshas.map((d) => DOSHA_NAME[d]).join("-");
}

export function kindLabel(kind: "single" | "dual" | "tri"): string {
  return kind === "single" ? "Eindosha-Typ" : kind === "dual" ? "Doppeldosha-Typ" : "Tridosha-Typ";
}

export const DISCLAIMER =
  "Dies ist eine Selbsteinschätzung und keine medizinische Diagnose. Eine verlässliche Bestimmung erfolgt durch eine ausgebildete Ayurveda-Fachperson (u. a. mit Pulsdiagnose).";

/** Einführungstext je nach Modus: Die Prakriti beschreibt die Grundkonstitution, die Vikriti nur den aktuellen Zustand. */
export function typeIntro(typeKey: TypeKey, mode: Mode, doshas: Dosha[]): string {
  if (mode === "prakriti") return TYPE_INFO[typeKey].intro;
  if (typeKey === "tridosha") {
    return "Derzeit sind alle drei Doshas annähernd gleich stark ausgeprägt; keine Qualität überwiegt deutlich.";
  }
  const names = doshas.map((d) => DOSHA_NAME[d]);
  return names.length === 1
    ? `Derzeit überwiegen bei Ihnen die Qualitäten von ${names[0]}.`
    : `Derzeit überwiegen bei Ihnen die Qualitäten von ${names[0]} und ${names[1]} (${names[0]} etwas stärker).`;
}
