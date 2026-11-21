'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

const CATEGORIES = ['Üst geyim', 'Alt geyim', 'Üst örtük (Gödəkçə/Palto)', 'Ayaqqabı', 'Aksesuar'];
const STYLES = [
  { value: 'gundelik', label: 'Gündəlik' },
  { value: 'klassik', label: 'Klassik / İş' },
  { value: 'idman', label: 'İdman' },
  { value: 'gece', label: 'Xüsusi / Axşam' },
];

const AZERBAIJAN_CITIES = [
  { name: 'Bakı', lat: 40.4093, lon: 49.8671 },
  { name: 'Sumqayıt', lat: 40.5897, lon: 49.6686 },
  { name: 'Gəncə', lat: 40.6828, lon: 46.3606 },
  { name: 'Mingəçevir', lat: 40.7703, lon: 47.0496 },
  { name: 'Şirvan', lat: 39.9378, lon: 48.929 },
  { name: 'Naxçıvan', lat: 39.2089, lon: 45.4122 },
  { name: 'Lənkəran', lat: 38.7543, lon: 48.8506 },
  { name: 'Şəki', lat: 41.1919, lon: 47.1706 },
  { name: 'Yevlax', lat: 40.6183, lon: 47.1501 },
  { name: 'Xankəndi', lat: 39.8153, lon: 46.7519 },
  { name: 'Şuşa', lat: 39.7601, lon: 46.7465 },
  { name: 'Quba', lat: 41.3611, lon: 48.5134 },
  { name: 'Qusar', lat: 41.4267, lon: 48.4346 },
  { name: 'Xaçmaz', lat: 41.4635, lon: 48.806 },
  { name: 'Şamaxı', lat: 40.6314, lon: 48.6414 },
  { name: 'İsmayıllı', lat: 40.7871, lon: 48.1523 },
  { name: 'Qəbələ', lat: 40.9814, lon: 47.8458 },
  { name: 'Zaqatala', lat: 41.6316, lon: 46.6448 },
  { name: 'Balakən', lat: 41.7263, lon: 46.4048 },
  { name: 'Qax', lat: 41.4183, lon: 46.9204 },
  { name: 'Oğuz', lat: 41.0713, lon: 47.4651 },
  { name: 'Göyçay', lat: 40.6506, lon: 47.7422 },
  { name: 'Ağdaş', lat: 40.647, lon: 47.4738 },
  { name: 'Kürdəmir', lat: 40.3453, lon: 48.1509 },
  { name: 'Sabirabad', lat: 40.0087, lon: 48.477 },
  { name: 'Saatlı', lat: 39.9321, lon: 48.3689 },
  { name: 'İmişli', lat: 39.871, lon: 48.06 },
  { name: 'Beyləqan', lat: 39.7756, lon: 47.6186 },
  { name: 'Ağcabədi', lat: 40.0502, lon: 47.4594 },
  { name: 'Bərdə', lat: 40.3758, lon: 47.1262 },
  { name: 'Tərtər', lat: 40.342, lon: 46.9316 },
  { name: 'Ağdam', lat: 39.9911, lon: 46.9274 },
  { name: 'Füzuli', lat: 39.6009, lon: 47.1453 },
  { name: 'Cəbrayıl', lat: 39.3992, lon: 47.0284 },
  { name: 'Zəngilan', lat: 39.0837, lon: 46.6525 },
  { name: 'Qubadlı', lat: 39.3444, lon: 46.5818 },
  { name: 'Laçın', lat: 39.6383, lon: 46.5461 },
  { name: 'Kəlbəcər', lat: 40.1098, lon: 46.0445 },
  { name: 'Şəmkir', lat: 40.8297, lon: 46.0178 },
  { name: 'Tovuz', lat: 40.9922, lon: 45.6283 },
  { name: 'Qazax', lat: 41.0925, lon: 45.3656 },
  { name: 'Ağstafa', lat: 41.1189, lon: 45.4539 },
  { name: 'Gədəbəy', lat: 40.57, lon: 45.8123 },
  { name: 'Daşkəsən', lat: 40.5202, lon: 46.0779 },
  { name: 'Göygöl', lat: 40.5906, lon: 46.3189 },
  { name: 'Goranboy', lat: 40.6103, lon: 46.7897 },
  { name: 'Masallı', lat: 39.0353, lon: 48.6654 },
  { name: 'Astara', lat: 38.456, lon: 48.875 },
  { name: 'Lerik', lat: 38.7739, lon: 48.4149 },
  { name: 'Yardımlı', lat: 38.9077, lon: 48.2405 },
  { name: 'Cəlilabad', lat: 39.2096, lon: 48.4919 },
  { name: 'Biləsuvar', lat: 39.4583, lon: 48.545 },
  { name: 'Neftçala', lat: 39.3768, lon: 49.247 },
  { name: 'Salyan', lat: 39.5962, lon: 48.9848 },
  { name: 'Hacıqabul', lat: 40.0387, lon: 48.9429 },
  { name: 'Qobustan', lat: 40.5326, lon: 48.9282 },
  { name: 'Ağsu', lat: 40.5703, lon: 48.4009 },
  { name: 'Ucar', lat: 40.519, lon: 47.6542 },
  { name: 'Zərdab', lat: 40.2184, lon: 47.7121 },
  { name: 'Siyəzən', lat: 41.0784, lon: 49.1118 },
  { name: 'Şabran', lat: 41.2012, lon: 48.9871 },
  { name: 'Xızı', lat: 40.9085, lon: 49.0748 },
  { name: 'Ordubad', lat: 38.9096, lon: 46.0227 },
  { name: 'Culfa', lat: 38.9539, lon: 45.6293 },
  { name: 'Şərur', lat: 39.5529, lon: 44.9799 },
];

