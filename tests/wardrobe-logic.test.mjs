import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getColorHarmonyBonus,
  findNearestCity,
  interpretWeather,
  buildSmartOutfit,
  buildSuitcasePlan,
} from '../lib/wardrobe-logic.js';

describe('getColorHarmonyBonus', () => {
  it('returns neutral bonus when either color is neutral', () => {
    assert.equal(getColorHarmonyBonus('Qara', 'Qırmızı'), 22);
    assert.equal(getColorHarmonyBonus('Green', 'Beige'), 22);
    assert.equal(getColorHarmonyBonus('Белый', 'Синий'), 22);
  });

  it('returns matching bonus for identical non-neutral colors', () => {
    assert.equal(getColorHarmonyBonus('Qırmızı', 'qırmızı '), 16);
  });

  it('returns lower bonus for clashing non-neutral colors and fallback for missing colors', () => {
    assert.equal(getColorHarmonyBonus('Qırmızı', 'Yaşıl'), 4);
    assert.equal(getColorHarmonyBonus('', 'Qırmızı'), 10);
    assert.equal(getColorHarmonyBonus(null, null), 10);
  });
});

describe('findNearestCity', () => {
  it('resolves nearest known city in the requested language', () => {
    assert.equal(findNearestCity(40.41, 49.87, 'az'), 'Bakı');
    assert.equal(findNearestCity(40.41, 49.87, 'en'), 'Baku');
    assert.equal(findNearestCity(40.41, 49.87, 'ru'), 'Баку');
    assert.equal(findNearestCity(51.51, -0.13, 'en'), 'London');
  });

  it('falls back to formatted GPS coordinates when far from built-in cities', () => {
    assert.equal(findNearestCity(0, 0, 'az'), 'GPS Məkanı (0.00, 0.00)');
    assert.equal(findNearestCity(0, 0, 'en'), 'GPS Location (0.00, 0.00)');
    assert.equal(findNearestCity(0, 0, 'ru'), 'GPS точка (0.00, 0.00)');
  });
});

describe('interpretWeather', () => {
  it('detects snowy, cold, windy weather and recommends outerwear', () => {
    const res = interpretWeather(73, 0, 30, { minTemp: -3, maxTemp: 2, rainProb: 90 }, 'en');
    assert.equal(res.conditionText, 'Snowy');
    assert.equal(res.isRainy, true);
    assert.equal(res.isWindy, true);
    assert.equal(res.idealWarmth, 5);
    assert.equal(res.needOuterwear, true);
    assert.match(res.generalAdvice, /waterproof/i);
    assert.match(res.generalAdvice, /windproof/i);
  });

  it('detects hot sunny weather without requiring outerwear', () => {
    const res = interpretWeather(0, 29, 8, { minTemp: 23, maxTemp: 31, rainProb: 0 }, 'az');
    assert.equal(res.conditionText, 'Günəşli və açıq');
    assert.equal(res.isRainy, false);
    assert.equal(res.isWindy, false);
    assert.equal(res.idealWarmth, 1);
    assert.equal(res.needOuterwear, false);
    assert.equal(res.eveningAlert, null);
  });

  it('adds evening drop alert and triggers needOuterwear when temperature drops sharply', () => {
    const res = interpretWeather(1, 20, 10, { minTemp: 12, maxTemp: 22, rainProb: 10 }, 'en');
    assert.equal(res.needOuterwear, true);
    assert.match(res.eveningAlert, /drop to 12°C/i);
  });

  it('adds precipitation probability alert when not currently raining but rainProb >= 55', () => {
    const res = interpretWeather(2, 21, 10, { minTemp: 17, maxTemp: 22, rainProb: 65 }, 'ru');
    assert.equal(res.isRainy, true);
    assert.match(res.eveningAlert, /65%/);
  });
});

