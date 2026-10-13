import { describe, expect, it } from "vitest";
import { classify, rankDoshas, typeKeyFor } from "../src/lib/classify";
import { CONFIG, pct } from "./helpers";

describe("rankDoshas", () => {
  it("sortiert absteigend nach Anteil", () => {
    expect(rankDoshas(pct(20, 50, 30))).toEqual(["pitta", "kapha", "vata"]);
  });
  it("löst Gleichstand in der Reihenfolge Vata > Pitta > Kapha auf", () => {
    expect(rankDoshas(pct(30, 40, 30))).toEqual(["pitta", "vata", "kapha"]);
    expect(rankDoshas(pct(100 / 3, 100 / 3, 100 / 3))).toEqual(["vata", "pitta", "kapha"]);
  });
});

describe("typeKeyFor", () => {
  it("bildet Doppeltypen unabhängig von der Dominanz auf einen kanonischen Schlüssel ab", () => {
    expect(typeKeyFor("dual", ["pitta", "vata"])).toBe("vata-pitta");
    expect(typeKeyFor("dual", ["kapha", "pitta"])).toBe("pitta-kapha");
    expect(typeKeyFor("dual", ["kapha", "vata"])).toBe("vata-kapha");
  });
});

describe("classify – Eindosha", () => {
  it.each([
    ["vata", pct(60, 25, 15)],
    ["pitta", pct(10, 70, 20)],
    ["kapha", pct(20, 15, 65)],
  ] as const)("erkennt %s", (dosha, p) => {
    const c = classify(p, CONFIG);
    expect(c).toMatchObject({ kind: "single", typeKey: dosha, doshas: [dosha], matchedRule: "single", borderline: false });
  });

  it("greift genau an der Grenze (50 % und 15 Pkt Abstand)", () => {
    expect(classify(pct(50, 35, 15), CONFIG)).toMatchObject({ kind: "single", matchedRule: "single" });
  });

  it("greift nicht knapp unter 50 %", () => {
    const c = classify(pct(49, 34, 17), CONFIG);
    expect(c.matchedRule).not.toBe("single");
  });

  it("greift nicht bei 14 Pkt Abstand", () => {
    const c = classify(pct(50, 36, 14), CONFIG);
    expect(c.matchedRule).not.toBe("single");
  });

  it("ist robust gegen Gleitkomma-Ungenauigkeit an der Grenze", () => {
    // 0.1 + 0.2 != 0.3 in Gleitkomma – hier 50 und 35 aus Brüchen berechnet
    const c = classify(pct((10 * 100) / 20, (7 * 100) / 20, (3 * 100) / 20), CONFIG);
    expect(c.matchedRule).toBe("single");
  });
});

describe("classify – Doppeldosha", () => {
  it("nennt das dominante Dosha zuerst", () => {
    const c = classify(pct(35, 45, 20), CONFIG);
    expect(c).toMatchObject({ kind: "dual", doshas: ["pitta", "vata"], typeKey: "vata-pitta", matchedRule: "dual" });
  });

  it.each([
    [pct(40, 40, 20), "vata-pitta"],
    [pct(15, 42, 43), "pitta-kapha"],
    [pct(45, 15, 40), "vata-kapha"],
  ] as const)("erkennt %o als %s", (p, key) => {
    expect(classify(p, CONFIG)).toMatchObject({ kind: "dual", typeKey: key, matchedRule: "dual" });
  });

  it("greift genau an der Grenze (10 Pkt Abstand, Summe 70)", () => {
    expect(classify(pct(40, 30, 30), CONFIG)).toMatchObject({ kind: "dual", matchedRule: "dual" });
  });

  it("markiert Gleichstand um Platz 2 als Grenzfall", () => {
    const c = classify(pct(40, 30, 30), CONFIG);
    expect(c.doshas).toEqual(["vata", "pitta"]);
    expect(c.borderline).toBe(true);
  });

  it("greift nicht bei Summe unter 70 (39 + 30,6 = 69,6)", () => {
    // fällt auch nicht unter Tridosha (39 > 38) → Ersatzregel
    expect(classify(pct(39, 30.6, 30.4), CONFIG)).toMatchObject({ kind: "dual", matchedRule: "fallback" });
  });

  it("greift nicht bei 11 Pkt Abstand", () => {
    expect(classify(pct(46, 35, 19), CONFIG).matchedRule).not.toBe("dual");
  });
});

