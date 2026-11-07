import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { FieldObservation } from '../types/knowledge';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('dein-projekt-id'),
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

const LOCAL_FALLBACK_KEY = 'mykowis_bw_local_observations_v1';

const DEFAULT_DEMO_OBSERVATIONS: FieldObservation[] = [
  {
    id: 'demo-1',
    created_at: new Date().toISOString(),
    author_alias: 'KM-Pilot-Team',
    habitat_id: 'fr-rosskopf-gneis',
    latitude: 48.0102,
    longitude: 7.9014,
    observation_type: 'indicator_plant',
    species_or_indicator: 'Heidelbeere (Säurezeiger)',
    observed_ph_tendency: 'acidic',
    notes: 'Bestätigt stark sauren Gneisboden am Roßkopf (pH ~4.5).',
  },
  {
    id: 'demo-2',
    created_at: new Date().toISOString(),
    author_alias: 'KM-Pilot-Team',
    habitat_id: 'fr-schoenberg-kalk',
    latitude: 47.9565,
    longitude: 7.8052,
    observation_type: 'indicator_plant',
    species_or_indicator: 'Bärlauch & Waldmeister (Kalkzeiger)',
    observed_ph_tendency: 'calcareous',
    notes: 'Kalkbraunerde am Schönberg bestätigt (pH ~7.2).',
  },
];

export async function checkBackendConnection(): Promise<{
  mode: 'supabase_live' | 'local_fallback';
  reachable: boolean;
  count: number;
  message: string;
}> {
  if (!supabase) {
    const localItems = await listObservations();
    return {
      mode: 'local_fallback',
      reachable: true,
      count: localItems.length,
      message: 'Lokaler Fallback aktiv (Supabase Secrets noch nicht hinterlegt)',
    };
  }

  const { count, error } = await supabase
    .from('field_observations')
    .select('*', { count: 'exact', head: true });

  if (error) {
    return {
      mode: 'supabase_live',
      reachable: false,
      count: 0,
      message: `Supabase konfiguriert, Tabelle noch nicht angelegt (${error.message})`,
    };
  }

  return {
    mode: 'supabase_live',
    reachable: true,
    count: count ?? 0,
    message: 'Verbunden mit Supabase PostgreSQL (Live-Kollaboration aktiv)',
  };
}

export async function listObservations(): Promise<FieldObservation[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('field_observations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      return data as FieldObservation[];
    }
  }

  const raw = localStorage.getItem(LOCAL_FALLBACK_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(DEFAULT_DEMO_OBSERVATIONS));
    return DEFAULT_DEMO_OBSERVATIONS;
  }
  return JSON.parse(raw) as FieldObservation[];
}