describe('buildSmartOutfit', () => {
  const sampleItems = [
    { id: 't1', category: 'Üst geyim', color: 'Qara', warmth_level: 4, style: 'gundelik', waterproof: false, windproof: false },
    { id: 't2', category: 'Üst geyim', color: 'Ağ', warmth_level: 1, style: 'klassik', waterproof: false, windproof: false },
    { id: 'b1', category: 'Alt geyim', color: 'Qara', warmth_level: 4, style: 'gundelik', waterproof: false, windproof: false },
    { id: 'b2', category: 'Alt geyim', color: 'Bej', warmth_level: 2, style: 'klassik', waterproof: false, windproof: false },
    { id: 'o1', category: 'Üst örtük (Gödəkçə/Palto)', color: 'Qara', warmth_level: 4, style: 'gundelik', waterproof: true, windproof: true },
    { id: 's1', category: 'Ayaqqabı', color: 'Qara', warmth_level: 4, style: 'gundelik', waterproof: true, windproof: false },
    { id: 'a1', category: 'Aksesuar', color: 'Boz', warmth_level: 3, style: 'gundelik', waterproof: false, windproof: false },
  ];

  it('returns null for empty wardrobe or missing weather', () => {
    assert.equal(buildSmartOutfit([], { idealWarmth: 3 }, 'all'), null);
    assert.equal(buildSmartOutfit(sampleItems, null, 'all'), null);
  });

  it('picks deterministic outfit using injected randomFn and respects rain/warmth', () => {
    const rainyCold = {
      temp: 8,
      idealWarmth: 4,
      isRainy: true,
      isWindy: true,
      needOuterwear: true,
    };
    const outfit = buildSmartOutfit(sampleItems, rainyCold, 'gundelik', {}, null, {}, 'en', () => 0);
    assert.equal(outfit.top.id, 't1');
    assert.equal(outfit.bottom.id, 'b1');
    assert.equal(outfit.outerwear.id, 'o1');
    assert.equal(outfit.shoes.id, 's1');
    assert.equal(outfit.accessory.id, 'a1');
    assert.match(outfit.explanation, /waterproof/i);
  });

  it('preserves locked slots even when other items score higher', () => {
    const lockedCurrent = { top: sampleItems[1] };
    const weather = { temp: 8, idealWarmth: 4, isRainy: false, isWindy: false, needOuterwear: true };
    const outfit = buildSmartOutfit(
      sampleItems,
      weather,
      'gundelik',
      { top: true },
      lockedCurrent,
      {},
      'az',
      () => 0
    );
    assert.equal(outfit.top.id, 't2');
  });

  it('excludes specified slot item when alternatives exist, and keeps when only 1 item exists', () => {
    const weather = { temp: 8, idealWarmth: 4, isRainy: false, isWindy: false, needOuterwear: false };
    const outfit = buildSmartOutfit(
      sampleItems,
      weather,
      'all',
      {},
      null,
      { top: 't1', shoes: 's1' },
      'en',
      () => 0
    );
    assert.equal(outfit.top.id, 't2');
    assert.equal(outfit.shoes.id, 's1');
    assert.equal(outfit.outerwear, null);
  });
});

describe('buildSuitcasePlan', () => {
  const wardrobe = [
    { id: 't1', category: 'Üst geyim', warmth_level: 2, waterproof: false, windproof: false },
    { id: 't2', category: 'Üst geyim', warmth_level: 4, waterproof: false, windproof: false },
    { id: 't3', category: 'Üst geyim', warmth_level: 5, waterproof: false, windproof: false },
    { id: 'b1', category: 'Alt geyim', warmth_level: 3, waterproof: false, windproof: false },
    { id: 'o1', category: 'Üst örtük (Gödəkçə/Palto)', warmth_level: 4, waterproof: true, windproof: true },
    { id: 'o2', category: 'Üst örtük (Gödəkçə/Palto)', warmth_level: 2, waterproof: false, windproof: false },
    { id: 's1', category: 'Ayaqqabı', warmth_level: 3, waterproof: true, windproof: false },
    { id: 's2', category: 'Ayaqqabı', warmth_level: 2, waterproof: false, windproof: false },
  ];

  it('returns empty plan for empty wardrobe', () => {
    assert.deepEqual(buildSuitcasePlan([], [], 5, 'en'), { suggestedItems: [], note: '' });
  });

  it('prioritizes waterproof items and includes 2 outerwear pieces on rainy week', () => {
    const rainyWeek = [
      { maxTemp: 14, minTemp: 9, rainProb: 80 },
      { maxTemp: 13, minTemp: 8, rainProb: 70 },
    ];
    const plan = buildSuitcasePlan(wardrobe, rainyWeek, 5, 'en');
    const outerwears = plan.suggestedItems.filter(
      (i) => i.category === 'Üst örtük (Gödəkçə/Palto)'
    );
    const shoes = plan.suggestedItems.filter((i) => i.category === 'Ayaqqabı');
    assert.equal(outerwears.length, 2);
    assert.equal(outerwears[0].id, 'o1');
    assert.equal(shoes.length, 2);
    assert.equal(shoes[0].id, 's1');
    assert.match(plan.note, /rain/i);
  });

  it('clamps trip days to [1, 14] and picks lighter pieces for warm dry week', () => {
    const warmWeek = [
      { maxTemp: 28, minTemp: 21, rainProb: 5 },
      { maxTemp: 29, minTemp: 22, rainProb: 10 },
    ];
    const plan = buildSuitcasePlan(wardrobe, warmWeek, 30, 'az');
    const tops = plan.suggestedItems.filter((i) => i.category === 'Üst geyim');
    assert.equal(tops[0].id, 't1');
    assert.match(plan.note, /mülayim\/isti/i);
  });
});
