import { z } from "zod";

const pct = z.number().min(0).max(100);

export const scoringConfigSchema = z
  .object({
    single: z.object({ minTop: pct, minGap: pct }),
    dual: z.object({ maxGap: pct, minSum: pct }),
    tri: z.object({ min: pct, max: pct }),
    minAnsweredRatio: z.number().min(0).max(1),
    vikritiElevatedDelta: pct,
  })
  .refine((c) => c.tri.min <= 100 / 3 && c.tri.max >= 100 / 3 && c.tri.min < c.tri.max, {
    path: ["tri"],
    message: "tri.min muss kleiner als tri.max sein, und 33,3 % muss dazwischen liegen",
  });

export type ScoringConfig = z.infer<typeof scoringConfigSchema>;
