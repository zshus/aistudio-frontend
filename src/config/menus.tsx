import { useState, useEffect } from 'react'
import type { ComponentType } from 'react'
import UserInfoMenu from '../pages/userInfo/UserInfoMenu'
import VectorPage from '../pages/vector/VectorPage'

// 메뉴 추가 시 여기에만 추가하면 됩니다
export const MENUS = [
  { key: 'home'     as const, label: '홈',            component: null as ComponentType | null },
  { key: 'userInfo' as const, label: '사용자 정보 조회', component: UserInfoMenu as ComponentType },
  { key: 'vector'   as const, label: 'Vector DB',     component: VectorPage as ComponentType },
]

export type MenuKey = typeof MENUS[number]['key']

const VALID_KEYS = MENUS.map((m) => m.key)

function getMenuFromURL(): MenuKey {
  const param = new URLSearchParams(window.location.search).get('menu')
  return VALID_KEYS.includes(param as MenuKey) ? (param as MenuKey) : 'home'
}

export function useMenuParam(): [MenuKey, (menu: MenuKey) => void] {
  const [menu, setMenu] = useState<MenuKey>(getMenuFromURL)

  useEffect(() => {
    const handler = () => setMenu(getMenuFromURL())
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  const navigate = (key: MenuKey) => {
    const url = key === 'home' ? '/' : `/?menu=${key}`
    window.history.pushState(null, '', url)
    setMenu(key)
  }

  return [menu, navigate]
}
