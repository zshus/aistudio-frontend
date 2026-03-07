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
