import { ReactNode } from 'react'
import './BPConfirmAlert.css'

interface BPConfirmAlertProps {
  opened: boolean
  onClose: () => void
  title: string
  onConfirm: () => void
  confirmLabel?: string
  confirmDisabled?: boolean
  danger?: boolean
  size?: string
  zIndex?: number
  children?: ReactNode
}

export function BPConfirmAlert({
  opened,
  onClose,
  title,
  onConfirm,
  confirmLabel = '확인',
  confirmDisabled = false,
  danger = false,
  size = '400px',
  zIndex = 1000,
  children,
}: BPConfirmAlertProps) {
  if (!opened) return null

  return (
    <div className="bp-overlay" style={{ zIndex }} onClick={onClose}>
      <div
        className="bp-modal"
        style={{ maxWidth: size }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bp-modal-header">
          <h3 className="bp-modal-title">{title}</h3>
        </div>
        <div className="bp-modal-body">{children}</div>
        <div className="bp-modal-footer">
          <button className="bp-btn-cancel" onClick={onClose}>
            취소
          </button>
          <button
            className={`bp-btn-confirm ${danger ? 'danger' : ''}`}
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BPConfirmAlert
