import { useState } from "react";
import { DOSHA_NAME, MODE_LABEL, typeLabel } from "../data/content";
import { classify } from "../lib/classify";
import { roundPercentages } from "../lib/scoring";
import type { SavedResult } from "../lib/storage";
import { DOSHAS } from "../schema/questions.schema";
import type { ScoringConfig } from "../schema/scoring.schema";
import { Comparison } from "./Comparison";
import { formatDate } from "./format";

interface Props {
  results: SavedResult[];
  scoring: ScoringConfig;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onHome: () => void;
}

export function History({ results, scoring, onOpen, onDelete, onHome }: Props) {
  const valid = results.filter((r) => r.scored > 0);
  const prakritis = valid.filter((r) => r.mode === "prakriti");
  const vikritis = valid.filter((r) => r.mode === "vikriti");
  const [pId, setPId] = useState(prakritis[0]?.id ?? "");
  const [vId, setVId] = useState(vikritis[0]?.id ?? "");
  const p = prakritis.find((r) => r.id === pId) ?? prakritis[0];
  const v = vikritis.find((r) => r.id === vId) ?? vikritis[0];

  const confirmDelete = (r: SavedResult) => {
    if (window.confirm(`Ergebnis ${MODE_LABEL[r.mode]} vom ${formatDate(r.createdAt)} wirklich löschen?`)) {
      onDelete(r.id);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gespeicherte Ergebnisse</h1>

      {results.length === 0 ? (
        <p>Noch keine Ergebnisse gespeichert.</p>
      ) : (
        <ul className="space-y-3">
          {results.map((r) => {
            const c = r.scored > 0 ? classify(r.percentages, scoring) : null;
            const rounded = roundPercentages(r.percentages);
            return (
              <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-stone-600">
                    {MODE_LABEL[r.mode]} · {formatDate(r.createdAt)}
                  </p>
                  <p className="text-lg font-semibold">{c ? typeLabel(c.kind, c.doshas) : "keine Auswertung"}</p>
                  {c && (
                    <p className="text-sm">{DOSHAS.map((d) => `${DOSHA_NAME[d]} ${rounded[d]} %`).join(" · ")}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary" onClick={() => onOpen(r.id)}>
                    Öffnen
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => confirmDelete(r)}
                    aria-label={`Ergebnis ${MODE_LABEL[r.mode]} vom ${formatDate(r.createdAt)} löschen`}
                  >
                    Löschen
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {p && v && (
        <div className="space-y-4">
          <div className="card grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="font-semibold">Prakriti-Ergebnis</span>
              <select
                className="min-h-[44px] rounded-lg border border-stone-400 bg-white px-3"
                value={p.id}
                onChange={(e) => setPId(e.target.value)}
              >
                {prakritis.map((r) => (
                  <option key={r.id} value={r.id}>
                    {formatDate(r.createdAt)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-semibold">Vikriti-Ergebnis</span>
              <select
                className="min-h-[44px] rounded-lg border border-stone-400 bg-white px-3"
                value={v.id}
                onChange={(e) => setVId(e.target.value)}
              >
                {vikritis.map((r) => (
                  <option key={r.id} value={r.id}>
                    {formatDate(r.createdAt)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Comparison prakriti={p} vikriti={v} scoring={scoring} />
        </div>
      )}

      <button className="btn-secondary" onClick={onHome}>
        Zur Startseite
      </button>
    </div>
  );
}
