-- ============================================================================
-- Supabase SQL-Schema für SCKM_Prototype (MykoWis BW)
-- Kollaboratives Wissensmanagement (SECI-Modell: Externalisierung von Feldwissen)
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.field_observations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  author_alias text not null default 'Anonym',
  habitat_id text,
  latitude double precision not null,
  longitude double precision not null,
  observation_type text not null check (
    observation_type in ('fungus_sighting', 'indicator_plant', 'habitat_change', 'soil_hint')
  ),
  species_or_indicator text not null,
  observed_ph_tendency text check (
    observed_ph_tendency in ('acidic', 'neutral', 'calcareous', 'unknown')
  ) default 'unknown',
  notes text,
  verified_count integer not null default 0
);

-- Row Level Security (RLS) für öffentlichen Lese- und anonymen Prototyp-Schreibzugriff
alter table public.field_observations enable row level security;

create policy "Öffentlicher Lesezugriff auf Feldbeobachtungen"
  on public.field_observations
  for select
  to anon, authenticated
  using (true);

create policy "Anonymer Schreibzugriff für Prototyp-Tester"
  on public.field_observations
  for insert
  to anon, authenticated
  with check (
    char_length(species_or_indicator) between 2 and 120
    and latitude between 47.5 and 49.8
    and longitude between 7.4 and 10.5
  );

-- Beispiel-Datensatz aus der Pilotregion Freiburg (Schönberg vs. Schwarzwald)
insert into public.field_observations (
  author_alias,
  habitat_id,
  latitude,
  longitude,
  observation_type,
  species_or_indicator,
  observed_ph_tendency,
  notes
) values
  (
    'KM-Pilot-Team',
    'fr-rosskopf-gneis',
    48.0102,
    7.9014,
    'indicator_plant',
    'Heidelbeere (Vaccinium myrtillus)',
    'acidic',
    'Großflächige Heidelbeerbestände unter Fichte/Weißtanne bestätigen stark sauren Oberboden (pH ~4.3).'
  ),
  (
    'KM-Pilot-Team',
    'fr-schoenberg-kalk',
    47.9565,
    7.8052,
    'indicator_plant',
    'Bärlauch & Waldmeister',
    'calcareous',
    'Kalkhaltiger Buchenhang am Schönberg – ideales Frühjahrs-Habitat für Morcheln und Sommersteinpilz.'
  );
