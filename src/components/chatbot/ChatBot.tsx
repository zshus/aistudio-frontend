import { useState, useRef, useEffect } from 'react'
import './ChatBot.css'
import { chatApi } from '@/api/endpoints'

interface Message {
  role: 'user' | 'bot'
  content: string
  sources?: { file_name: string; score: number }[]
  routing?: { name: string; type: string; score: number }[]
}

const DEFAULT_ROOM_ID = 1

function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<{ abort: () => void } | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const history = messages.map((m) => ({
    role: m.role === 'bot' ? 'assistant' : 'user',
    content: m.content,
  }))

  const handleSend = () => {
    const text = input.trim()
    if (!text || streaming) return

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setStreaming(true)

    const botIndex = messages.length + 1
    setMessages((prev) => [...prev, { role: 'bot', content: '' }])

    let botContent = ''

    const es = chatApi.streamMessage(
      DEFAULT_ROOM_ID,
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
      (sources) => {
        setMessages((prev) =>
          prev.map((m, i) => (i === botIndex ? { ...m, sources } : m))
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
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: 4, fontSize: 11, opacity: 0.6 }}>
                    출처: {msg.sources.map((s) => s.file_name).join(', ')}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="메시지 입력..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={streaming}
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
