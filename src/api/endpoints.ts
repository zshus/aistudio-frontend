import axios from 'axios'
import { LoginResponse, User } from '../types/user'
import type { Folder, VdbFile, FolderPayload, FilePayload } from '../types/vector'

const TOKEN_KEY = 'token'

export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const removeToken = () => localStorage.removeItem(TOKEN_KEY)

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message ?? `HTTP ${error.response?.status}`
    return Promise.reject(new Error(message))
  }
)


//api 

export const authApi = {
  login: (username: string, password: string) =>
    axiosInstance.post<LoginResponse>('/v1/auth/login', { username, password }).then((r) => r.data),

  register: (username: string, email: string, password: string) =>
    axiosInstance.post<void>('/v1/auth/register', { username, email, password }).then((r) => r.data),
}

//vector DB
export const userApi = {
  getAllList: ()=>
    axiosInstance.get<User[]>('/v1/auth/users').then((response)=>response.data),
}

export const vectorDBAPI = {
  // folder
  listVdbFolder: () =>
    axiosInstance.get<Folder[]>('/v1/vector/folder/list').then((r) => r.data),

  createVdbFolder: (data: Omit<FolderPayload, 'folderId' | 'useYn'>) =>
    axiosInstance.post<Folder>('/v1/vector/folder/create', data).then((r) => r.data),

  updateVdbFolder: (data: FolderPayload) =>
    axiosInstance.post<Folder>('/v1/vector/folder/update', data).then((r) => r.data),

  deleteVdbFolder: (data: FolderPayload) =>
    axiosInstance.post<Folder>('/v1/vector/folder/delete', data).then((r) => r.data),

  // file
  uploadVdbFile: (file: globalThis.File, folderId: number) => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post<VdbFile>('/v1/vector/file/upload', formData, {
      params: { folderId },
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  overwriteVdbFile: (file: globalThis.File, fileId: number) => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post<VdbFile>('/v1/vector/file/overwrite', formData, {
      params: { fileId },
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  updateVdbFile: (data: FilePayload) =>
    axiosInstance.post<VdbFile>('/v1/vector/file/update', data).then((r) => r.data),

  deleteVdbFile: (data: FilePayload) =>
    axiosInstance.post<VdbFile>('/v1/vector/file/delete', data).then((r) => r.data),

  listVdbFile: (folderId: number) =>
    axiosInstance.get<VdbFile[]>('/v1/vector/file/list', { params: { folderId } }).then((r) => r.data),

  getKeywords: (fileId: number) =>
    axiosInstance.get<{ fileId: number; keywords: string[] }>(
      `/v1/vector/file/keywords/${fileId}`
    ).then((r) => r.data),

  extractKeywords: (fileId: number, folderId: number, fileName: string) =>
    axiosInstance.post<{ fileId: number; keywords: string[] }>(
      '/v1/vector/file/keywords/extract',
      { fileId, folderId, fileName }
    ).then((r) => r.data),

  saveKeywords: (fileId: number, folderId: number, fileName: string, keywords: string[]) =>
    axiosInstance.post<{ fileId: number; keywords: string[] }>(
      '/v1/vector/file/keywords/save',
      { fileId, folderId, fileName, keywords }
    ).then((r) => r.data),
}

export const chatApi = {
  createRoom: (roomName: string) =>
    axiosInstance.post<{ roomId: number; roomName: string }>('/v1/chat/room/create', { roomName }).then((r) => r.data),

  streamMessage: (
    roomId: number,
    message: string,
    conversationHistory: { role: string; content: string }[],
    folderIds?: number[],
    topK = 5,
    onToken?: (token: string) => void,
    onRouting?: (targets: { name: string; type: string; score: number }[]) => void,
    onLlmDecision?: (decision: { tool: string; selected_ids: string[] }) => void,
    onDone?: (sources: any[], sourceType: string) => void,
    onError?: (msg: string) => void,
  ): EventSource => {
    const token = getToken()
    const url = `/api/v1/chat/message/stream`

    // Java SSE endpoint uses POST body — use fetch with ReadableStream
    const ctrl = new AbortController()

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ roomId, message, folderIds, topK, contextSize: 10, conversationHistory }),
      signal: ctrl.signal,
    }).then(async (res) => {
      if (!res.ok || !res.body) { onError?.('연결 실패'); return }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const raw = line.slice(5).trim()
          if (!raw) continue
          try {
            const evt = JSON.parse(raw)
            if (evt.type === 'token')        onToken?.(evt.content)
            if (evt.type === 'routing')      onRouting?.(evt.targets)
            if (evt.type === 'llm_decision') onLlmDecision?.(evt)
            if (evt.type === 'done')         onDone?.(evt.sources, evt.source_type ?? '')
            if (evt.type === 'error')        onError?.(evt.message)
          } catch { /* ignore malformed lines */ }
        }
      }
    }).catch((e) => { if (e.name !== 'AbortError') onError?.(e.message) })

    return { abort: () => ctrl.abort() } as unknown as EventSource
  },
}
