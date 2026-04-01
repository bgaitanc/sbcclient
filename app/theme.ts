import { createTheme } from '@mui/material/styles'

// Extend the Palette interface to include tertiary colors and containers
declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary']
    primaryContainer: Palette['primary']
    secondaryContainer: Palette['primary']
    tertiaryContainer: Palette['primary']
    errorContainer: Palette['primary']
    surfaceVariant: Palette['primary']
    outline: string
    outlineVariant: string
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions['primary']
    primaryContainer?: PaletteOptions['primary']
    secondaryContainer?: PaletteOptions['primary']
    tertiaryContainer?: PaletteOptions['primary']
    errorContainer?: PaletteOptions['primary']
    surfaceVariant?: PaletteOptions['primary']
    outline?: string
    outlineVariant?: string
  }
}

const theme = createTheme({
  modularCssLayers: '@layer theme, base, mui, components, utilities;',
  cssVariables: {
    colorSchemeSelector: 'class'
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#4C662B',
          contrastText: '#FFFFFF'
        },
        primaryContainer: {
          main: '#CDEDA3',
          contrastText: '#354E16'
        },
        secondary: {
          main: '#586249',
          contrastText: '#FFFFFF'
        },
        secondaryContainer: {
          main: '#DCE7C8',
          contrastText: '#404A33'
        },
        tertiary: {
          main: '#386663',
          contrastText: '#FFFFFF'
        },
        tertiaryContainer: {
          main: '#BCECE7',
          contrastText: '#1F4E4B'
        },
        error: {
          main: '#BA1A1A',
          contrastText: '#FFFFFF'
        },
        errorContainer: {
          main: '#FFDAD6',
          contrastText: '#93000A'
        },
        background: {
          default: '#F9FAEF',
          paper: '#F9FAEF'
        },
        text: {
          primary: '#1A1C16',
          secondary: '#44483D'
        },
        surfaceVariant: {
          main: '#E1E4D5',
          contrastText: '#44483D'
        },
        outline: '#75796C',
        outlineVariant: '#C5C8BA'
      }
    },
    dark: {
      palette: {
        primary: {
          main: '#B1D18A',
          contrastText: '#1F3701'
        },
        primaryContainer: {
          main: '#354E16',
          contrastText: '#CDEDA3'
        },
        secondary: {
          main: '#BFCBAD',
          contrastText: '#2A331E'
        },
        secondaryContainer: {
          main: '#404A33',
          contrastText: '#DCE7C8'
        },
        tertiary: {
          main: '#A0D0CB',
          contrastText: '#003735'
        },
        tertiaryContainer: {
          main: '#1F4E4B',
          contrastText: '#BCECE7'
        },
        error: {
          main: '#FFB4AB',
          contrastText: '#690005'
        },
        errorContainer: {
          main: '#93000A',
          contrastText: '#FFDAD6'
        },
        background: {
          default: '#12140E',
          paper: '#12140e'
        },
        text: {
          primary: '#E2E3D8',
          secondary: '#C5C8BA'
        },
        surfaceVariant: {
          main: '#44483D',
          contrastText: '#C5C8BA'
        },
        outline: '#8F9285',
        outlineVariant: '#44483D'
      }
    }
  }
})

export default theme
