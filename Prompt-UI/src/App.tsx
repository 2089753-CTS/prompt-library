import { useState, useEffect, useCallback } from 'react'
import type { Prompt, PromptsFile } from './types'
import { fetchPrompts } from './utils/github'
import Header from './components/Header'
import SettingsDrawer from './components/SettingsDrawer'
import HomePage from './pages/HomePage'
import ManagePage from './pages/ManagePage'

type Page = 'home' | 'manage'
export type Theme = 'dark' | 'light'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [token, setToken] = useState<string>(() => localStorage.getItem('gh_token') ?? '')
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) ?? 'dark'
  )

  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [version, setVersion] = useState('1.0.0')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  // Apply theme class to <html> synchronously on every change
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const loadPrompts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPrompts()
      setPrompts(data.prompts)
      setVersion(data.version)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load prompts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPrompts()
  }, [loadPrompts])

  // Redirect to home if token is cleared while on manage page
  useEffect(() => {
    if (!token && page === 'manage') setPage('home')
  }, [token, page])

  const handleTokenSave = (newToken: string) => {
    setToken(newToken)
    if (newToken) {
      localStorage.setItem('gh_token', newToken)
    } else {
      localStorage.removeItem('gh_token')
    }
  }

  const promptsFile: PromptsFile = { version, prompts }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Header
        page={page}
        hasToken={!!token}
        onNavigate={setPage}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {page === 'home' ? (
          <HomePage
            prompts={prompts}
            loading={loading}
            error={error}
            search={search}
            category={category}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onRefresh={loadPrompts}
          />
        ) : token ? (
          <ManagePage
            prompts={prompts}
            promptsFile={promptsFile}
            token={token}
            onPromptsChange={setPrompts}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-gray-800 dark:text-gray-200">Editor access required</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Set your GitHub token in Settings to manage prompts.</p>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              Open Settings
            </button>
          </div>
        )}
      </main>

      <SettingsDrawer
        open={settingsOpen}
        token={token}
        theme={theme}
        onClose={() => setSettingsOpen(false)}
        onTokenSave={handleTokenSave}
        onThemeChange={setTheme}
      />
    </div>
  )
}
