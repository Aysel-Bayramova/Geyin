'use client';

import { useEffect, useState, useCallback } from 'react';
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

function interpretWeather(code, temp, windSpeed) {
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

  return {
    conditionText,
    isRainy: isRainy || isSnowy,
    isWindy,
    idealWarmth,
    needOuterwear: temp <= 17 || isRainy || isSnowy || isWindy,
    generalAdvice: tips.join(' '),
  };
}

function buildSmartOutfit(items, weatherInfo, preferredStyle = 'all') {
  if (!items || items.length === 0 || !weatherInfo) return null;

  const pickBestForCategory = (catName) => {
    const candidates = items.filter((item) => item.category === catName);
    if (candidates.length === 0) return null;

    const scored = candidates.map((item) => {
      let score = 0;

      // İstilik uyğunluğu (maks 50 bal)
      const diff = Math.abs((item.warmth_level || 3) - weatherInfo.idealWarmth);
      score += Math.max(0, 50 - diff * 15);

      // Yağış və külək bonusu
      if (weatherInfo.isRainy && item.waterproof) score += 25;
      if (weatherInfo.isWindy && item.windproof) score += 20;

      // Stil uyğunluğu
      if (preferredStyle !== 'all' && item.style === preferredStyle) {
        score += 20;
      }

      // Alternativ kombinasiyalar üçün kiçik təsadüfi variasiya
      score += Math.random() * 18;

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].item;
  };

  return {
    top: pickBestForCategory('Üst geyim'),
    bottom: pickBestForCategory('Alt geyim'),
    outerwear: weatherInfo.needOuterwear
      ? pickBestForCategory('Üst örtük (Gödəkçə/Palto)')
      : null,
    shoes: pickBestForCategory('Ayaqqabı'),
    accessory: pickBestForCategory('Aksesuar'),
  };
}

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegister, setIsRegister] = useState(false);

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
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [outfitStyleFilter, setOutfitStyleFilter] = useState('all');
  const [recommendedOutfit, setRecommendedOutfit] = useState(null);

  const fetchWeatherByCoords = useCallback(async (lat, lon, label) => {
    setLoadingWeather(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      );
      const data = await res.json();
      if (data?.current) {
        const temp = Math.round(data.current.temperature_2m);
        const apparent = Math.round(data.current.apparent_temperature);
        const wind = data.current.wind_speed_10m;
        const code = data.current.weather_code;
        const info = interpretWeather(code, temp, wind);

        setWeather({
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
    if (weather && items.length > 0) {
      setRecommendedOutfit(buildSmartOutfit(items, weather, outfitStyleFilter));
    } else {
      setRecommendedOutfit(null);
    }
  }, [weather, items, outfitStyleFilter]);

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

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Yüklənir...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Geyin</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {isRegister
                ? 'Yeni hesab yarat və qarderobunu qur.'
                : 'Hava şəraitinə uyğun kombinlər üçün hesabına daxil ol.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">E-poçt</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nümunə@mail.com"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Şifrə</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ən az 6 simvol"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-400">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 font-semibold py-2.5 text-sm transition cursor-pointer"
            >
              {submitting
                ? 'Gözləyin...'
                : isRegister
                ? 'Qeydiyyatdan keç'
                : 'Daxil ol'}
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-800 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setMessage('');
              }}
              className="text-xs text-zinc-400 hover:text-white transition cursor-pointer"
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
        { label: 'Üst geyim', item: recommendedOutfit.top },
        { label: 'Alt geyim', item: recommendedOutfit.bottom },
        ...(recommendedOutfit.outerwear
          ? [{ label: 'Üst örtük', item: recommendedOutfit.outerwear }]
          : []),
        { label: 'Ayaqqabı', item: recommendedOutfit.shoes },
        ...(recommendedOutfit.accessory
          ? [{ label: 'Aksesuar', item: recommendedOutfit.accessory }]
          : []),
      ]
    : [];

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Geyin</h1>
            <p className="text-xs text-zinc-400 mt-1">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 transition cursor-pointer"
          >
            Çıxış et
          </button>
        </header>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-sm text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-sm text-emerald-400">
            {message}
          </div>
        )}

        {/* Weather & Smart Outfit Section */}
        <section className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800/70 border border-zinc-800 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-400">
                Canlı Hava & Ağıllı Kombin • {locationSource}
              </span>
              <h2 className="text-xl font-bold mt-1">
                {loadingWeather
                  ? 'Hava yoxlanılır...'
                  : weather
                  ? `${weather.locationName}: ${weather.temp}°C (${weather.conditionText})`
                  : 'Məkan seçin'}
              </h2>
              {weather && (
                <p className="text-xs text-zinc-400 mt-1">
                  Hiss olunan: {weather.apparent}°C • Külək: {Math.round(weather.wind)} km/saat
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={detectGpsLocation}
                className="rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 px-3.5 py-2 text-xs font-semibold transition cursor-pointer"
              >
                GPS ilə tap
              </button>

              <select
                value={selectedCity}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
              >
                {AZERBAIJAN_CITIES.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* General advice box */}
          {weather && (
            <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-4">
              <p className="text-xs font-semibold text-zinc-300 mb-1">
                Ümumi geyim məsləhəti:
              </p>
              <p className="text-sm text-zinc-200 leading-relaxed">
                {weather.generalAdvice}
              </p>
            </div>
          )}

          {/* Smart Wardrobe Outfit */}
          <div className="space-y-4 pt-2 border-t border-zinc-800/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">
                  Qarderobundan bugünkü kombin
                </h3>
                <p className="text-xs text-zinc-400">
                  Hava temperaturu və yağış/külək göstəricilərinə uyğun seçildi
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={outfitStyleFilter}
                  onChange={(e) => setOutfitStyleFilter(e.target.value)}
                  className="rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none"
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
                  disabled={!weather || items.length === 0}
                  onClick={() =>
                    setRecommendedOutfit(buildSmartOutfit(items, weather, outfitStyleFilter))
                  }
                  className="rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 border border-zinc-700 px-3.5 py-2 text-xs font-medium text-white transition cursor-pointer"
                >
                  Başqa kombin yarat
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="rounded-xl bg-zinc-950/60 border border-zinc-800 p-5 text-center text-xs text-zinc-400">
                Qarderobunda hələ paltar yoxdur. Aşağıdan üst geyim, alt geyim və ayaqqabı əlavə et ki, avtomatik kombin quraq!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {outfitSlots.map((slot) => (
                  <div
                    key={slot.label}
                    className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex flex-col"
                  >
                    <div className="px-3 py-2 border-b border-zinc-800/80 text-[11px] font-semibold text-zinc-400">
                      {slot.label}
                    </div>
                    {slot.item ? (
                      <div className="flex-1 flex flex-col">
                        <img
                          src={slot.item.image_url}
                          alt={slot.item.sub_category || slot.label}
                          className="w-full h-36 object-cover bg-zinc-900"
                        />
                        <div className="p-2.5 space-y-1">
                          <p className="text-xs font-medium text-white truncate">
                            {slot.item.sub_category || slot.item.category}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {slot.item.color ? `${slot.item.color} • ` : ''}
                            İstilik {slot.item.warmth_level}/5
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center p-4 text-center text-[11px] text-zinc-500 min-h-[160px]">
                        Qarderobda {slot.label.toLowerCase()} tapılmadı
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Add item form */}
        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Yeni paltar əlavə et</h2>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-zinc-400 mb-1.5">Paltar şəkli *</label>
              <input
                id="clothes-file-input"
                type="file"
                accept="image/*"
                required
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-zinc-700"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Kateqoriya *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Alt kateqoriya (məs: Hudi, Cins)</label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="Məsələn: Oversize hudi"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Rəng</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Məsələn: Qara, Bej, Göy"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Stil</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500"
              >
                {STYLES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                <span>İstilik səviyyəsi (1 = çox nazik, 5 = çox qalın)</span>
                <span className="font-semibold text-white">{warmthLevel} / 5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={warmthLevel}
                onChange={(e) => setWarmthLevel(e.target.value)}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={waterproof}
                  onChange={(e) => setWaterproof(e.target.checked)}
                  className="rounded accent-white"
                />
                Suya davamlı (yağış üçün)
              </label>

              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={windproof}
                  onChange={(e) => setWindproof(e.target.checked)}
                  className="rounded accent-white"
                />
                Küləyə davamlı
              </label>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="w-full md:w-auto rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 font-semibold px-6 py-2.5 text-sm transition cursor-pointer"
              >
                {uploading ? 'Yüklənir...' : 'Qarderoba əlavə et'}
              </button>
            </div>
          </form>
        </section>

        {/* Wardrobe list */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              Əşyalarım ({filteredItems.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {['Hamısı', ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                    selectedCategoryFilter === cat
                      ? 'bg-white text-zinc-950'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loadingItems ? (
            <p className="text-sm text-zinc-400">Qarderob yüklənir...</p>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-8 text-center text-sm text-zinc-400">
              Bu kateqoriyada hələ paltar yoxdur. Yuxarıdakı formadan ilk paltarını əlavə et!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <img
                      src={item.image_url}
                      alt={item.sub_category || item.category}
                      className="w-full h-44 object-cover bg-zinc-950"
                    />
                    <div className="p-3.5 space-y-1.5">
                      <p className="text-xs font-semibold text-white">{item.category}</p>
                      {item.sub_category && (
                        <p className="text-xs text-zinc-300">{item.sub_category}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.color && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                            {item.color}
                          </span>
                        )}
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                          İstilik: {item.warmth_level}/5
                        </span>
                        {item.waterproof && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300">
                            Suya davamlı
                          </span>
                        )}
                        {item.windproof && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300">
                            Küləyə davamlı
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-3.5 pb-3">
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="w-full rounded-lg bg-zinc-950 hover:bg-red-500/15 border border-zinc-800 hover:border-red-500/30 py-1.5 text-xs text-zinc-400 hover:text-red-400 transition cursor-pointer"
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