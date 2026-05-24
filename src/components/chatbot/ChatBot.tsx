import { useState, useRef, useEffect } from 'react'
import './ChatBot.css'
import { chatApi } from '@/api/endpoints'

interface Message {
  role: 'user' | 'bot'
  content: string
  sources?: any[]
  sourceType?: string
  routing?: { name: string; type: string; score: number }[]
  decision?: { tool: string; selected_ids: string[] }
}

function ChatBot() {
  const [open, setOpen] = useState(false)
  const [roomId, setRoomId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<{ abort: () => void } | null>(null)

  useEffect(() => {
    if (open && roomId === null) {
      chatApi.createRoom('채팅방').then((room) => setRoomId(room.roomId))
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const history = messages.map((m) => ({
    role: m.role === 'bot' ? 'assistant' : 'user',
    content: m.content,
  }))

  const handleSend = () => {
    const text = input.trim()
    if (!text || streaming || roomId === null) return

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setStreaming(true)

    const botIndex = messages.length + 1
    setMessages((prev) => [...prev, { role: 'bot', content: '' }])

    let botContent = ''

    const es = chatApi.streamMessage(
      roomId,
      text,
      history,
      undefined,
      5,
      (token) => {
        botContent += token
        setMessages((prev) =>
          prev.map((m, i) => (i === botIndex ? { ...m, content: botContent } : m))
        )
      },
      (targets) => {
        setMessages((prev) =>
          prev.map((m, i) => (i === botIndex ? { ...m, routing: targets } : m))
        )
      },
      (decision) => {
        setMessages((prev) =>
          prev.map((m, i) => (i === botIndex ? { ...m, decision } : m))
        )
      },
      (sources, sourceType) => {
        setMessages((prev) =>
          prev.map((m, i) => (i === botIndex ? { ...m, sources, sourceType } : m))
        )
        setStreaming(false)
      },
      (errMsg) => {
        setMessages((prev) =>
          prev.map((m, i) => (i === botIndex ? { ...m, content: `오류: ${errMsg}` } : m))
        )
        setStreaming(false)
      },
    )

    abortRef.current = es as unknown as { abort: () => void }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setStreaming(false)
  }

  return (
    <>
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <span>챗봇</span>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {messages.length === 0 && (
              <p className="chat-empty">무엇이든 물어보세요.</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>
                <div>{msg.content || (msg.role === 'bot' && streaming ? '...' : '')}</div>
                {msg.routing && msg.routing.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 11, opacity: 0.7 }}>
                    {msg.routing.map((t) => (
                      <span key={t.name} style={{ marginRight: 6 }}>
                        [{t.type}] {t.name} ({(t.score * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                )}
                {msg.decision && (
                  <div style={{ marginTop: 4, fontSize: 11, opacity: 0.75 }}>
                    {msg.decision.tool === 'rag_search'
                      ? (msg.sourceType ? '📄 문서 검색' : '📄 문서 검색 중...')
                      : msg.decision.tool === 'web_search'
                      ? (msg.sourceType ? '🌐 웹 검색' : '🌐 웹 검색 중...')
                      : '💬 일반 대화'}
                  </div>
                )}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: 4, fontSize: 11, opacity: 0.6 }}>
                    출처:{' '}
                    {msg.sourceType === 'web'
                      ? msg.sources.map((s: any, i: number) => (
                          <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{ marginRight: 6 }}>
                            {s.title || s.url}
                          </a>
                        ))
                      : msg.sources.map((s: any) => s.file_name).join(', ')}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder={roomId === null ? '채팅방 준비 중...' : '메시지 입력...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={streaming || roomId === null}
            />
            {streaming ? (
              <button className="chat-send" onClick={handleStop}>중지</button>
            ) : (
              <button className="chat-send" onClick={handleSend}>전송</button>
            )}
          </div>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen((v) => !v)}>
        💬
      </button>
    </>
  )
}

export default ChatBot
