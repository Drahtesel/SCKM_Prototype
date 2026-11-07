import { describe, expect, it } from 'vitest';
import ontology from '../../knowledge/ontology.json';
import { evaluateHabitatForSpecies } from '../inferenceEngine';
import type { HabitatProperties, SpeciesRule, WeatherContext } from '../../types/knowledge';

const acidicBlackForest: HabitatProperties = {
  id: 'fr-sternwald-kybfelsen',
  name: 'Sternwald & Kybfelsen',
  subregion: 'Schwarzwald',
  leafType: 'needleleaved',
  dominantTrees: ['Fichte', 'Weißtanne', 'Buche'],
  soilPh: 4.3,
  soilSubstrate: 'Saure Braunerde auf Gneis',
  elevationM: 700,
  aspect: 'N',
  dataSource: 'Test',
};

const calcareousSchoenberg: HabitatProperties = {
  id: 'fr-schoenberg-kalk',
  name: 'Schönberg-Osthang',
  subregion: 'Vorbergzone',
  leafType: 'broadleaved',
  dominantTrees: ['Buche', 'Eiche', 'Esche'],
  soilPh: 7.3,
  soilSubstrate: 'Jurakalk',
  elevationM: 480,
  aspect: 'SO',
  dataSource: 'Test',
};

const autumnWeather: WeatherContext = {
  source: 'scenario_simulation',
  label: 'Herbstregen',
  fetchedAt: 'now',
  rain7dMm: 20,
  rain14dMm: 38,
  soilTemp0to7cmC: 14,
  soilMoisture0to7cm: 0.32,
};

describe('Glass-Box Inference Engine (DIKW Knowledge Rules)', () => {
  const speciesList = ontology.species as SpeciesRule[];
  const porcini = speciesList.find((s) => s.id === 'boletus_edulis')!;
  const morel = speciesList.find((s) => s.id === 'morchella_esculenta')!;

  it('bewertet sauren Schwarzwald-Nadelwald hoch für Fichten-Steinpilz und schließt Speisemorchel aus', () => {
    const porciniEval = evaluateHabitatForSpecies(acidicBlackForest, porcini, autumnWeather);
    const morelEval = evaluateHabitatForSpecies(acidicBlackForest, morel, autumnWeather);

    expect(porciniEval.isExcluded).toBe(false);
    expect(porciniEval.totalScore).toBeGreaterThanOrEqual(85);
    expect(morelEval.isExcluded).toBe(true);
  });

  it('schließt Fichten-Steinpilz auf stark kalkhaltigem Boden (pH 7.3) am Schönberg aus', () => {
    const porciniOnLime = evaluateHabitatForSpecies(calcareousSchoenberg, porcini, autumnWeather);
    expect(porciniOnLime.isExcluded).toBe(true);
  });
});
