import { DATA_SOURCES, PILOT_REGION_BW } from '../config/dataSources';
import type { WeatherContext } from '../types/knowledge';

export const WEATHER_SCENARIOS: Record<string, WeatherContext> = {
  autumn_flush: {
    source: 'scenario_simulation',
    label: 'Szenario: Spätsommer-/Herbstschub nach Landregen',
    fetchedAt: 'Simulationsprofil',
    rain7dMm: 24.5,
    rain14dMm: 46.0,
    soilTemp0to7cmC: 14.2,
    soilMoisture0to7cm: 0.34,
  },
  spring_morel: {
    source: 'scenario_simulation',
    label: 'Szenario: Milder April nach Frühlingsregen (Morchelzeit)',
    fetchedAt: 'Simulationsprofil',
    rain7dMm: 16.0,
    rain14dMm: 31.0,
    soilTemp0to7cmC: 10.8,
    soilMoisture0to7cm: 0.31,
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

  const json = await response.json();
  const precip: number[] = json.hourly?.precipitation ?? [];
  const soilTemp: number[] = json.hourly?.soil_temperature_0_to_7cm ?? [];
  const soilMoist: number[] = json.hourly?.soil_moisture_0_to_7cm ?? [];

  const validPrecip = precip.filter((v) => typeof v === 'number');
  const rain14dMm = Number(validPrecip.reduce((acc, v) => acc + v, 0).toFixed(1));
  const last7dHours = validPrecip.slice(-24 * 7);
  const rain7dMm = Number(last7dHours.reduce((acc, v) => acc + v, 0).toFixed(1));

  const latestSoilTemp =
    [...soilTemp].reverse().find((v) => typeof v === 'number') ?? 9.5;
  const latestSoilMoist =
    [...soilMoist].reverse().find((v) => typeof v === 'number') ?? 0.28;

  return {
    source: 'live_open_meteo',
    label: 'Live-Wetter Freiburg (DWD ICON / Open-Meteo)',
    fetchedAt: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    rain7dMm,
    rain14dMm,
    soilTemp0to7cmC: Number(latestSoilTemp.toFixed(1)),
    soilMoisture0to7cm: Number(latestSoilMoist.toFixed(3)),
  };
}
