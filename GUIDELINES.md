# Project Guidelines

This document provides project-level instructions for Junie to ensure consistency and correctness in its operations within the `sbcclient` project.

## Project Overview

The `sbcclient` is a modern web application (financial management frontend) built with the following technologies:

- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite 7
- **CSS Framework:** TailwindCSS 4
- **UI Library:** Material UI 7
- **Form Management:** Formik 2.4.9
- **Validation Schema:** Yup 1.7.1
- **Package Manager:** pnpm

### Project Structure

- `app/`: Contains the application source code.
  - `root.tsx`: Root component of the application.
  - `routes.ts`: Route definitions.
  - `routes/`: Page components and route handlers.
  - `assets/`: Static assets like images and SVG files.
- `public/`: Public assets that are served directly.
- `dist/`: Output directory for the production build.
- `eslint.config.js`: ESLint configuration for code quality.
- `vite.config.ts`: Vite configuration for the build process.
- `tsconfig.json`: TypeScript configuration files.

### Key Modules

- **Dashboard**: Financial overview including assets, liabilities, equity, net income, recent movements, and top active accounts.
- **Journal Entries**: Management of accounting entries, including creation, editing, and posting.
- **Accounts**: Hierarchical chart of accounts management.
- **Reports**: Generation of Balance Sheets and Income Statements.
- **Transaction Logs**: Audit trail of system actions with filtering and pagination.
- **Bulk Import**: Excel-based mass upload of journal entries.

### Related Projects

- `../SBC/`: Contains the backend API project.
  - `SBC.Api/`: The main API project with controllers and endpoints.
    - `SBC.Api.http`: Use this file to review the available endpoints and examples of requests.
  - `SBC.Domain/` and `SBC.Domain.Entities/`: Domain logic and data models.
  - `SBC.Application/` and `SBC.Application.Models/`: Application services and DTOs.
  - `SBC.Infrastructure/`: Infrastructure concerns like database access.

## Development Workflow

### Available Scripts

- `pnpm dev`: Start the development server.
- `pnpm build`: Build the project for production.
- `pnpm lint`: Run ESLint to check for code quality issues.
- `pnpm format`: Run Prettier to format the code.
- `pnpm preview`: Preview the production build locally.

## Guidelines for Junie

### Code Style & Technical Decisions

- **Consistency**: Follow the existing code style, which is managed by ESLint and Prettier.
- **TypeScript**: Use TypeScript for all new code. Always run `pnpm format` and `pnpm lint` after any changes.
- **Material UI**:
  - **Grid Component**: Use the standard `Grid` component from `@mui/material`. Avoid `Grid2` to maintain compatibility with the current version and theme configuration.
  - **Icons**: Always import icons from `@mui/icons-material`.
- **TypeScript & Linting**:
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

### Forms and Validations

- **Formik:** Always use the `useFormik` hook for form handling.
- **Yup:** Create validation schemas in separate `*.schema.ts` files.
- Ensure that form fields are properly typed to match the Yup schema and the API DTOs.

### State Management

- **Redux Toolkit**: Use `apiSlice.ts` for all API interactions. Organize `tagTypes` for proper cache invalidation.
- **Hooks**: Use custom hooks (like `useJournalEntryActions`) to encapsulate business logic and API calls.

### Testing

- Currently, there is no testing framework configured in `package.json`. If you need to add tests, consider using Vitest as it integrates well with Vite.
- If tests are added later, always run them before submitting your changes.

### Building & Submitting Results

- **Build**: It is recommended to run `pnpm build` to ensure that there are no TypeScript errors or build issues before submitting your result.
- **Verification**: Before submitting, verify that the code compiles, is formatted correctly, and follows the project's linting rules.
- Always run `pnpm format` and `pnpm lint` before finishing a task.

### Cross-Project Analysis & API Integration

- **SuccessResponse**: All API responses follow the `SuccessResponse<T>` structure.
- **PagedResult**: Use the `PagedResult<T>` interface for paginated endpoints like Transaction Logs.
- **DTOs**: Ensure frontend types strictly match backend DTOs defined in `SBC.Application.Models` or `SBC.Api`.
- **Analysis**: When modifying the frontend, check the API project in `../SBC/` for relevant endpoints, models, and business logic.
- **Reference**: Always check the `../SBC/SBC.Api/SBC.Api.http` file for a clear definition of the available endpoints and how to consume them.
- **Access**: You have permission to read files in the `../SBC/` directory to understand the full stack implementation.
