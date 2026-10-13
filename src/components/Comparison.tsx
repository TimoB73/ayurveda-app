import { DOSHA_INFO, DOSHA_NAME } from "../data/content";
import { comparePrakritiVikriti } from "../lib/compare";
import type { SavedResult } from "../lib/storage";
import type { ScoringConfig } from "../schema/scoring.schema";
import { CompareChart } from "./Charts";
import { formatDate, formatDelta } from "./format";

export function Comparison({
  prakriti,
  vikriti,
  scoring,
}: {
  prakriti: SavedResult;
  vikriti: SavedResult;
  scoring: ScoringConfig;
}) {
  const c = comparePrakritiVikriti(prakriti.percentages, vikriti.percentages, scoring);
  return (
    <section aria-labelledby="compare-title" className="card space-y-4">
      <div>
        <h2 id="compare-title" className="text-xl font-bold">
          Prakriti und Vikriti im Vergleich
        </h2>
        <p className="text-sm text-stone-600">
          Prakriti vom {formatDate(prakriti.createdAt)} · Vikriti vom {formatDate(vikriti.createdAt)}
        </p>
      </div>
      <CompareChart prakriti={prakriti.percentages} vikriti={vikriti.percentages} />
      <ul className="grid gap-2 sm:grid-cols-3">
        {c.deltas.map((d) => (
          <li key={d.dosha} className="rounded-lg border border-stone-200 p-3">
            <span className="font-semibold">{DOSHA_NAME[d.dosha]}</span>
            <span className="block">Abweichung: {formatDelta(d.delta)}</span>
          </li>
        ))}
      </ul>
      {c.balanced ? (
        <p className="rounded-lg bg-stone-50 p-3">
          Kein Dosha ist derzeit um {scoring.vikritiElevatedDelta} Punkte oder mehr gegenüber Ihrer Grundkonstitution
          erhöht. Ihr aktueller Zustand entspricht weitgehend Ihrer Prakriti.
        </p>
      ) : (
        <div className="space-y-3">
          {c.elevated.map((d) => (
            <div key={d.dosha} className="rounded-lg border-2 border-amber-700 bg-amber-50 p-3">
              <p className="font-semibold">
                {DOSHA_NAME[d.dosha]} ist derzeit erhöht ({formatDelta(d.delta)}).
              </p>
              <p className="mt-1 text-sm">
                Typische Zeichen: {DOSHA_INFO[d.dosha].imbalance.slice(0, 4).join("; ")}.
              </p>
              <p className="mt-1 text-sm">
                Ausgleichend: {DOSHA_INFO[d.dosha].balance.rhythm[0]}. Ernährung –{" "}
                {DOSHA_INFO[d.dosha].balance.nutrition[0].replace("Qualitäten: ", "")}.
              </p>
            </div>
          ))}
          <p className="text-sm text-stone-700">
            Im Ayurveda gilt: Ziel ist nicht, alle Doshas gleich stark zu machen, sondern zur eigenen Prakriti
            zurückzufinden.
          </p>
        </div>
      )}
    </section>
  );
}
