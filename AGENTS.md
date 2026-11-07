# AGENTS.md – Projektregeln & Kontext-Leitplanken

Diese Datei definiert verbindliche Architektur-, Code- und Arbeitsregeln für KI-Coding-Agenten in diesem Repository. Lies vor größeren Änderungen immer zuerst `SPEC.md` und diese Datei.

---

## 1. Arbeitsweise („Spec-First“ & Vertikale Schnitte)
1. **Kein Vorauseilen:** Implementiere immer nur **genau den aktuell vereinbarten vertikalen Schnitt (Slice)** aus `SPEC.md`. Baue keine zukünftigen Features auf Vorrat.
2. **Rückfragen vor Annahmen:** Wenn Anforderungen unklar sind, stelle kurze Rückfragen und aktualisiere zuerst `SPEC.md`, bevor Produktivcode geändert wird.
3. **Kleine Git-Commits:** Nach jedem abgeschlossenen, grün getesteten Zwischenschritt erfolgt ein sauberer, atomarer Commit.

---

## 2. Verbindlicher Tech-Stack
- **Sprache:** TypeScript (`strict: true`, `noUncheckedIndexedAccess: true` – keine `any`-Typen!)
- **UI & Styling:** React 19 + Vite + **Tailwind CSS v4** (Utility-Klassen statt großer eigener CSS-Dateien)
- **Karten-Rendering:** `leaflet` + `react-leaflet`
- **Icons:** `lucide-react`
- **Datenhaltung:** Statische Dateien (`public/data/*.geojson`, `src/knowledge/*.json`) und Browser `localStorage`.
- **Optionale Offline-Skripte (`scripts/`):** Python 3.12 mit strikten Type-Hints.

### Strikte No-Gos
- **Kein Cloud-Backend / Keine externen DB-SDKs** (kein Supabase, Firebase, Prisma, Auth0 o. Ä.).
- **Keine neuen NPM-Abhängigkeiten** installieren, ohne dies vorher explizit zu begründen und abzustimmen.
- **Keine großen, monolithischen Dateien:** Jede Datei unter `src/` **muss unter 200 Codezeilen** bleiben (wird durch ESLint `max-lines` überwacht). Komponenten und Hilfsfunktionen frühzeitig aufteilen!

---

## 3. Ordnerstruktur (`src/`)
```text
src/
├── components/      # Kleine, fokussierte UI- & Karten-Komponenten (< 150 Zeilen)
├── config/          # Konstanten, Karten-Bounds & Endpunkt-URLs
├── engine/          # Reine, zustandslose Wissens- & Inferenzlogik + __tests__/
├── knowledge/       # Statische Wissensbasis / Ontologie (JSON)
├── services/        # Lokale Datendienste (localStorage, Open-Meteo Fetcher)
├── types/           # Zentrale TypeScript-Interfaces (Domänenmodell)
├── App.tsx          # Schlanke Haupt-Orchestrierung (< 100 Zeilen)
└── main.tsx         # App-Einstiegspunkt
```

---

## 4. Pflicht-Feedback-Loop vor jedem Abschluss (`npm run verify`)
Führe nach **jeder** Code-Änderung im Terminal den vollständigen Selbsttest aus:

```bash
npm run verify
```

`npm run verify` führt nacheinander aus:
1. `npm run lint` – ESLint (inkl. React-Hooks, TypeScript-Regeln & Datei-Größenlimit)
2. `npm run typecheck` – `tsc --noEmit` (strikte Typprüfung)
3. `npm run test` – `vitest run` (Unit- & Smoke-Tests der Wissenslogik)
4. `npm run build` – Produktions-Build für GitHub Pages

Eine Aufgabe gilt erst als erledigt, wenn `npm run verify` mit Exit-Code `0` durchläuft.
