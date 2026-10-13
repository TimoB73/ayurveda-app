import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { MODE_LABEL, MODE_QUESTION } from "../data/content";
import { questionsForMode, type Answer } from "../lib/scoring";
import { optionOrder } from "../lib/shuffle";
import type { Draft } from "../lib/storage";
import type { Question, QuestionCatalog } from "../schema/questions.schema";
import { quizReducer } from "../state/quizReducer";

interface Props {
  catalog: QuestionCatalog;
  initialDraft: Draft;
  onChange: (d: Draft) => void;
  onFinish: (d: Draft) => void;
  onExit: () => void;
}

export function Quiz({ catalog, initialDraft, onChange, onFinish, onExit }: Props) {
  const [draft, dispatch] = useReducer(quizReducer, initialDraft);
  const [missing, setMissing] = useState<string[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const questions = useMemo(() => questionsForMode(catalog.questions, draft.mode), [catalog, draft.mode]);
  const pages = useMemo(
    () =>
      catalog.categories
        .map((c) => ({ category: c, questions: questions.filter((q) => q.category === c.id) }))
        .filter((p) => p.questions.length > 0),
    [catalog, questions],
  );

  const pageIndex = Math.min(draft.page, pages.length - 1);
  const page = pages[pageIndex];
  const answeredCount = questions.filter((q) => draft.answers[q.id]).length;
  const isLast = pageIndex === pages.length - 1;

  // Zwischenstand bei jeder Änderung sichern
  useEffect(() => {
    if (firstRender.current) return;
    onChange(draft);
  }, [draft]);

  // Beim Seitenwechsel Fokus auf die Überschrift setzen (Screenreader & Tastatur)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [pageIndex]);

  const goto = (p: number) => {
    setMissing([]);
    dispatch({ type: "goto", page: p });
  };

  const next = () => {
    const open = page.questions.filter((q) => !draft.answers[q.id]).map((q) => q.id);
    if (open.length > 0) {
      setMissing(open);
      document.querySelector<HTMLInputElement>(`input[name="q-${open[0]}"]`)?.focus();
      return;
    }
    if (isLast) {
      const allOpen = questions.find((q) => !draft.answers[q.id]);
      if (allOpen) {
        // Sicherheitsnetz: zur ersten Seite mit offener Frage springen
        goto(pages.findIndex((p) => p.questions.includes(allOpen)));
        return;
      }
      onFinish(draft);
    } else {
      goto(pageIndex + 1);
    }
  };

  const progress = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-900">{MODE_LABEL[draft.mode]}-Test</p>
        <p className="text-lg font-medium italic">„{MODE_QUESTION[draft.mode]}“</p>
        <div>
          <div className="flex justify-between text-sm text-stone-700">
            <span>
              Bereich {pageIndex + 1} von {pages.length}
            </span>
            <span>
              {answeredCount} von {questions.length} beantwortet
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Fortschritt"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-valuetext={`${answeredCount} von ${questions.length} Fragen beantwortet`}
            className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-stone-200"
          >
            <div className="h-full rounded-full bg-amber-700 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
        noValidate
        className="space-y-5"
      >
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold focus:outline-none">
          {page.category.title}
        </h1>

        {missing.length > 0 && (
          <p role="alert" className="rounded-lg border border-red-700 bg-red-50 p-3 text-red-900">
            Bitte beantworten Sie alle Fragen dieses Bereichs. Wenn keine Antwort passt, wählen Sie „trifft nicht zu /
            weiß nicht“.
          </p>
        )}

        {page.questions.map((q) => (
          <QuestionField
            key={q.id}
            question={q}
            seed={draft.seed}
            value={draft.answers[q.id]}
            invalid={missing.includes(q.id) && !draft.answers[q.id]}
            onChange={(answer) => dispatch({ type: "answer", questionId: q.id, answer })}
          />
        ))}

        <div className="flex flex-wrap justify-between gap-3 border-t border-stone-200 pt-4">
          {pageIndex > 0 ? (
            <button type="button" className="btn-secondary" onClick={() => goto(pageIndex - 1)}>
              ← Zurück
            </button>
          ) : (
            <button type="button" className="btn-secondary" onClick={onExit}>
              ← Zur Startseite
            </button>
          )}
          <button type="submit" className="btn-primary">
            {isLast ? "Auswerten" : "Weiter →"}
          </button>
        </div>
        <p className="text-sm text-stone-600">Ihr Zwischenstand wird automatisch gespeichert.</p>
      </form>
    </div>
  );
}

function QuestionField({
  question,
  seed,
  value,
  invalid,
  onChange,
}: {
  question: Question;
  seed: number;
  value: Answer | undefined;
  invalid: boolean;
  onChange: (a: Answer) => void;
}) {
  const order = useMemo(() => optionOrder(question.id, seed), [question.id, seed]);
  const options: { value: Answer; label: string }[] = [
    ...order.map((d) => ({ value: d as Answer, label: question.options[d] })),
    { value: "na", label: "trifft nicht zu / weiß nicht" },
  ];
  const name = `q-${question.id}`;
  const errorId = `${name}-error`;

  return (
    <fieldset
      className={`card space-y-2 ${invalid ? "border-2 border-red-700" : ""}`}
      aria-describedby={invalid ? errorId : undefined}
    >
      <legend className="float-left mb-2 w-full text-lg font-semibold">{question.prompt}</legend>
      {invalid && (
        <p id={errorId} className="clear-both text-sm font-semibold text-red-800">
          Bitte wählen Sie eine Antwort.
        </p>
      )}
      <div className="clear-both space-y-2">
        {options.map((o) => {
          const id = `${name}-${o.value}`;
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              htmlFor={id}
              className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                checked ? "border-amber-800 bg-amber-50" : "border-stone-300 hover:bg-stone-50"
              } ${o.value === "na" ? "text-stone-700" : ""}`}
            >
              <input
                type="radio"
                id={id}
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="mt-1 h-5 w-5 shrink-0 accent-amber-800"
              />
              <span>{o.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
