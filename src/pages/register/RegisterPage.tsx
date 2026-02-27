import { useState, FormEvent } from 'react'
import '../login/LoginPage.css'
import { api } from '../../api/endpoints'
import {RegisterPageProps} from'../../types/user'


function RegisterPage({ onRegisterSuccess, onBack }: RegisterPageProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!username || !email || !password) {
      setError('모든 항목을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', { username, email, password })
      onRegisterSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>회원가입</h1>
          <p>새 계정을 만드세요</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">아이디</label>
            <input
              id="username"
              type="text"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="login-footer">
          <span>이미 계정이 있으신가요? <a href="#" onClick={(e) => { e.preventDefault(); onBack() }}>로그인</a></span>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
