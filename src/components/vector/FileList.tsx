import { useEffect, useState } from 'react'
import { vectorDBAPI } from '@/api/endpoints'
import FileTable from './FileTable'
import type { VdbFile, FileListProps } from '@/types/vector'
import { colors } from '@/styles/common'
import { FileUploadContent } from './FileUpload'
import { FileOverwriteContent } from './FileOverwrite'
import { BPConfirmAlert } from '@/components/common/BPConfirmAlert'

export function FileList({ collectionName, collectionId, onFileDeleted, onUploadFiles }: FileListProps) {
    const [entities, setEntities] = useState<VdbFile[]>([])
    const [selectedEntity, setSelectedEntity] = useState<VdbFile | null>(null)
    const [overwriteModalOpened, setOverwriteModalOpened] = useState(false)

    const [uploadModalOpened, setUploadModalOpened] = useState(false)
    const [uploadFiles, setUploadFiles] = useState<globalThis.File[]>([])
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [uploadLoading, setUploadLoading] = useState(false)

    const [overwriteFile, setOverwriteFile] = useState<globalThis.File | null>(null)
    const [overwriteError, setOverwriteError] = useState<string | null>(null)
    const [overwriteLoading, setOverwriteLoading] = useState(false)

    const [deleteModalOpened, setDeleteModalOpened] = useState(false)
    const [fileToDelete, setFileToDelete] = useState<VdbFile | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const handleSelectEntity = (entity: VdbFile) => {
        setSelectedEntity(entity)
    }

    const handleToggleActivate = async (row: VdbFile, nextChecked: boolean) => {
        try {
            // 나중에 구현
            setEntities(prev => prev.map(item =>
                item.fileId === row.fileId ? { ...item, useYn: nextChecked } : item),
            )
        } catch (error) {
            console.error('Failed to update useYn:', error)
        }
    }

    const handleDelete = async () => {
        if (!fileToDelete) return
        setDeleteLoading(true)
        try {
            await vectorDBAPI.deleteVdbFile({ fileId: fileToDelete.fileId })
            setEntities(prev => prev.filter(item => item.fileId !== fileToDelete.fileId))
            onFileDeleted?.(collectionId)
            setDeleteModalOpened(false)
            setFileToDelete(null)
        } catch (error) {
            console.error('Failed to delete file:', error)
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleUpload = async () => {
        if (uploadFiles.length === 0 || !collectionId) return
        setUploadLoading(true)
        setUploadError(null)
        try {
            await Promise.all(uploadFiles.map(file => vectorDBAPI.uploadVdbFile(file, collectionId)))
            onUploadFiles?.(collectionId, uploadFiles.length)
            setUploadModalOpened(false)
            fetchEntities()
        } catch (e) {
            setUploadError('업로드에 실패했습니다.')
            console.error(e)
        } finally {
            setUploadLoading(false)
        }
    }

    const handleOpenUpload = () => {
        setUploadFiles([])
        setUploadError(null)
        setUploadModalOpened(true)
    }

    const handleOverwrite = async () => {
        if (!overwriteFile || !selectedEntity) return
        setOverwriteLoading(true)
        setOverwriteError(null)
        try {
            const updatedFile = await vectorDBAPI.overwriteVdbFile(overwriteFile, selectedEntity.fileId)
            setEntities(prev => prev.map(item =>
                item.fileId === updatedFile.fileId ? updatedFile : item,
            ))
            setOverwriteModalOpened(false)
        } catch (e) {
            setOverwriteError('덮어쓰기에 실패했습니다.')
            console.error(e)
        } finally {
            setOverwriteLoading(false)
        }
    }

    const handleOpenOverwrite = (row: VdbFile) => {
        setSelectedEntity(row)
        setOverwriteFile(null)
        setOverwriteError(null)
        setOverwriteModalOpened(true)
    }

    const fetchEntities = () => {
        if (!collectionId) return
        vectorDBAPI.listVdbFile(collectionId).then(setEntities).catch(console.error)
    }

    useEffect(() => {
        if (!collectionName) return
        fetchEntities()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionName])

    if (!collectionName) {
        return (
            <div style={{ padding: 24, color: colors.gray[6], fontSize: 14 }}>
                Select a collection
            </div>
        )
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button
                    style={{
                        backgroundColor: '#3b82f6',
                        border: 'none',
                        borderRadius: 6,
                        color: '#fff',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 13,
                        fontWeight: 600,
                        padding: '0.35rem 0.75rem',
                    }}
                    onClick={handleOpenUpload}
                >
                    File Upload
                </button>
            </div>

            <FileTable
                entities={entities}
                onSelect={handleSelectEntity}
                onToggleActivate={handleToggleActivate}
                onDelete={(row) => {
                    setFileToDelete(row)
                    setDeleteModalOpened(true)
                }}
                onOverwrite={(row) => handleOpenOverwrite(row)}
            />

            {/* Upload Modal */}
            <BPConfirmAlert
                opened={uploadModalOpened}
                onClose={() => setUploadModalOpened(false)}
                title="File Upload"
                onConfirm={handleUpload}
                confirmLabel="업로드"
                confirmDisabled={uploadFiles.length === 0 || uploadLoading}
                size="425px"
                zIndex={2000}
            >
                <FileUploadContent
                    files={uploadFiles}
                    setFiles={setUploadFiles}
                    error={uploadError}
                />
                {uploadLoading && <div className="collection-loader" style={{ margin: '12px auto 0' }} />}
            </BPConfirmAlert>

            {/* Overwrite Modal */}
            <BPConfirmAlert
                opened={overwriteModalOpened}
                onClose={() => setOverwriteModalOpened(false)}
                title="Overwrite File Upload"
                onConfirm={handleOverwrite}
                confirmLabel="덮어쓰기"
                confirmDisabled={!overwriteFile || overwriteLoading}
                size="425px"
                zIndex={2000}
            >
                <FileOverwriteContent
                    file={overwriteFile}
                    setFile={setOverwriteFile}
                    error={overwriteError}
                />
                {overwriteLoading && <div className="collection-loader" style={{ margin: '12px auto 0' }} />}
            </BPConfirmAlert>

            {/* Delete Modal */}
            <BPConfirmAlert
                opened={deleteModalOpened}
                onClose={() => {
                    setDeleteModalOpened(false)
                    setFileToDelete(null)
                }}
                title="삭제 확인"
                onConfirm={handleDelete}
                confirmLabel="삭제"
                danger
                size="400px"
                zIndex={2000}
            >
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155' }}>
                    "{fileToDelete?.fileName}" 파일을 삭제하시겠습니까?
                </p>
                {deleteLoading && <div className="collection-loader" style={{ margin: '12px auto 0' }} />}
            </BPConfirmAlert>
        </div>
    )
}

export default FileList