describe("classify – Tridosha", () => {
  it("erkennt exakte Gleichverteilung", () => {
    expect(classify(pct(100 / 3, 100 / 3, 100 / 3), CONFIG)).toMatchObject({
      kind: "tri",
      typeKey: "tridosha",
      matchedRule: "tri",
      borderline: false,
    });
  });

  it("greift an beiden Rändern (28 und 38 %)", () => {
    expect(classify(pct(38, 34, 28), CONFIG).kind).toBe("tri");
  });

  it("hat Vorrang vor Doppeldosha (38/34/28 erfüllt beide Regeln)", () => {
    expect(classify(pct(38, 34, 28), CONFIG).matchedRule).toBe("tri");
  });

  it("greift nicht, wenn ein Dosha unter 28 % liegt", () => {
    expect(classify(pct(38, 35, 27), CONFIG).kind).not.toBe("tri");
  });

  it("greift nicht, wenn ein Dosha über 38 % liegt", () => {
    expect(classify(pct(39, 33, 28), CONFIG).kind).not.toBe("tri");
  });
});

describe("classify – Ersatzregel (keine Regel passt)", () => {
  it("55/42/3: Abstand 13 → Doppeldosha als Grenzfall", () => {
    expect(classify(pct(55, 42, 3), CONFIG)).toMatchObject({
      kind: "dual",
      doshas: ["vata", "pitta"],
      matchedRule: "fallback",
      borderline: true,
    });
  });

  it("45/30/25: Abstand 15, aber unter 50 % → Eindosha als Grenzfall", () => {
    expect(classify(pct(45, 30, 25), CONFIG)).toMatchObject({
      kind: "single",
      doshas: ["vata"],
      matchedRule: "fallback",
      borderline: true,
    });
  });

  it("45/35/20: Abstand 10, Summe 80 → reguläres Doppeldosha", () => {
    expect(classify(pct(45, 35, 20), CONFIG).matchedRule).toBe("dual");
  });

  it("42/29/29: Abstand 13 → Doppeldosha als Grenzfall", () => {
    expect(classify(pct(42, 29, 29), CONFIG)).toMatchObject({ kind: "dual", matchedRule: "fallback", borderline: true });
  });

  it("liefert für jede Verteilung in 1-%-Schritten einen Typ", () => {
    for (let v = 0; v <= 100; v++) {
      for (let p = 0; p <= 100 - v; p++) {
        const c = classify(pct(v, p, 100 - v - p), CONFIG);
        expect(["single", "dual", "tri"]).toContain(c.kind);
        expect(c.doshas.length).toBe(c.kind === "single" ? 1 : c.kind === "dual" ? 2 : 3);
      }
    }
  });
});

describe("classify – Extremfälle", () => {
  it("100 % eines Doshas → Eindosha", () => {
    expect(classify(pct(0, 0, 100), CONFIG)).toMatchObject({ kind: "single", typeKey: "kapha" });
  });
  it("50/50/0 → Doppeldosha", () => {
    expect(classify(pct(50, 0, 50), CONFIG)).toMatchObject({ kind: "dual", typeKey: "vata-kapha", borderline: false });
  });
});

describe("classify – konfigurierbare Schwellwerte", () => {
  it("verwendet die übergebenen Werte", () => {
    const strict = { ...CONFIG, single: { minTop: 70, minGap: 30 } };
    expect(classify(pct(60, 25, 15), CONFIG).kind).toBe("single");
    expect(classify(pct(60, 25, 15), strict).matchedRule).toBe("fallback");
  });
});
