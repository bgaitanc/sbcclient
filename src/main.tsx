import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StyledEngineProvider } from '@mui/material/styles'
import './index.css'
import App from '@/App.tsx'
import { CssBaseline, GlobalStyles } from '@mui/material'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyledEngineProvider enableCssLayer>
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      <CssBaseline />
      <App />
    </StyledEngineProvider>
  </StrictMode>
)
