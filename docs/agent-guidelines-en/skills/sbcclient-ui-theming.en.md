---
name: sbcclient-ui-theming
description: >-
  Visual architecture guide for Material UI 7, TailwindCSS 4 with CSS Cascade
  Layers, Material 3 light/dark palette (app/theme.ts and app/index.css), MUI 7
  Grid, slotProps, RichTreeView, and UX conventions in sbcclient. Use when
  building or styling pages, components, tables, dialogs, or modifying the
  application theme.
---

# UI, Material UI 7, TailwindCSS 4 & Material 3 Theme in `sbcclient`

## 1. MUI 7 + TailwindCSS 4 Integration (CSS Cascade Layers)

`sbcclient` combines Material UI 7 and TailwindCSS 4 using explicit CSS Cascade Layers to prevent specificity conflicts. **Always keep this layer order synchronized** across all three files:

1. `app/root.tsx`: `<StyledEngineProvider enableCssLayer>` + `<GlobalStyles styles="@layer theme, base, mui, components, utilities;" />`.
2. `app/theme.ts`: `modularCssLayers: '@layer theme, base, mui, components, utilities;'`.
3. `app/index.css`: `@layer theme, base, mui, components, utilities;` before `@import 'tailwindcss';`.

Base typography: `@fontsource/roboto` (`300`, `400`, `500`, `700`) imported in `app/index.css`.

## 2. Light/Dark Theme & Material 3 Tokens

- `ThemeProvider` in `app/root.tsx` uses `modeStorageKey="sbc-theme-mode"` and `defaultMode="dark"`.
- `app/theme.ts` configures `cssVariables: { colorSchemeSelector: 'class' }` with complete `colorSchemes.light` and `colorSchemes.dark` definitions and augmented `Palette` / `PaletteOptions` interfaces:
  - Standard MUI tokens: `primary`, `secondary`, `error`, `background` (`default`, `paper`), `text` (`primary`, `secondary`), `divider`, `action`.
  - Material 3 extensions: `tertiary`, `primaryContainer`, `secondaryContainer`, `tertiaryContainer`, `errorContainer`, `surfaceVariant`, `outline`, `outlineVariant`.
- `app/index.css` maps `--mui-palette-*` variables inside `@theme` to Tailwind utilities (`bg-background`, `bg-surface`, `bg-surface-variant`, `text-primary`, `text-on-surface-variant`, `border-outline-variant`, etc.).

**Rules when styling or extending the theme**:

- **Never hardcode hex colors** inside components or pages; use `sx` theme tokens (`bgcolor: 'background.paper'`, `color: 'text.secondary'`, `borderColor: 'divider'`) or semantic Tailwind classes mapped in `@theme`.
- When adding a new color token to the theme:
  1. Extend `Palette` and `PaletteOptions` inside `declare module '@mui/material/styles'` in `app/theme.ts`.
  2. Define values in **both** `light` and `dark` color schemes.
  3. Map the `--mui-palette-...` variable inside `@theme` in `app/index.css`.
- Theme toggling uses `useColorScheme()` in `app/components/ThemeToggle.tsx` with a `mounted` guard to avoid initial rendering mismatches.

## 3. Material UI 7 Component Rules

- **`Grid` v7 (never `Grid2`)**:
  - Always import `Grid` from `@mui/material`.
  - Use the `size` prop:
    ```tsx
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>...</Grid>
    </Grid>
    ```
  - Never use `Grid2` or the legacy `<Grid item xs={12}>` syntax.
- **`slotProps` over deprecated props**:
  - Use `slotProps={{ inputLabel: { shrink: true } }}`, `slotProps={{ htmlInput: { min: 1, max: 12 } }}`, `slotProps={{ input: { startAdornment: ... } }}`, and `slotProps={{ primary: { ... } }}` on `ListItemText`.
- **Icons**: Always import icons from `@mui/icons-material`.
- **Hierarchical trees**: Use `RichTreeView` from `@mui/x-tree-view/RichTreeView` (as in `app/routes/Accounts.tsx`).
- **Tables & pagination**: Wrap `<Table>` in `<TableContainer component={Paper}>`, enable `hover` on data rows, render an explicit empty state row spanning all columns (`colSpan`), and use `<TablePagination component="div" />` with Spanish `labelRowsPerPage` when appropriate.

## 4. Layout, Feedback & UX Conventions

- **Application shell (`MainLayout.tsx`)**:
  - Fixed `AppBar` + permanent `280px` `Drawer` + main container with `overflowX: 'auto'` and `<Outlet />`.
  - Route pages typically start with `<Box sx={{ p: 1, width: '100%' }}>` (or `<Container maxWidth="lg">` for broad list/form views) and a `<Typography variant="h4">` header with primary action buttons aligned right.
- **Global notifications**: Dispatch `showNotification({ message, severity, autoHideDuration })` from `@redux/slices/notificationSlice`; do not duplicate per-page `<Snackbar>` instances.
- **Confirmation dialogs**: Use `<ConfirmDialog />` (`@/components/shared/ConfirmDialog`) exclusively.
- **Language & numeric formatting**:
  - All visible UI text (headings, buttons, columns, status chips, tooltips, empty states) must be in **Spanish**.
  - Currency on summary cards: `amount.toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })`.
  - Monetary cells in accounting tables: `minimumFractionDigits: 2` (and `maximumFractionDigits: 2` in financial statements), right-aligned (`align="right"`).
  - Provisional banner on financial reports: when `includeUnposted === true`, display a visible `<Chip color="warning" variant="outlined" />` indicating that unposted entries are included.

## 5. Verification & Documentation Maintenance

1. Visually verify changes in both **light and dark modes** (`ThemeToggle`) and across mobile/desktop widths.
2. Run:
   ```bash
   pnpm format
   pnpm lint
   pnpm build
   ```
3. **Agent documentation maintenance**: If you updated theme tokens, CSS Layers, global layout, or shared UI components, update `AGENTS.md`, this skill (`sbcclient-ui-theming`), and its English mirror in `docs/agent-guidelines-en/`.
