export type LeafType = 'broadleaved' | 'needleleaved' | 'mixed';

export interface HabitatProperties {
  id: string;
  name: string;
  subregion: string;
  leafType: LeafType;
  dominantTrees: string[];
  soilPh: number;
  soilSubstrate: string;
  elevationM: number;
  aspect: string;
  waterRetention?: 'low' | 'medium' | 'high';
  dataSource: string;
}

export interface WeatherContext {
  source: 'live_open_meteo' | 'scenario_simulation';
  label: string;
  fetchedAt: string;
  rain7dMm: number;
  rain14dMm: number;
  soilTemp0to7cmC: number;
  soilMoisture0to7cm: number; // m³/m³
}

export interface SpeciesRule {
  id: string;
  germanName: string;
  scientificName: string;
  edibility: string;
  preferredLeafTypes: LeafType[];
  symbioticTrees: string[];
  phMin: number;
  phOptimalMin: number;
  phOptimalMax: number;
  phMax: number;
  minRain14dMm: number;
  optimalSoilTempMinC: number;
  optimalSoilTempMaxC: number;
  indicatorPlants: string[];
  lookalikeWarning: string;
}

export interface FactorExplanation {
  criterion: 'tree_symbiosis' | 'soil_ph' | 'rain_history' | 'soil_temperature';
  label: string;
  status: 'optimal' | 'acceptable' | 'limiting' | 'exclusion';
  scoreDelta: number;
  rawFact: string;
  ruleExplanation: string;
}

export interface SuitabilityEvaluation {
  speciesId: string;
  speciesName: string;
  totalScore: number; // 0 - 100
  isExcluded: boolean;
  factors: FactorExplanation[];
  fieldTips: string[];
}

export interface FieldObservation {
  id: string;
  created_at: string;
  author_alias: string;
  habitat_id?: string | null;
  latitude: number;
  longitude: number;
  observation_type: 'fungus_sighting' | 'indicator_plant' | 'habitat_change' | 'soil_hint';
  species_or_indicator: string;
  observed_ph_tendency: 'acidic' | 'neutral' | 'calcareous' | 'unknown';
  notes?: string | null;
}