const DEMO_PRESETS = [
  { id: 'live', label: 'Canlı Hava' },
  { id: 'sunny', label: 'Günəşli 25°C', temp: 25, apparent: 26, wind: 10, code: 0, minTemp: 19, maxTemp: 26, rainProb: 5 },
  { id: 'rainy', label: 'Yağışlı 10°C', temp: 10, apparent: 8, wind: 22, code: 63, minTemp: 7, maxTemp: 12, rainProb: 85 },
  { id: 'snowy', label: 'Qarlı 0°C', temp: 0, apparent: -4, wind: 30, code: 73, minTemp: -3, maxTemp: 2, rainProb: 90 },
];

const NEUTRAL_KEYWORDS = [
  'qara', 'ağ', 'ag', 'bej', 'boz', 'krem', 'qəhvəyi', 'qehveyi',
  'tünd göy', 'göy', 'goy', 'cins', 'xaki', 'black', 'white',
  'beige', 'gray', 'grey', 'navy', 'brown',
];

function isNeutralColor(colorStr) {
  if (!colorStr) return true;
  const lower = colorStr.toLowerCase().trim();
  return NEUTRAL_KEYWORDS.some((kw) => lower.includes(kw));
}

function getColorHarmonyBonus(colorA, colorB) {
  if (!colorA || !colorB) return 10;
  const a = colorA.toLowerCase().trim();
  const b = colorB.toLowerCase().trim();
  if (isNeutralColor(a) || isNeutralColor(b)) return 22;
  if (a === b) return 16;
  return 4;
}

