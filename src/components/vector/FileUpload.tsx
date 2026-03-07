import { colors } from '@/styles/common'

interface FileUploadContentProps {
  files: globalThis.File[]
  setFiles: (files: globalThis.File[]) => void
  error: string | null
}

export function FileUploadContent({ files, setFiles, error }: FileUploadContentProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '24px 16px',
          border: `2px dashed ${error ? '#ef4444' : colors.gray[2]}`,
          borderRadius: 8,
          backgroundColor: colors.gray[0],
          cursor: 'pointer',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.gray[5]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span style={{ fontSize: 13, color: colors.gray[6] }}>
          클릭하여 파일 선택
        </span>
        <input
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      </label>

      {files.length > 0 && (
        <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 13, color: colors.gray[7] }}>
          {files.map((f, i) => (
            <li key={i}>{f.name}</li>
          ))}
        </ul>
      )}

      {error && (
        <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>
      )}
    </div>
  )
}

export default FileUploadContent
