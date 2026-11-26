import { CATEGORIES } from './i18n';

export const NEUTRAL_KEYWORDS = [
  'qara', 'ağ', 'ag', 'bej', 'boz', 'krem', 'qəhvəyi', 'qehveyi',
  'tünd göy', 'göy', 'goy', 'cins', 'xaki', 'black', 'white',
  'beige', 'gray', 'grey', 'navy', 'brown', 'черный', 'чёрный',
  'белый', 'бежевый', 'серый', 'синий', 'коричневый',
];

export function isNeutralColor(colorStr) {
  if (!colorStr) return true;
  const lower = colorStr.toLowerCase().trim();
  return NEUTRAL_KEYWORDS.some((kw) => lower.includes(kw));
}

export function getColorHarmonyBonus(colorA, colorB) {
  if (!colorA || !colorB) return 10;
  const a = colorA.toLowerCase().trim();
  const b = colorB.toLowerCase().trim();
  if (isNeutralColor(a) || isNeutralColor(b)) return 22;
  if (a === b) return 16;
  return 4;
}

export function buildOutfitExplanation(outfit, weatherInfo, lang = 'az') {
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

export function buildSmartOutfit(
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

export function buildSuitcasePlan(items, weeklyDays, tripDays, lang = 'az') {
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
  const topCount = Math.min(
    items.filter((i) => i.category === 'Üst geyim').length,
    Math.max(1, Math.min(7, clampedDays))
  );
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

export function computeWardrobeInsights(items, lang = 'az') {
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
}
