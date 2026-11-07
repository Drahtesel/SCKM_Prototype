export const PILOT_REGION_BW = {
  name: 'Freiburg im Breisgau – Vorbergzone & Schwarzwald (BW)',
  center: [47.985, 7.852] as [number, number],
  defaultZoom: 12,
  bounds: [
    [47.89, 7.72],
    [48.06, 7.97],
  ] as [[number, number], [number, number]],
};

export const DATA_SOURCES = {
  osmTiles: {
    name: 'OpenStreetMap Basiskarte',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  lgrbBwSoilWms: {
    name: 'LGRB Baden-Württemberg – Bodenkarte BK50 (GeoLa)',
    wmsUrl: 'https://services.lgrb-bw.de/ms/lgrb_geola_bod',
    layers: 'stk_bod_bk50_pol',
    attribution: 'Datenquelle: LGRB Baden-Württemberg (dl-de/by-2-0)',
    portalUrl: 'https://maps.lgrb-bw.de/',
  },
  openMeteo: {
    name: 'Open-Meteo API (DWD ICON-D2 / ERA5 Bodenmodell)',
    forecastEndpoint: 'https://api.open-meteo.com/v1/forecast',
    docsUrl: 'https://open-meteo.com/',
  },
  soilGrids: {
    name: 'ISRIC SoilGrids v2.0 (Oberboden pH-Wert)',
    restEndpoint: 'https://rest.isric.org/soilgrids/v2.0/properties/query',
  },
  localGeoJson: {
    name: 'Vorberechnete Habitat-Polygone Freiburg (BW)',
    path: `${import.meta.env.BASE_URL}data/freiburg_habitats.geojson`,
  },
  githubRepo: 'https://github.com/Drahtesel/SCKM_Prototype',
} as const;
