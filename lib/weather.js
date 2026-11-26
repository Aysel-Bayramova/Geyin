export const DEMO_PRESETS = [
  { id: 'live', label: { az: 'Canlı Hava', en: 'Live Weather', ru: 'Живая погода' } },
  {
    id: 'sunny',
    label: { az: 'Günəşli 25°C', en: 'Sunny 25°C', ru: 'Солнечно 25°C' },
    temp: 25,
    apparent: 26,
    wind: 10,
    code: 0,
    minTemp: 19,
    maxTemp: 26,
    rainProb: 5,
  },
  {
    id: 'rainy',
    label: { az: 'Yağışlı 10°C', en: 'Rainy 10°C', ru: 'Дождь 10°C' },
    temp: 10,
    apparent: 8,
    wind: 22,
    code: 63,
    minTemp: 7,
    maxTemp: 12,
    rainProb: 85,
  },
  {
    id: 'snowy',
    label: { az: 'Qarlı 0°C', en: 'Snowy 0°C', ru: 'Снег 0°C' },
    temp: 0,
    apparent: -4,
    wind: 30,
    code: 73,
    minTemp: -3,
    maxTemp: 2,
    rainProb: 90,
  },
];

export function interpretWeather(code, temp, windSpeed, hourlyForecast = null, lang = 'az') {
  const isRainy =
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
  const isSnowy = [71, 73, 75, 77, 85, 86].includes(code);
  const isWindy = windSpeed >= 25;

  const condMap = {
    az: {
      snow: 'Qarlı',
      rain: 'Yağışlı',
      fog: 'Dumanlı',
      clear: 'Günəşli və açıq',
      clouds: 'Dəyişkən buludlu',
      default: 'Açıq / Buludlu',
    },
    en: {
      snow: 'Snowy',
      rain: 'Rainy',
      fog: 'Foggy',
      clear: 'Sunny & clear',
      clouds: 'Partly cloudy',
      default: 'Clear / Cloudy',
    },
    ru: {
      snow: 'Снежно',
      rain: 'Дождливо',
      fog: 'Туман',
      clear: 'Ясно и солнечно',
      clouds: 'Переменная облачность',
      default: 'Ясно / Облачно',
    },
  }[lang] || {
    snow: 'Qarlı',
    rain: 'Yağışlı',
    fog: 'Dumanlı',
    clear: 'Günəşli və açıq',
    clouds: 'Dəyişkən buludlu',
    default: 'Açıq / Buludlu',
  };

  let conditionText = condMap.default;
  if (isSnowy) conditionText = condMap.snow;
  else if (isRainy) conditionText = condMap.rain;
  else if (code === 45 || code === 48) conditionText = condMap.fog;
  else if (code === 0) conditionText = condMap.clear;
  else if ([1, 2, 3].includes(code)) conditionText = condMap.clouds;

  let idealWarmth = 3;
  if (temp <= 4) idealWarmth = 5;
  else if (temp <= 11) idealWarmth = 4;
  else if (temp <= 18) idealWarmth = 3;
  else if (temp <= 25) idealWarmth = 2;
  else idealWarmth = 1;

  const tips = [];
  if (lang === 'en') {
    if (temp <= 5) tips.push('Very cold: pick a heavy coat/jacket, knitwear, and warm closed shoes.');
    else if (temp <= 12) tips.push('Chilly weather: layering (tee/hoodie + jacket) works best.');
    else if (temp <= 19) tips.push('Mild weather: a light top and thin jacket or overshirt is enough.');
    else if (temp <= 26) tips.push('Warm & pleasant: breathable cotton/linen top and comfortable pants fit well.');
    else tips.push('Very hot: prefer light colors and thin (warmth 1–2) breathable fabrics.');

    if (isRainy || isSnowy) tips.push("Precipitation expected: don't forget waterproof outerwear and shoes.");
    if (isWindy) tips.push(`Strong wind (${Math.round(windSpeed)} km/h): wear a windproof layer.`);
  } else if (lang === 'ru') {
    if (temp <= 5) tips.push('Очень холодно: выберите теплый пуховик/пальто, свитер и закрытую обувь.');
    else if (temp <= 12) tips.push('Прохладно: лучше всего подойдет многослойность (худи/рубашка + куртка).');
    else if (temp <= 19) tips.push('Умеренная погода: хватит легкого верха и тонкой куртки или жакета.');
    else if (temp <= 26) tips.push('Тепло и комфортно: подойдут дышащие ткани и удобные брюки.');
    else tips.push('Очень жарко: выбирайте светлые оттенки и тонкие ткани (тепло 1–2).');

    if (isRainy || isSnowy) tips.push('Осадки: возьмите влагозащитную верхнюю одежду и обувь.');
    if (isWindy) tips.push(`Сильный ветер (${Math.round(windSpeed)} км/ч): наденьте ветрозащитный слой.`);
  } else {
    if (temp <= 5) tips.push('Hava çox soyuqdur: qalın palto/gödəkçə, sviter və qapalı isti ayaqqabı seç.');
    else if (temp <= 12) tips.push('Hava sərindir: qat-qat geyim (köynək/hudi + gödəkçə) ən ideal seçimdir.');
    else if (temp <= 19) tips.push('Mülayim hava var: yüngül üst geyim və nazik pencək/jaket kifayət edər.');
    else if (temp <= 26) tips.push('İsti və komfortlu havadır: nəfəs alan pambıq/kətan köynək və rahat şalvar uyğundur.');
    else tips.push('Çox isti havadır: açıq rəngli, çox nazik (istilik 1-2) parçalara üstünlük ver.');

    if (isRainy || isSnowy) tips.push('Yağıntı var: suya davamlı üst örtük və ayaqqabı götürməyi unutma.');
    if (isWindy) tips.push(`Külək güclüdür (${Math.round(windSpeed)} km/saat): küləyə davamlı gödəkçə geyin.`);
  }

  let eveningAlert = null;
  let eveningCoolDrop = false;
  if (hourlyForecast) {
    const { minTemp, rainProb } = hourlyForecast;
    if (temp - minTemp >= 6 && minTemp <= 14) {
      eveningCoolDrop = true;
      if (lang === 'en') {
        eveningAlert = `Temperature will drop to ${minTemp}°C in the evening — taking an outer layer is recommended.`;
      } else if (lang === 'ru') {
        eveningAlert = `Вечером температура опустится до ${minTemp}°C — стоит взять верхнюю одежду.`;
      } else {
        eveningAlert = `Axşam temperatur ${minTemp}°C-yə qədər düşəcək — çölə çıxanda üst örtük götürməyin məsləhətdir.`;
      }
    } else if (!isRainy && rainProb >= 55) {
      if (lang === 'en') {
        eveningAlert = `Precipitation chance today is ${rainProb}% — a waterproof piece is helpful.`;
      } else if (lang === 'ru') {
        eveningAlert = `Вероятность осадков за день ${rainProb}% — пригодится влагозащита.`;
      } else {
        eveningAlert = `Gün ərzində yağıntı ehtimalı ${rainProb}%-dir — suya davamlı parça seçmək faydalı olar.`;
      }
    }
  }

  return {
    conditionText,
    isRainy: isRainy || isSnowy || hourlyForecast?.rainProb >= 65,
    isWindy,
    idealWarmth,
    needOuterwear: temp <= 17 || isRainy || isSnowy || isWindy || eveningCoolDrop,
    generalAdvice: tips.join(' '),
    eveningAlert,
    minTemp: hourlyForecast?.minTemp ?? temp,
    maxTemp: hourlyForecast?.maxTemp ?? temp,
  };
}

