# MykoWis BW – Knowledge-Management-Prototyp (`SCKM_Prototype`)

Interaktiver Knowledge-Management-Prototyp (Fach **SCKM**) zur erklärbaren Visualisierung von Pilz-Habitaten und mykologischem Standortwissen am Beispiel der **Pilotregion Freiburg im Breisgau – Vorbergzone & Schwarzwald (Baden-Württemberg)**.

- **GitHub Repository:** [https://github.com/Drahtesel/SCKM_Prototype](https://github.com/Drahtesel/SCKM_Prototype)
- **Geplante Live-URL (GitHub Pages):** [https://drahtesel.github.io/SCKM_Prototype/](https://drahtesel.github.io/SCKM_Prototype/)

---

## 1. Konzept & Wissensarchitektur (DIKW-Pyramide)

Statt einer intransparenten „Blackbox-Heatmap“ übersetzt **MykoWis BW** implizites Sammlerwissen (*Tacit Knowledge*) in eine explizite, regelbasierte Wissensstruktur (*Explicit Knowledge*):

1. **Data (Rohdaten – Frei zugängliche Geodaten BW):**
   - **OpenStreetMap (Overpass API):** Waldpolygone & `leaf_type` (`broadleaved`, `needleleaved`, `mixed`)
   - **LGRB Baden-Württemberg (Regierungspräsidium Freiburg):** Offizielle Bodenkarte `GeoLa BK50` als OGC-WMS-Dienst (`services.lgrb-bw.de/ms/lgrb_geola_bod`)
   - **ISRIC SoilGrids v2.0:** Oberboden-pH-Wert (`phh2o` in 0–15 cm Tiefe)
   - **Open-Meteo API (DWD ICON-D2 / ERA5):** Live 14-Tage-Niederschlagssumme, Bodentemperatur (`0–7 cm`) & Bodenfeuchte ohne API-Key
2. **Information:** Räumlich verschnittene Habitat-Zonen (`public/data/freiburg_habitats.geojson`) entlang des ökologischen Kontrasts zwischen kalkreicher Vorbergzone (*Schönberg*, pH ~7,2) und kristallinem, saurem Schwarzwald (*Roßkopf / Sternwald / Schauinsland*, pH ~4,0–4,5).
3. **Knowledge:** Strukturierte JSON-Ontologie (`src/knowledge/ontology.json`) + transparente Glass-Box-Inferenz (`src/engine/inferenceEngine.ts`) inkl. Zeigerpflanzen und Doppelgänger-Warnwissen.
4. **Wisdom / Kollaboration (SECI-Kreislauf):** Interaktive Entscheidungskarte + angebundenes Mini-Backend (**Supabase PostgreSQL** mit automatischem LocalStorage-Fallback) für Vor-Ort-Beobachtungen.

---

## 2. Projektstruktur

```text
SCKM_Prototype/
├── .github/workflows/
│   ├── deploy.yml               # Automatisches Build & Deployment auf GitHub Pages
│   └── refresh-geodata.yml      # Manueller Workflow zur Aktualisierung der BW-Geodaten
├── docs/
│   └── EINRICHTUNG_VERKNUEPFUNGEN.md  # Kurzanleitung für GitHub Pages & Supabase Secrets
├── public/data/
│   └── freiburg_habitats.geojson      # Vorberechnete Habitat-Zonen Freiburg (BW)
├── scripts/
│   ├── fetch_freiburg_geodata.py      # Python-Pipeline (OSM + SoilGrids + Open-Meteo DEM)
│   └── requirements.txt
├── src/
│   ├── config/dataSources.ts    # Zentrale Endpunkte (LGRB BW WMS, Open-Meteo, OSM)
│   ├── engine/                  # Glass-Box Inferenz-Engine & Vitest Unit-Tests
│   ├── knowledge/ontology.json  # Explizite Wissensbasis (Pilze, Bäume, pH, Zeigerpflanzen)
│   ├── services/                # Live-Wetter-Client & Supabase Mini-Backend-Connector
│   ├── types/knowledge.ts       # TypeScript-Domänenmodell
│   └── App.tsx                  # Interaktive Karten- & Architektur-Oberfläche
└── supabase/
    └── schema.sql               # Datenbankschema & RLS-Policies für das kostenlose Mini-Backend
```

---

## 3. Lokale Entwicklung starten

```bash
npm install
npm run dev
```

Tests & Produktions-Build prüfen:

```bash
npm run typecheck
npm run test
npm run build
```

Details zur Aktivierung von **GitHub Pages** und dem kostenlosen **Supabase Mini-Backend** stehen in [`docs/EINRICHTUNG_VERKNUEPFUNGEN.md`](docs/EINRICHTUNG_VERKNUEPFUNGEN.md).
