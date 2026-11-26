'use client';

import { useEffect, useState, useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES, UI_TEXT, getText } from '@/lib/i18n';
import { WORLD_CITIES, findNearestCity, getCityDisplayName } from '@/lib/cities';
import {
  fetchCurrentWeather,
  fetchWeeklyWeather,
  resolveActiveWeather,
  searchCityByName,
} from '@/lib/weather';
import { buildSmartOutfit, buildSuitcasePlan, computeWardrobeInsights } from '@/lib/outfit';
import TopControls from '@/components/TopControls';
import AuthForm from '@/components/AuthForm';
import WeatherPanel from '@/components/WeatherPanel';
import TravelPanel from '@/components/TravelPanel';
import WardrobeInsights from '@/components/WardrobeInsights';
import SavedOutfits from '@/components/SavedOutfits';
import WardrobeForm from '@/components/WardrobeForm';
import WardrobeList from '@/components/WardrobeList';

const PREFS_EVENT = 'geyin-prefs-change';

function subscribePrefs(callback) {
  window.addEventListener('storage', callback);
  window.addEventListener(PREFS_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(PREFS_EVENT, callback);
  };
}

function getThemeSnapshot() {
  try {
    const saved = localStorage.getItem('geyin_theme_mode');
    if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
  } catch {
    // ignore
  }
  return 'auto';
}

function getLangSnapshot() {
  try {
    const saved = localStorage.getItem('geyin_lang');
    if (saved === 'az' || saved === 'en' || saved === 'ru') return saved;
  } catch {
    // ignore
  }
  return 'az';
}

