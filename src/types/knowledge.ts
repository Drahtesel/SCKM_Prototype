export type LeafType = 'broadleaved' | 'needleleaved' | 'mixed';

export type MapColorMode = 'suitability' | 'soil_ph' | 'forest_type';

export type MapRenderStyle = 'parcels' | 'heatmap' | 'hybrid';

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
  areaHa?: number;
  centerLat?: number;
  centerLon?: number;
  dataSource: string;
}

export interface WeatherContext {
  source: 'live_open_meteo' | 'scenario_simulation';
  label: string;
  fetchedAt: string;
  rain7dMm: number;
  rain14dMm: number;
  soilTemp0to7cmC: number;
  soilMoisture0to7cm: number;
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
  totalScore: number;
  isExcluded: boolean;
  factors: FactorExplanation[];
  fieldTips: string[];
}

export interface FieldObservation {
  id: string;
  createdAt: string;
  authorAlias: string;
  habitatId: string;
  observationType: 'fungus_sighting' | 'indicator_plant' | 'habitat_change';
  title: string;
  notes: string;
}
