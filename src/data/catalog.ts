import rawQuestions from "./questions.json";
import rawScoring from "./scoring.json";
import { questionCatalogSchema, type QuestionCatalog } from "../schema/questions.schema";
import { scoringConfigSchema, type ScoringConfig } from "../schema/scoring.schema";
import type { ZodError } from "zod";

export class ConfigError extends Error {
  constructor(
    public readonly file: string,
    public readonly issues: string[],
  ) {
    super(`Fehler in ${file}:\n${issues.join("\n")}`);
    this.name = "ConfigError";
  }
}

export function formatZodIssues(error: ZodError): string[] {
  return error.issues.map((i) => `• ${i.path.join(".") || "(Wurzel)"}: ${i.message}`);
}

export function parseCatalog(data: unknown): QuestionCatalog {
  const r = questionCatalogSchema.safeParse(data);
  if (!r.success) throw new ConfigError("src/data/questions.json", formatZodIssues(r.error));
  return r.data;
}

export function parseScoring(data: unknown): ScoringConfig {
  const r = scoringConfigSchema.safeParse(data);
  if (!r.success) throw new ConfigError("src/data/scoring.json", formatZodIssues(r.error));
  return r.data;
}

export function loadConfig(): { catalog: QuestionCatalog; scoring: ScoringConfig } {
  return { catalog: parseCatalog(rawQuestions), scoring: parseScoring(rawScoring) };
}
