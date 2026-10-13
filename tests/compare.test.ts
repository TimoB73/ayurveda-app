import { describe, expect, it } from "vitest";
import { comparePrakritiVikriti } from "../src/lib/compare";
import { CONFIG, pct } from "./helpers";

describe("comparePrakritiVikriti", () => {
  it("berechnet die Differenzen in Prozentpunkten", () => {
    const c = comparePrakritiVikriti(pct(50, 30, 20), pct(60, 25, 15), CONFIG);
    expect(c.deltas.map((d) => d.delta)).toEqual([10, -5, -5]);
  });

  it("meldet ein erhöhtes Dosha ab +5 Pkt (Grenzwert eingeschlossen)", () => {
    const c = comparePrakritiVikriti(pct(40, 30, 30), pct(40, 35, 25), CONFIG);
    expect(c.elevated.map((d) => d.dosha)).toEqual(["pitta"]);
    expect(c.balanced).toBe(false);
  });

  it("meldet nichts bei +4,9 Pkt", () => {
    const c = comparePrakritiVikriti(pct(40, 30, 30), pct(40, 34.9, 25.1), CONFIG);
    expect(c.elevated).toEqual([]);
    expect(c.balanced).toBe(true);
  });

  it("sortiert mehrere erhöhte Doshas nach Größe der Abweichung", () => {
    const c = comparePrakritiVikriti(pct(60, 20, 20), pct(30, 32, 38), CONFIG);
    expect(c.elevated.map((d) => d.dosha)).toEqual(["kapha", "pitta"]);
  });

  it("identische Ergebnisse gelten als ausgeglichen", () => {
    expect(comparePrakritiVikriti(pct(30, 40, 30), pct(30, 40, 30), CONFIG).balanced).toBe(true);
  });
});
