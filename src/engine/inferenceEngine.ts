import type {
  FactorExplanation,
  HabitatProperties,
  SpeciesRule,
  SuitabilityEvaluation,
  WeatherContext,
} from '../types/knowledge';

export function evaluateHabitatForSpecies(
  habitat: HabitatProperties,
  species: SpeciesRule,
  weather: WeatherContext,
): SuitabilityEvaluation {
  const factors: FactorExplanation[] = [];
  let score = 0;
  let isExcluded = false;

  // 1. Baumpartner / Mykorrhiza-Symbiose (max. 35 Punkte)
  const matchingTrees = habitat.dominantTrees.filter((t) => species.symbioticTrees.includes(t));
  if (matchingTrees.length > 0) {
    score += 35;
    factors.push({
      criterion: 'tree_symbiosis',
      label: 'Baumpartner & Waldtyp',
      status: 'optimal',
      scoreDelta: 35,
      rawFact: `Bestand: ${habitat.dominantTrees.join(', ')}`,
      ruleExplanation: `Symbiosepartner vorhanden (${matchingTrees.join(', ')}).`,
    });
  } else {
    isExcluded = true;
    factors.push({
      criterion: 'tree_symbiosis',
      label: 'Baumpartner & Waldtyp',
      status: 'exclusion',
      scoreDelta: 0,
      rawFact: `Bestand: ${habitat.dominantTrees.join(', ')}`,
      ruleExplanation: `${species.germanName} benötigt ${species.symbioticTrees.join(' / ')}.`,
    });
  }

  // 2. Boden-pH-Wert (max. 30 Punkte)
  const ph = habitat.soilPh;
  if (ph >= species.phOptimalMin && ph <= species.phOptimalMax) {
    score += 30;
    factors.push({
      criterion: 'soil_ph',
      label: 'Boden-pH-Wert',
      status: 'optimal',
      scoreDelta: 30,
      rawFact: `pH ${ph.toFixed(1)} (${habitat.soilSubstrate})`,
      ruleExplanation: `Liegt im Idealbereich (pH ${species.phOptimalMin}–${species.phOptimalMax}).`,
    });
  } else if (ph >= species.phMin && ph <= species.phMax) {
    score += 15;
    factors.push({
      criterion: 'soil_ph',
      label: 'Boden-pH-Wert',
      status: 'acceptable',
      scoreDelta: 15,
      rawFact: `pH ${ph.toFixed(1)} (${habitat.soilSubstrate})`,
      ruleExplanation: `Toleranzbereich erreicht (Optimum wäre pH ${species.phOptimalMin}–${species.phOptimalMax}).`,
    });
  } else {
    isExcluded = true;
    factors.push({
      criterion: 'soil_ph',
      label: 'Boden-pH-Wert',
      status: 'exclusion',
      scoreDelta: 0,
      rawFact: `pH ${ph.toFixed(1)} (${habitat.soilSubstrate})`,
      ruleExplanation: `Außerhalb der pH-Grenzen (${species.phMin}–${species.phMax}) für ${species.germanName}.`,
    });
  }

  // 3. 14-Tage Niederschlagshistorie (max. 20 Punkte)
  if (weather.rain14dMm >= species.minRain14dMm) {
    score += 20;
    factors.push({
      criterion: 'rain_history',
      label: '14-Tage Regenhistorie',
      status: 'optimal',
      scoreDelta: 20,
      rawFact: `${weather.rain14dMm} mm in 14 Tagen`,
      ruleExplanation: `Mindestfeuchte (${species.minRain14dMm} mm) für Myzel-Aktivierung erreicht.`,
    });
  } else {
    const partial = Math.round((weather.rain14dMm / species.minRain14dMm) * 12);
    score += partial;
    factors.push({
      criterion: 'rain_history',
      label: '14-Tage Regenhistorie',
      status: 'limiting',
      scoreDelta: partial,
      rawFact: `${weather.rain14dMm} mm in 14 Tagen`,
      ruleExplanation: `Unter Richtwert (${species.minRain14dMm} mm) – Nordhänge/Senken bevorzugen.`,
    });
  }

  // 4. Bodentemperatur 0–7 cm (max. 15 Punkte)
  const temp = weather.soilTemp0to7cmC;
  if (temp >= species.optimalSoilTempMinC && temp <= species.optimalSoilTempMaxC) {
    score += 15;
    factors.push({
      criterion: 'soil_temperature',
      label: 'Bodentemperatur (0–7 cm)',
      status: 'optimal',
      scoreDelta: 15,
      rawFact: `${temp} °C Oberbodentemperatur`,
      ruleExplanation: `Ideales Fruktifikationsfenster (${species.optimalSoilTempMinC}–${species.optimalSoilTempMaxC} °C).`,
    });
  } else {
    factors.push({
      criterion: 'soil_temperature',
      label: 'Bodentemperatur (0–7 cm)',
      status: 'limiting',
      scoreDelta: 0,
      rawFact: `${temp} °C Oberbodentemperatur`,
      ruleExplanation: `Außerhalb des Temperatur-Optimums (${species.optimalSoilTempMinC}–${species.optimalSoilTempMaxC} °C).`,
    });
  }

  return {
    speciesId: species.id,
    speciesName: species.germanName,
    totalScore: isExcluded ? Math.min(score, 15) : Math.min(score, 100),
    isExcluded,
    factors,
    fieldTips: [
      `Zeigerpflanzen vor Ort prüfen: ${species.indicatorPlants.join(', ')}`,
      `Verwechslungsgefahr beachten: ${species.lookalikeWarning}`,
    ],
  };
}
