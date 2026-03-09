import { Outlet, useLocation, useNavigate } from 'react-router'
import { useAppSelector } from '../redux/hooks'
import { selectIsAuthenticated } from '../redux/slices/authSlice'
import { useEffect } from 'react'

export default function AuthLayout() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate('/login', {
        state: { from: location },
        replace: true
      })
    }
  }, [isAuthenticated, location, navigate])

  if (!isAuthenticated) {
    return null
  }

  return <Outlet />
}
