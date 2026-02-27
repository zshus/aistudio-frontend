export interface LoginResponse {
  token: string
  username: string
  email: string
}

export interface LoginPageProps {
  onLogin: (token: string) => void
  onRegister: () => void
}

export interface RegisterPageProps {
  onRegisterSuccess: () => void
  onBack: () => void
}