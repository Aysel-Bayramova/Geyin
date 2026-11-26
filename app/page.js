'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  {
    value: 'Üst geyim',
    label: { az: 'Üst geyim', en: 'Top', ru: 'Верх' },
  },
  {
    value: 'Alt geyim',
    label: { az: 'Alt geyim', en: 'Bottom', ru: 'Низ' },
  },
  {
    value: 'Üst örtük (Gödəkçə/Palto)',
    label: {
      az: 'Üst örtük (Gödəkçə/Palto)',
      en: 'Outerwear (Jacket/Coat)',
      ru: 'Верхняя одежда (Куртка/Пальто)',
    },
  },
  {
    value: 'Ayaqqabı',
    label: { az: 'Ayaqqabı', en: 'Shoes', ru: 'Обувь' },
  },
  {
    value: 'Aksesuar',
    label: { az: 'Aksesuar', en: 'Accessory', ru: 'Аксессуар' },
  },
];

const STYLES = [
  { value: 'gundelik', label: { az: 'Gündəlik', en: 'Casual', ru: 'Повседневный' } },
  { value: 'klassik', label: { az: 'Klassik / İş', en: 'Classic / Work', ru: 'Классика / Офис' } },
  { value: 'idman', label: { az: 'İdman', en: 'Sporty', ru: 'Спортивный' } },
  { value: 'gece', label: { az: 'Xüsusi / Axşam', en: 'Evening / Special', ru: 'Вечерний' } },
];

const WORLD_CITIES = [
  // Azərbaycan
  { name: 'Bakı', code: 'AZ', nameByLang: { az: 'Bakı', en: 'Baku', ru: 'Баку' }, lat: 40.4093, lon: 49.8671 },
  { name: 'Sumqayıt', code: 'AZ', nameByLang: { az: 'Sumqayıt', en: 'Sumgait', ru: 'Сумгайыт' }, lat: 40.5897, lon: 49.6686 },
  { name: 'Gəncə', code: 'AZ', nameByLang: { az: 'Gəncə', en: 'Ganja', ru: 'Гянджа' }, lat: 40.6828, lon: 46.3606 },
  { name: 'Mingəçevir', code: 'AZ', nameByLang: { az: 'Mingəçevir', en: 'Mingachevir', ru: 'Мингечевир' }, lat: 40.7703, lon: 47.0496 },
  { name: 'Şəki', code: 'AZ', nameByLang: { az: 'Şəki', en: 'Shaki', ru: 'Шеки' }, lat: 41.1919, lon: 47.1706 },
  { name: 'Lənkəran', code: 'AZ', nameByLang: { az: 'Lənkəran', en: 'Lankaran', ru: 'Ленкорань' }, lat: 38.7543, lon: 48.8506 },
  { name: 'Naxçıvan', code: 'AZ', nameByLang: { az: 'Naxçıvan', en: 'Nakhchivan', ru: 'Нахчыван' }, lat: 39.2089, lon: 45.4122 },
  { name: 'Şuşa', code: 'AZ', nameByLang: { az: 'Şuşa', en: 'Shusha', ru: 'Шуша' }, lat: 39.7601, lon: 46.7465 },
  { name: 'Quba', code: 'AZ', nameByLang: { az: 'Quba', en: 'Guba', ru: 'Губа' }, lat: 41.3611, lon: 48.5134 },
  { name: 'Şamaxı', code: 'AZ', nameByLang: { az: 'Şamaxı', en: 'Shamakhi', ru: 'Шамахы' }, lat: 40.6314, lon: 48.6414 },

  // Dünya şəhərləri
  { name: 'İstanbul', code: 'TR', nameByLang: { az: 'İstanbul', en: 'Istanbul', ru: 'Стамбул' }, lat: 41.0082, lon: 28.9784 },
  { name: 'Ankara', code: 'TR', nameByLang: { az: 'Ankara', en: 'Ankara', ru: 'Анкара' }, lat: 39.9334, lon: 32.8597 },
  { name: 'London', code: 'GB', nameByLang: { az: 'London', en: 'London', ru: 'Лондон' }, lat: 51.5072, lon: -0.1276 },
  { name: 'Paris', code: 'FR', nameByLang: { az: 'Paris', en: 'Paris', ru: 'Париж' }, lat: 48.8566, lon: 2.3522 },
  { name: 'Berlin', code: 'DE', nameByLang: { az: 'Berlin', en: 'Berlin', ru: 'Берлин' }, lat: 52.52, lon: 13.405 },
  { name: 'Roma', code: 'IT', nameByLang: { az: 'Roma', en: 'Rome', ru: 'Рим' }, lat: 41.9028, lon: 12.4964 },
  { name: 'Madrid', code: 'ES', nameByLang: { az: 'Madrid', en: 'Madrid', ru: 'Мадрид' }, lat: 40.4168, lon: -3.7038 },
  { name: 'Amsterdam', code: 'NL', nameByLang: { az: 'Amsterdam', en: 'Amsterdam', ru: 'Амстердам' }, lat: 52.3676, lon: 4.9041 },
  { name: 'Vyana', code: 'AT', nameByLang: { az: 'Vyana', en: 'Vienna', ru: 'Вена' }, lat: 48.2082, lon: 16.3738 },
  { name: 'Dubay', code: 'AE', nameByLang: { az: 'Dubay', en: 'Dubai', ru: 'Дубай' }, lat: 25.2048, lon: 55.2708 },
  { name: 'Ər-Riyad', code: 'SA', nameByLang: { az: 'Ər-Riyad', en: 'Riyadh', ru: 'Эр-Рияд' }, lat: 24.7136, lon: 46.6753 },
  { name: 'Nyu-York', code: 'US', nameByLang: { az: 'Nyu-York', en: 'New York', ru: 'Нью-Йорк' }, lat: 40.7128, lon: -74.006 },
  { name: 'Los Anceles', code: 'US', nameByLang: { az: 'Los Anceles', en: 'Los Angeles', ru: 'Лос-Анджелес' }, lat: 34.0522, lon: -118.2437 },
  { name: 'Toronto', code: 'CA', nameByLang: { az: 'Toronto', en: 'Toronto', ru: 'Торонто' }, lat: 43.6532, lon: -79.3832 },
  { name: 'Tokio', code: 'JP', nameByLang: { az: 'Tokio', en: 'Tokyo', ru: 'Токио' }, lat: 35.6762, lon: 139.6503 },
  { name: 'Seul', code: 'KR', nameByLang: { az: 'Seul', en: 'Seoul', ru: 'Сеул' }, lat: 37.5665, lon: 126.978 },
  { name: 'Pekin', code: 'CN', nameByLang: { az: 'Pekin', en: 'Beijing', ru: 'Пекин' }, lat: 39.9042, lon: 116.4074 },
  { name: 'Sinqapur', code: 'SG', nameByLang: { az: 'Sinqapur', en: 'Singapore', ru: 'Сингапур' }, lat: 1.3521, lon: 103.8198 },
  { name: 'Moskva', code: 'RU', nameByLang: { az: 'Moskva', en: 'Moscow', ru: 'Москва' }, lat: 55.7558, lon: 37.6173 },
  { name: 'Sidney', code: 'AU', nameByLang: { az: 'Sidney', en: 'Sydney', ru: 'Сидней' }, lat: -33.8688, lon: 151.2093 },
  { name: 'San-Paulu', code: 'BR', nameByLang: { az: 'San-Paulu', en: 'São Paulo', ru: 'Сан-Паулу' }, lat: -23.5505, lon: -46.6333 },
  { name: 'Qahirə', code: 'EG', nameByLang: { az: 'Qahirə', en: 'Cairo', ru: 'Каир' }, lat: 30.0444, lon: 31.2357 },
];

