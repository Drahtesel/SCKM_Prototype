import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { FeatureCollection, Geometry } from 'geojson';
import ontology from '../../knowledge/ontology.json';
import { WEATHER_SCENARIOS } from '../../services/weatherService';
import { evaluateHabitatForSpecies } from '../inferenceEngine';
import type { HabitatProperties, SpeciesRule } from '../../types/knowledge';

const geoJsonPath = resolve(__dirname, '../../../public/data/freiburg_habitats.geojson');
const freiburgGeoJson = JSON.parse(
  readFileSync(geoJsonPath, 'utf-8'),
) as FeatureCollection<Geometry, HabitatProperties>;

describe('Glass-Box Inference Engine & Dataset Smoke Tests', () => {
  const speciesList = ontology.species as SpeciesRule[];
  const porcini = speciesList.find((s) => s.id === 'boletus_edulis')!;
  const morel = speciesList.find((s) => s.id === 'morchella_esculenta')!;
  const autumnWeather = WEATHER_SCENARIOS.autumn_flush!;
  const springWeather = WEATHER_SCENARIOS.spring_morel!;

  it('validiert alle statischen Freiburg-Habitate gegen alle Pilzarten ohne Laufzeitfehler (Smoke-Test)', () => {
    expect(freiburgGeoJson.features.length).toBeGreaterThanOrEqual(5);
    expect(speciesList.length).toBeGreaterThanOrEqual(4);

    for (const feature of freiburgGeoJson.features) {
      for (const species of speciesList) {
        const result = evaluateHabitatForSpecies(feature.properties, species, autumnWeather);
        expect(result.totalScore).toBeGreaterThanOrEqual(0);
        expect(result.totalScore).toBeLessThanOrEqual(100);
        expect(result.factors).toHaveLength(4);
      }
    }
  });

  it('bewertet sauren Schwarzwald (Sternwald) hoch für Steinpilz und schließt Speisemorchel aus', () => {
    const sternwald = freiburgGeoJson.features.find(
      (f) => f.properties.id === 'fr-sternwald-kybfelsen',
    )!.properties;

    const porciniEval = evaluateHabitatForSpecies(sternwald, porcini, autumnWeather);
    const morelEval = evaluateHabitatForSpecies(sternwald, morel, springWeather);

    expect(porciniEval.isExcluded).toBe(false);
    expect(porciniEval.totalScore).toBeGreaterThanOrEqual(85);
    expect(morelEval.isExcluded).toBe(true);
  });

  it('bewertet kalkhaltigen Schönberg im Frühling optimal für Speisemorchel und schließt Fichten-Steinpilz aus', () => {
    const schoenberg = freiburgGeoJson.features.find(
      (f) => f.properties.id === 'fr-schoenberg-kalk',
    )!.properties;

    const morelEval = evaluateHabitatForSpecies(schoenberg, morel, springWeather);
    const porciniEval = evaluateHabitatForSpecies(schoenberg, porcini, autumnWeather);

    expect(morelEval.isExcluded).toBe(false);
    expect(morelEval.totalScore).toBeGreaterThanOrEqual(85);
    expect(porciniEval.isExcluded).toBe(true);
  });
});
