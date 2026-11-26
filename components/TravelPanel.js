'use client';

import Image from 'next/image';
import { getCategoryLabel } from '@/lib/i18n';

export default function TravelPanel({
  tx,
  lang,
  travelCityInput,
  travelDaysInput,
  travelNoteInput,
  savingTravelCity,
  activeTravelPlan,
  loadingWeekly,
  weeklyForecast,
  suitcasePlan,
  travelCities,
  onTravelCityInputChange,
  onTravelDaysInputChange,
  onTravelNoteInputChange,
  onAddTravelCity,
  onSelectSavedTravelCity,
  onRemoveTravelCity,
}) {
  return (
    <section className="app-panel rounded-2xl bg-gradient-to-br from-white via-stone-50 to-amber-50/60 border-stone-200 shadow-sm dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/80 dark:border-zinc-800 dark:shadow-none border p-6 space-y-6 animate-outfit-in">
      <div>
        <h2 className="text-xl font-bold">{tx.travelTitle}</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{tx.travelSubtitle}</p>
      </div>

      <form onSubmit={onAddTravelCity} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          required
          value={travelCityInput}
          onChange={(e) => onTravelCityInputChange(e.target.value)}
          placeholder={tx.travelInputPlaceholder}
          className="md:col-span-2 rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border px-3.5 py-2.5 text-xs focus:outline-none"
        />
        <div>
          <label className="block text-[10px] text-zinc-600 dark:text-zinc-400 mb-1">
            {tx.travelDaysLabel}
          </label>
          <input
            type="number"
            min={1}
            max={14}
            value={travelDaysInput}
            onChange={(e) => onTravelDaysInputChange(e.target.value)}
            className="w-full rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border px-3.5 py-2 text-xs focus:outline-none"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={savingTravelCity}
            className="w-full rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 disabled:opacity-50 px-4 py-2.5 text-xs font-semibold transition cursor-pointer active:scale-95"
          >
            {savingTravelCity ? tx.searching : tx.travelSaveBtn}
          </button>
        </div>
        <input
          type="text"
          value={travelNoteInput}
          onChange={(e) => onTravelNoteInputChange(e.target.value)}
          placeholder={tx.travelNotePlaceholder}
          className="md:col-span-4 rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border px-3.5 py-2.5 text-xs focus:outline-none"
        />
      </form>

      {/* 1-Week Forecast */}
      {activeTravelPlan && (
        <div className="space-y-3 pt-4 border-t border-stone-200 dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              {tx.weeklyForecastTitle} — {activeTravelPlan.label} ({activeTravelPlan.days || 3}{' '}
              {tx.daysUnit})
            </h3>
            {activeTravelPlan.note && (
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {activeTravelPlan.note}
              </span>
            )}
          </div>

          {loadingWeekly ? (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{tx.checkingWeather}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {weeklyForecast.map((day) => (
                <div
                  key={day.date}
                  className="rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border p-3 text-center space-y-1"
                >
                  <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    {day.date}
                  </p>
                  <p className="text-sm font-bold">
                    {day.maxTemp}° / {day.minTemp}°
                  </p>
                  <p className="text-[11px] text-sky-400">💧 {day.rainProb}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suitcase Items */}
      {activeTravelPlan && (
        <div className="space-y-3 pt-4 border-t border-stone-200 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold">{tx.suitcaseTitle}</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              {activeTravelPlan.days || 3} {tx.suitcaseSummary}
            </p>
            {suitcasePlan.note && (
              <p className="text-xs text-emerald-400 mt-1">{suitcasePlan.note}</p>
            )}
          </div>

          {suitcasePlan.suggestedItems.length === 0 ? (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{tx.emptySuitcaseMsg}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {suitcasePlan.suggestedItems.map((piece) => (
                <div
                  key={piece.id}
                  className="rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border overflow-hidden flex flex-col"
                >
                  <div className="relative w-full h-32">
                    <Image
                      src={piece.image_url}
                      alt={piece.sub_category || getCategoryLabel(piece.category, lang)}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2.5 space-y-1">
                    <p className="text-[11px] font-semibold truncate">
                      {getCategoryLabel(piece.category, lang)}
                    </p>
                    <p className="text-xs font-medium truncate">
                      {piece.sub_category || piece.color || '-'}
                    </p>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
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
      <div className="space-y-3 pt-4 border-t border-stone-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold">{tx.travelSavedListTitle}</h3>
        {travelCities.length === 0 ? (
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{tx.travelEmptyMsg}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {travelCities.map((c) => (
              <div
                key={c.id}
                className="rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border p-3.5 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-semibold">
                    {c.label} • {c.days || 3} {tx.daysUnit}
                  </p>
                  {c.note && (
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">{c.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelectSavedTravelCity(c)}
                    className="rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-700/20 px-2.5 py-1 text-[11px] font-medium cursor-pointer"
                  >
                    {tx.useCityBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveTravelCity(c.id)}
                    className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-red-400 cursor-pointer"
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
  );
}
