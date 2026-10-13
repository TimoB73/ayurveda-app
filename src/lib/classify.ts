import { DOSHAS, type Dosha } from "../schema/questions.schema";
import type { ScoringConfig } from "../schema/scoring.schema";
import type { DoshaValues } from "./scoring";

export type ConstitutionKind = "single" | "dual" | "tri";

/** Schlüssel der 7 klassischen Konstitutionstypen (Reihenfolge der Doshas kanonisch V–P–K). */
export type TypeKey = "vata" | "pitta" | "kapha" | "vata-pitta" | "pitta-kapha" | "vata-kapha" | "tridosha";

/** Welche Regel aus scoring.json gegriffen hat – „fallback“ = keine Regel, nächstliegender Typ. */
export type MatchedRule = "tri" | "single" | "dual" | "fallback";

export interface Classification {
  kind: ConstitutionKind;
  /** Beteiligte Doshas, nach Anteil absteigend (dominantes zuerst) */
  doshas: Dosha[];
  typeKey: TypeKey;
  matchedRule: MatchedRule;
  /** true bei Ersatzregel oder Gleichstand, der die Benennung beeinflusst */
  borderline: boolean;
}

/** Toleranz für Gleitkomma-Vergleiche an den Schwellwerten */
const EPS = 1e-9;
const gte = (a: number, b: number) => a >= b - EPS;
const lte = (a: number, b: number) => a <= b + EPS;
const eq = (a: number, b: number) => Math.abs(a - b) <= EPS;

/** Sortiert absteigend nach Anteil; bei Gleichstand gilt die feste Reihenfolge Vata > Pitta > Kapha. */
export function rankDoshas(p: DoshaValues): Dosha[] {
  return [...DOSHAS].sort((a, b) => {
    if (!eq(p[a], p[b])) return p[b] - p[a];
    return DOSHAS.indexOf(a) - DOSHAS.indexOf(b);
  });
}

export function typeKeyFor(kind: ConstitutionKind, doshas: Dosha[]): TypeKey {
  if (kind === "tri") return "tridosha";
  if (kind === "single") return doshas[0];
  const canonical = [...doshas].sort((a, b) => DOSHAS.indexOf(a) - DOSHAS.indexOf(b));
  return canonical.join("-") as TypeKey;
}

/**
 * Bestimmt den Konstitutionstyp aus Prozentanteilen.
 *
 * Prüfreihenfolge: Tridosha → Eindosha → Doppeldosha → Ersatzregel.
 * Ersatzregel (keine Regel passt): Liegt das höchste Dosha mindestens
 * `single.minGap` Punkte vor dem zweiten, gilt Eindosha, sonst Doppeldosha
 * aus den beiden stärksten. Das Ergebnis wird dann als Grenzfall markiert.
 */
export function classify(p: DoshaValues, config: ScoringConfig): Classification {
  const ranked = rankDoshas(p);
  const [first, second, third] = ranked;
  const top = p[first];
  const mid = p[second];
  const low = p[third];
  const gap = top - mid;
  // Gleichstand zwischen Platz 2 und 3: Welches Dosha im Doppeltyp landet, entscheidet nur die Reihenfolge.
  const tieForSecond = eq(mid, low);
  // Gleichstand zwischen Platz 1 und 2: Welches Dosha als Eindosha gilt, wäre willkürlich.
  const tieForFirst = eq(top, mid);

  const make = (kind: ConstitutionKind, matchedRule: MatchedRule, borderline: boolean): Classification => {
    const doshas = kind === "tri" ? ranked : kind === "single" ? [first] : [first, second];
    return { kind, doshas, typeKey: typeKeyFor(kind, doshas), matchedRule, borderline };
  };

  const { tri, single, dual } = config;
  if (DOSHAS.every((d) => gte(p[d], tri.min) && lte(p[d], tri.max))) {
    return make("tri", "tri", false);
  }
  if (gte(top, single.minTop) && gte(gap, single.minGap)) {
    return make("single", "single", false);
  }
  if (lte(gap, dual.maxGap) && gte(top + mid, dual.minSum)) {
    return make("dual", "dual", tieForSecond);
  }
  if (gte(gap, single.minGap) && !tieForFirst) {
    return make("single", "fallback", true);
  }
  return make("dual", "fallback", true);
}
