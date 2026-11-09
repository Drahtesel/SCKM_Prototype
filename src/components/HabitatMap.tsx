import { GeoJSON, MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Layer, PathOptions } from 'leaflet';
import { DATA_SOURCES, PILOT_REGION_BW } from '../config/dataSources';
import { evaluateHabitatForSpecies } from '../engine/inferenceEngine';
import { doesHabitatMatchGraphNode } from '../engine/knowledgeGraph';
import { MapLegend } from './MapLegend';
import type {
  HabitatProperties,
  MapColorMode,
  MapRenderStyle,
  SpeciesRule,
  WeatherContext,
} from '../types/knowledge';

interface HabitatMapProps {
  geoData: FeatureCollection<Geometry, HabitatProperties> | null;
  selectedHabitatId: string | null;
  onSelectHabitat: (habitat: HabitatProperties) => void;
  selectedSpecies: SpeciesRule;
  speciesList: SpeciesRule[];
  focusedGraphNodeId: string | null;
  colorMode: MapColorMode;
  renderStyle: MapRenderStyle;
  activeWeather: WeatherContext;
  showLgrbWms: boolean;
}

function resolveFeatureColor(
  props: HabitatProperties,
  colorMode: MapColorMode,
  selectedSpecies: SpeciesRule,
  activeWeather: WeatherContext,
): string {
  if (colorMode === 'soil_ph') {
    if (props.soilPh < 4.8) return '#2563eb';
    if (props.soilPh < 6.0) return '#0d9488';
    if (props.soilPh < 6.8) return '#eab308';
    return '#9333ea';
  }
  if (colorMode === 'forest_type') {
    if (props.leafType === 'needleleaved') return '#14532d';
    if (props.leafType === 'broadleaved') return '#65a30d';
    return '#0f766e';
  }
  const ev = evaluateHabitatForSpecies(props, selectedSpecies, activeWeather);
  if (ev.isExcluded || ev.totalScore < 25) return '#ef4444';
  if (ev.totalScore < 60) return '#f59e0b';
  return '#16a34a';
}

export function HabitatMap({
  geoData,
  selectedHabitatId,
  onSelectHabitat,
  selectedSpecies,
  speciesList,
  focusedGraphNodeId,
  colorMode,
  renderStyle,
  activeWeather,
  showLgrbWms,
}: HabitatMapProps) {
  const showHeatGlow = renderStyle === 'heatmap' || renderStyle === 'hybrid';

  const styleHeatmapFeature = (feature?: Feature<Geometry, HabitatProperties>): PathOptions => {
    if (!feature) return {};
    const fillColor = resolveFeatureColor(
      feature.properties,
      colorMode,
      selectedSpecies,
      activeWeather,
    );
    return {
      className: 'leaflet-heatmap-glow',
      stroke: true,
      color: fillColor,
      weight: renderStyle === 'heatmap' ? 6 : 3,
      opacity: renderStyle === 'heatmap' ? 0.65 : 0.35,
      fillColor,
      fillOpacity: renderStyle === 'heatmap' ? 0.78 : 0.42,
    };
  };

  const styleParcelFeature = (feature?: Feature<Geometry, HabitatProperties>): PathOptions => {
    if (!feature) return {};
    const props = feature.properties;
    const isSelected = selectedHabitatId === props.id;
    const matchesGraphFilter = doesHabitatMatchGraphNode(props, focusedGraphNodeId, speciesList);
    const dimmedByGraph = Boolean(focusedGraphNodeId && !matchesGraphFilter);
    const fillColor = resolveFeatureColor(props, colorMode, selectedSpecies, activeWeather);

    return {
      color: isSelected ? '#0f172a' : matchesGraphFilter ? '#0284c7' : '#ffffff',
      weight: isSelected ? 2.8 : matchesGraphFilter ? 2.2 : renderStyle === 'heatmap' ? 0 : 0.8,
      opacity: isSelected || matchesGraphFilter ? 1 : renderStyle === 'heatmap' ? 0 : 0.7,
      fillColor,
      fillOpacity: dimmedByGraph
        ? 0.14
        : renderStyle === 'heatmap'
          ? isSelected || matchesGraphFilter
            ? 0.38
            : 0.01
          : 0.56,
    };
  };

  const onEachHabitat = (feature: Feature<Geometry, HabitatProperties>, layer: Layer) => {
    const props = feature.properties;
    const ev = evaluateHabitatForSpecies(props, selectedSpecies, activeWeather);
    layer.bindTooltip(
      `<strong>${props.name}</strong><br/>pH ${props.soilPh.toFixed(1)} • ${props.areaHa ?? ''} ha • ${selectedSpecies.germanName}: ${ev.totalScore}%`,
      { sticky: true },
    );
    layer.on({
      click: () => onSelectHabitat(props),
    });
  };

  const layerKey = `${selectedSpecies.id}-${colorMode}-${renderStyle}-${activeWeather.label}-${selectedHabitatId ?? ''}-${focusedGraphNodeId ?? ''}`;

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

        {geoData && showHeatGlow && (
          <GeoJSON key={`heat-${layerKey}`} data={geoData} style={styleHeatmapFeature} />
        )}

        {geoData && (
          <GeoJSON
            key={`parcels-${layerKey}`}
            data={geoData}
            style={styleParcelFeature}
            onEachFeature={onEachHabitat}
          />
        )}
      </MapContainer>

      <MapLegend colorMode={colorMode} speciesName={selectedSpecies.germanName} />
    </div>
  );
}
