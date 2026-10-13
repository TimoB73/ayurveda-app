# Ayurveda-Konstitutionstest

Web-App zur Selbsteinschätzung der ayurvedischen Konstitution per Fragebogen – mit zwei Modi:

- **Prakriti** (Prakṛti): angeborene Grundkonstitution – „Wie war es die meiste Zeit Ihres Lebens?“
- **Vikriti** (Vikṛti): aktueller Zustand – „Wie ist es in den letzten Wochen?“

Sind beide Fragebögen ausgefüllt, stellt die App sie gegenüber und zeigt, welches Dosha derzeit erhöht ist.

> **Hinweis:** Dies ist eine Selbsteinschätzung und keine medizinische Diagnose. Eine verlässliche Bestimmung
> erfolgt durch eine ausgebildete Ayurveda-Fachperson (u. a. mit Pulsdiagnose).

**Datenschutz:** Kein Backend, keine Datenübertragung, keine externen Schriften oder Skripte. Zwischenstände und
Ergebnisse liegen ausschließlich im `localStorage` Ihres Browsers.

## Starten

Voraussetzung: [Node.js](https://nodejs.org/) ab Version 18.

```bash
npm install        # Abhängigkeiten installieren
npm run dev        # Entwicklungsserver starten → http://localhost:5173
npm test           # Unit-Tests (Vitest)
npm run build      # Typprüfung + Produktions-Build nach dist/
npm run preview    # Produktions-Build lokal ansehen
```

Der Inhalt von `dist/` ist eine statische Website und kann auf jedem Webserver (oder lokal) betrieben werden.

## Online-Version (GitHub Pages)

Bei jeder Änderung auf `main` testet und baut `.github/workflows/deploy.yml` die App automatisch und
veröffentlicht sie unter **https://timob73.github.io/ayurveda-app/**.

Einmalige Einrichtung im Repository: **Settings → Pages → Build and deployment → Source: „GitHub Actions“**.

### Als App installieren

Die App ist eine installierbare Web-App (PWA) mit Service Worker: Sie erscheint nach der Installation in der
App-Übersicht, startet ohne Browserleiste und funktioniert auch offline. Neue Versionen werden beim nächsten Start
automatisch geladen.

- **Android (Chrome, Samsung Internet):** Adresse öffnen und auf **„Als App installieren“** tippen (Hinweis auf
  der Startseite) oder im Browser-Menü **„App installieren“** wählen.
- **iPhone/iPad (Safari):** Teilen-Symbol → **„Zum Home-Bildschirm“**.

Konfiguriert wird das über `vite-plugin-pwa` in `vite.config.ts` (Manifest, Symbole, Offline-Cache).

## Projektstruktur

```
src/
├─ data/
│  ├─ questions.json     ← Fragenkatalog (selbst bearbeitbar)
│  ├─ scoring.json       ← Schwellwerte der Auswertung (selbst bearbeitbar)
│  ├─ content.ts         ← Fachtexte: Gunas, Stärken, Ungleichgewichtszeichen, Hinweise, 7 Typen
│  └─ catalog.ts         ← lädt und validiert die beiden JSON-Dateien
├─ schema/               ← zod-Schemata für questions.json und scoring.json
├─ lib/                  ← reine Logik ohne React (vollständig getestet)
│  ├─ scoring.ts         ← Prozentanteile
│  ├─ classify.ts        ← Typbestimmung (7 Konstitutionstypen)
│  ├─ compare.ts         ← Vergleich Prakriti und Vikriti
│  ├─ shuffle.ts         ← stabile Zufallsreihenfolge der Antworten
│  ├─ storage.ts         ← localStorage (alle Zugriffe in try/catch)
│  └─ pdf.ts             ← PDF-Export (wird erst beim Klick geladen)
├─ components/           ← Oberfläche
└─ assets/fonts/         ← Noto Sans (SIL OFL) für Diakritika im PDF
tests/                   ← Vitest-Tests
```

## Fragen anpassen

Alle Fragen stehen in **`src/data/questions.json`**. Beim Start prüft die App die Datei mit zod. Fehler
(z. B. doppelte IDs, unbekannte Kategorie, fehlende Antwortoption) werden mit Pfad und Klartext angezeigt statt
einer leeren Seite. `npm test` prüft die Datei ebenfalls.

```json
{
  "id": "haut-beschaffenheit",
  "category": "haut",
  "prompt": "Meine Haut ist …",
  "modes": ["prakriti", "vikriti"],
  "options": {
    "vata": "eher trocken, rau und dünn",
    "pitta": "warm und empfindlich; sie rötet sich leicht",
    "kapha": "dick, weich und glatt, eher feucht oder ölig"
  }
}
```

| Feld | Bedeutung |
|---|---|
| `id` | eindeutiger Schlüssel. **Nicht ändern**, wenn bereits Zwischenstände oder Ergebnisse gespeichert sind – Antworten werden über die ID zugeordnet. |
| `category` | muss einer `id` aus `categories` entsprechen. Jede Kategorie wird als eigene Seite angezeigt (in der Reihenfolge der `categories`-Liste). |
| `prompt` | Satzanfang bzw. Frage. |
| `options` | genau drei Antworten – je eine für `vata`, `pitta`, `kapha`. Die Reihenfolge in der Datei spielt keine Rolle: Die App mischt sie pro Frage und Durchgang zufällig (stabil beim Zurückblättern und Neuladen). „trifft nicht zu / weiß nicht“ wird automatisch ergänzt und nicht gewertet. |
| `modes` | optional. Ohne Angabe gilt die Frage für beide Modi. `["prakriti"]` blendet sie im Vikriti-Test aus (z. B. Körperbau, Augen – Merkmale, die sich in wenigen Wochen nicht ändern). |

**Tipps:** Aussagen beobachtbar und konkret formulieren („Meine Haut ist eher trocken und rau“), nicht wertend.
Die drei Antworten sollten ähnlich lang sein, damit keine durch ihre Form auffällt. Kategorien kommen hinzu,
indem Sie sie in `categories` ergänzen. Der Test erwartet 30–36 Fragen; passen Sie bei Bedarf
`tests/schema.test.ts` an.

## Schwellwerte anpassen

Die Typbestimmung wird über **`src/data/scoring.json`** gesteuert (Werte in Prozent bzw. Prozentpunkten):

```json
{
  "single": { "minTop": 50, "minGap": 15 },
  "dual":   { "maxGap": 10, "minSum": 70 },
  "tri":    { "min": 28, "max": 38 },
  "minAnsweredRatio": 0.6,
  "vikritiElevatedDelta": 5
}
```

**Berechnung:** Je Dosha wird gezählt, wie oft eine zugehörige Antwort gewählt wurde. Die Anteile beziehen sich auf
alle gewerteten Antworten („weiß nicht“ zählt nicht mit).

**Prüfreihenfolge** (die erste passende Regel gilt):

1. **Tridosha** (Vata-Pitta-Kapha): Alle drei Anteile liegen zwischen `tri.min` und `tri.max`.
2. **Eindosha** (Vata, Pitta oder Kapha): Das höchste Dosha erreicht mindestens `single.minTop` und liegt mindestens
   `single.minGap` Punkte vor dem zweiten.
3. **Doppeldosha** (Vata-Pitta, Pitta-Kapha, Vata-Kapha): Die zwei stärksten liegen höchstens `dual.maxGap` Punkte
   auseinander und erreichen zusammen mindestens `dual.minSum`. Das dominante Dosha wird zuerst genannt
   (z. B. „Pitta-Vata“).
4. **Ersatzregel**, wenn keine Regel passt (z. B. 55/42/3): Liegt das höchste Dosha mindestens `single.minGap`
   Punkte vorn, gilt Eindosha, sonst Doppeldosha aus den beiden stärksten. Das Ergebnis wird als **Grenzfall**
   gekennzeichnet.

Bei exaktem Gleichstand entscheidet die feste Reihenfolge Vata > Pitta > Kapha. Hängt die Benennung davon ab, wird
ebenfalls „Grenzfall“ angezeigt.

| Wert | Wirkung |
|---|---|
| `minAnsweredRatio` | Werden weniger Fragen gewertet (z. B. 0,6 = 60 %), erscheint der Hinweis „wenig aussagekräftig“. |
| `vikritiElevatedDelta` | Ab dieser Differenz (Vikriti minus Prakriti, in Punkten) gilt ein Dosha als „derzeit erhöht“. |

Gespeichert werden nur die Antworten und Prozentanteile. Der Typ wird bei jeder Anzeige mit den **aktuellen**
Schwellwerten neu bestimmt; geänderte Werte wirken also auch auf ältere Ergebnisse.

Nach jeder Änderung `npm test` ausführen. Die Tests in `tests/classify.test.ts` beziehen sich auf die
Standardwerte. Wenn Sie die Regeln bewusst ändern, passen Sie die dortigen Grenzfälle an.

## Fachliche Grundlagen

- Die drei **Doṣas** (Doshas) Vāta, Pitta, Kapha und ihre **Guṇas** (Eigenschaften):
  Vata – trocken, leicht, kalt, rau, beweglich; Pitta – heiß, scharf, leicht ölig, intensiv;
  Kapha – schwer, kühl, ölig, stabil, weich.
- Die Triguṇas des Geistes (Sattva, Rajas, Tamas) sind bewusst **nicht** Teil dieses Tests.
- Sanskrit-Begriffe werden in der Oberfläche einmal mit Diakritika eingeführt und danach vereinfacht geschrieben.
- Die Texte in `src/data/content.ts` können Sie ebenfalls anpassen.

## Barrierearmut

Echte Radio-Buttons in `fieldset`/`legend` (Tastatur: Tab, Pfeiltasten, Leertaste), sichtbarer Fokus, Fokus springt
bei Seitenwechsel auf die Überschrift, Fortschrittsbalken mit `aria-valuetext`, Diagramme zusätzlich als Tabelle für
Screenreader, Kontraste nach WCAG AA, Dosha-Farben auf Unterscheidbarkeit bei Farbsehschwäche geprüft und immer
zusätzlich beschriftet.

## Lizenzen

Die eingebettete Schrift Noto Sans steht unter der SIL Open Font License 1.1 (`src/assets/fonts/OFL.txt`).
