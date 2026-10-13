import { describe, expect, it } from "vitest";
import rawQuestions from "../src/data/questions.json";
import rawScoring from "../src/data/scoring.json";
import { ConfigError, parseCatalog, parseScoring } from "../src/data/catalog";
import { questionsForMode } from "../src/lib/scoring";

describe("questions.json", () => {
  const catalog = parseCatalog(rawQuestions);

  it("ist gültig", () => {
    expect(catalog.questions.length).toBeGreaterThanOrEqual(30);
    expect(catalog.questions.length).toBeLessThanOrEqual(36);
  });

  it("enthält Fragen in jeder Kategorie", () => {
    for (const c of catalog.categories) {
      expect(catalog.questions.some((q) => q.category === c.id)).toBe(true);
    }
  });

  it("hat genügend Fragen für den Vikriti-Modus", () => {
    expect(questionsForMode(catalog.questions, "vikriti").length).toBeGreaterThanOrEqual(25);
  });

  it("meldet doppelte IDs und unbekannte Kategorien verständlich", () => {
    const broken = structuredClone(rawQuestions) as typeof rawQuestions;
    broken.questions[1].id = broken.questions[0].id;
    broken.questions[2].category = "gibt-es-nicht";
    try {
      parseCatalog(broken);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ConfigError);
      const msg = (e as ConfigError).issues.join("\n");
      expect(msg).toContain("doppelt");
      expect(msg).toContain("gibt-es-nicht");
    }
  });

  it("lehnt Fragen mit fehlender Antwortoption ab", () => {
    const broken = structuredClone(rawQuestions) as { questions: { options: Record<string, string> }[] };
    delete broken.questions[0].options.kapha;
    expect(() => parseCatalog(broken)).toThrow(ConfigError);
  });
});

describe("scoring.json", () => {
  it("ist gültig", () => {
    expect(() => parseScoring(rawScoring)).not.toThrow();
  });

  it("lehnt Tridosha-Grenzen ab, die 33,3 % nicht einschließen", () => {
    expect(() => parseScoring({ ...rawScoring, tri: { min: 35, max: 40 } })).toThrow(ConfigError);
  });

  it("lehnt Werte über 100 ab", () => {
    expect(() => parseScoring({ ...rawScoring, single: { minTop: 120, minGap: 15 } })).toThrow(ConfigError);
  });
});
