import { useState, useEffect } from 'react'
import './UserInfoMenu.css'
import { userApi } from '@/api/endpoints'
import type { User } from '@/types/user'

function UserInfoMenu() {
  const [list, setList] = useState<User[]>([])

  useEffect(() => {
    userApi.getAllList().then(setList)
  }, [])

  return (
    <div className="user-info-container">
      <h2 className="user-info-title">사용자 정보 조회</h2>
      <table className="user-info-table">
        <thead>
          <tr>
            <th>아이디</th>
            <th>이메일</th>
          </tr>
        </thead>
        <tbody>
          {list.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserInfoMenu
