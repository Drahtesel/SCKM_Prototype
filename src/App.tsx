import { useEffect, useMemo, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Layer, PathOptions } from 'leaflet';
import ontologyData from './knowledge/ontology.json';
import { DATA_SOURCES, PILOT_REGION_BW } from './config/dataSources';
import { evaluateHabitatForSpecies } from './engine/inferenceEngine';
import { checkBackendConnection } from './services/supabaseClient';
import { fetchFreiburgLiveWeather, WEATHER_SCENARIOS } from './services/weatherService';
import type { HabitatProperties, SpeciesRule, WeatherContext } from './types/knowledge';

type MapColorMode = 'suitability' | 'soil_ph' | 'forest_type';

function getPhColor(ph: number): string {
  if (ph < 4.8) return '#2563eb'; // stark sauer
  if (ph < 6.0) return '#0d9488'; // mäßig sauer
  if (ph < 6.8) return '#eab308'; // neutral
  return '#9333ea'; // kalkhaltig
}

function getSuitabilityColor(score: number, isExcluded: boolean): string {
  if (isExcluded || score < 25) return '#ef4444';
  if (score < 60) return '#f59e0b';
  return '#16a34a';
}

export default function App() {
  const speciesList = ontologyData.species as SpeciesRule[];
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(speciesList[0].id);
  const [colorMode, setColorMode] = useState<MapColorMode>('suitability');
  const [showLgrbWms, setShowLgrbWms] = useState<boolean>(false);

  const [geoData, setGeoData] = useState<FeatureCollection<Geometry, HabitatProperties> | null>(null);
  const [selectedHabitat, setSelectedHabitat] = useState<HabitatProperties | null>(null);

  const [weatherMode, setWeatherMode] = useState<string>('live');
  const [liveWeather, setLiveWeather] = useState<WeatherContext | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [backendStatus, setBackendStatus] = useState<{
    mode: 'supabase_live' | 'local_fallback';
    reachable: boolean;
    count: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch(DATA_SOURCES.localGeoJson.path)
      .then((res) => res.json())
      .then((json: FeatureCollection<Geometry, HabitatProperties>) => {
        setGeoData(json);
        if (json.features.length > 0) {
          setSelectedHabitat(json.features[0].properties);
        }
      })
      .catch((err) => console.error('GeoJSON Ladefehler:', err));

    fetchFreiburgLiveWeather()
      .then(setLiveWeather)
      .catch((err: Error) => setWeatherError(err.message));

    checkBackendConnection().then(setBackendStatus);
  }, []);

  const activeWeather: WeatherContext = useMemo(() => {
    if (weatherMode === 'live' && liveWeather) return liveWeather;
    return WEATHER_SCENARIOS[weatherMode] ?? WEATHER_SCENARIOS.autumn_flush;
  }, [weatherMode, liveWeather]);

  const selectedSpecies = useMemo(
    () => speciesList.find((s) => s.id === selectedSpeciesId) ?? speciesList[0],
    [speciesList, selectedSpeciesId],
  );

  const currentEvaluation = useMemo(() => {
    if (!selectedHabitat) return null;
    return evaluateHabitatForSpecies(selectedHabitat, selectedSpecies, activeWeather);
  }, [selectedHabitat, selectedSpecies, activeWeather]);

  const styleFeature = (feature?: Feature<Geometry, HabitatProperties>): PathOptions => {
    if (!feature) return {};
    const props = feature.properties;
    const isSelected = selectedHabitat?.id === props.id;

    let fillColor = '#64748b';
    if (colorMode === 'soil_ph') {
      fillColor = getPhColor(props.soilPh);
    } else if (colorMode === 'forest_type') {
      fillColor =
        props.leafType === 'needleleaved'
          ? '#14532d'
          : props.leafType === 'broadleaved'
            ? '#65a30d'
            : '#0f766e';
    } else {
      const ev = evaluateHabitatForSpecies(props, selectedSpecies, activeWeather);
      fillColor = getSuitabilityColor(ev.totalScore, ev.isExcluded);
    }

    return {
      color: isSelected ? '#0f172a' : '#ffffff',
      weight: isSelected ? 3 : 1.5,
      fillColor,
      fillOpacity: 0.62,
    };
  };

  const onEachHabitat = (feature: Feature<Geometry, HabitatProperties>, layer: Layer) => {
    layer.on({
      click: () => setSelectedHabitat(feature.properties),
    });
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand-header">
          <h1>MykoWis BW (Architektur-Basis)</h1>
          <p>Knowledge-Management-Prototyp • Pilotregion Freiburg (Baden-Württemberg)</p>
        </div>

        <section className="card">
          <h2>System- & Datenverknüpfungen</h2>
          <div className="status-list">
            <div className="status-row">
              <span>BW Habitat-Geodaten (OSM/SoilGrids)</span>
              <span className={`badge ${geoData ? 'badge-ok' : 'badge-warn'}`}>
                {geoData ? `${geoData.features.length} Zonen aktiv` : 'Lädt...'}
              </span>
            </div>
            <div className="status-row">
              <span>Open-Meteo (DWD ICON Live)</span>
              <span className={`badge ${liveWeather ? 'badge-ok' : 'badge-warn'}`}>
                {liveWeather ? 'Verbunden' : weatherError ? 'Fallback' : 'Prüfe...'}
              </span>
            </div>
            <div className="status-row">
              <span>Mini-Backend (Supabase)</span>
              <span
                className={`badge ${
                  backendStatus?.mode === 'supabase_live' && backendStatus.reachable
                    ? 'badge-ok'
                    : 'badge-warn'
                }`}
              >
                {backendStatus?.mode === 'supabase_live' ? 'Supabase Live' : 'Lokal (Bereit)'}
              </span>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>DIKW-Steuerung & Karten-Layer</h2>
          <div className="control-group">
            <label htmlFor="species-select">Ziel-Pilzart (Wissensregelwerk)</label>
            <select
              id="species-select"
              value={selectedSpeciesId}
              onChange={(e) => setSelectedSpeciesId(e.target.value)}
            >
              {speciesList.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.germanName} ({sp.scientificName})
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="layer-mode">Karten-Visualisierung (Daten vs. Wissen)</label>
            <select
              id="layer-mode"
              value={colorMode}
              onChange={(e) => setColorMode(e.target.value as MapColorMode)}
            >
              <option value="suitability">Wissens-Layer: Kombinierter Eignungs-Score</option>
              <option value="soil_ph">Rohdaten-Layer: Boden-pH-Wert (Sauer vs. Kalk)</option>
              <option value="forest_type">Rohdaten-Layer: Waldtyp (Laub / Nadel / Misch)</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="weather-mode">Wetter-Kontext (Dynamischer Trigger)</label>
            <select
              id="weather-mode"
              value={weatherMode}
              onChange={(e) => setWeatherMode(e.target.value)}
            >
              <option value="live">Live-Wetter Freiburg (Open-Meteo API)</option>
              <option value="autumn_flush">Simulation: Spätsommer-/Herbstregen</option>
              <option value="spring_morel">Simulation: Frühlings-Morchelwetter (April)</option>
            </select>
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={showLgrbWms}
              onChange={(e) => setShowLgrbWms(e.target.checked)}
            />
            Offizielle LGRB-BW Bodenkarte BK50 (WMS) einblenden
          </label>

          <div className="weather-grid">
            <div className="metric-box">
              <span>Regen (14 Tage)</span>
              <strong>{activeWeather.rain14dMm} mm</strong>
            </div>
            <div className="metric-box">
              <span>Bodentemp. (0–7 cm)</span>
              <strong>{activeWeather.soilTemp0to7cmC} °C</strong>
            </div>
          </div>
        </section>

        {selectedHabitat && currentEvaluation && (
          <section className="card">
            <h2>
              Erklärbare Ableitung: {selectedHabitat.name} ({currentEvaluation.totalScore}%)
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#475569' }}>
              {selectedHabitat.subregion} • {selectedHabitat.elevationM} m ü. NN • Exposition:{' '}
              {selectedHabitat.aspect}
            </p>
            {currentEvaluation.factors.map((f) => (
              <div key={f.criterion} className={`factor-item factor-${f.status}`}>
                <strong>{f.label}:</strong> {f.rawFact}
                <div style={{ color: '#475569' }}>{f.ruleExplanation}</div>
              </div>
            ))}
          </section>
        )}
      </aside>

      <main className="map-wrapper">
        <MapContainer
          center={PILOT_REGION_BW.center}
          zoom={PILOT_REGION_BW.defaultZoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url={DATA_SOURCES.osmTiles.url}
            attribution={DATA_SOURCES.osmTiles.attribution}
          />

          {showLgrbWms && (
            <WMSTileLayer
              url={DATA_SOURCES.lgrbBwSoilWms.wmsUrl}
              layers={DATA_SOURCES.lgrbBwSoilWms.layers}
              format="image/png"
              transparent={true}
              opacity={0.45}
              attribution={DATA_SOURCES.lgrbBwSoilWms.attribution}
            />
          )}

          {geoData && (
            <GeoJSON
              key={`${selectedSpeciesId}-${colorMode}-${weatherMode}-${selectedHabitat?.id ?? ''}`}
              data={geoData}
              style={styleFeature}
              onEachFeature={onEachHabitat}
            />
          )}
        </MapContainer>
      </main>
    </div>
  );
}
