import './Folder.css'
import {CreateFolderContentProps} from '../../types/vector'

const FOLDER_TYPES = [
  { value: 'file', label: 'File', description: '파일 업로드 기반' },
  { value: 'data', label: 'Data', description: '데이터 스케줄 기반' },
] as const



export function CreateFolderContent({
  folderName,
  setFolderName,
  folderType,
  setFolderType,
  error,
  setError,
}: CreateFolderContentProps) {
  const isValidEnglish = (text: string) => /^[\x21-\x7E]*$/.test(text)

  return (
    <div className="folder-stack">
      <div className="folder-field">
        <span className="folder-label">Folder Name</span>
        <input
          className={`folder-input ${error ? 'folder-input-error' : ''}`}
          type="text"
          value={folderName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            if (value && !isValidEnglish(value)) {
              setError('영문, 숫자, 특수문자(_/-)만 입력 가능합니다.')
            } else {
              setFolderName(value)
              setError(null)
            }
          }}
          placeholder="ex) Sales_Docs"
        />
        {error && <span className="folder-error">{error}</span>}
      </div>

      <div className="folder-field">
        <span className="folder-label">Folder Type</span>
        <div className="folder-type-grid">
          {FOLDER_TYPES.map(({ value, label, description }) => {
            const selected = folderType === value
            return (
              <div
                key={value}
                className={`folder-type-card ${selected ? 'selected' : ''}`}
                onClick={() => setFolderType(value)}
              >
                <span className="folder-type-label">{label}</span>
                <span className="folder-type-desc">{description}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CreateFolderContent
