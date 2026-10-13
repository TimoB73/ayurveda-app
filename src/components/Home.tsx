import { DOSHA_INFO, DOSHA_NAME, MODE_DESCRIPTION, MODE_LABEL, MODE_QUESTION, kindLabel, typeLabel } from "../data/content";
import { classify } from "../lib/classify";
import { questionsForMode } from "../lib/scoring";
import { latestResult, type Drafts, type SavedResult } from "../lib/storage";
import { DOSHAS, MODES, type Mode, type QuestionCatalog } from "../schema/questions.schema";
import type { ScoringConfig } from "../schema/scoring.schema";
import { Disclaimer } from "./Disclaimer";
import { Glossary } from "./Glossary";
import { formatDate } from "./format";
import { useInstallPrompt } from "./useInstallPrompt";

const BORDER = { vata: "border-vata", pitta: "border-pitta", kapha: "border-kapha" } as const;

interface Props {
  catalog: QuestionCatalog;
  drafts: Drafts;
  results: SavedResult[];
  scoring: ScoringConfig;
  onStart: (mode: Mode, fresh: boolean) => void;
  onOpenResult: (id: string) => void;
  onOpenHistory: () => void;
}

export function Home({ catalog, drafts, results, scoring, onStart, onOpenResult, onOpenHistory }: Props) {
  const { canInstall, install } = useInstallPrompt();
  return (
    <div className="space-y-6">
      {canInstall && (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-amber-300 bg-amber-50">
          <p>Installieren Sie den Test als App – mit eigenem Symbol und auch offline nutzbar.</p>
          <button className="btn-primary" onClick={install}>
            Als App installieren
          </button>
        </div>
      )}
      <section aria-labelledby="intro-title" className="space-y-3">
        <h1 id="intro-title" className="text-2xl font-bold sm:text-3xl">
          Welche ayurvedische Konstitution haben Sie?
        </h1>
        <p>
          Im Ayurveda wird jeder Mensch von drei Grundkräften geprägt, den <span lang="sa-Latn">Doṣas</span>{" "}
          (vereinfacht: Doshas) <span lang="sa-Latn">{DOSHA_INFO.vata.sanskrit}</span>, Pitta und Kapha. Ihr
          individuelles Verhältnis bildet Ihre Konstitution. Jedes Dosha ist durch bestimmte Eigenschaften gekennzeichnet,
          die <span lang="sa-Latn">Guṇas</span> (vereinfacht: Gunas).
        </p>
        <ul className="grid gap-2 sm:grid-cols-3">
          {DOSHAS.map((d) => (
            <li key={d} className={`rounded-lg border-l-4 bg-white p-3 shadow-sm ${BORDER[d]}`}>
              <span className="font-semibold">{DOSHA_NAME[d]}</span>
              <span className="block text-sm text-stone-700">{DOSHA_INFO[d].gunas.join(", ")}</span>
            </li>
          ))}
        </ul>
      </section>

      <Disclaimer />

      <section aria-labelledby="modes-title" className="space-y-4">
        <h2 id="modes-title" className="text-xl font-bold">
          Zwei Fragebögen
        </h2>
        <p>
          Die <span lang="sa-Latn">Prakṛti</span> (Prakriti) ist Ihre angeborene Grundkonstitution, die{" "}
          <span lang="sa-Latn">Vikṛti</span> (Vikriti) Ihr aktueller Zustand. Wenn Sie beide Fragebögen ausfüllen, sehen
          Sie, welches Dosha derzeit erhöht ist.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {MODES.map((mode) => {
            const draft = drafts[mode];
            const total = questionsForMode(catalog.questions, mode).length;
            const answered = draft
              ? questionsForMode(catalog.questions, mode).filter((q) => draft.answers[q.id]).length
              : 0;
            const last = latestResult(results, mode);
            const lastClass = last && last.scored > 0 ? classify(last.percentages, scoring) : null;
            return (
              <article key={mode} className="card flex flex-col gap-3" aria-labelledby={`mode-${mode}`}>
                <h3 id={`mode-${mode}`} className="text-lg font-bold">
                  {MODE_LABEL[mode]}
                </h3>
                <p className="font-medium italic text-stone-700">„{MODE_QUESTION[mode]}“</p>
                <p className="text-sm text-stone-700">{MODE_DESCRIPTION[mode]}</p>
                <p className="text-sm text-stone-600">
                  {total} Fragen · ca. {Math.ceil(total / 4)} Minuten
                </p>
                {lastClass && last && (
                  <p className="text-sm">
                    Letztes Ergebnis ({formatDate(last.createdAt)}):{" "}
                    <button className="link" onClick={() => onOpenResult(last.id)}>
                      {typeLabel(lastClass.kind, lastClass.doshas)}
                    </button>
                    <span className="sr-only"> – {kindLabel(lastClass.kind)}</span>
                  </p>
                )}
                <div className="mt-auto flex flex-wrap gap-2">
                  {draft ? (
                    <>
                      <button className="btn-primary" onClick={() => onStart(mode, false)}>
                        Fortsetzen ({answered}/{total})
                      </button>
                      <button className="btn-secondary" onClick={() => onStart(mode, true)}>
                        Neu beginnen
                      </button>
                    </>
                  ) : (
                    <button className="btn-primary" onClick={() => onStart(mode, true)}>
                      {MODE_LABEL[mode]}-Test starten
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {results.length > 0 && (
        <section className="card flex flex-wrap items-center justify-between gap-3">
          <p>
            Sie haben {results.length} {results.length === 1 ? "gespeichertes Ergebnis" : "gespeicherte Ergebnisse"}.
          </p>
          <button className="btn-secondary" onClick={onOpenHistory}>
            Ergebnisse ansehen und vergleichen
          </button>
        </section>
      )}

      <details className="card">
        <summary className="cursor-pointer font-semibold">Begriffe kurz erklärt</summary>
        <div className="mt-3">
          <Glossary />
          <p className="mt-3 text-sm text-stone-600">
            Nicht zu verwechseln mit den drei Triguṇas des Geistes (Sattva, Rajas, Tamas) – diese werden hier nicht
            erfasst.
          </p>
        </div>
      </details>

      <section className="text-sm text-stone-700">
        <h2 className="font-semibold">So funktioniert der Test</h2>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>Wählen Sie bei jeder Aussage die Antwort, die am ehesten auf Sie zutrifft.</li>
          <li>Passt keine, wählen Sie „trifft nicht zu / weiß nicht“ – diese Antwort wird nicht gewertet.</li>
          <li>Ihr Zwischenstand wird automatisch gespeichert; Sie können jederzeit zurückblättern.</li>
        </ul>
      </section>
    </div>
  );
}
