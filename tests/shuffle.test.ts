import { describe, expect, it } from "vitest";
import { mulberry32, optionOrder, shuffle } from "../src/lib/shuffle";

describe("optionOrder", () => {
  it("enthält immer alle drei Doshas genau einmal", () => {
    for (let seed = 0; seed < 50; seed++) {
      expect([...optionOrder("frage", seed)].sort()).toEqual(["kapha", "pitta", "vata"]);
    }
  });

  it("ist für denselben Seed und dieselbe Frage stabil", () => {
    expect(optionOrder("haut", 42)).toEqual(optionOrder("haut", 42));
  });

  it("erzeugt über viele Fragen hinweg alle sechs Reihenfolgen", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(optionOrder(`frage-${i}`, 7).join(","));
    expect(seen.size).toBe(6);
  });
});

describe("shuffle", () => {
  it("verändert das Original nicht", () => {
    const input = [1, 2, 3, 4];
    shuffle(input, mulberry32(1));
    expect(input).toEqual([1, 2, 3, 4]);
  });
});
