import { z } from "zod";

export const DOSHAS = ["vata", "pitta", "kapha"] as const;
export const MODES = ["prakriti", "vikriti"] as const;

export const doshaSchema = z.enum(DOSHAS);
export const modeSchema = z.enum(MODES);

const nonEmpty = z.string().trim().min(1, "darf nicht leer sein");

export const categorySchema = z.object({
  id: nonEmpty,
  title: nonEmpty,
});

export const questionSchema = z.object({
  id: nonEmpty,
  category: nonEmpty,
  prompt: nonEmpty,
  modes: z.array(modeSchema).min(1).optional(),
  options: z.object({
    vata: nonEmpty,
    pitta: nonEmpty,
    kapha: nonEmpty,
  }),
});

export const questionCatalogSchema = z
  .object({
    version: z.number().int().positive(),
    categories: z.array(categorySchema).min(1),
    questions: z.array(questionSchema).min(1),
  })
  .superRefine((catalog, ctx) => {
    const categoryIds = new Set<string>();
    catalog.categories.forEach((c, i) => {
      if (categoryIds.has(c.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["categories", i, "id"],
          message: `Kategorie-ID „${c.id}“ ist doppelt vergeben`,
        });
      }
      categoryIds.add(c.id);
    });

    const questionIds = new Set<string>();
    catalog.questions.forEach((q, i) => {
      if (questionIds.has(q.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", i, "id"],
          message: `Fragen-ID „${q.id}“ ist doppelt vergeben`,
        });
      }
      questionIds.add(q.id);
      if (!categoryIds.has(q.category)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", i, "category"],
          message: `Unbekannte Kategorie „${q.category}“ in Frage „${q.id}“`,
        });
      }
    });

    for (const mode of MODES) {
      if (!catalog.questions.some((q) => !q.modes || q.modes.includes(mode))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions"],
          message: `Für den Modus „${mode}“ gibt es keine Fragen`,
        });
      }
    }
  });

export type Dosha = z.infer<typeof doshaSchema>;
export type Mode = z.infer<typeof modeSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Question = z.infer<typeof questionSchema>;
export type QuestionCatalog = z.infer<typeof questionCatalogSchema>;