const DEMO_PRESETS = [
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

const UI_TEXT = {
  az: {
    loading: 'Yüklənir...',
    loginSubtitle: 'Hava şəraitinə uyğun kombinlər üçün hesabına daxil ol.',
    registerSubtitle: 'Yeni hesab yarat və qarderobunu qur.',
    email: 'E-poçt',
    password: 'Şifrə',
    passwordHint: 'Ən az 6 simvol',
    signIn: 'Daxil ol',
    signUp: 'Qeydiyyatdan keç',
    pleaseWait: 'Gözləyin...',
    haveAccount: 'Artıq hesabın var? Daxil ol',
    noAccount: 'Hesabın yoxdur? Yeni hesab yarat',
    logout: 'Çıxış et',
    tabToday: 'Bugünkü Hava & Kombin',
    tabTravel: 'Səyahət Şəhəri',
    liveWeatherTitle: 'Canlı Hava & Ağıllı Kombin',
    gpsFinding: 'GPS ilə məkan tapılır...',
    gpsFound: 'GPS ilə tapıldı',
    gpsDenied: 'GPS icazəsi verilmədi (şəhər seçin)',
    gpsUnsupported: 'GPS dəstəklənmir (şəhər seçildi)',
    citySelected: 'Əl ilə seçildi (GPS kilidlənib)',
    citySearched: 'Axtarışla seçildi (GPS kilidlənib)',
    travelPinned: 'Səyahət şəhəri aktivdir',
    checkingWeather: 'Hava yoxlanılır...',
    chooseLocation: 'Məkan seçin',
    feelsLike: 'Hiss olunan',
    dailyRange: 'Günlük',
    wind: 'Külək',
    kmh: 'km/saat',
    gpsBtn: 'GPS ilə tap',
    searchCityPlaceholder: 'Dünya şəhəri axtar (məs: Tokyo, Paris)...',
    searchBtn: 'Tap',
    searching: 'Axtarılır...',
    cityNotFound: 'Şəhər tapılmadı, başqa ad yoxlayın.',
    demoMode: 'Hava rejimi (Demo test):',
    generalAdviceTitle: 'Ümumi geyim məsləhəti:',
    todayOutfitTitle: 'Qarderobundan bugünkü kombin',
    whyOutfit: 'Niyə bu kombin:',
    defaultOutfitSub: 'Hava temperaturu və yağış/külək göstəricilərinə uyğun seçildi',
    allStyles: 'Bütün stillər',
    generateAnother: 'Başqa kombin yarat',
    saveOutfit: 'Yadda saxla',
    savedToast: 'Kombin "Sevimli kombinlərim" bölməsinə əlavə olundu!',
    loadedToast: 'Sevimli kombin əsas sahəyə yükləndi.',
    travelTitle: 'Səyahət və 1 həftəlik valiz tövsiyəsi',
    travelSubtitle:
      'Gedəcəyin şəhəri və neçə günlük səyahət etdiyini yaz — 1 həftəlik hava proqnozuna əsasən valizə qoyulacaq paltarları seçək.',
    travelInputPlaceholder: 'Gedəcəyin şəhəri yaz (məs: London, Dubai, Rome)...',
    travelDaysLabel: 'Səyahət müddəti (gün)',
    travelNotePlaceholder: 'Əlavə qeyd (məs: iş səfəri, gəzinti)',
    travelSaveBtn: 'Şəhəri qeyd et və valizi hazırla',
    travelSavedListTitle: 'Qeyd etdiyin səyahət şəhərləri',
    useCityBtn: 'Bu şəhəri seç',
    removeCityBtn: 'Çıxar',
    travelEmptyMsg: 'Hələ səyahət şəhəri qeyd etməmisən. Yuxarıdan gedəcəyin şəhəri əlavə et.',
    weeklyForecastTitle: '1 həftəlik (7 günlük) hava proqnozu',
    suitcaseTitle: 'Valizə qoyulacaq geyimlər (Qarderobundan)',
    suitcaseSummary: 'günlük səyahət • 7 günlük proqnoza uyğun seçildi',
    rainyWeekNote: 'Həftə ərzində yağış ehtimalı yüksəkdir — suya davamlı geyimlərə üstünlük verildi.',
    coldWeekNote: 'Həftə ərzində sərin/soyuq günlər var — üst örtük və isti parçalar əlavə olundu.',
    warmWeekNote: 'Həftə ərzində mülayim/isti hava gözlənilir — yüngül və nəfəs alan parçalar seçildi.',
    emptySuitcaseMsg: 'Valiz tövsiyəsi qurmaq üçün əvvəlcə qarderobuna paltar əlavə et.',
    daysUnit: 'günlük',
    emptyWardrobeOutfit:
      'Qarderobunda hələ paltar yoxdur. Aşağıdan üst geyim, alt geyim və ayaqqabı əlavə et ki, avtomatik kombin quraq!',
    locked: 'Kilidli',
    lock: 'Kilidlə',
    swap: 'Dəyiş',
    notFoundInSlot: 'Qarderobda bu kateqoriya tapılmadı',
    warmthShort: 'İstilik',
    totalItems: 'Ümumi parça',
    avgWarmth: 'Orta istilik',
    waterproofCount: 'Suya davamlı',
    piecesUnit: 'ədəd',
    savedOutfitsTitle: 'Sevimli kombinlərim',
    loadBtn: 'Yüklə',
    deleteBtn: 'Sil',
    addNewItemTitle: 'Yeni paltar əlavə et',
    photoLabel: 'Paltar şəkli *',
    chooseFileBtn: 'Fayl seç',
    noFileChosen: 'Fayl seçilmədi',
    previewReady: 'Seçilmiş şəkil hazırdır',
    categoryLabel: 'Kateqoriya *',
    subCategoryLabel: 'Alt kateqoriya (məs: Hudi, Cins)',
    subCategoryPlaceholder: 'Məsələn: Oversize hudi',
    colorLabel: 'Rəng',
    colorPlaceholder: 'Məsələn: Qara, Bej, Göy',
    styleLabel: 'Stil',
    warmthSlider: 'İstilik səviyyəsi (1 = çox nazik, 5 = çox qalın)',
    waterproofCheck: 'Suya davamlı (yağış üçün)',
    windproofCheck: 'Küləyə davamlı',
    addToWardrobeBtn: 'Qarderoba əlavə et',
    uploadingBtn: 'Yüklənir...',
    addedToast: 'Paltar qarderoba əlavə olundu!',
    myItemsTitle: 'Əşyalarım',
    allFilter: 'Hamısı',
    loadingWardrobe: 'Qarderob yüklənir...',
    emptyCategoryMsg:
      'Bu kateqoriyada hələ paltar yoxdur. Yuxarıdakı formadan ilk paltarını əlavə et!',
    waterproofBadge: 'Suya davamlı',
    windproofBadge: 'Küləyə davamlı',
    auto: 'Avto',
    light: 'Açıq',
    dark: 'Qaranlıq',
    languageGroupLabel: 'Dil seçimi',
    themeGroupLabel: 'Tema seçimi',
    slotLabels: {
      top: 'Üst geyim',
      bottom: 'Alt geyim',
      outerwear: 'Üst örtük',
      shoes: 'Ayaqqabı',
      accessory: 'Aksesuar',
    },
  },
  en: {
    loading: 'Loading...',
    loginSubtitle: 'Sign in for weather-smart outfits from your wardrobe.',
    registerSubtitle: 'Create an account and build your digital wardrobe.',
    email: 'Email',
    password: 'Password',
    passwordHint: 'At least 6 characters',
    signIn: 'Sign in',
    signUp: 'Sign up',
    pleaseWait: 'Please wait...',
    haveAccount: 'Already have an account? Sign in',
    noAccount: "Don't have an account? Create one",
    logout: 'Sign out',
    tabToday: 'Today Weather & Outfit',
    tabTravel: 'Travel City',
    liveWeatherTitle: 'Live Weather & Smart Outfit',
    gpsFinding: 'Detecting location via GPS...',
    gpsFound: 'Located via GPS',
    gpsDenied: 'GPS denied (select a city)',
    gpsUnsupported: 'GPS unsupported (city selected)',
    citySelected: 'Manually selected (GPS paused)',
    citySearched: 'Found via search (GPS paused)',
    travelPinned: 'Travel city active',
    checkingWeather: 'Checking weather...',
    chooseLocation: 'Choose a location',
    feelsLike: 'Feels like',
    dailyRange: 'Daily',
    wind: 'Wind',
    kmh: 'km/h',
    gpsBtn: 'Use GPS',
    searchCityPlaceholder: 'Search any world city (e.g. Tokyo, Paris)...',
    searchBtn: 'Find',
    searching: 'Searching...',
    cityNotFound: 'City not found. Try another name.',
    demoMode: 'Weather mode (Demo test):',
    generalAdviceTitle: 'General dressing tip:',
    todayOutfitTitle: "Today's outfit from your wardrobe",
    whyOutfit: 'Why this outfit:',
    defaultOutfitSub: 'Selected based on temperature, rain, and wind',
    allStyles: 'All styles',
    generateAnother: 'Generate another',
    saveOutfit: 'Save outfit',
    savedToast: 'Outfit added to Saved Outfits!',
    loadedToast: 'Saved outfit loaded into main view.',
    travelTitle: 'Travel & 1-Week Suitcase Guide',
    travelSubtitle:
      'Enter your destination city and how many days you are traveling — we pick suitcase items from your wardrobe based on the 7-day forecast.',
    travelInputPlaceholder: 'Enter destination city (e.g. London, Dubai, Rome)...',
    travelDaysLabel: 'Trip length (days)',
    travelNotePlaceholder: 'Note (e.g. work trip, sightseeing)',
    travelSaveBtn: 'Save city & build suitcase',
    travelSavedListTitle: 'Saved travel cities',
    useCityBtn: 'Use city',
    removeCityBtn: 'Remove',
    travelEmptyMsg: 'No travel cities saved yet. Add a destination city above.',
    weeklyForecastTitle: '1-Week (7-Day) Forecast',
    suitcaseTitle: 'Suggested Suitcase Items (From Your Wardrobe)',
    suitcaseSummary: 'day trip • tailored to 7-day forecast',
    rainyWeekNote: 'High chance of rain during the week — waterproof items were prioritized.',
    coldWeekNote: 'Cool/cold days expected — outerwear and warmer pieces were included.',
    warmWeekNote: 'Mild/warm days expected — lighter and breathable pieces were prioritized.',
    emptySuitcaseMsg: 'Add items to your wardrobe first to get suitcase recommendations.',
    daysUnit: 'days',
    emptyWardrobeOutfit:
      'Your wardrobe is empty. Add tops, bottoms, and shoes below to generate smart outfits!',
    locked: 'Locked',
    lock: 'Lock',
    swap: 'Swap',
    notFoundInSlot: 'No item found in this category',
    warmthShort: 'Warmth',
    totalItems: 'Total items',
    avgWarmth: 'Avg warmth',
    waterproofCount: 'Waterproof',
    piecesUnit: 'items',
    savedOutfitsTitle: 'Saved Outfits',
    loadBtn: 'Load',
    deleteBtn: 'Delete',
    addNewItemTitle: 'Add new clothing item',
    photoLabel: 'Clothing photo *',
    chooseFileBtn: 'Choose file',
    noFileChosen: 'No file chosen',
    previewReady: 'Selected photo ready',
    categoryLabel: 'Category *',
    subCategoryLabel: 'Subcategory (e.g. Hoodie, Jeans)',
    subCategoryPlaceholder: 'e.g. Oversized hoodie',
    colorLabel: 'Color',
    colorPlaceholder: 'e.g. Black, Beige, Blue',
    styleLabel: 'Style',
    warmthSlider: 'Warmth level (1 = very thin, 5 = very thick)',
    waterproofCheck: 'Waterproof (for rain)',
    windproofCheck: 'Windproof',
    addToWardrobeBtn: 'Add to wardrobe',
    uploadingBtn: 'Uploading...',
    addedToast: 'Item added to your wardrobe!',
    myItemsTitle: 'My Items',
    allFilter: 'All',
    loadingWardrobe: 'Loading wardrobe...',
    emptyCategoryMsg: 'No items in this category yet. Add your first item above!',
    waterproofBadge: 'Waterproof',
    windproofBadge: 'Windproof',
    auto: 'Auto',
    light: 'Light',
    dark: 'Dark',
    languageGroupLabel: 'Language selection',
    themeGroupLabel: 'Theme selection',
    slotLabels: {
      top: 'Top',
      bottom: 'Bottom',
      outerwear: 'Outerwear',
      shoes: 'Shoes',
      accessory: 'Accessory',
    },
  },
  ru: {
    loading: 'Загрузка...',
    loginSubtitle: 'Войдите для подбора образов по погоде из вашего гардероба.',
    registerSubtitle: 'Создайте аккаунт и соберите свой гардероб.',
    email: 'Эл. почта',
    password: 'Пароль',
    passwordHint: 'Минимум 6 символов',
    signIn: 'Войти',
    signUp: 'Регистрация',
    pleaseWait: 'Подождите...',
    haveAccount: 'Уже есть аккаунт? Войти',
    noAccount: 'Нет аккаунта? Зарегистрироваться',
    logout: 'Выйти',
    tabToday: 'Погода и образ',
    tabTravel: 'Город поездки',
    liveWeatherTitle: 'Погода и умный образ',
    gpsFinding: 'Определение по GPS...',
    gpsFound: 'Определено по GPS',
    gpsDenied: 'GPS отклонен (выберите город)',
    gpsUnsupported: 'GPS не поддерживается (выбран город)',
    citySelected: 'Выбрано вручную (GPS на паузе)',
    citySearched: 'Найдено в поиске (GPS на паузе)',
    travelPinned: 'Город поездки активен',
    checkingWeather: 'Проверка погоды...',
    chooseLocation: 'Выберите город',
    feelsLike: 'Ощущается как',
    dailyRange: 'За день',
    wind: 'Ветер',
    kmh: 'км/ч',
    gpsBtn: 'Найти по GPS',
    searchCityPlaceholder: 'Поиск города мира (напр. Токио, Париж)...',
    searchBtn: 'Найти',
    searching: 'Поиск...',
    cityNotFound: 'Город не найден, попробуйте другое название.',
    demoMode: 'Режим погоды (Демо):',
    generalAdviceTitle: 'Общий совет по одежде:',
    todayOutfitTitle: 'Образ на сегодня из гардероба',
    whyOutfit: 'Почему этот образ:',
    defaultOutfitSub: 'Подобрано с учетом температуры, дождя и ветра',
    allStyles: 'Все стили',
    generateAnother: 'Другой образ',
    saveOutfit: 'Сохранить',
    savedToast: 'Образ добавлен в «Избранные образы»!',
    loadedToast: 'Сохраненный образ загружен.',
    travelTitle: 'Поездка и сбор чемодана на неделю',
    travelSubtitle:
      'Укажите город и сколько дней продлится поездка — подберем вещи из гардероба по прогнозу на 7 дней.',
    travelInputPlaceholder: 'Введите город (напр. Лондон, Дубай, Рим)...',
    travelDaysLabel: 'Длительность (дней)',
    travelNotePlaceholder: 'Заметка (напр. командировка, прогулки)',
    travelSaveBtn: 'Сохранить и собрать чемодан',
    travelSavedListTitle: 'Сохраненные города поездок',
    useCityBtn: 'Выбрать',
    removeCityBtn: 'Удалить',
    travelEmptyMsg: 'Пока нет сохраненных городов поездки. Добавьте город выше.',
    weeklyForecastTitle: 'Прогноз погоды на 1 неделю (7 дней)',
    suitcaseTitle: 'Рекомендуемые вещи в чемодан (из гардероба)',
    suitcaseSummary: 'дн. поездка • по прогнозу на 7 дней',
    rainyWeekNote: 'На неделе ожидаются осадки — учтены влагозащитные вещи.',
    coldWeekNote: 'Ожидаются прохладные/холодные дни — добавлена верхняя одежда.',
    warmWeekNote: 'Ожидается теплая погода — выбраны более легкие вещи.',
    emptySuitcaseMsg: 'Сначала добавьте вещи в гардероб для подбора чемодана.',
    daysUnit: 'дн.',
    emptyWardrobeOutfit:
      'В гардеробе пока нет вещей. Добавьте верх, низ и обувь ниже для умного подбора!',
    locked: 'Закреплено',
    lock: 'Закрепить',
    swap: 'Заменить',
    notFoundInSlot: 'Нет вещи в этой категории',
    warmthShort: 'Тепло',
    totalItems: 'Всего вещей',
    avgWarmth: 'Среднее тепло',
    waterproofCount: 'Влагозащита',
    piecesUnit: 'шт.',
    savedOutfitsTitle: 'Избранные образы',
    loadBtn: 'Загрузить',
    deleteBtn: 'Удалить',
    addNewItemTitle: 'Добавить вещь',
    photoLabel: 'Фото вещи *',
    chooseFileBtn: 'Выберите файл',
    noFileChosen: 'Файл не выбран',
    previewReady: 'Фото выбрано',
    categoryLabel: 'Категория *',
    subCategoryLabel: 'Подкатегория (напр. Худи, Джинсы)',
    subCategoryPlaceholder: 'Например: Оверсайз худи',
    colorLabel: 'Цвет',
    colorPlaceholder: 'Например: Черный, Бежевый, Синий',
    styleLabel: 'Стиль',
    warmthSlider: 'Уровень тепла (1 = тонкое, 5 = очень теплое)',
    waterproofCheck: 'Водонепроницаемое (от дождя)',
    windproofCheck: 'Ветрозащитное',
    addToWardrobeBtn: 'Добавить в гардероб',
    uploadingBtn: 'Загрузка...',
    addedToast: 'Вещь добавлена в гардероб!',
    myItemsTitle: 'Мои вещи',
    allFilter: 'Все',
    loadingWardrobe: 'Загрузка гардероба...',
    emptyCategoryMsg: 'В этой категории пока пусто. Добавьте первую вещь выше!',
    waterproofBadge: 'Влагозащита',
    windproofBadge: 'Ветрозащита',
    auto: 'Авто',
    light: 'Светлая',
    dark: 'Темная',
    languageGroupLabel: 'Выбор языка',
    themeGroupLabel: 'Выбор темы',
    slotLabels: {
      top: 'Верх',
      bottom: 'Низ',
      outerwear: 'Верхняя одежда',
      shoes: 'Обувь',
      accessory: 'Аксессуар',
    },
  },
};

const NEUTRAL_KEYWORDS = [
  'qara', 'ağ', 'ag', 'bej', 'boz', 'krem', 'qəhvəyi', 'qehveyi',
  'tünd göy', 'göy', 'goy', 'cins', 'xaki', 'black', 'white',
  'beige', 'gray', 'grey', 'navy', 'brown', 'черный', 'чёрный',
  'белый', 'бежевый', 'серый', 'синий', 'коричневый',
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

function findNearestCity(lat, lon, lang = 'az') {
  let nearest = WORLD_CITIES[0];
  let minDist = Infinity;
  for (const city of WORLD_CITIES) {
    const d = Math.hypot(city.lat - lat, city.lon - lon);
    if (d < minDist) {
      minDist = d;
      nearest = city;
    }
  }
  if (minDist < 1.2) {
    return nearest.nameByLang ? nearest.nameByLang[lang] || nearest.name : nearest.name;
  }
  const prefix = lang === 'en' ? 'GPS Location' : lang === 'ru' ? 'GPS точка' : 'GPS Məkanı';
  return `${prefix} (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
}

function interpretWeather(code, temp, windSpeed, hourlyForecast = null, lang = 'az') {
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

function buildOutfitExplanation(outfit, weatherInfo, lang = 'az') {
  if (!outfit || !weatherInfo) return '';
  const selected = [
    outfit.top,
    outfit.bottom,
    outfit.outerwear,
    outfit.shoes,
    outfit.accessory,
  ].filter(Boolean);
  if (selected.length === 0) return '';

  const hasWaterproof = selected.some((i) => i.waterproof);
  const hasWindproof = selected.some((i) => i.windproof);
  const colors = selected.map((i) => i.color).filter(Boolean);

  if (lang === 'en') {
    const reasons = [`targeted warmth (${weatherInfo.idealWarmth}/5) for ${weatherInfo.temp}°C`];
    if (weatherInfo.isRainy && hasWaterproof) reasons.push('added waterproof protection');
    if (weatherInfo.isWindy && hasWindproof) reasons.push('added windproof protection');
    if (colors.length >= 2) reasons.push(`balanced ${colors.slice(0, 3).join(' + ')} colors`);
    return reasons.join(', ') + '.';
  }

  if (lang === 'ru') {
    const reasons = [`учтен уровень тепла (${weatherInfo.idealWarmth}/5) для ${weatherInfo.temp}°C`];
    if (weatherInfo.isRainy && hasWaterproof) reasons.push('добавлена влагозащита');
    if (weatherInfo.isWindy && hasWindproof) reasons.push('добавлена ветрозащита');
    if (colors.length >= 2) reasons.push(`сочетание цветов ${colors.slice(0, 3).join(' + ')}`);
    return reasons.join(', ') + '.';
  }

  const reasons = [`${weatherInfo.temp}°C hava üçün ideal istilik (${weatherInfo.idealWarmth}/5) hədəfləndi`];
  if (weatherInfo.isRainy && hasWaterproof) reasons.push('yağışa qarşı suya davamlı parça seçildi');
  if (weatherInfo.isWindy && hasWindproof) reasons.push('küləyə davamlı qoruma əlavə edildi');
  if (colors.length >= 2) reasons.push(`${colors.slice(0, 3).join(' + ')} rəng harmoniyası uyğunlaşdırıldı`);
  return reasons.join(', ') + '.';
}

function buildSmartOutfit(
  items,
  weatherInfo,
  preferredStyle = 'all',
  lockedSlots = {},
  currentOutfit = null,
  excludeIdsBySlot = {},
  lang = 'az'
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
      if (preferredStyle !== 'all' && item.style === preferredStyle) score += 20;
      if (anchorColor) score += getColorHarmonyBonus(anchorColor, item.color);
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
  nextOutfit.explanation = buildOutfitExplanation(nextOutfit, weatherInfo, lang);
  return nextOutfit;
}

function buildSuitcasePlan(items, weeklyDays, tripDays, lang = 'az') {
  if (!items || items.length === 0) {
    return { suggestedItems: [], note: '' };
  }

  const daysToUse = weeklyDays && weeklyDays.length > 0 ? weeklyDays : [];
  const avgMax =
    daysToUse.length > 0
      ? daysToUse.reduce((s, d) => s + d.maxTemp, 0) / daysToUse.length
      : 18;
  const avgMin =
    daysToUse.length > 0
      ? daysToUse.reduce((s, d) => s + d.minTemp, 0) / daysToUse.length
      : 10;
  const maxRainProb =
    daysToUse.length > 0 ? Math.max(...daysToUse.map((d) => d.rainProb || 0)) : 0;

  const isRainyWeek = maxRainProb >= 50;
  const isColdWeek = avgMin <= 10 || avgMax <= 14;

  let idealWarmth = 3;
  if (avgMax <= 6) idealWarmth = 5;
  else if (avgMax <= 13) idealWarmth = 4;
  else if (avgMax <= 20) idealWarmth = 3;
  else if (avgMax <= 26) idealWarmth = 2;
  else idealWarmth = 1;

  const clampedDays = Math.max(1, Math.min(14, Number(tripDays) || 3));
  const topCount = Math.min(items.filter((i) => i.category === 'Üst geyim').length, Math.max(1, Math.min(7, clampedDays)));
  const bottomCount = Math.min(
    items.filter((i) => i.category === 'Alt geyim').length,
    Math.max(1, Math.min(4, Math.ceil(clampedDays / 2)))
  );
  const outerwearCount = Math.min(
    items.filter((i) => i.category === 'Üst örtük (Gödəkçə/Palto)').length,
    isColdWeek || isRainyWeek ? 2 : 1
  );
  const shoesCount = Math.min(
    items.filter((i) => i.category === 'Ayaqqabı').length,
    clampedDays >= 4 ? 2 : 1
  );
  const accessoryCount = Math.min(items.filter((i) => i.category === 'Aksesuar').length, 1);

  const scoreAndPick = (catName, count) => {
    const pool = items.filter((i) => i.category === catName);
    const ranked = [...pool].sort((a, b) => {
      const scoreA =
        -Math.abs((a.warmth_level || 3) - idealWarmth) * 10 +
        (isRainyWeek && a.waterproof ? 18 : 0) +
        (isColdWeek && a.windproof ? 10 : 0);
      const scoreB =
        -Math.abs((b.warmth_level || 3) - idealWarmth) * 10 +
        (isRainyWeek && b.waterproof ? 18 : 0) +
        (isColdWeek && b.windproof ? 10 : 0);
      return scoreB - scoreA;
    });
    return ranked.slice(0, count);
  };

  const suggestedItems = [
    ...scoreAndPick('Üst geyim', topCount),
    ...scoreAndPick('Alt geyim', bottomCount),
    ...scoreAndPick('Üst örtük (Gödəkçə/Palto)', outerwearCount),
    ...scoreAndPick('Ayaqqabı', shoesCount),
    ...scoreAndPick('Aksesuar', accessoryCount),
  ];

  let note = '';
  if (lang === 'en') {
    if (isRainyWeek) note = 'High chance of rain during the week — waterproof items were prioritized.';
    else if (isColdWeek) note = 'Cool/cold days expected — outerwear and warmer pieces were included.';
    else note = 'Mild/warm days expected — lighter and breathable pieces were prioritized.';
  } else if (lang === 'ru') {
    if (isRainyWeek) note = 'На неделе ожидаются осадки — учтены влагозащитные вещи.';
    else if (isColdWeek) note = 'Ожидаются прохладные/холодные дни — добавлена верхняя одежда.';
    else note = 'Ожидается теплая погода — выбраны более легкие вещи.';
  } else {
    if (isRainyWeek) note = 'Həftə ərzində yağış ehtimalı yüksəkdir — suya davamlı geyimlərə üstünlük verildi.';
    else if (isColdWeek) note = 'Həftə ərzində sərin/soyuq günlər var — üst örtük və isti parçalar əlavə olundu.';
    else note = 'Həftə ərzində mülayim/isti hava gözlənilir — yüngül və nəfəs alan parçalar seçildi.';
  }

  return { suggestedItems, note };
}

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegister, setIsRegister] = useState(false);

  // Active tab: 'today' | 'travel'
  const [activeTab, setActiveTab] = useState('today');

  // Language state: 'az' | 'en' | 'ru'
  const [lang, setLang] = useState('az');
  const tx = UI_TEXT[lang] || UI_TEXT.az;

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
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [subCategory, setSubCategory] = useState('');
  const [color, setColor] = useState('');
  const [warmthLevel, setWarmthLevel] = useState(3);
  const [waterproof, setWaterproof] = useState(false);
  const [windproof, setWindproof] = useState(false);
  const [style, setStyle] = useState('gundelik');

  // Location & Weather state
  const [locationMode, setLocationMode] = useState('gps');
  const [selectedCity, setSelectedCity] = useState('Bakı');
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
  const [savedOutfits, setSavedOutfits] = useState([]);

  // Travel / 1-week forecast & suitcase state
  const [travelCityInput, setTravelCityInput] = useState('');
  const [travelDaysInput, setTravelDaysInput] = useState(4);
  const [travelNoteInput, setTravelNoteInput] = useState('');
  const [travelCities, setTravelCities] = useState([]);
  const [activeTravelPlan, setActiveTravelPlan] = useState(null);
  const [weeklyForecast, setWeeklyForecast] = useState([]);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [savingTravelCity, setSavingTravelCity] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedTheme = localStorage.getItem('geyin_theme_mode');
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
        setThemeMode(savedTheme);
      }
      const savedLang = localStorage.getItem('geyin_lang');
      if (savedLang === 'az' || savedLang === 'en' || savedLang === 'ru') {
        setLang(savedLang);
      }
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

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);

    const handleChange = (e) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const fetchWeeklyForecast = useCallback(async (lat, lon) => {
    setLoadingWeekly(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`
      );
      const data = await res.json();
      if (data?.daily?.time) {
        const days = data.daily.time.map((dateStr, idx) => ({
          date: dateStr,
          maxTemp: Math.round(data.daily.temperature_2m_max?.[idx] ?? 0),
          minTemp: Math.round(data.daily.temperature_2m_min?.[idx] ?? 0),
          rainProb: data.daily.precipitation_probability_max?.[idx] ?? 0,
        }));
        setWeeklyForecast(days);
      }
    } catch {
      setWeeklyForecast([]);
    } finally {
      setLoadingWeekly(false);
    }
  }, []);

  useEffect(() => {
    if (activeTravelPlan?.lat && activeTravelPlan?.lon) {
      fetchWeeklyForecast(activeTravelPlan.lat, activeTravelPlan.lon);
    }
  }, [activeTravelPlan, fetchWeeklyForecast]);

  const suitcasePlan = useMemo(
    () => buildSuitcasePlan(items, weeklyForecast, activeTravelPlan?.days || travelDaysInput, lang),
    [items, weeklyForecast, activeTravelPlan, travelDaysInput, lang]
  );

  const handleSelectTheme = (mode) => {
    setThemeMode(mode);
    try {
      localStorage.setItem('geyin_theme_mode', mode);
    } catch {
      // ignore
    }
  };

  const handleSelectLang = (nextLang) => {
    setLang(nextLang);
    try {
      localStorage.setItem('geyin_lang', nextLang);
    } catch {
      // ignore
    }
  };

  const isDark = themeMode === 'dark' || (themeMode === 'auto' && systemPrefersDark);

  const getCategoryLabel = (catValue) => {
    const rawVal = typeof catValue === 'string' ? catValue : catValue?.value;
    const found = CATEGORIES.find((c) => c.value === rawVal);
    if (!found) return rawVal || '';
    return found.label[lang] || found.label.az;
  };

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
  }, [demoPresetId, liveRawWeather, selectedCity, lang]);

  const wardrobeInsights = useMemo(() => {
    if (!items || items.length === 0) return null;
    const avgWarmth = (
      items.reduce((acc, i) => acc + (Number(i.warmth_level) || 3), 0) / items.length
    ).toFixed(1);

    const hasWaterproof = items.some((i) => i.waterproof);
    const missingCategories = CATEGORIES.filter(
      (cat) => cat.value !== 'Aksesuar' && !items.some((i) => i.category === cat.value)
    ).map((cat) => cat.label[lang] || cat.label.az);

    let suggestion =
      lang === 'en'
        ? 'Your wardrobe is balanced across core categories.'
        : lang === 'ru'
        ? 'Гардероб сбалансирован по основным категориям.'
        : 'Qarderobun bütün əsas kateqoriyalar üzrə balanslıdır.';

    if (missingCategories.length > 0) {
      suggestion =
        lang === 'en'
          ? `Missing categories for full outfits: ${missingCategories.join(', ')}.`
          : lang === 'ru'
          ? `Не хватает категорий для полного образа: ${missingCategories.join(', ')}.`
          : `Tam kombinlər üçün çatışmayan kateqoriya: ${missingCategories.join(', ')}.`;
    } else if (!hasWaterproof) {
      suggestion =
        lang === 'en'
          ? 'Consider adding at least 1 waterproof outer layer or shoe for rainy days.'
          : lang === 'ru'
          ? 'Добавьте хотя бы 1 влагозащитную вещь для дождливых дней.'
          : 'Yağışlı günlər üçün qarderobuna ən azı 1 suya davamlı üst örtük və ya ayaqqabı əlavə etməyin tövsiyə olunur.';
    }

    return {
      total: items.length,
      avgWarmth,
      waterproofCount: items.filter((i) => i.waterproof).length,
      suggestion,
    };
  }, [items, lang]);

  const fetchWeatherByCoords = useCallback(async (lat, lon, label) => {
    setLoadingWeather(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&forecast_days=1&timezone=auto`
      );
      const data = await res.json();
      if (data?.current) {
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

        setLiveRawWeather({
          locationName: label,
          temp: Math.round(data.current.temperature_2m),
          apparent: Math.round(data.current.apparent_temperature),
          wind: data.current.wind_speed_10m,
          code: data.current.weather_code,
          hourlyForecast,
        });
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
          WORLD_CITIES.find((c) => c.name === selectedCity) || WORLD_CITIES[0];
        fetchWeatherByCoords(fallback.lat, fallback.lon, `${fallback.name} (${fallback.code})`);
      },
      { timeout: 8000 }
    );
  }, [fetchWeatherByCoords, selectedCity, tx, lang]);

  const handleCitySelect = (cityName) => {
    setDemoPresetId('live');
    setSelectedCity(cityName);
    const cityObj = WORLD_CITIES.find((c) => c.name === cityName);
    if (cityObj) {
      const displayCity = cityObj.nameByLang ? cityObj.nameByLang[lang] || cityObj.name : cityObj.name;
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
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          q
        )}&count=1&language=${lang === 'ru' ? 'ru' : lang === 'en' ? 'en' : 'en'}&format=json`
      );
      const geoData = await geoRes.json();
      const place = geoData?.results?.[0];
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
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          q
        )}&count=1&language=${lang === 'ru' ? 'ru' : lang === 'en' ? 'en' : 'en'}&format=json`
      );
      const geoData = await geoRes.json();
      const place = geoData?.results?.[0];
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
      await fetchWeeklyForecast(entry.lat, entry.lon);
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
    await fetchWeeklyForecast(entry.lat, entry.lon);
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
  }, [initLocationOnLogin]);

  useEffect(() => {
    if (activeWeather && items.length > 0) {
      setRecommendedOutfit((prev) =>
        buildSmartOutfit(items, activeWeather, outfitStyleFilter, lockedSlots, prev, {}, lang)
      );
      setOutfitAnimKey((k) => k + 1);
    } else {
      setRecommendedOutfit(null);
    }
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

      const fileInput = document.getElementById('clothes-file-input');
      if (fileInput) fileInput.value = '';

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
      ? 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800'
      : 'bg-white text-zinc-700 hover:text-zinc-900 border-stone-200',
    pillActive: isDark ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white',
    focusRing: isDark
      ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900'
      : 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    errorBanner: isDark
      ? 'bg-red-500/15 border-red-500/40 text-red-300'
      : 'bg-red-50 border-red-300 text-red-800',
    successBanner: isDark
      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
      : 'bg-emerald-50 border-emerald-300 text-emerald-800',
    emeraldText: isDark ? 'text-emerald-300' : 'text-emerald-800',
    emeraldPill: isDark
      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/35'
      : 'bg-emerald-50 text-emerald-800 border border-emerald-700/25',
    emeraldBtn: isDark
      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/40 text-emerald-300'
      : 'bg-emerald-100 hover:bg-emerald-200 border-emerald-400 text-emerald-900',
    amberBanner: isDark
      ? 'bg-amber-500/15 border-amber-500/35 text-amber-300'
      : 'bg-amber-50 border-amber-300 text-amber-900',
    amberLocked: isDark
      ? 'bg-amber-400/20 text-amber-300 font-semibold'
      : 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold',
    skyText: isDark ? 'text-sky-300' : 'text-sky-800',
    skyBadge: isDark ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-100 text-sky-900',
    tealBadge: isDark ? 'bg-teal-500/15 text-teal-300' : 'bg-teal-100 text-teal-900',
  };

  const renderTopControls = () => (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label={tx.languageGroupLabel}
        className={`inline-flex items-center rounded-xl p-1 border text-xs ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-stone-200/70 border-stone-300'
        }`}
      >
        {[
          { id: 'az', label: 'AZ' },
          { id: 'en', label: 'EN' },
          { id: 'ru', label: 'RU' },
        ].map((l) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={lang === l.id}
            onClick={() => handleSelectLang(l.id)}
            className={`min-h-[32px] min-w-[36px] px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer active:scale-95 ${t.focusRing} ${
              lang === l.id ? 'bg-emerald-700 text-white shadow-xs' : t.muted
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div
        role="group"
        aria-label={tx.themeGroupLabel}
        className={`inline-flex items-center rounded-xl p-1 border text-xs ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-stone-200/70 border-stone-300'
        }`}
      >
        {[
          { id: 'auto', label: tx.auto },
          { id: 'light', label: tx.light },
          { id: 'dark', label: tx.dark },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={themeMode === m.id}
            onClick={() => handleSelectTheme(m.id)}
            className={`min-h-[32px] px-2.5 py-1 rounded-lg font-medium transition cursor-pointer active:scale-95 ${t.focusRing} ${
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
    </div>
  );

  if (loading) {
    return (
      <main className={`auth-shell min-h-screen ${t.page} flex items-center justify-center transition-colors duration-300`}>
        <p className={`${t.muted} animate-pulse`}>{tx.loading}</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={`auth-shell min-h-screen ${t.page} flex items-center justify-center p-6 transition-colors duration-300`}>
        <div className={`auth-card w-full max-w-md rounded-2xl ${t.card} border p-6 space-y-6 animate-outfit-in`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Geyin</h1>
              <p className={`text-sm ${t.muted} mt-1`}>
                {isRegister ? tx.registerSubtitle : tx.loginSubtitle}
              </p>
            </div>
            {renderTopControls()}
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className={`block text-sm ${t.subtext} mb-1.5`}>
                {tx.email}
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full rounded-xl ${t.surface} border px-3.5 py-2.5 text-sm ${t.focusRing}`}
              />
            </div>

            <div>
              <label htmlFor="auth-password" className={`block text-sm ${t.subtext} mb-1.5`}>
                {tx.password}
              </label>
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tx.passwordHint}
                className={`w-full rounded-xl ${t.surface} border px-3.5 py-2.5 text-sm ${t.focusRing}`}
              />
            </div>

            {error && (
              <div role="alert" className={`rounded-xl border p-3 text-xs ${t.errorBanner}`}>
                {error}
              </div>
            )}

            {message && (
              <div role="status" className={`rounded-xl border p-3 text-xs ${t.successBanner}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full min-h-[44px] rounded-xl ${t.pillActive} disabled:opacity-50 font-semibold py-2.5 text-sm transition cursor-pointer active:scale-[0.98] ${t.focusRing}`}
            >
              {submitting ? tx.pleaseWait : isRegister ? tx.signUp : tx.signIn}
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
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs ${t.muted} transition cursor-pointer ${t.focusRing}`}
            >
              {isRegister ? tx.haveAccount : tx.noAccount}
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
        { key: 'top', label: tx.slotLabels.top, item: recommendedOutfit.top },
        { key: 'bottom', label: tx.slotLabels.bottom, item: recommendedOutfit.bottom },
        ...(recommendedOutfit.outerwear || lockedSlots.outerwear
          ? [{ key: 'outerwear', label: tx.slotLabels.outerwear, item: recommendedOutfit.outerwear }]
          : []),
        { key: 'shoes', label: tx.slotLabels.shoes, item: recommendedOutfit.shoes },
        ...(recommendedOutfit.accessory || lockedSlots.accessory
          ? [{ key: 'accessory', label: tx.slotLabels.accessory, item: recommendedOutfit.accessory }]
          : []),
      ]
    : [];

  return (
    <main className={`app-shell min-h-screen ${t.page} p-4 md:p-8 transition-colors duration-300`} data-theme={isDark ? 'dark' : 'light'}>
      <div className="app-content max-w-6xl mx-auto space-y-6">
        {/* Top bar */}
        <header className={`app-header flex flex-wrap items-center justify-between gap-4 border-b ${t.border} pb-5`}>
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              G
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Geyin</h1>
              <p className={`text-xs ${t.muted} mt-1`}>{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {renderTopControls()}
            <button
              type="button"
              onClick={handleLogout}
              className={`min-h-[36px] rounded-xl ${t.card} border px-4 py-2 text-xs font-medium transition cursor-pointer active:scale-95 ${t.focusRing}`}
            >
              {tx.logout}
            </button>
          </div>
        </header>

        {/* Tabs switcher */}
        <div role="tablist" className="app-tabs flex flex-wrap gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'today'}
            onClick={() => setActiveTab('today')}
            className={`app-tab rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer active:scale-95 ${t.focusRing} ${
              activeTab === 'today' ? t.pillActive : `${t.pillIdle} border`
            }`}
          >
            {tx.tabToday}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'travel'}
            onClick={() => setActiveTab('travel')}
            className={`app-tab rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer active:scale-95 ${t.focusRing} ${
              activeTab === 'travel' ? t.pillActive : `${t.pillIdle} border`
            }`}
          >
            {tx.tabTravel}
          </button>
        </div>

        {error && (
          <div role="alert" className={`rounded-xl border p-3.5 text-sm animate-outfit-in ${t.errorBanner}`}>
            {error}
          </div>
        )}

        {message && (
          <div role="status" className={`rounded-xl border p-3.5 text-sm animate-outfit-in ${t.successBanner}`}>
            {message}
          </div>
        )}

        {activeTab === 'travel' ? (
          <section className={`app-panel rounded-2xl ${t.hero} border p-6 space-y-6 animate-outfit-in`}>
            <div>
              <h2 className="text-xl font-bold">{tx.travelTitle}</h2>
              <p className={`text-xs ${t.muted} mt-1`}>{tx.travelSubtitle}</p>
            </div>

            <form onSubmit={handleAddTravelCity} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2 flex items-end">
                <label htmlFor="travel-city-input" className="sr-only">
                  {tx.travelInputPlaceholder}
                </label>
                <input
                  id="travel-city-input"
                  type="text"
                  required
                  value={travelCityInput}
                  onChange={(e) => setTravelCityInput(e.target.value)}
                  placeholder={tx.travelInputPlaceholder}
                  className={`w-full rounded-xl ${t.surface} border px-3.5 py-2.5 text-xs ${t.focusRing}`}
                />
              </div>
              <div>
                <label htmlFor="travel-days-input" className={`block text-[11px] ${t.muted} mb-1`}>
                  {tx.travelDaysLabel}
                </label>
                <input
                  id="travel-days-input"
                  type="number"
                  min={1}
                  max={14}
                  value={travelDaysInput}
                  onChange={(e) => setTravelDaysInput(e.target.value)}
                  className={`w-full rounded-xl ${t.surface} border px-3.5 py-2 text-xs ${t.focusRing}`}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={savingTravelCity}
                  className={`w-full min-h-[42px] rounded-xl ${t.pillActive} disabled:opacity-50 px-4 py-2.5 text-xs font-semibold transition cursor-pointer active:scale-95 ${t.focusRing}`}
                >
                  {savingTravelCity ? tx.searching : tx.travelSaveBtn}
                </button>
              </div>
              <div className="md:col-span-4">
                <label htmlFor="travel-note-input" className="sr-only">
                  {tx.travelNotePlaceholder}
                </label>
                <input
                  id="travel-note-input"
                  type="text"
                  value={travelNoteInput}
                  onChange={(e) => setTravelNoteInput(e.target.value)}
                  placeholder={tx.travelNotePlaceholder}
                  className={`w-full rounded-xl ${t.surface} border px-3.5 py-2.5 text-xs ${t.focusRing}`}
                />
              </div>
            </form>

            {/* 1-Week Forecast */}
            {activeTravelPlan && (
              <div className={`space-y-3 pt-4 border-t ${t.border}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">
                    {tx.weeklyForecastTitle} — {activeTravelPlan.label} ({activeTravelPlan.days || 3}{' '}
                    {tx.daysUnit})
                  </h3>
                  {activeTravelPlan.note && (
                    <span className={`text-xs ${t.muted}`}>{activeTravelPlan.note}</span>
                  )}
                </div>

                {loadingWeekly ? (
                  <p className={`text-xs ${t.muted}`}>{tx.checkingWeather}</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                    {weeklyForecast.map((day) => (
                      <div
                        key={day.date}
                        className={`rounded-xl ${t.surface} border p-3 text-center space-y-1`}
                      >
                        <p className={`text-[11px] font-semibold ${t.subtext}`}>{day.date}</p>
                        <p className="text-sm font-bold">
                          {day.maxTemp}° / {day.minTemp}°
                        </p>
                        <p className={`text-[11px] font-medium ${t.skyText}`}>💧 {day.rainProb}%</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Suitcase Items */}
            {activeTravelPlan && (
              <div className={`space-y-3 pt-4 border-t ${t.border}`}>
                <div>
                  <h3 className="text-sm font-semibold">{tx.suitcaseTitle}</h3>
                  <p className={`text-xs ${t.muted} mt-0.5`}>
                    {activeTravelPlan.days || 3} {tx.suitcaseSummary}
                  </p>
                  {suitcasePlan.note && (
                    <p className={`text-xs font-medium ${t.emeraldText} mt-1`}>{suitcasePlan.note}</p>
                  )}
                </div>

                {suitcasePlan.suggestedItems.length === 0 ? (
                  <p className={`text-xs ${t.muted}`}>{tx.emptySuitcaseMsg}</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {suitcasePlan.suggestedItems.map((piece) => (
                      <div
                        key={piece.id}
                        className={`rounded-xl ${t.surface} border overflow-hidden flex flex-col`}
                      >
                        <img
                          src={piece.image_url}
                          alt={piece.sub_category || getCategoryLabel(piece.category)}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2.5 space-y-1">
                          <p className="text-[11px] font-semibold truncate">
                            {getCategoryLabel(piece.category)}
                          </p>
                          <p className="text-xs font-medium truncate">
                            {piece.sub_category || piece.color || '-'}
                          </p>
                          <p className={`text-[11px] ${t.muted}`}>
                            {tx.warmthShort} {piece.warmth_level}/5
                            {piece.waterproof ? ` • ${tx.waterproofBadge}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Saved Travel Cities */}
            <div className={`space-y-3 pt-4 border-t ${t.border}`}>
              <h3 className="text-sm font-semibold">{tx.travelSavedListTitle}</h3>
              {travelCities.length === 0 ? (
                <p className={`text-xs ${t.muted}`}>{tx.travelEmptyMsg}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {travelCities.map((c) => (
                    <div
                      key={c.id}
                      className={`rounded-xl ${t.surface} border p-3.5 flex items-center justify-between gap-3`}
                    >
                      <div>
                        <p className="text-xs font-semibold">
                          {c.label} • {c.days || 3} {tx.daysUnit}
                        </p>
                        {c.note && <p className={`text-[11px] ${t.muted} mt-0.5`}>{c.note}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSelectSavedTravelCity(c)}
                          className={`min-h-[32px] rounded-lg px-3 py-1 text-xs font-medium cursor-pointer transition active:scale-95 ${t.emeraldPill} ${t.focusRing}`}
                        >
                          {tx.useCityBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveTravelCity(c.id)}
                          className={`min-h-[32px] rounded-lg px-2.5 py-1 text-xs ${t.muted} hover:text-red-500 cursor-pointer transition ${t.focusRing}`}
                        >
                          {tx.removeCityBtn}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          /* Weather & Smart Outfit Section */
          <section className={`app-panel rounded-2xl ${t.hero} border p-6 space-y-6 transition-all duration-300`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className={`text-[11px] uppercase tracking-wider ${t.muted}`}>
                  {tx.liveWeatherTitle} • {locationSource} ({locationMode.toUpperCase()})
                </span>
                <h2 className="text-xl font-bold mt-1">
                  {loadingWeather && demoPresetId === 'live'
                    ? tx.checkingWeather
                    : activeWeather
                    ? `${activeWeather.locationName}: ${activeWeather.temp}°C (${activeWeather.conditionText})`
                    : tx.chooseLocation}
                </h2>
                {activeWeather && (
                  <p className={`text-xs ${t.muted} mt-1`}>
                    {tx.feelsLike}: {activeWeather.apparent}°C • {tx.dailyRange}:{' '}
                    {activeWeather.minTemp}°C / {activeWeather.maxTemp}°C • {tx.wind}:{' '}
                    {Math.round(activeWeather.wind)} {tx.kmh}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={detectGpsLocation}
                  className={`min-h-[38px] rounded-xl ${t.pillActive} px-3.5 py-2 text-xs font-semibold transition cursor-pointer active:scale-95 ${t.focusRing}`}
                >
                  {tx.gpsBtn}
                </button>

                <label htmlFor="city-select" className="sr-only">
                  {tx.chooseLocation}
                </label>
                <select
                  id="city-select"
                  value={selectedCity}
                  onChange={(e) => handleCitySelect(e.target.value)}
                  className={`rounded-xl ${t.surface} border px-3 py-2 text-xs ${t.focusRing}`}
                >
                  {WORLD_CITIES.map((city) => (
                    <option key={`${city.name}-${city.code}`} value={city.name}>
                      {city.nameByLang ? city.nameByLang[lang] || city.name : city.name} ({city.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handleWorldCitySearch} className="flex flex-wrap gap-2">
              <label htmlFor="city-search-input" className="sr-only">
                {tx.searchCityPlaceholder}
              </label>
              <input
                id="city-search-input"
                type="text"
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                placeholder={tx.searchCityPlaceholder}
                className={`flex-1 min-w-[210px] rounded-xl ${t.surface} border px-3.5 py-2 text-xs ${t.focusRing}`}
              />
              <button
                type="submit"
                disabled={searchingCity}
                className={`min-h-[38px] rounded-xl ${t.card} border px-4 py-2 text-xs font-medium transition cursor-pointer active:scale-95 ${t.focusRing}`}
              >
                {searchingCity ? tx.searching : tx.searchBtn}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className={`text-[11px] ${t.muted} mr-1`}>{tx.demoMode}</span>
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={demoPresetId === preset.id}
                  onClick={() => setDemoPresetId(preset.id)}
                  className={`min-h-[32px] rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer active:scale-95 ${t.focusRing} ${
                    demoPresetId === preset.id ? t.emeraldPill : `${t.pillIdle} border`
                  }`}
                >
                  {preset.label[lang] || preset.label.az}
                </button>
              ))}
            </div>

            {activeWeather && (
              <div className="space-y-2.5">
                <div className={`rounded-xl ${t.surface} border p-4`}>
                  <p className={`text-xs font-semibold ${t.subtext} mb-1`}>
                    {tx.generalAdviceTitle}
                  </p>
                  <p className="text-sm leading-relaxed">{activeWeather.generalAdvice}</p>
                </div>

                {activeWeather.eveningAlert && (
                  <div className={`rounded-xl border px-4 py-3 text-xs font-medium ${t.amberBanner}`}>
                    {activeWeather.eveningAlert}
                  </div>
                )}
              </div>
            )}

            <div className={`space-y-4 pt-2 border-t ${t.border}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{tx.todayOutfitTitle}</h3>
                  {recommendedOutfit?.explanation ? (
                    <p className={`text-xs font-medium ${t.emeraldText} mt-0.5`}>
                      {tx.whyOutfit} {recommendedOutfit.explanation}
                    </p>
                  ) : (
                    <p className={`text-xs ${t.muted}`}>{tx.defaultOutfitSub}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor="outfit-style-select" className="sr-only">
                    {tx.styleLabel}
                  </label>
                  <select
                    id="outfit-style-select"
                    value={outfitStyleFilter}
                    onChange={(e) => setOutfitStyleFilter(e.target.value)}
                    className={`rounded-xl ${t.surface} border px-3 py-2 text-xs ${t.focusRing}`}
                  >
                    <option value="all">{tx.allStyles}</option>
                    {STYLES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label[lang] || st.label.az}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={!activeWeather || items.length === 0}
                    onClick={handleRegenerateOutfit}
                    className={`min-h-[38px] rounded-xl ${t.card} disabled:opacity-40 border px-3.5 py-2 text-xs font-medium transition cursor-pointer active:scale-95 ${t.focusRing}`}
                  >
                    {tx.generateAnother}
                  </button>

                  <button
                    type="button"
                    disabled={!recommendedOutfit}
                    onClick={handleSaveCurrentOutfit}
                    className={`min-h-[38px] rounded-xl disabled:opacity-40 border px-3.5 py-2 text-xs font-medium transition cursor-pointer active:scale-95 ${t.emeraldBtn} ${t.focusRing}`}
                  >
                    {tx.saveOutfit}
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className={`rounded-xl ${t.surface} border p-5 text-center text-xs ${t.muted}`}>
                  {tx.emptyWardrobeOutfit}
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
                              aria-pressed={isLocked}
                              onClick={() => toggleLockSlot(slot.key)}
                              className={`min-h-[28px] min-w-[44px] text-xs px-2.5 py-1 rounded-lg transition cursor-pointer active:scale-95 ${t.focusRing} ${
                                isLocked ? t.amberLocked : `${t.muted} hover:bg-zinc-500/10`
                              }`}
                            >
                              {isLocked ? tx.locked : tx.lock}
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
                                  {slot.item.sub_category || getCategoryLabel(slot.item.category)}
                                </p>
                                <p className={`text-[11px] ${t.muted}`}>
                                  {slot.item.color ? `${slot.item.color} • ` : ''}
                                  {tx.warmthShort} {slot.item.warmth_level}/5
                                </p>
                              </div>
                            </div>

                            {!isLocked && (
                              <div className="px-2.5 pb-2.5">
                                <button
                                  type="button"
                                  onClick={() => regenerateSingleSlot(slot.key)}
                                  className={`w-full min-h-[36px] rounded-lg ${t.card} border py-1.5 px-3 text-xs font-medium ${t.subtext} transition cursor-pointer active:scale-95 ${t.focusRing}`}
                                >
                                  {tx.swap}
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`flex-1 flex items-center justify-center p-4 text-center text-[11px] ${t.muted} min-h-[160px]`}>
                            {tx.notFoundInSlot}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Wardrobe Insights Panel */}
        {wardrobeInsights && (
          <section className={`app-panel rounded-2xl ${t.card} border p-5 flex flex-wrap items-center justify-between gap-4 animate-outfit-in`}>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className={`text-[11px] ${t.muted}`}>{tx.totalItems}</p>
                <p className="text-lg font-bold">
                  {wardrobeInsights.total} {tx.piecesUnit}
                </p>
              </div>
              <div>
                <p className={`text-[11px] ${t.muted}`}>{tx.avgWarmth}</p>
                <p className="text-lg font-bold">{wardrobeInsights.avgWarmth} / 5</p>
              </div>
              <div>
                <p className={`text-[11px] ${t.muted}`}>{tx.waterproofCount}</p>
                <p className="text-lg font-bold">
                  {wardrobeInsights.waterproofCount} {tx.piecesUnit}
                </p>
              </div>
            </div>
            <p className={`text-xs ${t.subtext} max-w-md`}>{wardrobeInsights.suggestion}</p>
          </section>
        )}

        {/* Saved Outfits */}
        {savedOutfits.length > 0 && (
          <section className={`app-panel rounded-2xl ${t.card} border p-6 space-y-4 animate-outfit-in`}>
            <h2 className="text-lg font-semibold">
              {tx.savedOutfitsTitle} ({savedOutfits.length})
            </h2>
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
                          className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs ${t.emeraldText} hover:underline font-medium transition cursor-pointer ${t.focusRing}`}
                        >
                          {tx.loadBtn}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteSavedOutfit(saved.id)}
                        className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs ${t.muted} hover:text-red-500 transition cursor-pointer ${t.focusRing}`}
                      >
                        {tx.deleteBtn}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {saved.pieces.map((p, idx) => (
                      <img
                        key={`${saved.id}-${idx}`}
                        src={p.image_url}
                        alt={p.sub_category || getCategoryLabel(p.category)}
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
        <section className={`app-panel rounded-2xl ${t.card} border p-6`}>
          <h2 className="text-lg font-semibold mb-4">{tx.addNewItemTitle}</h2>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2.5">
              <label htmlFor="clothes-file-input" className={`block text-xs ${t.muted}`}>
                {tx.photoLabel}
              </label>
              <input
                id="clothes-file-input"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="sr-only peer"
              />
              <div
                className={`w-full rounded-xl ${t.surface} border px-3.5 py-2 text-sm flex items-center gap-3 peer-focus-visible:ring-2 ${
                  isDark ? 'peer-focus-visible:ring-emerald-300' : 'peer-focus-visible:ring-emerald-700'
                }`}
              >
                <label
                  htmlFor="clothes-file-input"
                  className={`min-h-[36px] inline-flex items-center rounded-lg ${t.pillActive} px-3 py-1.5 text-xs font-medium cursor-pointer transition active:scale-95 shrink-0`}
                >
                  {tx.chooseFileBtn}
                </label>
                <span className={`text-xs ${t.muted} truncate`}>
                  {imageFile ? imageFile.name : tx.noFileChosen}
                </span>
              </div>
              {imagePreviewUrl && (
                <div className="flex items-center gap-3 pt-1 animate-outfit-in">
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className={`w-16 h-20 rounded-xl object-cover border ${t.border}`}
                  />
                  <span className={`text-xs ${t.muted}`}>{tx.previewReady}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="item-category" className={`block text-xs ${t.muted} mb-1.5`}>
                {tx.categoryLabel}
              </label>
              <select
                id="item-category"
                value={typeof category === 'string' ? category : category?.value}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full rounded-xl ${t.surface} border px-3.5 py-2.5 text-sm ${t.focusRing}`}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label[lang] || cat.label.az}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="item-subcategory" className={`block text-xs ${t.muted} mb-1.5`}>
                {tx.subCategoryLabel}
              </label>
              <input
                id="item-subcategory"
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder={tx.subCategoryPlaceholder}
                className={`w-full rounded-xl ${t.surface} border px-3.5 py-2.5 text-sm ${t.focusRing}`}
              />
            </div>

            <div>
              <label htmlFor="item-color" className={`block text-xs ${t.muted} mb-1.5`}>
                {tx.colorLabel}
              </label>
              <input
                id="item-color"
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder={tx.colorPlaceholder}
                className={`w-full rounded-xl ${t.surface} border px-3.5 py-2.5 text-sm ${t.focusRing}`}
              />
            </div>

            <div>
              <label htmlFor="item-style" className={`block text-xs ${t.muted} mb-1.5`}>
                {tx.styleLabel}
              </label>
              <select
                id="item-style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className={`w-full rounded-xl ${t.surface} border px-3.5 py-2.5 text-sm ${t.focusRing}`}
              >
                {STYLES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label[lang] || st.label.az}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <div className={`flex items-center justify-between text-xs ${t.muted} mb-1.5`}>
                <label htmlFor="item-warmth">{tx.warmthSlider}</label>
                <span className="font-semibold">{warmthLevel} / 5</span>
              </div>
              <input
                id="item-warmth"
                type="range"
                min={1}
                max={5}
                value={warmthLevel}
                onChange={(e) => setWarmthLevel(e.target.value)}
                className={`w-full cursor-pointer rounded ${t.focusRing}`}
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-6 pt-1">
              <label
                htmlFor="item-waterproof"
                className={`min-h-[32px] flex items-center gap-2 text-sm ${t.subtext} cursor-pointer`}
              >
                <input
                  id="item-waterproof"
                  type="checkbox"
                  checked={waterproof}
                  onChange={(e) => setWaterproof(e.target.checked)}
                  className={`h-4 w-4 rounded ${t.focusRing}`}
                />
                {tx.waterproofCheck}
              </label>

              <label
                htmlFor="item-windproof"
                className={`min-h-[32px] flex items-center gap-2 text-sm ${t.subtext} cursor-pointer`}
              >
                <input
                  id="item-windproof"
                  type="checkbox"
                  checked={windproof}
                  onChange={(e) => setWindproof(e.target.checked)}
                  className={`h-4 w-4 rounded ${t.focusRing}`}
                />
                {tx.windproofCheck}
              </label>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={uploading}
                className={`w-full md:w-auto min-h-[44px] rounded-xl ${t.pillActive} disabled:opacity-50 font-semibold px-6 py-2.5 text-sm transition cursor-pointer active:scale-[0.98] ${t.focusRing}`}
              >
                {uploading ? tx.uploadingBtn : tx.addToWardrobeBtn}
              </button>
            </div>
          </form>
        </section>

        {/* Wardrobe list */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {tx.myItemsTitle} ({filteredItems.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={selectedCategoryFilter === 'Hamısı'}
                onClick={() => setSelectedCategoryFilter('Hamısı')}
                className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-medium transition cursor-pointer active:scale-95 ${t.focusRing} ${
                  selectedCategoryFilter === 'Hamısı' ? t.pillActive : `${t.pillIdle} border`
                }`}
              >
                {tx.allFilter}
              </button>

              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.value}
                  aria-pressed={selectedCategoryFilter === cat.value}
                  onClick={() => setSelectedCategoryFilter(cat.value)}
                  className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-medium transition cursor-pointer active:scale-95 ${t.focusRing} ${
                    selectedCategoryFilter === cat.value ? t.pillActive : `${t.pillIdle} border`
                  }`}
                >
                  {cat.label[lang] || cat.label.az}
                </button>
              ))}
            </div>
          </div>

          {loadingItems ? (
            <p className={`text-sm ${t.muted}`}>{tx.loadingWardrobe}</p>
          ) : filteredItems.length === 0 ? (
            <div className={`rounded-2xl ${t.card} border p-8 text-center text-sm ${t.muted}`}>
              {tx.emptyCategoryMsg}
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
                      alt={item.sub_category || getCategoryLabel(item.category)}
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-3.5 space-y-1.5">
                      <p className="text-xs font-semibold">{getCategoryLabel(item.category)}</p>
                      {item.sub_category && (
                        <p className={`text-xs ${t.subtext}`}>{item.sub_category}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.color && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-md ${t.surface} border ${t.subtext}`}
                          >
                            {item.color}
                          </span>
                        )}
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-md ${t.surface} border ${t.subtext}`}
                        >
                          {tx.warmthShort}: {item.warmth_level}/5
                        </span>
                        {item.waterproof && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${t.skyBadge}`}>
                            {tx.waterproofBadge}
                          </span>
                        )}
                        {item.windproof && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${t.tealBadge}`}>
                            {tx.windproofBadge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-3.5 pb-3">
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item)}
                      className={`w-full min-h-[36px] rounded-lg ${t.surface} hover:bg-red-500/15 border hover:border-red-500/30 py-2 text-xs ${t.muted} hover:text-red-500 transition cursor-pointer active:scale-95 ${t.focusRing}`}
                    >
                      {tx.deleteBtn}
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