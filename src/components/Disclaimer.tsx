import { DISCLAIMER } from "../data/content";

export function Disclaimer() {
  return (
    <aside
      role="note"
      aria-label="Wichtiger Hinweis"
      className="flex gap-3 rounded-xl border-2 border-amber-700 bg-amber-50 p-4 text-amber-950"
    >
      <span aria-hidden="true" className="text-2xl leading-none">
        ⚠
      </span>
      <p className="font-medium">
        <strong>Wichtiger Hinweis:</strong> {DISCLAIMER}
      </p>
    </aside>
  );
}
