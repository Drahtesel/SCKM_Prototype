import type { MapColorMode } from '../types/knowledge';

interface MapLegendProps {
  colorMode: MapColorMode;
  speciesName: string;
}

interface LegendItem {
  color: string;
  label: string;
}

export function MapLegend({ colorMode, speciesName }: MapLegendProps) {
  let title = `Eignung: ${speciesName}`;
  let items: LegendItem[] = [
    { color: '#16a34a', label: '≥ 60% Optimal geeignet' },
    { color: '#f59e0b', label: '25–59% Eingeschränkt' },
    { color: '#ef4444', label: '< 25% / Ausgeschlossen' },
  ];

  if (colorMode === 'soil_ph') {
    title = 'Rohdaten: Boden-pH-Wert';
    items = [
      { color: '#2563eb', label: 'pH < 4,8 (Stark sauer)' },
      { color: '#0d9488', label: 'pH 4,8–5,9 (Mäßig sauer)' },
      { color: '#eab308', label: 'pH 6,0–6,7 (Neutral)' },
      { color: '#9333ea', label: 'pH ≥ 6,8 (Kalkhaltig)' },
    ];
  } else if (colorMode === 'forest_type') {
    title = 'Rohdaten: Waldtyp (OSM)';
    items = [
      { color: '#14532d', label: 'Nadelwald (Fichte/Tanne/Kiefer)' },
      { color: '#0f766e', label: 'Mischwald' },
      { color: '#65a30d', label: 'Laubwald (Buche/Eiche/Esche)' },
    ];
  }

  return (
    <div
      data-testid="map-legend"
      className="absolute bottom-5 right-5 z-[1000] rounded-xl border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur-xs"
    >
      <div className="mb-1.5 text-xs font-semibold text-slate-800">{title}</div>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs text-slate-700">
            <span
              className="inline-block h-3 w-3 rounded-xs border border-black/15"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
