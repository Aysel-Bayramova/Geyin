'use client';

import Image from 'next/image';
import { STYLES, getCategoryLabel } from '@/lib/i18n';

export default function OutfitGrid({
  tx,
  lang,
  items,
  activeWeather,
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
    <div className="space-y-4 pt-2 border-t border-stone-200 dark:border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{tx.todayOutfitTitle}</h3>
          {recommendedOutfit?.explanation ? (
            <p className="text-xs text-emerald-500 mt-0.5">
              {tx.whyOutfit} {recommendedOutfit.explanation}
            </p>
          ) : (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{tx.defaultOutfitSub}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={outfitStyleFilter}
            onChange={(e) => onStyleFilterChange(e.target.value)}
            className="rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border px-3 py-2 text-xs focus:outline-none"
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
            onClick={onRegenerateOutfit}
            className="rounded-xl bg-white border-stone-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none disabled:opacity-40 border px-3.5 py-2 text-xs font-medium transition cursor-pointer active:scale-95"
          >
            {tx.generateAnother}
          </button>

          <button
            type="button"
            disabled={!recommendedOutfit}
            onClick={onSaveCurrentOutfit}
            className="rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-40 border border-emerald-500/40 px-3.5 py-2 text-xs font-medium text-emerald-400 transition cursor-pointer active:scale-95"
          >
            {tx.saveOutfit}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border p-5 text-center text-xs text-zinc-600 dark:text-zinc-400">
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
                className={`rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 ${
                  isLocked ? 'border-amber-400/80 ring-1 ring-amber-400/30' : ''
                }`}
              >
                <div className="px-3 py-2 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                    {slot.label}
                  </span>
                  {slot.item && (
                    <button
                      type="button"
                      onClick={() => onToggleLockSlot(slot.key)}
                      className={`text-[10px] px-1.5 py-0.5 rounded transition cursor-pointer active:scale-95 ${
                        isLocked
                          ? 'bg-amber-400/20 text-amber-400 font-semibold'
                          : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {isLocked ? tx.locked : tx.lock}
                    </button>
                  )}
                </div>

                {slot.item ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="relative w-full h-36">
                        <Image
                          src={slot.item.image_url}
                          alt={slot.item.sub_category || slot.label}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="p-2.5 space-y-1">
                        <p className="text-xs font-medium truncate">
                          {slot.item.sub_category || getCategoryLabel(slot.item.category, lang)}
                        </p>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                          {slot.item.color ? `${slot.item.color} • ` : ''}
                          {tx.warmthShort} {slot.item.warmth_level}/5
                        </p>
                      </div>
                    </div>

                    {!isLocked && (
                      <div className="px-2.5 pb-2.5">
                        <button
                          type="button"
                          onClick={() => onRegenerateSingleSlot(slot.key)}
                          className="w-full rounded-lg bg-white border-stone-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none border py-1 text-[11px] text-zinc-700 dark:text-zinc-300 transition cursor-pointer active:scale-95"
                        >
                          {tx.swap}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-4 text-center text-[11px] text-zinc-600 dark:text-zinc-400 min-h-[160px]">
                    {tx.notFoundInSlot}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
