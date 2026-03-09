import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAppSelector } from '../redux/hooks'
import { selectIsAuthenticated } from '../redux/slices/authSlice'
import Login from '@/modules/login/LoginModule.tsx'

export default function LoginPage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const navigate = useNavigate()

  const navigateToRoot = useCallback(() => {
    void navigate('/', { replace: true })
  }, [navigate])

  useEffect(() => {
    if (isAuthenticated) {
      navigateToRoot()
    }
  }, [isAuthenticated, navigateToRoot])

  return <Login />
}
