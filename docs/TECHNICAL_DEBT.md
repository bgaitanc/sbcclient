# Registro de Deuda Técnica (`sbcclient`)

> **Aviso importante**: Este documento es un backlog interno de deuda técnica detectada durante el análisis del proyecto para su atención posterior. **No** forma parte de la base de conocimiento ni de las directrices activas para agentes (`AGENTS.md` / `.agents/skills/`). No utilices los elementos listados aquí como patrones a replicar.

---

## Prioridad Alta — Desalineaciones con el Backend (`../SBC/`)

### 1. Etiquetas invertidas de `AccountType` (`Cost` vs `Expense`)

- **Ubicación**: `app/modules/accounts/components/AccountForm.tsx` (líneas 24–31).
- **Referencia backend**: `../SBC/SBC.Domain.Entities/Enums/AccountType.cs`.
- **Detalle**: En el backend `5 = Cost` (Costos) y `6 = Expense` (Gastos), pero en `AccountForm.tsx` las opciones están invertidas (`{ value: 5, label: 'Gastos' }`, `{ value: 6, label: 'Costos' }`).
- **Acción sugerida**: Corregir el mapeo en `AccountForm.tsx` (e idealmente definir una constante `AccountType` `as const` en `app/shared/types/accounts/accountTypes.ts` alineada al enum del backend).

### 2. Enum `TransactionStatus` desalineado en Logs

- **Ubicación**: `app/shared/types/logs/logTypes.ts` (líneas 1–8) y `app/routes/Logs.tsx` (líneas 49–59 y 87–91).
- **Referencia backend**: `../SBC/SBC.Domain.Entities/Enums/TransactionStatus.cs`.
- **Detalle**: El backend define `Success = 0`, `Failure = 1`, `ValidationError = 2` y `PartialSuccess = 3`, mientras que el frontend solo define `Success: 0`, `Failure: 1`, `Warning: 2` (omitiendo `PartialSuccess` y renombrando `ValidationError`).
- **Acción sugerida**: Sincronizar `TransactionStatus` en `logTypes.ts` con los 4 valores del backend y actualizar chips y selector de filtros en `Logs.tsx`.

### 3. Ruta de actualización de cuentas (`updateAccount`)

- **Ubicación**: `app/redux/api/apiSlice.ts` (líneas 157–166).
- **Referencia backend**: `../SBC/SBC.Api/Controllers/AccountsController.cs` (líneas 57–61) y `../SBC/SBC.Api/SBC.Api.http` (`PUT {{SBC_HostAddress}}/api/accounts/{{accountId}}`).
- **Detalle**: El backend expone `PUT /api/accounts/{id:guid}`, mientras que `apiSlice.ts` envía `PUT /accounts` con el `id` únicamente en el cuerpo.
- **Acción sugerida**: Actualizar la URL en `apiSlice.ts` a `` `/accounts/${updatedAccount.id}` `` y verificar el payload esperado por `UpdateAccountDto`.

### 4. Vulnerabilidades conocidas en dependencias (`pnpm audit`)

- **Ubicación**: `package.json` y `pnpm-lock.yaml` (auditoría al `2026-11-20`).
- **Detalle**: `pnpm audit` reporta **74 vulnerabilidades** (`0 critical`, `43 high`, `27 moderate`, `4 low`) sobre 505 dependencias, concentradas en `vite` (19), `eslint` (18), `react-router` (12), `eslint-config-love` (11), `@react-router/dev` (10), `formik > lodash-es` (2), `@tailwindcss/vite` (1) y `eslint-plugin-react-hooks` (1).
- **Acción sugerida**: Ejecutar la hoja de ruta documentada en `docs/MIGRATION.md` (entrada `2026-11-20`) para resolver 72 de las 74 alertas mediante actualización de paquetes y mitigar los 2 avisos restantes de `formik > lodash-es` vía `overrides` en `pnpm-workspace.yaml` (o evaluación futura de librería de formularios).

---

## Prioridad Media — Funcionalidad Incompleta y Calidad de Código

### 5. Botón "Ver Asiento de Cierre" sin acción

- **Ubicación**: `app/routes/AccountingPeriods.tsx` (líneas 133–140).
- **Detalle**: El `IconButton` con `VisibilityIcon` ("Ver Asiento de Cierre") no tiene manejador `onClick` implementado.
- **Acción sugerida**: Conectar la acción para abrir un modal de detalle o navegar al asiento referenciado por `period.closingJournalEntryId`.

### 6. Ubicación inconsistente de esquemas Yup

- **Ubicación**:
  - `app/modules/users/schemas/user.schema.ts`
  - `app/modules/journalEntries/utils/journalEntry.schema.ts`
  - `app/modules/login/utils/login.schema.ts`
  - Esquemas inline en `app/modules/accounts/hooks/useAccountActions.ts` y `app/modules/accountingPeriods/hooks/useAccountingPeriodActions.ts`
- **Acción sugerida**: Unificar todos los esquemas de validación bajo `app/modules/<modulo>/schemas/<recurso>.schema.ts`.

### 7. Errores y advertencias preexistentes de ESLint (`pnpm lint`) y manejo de errores

Al ejecutar `pnpm lint` sobre el estado base del repositorio se reportan **68 errores y 1 advertencia** en archivos existentes de `app/`:

