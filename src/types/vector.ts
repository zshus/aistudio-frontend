export interface Folder {
  folderId: number
  folderName: string
  folderType: string
  useYn: boolean
  fileCount?: number
}

export interface CollectionListProps {
  onSelect?: (folderName: string | null, folderId: number | null, folderType: string | null) => void
  selectedFolderId?: number | null
  deletedFolderId?: number | null
  uploadFolderId?: number | null
  uploadCount?: number | null
}

export interface CreateFolderContentProps {
  folderName: string
  setFolderName: (v: string) => void
  folderType: string
  setFolderType: (v: string) => void
  error: string | null
  setError: (v: string | null) => void
}

export interface VdbFile {
  fileId: number
  fileName: string | null
  useYn: boolean
}

export interface FileTableProps {
  entities: VdbFile[]
  onSelect: (row: VdbFile) => void
  onToggleActivate?: (row: VdbFile, checked: boolean) => void
  onDelete?: (row: VdbFile) => void
  onOverwrite?: (row: VdbFile) => void
}

export interface FileListProps {
  collectionName: string | null
  collectionId: number | null
  onFileDeleted?: (folderId: number | null) => void
  onUploadFiles?: (folderId: number | null, count: number) => void
}

export interface FolderPayload {
  folderId?: number
  folderName: string
  folderType: string
  useYn: boolean
}

export interface FilePayload {
  fileId?: number
  folderId?: number
  fileName?: string
  useYn?: boolean
}

export interface FileOverwriteContentProps {
  file: globalThis.File | null
  setFile: (file: globalThis.File | null) => void
  error: string | null
}

export interface FileUploadContentProps {
  files: globalThis.File[]
  setFiles: (files: globalThis.File[]) => void
  error: string | null
}
