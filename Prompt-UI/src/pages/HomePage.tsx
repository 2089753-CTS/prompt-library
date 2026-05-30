import { useMemo, type FC } from 'react'
import type { Prompt } from '../types'
import PromptCard from '../components/PromptCard'

interface HomePageProps {
  prompts: Prompt[]
  loading: boolean
  error: string | null
  search: string
  category: string
  onSearchChange: (s: string) => void
  onCategoryChange: (c: string) => void
  onRefresh: () => void
}

const HomePage: FC<HomePageProps> = ({
  prompts,
  loading,
  error,
  search,
  category,
  onSearchChange,
  onCategoryChange,
  onRefresh,
}) => {
  // Derive unique categories from all loaded prompts
  const categories = useMemo(() => {
    const unique = [...new Set(prompts.map((p) => p.category))].sort()
    return ['All', ...unique]
  }, [prompts])

  // Reset to 'All' if selected category is no longer present
  const activeCategory = categories.includes(category) ? category : 'All'

  const filtered = useMemo(() => {
    let list = prompts
    if (activeCategory !== 'All') {
      list = list.filter((p) => p.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q),
      )
    }
    return list
  }, [prompts, activeCategory, search])

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, description, category, or tag..."
          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dynamic category tabs — only rendered once prompts are loaded */}
      {!loading && !error && categories.length > 1 && (
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-lg w-fit max-w-full overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 dark:text-gray-500">Loading prompts...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            <p className="text-xs text-gray-400 mt-1">Check that prompts.json exists in the repo.</p>
          </div>
          <button
            onClick={onRefresh}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No prompts found</p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
              {search ? `No results for "${search}"` : 'No prompts in this category yet.'}
            </p>
          </div>
          {search && (
            <button onClick={() => onSearchChange('')} className="text-xs text-indigo-500 hover:text-indigo-400">
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Results meta + grid */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {filtered.length} {filtered.length === 1 ? 'prompt' : 'prompts'}
              {activeCategory !== 'All' && ` in ${activeCategory}`}
              {search && ` matching "${search}"`}
            </p>
            <button
              onClick={onRefresh}
              title="Refresh"
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default HomePage
