import { IconButton, useColorScheme } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { mode, setMode } = useColorScheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setMode(mode === 'light' ? 'dark' : 'light')
  }

  if (!mounted) {
    return <IconButton size="large" disabled />
  }

  return (
    <IconButton
      onClick={toggleTheme}
      color="inherit"
      size="large"
      aria-label="Cambiar tema"
    >
      {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
    </IconButton>
  )
}
