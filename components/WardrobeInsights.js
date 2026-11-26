'use client';

export default function WardrobeInsights({ tx, insights }) {
  if (!insights) return null;

  return (
    <section className="app-panel rounded-2xl bg-white border-stone-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none border p-5 flex flex-wrap items-center justify-between gap-4 animate-outfit-in">
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{tx.totalItems}</p>
          <p className="text-lg font-bold">
            {insights.total} {tx.piecesUnit}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{tx.avgWarmth}</p>
          <p className="text-lg font-bold">{insights.avgWarmth} / 5</p>
        </div>
        <div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{tx.waterproofCount}</p>
          <p className="text-lg font-bold">
            {insights.waterproofCount} {tx.piecesUnit}
          </p>
        </div>
      </div>
      <p className="text-xs text-zinc-700 dark:text-zinc-300 max-w-md">{insights.suggestion}</p>
    </section>
  );
}
