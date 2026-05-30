import { useState, type FC } from 'react'
import type { Prompt, PromptsFile } from '../types'
import { savePrompts } from '../utils/github'
import ManagePromptForm from '../components/ManagePromptForm'
import ConfirmDialog from '../components/ConfirmDialog'

function categoryBadge(cat: string): string {
  const palette: Record<string, string> = {
    ui:     'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
    be:     'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
    shared: 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
    common: 'bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/40',
  }
  return palette[cat.toLowerCase()] ??
    'bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600/50'
}

interface ManagePageProps {
  prompts: Prompt[]
  promptsFile: PromptsFile
  token: string
  onPromptsChange: (prompts: Prompt[]) => void
}

type FormMode = { type: 'add' } | { type: 'edit'; prompt: Prompt } | null

const ManagePage: FC<ManagePageProps> = ({ prompts, promptsFile, token, onPromptsChange }) => {
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [deleteTarget, setDeleteTarget] = useState<Prompt | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [pendingChanges, setPendingChanges] = useState(false)

  const handleAdd = (newPrompt: Prompt) => {
    onPromptsChange([...prompts, newPrompt])
    setFormMode(null)
    setPendingChanges(true)
  }

  const handleEdit = (updated: Prompt) => {
    onPromptsChange(prompts.map((p) => (p.id === updated.id ? updated : p)))
    setFormMode(null)
    setPendingChanges(true)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    onPromptsChange(prompts.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
    setPendingChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      await savePrompts({ ...promptsFile, prompts }, token)
      setSaveSuccess(true)
      setPendingChanges(false)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const existingIds = prompts.map((p) => p.id)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Prompts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} in library
            {pendingChanges && (
              <span className="ml-2 text-amber-600 dark:text-amber-400 text-xs font-medium">• Unsaved changes</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFormMode({ type: 'add' })}
            disabled={formMode !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Prompt
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !pendingChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              saveSuccess
                ? 'bg-green-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Save to Server
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save error */}
      {saveError && (
        <div className="flex items-center gap-3 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-lg text-sm text-red-600 dark:text-red-400">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="flex-1">{saveError}</span>
          <button onClick={() => setSaveError(null)} className="text-red-400 hover:text-red-600 dark:hover:text-red-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Add form */}
      {formMode?.type === 'add' && (
        <div className="bg-gray-50 dark:bg-gray-800/60 border border-indigo-300 dark:border-indigo-700/40 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-indigo-600 dark:text-indigo-300 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Prompt
          </h2>
          <ManagePromptForm
            existingIds={existingIds}
            onSave={handleAdd}
            onCancel={() => setFormMode(null)}
          />
        </div>
      )}

      {/* Prompt list */}
      {prompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">No prompts yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prompts.map((prompt) => {
            const isEditing = formMode?.type === 'edit' && formMode.prompt.id === prompt.id

            return (
              <div
                key={prompt.id}
                className={`bg-gray-50 dark:bg-gray-800 border rounded-xl transition-all ${
                  isEditing
                    ? 'border-indigo-400 dark:border-indigo-600/60'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Row */}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold border ${categoryBadge(prompt.category)}`}>
                        {prompt.category}
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{prompt.title}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{prompt.description}</p>
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setFormMode({ type: 'edit', prompt })}
                        disabled={formMode !== null}
                        title="Edit"
                        className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(prompt)}
                        disabled={formMode !== null}
                        title="Delete"
                        className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline edit form */}
                {isEditing && (
                  <div className="border-t border-gray-200 dark:border-gray-700/80 px-4 py-4">
                    <ManagePromptForm
                      initial={prompt}
                      existingIds={existingIds}
                      onSave={handleEdit}
                      onCancel={() => setFormMode(null)}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Prompt"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will be removed when you save to server.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default ManagePage
