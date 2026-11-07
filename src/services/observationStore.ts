import type { FieldObservation } from '../types/knowledge';

const STORAGE_KEY = 'mykowis_bw_observations_v1';

const SEED_OBSERVATIONS: FieldObservation[] = [
  {
    id: 'seed-rosskopf',
    createdAt: '2026-10-18',
    authorAlias: 'KM-Demo',
    habitatId: 'fr-rosskopf-gneis',
    observationType: 'indicator_plant',
    title: 'Heidelbeere (Säurezeiger)',
    notes: 'Großflächige Bestände bestätigen sauren Gneis-Oberboden (pH ~4.5).',
  },
  {
    id: 'seed-schoenberg',
    createdAt: '2026-04-22',
    authorAlias: 'KM-Demo',
    habitatId: 'fr-schoenberg-kalk',
    observationType: 'indicator_plant',
    title: 'Bärlauch & Waldmeister (Kalkzeiger)',
    notes: 'Kalkbraunerde am Schönberg bestätigt (pH ~7.2).',
  },
];

export function loadLocalObservations(): FieldObservation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_OBSERVATIONS));
      return SEED_OBSERVATIONS;
    }
    return JSON.parse(raw) as FieldObservation[];
  } catch {
    return SEED_OBSERVATIONS;
  }
}

export function saveLocalObservation(entry: Omit<FieldObservation, 'id' | 'createdAt'>): FieldObservation[] {
  const current = loadLocalObservations();
  const next: FieldObservation = {
    ...entry,
    id: `obs-${Date.now()}`,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const updated = [next, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
