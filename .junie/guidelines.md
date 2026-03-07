# Project Guidelines

This document provides project-level instructions for Junie to ensure consistency and correctness in its operations within the `sbcclient` project.

## Project Overview

The `sbcclient` is a modern web application built with the following technologies:
- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite 7
- **Package Manager:** pnpm

### Project Structure

- `src/`: Contains the application source code.
  - `main.tsx`: Entry point of the application.
  - `App.tsx`: Main component of the application.
  - `assets/`: Static assets like images and SVG files.
- `public/`: Public assets that are served directly.
- `dist/`: Output directory for the production build.
- `eslint.config.js`: ESLint configuration for code quality.
- `vite.config.ts`: Vite configuration for the build process.
- `tsconfig.json`: TypeScript configuration files.

## Development Workflow

### Available Scripts

- `pnpm dev`: Start the development server.
- `pnpm build`: Build the project for production.
- `pnpm lint`: Run ESLint to check for code quality issues.
- `pnpm preview`: Preview the production build locally.

## Guidelines for Junie

### Code Style
- Follow the existing code style, which is managed by ESLint and Prettier.
- Use TypeScript for all new code.
- Ensure that `pnpm lint` passes after any changes.

### Testing
- Currently, there is no testing framework configured in `package.json`. If you need to add tests, consider using Vitest as it integrates well with Vite.
- If tests are added later, always run them before submitting your changes.

### Building
- It is recommended to run `pnpm build` to ensure that there are no TypeScript errors or build issues before submitting your result.

### Submitting Results
- Before submitting, verify that the code compiles and follows the project's linting rules.
