import type { ScoringConfig } from "../src/schema/scoring.schema";
import type { DoshaValues } from "../src/lib/scoring";

export const CONFIG: ScoringConfig = {
  single: { minTop: 50, minGap: 15 },
  dual: { maxGap: 10, minSum: 70 },
  tri: { min: 28, max: 38 },
  minAnsweredRatio: 0.6,
  vikritiElevatedDelta: 5,
};

export const pct = (vata: number, pitta: number, kapha: number): DoshaValues => ({ vata, pitta, kapha });
