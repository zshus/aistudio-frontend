import { colors } from '@/styles/common'

interface FileOverwriteContentProps {
  file: globalThis.File | null
  setFile: (file: globalThis.File | null) => void
  error: string | null
}

export function FileOverwriteContent({ file, setFile, error }: FileOverwriteContentProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null)
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
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M12 11v6M9 14l3 3 3-3" />
        </svg>
        <span style={{ fontSize: 13, color: colors.gray[6] }}>
          {file ? file.name : '클릭하여 파일 선택'}
        </span>
        <input
          type="file"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      </label>

      {error && (
        <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>
      )}
    </div>
  )
}

export default FileOverwriteContent
