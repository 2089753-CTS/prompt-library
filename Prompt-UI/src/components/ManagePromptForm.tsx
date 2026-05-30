import { useState, useEffect, useMemo, type FC } from 'react'
import type { Prompt, FormValues } from '../types'

function generateId(category: string, title: string): string {
  const cat = category.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4)
  const ttl = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return [cat, ttl].filter(Boolean).join('-').slice(0, 50) || 'prompt'
}

interface ManagePromptFormProps {
  initial?: Prompt
  existingIds: string[]
  onSave: (prompt: Prompt) => void
  onCancel: () => void
}

const emptyValues: FormValues = {
  id: '',
  title: '',
  category: '',
  description: '',
  tags: '',
  prompt: '',
}

const toFormValues = (p: Prompt): FormValues => ({ ...p, tags: p.tags.join(', ') })

const ManagePromptForm: FC<ManagePromptFormProps> = ({ initial, existingIds, onSave, onCancel }) => {
  const [values, setValues] = useState<FormValues>(initial ? toFormValues(initial) : emptyValues)
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})

  useEffect(() => {
    setValues(initial ? toFormValues(initial) : emptyValues)
    setErrors({})
  }, [initial])

  // Auto-generated ID (derived, not stored in state for new prompts)
  const computedId = useMemo(
    () => (initial ? initial.id : generateId(values.category, values.title)),
    [initial, values.category, values.title]
  )

  const set = (field: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [field]: e.target.value }))

  // Title: strip spaces as user types
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, title: e.target.value.replace(/\s/g, '') }))
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormValues, string>> = {}
    if (!values.title.trim()) errs.title = 'Title is required'
    if (!values.category.trim()) errs.category = 'Category is required'
    if (!values.description.trim()) errs.description = 'Description is required'
    if (!values.prompt.trim()) errs.prompt = 'Prompt text is required'
    if (!initial && existingIds.includes(computedId)) {
      errs.title = `ID "${computedId}" already exists — change the title`
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSave({
      id: computedId,
      title: values.title.trim(),
      category: values.category.trim(),
      description: values.description.trim(),
      tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
      prompt: values.prompt.trim(),
    })
  }

  const inputCls = (field: keyof FormValues) =>
    `w-full px-3 py-2.5 bg-white dark:bg-gray-900 border rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
      errors[field] ? 'border-red-400 dark:border-red-600' : 'border-gray-300 dark:border-gray-700'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Row: Auto-ID (readonly) + Category (free text) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            ID <span className="text-gray-400 dark:text-gray-600 font-normal">(auto-generated)</span>
          </label>
          <input
            value={computedId}
            disabled
            readOnly
            className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-500 text-sm font-mono cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <input
            value={values.category}
            onChange={set('category')}
            placeholder="e.g. BE, UI, Common"
            className={inputCls('category')}
          />
          {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
        </div>
      </div>

      {/* Title — no spaces allowed */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
          Title <span className="text-red-500">*</span>{' '}
          <span className="text-gray-400 dark:text-gray-600 font-normal">(no spaces)</span>
        </label>
        <input
          value={values.title}
          onChange={handleTitleChange}
          placeholder="GenerateReactComponent"
          className={inputCls('title')}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <input
          value={values.description}
          onChange={set('description')}
          placeholder="Brief description of what this prompt does"
          className={inputCls('description')}
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
          Tags <span className="text-gray-400 dark:text-gray-600 font-normal">(comma-separated)</span>
        </label>
        <input
          value={values.tags}
          onChange={set('tags')}
          placeholder="react, typescript, component"
          className={inputCls('tags')}
        />
      </div>

      {/* Prompt text */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
          Prompt Text <span className="text-red-500">*</span>
        </label>
        <textarea
          value={values.prompt}
          onChange={set('prompt')}
          rows={8}
          placeholder="Write your prompt here..."
          className={`${inputCls('prompt')} resize-y font-mono text-xs leading-relaxed`}
        />
        {errors.prompt && <p className="mt-1 text-xs text-red-500">{errors.prompt}</p>}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          {initial ? 'Update Prompt' : 'Add Prompt'}
        </button>
      </div>
    </form>
  )
}

export default ManagePromptForm
