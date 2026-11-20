# `sbcclient` Project Guidelines (SBC Frontend)

> Universal instructions file for coding agents and developers. Applies to the entire `sbcclient` repository.

## 1. Project Overview & Tech Stack

**`sbcclient`** is the frontend web application for the **Basic Accounting System (SBC)**, a financial and accounting management SPA built with **React 19**, **React Router 7** (SPA mode, `ssr: false`), **TypeScript 5.9**, **Material UI 7**, **TailwindCSS 4**, and **Redux Toolkit / RTK Query**.

| Component                | Verified Technology / Version (`package.json`)                                                                                            |
| :----------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **Package Manager**      | `pnpm` (`pnpm@10.29.2`, `"type": "module"`)                                                                                               |
| **UI Framework**         | React `19.2.0` + React DOM `19.2.0`                                                                                                       |
| **Routing & Bundler**    | React Router `7.13.1` (`@react-router/dev`, `react-router`, `react-router-dom`, `ssr: false`) + Vite `7.3.1`                              |
| **Language**             | TypeScript `~5.9.3` (`strict: true`, `erasableSyntaxOnly: true`, `verbatimModuleSyntax: true`)                                            |
| **Component Library**    | Material UI `7.3.9` (`@mui/material`, `@mui/icons-material`), Emotion `11.14`, `@mui/x-tree-view` `8.27.2`, `@fontsource/roboto` `5.2.10` |
| **CSS**                  | TailwindCSS `4.2.1` (`@tailwindcss/vite`) integrated with MUI 7 via CSS Cascade Layers                                                    |
| **State & API**          | Redux Toolkit `2.11.2` + `react-redux` `9.2.0` + RTK Query (`apiSlice.ts`)                                                                |
| **Forms & Validation**   | Formik `2.4.9` (`useFormik`) + Yup `1.7.1`                                                                                                |
| **Linting & Formatting** | ESLint `9.39.1` (flat config) + `eslint-config-love` `116.0.0` + `typescript-eslint` `8.48.0` + Prettier `3.8.1`                          |

---

## 2. Architecture, Folder Structure, Routes & Path Aliases

### Main structure (`app/`)

- `app/root.tsx`: Root document (`Layout` and `App` with `<Outlet />`), `<Provider store={store}>`, `<StyledEngineProvider enableCssLayer>`, `<ThemeProvider theme={theme} modeStorageKey="sbc-theme-mode" defaultMode="dark">`, `<GlobalStyles styles="@layer theme, base, mui, components, utilities;" />`, and `<CssBaseline />`.
- `app/routes.ts`: Centralized route definition (`RouteConfig` from `@react-router/dev/routes`).
- `app/theme.ts` and `app/index.css`: Material 3 theme (`light` and `dark` color schemes) and `@theme` mapping from MUI CSS variables to TailwindCSS 4 tokens.
- `app/components/`:
  - `layout/AuthLayout.tsx`: Authentication guard; redirects to `/login` when `selectIsAuthenticated` is `false`.
  - `layout/MainLayout.tsx`: `AppBar`, permanent `Drawer` (`280px`) with `menuItems`, `ThemeToggle`, user info, logout action, main `<Outlet />` container, and global `<Snackbar>` + `<Alert>` driven by `notificationSlice`.
  - `shared/ConfirmDialog.tsx`: Reusable confirmation dialog for destructive or sensitive actions.
  - `ThemeToggle.tsx`: Light/dark switcher using `useColorScheme()` with a `mounted` guard.
- `app/routes/`: Route-level pages:
  - `/` → `Dashboard.tsx` (Financial summary: assets, liabilities, equity, revenue, costs, expenses, net income, recent movements, and top active accounts)
  - `/accounts` → `Accounts.tsx` (Hierarchical chart of accounts with `RichTreeView` and side form)
  - `/journalEntries` → `JournalEntries.tsx` (Paginated listing with expandable rows, journal entry CRUD, and confirmation dialog)
  - `/batch` → `Batch.tsx` (Excel bulk upload, template download, and paginated import history)
  - `/reports` → `Reports.tsx` (Balance Sheet and Income Statement with `includeUnposted` provisional mode and Excel/PDF exports)
  - `/periods` → `AccountingPeriods.tsx` (Opening and closing accounting periods)
  - `/logs` → `Logs.tsx` (Paginated and filterable `TransactionLog` audit trail)
  - `/users` → `Users.tsx` (Paginated and filterable user management, roles, and password changes)
  - `/login` → `LoginPage.tsx` (Public route; redirects to `/` when already authenticated)
