import { DOSHA_INFO, DOSHA_NAME } from "../data/content";
import type { Dosha } from "../schema/questions.schema";

const ACCENT: Record<Dosha, string> = {
  vata: "border-vata",
  pitta: "border-pitta",
  kapha: "border-kapha",
};

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

export function DoshaDetails({ dosha }: { dosha: Dosha }) {
  const info = DOSHA_INFO[dosha];
  const headingId = `details-${dosha}`;
  return (
    <section aria-labelledby={headingId} className={`card space-y-4 border-l-4 ${ACCENT[dosha]}`}>
      <div>
        <h3 id={headingId} className="text-xl font-bold">
          {DOSHA_NAME[dosha]}
        </h3>
        <p className="text-sm text-stone-700">
          Elemente: {info.elements}. {info.principle}
        </p>
      </div>
      <div>
        <h4 className="font-semibold">Gunas (Eigenschaften)</h4>
        <ul className="mt-1 flex flex-wrap gap-2">
          {info.gunas.map((g) => (
            <li key={g} className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-sm">
              {g}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="font-semibold">Typische Stärken</h4>
          <List items={info.strengths} />
        </div>
        <div>
          <h4 className="font-semibold">Typische Zeichen eines Ungleichgewichts</h4>
          <List items={info.imbalance} />
        </div>
      </div>
      <div className="space-y-3 rounded-lg bg-stone-50 p-3">
        <h4 className="font-semibold">Allgemeine ausgleichende Hinweise</h4>
        <div>
          <h5 className="text-sm font-semibold uppercase tracking-wide text-stone-600">Tagesrhythmus</h5>
          <List items={info.balance.rhythm} />
        </div>
        <div>
          <h5 className="text-sm font-semibold uppercase tracking-wide text-stone-600">Klima</h5>
          <List items={info.balance.climate} />
        </div>
        <div>
          <h5 className="text-sm font-semibold uppercase tracking-wide text-stone-600">Ernährungsqualitäten</h5>
          <List items={info.balance.nutrition} />
        </div>
      </div>
    </section>
  );
}
