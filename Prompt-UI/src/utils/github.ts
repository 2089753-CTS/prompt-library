import type { PromptsFile } from '../types'

const REPO_OWNER = '2089753-CTS'
const REPO_NAME = 'prompt-library'
const FILE_PATH = 'prompts.json'
const RAW_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${FILE_PATH}`
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`

export async function fetchPrompts(): Promise<PromptsFile> {
  const res = await fetch(`${RAW_URL}?t=${Date.now()}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch prompts (${res.status} ${res.statusText})`)
  }
  return res.json() as Promise<PromptsFile>
}

export async function savePrompts(data: PromptsFile, token: string): Promise<void> {
  // Fetch current file SHA (required by GitHub API for updates)
  const fileRes = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!fileRes.ok) {
    const err = await fileRes.json().catch(() => ({})) as { message?: string }
    throw new Error(err.message ?? `Could not read remote file (${fileRes.status})`)
  }

  const fileData = await fileRes.json() as { sha: string }
  const sha = fileData.sha

  // Encode content as base64 (UTF-8 safe)
  const jsonString = JSON.stringify(data, null, 2)
  const encoded = btoa(unescape(encodeURIComponent(jsonString)))

  const updateRes = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'chore: update prompts.json via Prompt Library UI',
      content: encoded,
      sha,
    }),
  })

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({})) as { message?: string }
    throw new Error(err.message ?? `Failed to save (${updateRes.status})`)
  }
}
