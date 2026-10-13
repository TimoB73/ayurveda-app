import type { ReactNode } from "react";

export function Layout({
  children,
  onHome,
  storageWarning,
}: {
  children: ReactNode;
  onHome: () => void;
  storageWarning: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2"
      >
        Zum Inhalt springen
      </a>
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <button onClick={onHome} className="text-left text-lg font-bold text-amber-900 hover:underline">
            Ayurveda-Konstitutionstest
          </button>
        </div>
      </header>
      {storageWarning && (
        <div role="status" className="border-b border-amber-300 bg-amber-50">
          <p className="mx-auto max-w-3xl px-4 py-2 text-sm text-amber-950">
            Hinweis: Ihr Browser erlaubt derzeit keine lokale Speicherung (z. B. im privaten Modus). Zwischenstände
            und Ergebnisse gehen beim Schließen der Seite verloren.
          </p>
        </div>
      )}
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 focus:outline-none">
        {children}
      </main>
      <footer className="border-t border-stone-200 bg-white">
        <p className="mx-auto max-w-3xl px-4 py-4 text-sm text-stone-600">
          Alle Angaben bleiben ausschließlich in Ihrem Browser. Es werden keine Daten übertragen.
        </p>
      </footer>
    </div>
  );
}
