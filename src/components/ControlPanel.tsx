import type { MapColorMode, SpeciesRule, WeatherContext } from '../types/knowledge';

interface ControlPanelProps {
  speciesList: SpeciesRule[];
  selectedSpeciesId: string;
  onSelectSpecies: (id: string) => void;
  colorMode: MapColorMode;
  onChangeColorMode: (mode: MapColorMode) => void;
  weatherMode: string;
  onChangeWeatherMode: (mode: string) => void;
  showLgrbWms: boolean;
  onToggleLgrbWms: (checked: boolean) => void;
  activeWeather: WeatherContext;
}

export function ControlPanel({
  speciesList,
  selectedSpeciesId,
  onSelectSpecies,
  colorMode,
  onChangeColorMode,
  weatherMode,
  onChangeWeatherMode,
  showLgrbWms,
  onToggleLgrbWms,
  activeWeather,
}: ControlPanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        DIKW-Steuerung & Karten-Layer
      </h2>

      <div className="space-y-1">
        <label htmlFor="species-select" className="block text-xs font-medium text-slate-700">
          Ziel-Pilzart (Wissensregelwerk)
        </label>
        <select
          id="species-select"
          value={selectedSpeciesId}
          onChange={(e) => onSelectSpecies(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800"
        >
          {speciesList.map((sp) => (
            <option key={sp.id} value={sp.id}>
              {sp.germanName} ({sp.scientificName})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="layer-mode" className="block text-xs font-medium text-slate-700">
          Karten-Darstellung (Rohdaten vs. Wissen)
        </label>
        <select
          id="layer-mode"
          value={colorMode}
          onChange={(e) => onChangeColorMode(e.target.value as MapColorMode)}
          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800"
        >
          <option value="suitability">Wissens-Layer: Kombinierter Eignungs-Score</option>
          <option value="soil_ph">Rohdaten-Layer: Boden-pH-Wert (Sauer vs. Kalk)</option>
          <option value="forest_type">Rohdaten-Layer: Waldtyp (Laub / Nadel / Misch)</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="weather-mode" className="block text-xs font-medium text-slate-700">
          Wetter-Kontext (Dynamischer Trigger)
        </label>
        <select
          id="weather-mode"
          value={weatherMode}
          onChange={(e) => onChangeWeatherMode(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800"
        >
          <option value="autumn_flush">Simulation: Spätsommer-/Herbstregen</option>
          <option value="spring_morel">Simulation: Milder April (Morchelzeit)</option>
          <option value="summer_dry">Simulation: Trockenperiode im Hochsommer</option>
          <option value="live">Live-Wetter Freiburg (Open-Meteo API)</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-0.5">
        <input
          type="checkbox"
          checked={showLgrbWms}
          onChange={(e) => onToggleLgrbWms(e.target.checked)}
          className="rounded border-slate-300"
        />
        Offizielle LGRB-BW Bodenkarte BK50 (WMS) einblenden
      </label>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <span className="block text-[11px] text-slate-500">Regen (14 Tage)</span>
          <strong className="text-sm text-slate-900">{activeWeather.rain14dMm} mm</strong>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <span className="block text-[11px] text-slate-500">Bodentemp. (0–7 cm)</span>
          <strong className="text-sm text-slate-900">{activeWeather.soilTemp0to7cmC} °C</strong>
        </div>
      </div>
    </section>
  );
}
