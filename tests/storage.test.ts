import { beforeEach, describe, expect, it } from "vitest";
import {
  DRAFTS_KEY,
  RESULTS_KEY,
  clearDraft,
  deleteResult,
  latestResult,
  loadDrafts,
  loadResults,
  saveDraft,
  saveResult,
  type Draft,
  type SavedResult,
} from "../src/lib/storage";

class MemoryStorage {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}

const throwingStorage = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
  removeItem: () => {
    throw new Error("SecurityError");
  },
};

const draft = (mode: Draft["mode"]): Draft => ({ mode, seed: 1, answers: { a: "vata" }, page: 2, startedAt: "2026-01-01T00:00:00Z" });
const result = (id: string, mode: SavedResult["mode"], createdAt: string): SavedResult => ({
  id,
  mode,
  createdAt,
  answers: {},
  percentages: { vata: 50, pitta: 30, kapha: 20 },
  scored: 10,
  total: 10,
});

let storage: MemoryStorage;
beforeEach(() => {
  storage = new MemoryStorage();
});

describe("Zwischenstände", () => {
  it("speichert je Modus einen Zwischenstand", () => {
    saveDraft(draft("prakriti"), storage);
    saveDraft(draft("vikriti"), storage);
    expect(Object.keys(loadDrafts(storage)).sort()).toEqual(["prakriti", "vikriti"]);
    clearDraft("prakriti", storage);
    expect(loadDrafts(storage).prakriti).toBeUndefined();
    expect(loadDrafts(storage).vikriti).toBeDefined();
  });

  it("verwirft beschädigte Daten", () => {
    storage.setItem(DRAFTS_KEY, "{kaputt");
    expect(loadDrafts(storage)).toEqual({});
  });
});

describe("Ergebnisse", () => {
  it("speichert, sortiert (neueste zuerst) und löscht", () => {
    saveResult(result("1", "prakriti", "2026-01-01"), storage);
    saveResult(result("2", "vikriti", "2026-02-01"), storage);
    expect(loadResults(storage).map((r) => r.id)).toEqual(["2", "1"]);
    expect(latestResult(loadResults(storage), "prakriti")?.id).toBe("1");
    deleteResult("2", storage);
    expect(loadResults(storage).map((r) => r.id)).toEqual(["1"]);
  });

  it("überspringt einzelne ungültige Einträge", () => {
    storage.setItem(RESULTS_KEY, JSON.stringify([result("ok", "prakriti", "2026-01-01"), { id: 5 }]));
    expect(loadResults(storage).map((r) => r.id)).toEqual(["ok"]);
  });
});

describe("Fehlertoleranz", () => {
  it("wirft nicht, wenn localStorage gesperrt oder voll ist", () => {
    expect(loadDrafts(throwingStorage)).toEqual({});
    expect(loadResults(throwingStorage)).toEqual([]);
    expect(saveDraft(draft("prakriti"), throwingStorage)).toBe(false);
    expect(saveResult(result("1", "prakriti", "x"), throwingStorage)).toBe(false);
  });

  it("funktioniert ohne Speicher (null)", () => {
    expect(loadResults(null)).toEqual([]);
    expect(saveResult(result("1", "prakriti", "x"), null)).toBe(false);
  });
});
