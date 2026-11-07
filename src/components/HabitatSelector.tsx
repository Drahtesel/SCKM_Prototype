import { useMemo } from 'react';
import type { HabitatProperties } from '../types/knowledge';

interface HabitatSelectorProps {
  habitats: HabitatProperties[];
  selectedHabitatId: string | null;
  onSelectHabitat: (habitat: HabitatProperties) => void;
}

export function HabitatSelector({
  habitats,
  selectedHabitatId,
  onSelectHabitat,
}: HabitatSelectorProps) {
  // Wähle je 1 repräsentatives Referenz-Habitat pro geologischer Teilregion für Schnellwahl-Buttons
  const featuredHabitats = useMemo(() => {
    const bySubregion = new Map<string, HabitatProperties>();
    for (const h of habitats) {
      if (!bySubregion.has(h.subregion)) {
        bySubregion.set(h.subregion, h);
      }
    }
    return Array.from(bySubregion.values());
  }, [habitats]);

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Referenz-Zonen & {habitats.length} OSM-Waldparzellen
        </h2>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {featuredHabitats.map((hab) => {
          const isSelected = hab.id === selectedHabitatId;
          const shortLabel = hab.subregion.split(' (')[0];
          return (
            <button
              key={hab.id}
              type="button"
              onClick={() => onSelectHabitat(hab)}
              className={`rounded-lg border px-2 py-1 text-left text-xs transition ${
                isSelected
                  ? 'border-slate-900 bg-slate-900 font-semibold text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              <span>{shortLabel}</span>
              <span
                className={`ml-1.5 rounded-xs px-1 py-0.2 text-[10px] ${
                  isSelected ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-600'
                }`}
              >
                pH {hab.soilPh.toFixed(1)}
              </span>
            </button>
          );
        })}
      </div>

      <select
        aria-label="Alle 75 OSM-Waldparzellen durchsuchen"
        value={selectedHabitatId ?? ''}
        onChange={(e) => {
          const found = habitats.find((h) => h.id === e.target.value);
          if (found) onSelectHabitat(found);
        }}
        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
      >
        {habitats.map((h) => (
          <option key={h.id} value={h.id}>
            {h.name} • pH {h.soilPh.toFixed(1)} • {h.dominantTrees.slice(0, 2).join('/')}
          </option>
        ))}
      </select>
    </section>
  );
}
