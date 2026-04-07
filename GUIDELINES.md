# Project Guidelines - SBC Client

## Overview

SBC Client is a financial management frontend built with React 19, Vite 7, and Material UI 7.

## Key Modules

- **Dashboard**: Financial overview including assets, liabilities, equity, net income, recent movements, and top active accounts.
- **Journal Entries**: Management of accounting entries, including creation, editing, and posting.
- **Accounts**: Hierarchical chart of accounts management.
- **Reports**: Generation of Balance Sheets and Income Statements.
- **Transaction Logs**: Audit trail of system actions with filtering and pagination.
- **Bulk Import**: Excel-based mass upload of journal entries.

## Technical Decisions & Conventions

### Material UI

- **Grid Component**: Use the standard `Grid` component from `@mui/material`. Avoid `Grid2` to maintain compatibility with the current version and theme configuration.
- **Icons**: Always import icons from `@mui/icons-material`.

### TypeScript & Linting

- **Enums**: Avoid using standard `enum` because of `erasableSyntaxOnly` (React Router/Vite configuration). Use `const` objects with `typeof` as a safer alternative.
  ```typescript
  export const MyStatus = {
    Active: 1,
    Inactive: 0
  } as const
  export type MyStatus = (typeof MyStatus)[keyof typeof MyStatus]
  ```
- **Strict Booleans**: Always use explicit null/undefined checks in conditionals (e.g., `value !== null && value !== undefined`) to comply with `@typescript-eslint/strict-boolean-expressions`.
- **Promises**: Ensure that promise-returning functions in component attributes (like `onClick`) are wrapped or handled correctly to avoid `@typescript-eslint/no-misused-promises`.

### State Management

- **Redux Toolkit**: Use `apiSlice.ts` for all API interactions. Organize `tagTypes` for proper cache invalidation.
- **Hooks**: Use custom hooks like `useJournalEntryActions` to encapsulate business logic and API calls.

### API Integration

- **SuccessResponse**: All API responses follow the `SuccessResponse<T>` structure.
- **PagedResult**: Use the `PagedResult<T>` interface for paginated endpoints like Transaction Logs.
- **DTOs**: Ensure frontend types strictly match backend DTOs defined in `SBC.Application.Models`.
