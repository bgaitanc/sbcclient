# Project Guidelines

This document provides project-level instructions for Junie to ensure consistency and correctness in its operations within the `sbcclient` project.

## Project Overview

The `sbcclient` is a modern web application built with the following technologies:

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

### Code Style

- Follow the existing code style, which is managed by ESLint and Prettier.
- Use TypeScript for all new code.
- Run `pnpm format` to ensure code is properly formatted.
- Ensure that `pnpm lint` passes after any changes.

### Forms and Validations

- **Formik:** Always use the `useFormik` hook for form handling.
- **Yup:** Create validation schemas in separate `*.schema.ts` files.
- Ensure that form fields are properly typed to match the Yup schema and the API DTOs.

### Testing

- Currently, there is no testing framework configured in `package.json`. If you need to add tests, consider using Vitest as it integrates well with Vite.
- If tests are added later, always run them before submitting your changes.

### Building

- It is recommended to run `pnpm build` to ensure that there are no TypeScript errors or build issues before submitting your result.

### Submitting Results

- Before submitting, verify that the code compiles, is formatted correctly, and follows the project's linting rules.
- Always run `pnpm format` and `pnpm lint` before finishing a task.

### Cross-Project Analysis

- When modifying the frontend, you should check the API project in `../SBC/` for relevant endpoints, models, and business logic.
- Always check the `../SBC/SBC.Api/SBC.Api.http` file for a clear definition of the available endpoints and how to consume them.
- Ensure that frontend types match the DTOs defined in the `SBC.Application.Models` or `SBC.Api` projects.
- You have permission to read files in the `../SBC/` directory to understand the full stack implementation.
