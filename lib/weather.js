const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export class WeatherApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = 'WeatherApiError';
    this.status = status;
  }
}

export function isAbortError(err) {
  return err?.name === 'AbortError';
}

async function fetchJson(url, { signal } = {}) {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new WeatherApiError(`Open-Meteo request failed with status ${res.status}`, res.status);
  }
  return res.json();
}

export async function fetchCurrentWeather(lat, lon, { signal } = {}) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,precipitation_probability',
    forecast_days: '1',
    timezone: 'auto',
  });

  const data = await fetchJson(`${OPEN_METEO_FORECAST_URL}?${params.toString()}`, { signal });
  if (!data?.current) {
    throw new WeatherApiError('Missing current weather data in response');
  }

  let hourlyForecast = null;
  if (Array.isArray(data?.hourly?.temperature_2m) && data.hourly.temperature_2m.length > 0) {
    const temps = data.hourly.temperature_2m;
    const probs = Array.isArray(data.hourly.precipitation_probability)
      ? data.hourly.precipitation_probability
      : [];
    hourlyForecast = {
      minTemp: Math.round(Math.min(...temps)),
      maxTemp: Math.round(Math.max(...temps)),
      rainProb: probs.length > 0 ? Math.max(...probs) : 0,
    };
  }

  return {
    temp: Math.round(data.current.temperature_2m),
    apparent: Math.round(data.current.apparent_temperature),
    wind: data.current.wind_speed_10m,
    code: data.current.weather_code,
    hourlyForecast,
  };
}

export async function fetchDailyForecast(lat, lon, { days = 7, signal } = {}) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: String(days),
    timezone: 'auto',
  });

  const data = await fetchJson(`${OPEN_METEO_FORECAST_URL}?${params.toString()}`, { signal });
  if (!Array.isArray(data?.daily?.time) || data.daily.time.length === 0) {
    throw new WeatherApiError('Missing daily forecast data in response');
  }

  return data.daily.time.map((dateStr, idx) => ({
    date: dateStr,
    maxTemp: Math.round(data.daily.temperature_2m_max?.[idx] ?? 0),
    minTemp: Math.round(data.daily.temperature_2m_min?.[idx] ?? 0),
    rainProb: data.daily.precipitation_probability_max?.[idx] ?? 0,
  }));
}

export async function searchGeocodingCity(query, lang = 'az', { signal } = {}) {
  const params = new URLSearchParams({
    name: query,
    count: '1',
    language: lang === 'ru' ? 'ru' : 'en',
    format: 'json',
  });

  const data = await fetchJson(`${OPEN_METEO_GEOCODING_URL}?${params.toString()}`, { signal });
  return data?.results?.[0] || null;
}
