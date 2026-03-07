import './Sidebar.css'
import { MENUS, type MenuKey } from '../../config/menus'

export type { MenuKey }

interface SidebarProps {
  current: MenuKey
  onSelect: (menu: MenuKey) => void
}

function Sidebar({ current, onSelect }: SidebarProps) {
  return (
    <nav className="sidebar">
      <ul className="sidebar-menu">
        {MENUS.map((item) => (
          <li key={item.key}>
            <button
              className={`sidebar-item ${current === item.key ? 'active' : ''}`}
              onClick={() => onSelect(item.key)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Sidebar
