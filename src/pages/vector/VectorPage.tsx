import { useState } from 'react'
import { CollectionList } from '@/components/vector/Collection'
import { FileList } from '@/components/vector/FileList'
import './VectorPage.css'

function VectorPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [collectionName, setCollectionName] = useState<string | null>(null)
  const [collectionId, setCollectionId] = useState<number | null>(null)
  const [deletedFolderId, setDeletedFolderId] = useState<number | null>(null)
  const [uploadFolderId, setUploadFolderId] = useState<number | null>(null)
  const [uploadCount, setUploadCount] = useState<number | null>(null)

  const handleSelectFolder = (
    name: string | null,
    id: number | null,
    _type: string | null,
  ) => {
    setCollectionName(name)
    setCollectionId(id)
    setSelectedFolderId(id)
  }

  const handleFileDeleted = (folderId: number | null) => {
    setDeletedFolderId(folderId)
  }

  const handleUploadFiles = (folderId: number | null, count: number) => {
    setUploadFolderId(folderId)
    setUploadCount(count)
  }

  return (
    <div className="vector-page">
      <aside className="vector-sidebar">
        <CollectionList
          onSelect={handleSelectFolder}
          selectedFolderId={selectedFolderId}
          deletedFolderId={deletedFolderId}
          uploadFolderId={uploadFolderId}
          uploadCount={uploadCount}
        />
      </aside>
      <main className="vector-main">
        <FileList
          collectionName={collectionName}
          collectionId={collectionId}
          onFileDeleted={handleFileDeleted}
          onUploadFiles={handleUploadFiles}
        />
      </main>
    </div>
  )
}

export default VectorPage
