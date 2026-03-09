import type { ReactNode } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import type { LinksFunction } from 'react-router-dom'
import { StyledEngineProvider } from '@mui/material/styles'
import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material'
import { Provider } from 'react-redux'
import { store } from '@redux/store'
import appStylesHref from './index.css?url'
import theme from './theme'

// eslint-disable-next-line react-refresh/only-export-components -- ignore
export const links: LinksFunction = () => [
  { rel: 'icon', href: '/favicon.ico' },
  { rel: 'stylesheet', href: appStylesHref }
]

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>SBC Client</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Provider store={store}>
          <StyledEngineProvider enableCssLayer>
            <ThemeProvider theme={theme}>
              <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
              <CssBaseline />
              {children}
            </ThemeProvider>
          </StyledEngineProvider>
        </Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
