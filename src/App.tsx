import { useEffect, useMemo, useState } from 'react';
import type { FeatureCollection, Geometry } from 'geojson';
import ontologyData from './knowledge/ontology.json';
import { DATA_SOURCES } from './config/dataSources';
import { evaluateHabitatForSpecies, rankSpeciesForHabitat } from './engine/inferenceEngine';
import {
  DEFAULT_WEATHER_SCENARIO_KEY,
  fetchFreiburgLiveWeather,
  WEATHER_SCENARIOS,
} from './services/weatherService';
import { ControlPanel } from './components/ControlPanel';
import { ExplanationCard } from './components/ExplanationCard';
import { HabitatMap } from './components/HabitatMap';
import { HabitatSelector } from './components/HabitatSelector';
import { SpeciesRankingCard } from './components/SpeciesRankingCard';
import type {
  HabitatProperties,
  MapColorMode,
  SpeciesRule,
  WeatherContext,
} from './types/knowledge';

export default function App() {
  const speciesList = ontologyData.species as SpeciesRule[];
  const defaultSpecies = speciesList[0]!;

  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(defaultSpecies.id);
  const [colorMode, setColorMode] = useState<MapColorMode>('suitability');
  const [weatherMode, setWeatherMode] = useState<string>(DEFAULT_WEATHER_SCENARIO_KEY);
  const [showLgrbWms, setShowLgrbWms] = useState<boolean>(false);

  const [geoData, setGeoData] = useState<FeatureCollection<Geometry, HabitatProperties> | null>(
    null,
  );
  const [selectedHabitat, setSelectedHabitat] = useState<HabitatProperties | null>(null);
  const [liveWeather, setLiveWeather] = useState<WeatherContext | null>(null);

  useEffect(() => {
    fetch(DATA_SOURCES.localGeoJson.path)
      .then((res) => res.json())
      .then((json: FeatureCollection<Geometry, HabitatProperties>) => {
        setGeoData(json);
        const firstFeature = json.features[0];
        if (firstFeature) {
          setSelectedHabitat(firstFeature.properties);
        }
      })
      .catch((err) => console.error('GeoJSON Ladefehler:', err));
  }, []);

  useEffect(() => {
    if (weatherMode === 'live' && !liveWeather) {
      fetchFreiburgLiveWeather()
        .then(setLiveWeather)
        .catch((err) => console.warn('Live-Wetter nicht erreichbar, nutze Simulation:', err));
    }
  }, [weatherMode, liveWeather]);

  const habitats = useMemo(
    () => (geoData ? geoData.features.map((f) => f.properties) : []),
    [geoData],
  );

  const activeWeather: WeatherContext = useMemo(() => {
    if (weatherMode === 'live' && liveWeather) return liveWeather;
    return WEATHER_SCENARIOS[weatherMode] ?? WEATHER_SCENARIOS.autumn_flush!;
  }, [weatherMode, liveWeather]);

  const selectedSpecies = useMemo(
    () => speciesList.find((s) => s.id === selectedSpeciesId) ?? defaultSpecies,
    [speciesList, selectedSpeciesId, defaultSpecies],
  );

  const currentEvaluation = useMemo(() => {
    if (!selectedHabitat) return null;
    return evaluateHabitatForSpecies(selectedHabitat, selectedSpecies, activeWeather);
  }, [selectedHabitat, selectedSpecies, activeWeather]);

  const currentRankings = useMemo(() => {
    if (!selectedHabitat) return [];
    return rankSpeciesForHabitat(selectedHabitat, speciesList, activeWeather);
  }, [selectedHabitat, speciesList, activeWeather]);

  return (
    <div className="grid h-screen w-screen grid-cols-1 md:grid-cols-[410px_1fr] overflow-hidden bg-slate-50 text-slate-900">
      <aside className="flex flex-col gap-3 overflow-y-auto border-r border-slate-200 bg-white p-4">
        <header>
          <h1 className="text-lg font-bold text-slate-900">MykoWis BW</h1>
          <p className="text-xs text-slate-500">
            Knowledge-Management-Prototyp • Pilotregion Freiburg (BW)
          </p>
        </header>

        <ControlPanel
          speciesList={speciesList}
          selectedSpeciesId={selectedSpeciesId}
          onSelectSpecies={setSelectedSpeciesId}
          colorMode={colorMode}
          onChangeColorMode={setColorMode}
          weatherMode={weatherMode}
          onChangeWeatherMode={setWeatherMode}
          showLgrbWms={showLgrbWms}
          onToggleLgrbWms={setShowLgrbWms}
          activeWeather={activeWeather}
        />

        {habitats.length > 0 && (
          <HabitatSelector
            habitats={habitats}
            selectedHabitatId={selectedHabitat?.id ?? null}
            onSelectHabitat={setSelectedHabitat}
          />
        )}

        {selectedHabitat && currentEvaluation && (
          <ExplanationCard habitat={selectedHabitat} evaluation={currentEvaluation} />
        )}

        {selectedHabitat && currentRankings.length > 0 && (
          <SpeciesRankingCard
            habitatName={selectedHabitat.name}
            rankings={currentRankings}
            selectedSpeciesId={selectedSpeciesId}
            onSelectSpecies={setSelectedSpeciesId}
          />
        )}
      </aside>

      <main className="relative h-full w-full">
        <HabitatMap
          geoData={geoData}
          selectedHabitatId={selectedHabitat?.id ?? null}
          onSelectHabitat={setSelectedHabitat}
          selectedSpecies={selectedSpecies}
          colorMode={colorMode}
          activeWeather={activeWeather}
          showLgrbWms={showLgrbWms}
        />
      </main>
    </div>
  );
}
