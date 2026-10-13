import { useCallback, useMemo, useState } from "react";
import { ConfigError, loadConfig } from "./data/catalog";
import { evaluate } from "./lib/scoring";
import { newSeed } from "./lib/shuffle";
import {
  clearDraft,
  deleteResult,
  loadDrafts,
  loadResults,
  saveDraft,
  saveResult,
  type Draft,
  type SavedResult,
} from "./lib/storage";
import type { Mode } from "./schema/questions.schema";
import { Home } from "./components/Home";
import { Quiz } from "./components/Quiz";
import { ResultView } from "./components/ResultView";
import { History } from "./components/History";
import { ConfigErrorView } from "./components/ConfigErrorView";
import { Layout } from "./components/Layout";

type View =
  | { name: "home" }
  | { name: "quiz"; mode: Mode }
  | { name: "result"; id: string }
  | { name: "history" };

function newDraft(mode: Mode): Draft {
  return { mode, seed: newSeed(), answers: {}, page: 0, startedAt: new Date().toISOString() };
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export default function App() {
  const config = useMemo(() => {
    try {
      return { ok: true as const, ...loadConfig() };
    } catch (e) {
      if (e instanceof ConfigError) return { ok: false as const, error: e };
      throw e;
    }
  }, []);

  const [view, setView] = useState<View>({ name: "home" });
  const [drafts, setDrafts] = useState(() => loadDrafts());
  const [results, setResults] = useState<SavedResult[]>(() => loadResults());
  // Ergebnisse, die nicht gespeichert werden konnten (z. B. privater Modus), bleiben für diese Sitzung im Speicher.
  const [unsaved, setUnsaved] = useState<SavedResult[]>([]);
  const [storageWarning, setStorageWarning] = useState(false);

  const allResults = useMemo(
    () => [...unsaved, ...results].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [unsaved, results],
  );

  const navigate = useCallback((v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  }, []);

  if (!config.ok) return <ConfigErrorView error={config.error} />;
  const { catalog, scoring } = config;

  const startQuiz = (mode: Mode, fresh: boolean) => {
    if (fresh || !drafts[mode]) {
      const d = newDraft(mode);
      if (!saveDraft(d)) setStorageWarning(true);
      setDrafts((prev) => ({ ...prev, [mode]: d }));
    }
    navigate({ name: "quiz", mode });
  };

  const persistDraft = (d: Draft) => {
    setDrafts((prev) => ({ ...prev, [d.mode]: d }));
    if (!saveDraft(d)) setStorageWarning(true);
  };

  const finishQuiz = (d: Draft) => {
    const e = evaluate(catalog.questions, d.answers, d.mode, scoring);
    const result: SavedResult = {
      id: newId(),
      mode: d.mode,
      createdAt: new Date().toISOString(),
      answers: d.answers,
      percentages: e.percentages,
      scored: e.scored,
      total: e.total,
    };
    if (saveResult(result)) {
      setResults(loadResults());
    } else {
      setUnsaved((prev) => [result, ...prev]);
      setStorageWarning(true);
    }
    clearDraft(d.mode);
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[d.mode];
      return next;
    });
    navigate({ name: "result", id: result.id });
  };

  const removeResult = (id: string) => {
    deleteResult(id);
    setUnsaved((prev) => prev.filter((r) => r.id !== id));
    setResults(loadResults());
  };

  let content: JSX.Element;
  switch (view.name) {
    case "home":
      content = (
        <Home
          catalog={catalog}
          drafts={drafts}
          results={allResults}
          scoring={scoring}
          onStart={startQuiz}
          onOpenResult={(id) => navigate({ name: "result", id })}
          onOpenHistory={() => navigate({ name: "history" })}
        />
      );
      break;
    case "quiz": {
      const draft = drafts[view.mode] ?? newDraft(view.mode);
      content = (
        <Quiz
          key={`${draft.mode}-${draft.startedAt}`}
          catalog={catalog}
          initialDraft={draft}
          onChange={persistDraft}
          onFinish={finishQuiz}
          onExit={() => navigate({ name: "home" })}
        />
      );
      break;
    }
    case "result": {
      const result = allResults.find((r) => r.id === view.id);
      content = result ? (
        <ResultView
          result={result}
          allResults={allResults}
          catalog={catalog}
          scoring={scoring}
          onHome={() => navigate({ name: "home" })}
          onHistory={() => navigate({ name: "history" })}
          onStart={(mode) => startQuiz(mode, true)}
        />
      ) : (
        <div className="card">
          <p>Dieses Ergebnis wurde nicht gefunden.</p>
          <button className="btn-secondary mt-4" onClick={() => navigate({ name: "home" })}>
            Zur Startseite
          </button>
        </div>
      );
      break;
    }
    case "history":
      content = (
        <History
          results={allResults}
          scoring={scoring}
          onOpen={(id) => navigate({ name: "result", id })}
          onDelete={removeResult}
          onHome={() => navigate({ name: "home" })}
        />
      );
      break;
  }

  return (
    <Layout onHome={() => navigate({ name: "home" })} storageWarning={storageWarning}>
      {content}
    </Layout>
  );
}
