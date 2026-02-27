import './MainPage.css'

interface MainPageProps {
  onLogout: () => void
}

function MainPage({ onLogout }: MainPageProps) {
  return (
    <div className="main-container">
      <header className="main-header">
        <h1>메인 화면</h1>
        <button className="logout-button" onClick={onLogout}>로그아웃</button>
      </header>
      <main className="main-content">
        <p>로그인에 성공했습니다. 환영합니다!</p>
      </main>
    </div>
  )
}

export default MainPage
