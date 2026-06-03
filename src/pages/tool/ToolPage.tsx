import { useEffect, useState } from 'react'
import { toolApi } from '@/api/endpoints'
import type { Tool, ToolPayload } from '@/types/tool'
import { BPConfirmAlert } from '@/components/common/BPConfirmAlert'
import ToolForm from '@/components/tool/ToolForm'
import './ToolPage.css'

const EMPTY_FORM: Omit<ToolPayload, 'id'> & { toolId: string } = {
  toolId: '',
  name: '',
  description: '',
  keywords: [],
  useYn: true,
  hidden: false,
}

function ToolPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [createOpened, setCreateOpened] = useState(false)
  const [editTarget, setEditTarget] = useState<Tool | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Tool | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  const fetch = () => {
    toolApi.list().then(setTools).catch(console.error)
  }

  useEffect(() => { fetch() }, [])

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM)
    setCreateOpened(true)
  }

  const handleOpenEdit = (tool: Tool) => {
    setForm({
      toolId: tool.toolId,
      name: tool.name,
      description: tool.description,
      keywords: tool.keywords,
      useYn: tool.useYn,
      hidden: tool.hidden,
    })
    setEditTarget(tool)
  }

  const handleCreate = async () => {
    if (!form.toolId.trim() || !form.name.trim()) return
    setLoading(true)
    try {
      await toolApi.create(form)
      fetch()
      setCreateOpened(false)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleUpdate = async () => {
    if (!editTarget || !form.name.trim()) return
    setLoading(true)
    try {
      await toolApi.update({ ...form, id: editTarget.id })
      fetch()
      setEditTarget(null)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)
    try {
      await toolApi.delete(deleteTarget.id)
      fetch()
      setDeleteTarget(null)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <span className="tool-page-title">Tool 관리</span>
        <button className="tool-add-btn" onClick={handleOpenCreate}>+ 추가</button>
      </div>

      <table className="tool-table">
        <thead>
          <tr>
            <th style={{ width: 130 }}>Tool ID</th>
            <th style={{ width: 100 }}>이름</th>
            <th>설명</th>
            <th>키워드</th>
            <th style={{ width: 70 }}>상태</th>
            <th style={{ width: 60 }}>숨김</th>
            <th style={{ width: 80 }}>액션</th>
          </tr>
        </thead>
        <tbody>
          {tools.length === 0 && (
            <tr>
              <td colSpan={7} className="tool-empty">등록된 Tool이 없습니다</td>
            </tr>
          )}
          {tools.map((t) => (
            <tr key={t.id}>
              <td><code style={{ fontSize: 11 }}>{t.toolId}</code></td>
              <td>{t.name}</td>
              <td style={{ color: '#475569' }}>{t.description}</td>
              <td>
                <div className="tool-keywords">
                  {t.keywords.map((kw) => (
                    <span key={kw} className="tool-keyword-tag">{kw}</span>
                  ))}
                </div>
              </td>
              <td>
                <span className={`tool-badge ${t.useYn ? 'active' : 'inactive'}`}>
                  {t.useYn ? '활성' : '비활성'}
                </span>
              </td>
              <td>
                {t.hidden && <span className="tool-badge hidden">숨김</span>}
              </td>
              <td>
                <button className="tool-action-btn" onClick={() => handleOpenEdit(t)}>수정</button>
                <button className="tool-action-btn delete" onClick={() => setDeleteTarget(t)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 생성 모달 */}
      <BPConfirmAlert
        opened={createOpened}
        onClose={() => setCreateOpened(false)}
        title="Tool 추가"
        onConfirm={handleCreate}
        confirmLabel="생성"
        confirmDisabled={!form.toolId.trim() || !form.name.trim() || loading}
        size="520px"
        zIndex={2000}
      >
        <ToolForm form={form} setForm={setForm} isCreate />
      </BPConfirmAlert>

      {/* 수정 모달 */}
      <BPConfirmAlert
        opened={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Tool 수정"
        onConfirm={handleUpdate}
        confirmLabel="저장"
        confirmDisabled={!form.name.trim() || loading}
        size="520px"
        zIndex={2000}
      >
        <ToolForm form={form} setForm={setForm} />
      </BPConfirmAlert>

      {/* 삭제 확인 모달 */}
      <BPConfirmAlert
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="삭제 확인"
        onConfirm={handleDelete}
        confirmLabel="삭제"
        confirmDisabled={loading}
        danger
        size="400px"
        zIndex={2000}
      >
        <p style={{ fontSize: 14, color: '#475569' }}>
          "{deleteTarget?.name}" ({deleteTarget?.toolId}) Tool을 삭제하시겠습니까?
        </p>
      </BPConfirmAlert>
    </div>
  )
}

export default ToolPage
