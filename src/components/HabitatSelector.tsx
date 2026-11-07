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
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Standort-Schnellwahl (Freiburg BW)
        </h2>
        <span className="text-[11px] text-slate-400">{habitats.length} Zonen</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {habitats.map((hab) => {
          const isSelected = hab.id === selectedHabitatId;
          return (
            <button
              key={hab.id}
              type="button"
              onClick={() => onSelectHabitat(hab)}
              className={`rounded-lg border px-2.5 py-1 text-left text-xs transition ${
                isSelected
                  ? 'border-slate-900 bg-slate-900 font-semibold text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              <span>{hab.name.split(' (')[0]}</span>
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
    </section>
  );
}
