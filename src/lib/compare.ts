import { DOSHAS, type Dosha } from "../schema/questions.schema";
import type { ScoringConfig } from "../schema/scoring.schema";
import type { DoshaValues } from "./scoring";

export interface DoshaDelta {
  dosha: Dosha;
  prakriti: number;
  vikriti: number;
  /** Vikriti minus Prakriti in Prozentpunkten */
  delta: number;
}

export interface Comparison {
  deltas: DoshaDelta[];
  /** Doshas, die in der Vikriti um mindestens `vikritiElevatedDelta` Punkte höher liegen – größte Abweichung zuerst */
  elevated: DoshaDelta[];
  /** true, wenn kein Dosha nennenswert erhöht ist */
  balanced: boolean;
}

export function comparePrakritiVikriti(
  prakriti: DoshaValues,
  vikriti: DoshaValues,
  config: ScoringConfig,
): Comparison {
  const deltas = DOSHAS.map((dosha) => ({
    dosha,
    prakriti: prakriti[dosha],
    vikriti: vikriti[dosha],
    delta: vikriti[dosha] - prakriti[dosha],
  }));
  const elevated = deltas
    .filter((d) => d.delta >= config.vikritiElevatedDelta - 1e-9)
    .sort((a, b) => b.delta - a.delta);
  return { deltas, elevated, balanced: elevated.length === 0 };
}
