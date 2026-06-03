import { useState } from 'react'
import type { ToolPayload } from '@/types/tool'

interface ToolFormProps {
  form: Omit<ToolPayload, 'id'> & { toolId: string }
  setForm: (f: Omit<ToolPayload, 'id'> & { toolId: string }) => void
  isCreate?: boolean
}

function ToolForm({ form, setForm, isCreate = false }: ToolFormProps) {
  const [keywordInput, setKeywordInput] = useState('')

  const addKeyword = () => {
    const kw = keywordInput.trim()
    if (!kw || form.keywords.includes(kw)) return
    setForm({ ...form, keywords: [...form.keywords, kw] })
    setKeywordInput('')
  }

  const removeKeyword = (kw: string) => {
    setForm({ ...form, keywords: form.keywords.filter((k) => k !== kw) })
  }

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addKeyword() }
  }

  return (
    <div>
      {isCreate && (
        <div className="tool-form-row">
          <label className="tool-form-label">Tool ID <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            className="tool-form-input"
            value={form.toolId}
            onChange={(e) => setForm({ ...form, toolId: e.target.value })}
            placeholder="예: general_chat"
          />
          <div className="tool-form-error" style={{ color: '#94a3b8' }}>
            영문/숫자/언더스코어만 사용 (예: web_search)
          </div>
        </div>
      )}

      <div className="tool-form-row">
        <label className="tool-form-label">이름 <span style={{ color: '#ef4444' }}>*</span></label>
        <input
          className="tool-form-input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="표시 이름"
        />
      </div>

      <div className="tool-form-row">
        <label className="tool-form-label">설명</label>
        <textarea
          className="tool-form-textarea"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="tool 설명"
        />
      </div>

      <div className="tool-form-row">
        <label className="tool-form-label">키워드</label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input
            className="tool-form-input"
            style={{ flex: 1 }}
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeywordKeyDown}
            placeholder="키워드 입력 후 Enter 또는 추가 버튼"
          />
          <button
            type="button"
            onClick={addKeyword}
            style={{ padding: '6px 12px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
          >
            추가
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {form.keywords.map((kw) => (
            <span
              key={kw}
              style={{ background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: 4, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {kw}
              <span onClick={() => removeKeyword(kw)} style={{ color: '#94a3b8', fontWeight: 700 }}>×</span>
            </span>
          ))}
        </div>
      </div>

      <div className="tool-form-row" style={{ display: 'flex', gap: 20 }}>
        <label className="tool-form-checkbox-row">
          <input
            type="checkbox"
            checked={form.useYn}
            onChange={(e) => setForm({ ...form, useYn: e.target.checked })}
          />
          활성화
        </label>
        <label className="tool-form-checkbox-row">
          <input
            type="checkbox"
            checked={form.hidden}
            onChange={(e) => setForm({ ...form, hidden: e.target.checked })}
          />
          숨김 (라우팅에는 포함, 목록에는 미노출)
        </label>
      </div>
    </div>
  )
}

export default ToolForm
