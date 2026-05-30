import { useState, useEffect, type FC } from 'react'
import type { Theme } from '../App'

interface SettingsDrawerProps {
  open: boolean
  token: string
  theme: Theme
  onClose: () => void
  onTokenSave: (token: string) => void
  onThemeChange: (theme: Theme) => void
}

const SettingsDrawer: FC<SettingsDrawerProps> = ({
  open,
  token,
  theme,
  onClose,
  onTokenSave,
  onThemeChange,
}) => {
  const [draft, setDraft] = useState(token)

  useEffect(() => {
    setDraft(token)
  }, [token, open])

  const handleSave = () => {
    onTokenSave(draft.trim())
    setTimeout(onClose, 600)
  }

  const handleClear = () => {
    setDraft('')
    onTokenSave('')
    onClose()
  }

  const inputBase =
    'w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors'

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* --- Theme toggle --- */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Theme
            </label>
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              {/* Light */}
              <button
                onClick={() => onThemeChange('light')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Light
              </button>
              {/* Dark */}
              <button
                onClick={() => onThemeChange('dark')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Dark
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-800" />

          {/* --- Token status --- */}
          <div className={`flex items-center gap-2.5 p-3 rounded-lg border ${
            token
              ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-300'
              : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
          }`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${token ? 'bg-indigo-500 dark:bg-indigo-400 animate-pulse' : 'bg-gray-300 dark:bg-gray-500'}`} />
            <span className="text-sm font-medium">
              {token ? 'Editor mode enabled' : 'View-only — no token set'}
            </span>
          </div>

          {/* --- Token input --- */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className={inputBase}
            />
            <p className="text-xs text-gray-500 leading-relaxed">
              Requires a token with{' '}
              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-700 dark:text-gray-300">repo</code>{' '}
              scope. Stored only in your browser&apos;s localStorage.
            </p>
          </div>

          {/* How to get a token */}
          <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">How to get a token</p>
            <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside leading-relaxed">
              <li>GitHub → Settings → Developer settings</li>
              <li>Personal access tokens → Tokens (classic)</li>
              <li>Generate new token → select <strong className="text-gray-700 dark:text-gray-300">repo</strong> scope</li>
              <li>Copy and paste the token above</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
          {token && (
            <button
              onClick={handleClear}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Clear Token
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!draft.trim()}
            className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Token
          </button>
        </div>
      </div>
    </>
  )
}

export default SettingsDrawer
