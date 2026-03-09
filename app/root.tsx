import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { StrictMode } from 'react'
import { StyledEngineProvider } from '@mui/material/styles'
import { CssBaseline, GlobalStyles } from '@mui/material'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import './index.css'
import * as React from 'react'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Vite + React</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <StrictMode>
          <Provider store={store}>
            <StyledEngineProvider enableCssLayer>
              <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
              <CssBaseline />
              {children}
            </StyledEngineProvider>
          </Provider>
        </StrictMode>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