export async function fetchCurrentWeather(lat, lon, label) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&forecast_days=1&timezone=auto`
  );
  const data = await res.json();
  if (!data?.current) return null;

  let hourlyForecast = null;
  if (data?.hourly?.temperature_2m?.length) {
    const temps = data.hourly.temperature_2m;
    const probs = data.hourly.precipitation_probability || [];
    hourlyForecast = {
      minTemp: Math.round(Math.min(...temps)),
      maxTemp: Math.round(Math.max(...temps)),
      rainProb: probs.length ? Math.max(...probs) : 0,
    };
  }

  return {
    locationName: label,
    temp: Math.round(data.current.temperature_2m),
    apparent: Math.round(data.current.apparent_temperature),
    wind: data.current.wind_speed_10m,
    code: data.current.weather_code,
    hourlyForecast,
  };
}

export async function fetchWeeklyWeather(lat, lon, signal) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`,
    signal ? { signal } : undefined
  );
  const data = await res.json();
  if (!data?.daily?.time) return [];

  return data.daily.time.map((dateStr, idx) => ({
    date: dateStr,
    maxTemp: Math.round(data.daily.temperature_2m_max?.[idx] ?? 0),
    minTemp: Math.round(data.daily.temperature_2m_min?.[idx] ?? 0),
    rainProb: data.daily.precipitation_probability_max?.[idx] ?? 0,
  }));
}

export async function searchCityByName(query, lang = 'az') {
  const geoLang = lang === 'ru' ? 'ru' : lang === 'en' ? 'en' : 'en';
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&count=1&language=${geoLang}&format=json`
  );
  const geoData = await geoRes.json();
  return geoData?.results?.[0] || null;
}

export function resolveActiveWeather(demoPresetId, liveRawWeather, selectedCity, lang = 'az') {
  if (demoPresetId === 'live') {
    if (!liveRawWeather) return null;
    const info = interpretWeather(
      liveRawWeather.code,
      liveRawWeather.temp,
      liveRawWeather.wind,
      liveRawWeather.hourlyForecast,
      lang
    );
    return {
      locationName: liveRawWeather.locationName,
      temp: liveRawWeather.temp,
      apparent: liveRawWeather.apparent,
      wind: liveRawWeather.wind,
      ...info,
    };
  }

  const preset = DEMO_PRESETS.find((p) => p.id === demoPresetId);
  if (!preset) return null;
  const info = interpretWeather(
    preset.code,
    preset.temp,
    preset.wind,
    {
      minTemp: preset.minTemp,
      maxTemp: preset.maxTemp,
      rainProb: preset.rainProb,
    },
    lang
  );
  const demoSuffix =
    lang === 'en' ? '(Demo)' : lang === 'ru' ? '(Демо)' : '(Demo Simulyasiya)';
  return {
    locationName: `${liveRawWeather?.locationName || selectedCity} ${demoSuffix}`,
    temp: preset.temp,
    apparent: preset.apparent,
    wind: preset.wind,
    ...info,
  };
}
