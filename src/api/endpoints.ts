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
}
