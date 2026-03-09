import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { LoginRes } from '@shared/types/login/loginValues.ts'

interface User {
  userId: string
  userName: string
  email: string
  roles: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
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
      state.refreshToken = token
      state.isAuthenticated = true
      localStorage.setItem('token', token)
      localStorage.setItem('refresh-token', refreshToken)
      localStorage.setItem('user', JSON.stringify(userData))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('refresh-token')
      localStorage.removeItem('user')
    }
  }
})

const { actions, reducer } = authSlice

export const { setCredentials, logout } = actions

export default reducer

export const selectCurrentUser = ({ auth }: { auth: AuthState }) => auth.user
export const selectIsAuthenticated = ({ auth }: { auth: AuthState }) =>
  auth.isAuthenticated
export const selectToken = ({ auth }: { auth: AuthState }) => auth.token
export const selectRefreshToken = ({ auth }: { auth: AuthState }) =>
  auth.refreshToken
