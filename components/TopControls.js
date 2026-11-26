'use client';

export default function TopControls({ lang, onSelectLang, themeMode, onSelectTheme, tx }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center rounded-xl p-1 border text-xs bg-stone-200/70 border-stone-300 dark:bg-zinc-900 dark:border-zinc-800">
        {[
          { id: 'az', label: 'AZ' },
          { id: 'en', label: 'EN' },
          { id: 'ru', label: 'RU' },
        ].map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => onSelectLang(l.id)}
            className={`px-2 py-1 rounded-lg font-semibold transition cursor-pointer active:scale-95 ${
              lang === l.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="inline-flex items-center rounded-xl p-1 border text-xs bg-stone-200/70 border-stone-300 dark:bg-zinc-900 dark:border-zinc-800">
        {[
          { id: 'auto', label: tx.auto },
          { id: 'light', label: tx.light },
          { id: 'dark', label: tx.dark },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelectTheme(m.id)}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer active:scale-95 ${
              themeMode === m.id
                ? 'bg-white text-zinc-900 dark:text-zinc-950 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