- `app/modules/<module>/`: Domain-encapsulated logic and components (`accountingPeriods`, `accounts`, `bulkImport`, `journalEntries`, `login`, `reports`, `users`), structured as:
  - `components/`: Module forms, views, and dialogs.
  - `hooks/`: Custom `use<Resource>Actions.ts` hooks encapsulating RTK Query mutations, Formik, and notifications.
  - `schemas/`: Yup validation schemas (`<resource>.schema.ts`) — use this folder as the standard for new modules (some earlier modules retain `utils/*.schema.ts`).
- `app/redux/`:
  - `store.ts`: Combines `auth`, `notification`, and `[apiSlice.reducerPath]` with `apiSlice.middleware` and `setupListeners`.
  - `hooks.ts`: Typed `useAppDispatch` and `useAppSelector` hooks.
  - `api/apiSlice.ts`: Single RTK Query definition, `baseQueryWithReauth`, `tagTypes`, endpoints, and exported hooks.
  - `slices/authSlice.ts`: Session state and `localStorage` persistence (`token`, `refresh-token`, `user`).
  - `slices/notificationSlice.ts`: Global `Snackbar` state (`showNotification`, `hideNotification`, `selectNotification`).
- `app/shared/types/<domain>/`: TypeScript interfaces and types mirroring backend DTOs (`common/global.ts` defines `SuccessResponse<T>` and `PagedResult<T>`).

### Import path aliases (`vite.config.ts` & `tsconfig.app.json`)

Always prefer configured path aliases over deep relative imports (`../../../`):

| Alias        | Target path     |
| :----------- | :-------------- |
| `@/*`        | `app/*`         |
| `@modules/*` | `app/modules/*` |
| `@redux/*`   | `app/redux/*`   |
| `@routes/*`  | `app/routes/*`  |
| `@utils/*`   | `app/utils/*`   |
| `@assets/*`  | `app/assets/*`  |
| `@hooks/*`   | `app/hooks/*`   |
| `@shared/*`  | `app/shared/*`  |

---

## 3. Standard CLI Commands

Run all commands using **`pnpm`** from the repository root (`sbcclient`):

```bash
# Start the development server (http://localhost:5173)
pnpm dev

# Format code with Prettier
pnpm format

# Run ESLint (includes Prettier checks and strict TypeScript rules)
pnpm lint

# Type-check (tsc -b) and create production build (vite build)
pnpm build

# Preview the production build locally
pnpm preview
```

---

## 4. Configuration, Environment & Integration with `../SBC/`

- **Environment variables**:
  - `.env` declares the `VITE_API_URL=` template.
  - Configure local values in `.env.local` (git-ignored via `*.local`). **Never** commit production URLs, tokens, or credentials to versioned files, and never hardcode API URLs in source code.
  - The dev server runs on `http://localhost:5173`, matching the backend CORS policy in `../SBC/SBC.Api/Program.cs`.
- **Cross-project analysis with the backend (`../SBC/`)**:
  - You have read permission for the sibling `../SBC/` repository to verify API contracts and business rules before changing the frontend.
  - Always consult as the source of truth:
    - `../SBC/SBC.Api/SBC.Api.http`: Endpoints, HTTP verbs, routes, query parameters, and request examples.
    - `../SBC/SBC.Api/Controllers/`: Exact routes, HTTP status codes, and binary vs JSON responses.
    - `../SBC/SBC.Application.Models/`: Exact input/output DTOs and filter definitions.
    - `../SBC/SBC.Domain.Entities/Enums/`: Exact numeric enum values (`AccountType`, `TransactionStatus`).
    - `../SBC/AGENTS.md`: Backend accounting business rules and conventions.

