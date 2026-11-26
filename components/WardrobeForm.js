'use client';

import Image from 'next/image';
import { CATEGORIES, STYLES } from '@/lib/i18n';

export default function WardrobeForm({
  tx,
  lang,
  imageFile,
  imagePreviewUrl,
  category,
  subCategory,
  color,
  style,
  warmthLevel,
  waterproof,
  windproof,
  uploading,
  fileInputRef,
  onImageFileChange,
  onCategoryChange,
  onSubCategoryChange,
  onColorChange,
  onStyleChange,
  onWarmthLevelChange,
  onWaterproofChange,
  onWindproofChange,
  onSubmit,
}) {
  return (
    <section className="app-panel rounded-2xl bg-white border-stone-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none border p-6">
      <h2 className="text-lg font-semibold mb-4">{tx.addNewItemTitle}</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-2.5">
          <label className="block text-xs text-zinc-600 dark:text-zinc-400">{tx.photoLabel}</label>
          <input
            ref={fileInputRef}
            id="clothes-file-input"
            type="file"
            accept="image/*"
            required
            onChange={(e) => onImageFileChange(e.target.files?.[0] || null)}
            className="hidden"
          />
          <div className="w-full rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border px-3.5 py-2 text-sm flex items-center gap-3">
            <label
              htmlFor="clothes-file-input"
              className="rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-3 py-1.5 text-xs font-medium cursor-pointer transition active:scale-95 shrink-0"
            >
              {tx.chooseFileBtn}
            </label>
            <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
              {imageFile ? imageFile.name : tx.noFileChosen}
            </span>
          </div>
          {imagePreviewUrl && (
            <div className="flex items-center gap-3 pt-1 animate-outfit-in">
              <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-800 shrink-0">
                <Image
                  src={imagePreviewUrl}
                  alt="Preview"
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">{tx.previewReady}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1.5">
            {tx.categoryLabel}
          </label>
          <select
            value={typeof category === 'string' ? category : category?.value}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border px-3.5 py-2.5 text-sm focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label[lang] || cat.label.az}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1.5">
            {tx.subCategoryLabel}
          </label>
          <input
            type="text"
            value={subCategory}
            onChange={(e) => onSubCategoryChange(e.target.value)}
            placeholder={tx.subCategoryPlaceholder}
            className="w-full rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border px-3.5 py-2.5 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1.5">
            {tx.colorLabel}
          </label>
          <input
            type="text"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            placeholder={tx.colorPlaceholder}
            className="w-full rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border px-3.5 py-2.5 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1.5">
            {tx.styleLabel}
          </label>
          <select
            value={style}
            onChange={(e) => onStyleChange(e.target.value)}
            className="w-full rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border px-3.5 py-2.5 text-sm focus:outline-none"
          >
            {STYLES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label[lang] || st.label.az}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1.5">
            <span>{tx.warmthSlider}</span>
            <span className="font-semibold">{warmthLevel} / 5</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={warmthLevel}
            onChange={(e) => onWarmthLevelChange(e.target.value)}
            className="w-full cursor-pointer"
          />
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={waterproof}
              onChange={(e) => onWaterproofChange(e.target.checked)}
              className="rounded"
            />
            {tx.waterproofCheck}
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={windproof}
              onChange={(e) => onWindproofChange(e.target.checked)}
              className="rounded"
            />
            {tx.windproofCheck}
          </label>
        </div>

        <div className="md:col-span-2 pt-2">
          <button
            type="submit"
            disabled={uploading}
            className="w-full md:w-auto rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 disabled:opacity-50 font-semibold px-6 py-2.5 text-sm transition cursor-pointer active:scale-[0.98]"
          >
            {uploading ? tx.uploadingBtn : tx.addToWardrobeBtn}
          </button>
        </div>
      </form>
    </section>
  );
}
