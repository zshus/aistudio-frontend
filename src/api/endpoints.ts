import axios from 'axios'
import { LoginResponse, User } from '../types/user'
import type { Folder, VdbFile ,FolderPayload} from '../types/vector'

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
    axiosInstance.post<LoginResponse>('/auth/login', { username, password }).then((r) => r.data),

  register: (username: string, email: string, password: string) =>
    axiosInstance.post<void>('/auth/register', { username, email, password }).then((r) => r.data),
}

export const userApi = {
  getAllList: ()=>
    axiosInstance.get<User[]>('/auth/users').then((response)=>response.data),
}

export const vectorDBAPI = {
  listVdbFolder: () =>
    axiosInstance.get<Folder[]>('/vdb/folders').then((r) => r.data),

  createVdbFolder: (data: Omit<FolderPayload, 'folderId'>) =>
    axiosInstance.post<Folder>('/vdb/folders', data).then((r) => r.data),

  updateVdbFolder: (data: FolderPayload) =>
    axiosInstance.put<Folder>('/vdb/folders', data).then((r) => r.data),

  deleteVdbFolder: (data: FolderPayload) =>
    axiosInstance.delete<void>('/vdb/folders', { data }).then((r) => r.data),

  overwriteVdbFile: (file: globalThis.File, fileId: number) => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post<VdbFile>(`/vdb/files/${fileId}/overwrite`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
  
}