- **Formato / estilo**:
  - `app/components/shared/ConfirmDialog.tsx`: saltos de línea `CRLF` (`prettier/prettier`) y `arrow-body-style`.
  - `app/components/layout/MainLayout.tsx`: imports duplicados desde `@mui/material` (`import/no-duplicates`).
  - `app/redux/slices/notificationSlice.ts`: falta destructuring (`@typescript-eslint/prefer-destructuring`).
- **React Hooks v7**:
  - `app/components/ThemeToggle.tsx`: `setMounted(true)` síncrono dentro de `useEffect` (`react-hooks/set-state-in-effect`).
  - `app/modules/accountingPeriods/components/ClosePeriodDialog.tsx`: dependencia faltante `closeFormik` en `useEffect` (`react-hooks/exhaustive-deps`).
- **Complejidad ciclomática (`complexity > 10`)**:
  - `app/modules/accounts/components/AccountForm.tsx` (`15`), `app/modules/journalEntries/components/JournalEntryForm.tsx` (`18` y `11`), `app/modules/login/LoginModule.tsx` (`11`), `app/modules/users/hooks/useUserActions.ts` (`14`).
- **Condicionales estrictas, `console.error` y casts temporales**:
  - `app/modules/accountingPeriods/hooks/useAccountingPeriodActions.ts`: `console.error`, `strict-boolean-expressions` y `no-unnecessary-condition`.
  - `app/modules/journalEntries/components/JournalEntryForm.tsx` y `app/modules/users/hooks/useUserActions.ts`: `no-unnecessary-condition` y `no-unnecessary-boolean-literal-compare`.
  - `app/modules/login/hooks/useLoginActions.ts` (líneas 59–62): cast temporal con `TODO` que podría fallar si el error de red no incluye `data.message`.
- **Acción sugerida**: Resolver progresivamente el backlog de lint (extraer subcomponentes para reducir complejidad, crear un helper tipado para errores `FetchBaseQueryError`, normalizar `ConfirmDialog.tsx` a `LF` y eliminar `console.error` residuales) hasta lograr `pnpm lint` con 0 errores.

### 8. Cobertura de pruebas automatizadas

- **Ubicación**: `package.json`.
- **Detalle**: No existe actualmente un framework de pruebas unitarias o de componentes configurado.
- **Acción sugerida**: Configurar **Vitest** + **React Testing Library** y comenzar por cubrir esquemas Yup, helpers de negocio (partida doble, aplanamiento de cuentas) y slices de Redux.

### 9. Dependencias no utilizadas o redundantes en `package.json`

- **Ubicación**: `package.json` (`dependencies` y `devDependencies`), `app/root.tsx` (línea 3), `vite.config.ts` y `eslint.config.js`.
- **Detalle**:
  - `react-router-dom`: solo se usa para `import type { LinksFunction }` en `app/root.tsx:3` (ya exportado directamente por `react-router` y eliminado en React Router v8).
  - `@vitejs/plugin-react`: declarado en `devDependencies` pero no importado en `vite.config.ts` (`@react-router/dev/vite` ya gestiona JSX/Fast Refresh).
  - `isbot`: declarado en `dependencies` sin uso en `app/` (remanente de plantilla SSR en modo SPA `ssr: false`).
  - `eslint-plugin-import`, `eslint-plugin-n` y `eslint-plugin-promise`: declarados en `devDependencies` sin importarse en `eslint.config.js` (son dependencias internas de `eslint-config-love`; además `eslint-plugin-import` es incompatible con ESLint 10).
- **Acción sugerida**: Retirar `react-router-dom` (migrando el import en `app/root.tsx` a `react-router`), `@vitejs/plugin-react`, `isbot` y los plugins redundantes de ESLint durante la migración documentada en `docs/MIGRATION.md`.

---

## Prioridad Baja — Higiene y Metadatos

### 10. Atributo de idioma HTML en `app/root.tsx`

- **Ubicación**: `app/root.tsx` (línea 19).
- **Detalle**: Declara `<html lang="en">` aunque la interfaz completa está en español.
- **Acción sugerida**: Cambiar a `<html lang="es">`.

### 11. `README.md` de plantilla genérica de Vite

- **Ubicación**: `README.md`.
- **Detalle**: Conserva el texto predeterminado del template React + TypeScript + Vite.
- **Acción sugerida**: Reemplazarlo con la documentación real de instalación, configuración de `.env.local` y uso de `sbcclient`.

### 12. Fin de línea CRLF en `ConfirmDialog.tsx`

- **Ubicación**: `app/components/shared/ConfirmDialog.tsx`.
- **Detalle**: El archivo utiliza `CRLF` mientras `.prettierrc` y `.editorconfig` establecen `LF`.
- **Acción sugerida**: Normalizar a `LF` ejecutando `pnpm format` en un cambio dedicado de higiene.

### 13. Carpeta `build` omitida en `ignores` de `eslint.config.js`

- **Ubicación**: `eslint.config.js` (línea 11).
- **Detalle**: Declara `ignores: ['dist', '.react-router']`, pero el build de React Router genera los artefactos de salida en `build/`.
- **Acción sugerida**: Añadir `'build'` al arreglo de rutas ignoradas en `eslint.config.js`.
