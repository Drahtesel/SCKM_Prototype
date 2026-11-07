import { GeoJSON, MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Layer, PathOptions } from 'leaflet';
import { DATA_SOURCES, PILOT_REGION_BW } from '../config/dataSources';
import { evaluateHabitatForSpecies } from '../engine/inferenceEngine';
import { MapLegend } from './MapLegend';
import type {
  HabitatProperties,
  MapColorMode,
  SpeciesRule,
  WeatherContext,
} from '../types/knowledge';

interface HabitatMapProps {
  geoData: FeatureCollection<Geometry, HabitatProperties> | null;
  selectedHabitatId: string | null;
  onSelectHabitat: (habitat: HabitatProperties) => void;
  selectedSpecies: SpeciesRule;
  colorMode: MapColorMode;
  activeWeather: WeatherContext;
  showLgrbWms: boolean;
}

function getPhColor(ph: number): string {
  if (ph < 4.8) return '#2563eb';
  if (ph < 6.0) return '#0d9488';
  if (ph < 6.8) return '#eab308';
  return '#9333ea';
}

function getSuitabilityColor(score: number, isExcluded: boolean): string {
  if (isExcluded || score < 25) return '#ef4444';
  if (score < 60) return '#f59e0b';
  return '#16a34a';
}

export function HabitatMap({
  geoData,
  selectedHabitatId,
  onSelectHabitat,
  selectedSpecies,
  colorMode,
  activeWeather,
  showLgrbWms,
}: HabitatMapProps) {
  const styleFeature = (feature?: Feature<Geometry, HabitatProperties>): PathOptions => {
    if (!feature) return {};
    const props = feature.properties;
    const isSelected = selectedHabitatId === props.id;

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
      fillOpacity: 0.65,
    };
  };

  const onEachHabitat = (feature: Feature<Geometry, HabitatProperties>, layer: Layer) => {
    const props = feature.properties;
    const ev = evaluateHabitatForSpecies(props, selectedSpecies, activeWeather);
    layer.bindTooltip(
      `<strong>${props.name}</strong><br/>pH ${props.soilPh.toFixed(1)} • ${selectedSpecies.germanName}: ${ev.totalScore}%`,
      { sticky: true },
    );
    layer.on({
      click: () => onSelectHabitat(props),
    });
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={PILOT_REGION_BW.center}
        zoom={PILOT_REGION_BW.defaultZoom}
        className="h-full w-full"
      >
        <TileLayer url={DATA_SOURCES.osmTiles.url} attribution={DATA_SOURCES.osmTiles.attribution} />

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
            key={`${selectedSpecies.id}-${colorMode}-${activeWeather.label}-${selectedHabitatId ?? ''}`}
            data={geoData}
            style={styleFeature}
            onEachFeature={onEachHabitat}
          />
        )}
      </MapContainer>

      <MapLegend colorMode={colorMode} speciesName={selectedSpecies.germanName} />
    </div>
  );
}
