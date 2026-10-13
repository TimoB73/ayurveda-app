import { DOSHAS, type Dosha, type Mode, type Question } from "../schema/questions.schema";
import type { ScoringConfig } from "../schema/scoring.schema";
import { classify, type Classification } from "./classify";

/** Antwort auf eine Frage: ein Dosha oder „trifft nicht zu / weiß nicht“. */
export type Answer = Dosha | "na";
export type Answers = Record<string, Answer>;
export type DoshaValues = Record<Dosha, number>;

export interface Evaluation {
  /** Anzahl gewerteter Antworten je Dosha */
  counts: DoshaValues;
  /** Prozentanteile (ungerundet, Summe 100) – alle 0, wenn nichts gewertet wurde */
  percentages: DoshaValues;
  /** gewertete Antworten (ohne „weiß nicht“) */
  scored: number;
  /** Anzahl der Fragen im gewählten Modus */
  total: number;
  /** Anteil gewerteter Antworten an allen Fragen (0–1) */
  scoredRatio: number;
  /** true, wenn weniger als `minAnsweredRatio` der Fragen gewertet wurden */
  lowConfidence: boolean;
  /** null, wenn keine einzige Antwort gewertet wurde */
  classification: Classification | null;
}

export function questionsForMode(questions: Question[], mode: Mode): Question[] {
  return questions.filter((q) => !q.modes || q.modes.includes(mode));
}

export function countAnswers(questions: Question[], answers: Answers): DoshaValues {
  const counts: DoshaValues = { vata: 0, pitta: 0, kapha: 0 };
  for (const q of questions) {
    const a = answers[q.id];
    if (a && a !== "na") counts[a] += 1;
  }
  return counts;
}

export function toPercentages(counts: DoshaValues): DoshaValues {
  const sum = counts.vata + counts.pitta + counts.kapha;
  if (sum === 0) return { vata: 0, pitta: 0, kapha: 0 };
  return {
    vata: (counts.vata * 100) / sum,
    pitta: (counts.pitta * 100) / sum,
    kapha: (counts.kapha * 100) / sum,
  };
}

/**
 * Rundet Prozentwerte so auf ganze Zahlen, dass die Summe exakt 100 ergibt
 * (Verfahren der größten Reste). Nur für die Anzeige gedacht.
 */
export function roundPercentages(p: DoshaValues): DoshaValues {
  const sum = p.vata + p.pitta + p.kapha;
  if (sum === 0) return { vata: 0, pitta: 0, kapha: 0 };
  const floors = DOSHAS.map((d) => ({ d, floor: Math.floor(p[d]), rest: p[d] - Math.floor(p[d]) }));
  let missing = 100 - floors.reduce((s, f) => s + f.floor, 0);
  const result = { vata: 0, pitta: 0, kapha: 0 } as DoshaValues;
  floors.forEach((f) => (result[f.d] = f.floor));
  [...floors]
    .sort((a, b) => b.rest - a.rest || DOSHAS.indexOf(a.d) - DOSHAS.indexOf(b.d))
    .forEach((f) => {
      if (missing > 0) {
        result[f.d] += 1;
        missing -= 1;
      }
    });
  return result;
}

export function evaluate(
  allQuestions: Question[],
  answers: Answers,
  mode: Mode,
  config: ScoringConfig,
): Evaluation {
  const questions = questionsForMode(allQuestions, mode);
  const counts = countAnswers(questions, answers);
  const scored = counts.vata + counts.pitta + counts.kapha;
  const total = questions.length;
  const percentages = toPercentages(counts);
  const scoredRatio = total === 0 ? 0 : scored / total;
  return {
    counts,
    percentages,
    scored,
    total,
    scoredRatio,
    lowConfidence: scoredRatio < config.minAnsweredRatio,
    classification: scored === 0 ? null : classify(percentages, config),
  };
}