---

## 5. Coding, TypeScript, ESLint & Prettier Conventions

### Strict TypeScript (`tsconfig.app.json`)

- **No TypeScript `enum` (`erasableSyntaxOnly: true`)**: Never declare `enum`. Use `as const` objects with derived types:
  ```typescript
  export const MyStatus = {
    Active: 1,
    Inactive: 0
  } as const
  export type MyStatus = (typeof MyStatus)[keyof typeof MyStatus]
  ```
- **Type-only imports (`verbatimModuleSyntax: true`)**: Always use `import type { ... }` (or `import { type Foo, bar }`) for types and interfaces.
- **Strict hygiene**: Comply with `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, and `noFallthroughCasesInSwitch: true`.

### ESLint (`eslint-config-love`) & Prettier (`.prettierrc`)

- **Mandatory Prettier (`prettier/prettier: error`)**: no semicolons (`semi: false`), single quotes (`singleQuote: true`), no trailing commas (`trailingComma: "none"`), 2-space indentation, arrow parens always (`arrowParens: "always"`), and `LF` line endings.
- **Strict booleans (`@typescript-eslint/strict-boolean-expressions`)**: Always write explicit checks against `null`, `undefined`, `''`, or booleans in conditionals (`value !== null && value !== undefined`, `value != null`, `text !== ''`, `formik.touched.field === true && Boolean(formik.errors.field)`).
- **Promises in JSX handlers (`@typescript-eslint/no-misused-promises`)**: Wrap `async` functions or promise-returning calls (`navigate`, `refetch`, `submitForm`, `setFieldValue`) in synchronous event wrappers:
  ```tsx
  onClick={() => {
    void handleSubmitAction()
  }}
  ```
- **Safe assertions & disable comments**: Avoid unsafe type assertions (`as`) and `console.*`. If an `eslint-disable-next-line` directive is strictly unavoidable, always include a justification with `-- <reason>` (required by `eslint-config-love`).
- **Complexity, style & React Hooks v7**: Respect the cyclomatic complexity cap (`complexity` ≤ `10` per function; extract subcomponents or helpers for large forms/hooks), `prefer-destructuring` for objects, `arrow-body-style`, `import/no-duplicates` (merge imports from the same module), and `react-hooks/set-state-in-effect` (avoid calling `setState` synchronously inside `useEffect`).
- **Natural language conventions**:
  - File names, components, hooks, types, endpoints, and Redux actions are in **English**.
  - Visible UI copy, field labels, table headers, Yup validation messages, and user notifications are in **Spanish**.

---

## 6. UI, Material UI 7, TailwindCSS 4 & Visual Design

- **CSS Cascade Layers**: Preserve the exact layer order `@layer theme, base, mui, components, utilities;` across `app/root.tsx`, `app/theme.ts`, and `app/index.css` so TailwindCSS 4 utilities coexist with Material UI 7 without specificity conflicts.
- **Material 3 light/dark theme (`app/theme.ts` & `app/index.css`)**:
  - Always use semantic MUI theme tokens (`primary`, `secondary`, `tertiary`, `primaryContainer`, `surfaceVariant`, `outline`, `outlineVariant`, `background.paper`, `text.secondary`) or their Tailwind `@theme` utilities (`bg-background`, `text-primary`, `border-outline-variant`).
  - **Never** hardcode hex colors inside components so both `light` and `dark` schemes (`modeStorageKey="sbc-theme-mode"`, `defaultMode="dark"`) work consistently.
- **Material UI 7 rules**:
  - **Grid**: Always use `Grid` from `@mui/material` with v7 `size={{ xs: 12, sm: 6, md: 3 }}` syntax. **Never** use `Grid2` or legacy `item xs={12}` props.
  - **`slotProps`**: Use `slotProps` (`slotProps={{ inputLabel: { shrink: true } }}`, `slotProps={{ htmlInput: { min: 1, max: 12 } }}`, `slotProps={{ input: { startAdornment: ... } }}`) instead of deprecated props (`InputProps`, `inputProps`, `InputLabelProps`).
  - **Icons**: Always import icons from `@mui/icons-material`.
  - **Hierarchical trees**: Use `RichTreeView` from `@mui/x-tree-view/RichTreeView` (as in the Chart of Accounts).
- **Feedback & confirmations**:
  - **Notifications**: Dispatch `showNotification({ message, severity })` from `@redux/slices/notificationSlice` after mutations or downloads (the global `Snackbar` lives in `MainLayout.tsx`).
  - **Confirmations**: **NEVER** use native `window.confirm` or `window.alert`. Always use `<ConfirmDialog />` from `@/components/shared/ConfirmDialog`.
- **Display formatting**:
  - Monetary amounts use `toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })` on summary cards and `minimumFractionDigits: 2` in accounting tables.
  - HTML `type="date"` inputs use `YYYY-MM-DD`.

---

## 7. State Management, Auth & API (Redux Toolkit + RTK Query)

- **Typed hooks**: Always use `useAppDispatch` and `useAppSelector` from `@redux/hooks`, never untyped `useDispatch`/`useSelector` from `react-redux`.
- **Centralization in `app/redux/api/apiSlice.ts`**:
  - All HTTP calls must go through `apiSlice.ts` using `baseQueryWithReauth`, which attaches `Authorization: Bearer <token>`, intercepts `401` responses, attempts token refresh via `POST /auth/refresh-token`, and dispatches `logout()` if refresh fails.
  - Follow backend standard response wrappers: `SuccessResponse<T>` and `PagedResult<T>` (`@shared/types/common/global`).
  - Maintain organized `tagTypes` (`Accounts`, `JournalEntries`, `Reports`, `AccountingPeriods`, `BulkImports`, `Dashboard`, `Logs`, `Users`) and cross-tag invalidations (e.g., creating/editing/deleting journal entries or bulk uploads invalidates both `JournalEntries` and `Dashboard`).
- **Pagination (`0-indexed` ↔ `1-indexed`)**:
  - MUI `TablePagination` is `0`-indexed while the API (`BaseFilterDto`) uses `1`-indexed `pageNumber`. Always convert via `pageNumber: page + 1` and reset page to `0` (or `1` in filter objects) when filters or `pageSize` change.
- **Binary files & uploads**:
  - Excel/PDF/template downloads: define `builder.query<Blob, ...>` with `responseHandler: async (response) => await response.blob()`, use the generated `useLazy...Query` hook, trigger temporary anchor download via `URL.createObjectURL`, and always release memory with `URL.revokeObjectURL`.
  - File uploads (e.g., bulk import Excel): send `FormData` via `builder.mutation`.

---

## 8. Forms & Validation (Formik + Yup)

- Always use the **`useFormik`** hook encapsulated inside a module custom hook (`app/modules/<module>/hooks/use<Resource>Actions.ts`).
- Define Yup validation schemas in dedicated files (`schemas/<resource>.schema.ts` for new modules), strictly aligned with form value types and backend DTOs.
- Enable `enableReinitialize: true` when a form supports both create and edit flows (`initialData`).
- Call `.unwrap()` on RTK Query mutations inside `try/catch` to dispatch `showNotification` (`'success'` / `'error'`) and invoke `onSuccess` only on success.
- Enforce key client-side accounting rules:
  - Journal entries: minimum 2 lines, each line with `debit > 0 || credit > 0`, double-entry balance (`Math.abs(totalDebit - totalCredit) < 0.01`).
  - Period closing: filter equity accounts (`account.type === 3`).

---

## 9. Testing & Mandatory Verification

- Currently, no test framework is configured in `package.json`. If tests are introduced later, prefer **Vitest** (native Vite integration) and run them before completing every task.
- **Mandatory verification before finishing any change**:
  1. `pnpm format` (or targeted `pnpm exec prettier --write` on modified files when appropriate)
  2. `pnpm lint` (zero ESLint and Prettier errors)
  3. `pnpm build` (`tsc -b && vite build` with zero type or bundling errors)

---

## 10. Version Control (Git)

- **Never** run `git commit` or `git push` unless explicitly requested by the user.
- When committing upon request, write clear, descriptive technical commit messages without agent-specific trailers or co-author metadata (unless explicitly requested by the user).

---

## 11. Continuous Maintenance of `AGENTS.md`, Skills & English Mirror (Mandatory)

**Living documentation rule**: For **every development task or request** in this repository, before considering the task complete, evaluate whether your changes affect any directive, architecture detail, or workflow documented in `AGENTS.md` or `.agents/skills/`.

You MUST update `AGENTS.md` and/or the affected skills **in the same change** whenever:

- Key dependencies, `package.json` scripts, routes, path aliases, modules, Redux slices, or `tagTypes` are added, removed, or renamed.
- TypeScript, ESLint, Prettier, MUI, TailwindCSS, light/dark theme, form, or notification conventions change.
- Integration patterns with `../SBC/`, JWT auth/refresh, pagination, `Blob` downloads, or `FormData` uploads change.
- A testing framework (e.g., Vitest) is added or a new repeatable workflow warrants creating a new skill.

**English mirror synchronization**: Whenever `AGENTS.md` or any `.agents/skills/<name>/SKILL.md` is updated, update its corresponding mirror file in `docs/agent-guidelines-en/` (`AGENTS.en.md` or `skills/<name>.en.md`) —and `docs/agent-guidelines-en/README.md` if skills are added or removed— so both versions stay 100% aligned.

---

## 12. Project Skills Index (`.agents/skills/`)

Consult the relevant specialized skill when a task involves any of these workflows:

| Skill                        | File                                                                                                     | When to Use                                                                                                                              |
| :--------------------------- | :------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `sbcclient-add-module`       | [.agents/skills/sbcclient-add-module/SKILL.md](.agents/skills/sbcclient-add-module/SKILL.md)             | Adding or extending a full feature module, route/page, sidebar navigation entry, or CRUD/paginated view                                  |
| `sbcclient-api-integration`  | [.agents/skills/sbcclient-api-integration/SKILL.md](.agents/skills/sbcclient-api-integration/SKILL.md)   | Adding or updating RTK Query endpoints, DTO types synced with `../SBC/`, cache tags, pagination, `Blob` downloads, or `FormData` uploads |
| `sbcclient-forms-validation` | [.agents/skills/sbcclient-forms-validation/SKILL.md](.agents/skills/sbcclient-forms-validation/SKILL.md) | Creating or modifying forms, form dialogs, Yup schemas, `useFormik` hooks, or destructive confirmation dialogs                           |
| `sbcclient-ui-theming`       | [.agents/skills/sbcclient-ui-theming/SKILL.md](.agents/skills/sbcclient-ui-theming/SKILL.md)             | Building or styling views, tables, MUI 7 grids, Tailwind 4 CSS Layers, light/dark theme, or Material 3 tokens                            |

---

## 13. Technical Debt Log (`docs/TECHNICAL_DEBT.md`)

- **Location**: The repository's technical debt backlog is tracked in [docs/TECHNICAL_DEBT.md](docs/TECHNICAL_DEBT.md).
- **NOT a knowledge base (prohibited)**: This file is **not** part of the agent guidelines or knowledge base. **Never** use it to infer project conventions or replicate any defects, contract mismatches, or temporary workarounds listed in it.
- **When to update it**:
  - **When discovering new debt**: If you identify notable technical debt outside the scope of the current task during analysis or development (backend `../SBC/` mismatches, pre-existing lint issues, incomplete functionality, or structural debt), record it in `docs/TECHNICAL_DEBT.md` with its location, details, and suggested action.
  - **When resolving existing debt**: If your change fixes or mitigates an item tracked in `docs/TECHNICAL_DEBT.md`, remove or update that entry in the same change.
  - **Strict separation**: Keep technical debt exclusively in `docs/TECHNICAL_DEBT.md`; do not mix it into `AGENTS.md` or `.agents/skills/`.
