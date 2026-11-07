# Einrichtung der externen Verknüpfungen (GitHub Pages & Supabase Mini-Backend)

Alle Code-Schnittstellen, Workflows und Fallbacks sind bereits fertig im Repository verdrahtet. Damit andere Personen über einen öffentlichen Link auf die App zugreifen und live Beobachtungen teilen können, sind einmalig diese **2 kostenlosen Schritte** nötig:

---

## Schritt 1: Öffentlichen Zugriff über GitHub Pages aktivieren (1 Minute)

1. Öffne auf GitHub dein Repository: `https://github.com/Drahtesel/SCKM_Prototype`
2. Gehe oben auf **Settings** $\rightarrow$ links im Menü auf **Pages**.
3. Wähle unter **Build and deployment** $\rightarrow$ **Source** die Option **`GitHub Actions`** aus.
4. Sobald der Workflow `Build & Deploy to GitHub Pages` (unter dem Reiter **Actions**) durchgelaufen ist, ist die App öffentlich erreichbar unter:
   - **`https://drahtesel.github.io/SCKM_Prototype/`**

---

## Schritt 2: Kostenloses Mini-Backend (Supabase Free Tier) verknüpfen (3 Minuten)

> **Hinweis:** Solange noch keine Supabase-Zugangsdaten hinterlegt sind, läuft die App automatisch im fehlerfreien **LocalStorage-Fallback-Modus** weiter.

1. Erstelle auf [https://supabase.com](https://supabase.com) ein kostenloses Projekt (z. B. `sckm-mykowis-bw`, Region `Frankfurt eu-central-1`).
2. Öffne im Supabase-Dashboard links den **SQL Editor**, füge den kompletten Inhalt aus [`supabase/schema.sql`](../supabase/schema.sql) ein und klicke auf **Run** (legt die Tabelle `field_observations` inkl. Sicherheitsregeln und Freiburg-Beispieldaten an).
3. Kopiere in Supabase unter **Project Settings $\rightarrow$ API**:
   - **Project URL** (`https://xyz.supabase.co`)
   - **Project API Key (`anon` / `public`)**
4. Hinterlege beide Werte in GitHub unter **Settings $\rightarrow$ Secrets and variables $\rightarrow$ Actions $\rightarrow$ New repository secret**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Für die lokale Entwicklung kannst du `.env.example` zu `.env` kopieren und dieselben beiden Werte eintragen.

---

## Bereits ohne Konfiguration live verknüpfte Dienste (Zero-Key)

| Dienst | Zweck | Endpunkt im Projekt |
| :--- | :--- | :--- |
| **Open-Meteo (DWD ICON-D2)** | Live 14-Tage Regen, Bodentemperatur & Bodenfeuchte Freiburg | `src/services/weatherService.ts` |
| **LGRB Baden-Württemberg** | Offizielle Bodenkarte `GeoLa BK50` (WMS-Overlay) | `src/config/dataSources.ts` |
| **OpenStreetMap & SoilGrids** | Waldtypen & Oberboden-pH-Pipeline für Pilotregion Freiburg | `scripts/fetch_freiburg_geodata.py` |
