'use client';

import { WORLD_CITIES, getCityDisplayName } from '@/lib/cities';
import { DEMO_PRESETS } from '@/lib/weather';
import OutfitGrid from './OutfitGrid';

export default function WeatherPanel({
  tx,
  lang,
  locationSource,
  locationMode,
  loadingWeather,
  demoPresetId,
  activeWeather,
  selectedCity,
  citySearchQuery,
  searchingCity,
  onDetectGpsLocation,
  onCitySelect,
  onCitySearchQueryChange,
  onWorldCitySearch,
  onSelectDemoPreset,
  items,
  recommendedOutfit,
  outfitAnimKey,
  lockedSlots,
  outfitStyleFilter,
  onStyleFilterChange,
  onRegenerateOutfit,
  onSaveCurrentOutfit,
  onToggleLockSlot,
  onRegenerateSingleSlot,
}) {
  return (
    <section className="app-panel rounded-2xl bg-gradient-to-br from-white via-stone-50 to-amber-50/60 border-stone-200 shadow-sm dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/80 dark:border-zinc-800 dark:shadow-none border p-6 space-y-6 transition-all duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
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
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              {tx.feelsLike}: {activeWeather.apparent}°C • {tx.dailyRange}:{' '}
              {activeWeather.minTemp}°C / {activeWeather.maxTemp}°C • {tx.wind}:{' '}
              {Math.round(activeWeather.wind)} {tx.kmh}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onDetectGpsLocation}
            className="rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-3.5 py-2 text-xs font-semibold transition cursor-pointer active:scale-95"
          >
            {tx.gpsBtn}
          </button>

          <select
            value={selectedCity}
            onChange={(e) => onCitySelect(e.target.value)}
            className="rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border px-3 py-2 text-xs focus:outline-none"
          >
            {WORLD_CITIES.map((city) => (
              <option key={`${city.name}-${city.code}`} value={city.name}>
                {getCityDisplayName(city, lang)} ({city.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={onWorldCitySearch} className="flex flex-wrap gap-2">
        <input
          type="text"
          value={citySearchQuery}
          onChange={(e) => onCitySearchQueryChange(e.target.value)}
          placeholder={tx.searchCityPlaceholder}
          className="flex-1 min-w-[210px] rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border px-3.5 py-2 text-xs focus:outline-none"
        />
        <button
          type="submit"
          disabled={searchingCity}
          className="rounded-xl bg-white border-stone-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none border px-4 py-2 text-xs font-medium transition cursor-pointer active:scale-95"
        >
          {searchingCity ? tx.searching : tx.searchBtn}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] text-zinc-600 dark:text-zinc-400 mr-1">{tx.demoMode}</span>
        {DEMO_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectDemoPreset(preset.id)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition cursor-pointer active:scale-95 ${
              demoPresetId === preset.id
                ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-700/20'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border-stone-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white dark:border-zinc-800 border'
            }`}
          >
            {preset.label[lang] || preset.label.az}
          </button>
        ))}
      </div>

      {activeWeather && (
        <div className="space-y-2.5">
          <div className="rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border p-4">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {tx.generalAdviceTitle}
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

      <OutfitGrid
        tx={tx}
        lang={lang}
        items={items}
        activeWeather={activeWeather}
        recommendedOutfit={recommendedOutfit}
        outfitAnimKey={outfitAnimKey}
        lockedSlots={lockedSlots}
        outfitStyleFilter={outfitStyleFilter}
        onStyleFilterChange={onStyleFilterChange}
        onRegenerateOutfit={onRegenerateOutfit}
        onSaveCurrentOutfit={onSaveCurrentOutfit}
        onToggleLockSlot={onToggleLockSlot}
        onRegenerateSingleSlot={onRegenerateSingleSlot}
      />
    </section>
  );
}
