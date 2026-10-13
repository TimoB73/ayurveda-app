import { z } from "zod";
import { doshaSchema, modeSchema, type Mode } from "../schema/questions.schema";

/**
 * Lokale Speicherung im Browser (localStorage). Es werden keine Daten übertragen.
 * Jeder Zugriff steht in try/catch: Im privaten Modus, bei vollem Speicher oder
 * gesperrten Website-Daten arbeitet die App ohne Speicherung weiter.
 */

export const DRAFTS_KEY = "ayurveda-test:v1:drafts";
export const RESULTS_KEY = "ayurveda-test:v1:results";

const answerSchema = z.union([doshaSchema, z.literal("na")]);
const doshaValuesSchema = z.object({ vata: z.number(), pitta: z.number(), kapha: z.number() });

export const draftSchema = z.object({
  mode: modeSchema,
  seed: z.number().int().nonnegative(),
  answers: z.record(answerSchema),
  page: z.number().int().nonnegative(),
  startedAt: z.string(),
});

export const draftsSchema = z.object({
  prakriti: draftSchema.optional(),
  vikriti: draftSchema.optional(),
});

export const savedResultSchema = z.object({
  id: z.string(),
  mode: modeSchema,
  createdAt: z.string(),
  answers: z.record(answerSchema),
  percentages: doshaValuesSchema,
  scored: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export type Draft = z.infer<typeof draftSchema>;
export type Drafts = z.infer<typeof draftsSchema>;
export type SavedResult = z.infer<typeof savedResultSchema>;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function defaultStorage(): StorageLike | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function readJson<T>(key: string, schema: z.ZodType<T>, fallback: T, storage: StorageLike | null): T {
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    if (raw == null) return fallback;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown, storage: StorageLike | null): boolean {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadDrafts(storage: StorageLike | null = defaultStorage()): Drafts {
  return readJson(DRAFTS_KEY, draftsSchema, {}, storage);
}

export function saveDraft(draft: Draft, storage: StorageLike | null = defaultStorage()): boolean {
  const drafts = loadDrafts(storage);
  return writeJson(DRAFTS_KEY, { ...drafts, [draft.mode]: draft }, storage);
}

export function clearDraft(mode: Mode, storage: StorageLike | null = defaultStorage()): boolean {
  const drafts = loadDrafts(storage);
  delete drafts[mode];
  return writeJson(DRAFTS_KEY, drafts, storage);
}

export function loadResults(storage: StorageLike | null = defaultStorage()): SavedResult[] {
  // Einzelne beschädigte Einträge werden übersprungen, statt alle zu verwerfen.
  const list = readJson(RESULTS_KEY, z.array(z.unknown()), [], storage);
  return list
    .map((r) => savedResultSchema.safeParse(r))
    .filter((r): r is z.SafeParseSuccess<SavedResult> => r.success)
    .map((r) => r.data)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveResult(result: SavedResult, storage: StorageLike | null = defaultStorage()): boolean {
  const results = loadResults(storage).filter((r) => r.id !== result.id);
  return writeJson(RESULTS_KEY, [result, ...results], storage);
}

export function deleteResult(id: string, storage: StorageLike | null = defaultStorage()): boolean {
  return writeJson(
    RESULTS_KEY,
    loadResults(storage).filter((r) => r.id !== id),
    storage,
  );
}

export function latestResult(results: SavedResult[], mode: Mode): SavedResult | undefined {
  return results.find((r) => r.mode === mode);
}
