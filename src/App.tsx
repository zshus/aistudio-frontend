import { useState } from 'react'
import LoginPage from './login/LoginPage'
import RegisterPage from './register/RegisterPage'
import MainPage from './MainPage'
import { getToken, removeToken } from './api'

function App() {
  const [token, setToken] = useState<string | null>(() => getToken())
  const [view, setView] = useState<'login' | 'register'>('login')

  if (token) {
    return <MainPage onLogout={() => { removeToken(); setToken(null) }} />
  }
  if (view === 'register') {
    return <RegisterPage onRegisterSuccess={() => setView('login')} onBack={() => setView('login')} />
  }
  return <LoginPage onLogin={(t: string) => setToken(t)} onRegister={() => setView('register')} />
}

export default App
