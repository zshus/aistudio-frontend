import { useState, useRef, useEffect } from 'react'
import './ChatBot.css'

interface Message {
  role: 'user' | 'bot'
  content: string
}

function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')

    // TODO: 백엔드 API 연동
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'bot', content: '준비 중입니다.' }])
    }, 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
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
                {msg.content}
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
            />
            <button className="chat-send" onClick={handleSend}>전송</button>
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
