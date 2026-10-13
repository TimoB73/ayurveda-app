import { useEffect, useRef, useState } from "react";
import { MODE_LABEL, TYPE_INFO, kindLabel, typeIntro, typeLabel } from "../data/content";
import { classify } from "../lib/classify";
import { latestResult, type SavedResult } from "../lib/storage";
import type { Mode, QuestionCatalog } from "../schema/questions.schema";
import type { ScoringConfig } from "../schema/scoring.schema";
import { DoshaChart } from "./Charts";
import { Comparison } from "./Comparison";
import { Disclaimer } from "./Disclaimer";
import { DoshaDetails } from "./DoshaDetails";
import { Glossary } from "./Glossary";
import { formatDate } from "./format";

interface Props {
  result: SavedResult;
  allResults: SavedResult[];
  catalog: QuestionCatalog;
  scoring: ScoringConfig;
  onHome: () => void;
  onHistory: () => void;
  onStart: (mode: Mode) => void;
}

export function ResultView({ result, allResults, scoring, onHome, onHistory, onStart }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [pdfState, setPdfState] = useState<"idle" | "busy" | "error">("idle");

  useEffect(() => {
    headingRef.current?.focus();
  }, [result.id]);

  // Typ wird stets mit den aktuellen Schwellwerten neu bestimmt.
  const classification = result.scored > 0 ? classify(result.percentages, scoring) : null;
  const lowConfidence = result.total > 0 && result.scored / result.total < scoring.minAnsweredRatio;
  const otherMode: Mode = result.mode === "prakriti" ? "vikriti" : "prakriti";
  const other = latestResult(allResults, otherMode);
  const pair =
    other && other.scored > 0 && result.scored > 0
      ? result.mode === "prakriti"
        ? { prakriti: result, vikriti: other }
        : { prakriti: other, vikriti: result }
      : null;

  const exportPdf = async () => {
    setPdfState("busy");
    try {
      const { exportResultPdf } = await import("../lib/pdf");
      await exportResultPdf({ result, scoring, comparison: pair });
      setPdfState("idle");
    } catch (e) {
      console.error(e);
      setPdfState("error");
    }
  };

  return (
    <div className="space-y-6">
      <Disclaimer />

      <header className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-900">
          Ergebnis {MODE_LABEL[result.mode]} · {formatDate(result.createdAt)}
        </p>
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold focus:outline-none sm:text-3xl">
          {classification
            ? result.mode === "prakriti"
              ? `Ihre Grundkonstitution: ${typeLabel(classification.kind, classification.doshas)}`
              : `Ihr aktueller Zustand: ${typeLabel(classification.kind, classification.doshas)}`
            : "Keine Auswertung möglich"}
        </h1>
        {classification && <p className="text-stone-700">{kindLabel(classification.kind)}</p>}
      </header>

      {!classification ? (
        <div className="card">
          <p>
            Sie haben alle Fragen mit „trifft nicht zu / weiß nicht“ beantwortet. Ohne gewertete Antworten lässt sich
            keine Verteilung berechnen.
          </p>
          <button className="btn-primary mt-4" onClick={() => onStart(result.mode)}>
            Test neu beginnen
          </button>
        </div>
      ) : (
        <>
          <section className="card space-y-3" aria-labelledby="dist-title">
            <h2 id="dist-title" className="text-xl font-bold">
              Verteilung der Doshas
            </h2>
            <DoshaChart percentages={result.percentages} title={`Anteile der Doshas, ${MODE_LABEL[result.mode]}`} />
            <p className="text-sm text-stone-600">
              Berechnet aus {result.scored} von {result.total} Antworten („trifft nicht zu / weiß nicht“ wird nicht
              gewertet).
            </p>
            {classification.borderline && (
              <p className="rounded-lg border border-stone-400 bg-stone-50 p-3">
                <strong>Grenzfall:</strong> Ihre Werte liegen zwischen zwei Typen. Die Bezeichnung entspricht dem
                nächstliegenden Typ; die Prozentanteile sind hier aussagekräftiger als die Typbezeichnung.
              </p>
            )}
            {lowConfidence && (
              <p className="rounded-lg border border-amber-700 bg-amber-50 p-3">
                <strong>Wenig aussagekräftig:</strong> Weniger als {Math.round(scoring.minAnsweredRatio * 100)} % der
                Fragen wurden gewertet. Das Ergebnis ist daher nur eingeschränkt belastbar.
              </p>
            )}
          </section>

          <section className="space-y-3" aria-labelledby="type-title">
            <h2 id="type-title" className="text-xl font-bold">
              {result.mode === "prakriti" ? "Was bedeutet das?" : "Was steht derzeit im Vordergrund?"}
            </h2>
            {result.mode === "vikriti" && (
              <p>
                Die Vikriti beschreibt Ihren momentanen Zustand. Für sich allein zeigt sie, welche Qualitäten derzeit
                überwiegen. Ob ein Dosha wirklich <em>erhöht</em> ist, ergibt sich erst im Vergleich mit Ihrer Prakriti.
              </p>
            )}
            <p>{typeIntro(classification.typeKey, result.mode, classification.doshas)}</p>
            <p className="rounded-lg bg-white p-3 shadow-sm">{TYPE_INFO[classification.typeKey].balanceNote}</p>
          </section>

          {pair && <Comparison prakriti={pair.prakriti} vikriti={pair.vikriti} scoring={scoring} />}

          {!pair && (
            <div className="card flex flex-wrap items-center justify-between gap-3">
              <p>
                {result.mode === "prakriti"
                  ? "Füllen Sie auch den Vikriti-Test aus, um zu sehen, welches Dosha derzeit erhöht ist."
                  : "Füllen Sie auch den Prakriti-Test aus, um Ihren aktuellen Zustand mit Ihrer Grundkonstitution zu vergleichen."}
              </p>
              <button className="btn-secondary" onClick={() => onStart(otherMode)}>
                {MODE_LABEL[otherMode]}-Test starten
              </button>
            </div>
          )}

          <section className="space-y-4" aria-labelledby="dosha-title">
            <h2 id="dosha-title" className="text-xl font-bold">
              {classification.doshas.length > 1 ? "Die beteiligten Doshas" : "Das prägende Dosha"}
            </h2>
            {classification.doshas.map((d) => (
              <DoshaDetails key={d} dosha={d} />
            ))}
          </section>
        </>
      )}

      <div className="card space-y-3">
        <h2 className="text-lg font-bold">Ergebnis sichern</h2>
        <p className="text-sm text-stone-700">
          Das Ergebnis ist lokal in diesem Browser gespeichert. Zusätzlich können Sie es als PDF herunterladen.
        </p>
        <div className="flex flex-wrap gap-2">
          {classification && (
            <button className="btn-primary" onClick={exportPdf} disabled={pdfState === "busy"} aria-busy={pdfState === "busy"}>
              {pdfState === "busy" ? "PDF wird erstellt …" : "Als PDF herunterladen"}
            </button>
          )}
          <button className="btn-secondary" onClick={onHistory}>
            Alle Ergebnisse
          </button>
          <button className="btn-secondary" onClick={onHome}>
            Zur Startseite
          </button>
        </div>
        {pdfState === "error" && (
          <p role="alert" className="text-red-800">
            Das PDF konnte nicht erstellt werden. Bitte versuchen Sie es erneut.
          </p>
        )}
      </div>

      <details className="card">
        <summary className="cursor-pointer font-semibold">Begriffe</summary>
        <div className="mt-3">
          <Glossary compact />
        </div>
      </details>
    </div>
  );
}