function findNearestCity(lat, lon) {
  let nearest = AZERBAIJAN_CITIES[0];
  let minDist = Infinity;
  for (const city of AZERBAIJAN_CITIES) {
    const d = Math.hypot(city.lat - lat, city.lon - lon);
    if (d < minDist) {
      minDist = d;
      nearest = city;
    }
  }
  return minDist < 1.5 ? nearest.name : `GPS Məkanı (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
}

function interpretWeather(code, temp, windSpeed, hourlyForecast = null) {
  const isRainy =
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
  const isSnowy = [71, 73, 75, 77, 85, 86].includes(code);
  const isWindy = windSpeed >= 25;

  let conditionText = 'Açıq / Buludlu';
  if (isSnowy) conditionText = 'Qarlı';
  else if (isRainy) conditionText = 'Yağışlı';
  else if (code === 45 || code === 48) conditionText = 'Dumanlı';
  else if (code === 0) conditionText = 'Günəşli və açıq';
  else if ([1, 2, 3].includes(code)) conditionText = 'Dəyişkən buludlu';

  let idealWarmth = 3;
  if (temp <= 4) idealWarmth = 5;
  else if (temp <= 11) idealWarmth = 4;
  else if (temp <= 18) idealWarmth = 3;
  else if (temp <= 25) idealWarmth = 2;
  else idealWarmth = 1;

  const tips = [];
  if (temp <= 5) {
    tips.push('Hava çox soyuqdur: qalın palto/gödəkçə, sviter və qapalı isti ayaqqabı seç.');
  } else if (temp <= 12) {
    tips.push('Hava sərindir: qat-qat geyim (köynək/hudi + gödəkçə) ən ideal seçimdir.');
  } else if (temp <= 19) {
    tips.push('Mülayim hava var: yüngül üst geyim və nazik pencək/jaket kifayət edər.');
  } else if (temp <= 26) {
    tips.push('İsti və komfortlu havadır: nəfəs alan pambıq/kətan köynək və rahat şalvar uyğundur.');
  } else {
    tips.push('Çox isti havadır: açıq rəngli, çox nazik (istilik 1-2) parçalara üstünlük ver.');
  }

  if (isRainy || isSnowy) {
    tips.push('Yağıntı var: suya davamlı üst örtük və ayaqqabı götürməyi unutma.');
  }
  if (isWindy) {
    tips.push(`Külək güclüdür (${Math.round(windSpeed)} km/saat): küləyə davamlı gödəkçə geyin.`);
  }

  let eveningAlert = null;
  let eveningCoolDrop = false;
  if (hourlyForecast) {
    const { minTemp, rainProb } = hourlyForecast;
    if (temp - minTemp >= 6 && minTemp <= 14) {
      eveningCoolDrop = true;
      eveningAlert = `Axşam temperatur ${minTemp}°C-yə qədər düşəcək — çölə çıxanda üst örtük götürməyin məsləhətdir.`;
    } else if (!isRainy && rainProb >= 55) {
      eveningAlert = `Gün ərzində yağıntı ehtimalı ${rainProb}%-dir — suya davamlı parça seçmək faydalı olar.`;
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

function buildOutfitExplanation(outfit, weatherInfo) {
  if (!outfit || !weatherInfo) return '';
  const selected = [
    outfit.top,
    outfit.bottom,
    outfit.outerwear,
    outfit.shoes,
    outfit.accessory,
  ].filter(Boolean);
  if (selected.length === 0) return '';

  const reasons = [];
  reasons.push(`${weatherInfo.temp}°C hava üçün ideal istilik (${weatherInfo.idealWarmth}/5) hədəfləndi`);

  const hasWaterproof = selected.some((i) => i.waterproof);
  const hasWindproof = selected.some((i) => i.windproof);

  if (weatherInfo.isRainy && hasWaterproof) {
    reasons.push('yağışa qarşı suya davamlı parça seçildi');
  }
  if (weatherInfo.isWindy && hasWindproof) {
    reasons.push('küləyə davamlı qoruma əlavə edildi');
  }

  const colors = selected.map((i) => i.color).filter(Boolean);
  if (colors.length >= 2) {
    reasons.push(`${colors.slice(0, 3).join(' + ')} rəng harmoniyası uyğunlaşdırıldı`);
  }

  return reasons.join(', ') + '.';
}

function buildSmartOutfit(
  items,
  weatherInfo,
  preferredStyle = 'all',
  lockedSlots = {},
  currentOutfit = null,
  excludeIdsBySlot = {}
) {
  if (!items || items.length === 0 || !weatherInfo) return null;

  const pickBestForCategory = (slotKey, catName, anchorColor = null) => {
    if (lockedSlots[slotKey] && currentOutfit?.[slotKey]) {
      return currentOutfit[slotKey];
    }

    let candidates = items.filter((item) => item.category === catName);
    if (candidates.length === 0) return null;

    const excludeId = excludeIdsBySlot[slotKey];
    if (excludeId && candidates.length > 1) {
      candidates = candidates.filter((c) => c.id !== excludeId);
    }

    const scored = candidates.map((item) => {
      let score = 0;

      const diff = Math.abs((item.warmth_level || 3) - weatherInfo.idealWarmth);
      score += Math.max(0, 50 - diff * 15);

      if (weatherInfo.isRainy && item.waterproof) score += 25;
      if (weatherInfo.isWindy && item.windproof) score += 20;

      if (preferredStyle !== 'all' && item.style === preferredStyle) {
        score += 20;
      }

      if (anchorColor) {
        score += getColorHarmonyBonus(anchorColor, item.color);
      }

      score += Math.random() * 18;

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].item;
  };

  const top = pickBestForCategory('top', 'Üst geyim');
  const anchorColor = top?.color || null;

  const bottom = pickBestForCategory('bottom', 'Alt geyim', anchorColor);
  const outerwear =
    weatherInfo.needOuterwear || (lockedSlots.outerwear && currentOutfit?.outerwear)
      ? pickBestForCategory('outerwear', 'Üst örtük (Gödəkçə/Palto)', anchorColor)
      : null;
  const shoes = pickBestForCategory('shoes', 'Ayaqqabı', bottom?.color || anchorColor);
  const accessory = pickBestForCategory('accessory', 'Aksesuar', anchorColor);

  const nextOutfit = { top, bottom, outerwear, shoes, accessory };
  nextOutfit.explanation = buildOutfitExplanation(nextOutfit, weatherInfo);
  return nextOutfit;
}

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegister, setIsRegister] = useState(false);

  // Theme state: 'auto' | 'light' | 'dark'
  const [themeMode, setThemeMode] = useState('auto');
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Wardrobe state
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Hamısı');

  // Form state for new item
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subCategory, setSubCategory] = useState('');
  const [color, setColor] = useState('');
  const [warmthLevel, setWarmthLevel] = useState(3);
  const [waterproof, setWaterproof] = useState(false);
  const [windproof, setWindproof] = useState(false);
  const [style, setStyle] = useState('gundelik');

  // Weather & Outfit state
  const [selectedCity, setSelectedCity] = useState('Bakı');
  const [locationSource, setLocationSource] = useState('Avtomatik axtarılır...');
  const [liveWeather, setLiveWeather] = useState(null);
  const [demoPresetId, setDemoPresetId] = useState('live');
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [outfitStyleFilter, setOutfitStyleFilter] = useState('all');
  const [recommendedOutfit, setRecommendedOutfit] = useState(null);
  const [outfitAnimKey, setOutfitAnimKey] = useState(0);
  const [lockedSlots, setLockedSlots] = useState({});
  const [savedOutfits, setSavedOutfits] = useState([]);

  // Detect OS / phone color scheme & saved theme preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedTheme = localStorage.getItem('geyin_theme_mode');
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
        setThemeMode(savedTheme);
      }
    } catch {
      // ignore
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);

    const handleChange = (e) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleSelectTheme = (mode) => {
    setThemeMode(mode);
    try {
      localStorage.setItem('geyin_theme_mode', mode);
    } catch {
      // ignore
    }
  };

  const isDark = themeMode === 'dark' || (themeMode === 'auto' && systemPrefersDark);

  // Image file preview cleanup
  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const activeWeather = useMemo(() => {
    if (demoPresetId === 'live') return liveWeather;
    const preset = DEMO_PRESETS.find((p) => p.id === demoPresetId);
    if (!preset) return liveWeather;
    const info = interpretWeather(preset.code, preset.temp, preset.wind, {
      minTemp: preset.minTemp,
      maxTemp: preset.maxTemp,
      rainProb: preset.rainProb,
    });
    return {
      locationName: `${liveWeather?.locationName || selectedCity} (Demo Simulyasiya)`,
      temp: preset.temp,
      apparent: preset.apparent,
      wind: preset.wind,
      ...info,
    };
  }, [demoPresetId, liveWeather, selectedCity]);

  const wardrobeInsights = useMemo(() => {
    if (!items || items.length === 0) return null;
    const avgWarmth = (
      items.reduce((acc, i) => acc + (Number(i.warmth_level) || 3), 0) / items.length
    ).toFixed(1);

    const hasWaterproof = items.some((i) => i.waterproof);
    const missingCategories = CATEGORIES.filter(
      (cat) => cat !== 'Aksesuar' && !items.some((i) => i.category === cat)
    );

    let suggestion = 'Qarderobun bütün əsas kateqoriyalar üzrə balanslıdır.';
    if (missingCategories.length > 0) {
      suggestion = `Tam kombinlər üçün çatışmayan kateqoriya: ${missingCategories.join(', ')}.`;
    } else if (!hasWaterproof) {
      suggestion =
        'Yağışlı günlər üçün qarderobuna ən azı 1 suya davamlı üst örtük və ya ayaqqabı əlavə etməyin tövsiyə olunur.';
    }

    return {
      total: items.length,
      avgWarmth,
      waterproofCount: items.filter((i) => i.waterproof).length,
      suggestion,
    };
  }, [items]);

  const fetchWeatherByCoords = useCallback(async (lat, lon, label) => {
    setLoadingWeather(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&forecast_days=1&timezone=auto`
      );
      const data = await res.json();
      if (data?.current) {
        const temp = Math.round(data.current.temperature_2m);
        const apparent = Math.round(data.current.apparent_temperature);
        const wind = data.current.wind_speed_10m;
        const code = data.current.weather_code;

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

        const info = interpretWeather(code, temp, wind, hourlyForecast);

        setLiveWeather({
          locationName: label,
          temp,
          apparent,
          wind,
          ...info,
        });
      }
    } catch {
      setError('Hava məlumatı alınarkən xəta baş verdi.');
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  const detectGpsLocation = useCallback(() => {
    setDemoPresetId('live');
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationSource('GPS dəstəklənmir (şəhər seçildi)');
      const fallback = AZERBAIJAN_CITIES[0];
      fetchWeatherByCoords(fallback.lat, fallback.lon, fallback.name);
      return;
    }

    setLocationSource('GPS ilə məkan tapılır...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearestName = findNearestCity(latitude, longitude);
        const matchedCity = AZERBAIJAN_CITIES.find((c) => c.name === nearestName);
        if (matchedCity) setSelectedCity(matchedCity.name);
        setLocationSource('GPS ilə tapıldı');
        fetchWeatherByCoords(latitude, longitude, nearestName);
      },
      () => {
        setLocationSource('GPS icazəsi verilmədi (siyahıdan seçin)');
        const fallback =
          AZERBAIJAN_CITIES.find((c) => c.name === selectedCity) || AZERBAIJAN_CITIES[0];
        fetchWeatherByCoords(fallback.lat, fallback.lon, fallback.name);
      },
      { timeout: 8000 }
    );
  }, [fetchWeatherByCoords, selectedCity]);

  const handleCitySelect = (cityName) => {
    setDemoPresetId('live');
    setSelectedCity(cityName);
    const cityObj = AZERBAIJAN_CITIES.find((c) => c.name === cityName);
    if (cityObj) {
      setLocationSource('Siyahıdan seçildi');
      fetchWeatherByCoords(cityObj.lat, cityObj.lon, cityObj.name);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data?.session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchItems(currentUser.id);
        detectGpsLocation();
        try {
          const raw = localStorage.getItem(`geyin_saved_${currentUser.id}`);
          if (raw) setSavedOutfits(JSON.parse(raw));
        } catch {
          // ignore
        }
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchItems(currentUser.id);
        detectGpsLocation();
      } else {
        setItems([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [detectGpsLocation]);

  useEffect(() => {
    if (activeWeather && items.length > 0) {
      setRecommendedOutfit((prev) =>
        buildSmartOutfit(items, activeWeather, outfitStyleFilter, lockedSlots, prev)
      );
      setOutfitAnimKey((k) => k + 1);
    } else {
      setRecommendedOutfit(null);
    }
  }, [activeWeather, items, outfitStyleFilter]);

  const handleRegenerateOutfit = () => {
    if (!activeWeather || items.length === 0) return;
    setRecommendedOutfit((prev) =>
      buildSmartOutfit(items, activeWeather, outfitStyleFilter, lockedSlots, prev)
    );
    setOutfitAnimKey((k) => k + 1);
  };

  const toggleLockSlot = (slotKey) => {
    setLockedSlots((prev) => ({
      ...prev,
      [slotKey]: !prev[slotKey],
    }));
  };

  const regenerateSingleSlot = (slotKey) => {
    if (!activeWeather || !recommendedOutfit) return;
    const tempLocks = {
      top: true,
      bottom: true,
      outerwear: true,
      shoes: true,
      accessory: true,
      [slotKey]: false,
    };
    const excludeMap = recommendedOutfit[slotKey]?.id
      ? { [slotKey]: recommendedOutfit[slotKey].id }
      : {};
    const updated = buildSmartOutfit(
      items,
      activeWeather,
      outfitStyleFilter,
      tempLocks,
      recommendedOutfit,
      excludeMap
    );
    setRecommendedOutfit(updated);
    setOutfitAnimKey((k) => k + 1);
  };

  const handleSaveCurrentOutfit = () => {
    if (!user || !recommendedOutfit || !activeWeather) return;
    const pieces = [
      recommendedOutfit.top,
      recommendedOutfit.bottom,
      recommendedOutfit.outerwear,
      recommendedOutfit.shoes,
      recommendedOutfit.accessory,
    ].filter(Boolean);

    if (pieces.length === 0) return;

    const newSaved = {
      id: Date.now(),
      createdAt: new Date().toLocaleDateString('az-AZ'),
      city: activeWeather.locationName,
      temp: activeWeather.temp,
      condition: activeWeather.conditionText,
      explanation: recommendedOutfit.explanation || '',
      outfitData: {
        top: recommendedOutfit.top,
        bottom: recommendedOutfit.bottom,
        outerwear: recommendedOutfit.outerwear,
        shoes: recommendedOutfit.shoes,
        accessory: recommendedOutfit.accessory,
        explanation: recommendedOutfit.explanation || '',
      },
      pieces,
    };

    const updatedList = [newSaved, ...savedOutfits].slice(0, 12);
    setSavedOutfits(updatedList);
    try {
      localStorage.setItem(`geyin_saved_${user.id}`, JSON.stringify(updatedList));
    } catch {
      // ignore
    }
    setMessage('Kombin "Sevimli kombinlərim" bölməsinə əlavə olundu!');
  };

  const handleLoadSavedOutfit = (saved) => {
    if (!saved?.outfitData) return;
    setRecommendedOutfit(saved.outfitData);
    setOutfitAnimKey((k) => k + 1);
    setMessage('Sevimli kombin əsas sahəyə yükləndi.');
  };

  const handleDeleteSavedOutfit = (savedId) => {
    if (!user) return;
    const updatedList = savedOutfits.filter((o) => o.id !== savedId);
    setSavedOutfits(updatedList);
    try {
      localStorage.setItem(`geyin_saved_${user.id}`, JSON.stringify(updatedList));
    } catch {
      // ignore
    }
  };

  const fetchItems = async (userId) => {
    setLoadingItems(true);
    const { data, error: fetchError } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setItems(data || []);
    }
    setLoadingItems(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      if (isRegister) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage('Qeydiyyat uğurludur! İndi daxil ola bilərsən.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message || 'Xəta baş verdi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMessage('');
    setError('');
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setMessage('');

    if (!imageFile) {
      setError('Zəhmət olmasa paltar şəkli seç.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('clothes')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('clothes')
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData?.publicUrl;

      const { error: insertError } = await supabase.from('wardrobe_items').insert([
        {
          user_id: user.id,
          image_url: imageUrl,
          category,
          sub_category: subCategory.trim() || null,
          color: color.trim() || null,
          warmth_level: Number(warmthLevel),
          waterproof,
          windproof,
          style,
        },
      ]);

      if (insertError) throw insertError;

      setMessage('Paltar qarderoba əlavə olundu!');
      setImageFile(null);
      setSubCategory('');
      setColor('');
      setWarmthLevel(3);
      setWaterproof(false);
      setWindproof(false);
      setStyle('gundelik');

      const fileInput = document.getElementById('clothes-file-input');
      if (fileInput) fileInput.value = '';

      await fetchItems(user.id);
    } catch (err) {
      setError(err.message || 'Şəkil yüklənərkən və ya saxlanılarkən xəta baş verdi.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!user) return;
    setError('');
    try {
      const urlParts = item.image_url.split('/clothes/');
      if (urlParts.length > 1) {
        const storagePath = urlParts[1].split('?')[0];
        await supabase.storage.from('clothes').remove([storagePath]);
      }

      const { error: deleteError } = await supabase
        .from('wardrobe_items')
        .delete()
        .eq('id', item.id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err.message || 'Silinmə zamanı xəta baş verdi.');
    }
  };

  // Dynamic theme tokens
  const t = {
    page: isDark ? 'bg-zinc-950 text-white' : 'bg-stone-100 text-zinc-900',
    card: isDark
      ? 'bg-zinc-900 border-zinc-800'
      : 'bg-white border-stone-200 shadow-sm',
    hero: isDark
      ? 'bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800/80 border-zinc-800'
      : 'bg-gradient-to-br from-white via-stone-50 to-amber-50/60 border-stone-200 shadow-sm',
    surface: isDark
      ? 'bg-zinc-950 border-zinc-800'
      : 'bg-stone-50 border-stone-200',
    muted: isDark ? 'text-zinc-400' : 'text-zinc-600',
    subtext: isDark ? 'text-zinc-300' : 'text-zinc-700',
    border: isDark ? 'border-zinc-800' : 'border-stone-200',
    pillIdle: isDark
      ? 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
      : 'bg-white text-zinc-600 hover:text-zinc-900 border-stone-200',
    pillActive: isDark
      ? 'bg-white text-zinc-950'
      : 'bg-zinc-900 text-white',
  };

  const renderThemeSwitcher = () => (
    <div
      className={`inline-flex items-center rounded-xl p-1 border text-xs ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-stone-200/70 border-stone-300'
      }`}
    >
      {[
        { id: 'auto', label: 'Avto' },
        { id: 'light', label: 'Açıq' },
        { id: 'dark', label: 'Qaranlıq' },
      ].map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => handleSelectTheme(m.id)}
          className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer active:scale-95 ${
            themeMode === m.id
              ? isDark
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'bg-white text-zinc-900 shadow-xs'
              : t.muted
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <main className={`min-h-screen ${t.page} flex items-center justify-center transition-colors duration-300`}>
        <p className={`${t.muted} animate-pulse`}>Yüklənir...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={`min-h-screen ${t.page} flex items-center justify-center p-6 transition-colors duration-300`}>
        <div className={`w-full max-w-md rounded-2xl ${t.card} border p-6 space-y-6 animate-outfit-in`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Geyin</h1>
              <p className={`text-sm ${t.muted} mt-1`}>
                {isRegister
                  ? 'Yeni hesab yarat və qarderobunu qur.'
                  : 'Hava şəraitinə uyğun kombinlər üçün hesabına daxil ol.'}
              </p>
            </div>
            {renderThemeSwitcher()}
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className={`block text-sm ${t.subtext} mb-1.5`}>E-poçt</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nümunə@mail.com"
                className={`w-full rounded-xl ${t.surface} border px-3.5 py-2.5 text-sm focus:outline-none`}
              />
            </div>

            <div>
              <label className={`block text-sm ${t.subtext} mb-1.5`}>Şifrə</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ən az 6 simvol"
                className={`w-full rounded-xl ${t.surface} border px-3.5 py-2.5 text-sm focus:outline-none`}
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-500">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-500">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full rounded-xl ${t.pillActive} disabled:opacity-50 font-semibold py-2.5 text-sm transition cursor-pointer active:scale-[0.98]`}
            >
              {submitting
                ? 'Gözləyin...'
                : isRegister
                ? 'Qeydiyyatdan keç'
                : 'Daxil ol'}
            </button>
          </form>

          <div className={`pt-2 border-t ${t.border} text-center`}>
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setMessage('');
              }}
              className={`text-xs ${t.muted} transition cursor-pointer`}
            >
              {isRegister
                ? 'Artıq hesabın var? Daxil ol'
                : 'Hesabın yoxdur? Yeni hesab yarat'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const filteredItems =
    selectedCategoryFilter === 'Hamısı'
      ? items
      : items.filter((item) => item.category === selectedCategoryFilter);

  const outfitSlots = recommendedOutfit
    ? [
        { key: 'top', label: 'Üst geyim', item: recommendedOutfit.top },
        { key: 'bottom', label: 'Alt geyim', item: recommendedOutfit.bottom },
        ...(recommendedOutfit.outerwear || lockedSlots.outerwear
          ? [{ key: 'outerwear', label: 'Üst örtük', item: recommendedOutfit.outerwear }]
          : []),
        { key: 'shoes', label: 'Ayaqqabı', item: recommendedOutfit.shoes },
        ...(recommendedOutfit.accessory || lockedSlots.accessory
          ? [{ key: 'accessory', label: 'Aksesuar', item: recommendedOutfit.accessory }]
          : []),
      ]
    : [];

  return (
    <main className={`min-h-screen ${t.page} p-4 md:p-8 transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top bar */}
        <header className={`flex flex-wrap items-center justify-between gap-4 border-b ${t.border} pb-5`}>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Geyin</h1>
            <p className={`text-xs ${t.muted} mt-1`}>{user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {renderThemeSwitcher()}
            <button
              onClick={handleLogout}
              className={`rounded-xl ${t.card} border px-4 py-2 text-xs font-medium transition cursor-pointer active:scale-95`}
            >
              Çıxış et
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-sm text-red-500 animate-outfit-in">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-sm text-emerald-500 animate-outfit-in">
            {message}
          </div>
        )}

        {/* Weather & Smart Outfit Section */}
        <section className={`rounded-2xl ${t.hero} border p-6 space-y-6 transition-all duration-300`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className={`text-[11px] uppercase tracking-wider ${t.muted}`}>
                Canlı Hava & Ağıllı Kombin • {locationSource}
              </span>
              <h2 className="text-xl font-bold mt-1">
                {loadingWeather && demoPresetId === 'live'
                  ? 'Hava yoxlanılır...'
                  : activeWeather
                  ? `${activeWeather.locationName}: ${activeWeather.temp}°C (${activeWeather.conditionText})`
                  : 'Məkan seçin'}
              </h2>
              {activeWeather && (
                <p className={`text-xs ${t.muted} mt-1`}>
                  Hiss olunan: {activeWeather.apparent}°C • Günlük: {activeWeather.minTemp}°C /{' '}
                  {activeWeather.maxTemp}°C • Külək: {Math.round(activeWeather.wind)} km/saat
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={detectGpsLocation}
                className={`rounded-xl ${t.pillActive} px-3.5 py-2 text-xs font-semibold transition cursor-pointer active:scale-95`}
              >
                GPS ilə tap
              </button>

              <select
                value={selectedCity}
                onChange={(e) => handleCitySelect(e.target.value)}
                className={`rounded-xl ${t.surface} border px-3 py-2 text-xs focus:outline-none`}
              >
                {AZERBAIJAN_CITIES.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Demo Day Weather Simulator bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className={`text-[11px] ${t.muted} mr-1`}>Hava rejimi (Demo test):</span>
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setDemoPresetId(preset.id)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition cursor-pointer active:scale-95 ${
                  demoPresetId === preset.id
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                    : `${t.pillIdle} border`
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* General advice & Evening alert */}
          {activeWeather && (
            <div className="space-y-2.5">
              <div className={`rounded-xl ${t.surface} border p-4`}>
                <p className={`text-xs font-semibold ${t.subtext} mb-1`}>
                  Ümumi geyim məsləhəti:
                </p>
                <p className="text-sm leading-relaxed">{activeWeather.generalAdvice}</p>
              </div>

              {activeWeather.eveningAlert && (
                <div className="rounded-xl bg-amber-500/15 border border-amber-500/35 px-4 py-3 text-xs text-amber-400">
                  {activeWeather.eveningAlert}
                </div>
              )}
            </div>
          )}

          {/* Smart Wardrobe Outfit */}
          <div className={`space-y-4 pt-2 border-t ${t.border}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">Qarderobundan bugünkü kombin</h3>
                {recommendedOutfit?.explanation ? (
                  <p className="text-xs text-emerald-500 mt-0.5">
                    Niyə bu kombin: {recommendedOutfit.explanation}
                  </p>
                ) : (
                  <p className={`text-xs ${t.muted}`}>
                    Hava temperaturu və yağış/külək göstəricilərinə uyğun seçildi
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={outfitStyleFilter}
                  onChange={(e) => setOutfitStyleFilter(e.target.value)}
                  className={`rounded-xl ${t.surface} border px-3 py-2 text-xs focus:outline-none`}
                >
                  <option value="all">Bütün stillər</option>
                  {STYLES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={!activeWeather || items.length === 0}
                  onClick={handleRegenerateOutfit}
                  className={`rounded-xl ${t.card} disabled:opacity-40 border px-3.5 py-2 text-xs font-medium transition cursor-pointer active:scale-95`}
                >
                  Başqa kombin yarat
                </button>

                <button
                  type="button"
                  disabled={!recommendedOutfit}
                  onClick={handleSaveCurrentOutfit}
                  className="rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-40 border border-emerald-500/40 px-3.5 py-2 text-xs font-medium text-emerald-400 transition cursor-pointer active:scale-95"
                >
                  Yadda saxla
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className={`rounded-xl ${t.surface} border p-5 text-center text-xs ${t.muted}`}>
                Qarderobunda hələ paltar yoxdur. Aşağıdan üst geyim, alt geyim və ayaqqabı əlavə et ki, avtomatik kombin quraq!
              </div>
            ) : (
              <div
                key={outfitAnimKey}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 animate-outfit-in"
              >
                {outfitSlots.map((slot) => {
                  const isLocked = !!lockedSlots[slot.key];
                  return (
                    <div
                      key={slot.key}
                      className={`rounded-xl ${t.surface} border overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 ${
                        isLocked ? 'border-amber-400/80 ring-1 ring-amber-400/30' : ''
                      }`}
                    >
                      <div className={`px-3 py-2 border-b ${t.border} flex items-center justify-between gap-1`}>
                        <span className={`text-[11px] font-semibold ${t.subtext} truncate`}>
                          {slot.label}
                        </span>
                        {slot.item && (
                          <button
                            type="button"
                            onClick={() => toggleLockSlot(slot.key)}
                            className={`text-[10px] px-1.5 py-0.5 rounded transition cursor-pointer active:scale-95 ${
                              isLocked
                                ? 'bg-amber-400/20 text-amber-400 font-semibold'
                                : `${t.muted}`
                            }`}
                          >
                            {isLocked ? 'Kilidli' : 'Kilidlə'}
                          </button>
                        )}
                      </div>

                      {slot.item ? (
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <img
                              src={slot.item.image_url}
                              alt={slot.item.sub_category || slot.label}
                              className="w-full h-36 object-cover"
                            />
                            <div className="p-2.5 space-y-1">
                              <p className="text-xs font-medium truncate">
                                {slot.item.sub_category || slot.item.category}
                              </p>
                              <p className={`text-[11px] ${t.muted}`}>
                                {slot.item.color ? `${slot.item.color} • ` : ''}
                                İstilik {slot.item.warmth_level}/5
                              </p>
                            </div>
                          </div>

                          {!isLocked && (
                            <div className="px-2.5 pb-2.5">
                              <button
                                type="button"
                                onClick={() => regenerateSingleSlot(slot.key)}
                                className={`w-full rounded-lg ${t.card} border py-1 text-[11px] ${t.subtext} transition cursor-pointer active:scale-95`}
                              >
                                Dəyiş
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`flex-1 flex items-center justify-center p-4 text-center text-[11px] ${t.muted} min-h-[160px]`}>
                          Qarderobda {slot.label.toLowerCase()} tapılmadı
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Wardrobe Insights Panel */}
        {wardrobeInsights && (
          <section className={`rounded-2xl ${t.card} border p-5 flex flex-wrap items-center justify-between gap-4 animate-outfit-in`}>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className={`text-[11px] ${t.muted}`}>Ümumi parça</p>
                <p className="text-lg font-bold">{wardrobeInsights.total} ədəd</p>
              </div>
              <div>
                <p className={`text-[11px] ${t.muted}`}>Orta istilik</p>
                <p className="text-lg font-bold">{wardrobeInsights.avgWarmth} / 5</p>
              </div>
              <div>
                <p className={`text-[11px] ${t.muted}`}>Suya davamlı</p>
                <p className="text-lg font-bold">{wardrobeInsights.waterproofCount} ədəd</p>
              </div>
            </div>
            <p className={`text-xs ${t.subtext} max-w-md`}>{wardrobeInsights.suggestion}</p>
          </section>
        )}

        {/* Saved Outfits */}
        {savedOutfits.length > 0 && (
          <section className={`rounded-2xl ${t.card} border p-6 space-y-4 animate-outfit-in`}>
            <h2 className="text-lg font-semibold">Sevimli kombinlərim ({savedOutfits.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedOutfits.map((saved) => (
                <div
                  key={saved.id}
                  className={`rounded-xl ${t.surface} border p-4 space-y-3 transition hover:-translate-y-0.5`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs ${t.subtext} font-medium`}>
                      {saved.city} • {saved.temp}°C ({saved.condition}) — {saved.createdAt}
                    </p>
                    <div className="flex items-center gap-2">
                      {saved.outfitData && (
                        <button
                          type="button"
                          onClick={() => handleLoadSavedOutfit(saved)}
                          className="text-xs text-sky-400 hover:underline font-medium transition cursor-pointer"
                        >
                          Yüklə
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteSavedOutfit(saved.id)}
                        className={`text-xs ${t.muted} hover:text-red-400 transition cursor-pointer`}
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {saved.pieces.map((p, idx) => (
                      <img
                        key={`${saved.id}-${idx}`}
                        src={p.image_url}
                        alt={p.sub_category || p.category}
                        className={`w-16 h-20 rounded-lg object-cover border ${t.border} shrink-0`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Add item form */}
        <section className={`rounded-2xl ${t.card} border p-6`}>
          <h2 className="text-lg font-semibold mb-4">Yeni paltar əlavə et</h2>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2.5">
              <label className={`block text-xs ${t.muted}`}>Paltar şəkli *</label>
              <input
                id="clothes-file-input"
                type="file"
                accept="image/*"
                required
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className={`w-full rounded-xl ${t.surface} border px-3.5 py-2 text-sm`}
              />
              {imagePreviewUrl && (
                <div className="flex items-center gap-3 pt-1 animate-outfit-in">
                  <img
                    src={imagePreviewUrl}
                    alt="Önizləmə"
                    className={`w-16 h-20 rounded-xl object-cover border ${t.border}`}
                  />
                  <span className={`text-xs ${t.muted}`}>Seçilmiş şəkil hazırdır</span>
                </div>
              )}
            </div>

            <div>
              <label className={`block text-xs ${t.muted} mb-1.5`}>Kateqoriya *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full rounded-xl ${t.surface} border px-3.5 py-2.5 text-sm focus:outline-none`}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs ${t.muted} mb-1.5`}>
                Alt kateqoriya (məs: Hudi, Cins)
              </label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="Məsələn: Oversize hudi"
                className={`w-full rounded-xl ${t.surface} border px-3.5 py-2.5 text-sm focus:outline-none`}
              />
            </div>

            <div>
              <label className={`block text-xs ${t.muted} mb-1.5`}>Rəng</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Məsələn: Qara, Bej, Göy"
                className={`w-full rounded-xl ${t.surface} border px-3.5 py-2.5 text-sm focus:outline-none`}
              />
            </div>

            <div>
              <label className={`block text-xs ${t.muted} mb-1.5`}>Stil</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className={`w-full rounded-xl ${t.surface} border px-3.5 py-2.5 text-sm focus:outline-none`}
              >
                {STYLES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <div className={`flex items-center justify-between text-xs ${t.muted} mb-1.5`}>
                <span>İstilik səviyyəsi (1 = çox nazik, 5 = çox qalın)</span>
                <span className="font-semibold">{warmthLevel} / 5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={warmthLevel}
                onChange={(e) => setWarmthLevel(e.target.value)}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-6 pt-1">
              <label className={`flex items-center gap-2 text-sm ${t.subtext} cursor-pointer`}>
                <input
                  type="checkbox"
                  checked={waterproof}
                  onChange={(e) => setWaterproof(e.target.checked)}
                  className="rounded"
                />
                Suya davamlı (yağış üçün)
              </label>

              <label className={`flex items-center gap-2 text-sm ${t.subtext} cursor-pointer`}>
                <input
                  type="checkbox"
                  checked={windproof}
                  onChange={(e) => setWindproof(e.target.checked)}
                  className="rounded"
                />
                Küləyə davamlı
              </label>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={uploading}
                className={`w-full md:w-auto rounded-xl ${t.pillActive} disabled:opacity-50 font-semibold px-6 py-2.5 text-sm transition cursor-pointer active:scale-[0.98]`}
              >
                {uploading ? 'Yüklənir...' : 'Qarderoba əlavə et'}
              </button>
            </div>
          </form>
        </section>

        {/* Wardrobe list */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Əşyalarım ({filteredItems.length})</h2>
            <div className="flex flex-wrap gap-2">
              {['Hamısı', ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition cursor-pointer active:scale-95 ${
                    selectedCategoryFilter === cat ? t.pillActive : `${t.pillIdle} border`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loadingItems ? (
            <p className={`text-sm ${t.muted}`}>Qarderob yüklənir...</p>
          ) : filteredItems.length === 0 ? (
            <div className={`rounded-2xl ${t.card} border p-8 text-center text-sm ${t.muted}`}>
              Bu kateqoriyada hələ paltar yoxdur. Yuxarıdakı formadan ilk paltarını əlavə et!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl ${t.card} border overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1`}
                >
                  <div>
                    <img
                      src={item.image_url}
                      alt={item.sub_category || item.category}
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-3.5 space-y-1.5">
                      <p className="text-xs font-semibold">{item.category}</p>
                      {item.sub_category && (
                        <p className={`text-xs ${t.subtext}`}>{item.sub_category}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.color && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-md ${t.surface} border ${t.subtext}`}>
                            {item.color}
                          </span>
                        )}
                        <span className={`text-[11px] px-2 py-0.5 rounded-md ${t.surface} border ${t.subtext}`}>
                          İstilik: {item.warmth_level}/5
                        </span>
                        {item.waterproof && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400">
                            Suya davamlı
                          </span>
                        )}
                        {item.windproof && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-400">
                            Küləyə davamlı
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-3.5 pb-3">
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className={`w-full rounded-lg ${t.surface} hover:bg-red-500/15 border hover:border-red-500/30 py-1.5 text-xs ${t.muted} hover:text-red-400 transition cursor-pointer active:scale-95`}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}