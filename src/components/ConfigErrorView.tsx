import type { ConfigError } from "../data/catalog";

export function ConfigErrorView({ error }: { error: ConfigError }) {
  return (
    <main className="mx-auto max-w-3xl p-4">
      <div role="alert" className="card border-red-300">
        <h1 className="text-xl font-bold text-red-800">Die Konfiguration ist fehlerhaft</h1>
        <p className="mt-2">
          Bitte korrigieren Sie die Datei <code className="font-mono">{error.file}</code>:
        </p>
        <ul className="mt-3 space-y-1 font-mono text-sm">
          {error.issues.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
