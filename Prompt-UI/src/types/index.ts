export interface Prompt {
  id: string
  title: string
  category: string
  description: string
  tags: string[]
  prompt: string
}

export interface PromptsFile {
  version: string
  prompts: Prompt[]
}

export interface FormValues {
  id: string
  title: string
  category: string
  description: string
  tags: string
  prompt: string
}
