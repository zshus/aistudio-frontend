import { useEffect, useState } from 'react'
import { vectorDBAPI } from '../../api/endpoints'
import type { Folder, CollectionListProps } from '../../types/vector'
import { CreateFolderContent } from './Folder'
import { BPConfirmAlert } from '@/components/common/BPConfirmAlert'
import './Collection.css'
import { colors } from '@/styles/common'

const StatusDot = ({ active }: { active: boolean }) => (
  <span className={`status-dot ${active ? 'active' : ''}`} />
)

export function CollectionList({
  onSelect,
  selectedFolderId,
  deletedFolderId,
  uploadFolderId,
  uploadCount,
}: CollectionListProps) {
  const [collections, setCollections] = useState<Folder[]>([])
  const [keyword, setKeyword] = useState('')
  const [newModalOpened, setNewModalOpened] = useState(false)
  const [deleteModalOpened, setDeleteModalOpened] = useState(false)
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderType, setNewFolderType] = useState('file')
  const [newFolderError, setNewFolderError] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)

  const isValidEnglish = (text: string) => /^[\x21-\x7E]*$/.test(text)
  const canCreate = newFolderName.trim().length > 0 && isValidEnglish(newFolderName) && !newFolderError

  const fetchCollections = () => {
    vectorDBAPI.listVdbFolder().then((data: Folder[]) => {
      setCollections(data.sort((a, b) => a.folderId - b.folderId))
    }).catch(console.error)
  }

  const handleOpenNewModal = () => {
    setNewFolderName('')
    setNewFolderType('file')
    setNewFolderError(null)
    setNewModalOpened(true)
  }

  const handleCreateFolder = async () => {
    if (!canCreate) return
    setCreateLoading(true)
    try {
      await vectorDBAPI.createVdbFolder({
        folderName: newFolderName,
        folderType: newFolderType,
      })
      fetchCollections()
      setNewModalOpened(false)
    } catch (e) {
      console.error(e)
    } finally {
      setCreateLoading(false)
    }
  }

  useEffect(() => {
    if (deletedFolderId) {
      setCollections(prev => prev.map(folder =>
        folder.folderId === deletedFolderId
          ? { ...folder, fileCount: (folder.fileCount || 0) - 1 }
          : folder,
      ))
    }
  }, [deletedFolderId])

  useEffect(() => {
    if (uploadFolderId && uploadCount) {
      setCollections(prev => prev.map(folder =>
        folder.folderId === uploadFolderId
          ? { ...folder, fileCount: (folder.fileCount || 0) + uploadCount }
          : folder,
      ))
    }
  }, [uploadFolderId, uploadCount])

  useEffect(() => {
    vectorDBAPI.listVdbFolder().then((data: Folder[]) => {
      const sorted = data.sort((a, b) => a.folderId - b.folderId)
      setCollections(sorted)
      if (sorted.length === 0) return
      const fromUrl = selectedFolderId ? sorted.find(f => f.folderId === selectedFolderId) : null
      const toSelect = fromUrl ?? sorted[0]
      onSelect?.(toSelect.folderName, toSelect.folderId, toSelect.folderType)
    }).catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = collections.filter((c) =>
    c.folderName?.toLowerCase().includes(keyword.toLowerCase()),
  )

  const handleToggleUseYn = async (e: React.MouseEvent, folder: Folder) => {
    e.stopPropagation()
    try {
      const newUseyn = !folder.useYn
      await vectorDBAPI.updateVdbFolder({
        folderId: folder.folderId,
        folderName: folder.folderName,
        folderType: folder.folderType,
        useYn: newUseyn,
      })
      setCollections(prev => prev.map(item =>
        item.folderId === folder.folderId ? { ...item, useYn: newUseyn } : item,
      ))
    } catch (error) {
      console.error('Failed to update useYn:', error)
    }
  }

  const handleDelete = (e: React.MouseEvent, folder: Folder) => {
    e.stopPropagation()
    setFolderToDelete(folder)
    setDeleteModalOpened(true)
  }

  const confirmDelete = async () => {
    if (!folderToDelete) return
    setDeleteLoading(true)
    try {
      await vectorDBAPI.deleteVdbFolder({
        folderId: folderToDelete.folderId,
        folderName: folderToDelete.folderName,
        folderType: folderToDelete.folderType,
        useYn: folderToDelete.useYn,
      })
      setCollections(prev => prev.filter(f => f.folderId !== folderToDelete.folderId))
      if (selectedFolderId === folderToDelete.folderId) {
        onSelect?.(null, null, null)
      }
      setDeleteModalOpened(false)
    } catch (error) {
      console.error('Failed to delete folder:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="collection-container">
      {/* Header */}
      <div className="collection-header">
        <div className="collection-header-left">
          <span className="collection-title">VECTOR DB</span>
          <span
            className="collection-info-icon"
            title="Vector DB Folder&#10;● 활성화  ○ 비활성화"
          >
            ⓘ
          </span>
        </div>
        <button className="collection-add-btn" onClick={handleOpenNewModal}>
          + 추가
        </button>
      </div>

      {/* Search */}
      <div className="collection-search">
        <span className="collection-search-icon">🔍</span>
        <input
          className="collection-search-input"
          type="text"
          placeholder="검색..."
          value={keyword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="collection-list">
        {filtered.map((c) => {
          const isSelected = selectedFolderId === c.folderId
          return (
            <div
              key={c.folderId}
              className={`collection-item ${isSelected ? 'selected' : ''}`}
            >
              <div
                className="collection-item-main"
                onClick={() => onSelect?.(c.folderName, c.folderId, c.folderType)}
              >
                <StatusDot active={c.useYn} />
                <span className="collection-item-icon">
                  {c.folderType === 'data' ? '🗄' : '📂'}
                </span>
                <span className="collection-item-name">{c.folderName}</span>
                <div className="collection-item-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="collection-action-btn"
                    title="삭제"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, lineHeight: 1 }}
                    onClick={(e) => handleDelete(e, c)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.danger[6]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                 
                  <label className="toggle-switch" title={c.useYn ? '활성' : '비활성'}>
                    <input
                      type="checkbox"
                      checked={c.useYn}
                      onChange={() => {}}
                      onClick={(e) => handleToggleUseYn(e, c)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
              <div className="collection-item-meta">
                {c.folderType === 'data' ? 'data' : 'files'}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <p className="collection-empty">
            {keyword ? '검색 결과가 없습니다' : 'Folder가 없습니다'}
          </p>
        )}
      </div>

      {/* Create Folder Modal */}
      <BPConfirmAlert
        opened={newModalOpened}
        onClose={() => setNewModalOpened(false)}
        title="Create Folder"
        onConfirm={handleCreateFolder}
        confirmLabel="생성"
        confirmDisabled={!canCreate || createLoading}
        size="450px"
        zIndex={2000}
      >
        <CreateFolderContent
          folderName={newFolderName}
          setFolderName={setNewFolderName}
          folderType={newFolderType}
          setFolderType={setNewFolderType}
          error={newFolderError}
          setError={setNewFolderError}
        />
        {createLoading && <div className="collection-loader" />}
      </BPConfirmAlert>

      {/* Delete Confirm Modal */}
      <BPConfirmAlert
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="삭제 확인"
        onConfirm={confirmDelete}
        confirmLabel="삭제"
        confirmDisabled={deleteLoading}
        danger
        size="400px"
        zIndex={2000}
      >
        <p className="collection-delete-msg">
          "{folderToDelete?.folderName}" 폴더를 삭제하시겠습니까?
        </p>
        {deleteLoading && <div className="collection-loader" />}
      </BPConfirmAlert>
    </div>
  )
}

export default CollectionList
