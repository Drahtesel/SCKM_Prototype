import { DATA_SOURCES, PILOT_REGION_BW } from '../config/dataSources';
import type { WeatherContext } from '../types/knowledge';

export const DEFAULT_WEATHER_SCENARIO_KEY = 'autumn_flush';

export const WEATHER_SCENARIOS: Record<string, WeatherContext> = {
  autumn_flush: {
    source: 'scenario_simulation',
    label: 'Simulation: Spätsommer-/Herbstregen',
    fetchedAt: 'Statisches Profil',
    rain7dMm: 24.5,
    rain14dMm: 46.0,
    soilTemp0to7cmC: 14.2,
    soilMoisture0to7cm: 0.34,
  },
  spring_morel: {
    source: 'scenario_simulation',
    label: 'Simulation: Milder April (Morchelzeit)',
    fetchedAt: 'Statisches Profil',
    rain7dMm: 16.0,
    rain14dMm: 31.0,
    soilTemp0to7cmC: 10.8,
    soilMoisture0to7cm: 0.31,
  },
  summer_dry: {
    source: 'scenario_simulation',
    label: 'Simulation: Trockenperiode im Hochsommer',
    fetchedAt: 'Statisches Profil',
    rain7dMm: 2.0,
    rain14dMm: 6.5,
    soilTemp0to7cmC: 21.5,
    soilMoisture0to7cm: 0.14,
  },
};

export async function fetchFreiburgLiveWeather(): Promise<WeatherContext> {
  const [lat, lon] = PILOT_REGION_BW.center;
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    past_days: '14',
    forecast_days: '1',
    hourly: 'precipitation,soil_temperature_0_to_7cm,soil_moisture_0_to_7cm',
    timezone: 'Europe/Berlin',
  });

  const response = await fetch(`${DATA_SOURCES.openMeteo.forecastEndpoint}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Open-Meteo HTTP ${response.status}`);
  }

  const json = (await response.json()) as {
    hourly?: {
      precipitation?: Array<number | null>;
      soil_temperature_0_to_7cm?: Array<number | null>;
      soil_moisture_0_to_7cm?: Array<number | null>;
    };
  };

  const precip = (json.hourly?.precipitation ?? []).filter((v): v is number => typeof v === 'number');
  const soilTemp = (json.hourly?.soil_temperature_0_to_7cm ?? []).filter(
    (v): v is number => typeof v === 'number',
  );
  const soilMoist = (json.hourly?.soil_moisture_0_to_7cm ?? []).filter(
    (v): v is number => typeof v === 'number',
  );

  const rain14dMm = Number(precip.reduce((acc, v) => acc + v, 0).toFixed(1));
  const rain7dMm = Number(precip.slice(-24 * 7).reduce((acc, v) => acc + v, 0).toFixed(1));
  const latestTemp = soilTemp[soilTemp.length - 1] ?? 10.0;
  const latestMoist = soilMoist[soilMoist.length - 1] ?? 0.28;

  return {
    source: 'live_open_meteo',
    label: 'Live-Wetter Freiburg (Open-Meteo)',
    fetchedAt: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    rain7dMm,
    rain14dMm,
    soilTemp0to7cmC: Number(latestTemp.toFixed(1)),
    soilMoisture0to7cm: Number(latestMoist.toFixed(3)),
  };
}