function subscribeSystemDark(callback) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getSystemDarkSnapshot() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const getThemeServerSnapshot = () => 'auto';
const getLangServerSnapshot = () => 'az';
const getSystemDarkServerSnapshot = () => false;

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegister, setIsRegister] = useState(false);

  // Active tab: 'today' | 'travel'
  const [activeTab, setActiveTab] = useState('today');

  // Language & theme synced with localStorage and system preference
  const lang = useSyncExternalStore(subscribePrefs, getLangSnapshot, getLangServerSnapshot);
  const themeMode = useSyncExternalStore(subscribePrefs, getThemeSnapshot, getThemeServerSnapshot);
  const systemPrefersDark = useSyncExternalStore(
    subscribeSystemDark,
    getSystemDarkSnapshot,
    getSystemDarkServerSnapshot
  );
  const tx = getText(lang);
  const isDark = themeMode === 'dark' || (themeMode === 'auto' && systemPrefersDark);

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
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [subCategory, setSubCategory] = useState('');
  const [color, setColor] = useState('');
  const [warmthLevel, setWarmthLevel] = useState(3);
  const [waterproof, setWaterproof] = useState(false);
  const [windproof, setWindproof] = useState(false);
  const [style, setStyle] = useState('gundelik');
  const fileInputRef = useRef(null);

  // Location & Weather state
  const [locationMode, setLocationMode] = useState('gps');
  const [selectedCity, setSelectedCity] = useState('Bakı');
  const selectedCityRef = useRef(selectedCity);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [searchingCity, setSearchingCity] = useState(false);
  const [locationSource, setLocationSource] = useState(UI_TEXT.az.gpsFinding);
  const [liveRawWeather, setLiveRawWeather] = useState(null);
  const [demoPresetId, setDemoPresetId] = useState('live');
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [outfitStyleFilter, setOutfitStyleFilter] = useState('all');
  const [recommendedOutfit, setRecommendedOutfit] = useState(null);
  const [outfitAnimKey, setOutfitAnimKey] = useState(0);
  const [lockedSlots, setLockedSlots] = useState({});
  const lockedSlotsRef = useRef(lockedSlots);
  const [savedOutfits, setSavedOutfits] = useState([]);

  // Travel / 1-week forecast & suitcase state
  const [travelCityInput, setTravelCityInput] = useState('');
  const [travelDaysInput, setTravelDaysInput] = useState(4);
  const [travelNoteInput, setTravelNoteInput] = useState('');
  const [travelCities, setTravelCities] = useState([]);
  const [activeTravelPlan, setActiveTravelPlan] = useState(null);
  const [weeklyResult, setWeeklyResult] = useState({ key: null, days: [] });
  const [savingTravelCity, setSavingTravelCity] = useState(false);

  useEffect(() => {
    selectedCityRef.current = selectedCity;
  }, [selectedCity]);

  useEffect(() => {
    lockedSlotsRef.current = lockedSlots;
  }, [lockedSlots]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const savedTravelList = localStorage.getItem('geyin_travel_cities');
        if (savedTravelList) {
          const parsed = JSON.parse(savedTravelList);
          setTravelCities(parsed);
          if (parsed.length > 0) {
            setActiveTravelPlan(parsed[0]);
          }
        }
      } catch {
        // ignore
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeTravelPlanKey =
    activeTravelPlan?.lat && activeTravelPlan?.lon
      ? `${activeTravelPlan.lat},${activeTravelPlan.lon}`
      : null;
  const loadingWeekly = Boolean(activeTravelPlanKey && weeklyResult.key !== activeTravelPlanKey);
  const weeklyForecast = useMemo(
    () => (activeTravelPlanKey && weeklyResult.key === activeTravelPlanKey ? weeklyResult.days : []),
    [activeTravelPlanKey, weeklyResult]
  );

  useEffect(() => {
    if (!activeTravelPlan?.lat || !activeTravelPlan?.lon) return;
    const controller = new AbortController();
    const planKey = `${activeTravelPlan.lat},${activeTravelPlan.lon}`;

    fetchWeeklyWeather(activeTravelPlan.lat, activeTravelPlan.lon, controller.signal)
      .then((days) => {
        if (!controller.signal.aborted) {
          setWeeklyResult({ key: planKey, days });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setWeeklyResult({ key: planKey, days: [] });
        }
      });

    return () => controller.abort();
  }, [activeTravelPlan]);

  const suitcasePlan = useMemo(
    () => buildSuitcasePlan(items, weeklyForecast, activeTravelPlan?.days || travelDaysInput, lang),
    [items, weeklyForecast, activeTravelPlan, travelDaysInput, lang]
  );

  const handleSelectTheme = (mode) => {
    try {
      localStorage.setItem('geyin_theme_mode', mode);
      window.dispatchEvent(new Event(PREFS_EVENT));
    } catch {
      // ignore
    }
  };

  const handleSelectLang = (nextLang) => {
    try {
      localStorage.setItem('geyin_lang', nextLang);
      window.dispatchEvent(new Event(PREFS_EVENT));
    } catch {
      // ignore
    }
  };

  const imagePreviewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : ''),
    [imageFile]
  );

  useEffect(() => {
    if (!imagePreviewUrl) return;
    return () => URL.revokeObjectURL(imagePreviewUrl);
  }, [imagePreviewUrl]);

  const activeWeather = useMemo(
    () => resolveActiveWeather(demoPresetId, liveRawWeather, selectedCity, lang),
    [demoPresetId, liveRawWeather, selectedCity, lang]
  );

  const wardrobeInsights = useMemo(() => computeWardrobeInsights(items, lang), [items, lang]);

  const fetchItems = useCallback(async (userId) => {
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
  }, []);

  const fetchWeatherByCoords = useCallback(async (lat, lon, label) => {
    setLoadingWeather(true);
    try {
      const weather = await fetchCurrentWeather(lat, lon, label);
      if (weather) {
        setLiveRawWeather(weather);
      }
    } catch {
      setError('Hava məlumatı alınarkən xəta baş verdi.');
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  const persistManualLocation = useCallback((cityValue, lat, lon, label) => {
    setLocationMode('manual');
    try {
      localStorage.setItem(
        'geyin_manual_location',
        JSON.stringify({ city: cityValue, lat, lon, label })
      );
    } catch {
      // ignore
    }
  }, []);

  const detectGpsLocation = useCallback(() => {
    setDemoPresetId('live');
    setLocationMode('gps');
    try {
      localStorage.removeItem('geyin_manual_location');
    } catch {
      // ignore
    }

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationSource(tx.gpsUnsupported);
      const fallback = WORLD_CITIES[0];
      fetchWeatherByCoords(fallback.lat, fallback.lon, `${fallback.name} (${fallback.code})`);
      return;
    }

    setLocationSource(tx.gpsFinding);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearestName = findNearestCity(latitude, longitude, lang);
        const matchedCity = WORLD_CITIES.find(
          (c) => c.name === nearestName || (c.nameByLang && c.nameByLang[lang] === nearestName)
        );
        if (matchedCity) setSelectedCity(matchedCity.name);
        setLocationSource(tx.gpsFound);
        fetchWeatherByCoords(latitude, longitude, nearestName);
      },
      () => {
        setLocationSource(tx.gpsDenied);
        const fallback =
          WORLD_CITIES.find((c) => c.name === selectedCityRef.current) || WORLD_CITIES[0];
        fetchWeatherByCoords(fallback.lat, fallback.lon, `${fallback.name} (${fallback.code})`);
      },
      { timeout: 8000 }
    );
  }, [fetchWeatherByCoords, tx.gpsDenied, tx.gpsFinding, tx.gpsFound, tx.gpsUnsupported, lang]);

  const handleCitySelect = (cityName) => {
    setDemoPresetId('live');
    setSelectedCity(cityName);
    const cityObj = WORLD_CITIES.find((c) => c.name === cityName);
    if (cityObj) {
      const displayCity = getCityDisplayName(cityObj, lang);
      const fullLabel = `${displayCity} (${cityObj.code})`;
      persistManualLocation(cityObj.name, cityObj.lat, cityObj.lon, fullLabel);
      setLocationSource(tx.citySelected);
      fetchWeatherByCoords(cityObj.lat, cityObj.lon, fullLabel);
    }
  };

  const handleWorldCitySearch = async (e) => {
    e.preventDefault();
    const q = citySearchQuery.trim();
    if (!q) return;
    setSearchingCity(true);
    setError('');
    try {
      const place = await searchCityByName(q, lang);
      if (!place) {
        setError(tx.cityNotFound);
        return;
      }
      const displayLabel = place.country_code
        ? `${place.name} (${place.country_code})`
        : place.country
        ? `${place.name}, ${place.country}`
        : place.name;
      setDemoPresetId('live');
      persistManualLocation(place.name, place.latitude, place.longitude, displayLabel);
      setLocationSource(tx.citySearched);
      setCitySearchQuery('');
      await fetchWeatherByCoords(place.latitude, place.longitude, displayLabel);
    } catch {
      setError(tx.cityNotFound);
    } finally {
      setSearchingCity(false);
    }
  };

  const handleAddTravelCity = async (e) => {
    e.preventDefault();
    const q = travelCityInput.trim();
    if (!q) return;
    setSavingTravelCity(true);
    setError('');

    try {
      const place = await searchCityByName(q, lang);
      if (!place) {
        setError(tx.cityNotFound);
        return;
      }

      const label = place.country_code
        ? `${place.name} (${place.country_code})`
        : place.name;
      const daysVal = Math.max(1, Math.min(14, Number(travelDaysInput) || 3));

      const entry = {
        id: Date.now(),
        name: place.name,
        code: place.country_code || '',
        label,
        days: daysVal,
        note: travelNoteInput.trim(),
        lat: place.latitude,
        lon: place.longitude,
      };

      const nextList = [entry, ...travelCities.filter((c) => c.label !== label)].slice(0, 10);
      setTravelCities(nextList);
      setActiveTravelPlan(entry);
      try {
        localStorage.setItem('geyin_travel_cities', JSON.stringify(nextList));
      } catch {
        // ignore
      }

      setDemoPresetId('live');
      persistManualLocation(entry.name, entry.lat, entry.lon, entry.label);
      setLocationSource(`${tx.travelPinned}: ${entry.label}`);
      await fetchWeatherByCoords(entry.lat, entry.lon, entry.label);
      const days = await fetchWeeklyWeather(entry.lat, entry.lon);
      setWeeklyResult({ key: `${entry.lat},${entry.lon}`, days });
      setTravelCityInput('');
      setTravelNoteInput('');
    } catch {
      setError(tx.cityNotFound);
    } finally {
      setSavingTravelCity(false);
    }
  };

  const handleSelectSavedTravelCity = async (entry) => {
    setActiveTravelPlan(entry);
    setDemoPresetId('live');
    persistManualLocation(entry.name, entry.lat, entry.lon, entry.label);
    setLocationSource(`${tx.travelPinned}: ${entry.label}`);
    await fetchWeatherByCoords(entry.lat, entry.lon, entry.label);
    const days = await fetchWeeklyWeather(entry.lat, entry.lon);
    setWeeklyResult({ key: `${entry.lat},${entry.lon}`, days });
  };

  const handleRemoveTravelCity = (id) => {
    const nextList = travelCities.filter((c) => c.id !== id);
    setTravelCities(nextList);
    if (activeTravelPlan?.id === id) {
      setActiveTravelPlan(nextList[0] || null);
    }
    try {
      localStorage.setItem('geyin_travel_cities', JSON.stringify(nextList));
    } catch {
      // ignore
    }
  };

  const initLocationOnLogin = useCallback(() => {
    let savedManual = null;
    try {
      const raw = localStorage.getItem('geyin_manual_location');
      if (raw) savedManual = JSON.parse(raw);
    } catch {
      // ignore
    }

    if (savedManual && typeof savedManual.lat === 'number' && typeof savedManual.lon === 'number') {
      setLocationMode('manual');
      if (savedManual.city) setSelectedCity(savedManual.city);
      setLocationSource(tx.citySelected);
      fetchWeatherByCoords(savedManual.lat, savedManual.lon, savedManual.label || savedManual.city);
    } else {
      detectGpsLocation();
    }
  }, [detectGpsLocation, fetchWeatherByCoords, tx.citySelected]);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data?.session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchItems(currentUser.id);
        initLocationOnLogin();
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
        initLocationOnLogin();
      } else {
        setItems([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchItems, initLocationOnLogin]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (activeWeather && items.length > 0) {
        setRecommendedOutfit((prev) =>
          buildSmartOutfit(
            items,
            activeWeather,
            outfitStyleFilter,
            lockedSlotsRef.current,
            prev,
            {},
            lang
          )
        );
        setOutfitAnimKey((k) => k + 1);
      } else {
        setRecommendedOutfit(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeWeather, items, outfitStyleFilter, lang]);

  const handleRegenerateOutfit = () => {
    if (!activeWeather || items.length === 0) return;
    setRecommendedOutfit((prev) =>
      buildSmartOutfit(items, activeWeather, outfitStyleFilter, lockedSlots, prev, {}, lang)
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
      excludeMap,
      lang
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
      createdAt: new Date().toLocaleDateString(),
      city: activeWeather.locationName,
      temp: activeWeather.temp,
      condition: activeWeather.conditionText,
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
    setMessage(tx.savedToast);
  };

  const handleLoadSavedOutfit = (saved) => {
    if (!saved?.outfitData) return;
    setRecommendedOutfit(saved.outfitData);
    setOutfitAnimKey((k) => k + 1);
    setMessage(tx.loadedToast);
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

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      if (isRegister) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setMessage('OK');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message || 'Error');
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
      setError(tx.photoLabel);
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
      const normalizedCategory =
        typeof category === 'string' ? category : category?.value || CATEGORIES[0].value;

      const { error: insertError } = await supabase.from('wardrobe_items').insert([
        {
          user_id: user.id,
          image_url: imageUrl,
          category: normalizedCategory,
          sub_category: subCategory.trim() || null,
          color: color.trim() || null,
          warmth_level: Number(warmthLevel),
          waterproof,
          windproof,
          style,
        },
      ]);

      if (insertError) throw insertError;

      setMessage(tx.addedToast);
      setImageFile(null);
      setSubCategory('');
      setColor('');
      setWarmthLevel(3);
      setWaterproof(false);
      setWindproof(false);
      setStyle('gundelik');

      if (fileInputRef.current) fileInputRef.current.value = '';

      await fetchItems(user.id);
    } catch (err) {
      setError(err.message || 'Error');
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
      setError(err.message || 'Error');
    }
  };

  if (loading) {
    return (
      <main
        data-theme={isDark ? 'dark' : 'light'}
        className="auth-shell min-h-screen bg-stone-100 text-zinc-900 dark:bg-zinc-950 dark:text-white flex items-center justify-center transition-colors duration-300"
      >
        <p className="text-zinc-600 dark:text-zinc-400 animate-pulse">{tx.loading}</p>
      </main>
    );
  }

  if (!user) {
    return (
      <AuthForm
        isDark={isDark}
        tx={tx}
        lang={lang}
        themeMode={themeMode}
        onSelectLang={handleSelectLang}
        onSelectTheme={handleSelectTheme}
        isRegister={isRegister}
        onToggleRegister={() => {
          setIsRegister(!isRegister);
          setError('');
          setMessage('');
        }}
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        error={error}
        message={message}
        submitting={submitting}
        onSubmit={handleAuth}
      />
    );
  }

  const filteredItems =
    selectedCategoryFilter === 'Hamısı'
      ? items
      : items.filter((item) => item.category === selectedCategoryFilter);

  return (
    <main
      className="app-shell min-h-screen bg-stone-100 text-zinc-900 dark:bg-zinc-950 dark:text-white p-4 md:p-8 transition-colors duration-300"
      data-theme={isDark ? 'dark' : 'light'}
    >
      <div className="app-content max-w-6xl mx-auto space-y-6">
        {/* Top bar */}
        <header className="app-header flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-5">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              G
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Geyin</h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <TopControls
              lang={lang}
              onSelectLang={handleSelectLang}
              themeMode={themeMode}
              onSelectTheme={handleSelectTheme}
              tx={tx}
            />
            <button
              onClick={handleLogout}
              className="rounded-xl bg-white border-stone-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none border px-4 py-2 text-xs font-medium transition cursor-pointer active:scale-95"
            >
              {tx.logout}
            </button>
          </div>
        </header>

        {/* Tabs switcher */}
        <div className="app-tabs flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`app-tab rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer active:scale-95 ${
              activeTab === 'today'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border-stone-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white dark:border-zinc-800 border'
            }`}
          >
            {tx.tabToday}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('travel')}
            className={`app-tab rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer active:scale-95 ${
              activeTab === 'travel'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border-stone-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white dark:border-zinc-800 border'
            }`}
          >
            {tx.tabTravel}
          </button>
        </div>

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

        {activeTab === 'travel' ? (
          <TravelPanel
            tx={tx}
            lang={lang}
            travelCityInput={travelCityInput}
            travelDaysInput={travelDaysInput}
            travelNoteInput={travelNoteInput}
            savingTravelCity={savingTravelCity}
            activeTravelPlan={activeTravelPlan}
            loadingWeekly={loadingWeekly}
            weeklyForecast={weeklyForecast}
            suitcasePlan={suitcasePlan}
            travelCities={travelCities}
            onTravelCityInputChange={setTravelCityInput}
            onTravelDaysInputChange={setTravelDaysInput}
            onTravelNoteInputChange={setTravelNoteInput}
            onAddTravelCity={handleAddTravelCity}
            onSelectSavedTravelCity={handleSelectSavedTravelCity}
            onRemoveTravelCity={handleRemoveTravelCity}
          />
        ) : (
          <WeatherPanel
            tx={tx}
            lang={lang}
            locationSource={locationSource}
            locationMode={locationMode}
            loadingWeather={loadingWeather}
            demoPresetId={demoPresetId}
            activeWeather={activeWeather}
            selectedCity={selectedCity}
            citySearchQuery={citySearchQuery}
            searchingCity={searchingCity}
            onDetectGpsLocation={detectGpsLocation}
            onCitySelect={handleCitySelect}
            onCitySearchQueryChange={setCitySearchQuery}
            onWorldCitySearch={handleWorldCitySearch}
            onSelectDemoPreset={setDemoPresetId}
            items={items}
            recommendedOutfit={recommendedOutfit}
            outfitAnimKey={outfitAnimKey}
            lockedSlots={lockedSlots}
            outfitStyleFilter={outfitStyleFilter}
            onStyleFilterChange={setOutfitStyleFilter}
            onRegenerateOutfit={handleRegenerateOutfit}
            onSaveCurrentOutfit={handleSaveCurrentOutfit}
            onToggleLockSlot={toggleLockSlot}
            onRegenerateSingleSlot={regenerateSingleSlot}
          />
        )}

        <WardrobeInsights tx={tx} insights={wardrobeInsights} />

        <SavedOutfits
          tx={tx}
          lang={lang}
          savedOutfits={savedOutfits}
          onLoadSavedOutfit={handleLoadSavedOutfit}
          onDeleteSavedOutfit={handleDeleteSavedOutfit}
        />

        <WardrobeForm
          tx={tx}
          lang={lang}
          imageFile={imageFile}
          imagePreviewUrl={imagePreviewUrl}
          category={category}
          subCategory={subCategory}
          color={color}
          style={style}
          warmthLevel={warmthLevel}
          waterproof={waterproof}
          windproof={windproof}
          uploading={uploading}
          fileInputRef={fileInputRef}
          onImageFileChange={setImageFile}
          onCategoryChange={setCategory}
          onSubCategoryChange={setSubCategory}
          onColorChange={setColor}
          onStyleChange={setStyle}
          onWarmthLevelChange={setWarmthLevel}
          onWaterproofChange={setWaterproof}
          onWindproofChange={setWindproof}
          onSubmit={handleAddItem}
        />

        <WardrobeList
          tx={tx}
          lang={lang}
          filteredItems={filteredItems}
          loadingItems={loadingItems}
          selectedCategoryFilter={selectedCategoryFilter}
          onSelectCategoryFilter={setSelectedCategoryFilter}
          onDeleteItem={handleDeleteItem}
        />
      </div>
    </main>
  );
}
