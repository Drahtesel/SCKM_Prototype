import type { SuitabilityEvaluation } from '../types/knowledge';

interface SpeciesRankingCardProps {
  habitatName: string;
  rankings: SuitabilityEvaluation[];
  selectedSpeciesId: string;
  onSelectSpecies: (speciesId: string) => void;
}

export function SpeciesRankingCard({
  habitatName,
  rankings,
  selectedSpeciesId,
  onSelectSpecies,
}: SpeciesRankingCardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Standort-Ranking (Ort → Pilz)
        </h2>
        <p className="text-xs text-slate-600">
          Eignungsvergleich für <strong>{habitatName}</strong>:
        </p>
      </div>

      <div className="space-y-1.5">
        {rankings.map((item) => {
          const isSelected = item.speciesId === selectedSpeciesId;
          const exclusionReason = item.factors.find((f) => f.status === 'exclusion')?.label;

          return (
            <button
              key={item.speciesId}
              type="button"
              onClick={() => onSelectSpecies(item.speciesId)}
              className={`w-full rounded-lg border p-2 text-left transition ${
                isSelected
                  ? 'border-slate-900 bg-white ring-1 ring-slate-900'
                  : 'border-slate-200 bg-white/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{item.speciesName}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    item.isExcluded
                      ? 'bg-rose-100 text-rose-800'
                      : item.totalScore >= 60
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.isExcluded ? `Ausgeschl. (${exclusionReason ?? 'Regel'})` : `${item.totalScore}%`}
                </span>
              </div>

              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    item.isExcluded
                      ? 'bg-rose-400'
                      : item.totalScore >= 60
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.max(item.totalScore, 6)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
