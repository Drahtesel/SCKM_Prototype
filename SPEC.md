# SPEC.md – Mini-PRD: MykoWis BW (Knowledge-Management-Prototyp)

## 1. Problem & Projektziel (Fach: Knowledge Management / SCKM)
Bestehende Pilz-Apps zeigen meist intransparente „Blackbox-Heatmaps“ (z. B. *78 % Wahrscheinlichkeit*), ohne zu erklären, **warum** ein Standort geeignet ist.

**Ziel des Prototyps:** Implizites Erfahrungswissen der Pilzsuche (*Tacit Knowledge*) in eine explizite, regelbasierte Wissensbasis (*Explicit Knowledge*) überführen und entlang der **DIKW-Pyramide** (*Data $\rightarrow$ Information $\rightarrow$ Knowledge $\rightarrow$ Decision*) auf einer Karte für die **Pilotregion Freiburg (Baden-Württemberg)** transparent visualisieren.

---

## 2. Kern-Use-Case (MVP Scope)
Ein Nutzer wählt eine **Pilzart** (oder klickt ein **Waldgebiet** in der Region Freiburg an) und erkennt sofort:
1. **Wo** die ökologischen Faktoren (Baumpartner, Boden-pH, 14-Tage-Regen, Bodentemperatur) zusammenpassen.
2. **Warum** ein Gebiet geeignet oder ausgeschlossen ist (*Glass-Box-Erklärung* pro Regel statt Blackbox-Score).
3. **Woran vor Ort** die Geodaten überprüft werden können (*Zeigerpflanzen* für sauren vs. kalkhaltigen Boden & *Doppelgänger-Warnung*).

### Bewusste Nicht-Ziele (Out of Scope für MVP)
- **Kein Cloud-Backend / Keine Datenbank-Server** (ausschließlich statische JSON/GeoJSON-Dateien + optional `localStorage`).
- **Keine Benutzerkonten, Authentifizierung oder Rollenmodelle.**
- **Keine deutschlandweite Skalierung** (fester Kartenausschnitt Freiburg: kalkreiche Vorbergzone am Schönberg vs. saurer Kristallin-Schwarzwald).
- **Keine KI-Fotoerkennung** (Fokus liegt rein auf Wissensrepräsentation & Geodaten-Ableitung).

---

## 3. Tech-Stack & Datenhaltung
- **Frontend:** Vite + React 19 + TypeScript (`strict: true`) + Tailwind CSS v4
- **Karte:** Leaflet / `react-leaflet` + OpenStreetMap + optionales LGRB-BW Bodenkarten-WMS-Overlay
- **Datenhaltung (100 % lokal/statisch):**
  - `public/data/freiburg_habitats.geojson` – Statische Wald-Habitate (Waldtyp, Baumarten, Boden-pH, Höhe, Exposition)
  - `src/knowledge/ontology.json` – Explizite Wissensregeln (Pilzarten, Symbiosebäume, pH-Grenzen, Regenbedarf, Zeigerpflanzen)
  - `localStorage` – Lokale Speicherung eigener Test-Feldnotizen im Browser
  - Wetter-Kontext: Statische Simulationsprofile (Herbstregen, Frühlingsmorcheln, Sommerdürre) + optionaler clientseitiger Abruf von Open-Meteo (ohne API-Key)

---

## 4. Iterative Umsetzung in vertikalen Schnitten (Slices)

| Slice | Fokus (End-to-End vertikal) | Status |
| :--- | :--- | :--- |
| **Slice 0** | **Fundament & Best Practices:** Repo-Setup, `SPEC.md`, `AGENTS.md`, Linter/Typecheck/Smoke-Tests (`npm run verify`), modulares Grundgerüst mit statischen Freiburg-Daten. | ✅ Erledigt |
| **Slice 1** | **Kern-Flow *Pilz $\leftrightarrow$ Ort* & DIKW-Layer-Vergleich:** Auswahl einer Pilzart (6 Arten), Umschalten zwischen Rohdaten-Layern (Boden-pH, Waldtyp) inkl. Karten-Legende, 75 OSM-Waldparzellen (Hybrid/Heatmap) und Standort-Ranking. | ✅ Erledigt |
| **Slice 2** | **Interaktiver Wissensgraph:** Visuelle Darstellung der Beziehungen (`Boden-pH ↔ Baum ↔ Pilz ↔ Zeigerpflanze`), synchron gekoppelt mit Karte und aktivem Standort. | ✅ Aktiv |
| **Slice 3** | **Lokales Erfahrungswissen (`localStorage`):** Einfaches Eintragen & Anzeigen lokaler Vor-Ort-Beobachtungen zur Demonstration des SECI-Wissenskreislaufs. | ⏳ Geplant |
