import { useState, useEffect } from 'react'
import type { FileTableProps, VdbFile } from '@/types/vector'
import { colors, border } from '@/styles/common'
import { vectorDBAPI } from '@/api/endpoints'
import { KeywordPopup } from './KeywordPopup'

const cellCenter = {
  padding: '10px 12px',
  textAlign: 'center' as const,
  verticalAlign: 'middle' as const,
}

const cellCenterWrapper = {
  display: 'flex' as const,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
}

const HEADERS = ['Item No.', 'Activate', 'File Name', 'Keywords', '']

interface ExtendedFileTableProps extends FileTableProps {
  folderId?: number | null
}

export function FileTable({ entities, onSelect, onToggleActivate, onDelete, onOverwrite, folderId }: ExtendedFileTableProps) {
  const [keywordsMap, setKeywordsMap] = useState<Record<number, string[]>>({})
  const [popupFile, setPopupFile] = useState<VdbFile | null>(null)

  // 파일 목록 로드 시 DB keywords 우선 표시, 없으면 OpenSearch에서 조회
  useEffect(() => {
    if (entities.length === 0) return
    const dbMap: Record<number, string[]> = {}
    const needFetch: number[] = []

    entities.forEach((e) => {
      if (e.keywords && e.keywords.length > 0) {
        dbMap[e.fileId] = e.keywords
      } else {
        needFetch.push(e.fileId)
      }
    })

    setKeywordsMap((prev) => ({ ...prev, ...dbMap }))

    if (needFetch.length === 0) return
    Promise.all(
      needFetch.map((fileId) =>
        vectorDBAPI.getKeywords(fileId)
          .then((res) => ({ fileId, keywords: res.keywords }))
          .catch(() => ({ fileId, keywords: [] as string[] }))
      )
    ).then((results) => {
      const map: Record<number, string[]> = {}
      results.forEach(({ fileId, keywords }) => { if (keywords.length > 0) map[fileId] = keywords })
      setKeywordsMap((prev) => ({ ...prev, ...map }))
    })
  }, [entities])

  const handleKeywordsSaved = (fileId: number, keywords: string[]) => {
    setKeywordsMap((prev) => ({ ...prev, [fileId]: keywords }))
  }

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: border.default, backgroundColor: colors.gray[0] }}>
              {HEADERS.map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: '10px 12px', textAlign: 'center', fontWeight: 600,
                    color: colors.gray[7], fontSize: 12,
                    width: h === '' ? 70 : h === 'Item No.' ? 80 : h === 'Activate' ? 100 : h === 'Keywords' ? 220 : undefined,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entities.map((row: VdbFile, index: number) => {
              const keywords = keywordsMap[row.fileId] ?? []
              return (
                <tr
                  key={row.fileId}
                  style={{ borderBottom: `1px solid ${colors.gray[2]}`, cursor: 'pointer' }}
                  onClick={() => onSelect(row)}
                >
                  <td style={cellCenter}>{index + 1}</td>
                  <td style={cellCenter}>
                    <div style={cellCenterWrapper}>
                      <span onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex' }}>
                        <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', width: 28, height: 16, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={row.useYn}
                            style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                            onChange={(e) => onToggleActivate?.(row, e.currentTarget.checked)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span style={{ position: 'absolute', inset: 0, backgroundColor: row.useYn ? colors.primary[5] : colors.gray[2], borderRadius: 16, transition: 'background-color 0.2s' }} />
                          <span style={{ position: 'absolute', width: 12, height: 12, left: row.useYn ? 14 : 2, top: 2, backgroundColor: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
                        </label>
                      </span>
                    </div>
                  </td>
                  <td style={{ ...cellCenter, textAlign: 'left' as const, paddingLeft: 16 }}>
                    {row.fileName ?? ''}
                  </td>

                  {/* Keywords 컬럼 — 클릭 시 팝업 */}
                  <td
                    style={{ ...cellCenter, textAlign: 'left' as const, cursor: folderId ? 'pointer' : 'default' }}
                    onClick={(e) => { e.stopPropagation(); if (folderId) setPopupFile(row) }}
                    title={folderId ? '클릭하여 키워드 관리' : undefined}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                      {keywords.length > 0 ? (
                        <>
                          {keywords.slice(0, 4).map((kw) => (
                            <span
                              key={kw}
                              style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, backgroundColor: colors.primary[0], color: colors.primary[7], whiteSpace: 'nowrap' }}
                            >
                              {kw}
                            </span>
                          ))}
                          {keywords.length > 4 && (
                            <span style={{ fontSize: 10, color: colors.gray[5] }}>+{keywords.length - 4}</span>
                          )}
                        </>
                      ) : folderId ? (
                        <span style={{ fontSize: 11, color: colors.gray[5] }}>클릭하여 추출</span>
                      ) : null}
                    </div>
                  </td>

                  <td style={cellCenter}>
                    <div style={{ ...cellCenterWrapper, gap: 4 }}>
                      <button
                        title="삭제"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, lineHeight: 1 }}
                        onClick={(e) => { e.stopPropagation(); onDelete?.(row) }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.danger[6]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                      <button
                        title="덮어쓰기"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, lineHeight: 1 }}
                        onClick={(e) => { e.stopPropagation(); onOverwrite?.(row) }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.gray[6]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                          <path d="M12 11v6M9 14l3 3 3-3" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {entities.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: colors.gray[5], fontSize: 13 }}>
                  파일이 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 키워드 팝업 */}
      {popupFile && folderId && (
        <KeywordPopup
          file={popupFile}
          folderId={folderId}
          initialKeywords={keywordsMap[popupFile.fileId] ?? []}
          onClose={() => setPopupFile(null)}
          onSaved={handleKeywordsSaved}
        />
      )}
    </>
  )
}

export default FileTable
