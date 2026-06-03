export interface Tool {
  id: number
  toolId: string
  name: string
  description: string
  keywords: string[]
  useYn: boolean
  hidden: boolean
}

export interface ToolPayload {
  id?: number
  toolId?: string
  name: string
  description: string
  keywords: string[]
  useYn: boolean
  hidden: boolean
}
