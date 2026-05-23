import { useState, useEffect, useRef } from 'react'
import { colors } from '@/styles/common'
import { vectorDBAPI } from '@/api/endpoints'
import type { VdbFile } from '@/types/vector'

interface KeywordPopupProps {
  file: VdbFile
  folderId: number
  initialKeywords: string[]
  onClose: () => void
  onSaved: (fileId: number, keywords: string[]) => void
}

export function KeywordPopup({ file, folderId, initialKeywords, onClose, onSaved }: KeywordPopupProps) {
  const [keywords, setKeywords] = useState<string[]>(initialKeywords)
  const [newKeyword, setNewKeyword] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // ESC로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleExtract = async () => {
    setExtracting(true)
    setError(null)
    try {
      const res = await vectorDBAPI.extractKeywords(file.fileId, folderId, file.fileName ?? '')
      setKeywords(res.keywords)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '키워드 추출에 실패했습니다.')
    } finally {
      setExtracting(false)
    }
  }

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
    const kw = newKeyword.trim()
    if (kw && !keywords.includes(kw)) setKeywords((prev) => [...prev, kw])
    setNewKeyword('')
  }

  const handleRemove = (kw: string) => setKeywords((prev) => prev.filter((k) => k !== kw))

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await vectorDBAPI.saveKeywords(file.fileId, folderId, file.fileName ?? '', keywords)
      onSaved(file.fileId, res.keywords)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    // 오버레이
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* 팝업 본체 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 12, padding: 24, width: 480,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: colors.gray[7] }}>키워드 관리</div>
            <div style={{ fontSize: 12, color: colors.gray[5], marginTop: 2 }}>{file.fileName}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: colors.gray[5], lineHeight: 1 }}
          >✕</button>
        </div>

        {/* 키워드 뱃지 영역 */}
        <div style={{
          minHeight: 60, padding: 12, borderRadius: 8,
          border: `1px solid ${colors.gray[2]}`, backgroundColor: colors.gray[0],
          display: 'flex', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start',
        }}>
          {keywords.length === 0 ? (
            <span style={{ fontSize: 12, color: colors.gray[5] }}>키워드가 없습니다. 추출하거나 직접 입력하세요.</span>
          ) : (
            keywords.map((kw) => (
              <span
                key={kw}
                style={{
                  fontSize: 12, padding: '3px 8px', borderRadius: 12,
                  backgroundColor: colors.primary[0], color: colors.primary[7],
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                {kw}
                <button
                  onClick={() => handleRemove(kw)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 11, color: colors.primary[7], lineHeight: 1 }}
                >✕</button>
              </span>
            ))
          )}
        </div>

        {/* 키워드 직접 입력 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            placeholder="키워드 직접 입력 후 Enter"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={handleAddKeyword}
            style={{
              flex: 1, fontSize: 13, padding: '7px 12px', borderRadius: 8,
              border: `1px solid ${colors.gray[2]}`, outline: 'none',
            }}
          />
          <button
            onClick={handleExtract}
            disabled={extracting}
            style={{
              fontSize: 12, padding: '7px 14px', borderRadius: 8, whiteSpace: 'nowrap',
              border: `1px solid ${colors.primary[3]}`, color: colors.primary[5],
              background: 'none', cursor: extracting ? 'wait' : 'pointer',
            }}
          >
            {extracting ? '추출 중...' : 'AI 자동 추출'}
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div style={{ fontSize: 12, color: '#ef4444', padding: '6px 10px', borderRadius: 6, backgroundColor: '#fef2f2' }}>
            {error}
          </div>
        )}

        {/* 하단 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              fontSize: 13, padding: '8px 18px', borderRadius: 8,
              border: `1px solid ${colors.gray[2]}`, color: colors.gray[6],
              background: 'none', cursor: 'pointer',
            }}
          >취소</button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              fontSize: 13, padding: '8px 18px', borderRadius: 8,
              background: colors.primary[5], color: '#fff',
              border: 'none', cursor: saving ? 'wait' : 'pointer',
            }}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
