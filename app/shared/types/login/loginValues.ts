export interface LoginValues {
  username: string
  password: string
}

export type LoginReq = LoginValues

export interface LoginRes {
  userId: string
  userName: string
  email: string
  token: string
  refreshToken: string
  roles: string[]
}
