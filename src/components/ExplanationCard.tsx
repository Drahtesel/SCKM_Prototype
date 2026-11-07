import type { HabitatProperties, SuitabilityEvaluation } from '../types/knowledge';

interface ExplanationCardProps {
  habitat: HabitatProperties;
  evaluation: SuitabilityEvaluation;
}

const BORDER_BY_STATUS: Record<string, string> = {
  optimal: 'border-l-emerald-600',
  acceptable: 'border-l-amber-500',
  limiting: 'border-l-rose-600',
  exclusion: 'border-l-rose-600',
};

export function ExplanationCard({ habitat, evaluation }: ExplanationCardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Glass-Box Ableitung ({evaluation.speciesName})
          </h2>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">{habitat.name}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            evaluation.isExcluded
              ? 'bg-rose-100 text-rose-800'
              : evaluation.totalScore >= 60
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
          }`}
        >
          {evaluation.totalScore}%
        </span>
      </div>

      <p className="text-xs text-slate-600">
        {habitat.subregion} • {habitat.elevationM} m ü. NN • Exposition: {habitat.aspect}
      </p>

      <div className="space-y-2 pt-1">
        {evaluation.factors.map((factor) => (
          <div
            key={factor.criterion}
            className={`border-l-3 pl-2.5 text-xs ${BORDER_BY_STATUS[factor.status] ?? 'border-l-slate-400'}`}
          >
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>{factor.label}</span>
              <span className="text-[11px] font-medium text-slate-500">
                {factor.status === 'exclusion' ? 'Ausschluss' : `+${factor.scoreDelta} Pkt.`}
              </span>
            </div>
            <div className="text-slate-700">{factor.rawFact}</div>
            <div className="text-slate-500">{factor.ruleExplanation}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-1 text-xs text-slate-700">
        <div className="font-semibold text-slate-800">Vor-Ort-Prüfung (Tacit → Explicit):</div>
        {evaluation.fieldTips.map((tip) => (
          <p key={tip} className="leading-snug text-slate-600">
            • {tip}
          </p>
        ))}
      </div>
    </section>
  );
}
