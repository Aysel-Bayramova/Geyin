'use client';

import TopControls from './TopControls';

export default function AuthForm({
  isDark,
  tx,
  lang,
  themeMode,
  onSelectLang,
  onSelectTheme,
  isRegister,
  onToggleRegister,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  error,
  message,
  submitting,
  onSubmit,
}) {
  return (
    <main
      data-theme={isDark ? 'dark' : 'light'}
      className="auth-shell min-h-screen bg-stone-100 text-zinc-900 dark:bg-zinc-950 dark:text-white flex items-center justify-center p-6 transition-colors duration-300"
    >
      <div className="auth-card w-full max-w-md rounded-2xl bg-white border-stone-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none border p-6 space-y-6 animate-outfit-in">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Geyin</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {isRegister ? tx.registerSubtitle : tx.loginSubtitle}
            </p>
          </div>
          <TopControls
            lang={lang}
            onSelectLang={onSelectLang}
            themeMode={themeMode}
            onSelectTheme={onSelectTheme}
            tx={tx}
          />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1.5">
              {tx.email}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border px-3.5 py-2.5 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1.5">
              {tx.password}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder={tx.passwordHint}
              className="w-full rounded-xl bg-stone-50 border-stone-200 dark:bg-zinc-950 dark:border-zinc-800 border px-3.5 py-2.5 text-sm focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-500">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-500">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 disabled:opacity-50 font-semibold py-2.5 text-sm transition cursor-pointer active:scale-[0.98]"
          >
            {submitting ? tx.pleaseWait : isRegister ? tx.signUp : tx.signIn}
          </button>
        </form>

        <div className="pt-2 border-t border-stone-200 dark:border-zinc-800 text-center">
          <button
            type="button"
            onClick={onToggleRegister}
            className="text-xs text-zinc-600 dark:text-zinc-400 transition cursor-pointer"
          >
            {isRegister ? tx.haveAccount : tx.noAccount}
          </button>
        </div>
      </div>
    </main>
  );
}
