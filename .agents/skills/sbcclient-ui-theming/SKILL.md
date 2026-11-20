---
name: sbcclient-ui-theming
description: >-
  Guía de arquitectura visual, Material UI 7, TailwindCSS 4 con CSS Cascade
  Layers, paleta Material 3 claro/oscuro (app/theme.ts y app/index.css),
  componentes Grid v7, slotProps, RichTreeView y convenciones UX en sbcclient.
  Úsala al crear o estilizar páginas, componentes, tablas, diálogos o al
  modificar el tema de la aplicación.
---

# UI, Material UI 7, TailwindCSS 4 y Tema Material 3 en `sbcclient`

## 1. Integración MUI 7 + TailwindCSS 4 (CSS Cascade Layers)

`sbcclient` combina Material UI 7 y TailwindCSS 4 mediante capas CSS explícitas para evitar conflictos de especificidad. **Mantén siempre sincronizada** esta declaración en los tres archivos:

1. `app/root.tsx`: `<StyledEngineProvider enableCssLayer>` + `<GlobalStyles styles="@layer theme, base, mui, components, utilities;" />`.
2. `app/theme.ts`: `modularCssLayers: '@layer theme, base, mui, components, utilities;'`.
3. `app/index.css`: `@layer theme, base, mui, components, utilities;` antes de `@import 'tailwindcss';`.

Tipografía base: `@fontsource/roboto` (`300`, `400`, `500`, `700`) importado en `app/index.css`.

## 2. Tema Claro/Oscuro y Tokens Material 3

- `ThemeProvider` en `app/root.tsx` usa `modeStorageKey="sbc-theme-mode"` y `defaultMode="dark"`.
- `app/theme.ts` configura `cssVariables: { colorSchemeSelector: 'class' }` y dos esquemas completos (`colorSchemes.light` y `colorSchemes.dark`) con extensión de interfaz `Palette` / `PaletteOptions`:
  - Estándar MUI: `primary`, `secondary`, `error`, `background` (`default`, `paper`), `text` (`primary`, `secondary`), `divider`, `action`.
  - Extensión Material 3: `tertiary`, `primaryContainer`, `secondaryContainer`, `tertiaryContainer`, `errorContainer`, `surfaceVariant`, `outline`, `outlineVariant`.
- `app/index.css` mapea las variables `--mui-palette-*` dentro de `@theme` a tokens Tailwind (`bg-background`, `bg-surface`, `bg-surface-variant`, `text-primary`, `text-on-surface-variant`, `border-outline-variant`, etc.).

**Reglas al estilizar o extender el tema**:

- **Nunca hardcodees colores hexadecimales** en componentes ni páginas; usa tokens de `sx` (`bgcolor: 'background.paper'`, `color: 'text.secondary'`, `borderColor: 'divider'`) o clases semánticas de Tailwind mapeadas en `@theme`.
- Si agregas un nuevo token de color al tema:
  1. Extiende `Palette` y `PaletteOptions` en `declare module '@mui/material/styles'` en `app/theme.ts`.
  2. Define su valor en **ambos** esquemas (`light` y `dark`).
  3. Mapea su variable CSS `--mui-palette-...` en el bloque `@theme` de `app/index.css`.
- El cambio de tema usa `useColorScheme()` en `app/components/ThemeToggle.tsx` con guarda `mounted` para evitar desajustes iniciales de renderizado.

## 3. Reglas de Componentes Material UI 7

- **`Grid` v7 (prohibido `Grid2`)**:
  - Importa siempre `Grid` desde `@mui/material`.
  - Usa la prop `size`:
    ```tsx
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>...</Grid>
    </Grid>
    ```
  - No uses `Grid2` ni la API legada `<Grid item xs={12}>`.
- **`slotProps` en lugar de props deprecadas**:
  - Usa `slotProps={{ inputLabel: { shrink: true } }}`, `slotProps={{ htmlInput: { min: 1, max: 12 } }}`, `slotProps={{ input: { startAdornment: ... } }}` y `slotProps={{ primary: { ... } }}` en `ListItemText`.
- **Iconos**: Importa siempre desde `@mui/icons-material`.
- **Árboles jerárquicos**: Usa `RichTreeView` de `@mui/x-tree-view/RichTreeView` (como en `app/routes/Accounts.tsx`).
- **Tablas y paginación**: Envuelve `<Table>` en `<TableContainer component={Paper}>`, usa `hover` en filas de datos, muestra estado vacío explícito con `colSpan` completo y usa `<TablePagination component="div" />` con `labelRowsPerPage` en español cuando aplique.

## 4. Layout, Retroalimentación y Convenciones UX

- **Contenedor de aplicación (`MainLayout.tsx`)**:
  - `AppBar` fijo + `Drawer` permanente de `280px` + contenedor principal con `overflowX: 'auto'` y `<Outlet />`.
  - Las páginas de ruta normalmente arrancan con `<Box sx={{ p: 1, width: '100%' }}>` (o `<Container maxWidth="lg">` en vistas de formulario/listado amplias) y un encabezado `<Typography variant="h4">` con botones de acción primaria alineados a la derecha.
- **Notificaciones globales**: Despacha `showNotification({ message, severity, autoHideDuration })` desde `@redux/slices/notificationSlice`; no dupliques componentes `<Snackbar>` por página.
- **Diálogos de confirmación**: Usa exclusivamente `<ConfirmDialog />` (`@/components/shared/ConfirmDialog`).
- **Idioma y formato numérico**:
  - Todos los textos visibles (títulos, botones, columnas, chips de estado, tooltips, mensajes vacíos) van en **español**.
  - Moneda en tarjetas resumen: `amount.toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })`.
  - Cantidades monetarias en tablas contables: `minimumFractionDigits: 2` (y `maximumFractionDigits: 2` en reportes financieros) alineadas a la derecha (`align="right"`).
  - Indicador provisional en reportes: cuando `includeUnposted === true`, muestra un `<Chip color="warning" variant="outlined" />` visible advirtiendo que el informe incluye asientos no publicados.

## 5. Verificación y Mantenimiento de Documentación

1. Verifica visualmente el resultado en **modo claro y modo oscuro** (`ThemeToggle`) y en anchos móvil/escritorio.
2. Ejecuta:
   ```bash
   pnpm format
   pnpm lint
   pnpm build
   ```
3. **Mantenimiento de documentación de agentes**: Si modificaste tokens de tema, CSS Layers, layout global o componentes compartidos, actualiza `AGENTS.md`, esta skill (`sbcclient-ui-theming`) y su espejo en `docs/agent-guidelines-en/`.
