'use client';

import Image from 'next/image';
import { getCategoryLabel } from '@/lib/i18n';

export default function SavedOutfits({
  tx,
  lang,
  savedOutfits,
  onLoadSavedOutfit,
  onDeleteSavedOutfit,
}) {
  if (!savedOutfits || savedOutfits.length === 0) return null;

  return (
    <section className="app-panel rounded-2xl bg-white border-stone-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none border p-6 space-y-4 animate-outfit-in">
      <h2 className="text-lg font-semibold">
        {tx.savedOutfitsTitle} ({savedOutfits.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedOutfits.map((saved) => (
          <div
            key={saved.id}
            className="rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border p-4 space-y-3 transition hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                {saved.city} • {saved.temp}°C ({saved.condition}) — {saved.createdAt}
              </p>
              <div className="flex items-center gap-2">
                {saved.outfitData && (
                  <button
                    type="button"
                    onClick={() => onLoadSavedOutfit(saved)}
                    className="text-xs text-emerald-700 hover:underline font-medium transition cursor-pointer"
                  >
                    {tx.loadBtn}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteSavedOutfit(saved.id)}
                  className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-red-400 transition cursor-pointer"
                >
                  {tx.deleteBtn}
                </button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {saved.pieces.map((p, idx) => (
                <div
                  key={`${saved.id}-${idx}`}
                  className="relative w-16 h-20 rounded-lg overflow-hidden border border-stone-200 dark:border-zinc-800 shrink-0"
                >
                  <Image
                    src={p.image_url}
                    alt={p.sub_category || getCategoryLabel(p.category, lang)}
                    fill
                    unoptimized
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
