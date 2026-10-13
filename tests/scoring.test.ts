import { describe, expect, it } from "vitest";
import { countAnswers, evaluate, questionsForMode, roundPercentages, toPercentages, type Answers } from "../src/lib/scoring";
import type { Question } from "../src/schema/questions.schema";
import { CONFIG, pct } from "./helpers";

const q = (id: string, modes?: Question["modes"]): Question => ({
  id,
  category: "c",
  prompt: id,
  modes,
  options: { vata: "v", pitta: "p", kapha: "k" },
});

const QUESTIONS = [q("a"), q("b"), q("c"), q("d"), q("nurPrakriti", ["prakriti"])];

describe("questionsForMode", () => {
  it("filtert Fragen, die nur für die Prakriti gelten", () => {
    expect(questionsForMode(QUESTIONS, "prakriti")).toHaveLength(5);
    expect(questionsForMode(QUESTIONS, "vikriti").map((x) => x.id)).not.toContain("nurPrakriti");
  });
});

describe("countAnswers / toPercentages", () => {
  it("zählt „weiß nicht“ nicht mit", () => {
    const answers: Answers = { a: "vata", b: "vata", c: "pitta", d: "na" };
    expect(countAnswers(QUESTIONS, answers)).toEqual({ vata: 2, pitta: 1, kapha: 0 });
  });

  it("ignoriert Antworten auf unbekannte oder modusfremde Fragen", () => {
    const answers: Answers = { a: "kapha", unbekannt: "vata", nurPrakriti: "pitta" };
    expect(countAnswers(questionsForMode(QUESTIONS, "vikriti"), answers)).toEqual({ vata: 0, pitta: 0, kapha: 1 });
  });

  it("berechnet Anteile, die sich zu 100 summieren", () => {
    const p = toPercentages({ vata: 1, pitta: 1, kapha: 1 });
    expect(p.vata + p.pitta + p.kapha).toBeCloseTo(100);
  });

  it("liefert 0/0/0 ohne gewertete Antworten (keine Division durch 0)", () => {
    expect(toPercentages({ vata: 0, pitta: 0, kapha: 0 })).toEqual(pct(0, 0, 0));
  });
});

describe("roundPercentages", () => {
  it("rundet auf ganze Zahlen mit Summe 100", () => {
    expect(roundPercentages(pct(100 / 3, 100 / 3, 100 / 3))).toEqual(pct(34, 33, 33));
    const r = roundPercentages(pct(16.6, 41.7, 41.7));
    expect(r.vata + r.pitta + r.kapha).toBe(100);
  });
  it("lässt 0/0/0 unverändert", () => {
    expect(roundPercentages(pct(0, 0, 0))).toEqual(pct(0, 0, 0));
  });
});

describe("evaluate", () => {
  it("wertet einen vollständigen Durchgang aus", () => {
    const answers: Answers = { a: "pitta", b: "pitta", c: "pitta", d: "vata", nurPrakriti: "pitta" };
    const e = evaluate(QUESTIONS, answers, "prakriti", CONFIG);
    expect(e.scored).toBe(5);
    expect(e.total).toBe(5);
    expect(e.percentages).toEqual(pct(20, 80, 0));
    expect(e.lowConfidence).toBe(false);
    expect(e.classification).toMatchObject({ kind: "single", typeKey: "pitta" });
  });

  it("liefert keine Klassifikation, wenn alles mit „weiß nicht“ beantwortet wurde", () => {
    const answers: Answers = { a: "na", b: "na", c: "na", d: "na" };
    const e = evaluate(QUESTIONS, answers, "vikriti", CONFIG);
    expect(e.scored).toBe(0);
    expect(e.classification).toBeNull();
    expect(e.lowConfidence).toBe(true);
  });

  it("warnt, wenn weniger als 60 % der Fragen gewertet wurden", () => {
    // Vikriti: 4 Fragen, 2 gewertet = 50 %
    const e = evaluate(QUESTIONS, { a: "vata", b: "kapha", c: "na" }, "vikriti", CONFIG);
    expect(e.scoredRatio).toBe(0.5);
    expect(e.lowConfidence).toBe(true);
  });

  it("warnt nicht genau an der Grenze von 60 %", () => {
    const five = [q("1"), q("2"), q("3"), q("4"), q("5")];
    const e = evaluate(five, { 1: "vata", 2: "vata", 3: "kapha" }, "vikriti", CONFIG);
    expect(e.scoredRatio).toBe(0.6);
    expect(e.lowConfidence).toBe(false);
  });
});
