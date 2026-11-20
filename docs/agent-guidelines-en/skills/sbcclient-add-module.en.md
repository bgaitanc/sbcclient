---
name: sbcclient-add-module
description: >-
  Step-by-step guide to create or extend a complete feature module, route/page,
  sidebar navigation entry, and CRUD or paginated listing flow in sbcclient. Use
  whenever adding a new screen, functional domain, or navigation section to the
  frontend application.
---

# Complete Workflow to Add a Module or Route in `sbcclient`

Follow this data-to-UI order to maintain architectural consistency, strict typing, cache invalidation, and `eslint-config-love` compliance.

## 1. Verify the Backend Contract (`../SBC/`)

Before writing frontend types or endpoints:

1. Check `../SBC/SBC.Api/SBC.Api.http` for exact routes, HTTP verbs, query parameters, and request body examples.
2. Inspect input/output DTOs and filters in `../SBC/SBC.Application.Models/` and enums in `../SBC/SBC.Domain.Entities/Enums/`.
3. If the endpoint returns a collection, confirm it uses `PagedResultDto<T>` and `BaseFilterDto` parameters (`pageNumber`, `pageSize`, plus resource-specific filters).

## 2. Shared Types (`app/shared/types/<domain>/`)

1. Create `app/shared/types/<domain>/<resource>Types.ts`.
2. Model backend DTOs accurately (JSON camelCase): read entity, create/update request DTOs (`Create...Req` / `Update...Req` or `...Dto`), and filter (`...Filter` with `pageNumber?: number` and `pageSize?: number`).
3. **Never use TypeScript `enum`** (`erasableSyntaxOnly: true`); use `as const` objects with derived types:

   ```typescript
   export const ExampleStatus = {
     Active: 0,
     Inactive: 1
   } as const

   export type ExampleStatus =
     (typeof ExampleStatus)[keyof typeof ExampleStatus]
   ```

4. Reuse `SuccessResponse<T>` and `PagedResult<T>` from `@shared/types/common/global` via `import type`.

## 3. RTK Query Endpoints & Cache (`app/redux/api/apiSlice.ts`)

_(See the `sbcclient-api-integration` skill for tag invalidation, binary downloads, and `FormData` uploads.)_

1. For a new domain, register its tag in `tagTypes` on `apiSlice`.
2. Define typed queries and mutations using `SuccessResponse<...>` / `SuccessResponse<PagedResult<...>>`.
3. Configure `providesTags` on queries and `invalidatesTags` on mutations (including related tags such as `'Dashboard'` when the mutation affects global metrics).
4. Export the generated hooks at the bottom of `app/redux/api/apiSlice.ts`.

## 4. Module Structure (`app/modules/<module>/`)

Organize domain code under a dedicated folder:

```text
app/modules/<module>/
├── components/                 # Module forms, tables, filters, and dialogs
├── hooks/
│   └── use<Resource>Actions.ts # Mutations, useFormik, and notifications
└── schemas/
    └── <resource>.schema.ts    # Yup validation schemas
```

- Encapsulate form logic and mutations in `hooks/use<Resource>Actions.ts` (see the `sbcclient-forms-validation` skill).
- Dispatch `showNotification({ message, severity })` from `@redux/slices/notificationSlice` on create, update, delete, or download operations.
- For destructive actions, always use `<ConfirmDialog />` (`@/components/shared/ConfirmDialog`), **never** `window.confirm`.

## 5. Route Page (`app/routes/<Page>.tsx`)

1. Create the page component with a default export (`export default function <Page>()`) using path aliases (`@redux/...`, `@modules/...`, `@shared/...`, `@/...`).
2. Always handle all 4 view states:
   - **Loading (`isLoading`)**: Centered `<CircularProgress />`.
   - **Error (`isError`)**: Clear Spanish message or `<Alert severity="error">`.
   - **Empty**: Table row or `<Paper>` stating in Spanish that no records were found.
   - **Data**: Table or cards built with MUI 7 components (see the `sbcclient-ui-theming` skill).
3. For paginated listings with `TablePagination`:
   - Keep `page` 0-indexed for MUI and pass `pageNumber: page + 1` to the RTK Query hook.
   - Reset `setPage(0)` whenever `pageSize` or any search filter changes.
   - Wrap async calls or `refetch()` in synchronous handlers using `void` to satisfy `@typescript-eslint/no-misused-promises`.

## 6. Register Route & Sidebar Navigation

1. **Routing (`app/routes.ts`)**:
   - Register the route inside the protected `AuthLayout` → `MainLayout` block (or outside it if intentionally public):
     ```typescript
     route('myRoute', 'routes/MyPage.tsx')
     ```
2. **Sidebar (`app/components/layout/MainLayout.tsx`)**:
   - If the view belongs in navigation, add an entry to `menuItems` with a Spanish label, an icon from `@mui/icons-material`, and the exact `path` configured in `app/routes.ts`.

## 7. Verification & Documentation Maintenance

1. Run in order from the `sbcclient` root:
   ```bash
   pnpm format
   pnpm lint
   pnpm build
   ```
2. **Agent documentation maintenance**: If this module introduced new routes, modules, `tagTypes`, dependencies, or patterns, update `AGENTS.md`, affected skills under `.agents/skills/`, and their English mirror in `docs/agent-guidelines-en/`.
