# MykoWis BW – Knowledge-Management-Prototyp (`SCKM_Prototype`)

Interaktiver Knowledge-Management-Prototyp (Fach **SCKM**) zur erklärbaren Visualisierung von Pilz-Habitaten entlang der **DIKW-Pyramide** am Beispiel der **Pilotregion Freiburg im Breisgau (Baden-Württemberg)**.

- **Spezifikation & MVP-Roadmap:** [`SPEC.md`](SPEC.md)
- **KI-Kontext- & Architektur-Regeln:** [`AGENTS.md`](AGENTS.md)
- **Live-Deployment (GitHub Pages):** `https://drahtesel.github.io/SCKM_Prototype/` *(einmalig in GitHub unter Settings → Pages → Source: `GitHub Actions` aktivieren)*

---

## Tech-Stack & Best-Practice-Setup
- **Spec-First & Kleiner Scope:** Kein Cloud-Backend, keine Auth – 100 % statische JSON/GeoJSON-Daten + `localStorage`.
- **Stark typisierter Standard-Stack:** Vite + React 19 + TypeScript (`strict`, `noUncheckedIndexedAccess`) + Tailwind CSS v4 + React-Leaflet.
- **Kleine modulare Dateien:** Strikte Obergrenze von max. 200 Codezeilen pro Datei (überwacht durch ESLint `max-lines`).
- **Schneller Feedback-Loop:** Zentrales Prüfkskript `npm run verify` (ESLint + `tsc --noEmit` + Vitest + Produktions-Build).

---

## Lokale Entwicklung & Selbsttest

```bash
npm install
npm run dev
```

Vor jedem Commit den kompletten Qualitäts-Check ausführen:

```bash
npm run verify
```
