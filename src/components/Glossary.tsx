import { GLOSSARY } from "../data/content";

/** Führt die Sanskrit-Begriffe einmal mit Diakritika ein. */
export function Glossary({ compact = false }: { compact?: boolean }) {
  return (
    <dl className={compact ? "space-y-2 text-sm" : "space-y-3"}>
      {GLOSSARY.map((g) => (
        <div key={g.term}>
          <dt className="font-semibold">
            <span lang="sa-Latn">{g.term}</span>
            {g.simple !== g.term && <span className="font-normal text-stone-600"> (vereinfacht: {g.simple})</span>}
          </dt>
          <dd className="text-stone-700">{g.text}</dd>
        </div>
      ))}
    </dl>
  );
}
