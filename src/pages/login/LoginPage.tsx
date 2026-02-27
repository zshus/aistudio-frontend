import { useState, FormEvent } from 'react'
import './LoginPage.css'
import { api, saveToken } from "../../api/endpoints";
import { LoginResponse,  LoginPageProps } from '../../types/user';


function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const data = await api.post<LoginResponse>('/auth/login', { username, password })
      saveToken(data.token)
      onLogin(data.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>로그인</h1>
          <p>계정에 접속하세요</p>
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
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="login-footer">
          <a href="#">비밀번호를 잊으셨나요?</a>
          <span>계정이 없으신가요? <a href="#" onClick={(e) => { e.preventDefault(); onRegister() }}>회원가입</a></span>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
