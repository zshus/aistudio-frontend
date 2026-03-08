import { useState } from 'react'
import './MainPage.css'
import ChatBot from '../../components/chatbot/ChatBot'
import Sidebar from '../../components/sidebar/Sidebar'
import { useMenuParam, MENUS } from '../../config/menus'

interface MainPageProps {
  onLogout: () => void
}

function MainPage({ onLogout }: MainPageProps) {
  const [currentMenu, navigate] = useMenuParam()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderContent = () => {
    const menu = MENUS.find((m) => m.key === currentMenu)
    if (menu?.component) {
      const Component = menu.component
      return <Component />
    }
    return (
      <div className="main-content">
        <p>로그인에 성공했습니다. 환영합니다!
        </p>
      </div>
    )
  }

  return (
    <div className="main-container">
      <header className="main-header">
        <div className="main-header-left">
          <button className="menu-toggle" onClick={() => setSidebarOpen((v) => !v)}>☰</button>
          <h1>Vector DB</h1>
        </div>
        <button className="logout-button" onClick={onLogout}>로그아웃</button>
      </header>
      <div className="main-body">
        {sidebarOpen && <Sidebar current={currentMenu} onSelect={navigate} />}
        <div className="main-page-content">
          {renderContent()}
        </div>
      </div>
      <ChatBot />
    </div>
  )
}

export default MainPage
