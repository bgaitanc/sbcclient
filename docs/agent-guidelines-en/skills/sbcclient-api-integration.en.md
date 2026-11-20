---
name: sbcclient-api-integration
description: >-
  Guide for integrating and maintaining RTK Query endpoints in
  app/redux/api/apiSlice.ts, syncing DTO types with the ../SBC/ backend,
  configuring tagTypes and cache invalidation, handling pagination, binary Blob
  downloads (Excel/PDF), and FormData uploads in sbcclient. Use when editing
  apiSlice.ts, authSlice.ts, or contracts in app/shared/types/.
---

# SBC API & RTK Query Integration (`apiSlice.ts`)

## 1. Contract Source of Truth (`../SBC/`)

Before adding or changing endpoints or shared types:

1. Check `../SBC/SBC.Api/SBC.Api.http` and the target controller in `../SBC/SBC.Api/Controllers/` for exact routes, HTTP methods, route/query parameters, and status codes.
2. Verify DTO fields and types in `../SBC/SBC.Application.Models/` and numeric enum values in `../SBC/SBC.Domain.Entities/Enums/`.
3. Always use the base interfaces from `@shared/types/common/global`:
   - `SuccessResponse<T>`: `{ data: T; message: string | null; statusCode: number; success: boolean }`
   - `PagedResult<T>`: `{ items: T[]; totalCount: number; page: number; pageSize: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean }`

## 2. `baseQueryWithReauth` & Authentication Architecture

- The base URL comes from `import.meta.env.VITE_API_URL` (set in `.env.local` during development).
- `baseQuery` automatically injects `Authorization: Bearer <token>` from `state.auth.token`.
- `baseQueryWithReauth` intercepts `401` responses:
  1. If both `token` and `refreshToken` exist in `auth` state, it calls `POST /auth/refresh-token`.
  2. When `success === true`, it dispatches `updateToken(...)` (updating `localStorage` `'token'` and `'refresh-token'`) and retries the original request.
  3. On failure or missing tokens, it dispatches `logout()` (clearing `'token'`, `'refresh-token'`, and `'user'` from `localStorage`), causing `AuthLayout` to redirect to `/login`.
- **Rule**: Do not introduce parallel `fetch` or `axios` clients; route all HTTP traffic through `apiSlice.ts` to preserve re-authentication and cache consistency.

## 3. Queries, Mutations & `tagTypes`

### Paginated & filtered GET queries

- Pass the filter object via `params` and convert empty strings to `undefined` before invoking the hook (`field !== '' ? field : undefined`).
- Always bridge page indices between MUI `TablePagination` (0-indexed) and the API (1-indexed): `pageNumber: page + 1`.
- Standard pattern in `apiSlice.ts`:
  ```typescript
  getItems: builder.query<
    SuccessResponse<PagedResult<ItemDto>>,
    ItemFilter | undefined
  >({
    query: (filter) => ({
      url: '/items',
      params: filter
    }),
    providesTags: ['Items']
  })
  ```

### `tagTypes` invalidation matrix

Keep cache consistent by invalidating every domain affected by a mutation:

| Mutated domain                               | Minimum tags to invalidate                                                                            |
| :------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| Accounts (`create`/`update`/`delete`)        | `'Accounts'`                                                                                          |
| Journal Entries (`create`/`update`/`delete`) | `'JournalEntries'`, `'Dashboard'` (plus `{ type: 'JournalEntries', id }` where applicable)            |
| Accounting Periods (`create`)                | `'AccountingPeriods'`                                                                                 |
| Period Closing (`close`)                     | `'AccountingPeriods'`, `'JournalEntries'` (and `'Dashboard'` / `'Reports'` if visible metrics change) |
| Bulk Import (`uploadBulkImport`)             | `'BulkImports'`, `'JournalEntries'`, `'Dashboard'`                                                    |
| Users (`create`/`update`)                    | `'Users'` (plus `{ type: 'Users', id }` on edit)                                                      |

- Always use `useAppDispatch` and `useAppSelector` from `@redux/hooks` when dispatching notifications or reading store state.
- Export all auto-generated hooks (`use<Name>Query`, `useLazy<Name>Query`, `use<Name>Mutation`) at the bottom of `apiSlice.ts`.

## 4. Binary Downloads (`Blob`: Excel, PDF & Templates)

The backend separates JSON endpoints (`/reports/...`) from binary downloads (`/financialReports/.../excel`, `.../pdf`, and `/bulkImports/template`). For any file download:

1. Define the endpoint in `apiSlice.ts` returning `Blob` with `responseHandler`:
   ```typescript
   getMyReportExcel: builder.query<Blob, MyReportParams>({
     query: ({ date, includeUnposted = false }) => ({
       url: `/financialReports/my-report/excel?date=${date}&includeUnposted=${includeUnposted}`,
       responseHandler: async (response) => await response.blob()
     })
   })
   ```
2. Export and call the lazy hook (`useLazyGetMyReportExcelQuery`) inside the module's action hook (`use<Module>Actions.ts`).
3. Call `.unwrap()`, create a temporary anchor element, trigger `.click()`, remove it from the DOM, and release memory via `window.URL.revokeObjectURL(url)`.
4. Dispatch `showNotification` with `severity: 'success'` or `'error'`.

## 5. File Uploads (`FormData`)

- Type the mutation argument as `FormData` and **do not** manually set the `Content-Type` header (the browser automatically adds the `multipart/form-data` boundary).
- Append the file using `formData.append('file', file)` matching the backend controller parameter name.
- After `.unwrap()`, clear the file input (`fileInputRef.current.value = ''`), refresh history if applicable, and dispatch `showNotification`.

## 6. Verification & Documentation Maintenance

1. Run:
   ```bash
   pnpm format
   pnpm lint
   pnpm build
   ```
2. **Agent documentation maintenance**: If you added new `tagTypes`, altered auth/refresh behavior, or introduced new API integration patterns, update `AGENTS.md`, this skill (`sbcclient-api-integration`), and its English mirror in `docs/agent-guidelines-en/`.
