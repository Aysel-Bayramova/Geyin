'use client';

import Image from 'next/image';
import { CATEGORIES, getCategoryLabel } from '@/lib/i18n';

export default function WardrobeList({
  tx,
  lang,
  filteredItems,
  loadingItems,
  selectedCategoryFilter,
  onSelectCategoryFilter,
  onDeleteItem,
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {tx.myItemsTitle} ({filteredItems.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSelectCategoryFilter('Hamısı')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition cursor-pointer active:scale-95 ${
              selectedCategoryFilter === 'Hamısı'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border-stone-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white dark:border-zinc-800 border'
            }`}
          >
            {tx.allFilter}
          </button>

          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat.value}
              onClick={() => onSelectCategoryFilter(cat.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition cursor-pointer active:scale-95 ${
                selectedCategoryFilter === cat.value
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                  : 'bg-white text-zinc-600 hover:text-zinc-900 border-stone-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white dark:border-zinc-800 border'
              }`}
            >
              {cat.label[lang] || cat.label.az}
            </button>
          ))}
        </div>
      </div>

      {loadingItems ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{tx.loadingWardrobe}</p>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl bg-white border-stone-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none border p-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {tx.emptyCategoryMsg}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white border-stone-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none border overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1"
            >
              <div>
                <div className="relative w-full h-44">
                  <Image
                    src={item.image_url}
                    alt={item.sub_category || getCategoryLabel(item.category, lang)}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-3.5 space-y-1.5">
                  <p className="text-xs font-semibold">{getCategoryLabel(item.category, lang)}</p>
                  {item.sub_category && (
                    <p className="text-xs text-zinc-700 dark:text-zinc-300">{item.sub_category}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.color && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border text-zinc-700 dark:text-zinc-300">
                        {item.color}
                      </span>
                    )}
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border text-zinc-700 dark:text-zinc-300">
                      {tx.warmthShort}: {item.warmth_level}/5
                    </span>
                    {item.waterproof && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400">
                        {tx.waterproofBadge}
                      </span>
                    )}
                    {item.windproof && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-400">
                        {tx.windproofBadge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-3.5 pb-3">
                <button
                  onClick={() => onDeleteItem(item)}
                  className="w-full rounded-lg bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 hover:bg-red-500/15 border hover:border-red-500/30 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-red-400 transition cursor-pointer active:scale-95"
                >
                  {tx.deleteBtn}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
