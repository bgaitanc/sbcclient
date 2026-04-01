import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  modularCssLayers: '@layer theme, base, mui, components, utilities;',
  cssVariables: {
    colorSchemeSelector: 'class'
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#4c662b',
          contrastText: '#ffffff'
        },
        secondary: {
          main: '#586249',
          contrastText: '#ffffff'
        },
        error: {
          main: '#ba1a1a',
          contrastText: '#ffffff'
        },
        background: {
          default: '#f9faef',
          paper: '#f9faef'
        },
        text: {
          primary: '#1a1c16',
          secondary: '#44483d'
        }
      }
    },
    dark: {
      palette: {
        primary: {
          main: '#b1d18a',
          contrastText: '#1f3701'
        },
        secondary: {
          main: '#bfccad',
          contrastText: '#2a331e'
        },
        error: {
          main: '#ffb4ab',
          contrastText: '#690005'
        },
        background: {
          default: '#12140e',
          paper: '#12140e'
        },
        text: {
          primary: '#e2e3d8',
          secondary: '#c5c8ba'
        }
      }
    }
  }
})

export default theme
