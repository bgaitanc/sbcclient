import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { LoginRes } from '@shared/types/login/loginValues.ts'

interface User {
  userId: string
  userName?: string
  email: string
  roles: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

const getInitialUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem('user')
  if (user === null) return null
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Rehidratación del estado del usuario desde localStorage
    return JSON.parse(user) as User
  } catch {
    return null
  }
}

const initialState: AuthState = {
  user: getInitialUser(),
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  refreshToken:
    typeof window !== 'undefined'
      ? localStorage.getItem('refresh-token')
      : null,
  isAuthenticated:
    typeof window !== 'undefined'
      ? localStorage.getItem('token') !== null
      : false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<LoginRes>) => {
      const { payload } = action
      const { token, refreshToken, ...userData } = payload
      state.user = userData
      state.token = token
      state.refreshToken = refreshToken
      state.isAuthenticated = true
      localStorage.setItem('token', token)
      localStorage.setItem('refresh-token', refreshToken)
      localStorage.setItem('user', JSON.stringify(userData))
    },
    updateToken: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string }>
    ) => {
      const { payload } = action
      const { token, refreshToken } = payload
      state.token = token
      state.refreshToken = refreshToken
      localStorage.setItem('token', token)
      localStorage.setItem('refresh-token', refreshToken)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('refresh-token')
      localStorage.removeItem('user')
    }
  }
})

const { actions, reducer } = authSlice

export const { setCredentials, updateToken, logout } = actions

export default reducer

export const selectCurrentUser = ({ auth }: { auth: AuthState }) => auth.user
export const selectIsAuthenticated = ({ auth }: { auth: AuthState }) =>
  auth.isAuthenticated
export const selectToken = ({ auth }: { auth: AuthState }) => auth.token
export const selectRefreshToken = ({ auth }: { auth: AuthState }) =>
  auth.refreshToken
