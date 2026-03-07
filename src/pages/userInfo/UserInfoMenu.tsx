import './UserInfoMenu.css'

// TODO: API 연동 시 이 데이터를 fetch로 교체
const mockUserInfo = {
  username: '홍길동',
  email: 'hong@example.com',
}

function UserInfoMenu() {
  const user = mockUserInfo

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
          <tr>
            <td>{user.username}</td>
            <td>{user.email}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default UserInfoMenu
