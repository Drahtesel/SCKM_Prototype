import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { FeatureCollection, Geometry } from 'geojson';
import ontology from '../../knowledge/ontology.json';
import { WEATHER_SCENARIOS } from '../../services/weatherService';
import { evaluateHabitatForSpecies, rankSpeciesForHabitat } from '../inferenceEngine';
import type { HabitatProperties, SpeciesRule } from '../../types/knowledge';

const geoJsonPath = resolve(__dirname, '../../../public/data/freiburg_habitats.geojson');
const freiburgGeoJson = JSON.parse(
  readFileSync(geoJsonPath, 'utf-8'),
) as FeatureCollection<Geometry, HabitatProperties>;

describe('Glass-Box Inference Engine & 75 OSM Parcels Smoke Tests', () => {
  const speciesList = ontology.species as SpeciesRule[];
  const porcini = speciesList.find((s) => s.id === 'boletus_edulis')!;
  const morel = speciesList.find((s) => s.id === 'morchella_esculenta')!;
  const autumnWeather = WEATHER_SCENARIOS.autumn_flush!;
  const springWeather = WEATHER_SCENARIOS.spring_morel!;

  it('validiert alle 75 echten Freiburger OSM-Waldparzellen gegen alle 6 Pilzarten (Smoke-Test)', () => {
    expect(freiburgGeoJson.features.length).toBeGreaterThanOrEqual(60);
    expect(speciesList).toHaveLength(6);

    for (const feature of freiburgGeoJson.features) {
      for (const species of speciesList) {
        const result = evaluateHabitatForSpecies(feature.properties, species, autumnWeather);
        expect(result.totalScore).toBeGreaterThanOrEqual(0);
        expect(result.totalScore).toBeLessThanOrEqual(100);
        expect(result.factors).toHaveLength(4);
      }
    }
  });

  it('bewertet saure Schwarzwald-Parzellen (pH <= 4.5) hoch für Steinpilz und schließt Speisemorchel aus', () => {
    const acidicForest = freiburgGeoJson.features.find(
      (f) => f.properties.soilPh <= 4.5 && f.properties.dominantTrees.includes('Fichte'),
    )!.properties;

    const porciniEval = evaluateHabitatForSpecies(acidicForest, porcini, autumnWeather);
    const morelEval = evaluateHabitatForSpecies(acidicForest, morel, springWeather);

    expect(porciniEval.isExcluded).toBe(false);
    expect(porciniEval.totalScore).toBeGreaterThanOrEqual(85);
    expect(morelEval.isExcluded).toBe(true);
  });

  it('sortiert im Standort-Ranking (Ort -> Pilz) am kalkhaltigen Schönberg (pH >= 7.0) im Frühling Speisemorchel auf Platz 1', () => {
    const calcareousForest = freiburgGeoJson.features.find(
      (f) => f.properties.soilPh >= 7.0 && f.properties.dominantTrees.includes('Esche'),
    )!.properties;

    const ranking = rankSpeciesForHabitat(calcareousForest, speciesList, springWeather);
    expect(ranking[0]?.speciesId).toBe('morchella_esculenta');
    expect(ranking[0]?.totalScore).toBe(100);
    expect(ranking[ranking.length - 1]?.isExcluded).toBe(true);
  });
});
