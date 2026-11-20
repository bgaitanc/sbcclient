# Directrices del Proyecto `sbcclient` (Frontend SBC)

> Archivo universal de instrucciones para agentes de código y desarrolladores. Aplica a todo el repositorio `sbcclient`.

## 1. Resumen del Proyecto y Stack Tecnológico

**`sbcclient`** es la aplicación web frontend del **Sistema Básico de Contabilidad (SBC)**, una SPA de gestión financiera y contable construida sobre **React 19**, **React Router 7** (modo SPA, `ssr: false`), **TypeScript 5.9**, **Material UI 7**, **TailwindCSS 4** y **Redux Toolkit / RTK Query**.

| Componente                   | Tecnología / Versión verificada (`package.json`)                                                                                          |
| :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **Gestor de paquetes**       | `pnpm` (`pnpm@10.29.2`, `"type": "module"`)                                                                                               |
| **Framework UI**             | React `19.2.0` + React DOM `19.2.0`                                                                                                       |
| **Enrutamiento y Bundler**   | React Router `7.13.1` (`@react-router/dev`, `react-router`, `react-router-dom`, `ssr: false`) + Vite `7.3.1`                              |
| **Lenguaje**                 | TypeScript `~5.9.3` (`strict: true`, `erasableSyntaxOnly: true`, `verbatimModuleSyntax: true`)                                            |
| **Librería de Componentes**  | Material UI `7.3.9` (`@mui/material`, `@mui/icons-material`), Emotion `11.14`, `@mui/x-tree-view` `8.27.2`, `@fontsource/roboto` `5.2.10` |
| **CSS**                      | TailwindCSS `4.2.1` (`@tailwindcss/vite`) integrado con MUI 7 mediante CSS Cascade Layers                                                 |
| **Estado y API**             | Redux Toolkit `2.11.2` + `react-redux` `9.2.0` + RTK Query (`apiSlice.ts`)                                                                |
| **Formularios y Validación** | Formik `2.4.9` (`useFormik`) + Yup `1.7.1`                                                                                                |
| **Linting y Formato**        | ESLint `9.39.1` (flat config) + `eslint-config-love` `116.0.0` + `typescript-eslint` `8.48.0` + Prettier `3.8.1`                          |

---

## 2. Arquitectura, Estructura de Carpetas, Rutas y Alias

### Estructura principal (`app/`)

- `app/root.tsx`: Documento raíz (`Layout` y `App` con `<Outlet />`), `<Provider store={store}>`, `<StyledEngineProvider enableCssLayer>`, `<ThemeProvider theme={theme} modeStorageKey="sbc-theme-mode" defaultMode="dark">`, `<GlobalStyles styles="@layer theme, base, mui, components, utilities;" />` y `<CssBaseline />`.
- `app/routes.ts`: Definición centralizada de rutas (`RouteConfig` de `@react-router/dev/routes`).
- `app/theme.ts` y `app/index.css`: Tema Material 3 (esquemas `light` y `dark`) y mapeo `@theme` de variables CSS de MUI hacia TailwindCSS 4.
- `app/components/`:
  - `layout/AuthLayout.tsx`: Guardia de autenticación; redirige a `/login` si `selectIsAuthenticated` es `false`.
  - `layout/MainLayout.tsx`: `AppBar`, `Drawer` permanente (`280px`) con `menuItems`, `ThemeToggle`, información de usuario, cierre de sesión, contenedor principal `<Outlet />` y `<Snackbar>` + `<Alert>` global conectado a `notificationSlice`.
  - `shared/ConfirmDialog.tsx`: Diálogo reutilizable de confirmación para acciones destructivas o sensibles.
  - `ThemeToggle.tsx`: Selector claro/oscuro con `useColorScheme()` y guarda `mounted`.
- `app/routes/`: Páginas de nivel de ruta:
  - `/` → `Dashboard.tsx` (Resumen financiero: activos, pasivos, patrimonio, ingresos, costos, gastos, utilidad neta, movimientos recientes y cuentas más activas)
  - `/accounts` → `Accounts.tsx` (Catálogo jerárquico de cuentas con `RichTreeView` y formulario lateral)
  - `/journalEntries` → `JournalEntries.tsx` (Listado paginado con filas expandibles, CRUD de asientos contables y confirmación)
  - `/batch` → `Batch.tsx` (Carga masiva Excel, descarga de plantilla e historial paginado)
  - `/reports` → `Reports.tsx` (Balance General y Estado de Resultados con modo provisional `includeUnposted` y exportación Excel/PDF)
  - `/periods` → `AccountingPeriods.tsx` (Apertura y cierre de periodos contables)
  - `/logs` → `Logs.tsx` (Auditoría paginada y filtrable de `TransactionLog`)
  - `/users` → `Users.tsx` (Gestión paginada y filtrable de usuarios, roles y cambio de contraseña)
  - `/login` → `LoginPage.tsx` (Ruta pública; redirige a `/` si ya hay sesión activa)
- `app/modules/<modulo>/`: Lógica y componentes encapsulados por dominio (`accountingPeriods`, `accounts`, `bulkImport`, `journalEntries`, `login`, `reports`, `users`), organizados en:
  - `components/`: Formularios, vistas y diálogos del módulo.
  - `hooks/`: Custom hooks `use<Recurso>Actions.ts` que encapsulan mutaciones RTK Query, Formik y notificaciones.
  - `schemas/`: Esquemas de validación Yup (`<recurso>.schema.ts`) — usa esta carpeta como estándar para nuevos módulos (algunos módulos previos conservan `utils/*.schema.ts`).
- `app/redux/`:
  - `store.ts`: Combina `auth`, `notification` y `[apiSlice.reducerPath]` con `apiSlice.middleware` y `setupListeners`.
  - `hooks.ts`: Hooks tipados `useAppDispatch` y `useAppSelector`.
  - `api/apiSlice.ts`: Definición única de RTK Query, `baseQueryWithReauth`, `tagTypes`, endpoints y hooks exportados.
  - `slices/authSlice.ts`: Estado de sesión y persistencia en `localStorage` (`token`, `refresh-token`, `user`).
  - `slices/notificationSlice.ts`: Estado global del `Snackbar` (`showNotification`, `hideNotification`, `selectNotification`).
- `app/shared/types/<dominio>/`: Interfaces y tipos TypeScript que reflejan los DTOs del backend (`common/global.ts` define `SuccessResponse<T>` y `PagedResult<T>`).

### Alias de importación (`vite.config.ts` y `tsconfig.app.json`)

Prefiere siempre los alias configurados sobre rutas relativas profundas (`../../../`):

| Alias        | Ruta destino    |
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

## 3. Comandos Estándar (CLI)

Ejecuta todos los comandos con **`pnpm`** desde la raíz del repositorio (`sbcclient`):

```bash
# Iniciar servidor de desarrollo (http://localhost:5173)
pnpm dev

# Formatear el código con Prettier
pnpm format

# Ejecutar ESLint (incluye validación de Prettier y reglas estrictas de TypeScript)
pnpm lint

# Verificación de tipos (tsc -b) y build de producción (vite build)
pnpm build

# Previsualizar el build de producción localmente
pnpm preview
```

---

## 4. Configuración, Entorno e Integración con `../SBC/`

- **Variables de entorno**:
  - `.env` declara la plantilla `VITE_API_URL=`.
  - Configura los valores locales en `.env.local` (ignorado por Git mediante `*.local`). **Nunca** commitees URLs productivas, tokens ni credenciales en archivos versionados ni hardcodees la URL de la API en el código.
  - El servidor de desarrollo corre en `http://localhost:5173`, alineado con la política CORS del backend (`../SBC/SBC.Api/Program.cs`).
- **Análisis cruzado con el backend (`../SBC/`)**:
  - Tienes permiso de lectura sobre el repositorio hermano `../SBC/` para verificar contratos y reglas de negocio antes de modificar el frontend.
  - Consulta siempre como fuente de verdad:
    - `../SBC/SBC.Api/SBC.Api.http`: Endpoints, verbos HTTP, rutas, parámetros query y ejemplos de payload.
    - `../SBC/SBC.Api/Controllers/`: Rutas exactas, códigos HTTP y respuestas binarias vs JSON.
    - `../SBC/SBC.Application.Models/`: Estructura exacta de DTOs de entrada/salida y filtros.
    - `../SBC/SBC.Domain.Entities/Enums/`: Valores numéricos exactos de enums (`AccountType`, `TransactionStatus`).
    - `../SBC/AGENTS.md`: Reglas de negocio contables y convenciones del backend.

---

## 5. Convenciones de Código, TypeScript, ESLint y Prettier

### TypeScript estricto (`tsconfig.app.json`)

- **Sin `enum` de TypeScript (`erasableSyntaxOnly: true`)**: Nunca declares `enum`. Usa objetos `as const` con tipo derivado:
  ```typescript
  export const MyStatus = {
    Active: 1,
    Inactive: 0
  } as const
  export type MyStatus = (typeof MyStatus)[keyof typeof MyStatus]
  ```
- **Importaciones solo de tipo (`verbatimModuleSyntax: true`)**: Usa siempre `import type { ... }` (o `import { type Foo, bar }`) para tipos e interfaces.
- **Limpieza estricta**: Respeta `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true` y `noFallthroughCasesInSwitch: true`.

### ESLint (`eslint-config-love`) y Prettier (`.prettierrc`)

- **Prettier obligatorio (`prettier/prettier: error`)**: sin punto y coma (`semi: false`), comillas simples (`singleQuote: true`), sin comas finales (`trailingComma: "none"`), indentación de 2 espacios, paréntesis en flechas (`arrowParens: "always"`) y fin de línea `LF`.
- **Booleanos estrictos (`@typescript-eslint/strict-boolean-expressions`)**: En condiciones usa siempre comparaciones explícitas contra `null`, `undefined`, `''` o booleanos (`value !== null && value !== undefined`, `value != null`, `text !== ''`, `formik.touched.field === true && Boolean(formik.errors.field)`).
- **Promesas en eventos JSX (`@typescript-eslint/no-misused-promises`)**: Envuelve funciones `async` o retornos de promesa (`navigate`, `refetch`, `submitForm`, `setFieldValue`) en manejadores de eventos síncronos:
  ```tsx
  onClick={() => {
    void handleSubmitAction()
  }}
  ```
- **Aserciones seguras y comentarios de excepción**: Evita casts inseguros (`as`) y `console.*`. Si una directiva `eslint-disable-next-line` es estrictamente inevitable, incluye siempre una justificación con `-- <razón>` (requerido por `eslint-config-love`).
- **Complejidad, estilo y React Hooks v7**: Respeta el límite de complejidad ciclomática (`complexity` ≤ `10` por función; divide componentes o hooks extensos en subcomponentes/helpers), `prefer-destructuring` en objetos, `arrow-body-style`, `import/no-duplicates` (agrupa imports del mismo módulo) y `react-hooks/set-state-in-effect` (evita llamar `setState` síncronamente dentro de `useEffect`).
- **Idioma en el código**:
  - Nombres de archivos, componentes, hooks, tipos, endpoints y acciones Redux en **inglés**.
  - Textos visibles de interfaz, etiquetas de campos, encabezados de tabla, mensajes de validación Yup y notificaciones al usuario en **español**.

---

## 6. UI, Material UI 7, TailwindCSS 4 y Diseño Visual

- **CSS Cascade Layers**: Mantén intacto el orden `@layer theme, base, mui, components, utilities;` en `app/root.tsx`, `app/theme.ts` y `app/index.css` para que las utilidades de TailwindCSS 4 convivan con Material UI 7 sin conflictos de especificidad.
- **Tema claro/oscuro Material 3 (`app/theme.ts` y `app/index.css`)**:
  - Usa siempre tokens semánticos del tema MUI (`primary`, `secondary`, `tertiary`, `primaryContainer`, `surfaceVariant`, `outline`, `outlineVariant`, `background.paper`, `text.secondary`) o sus utilidades Tailwind mapeadas en `@theme` (`bg-background`, `text-primary`, `border-outline-variant`).
  - **No** hardcodees colores hexadecimales en componentes para garantizar compatibilidad total con los modos `light` y `dark` (`modeStorageKey="sbc-theme-mode"`, `defaultMode="dark"`).
- **Reglas de Material UI 7**:
  - **Grid**: Usa siempre `Grid` de `@mui/material` con la sintaxis v7 `size={{ xs: 12, sm: 6, md: 3 }}`. **Nunca** uses `Grid2` ni la sintaxis legada `item xs={12}`.
  - **`slotProps`**: Usa `slotProps` (`slotProps={{ inputLabel: { shrink: true } }}`, `slotProps={{ htmlInput: { min: 1, max: 12 } }}`, `slotProps={{ input: { startAdornment: ... } }}`) en lugar de props deprecadas (`InputProps`, `inputProps`, `InputLabelProps`).
  - **Iconos**: Importa siempre desde `@mui/icons-material`.
  - **Árboles jerárquicos**: Usa `RichTreeView` de `@mui/x-tree-view/RichTreeView` (como en el catálogo de cuentas).
- **Retroalimentación y confirmaciones**:
  - **Notificaciones**: Despacha `showNotification({ message, severity })` desde `@redux/slices/notificationSlice` tras mutaciones o descargas (el `Snackbar` global vive en `MainLayout.tsx`).
  - **Confirmaciones**: **NUNCA** uses `window.confirm` ni `window.alert`. Usa siempre `<ConfirmDialog />` desde `@/components/shared/ConfirmDialog`.
- **Formato visual**:
  - Montos monetarios con `toLocaleString('es-NI', { style: 'currency', currency: 'NIO' })` en tarjetas resumen y `minimumFractionDigits: 2` en tablas contables.
  - Fechas en inputs HTML `type="date"` con formato `YYYY-MM-DD`.

---

## 7. Gestión de Estado, Autenticación y API (Redux Toolkit + RTK Query)

- **Hooks tipados**: Usa siempre `useAppDispatch` y `useAppSelector` de `@redux/hooks`, nunca `useDispatch`/`useSelector` sin tipar de `react-redux`.
- **Centralización en `app/redux/api/apiSlice.ts`**:
  - Todas las llamadas HTTP deben pasar por `apiSlice.ts` usando `baseQueryWithReauth`, que inyecta `Authorization: Bearer <token>`, intercepta respuestas `401`, intenta refrescar el token en `POST /auth/refresh-token` y ejecuta `logout()` si el refresh falla.
  - Respeta los envoltorios estándar del backend: `SuccessResponse<T>` y `PagedResult<T>` (`@shared/types/common/global`).
  - Mantén organizados `tagTypes` (`Accounts`, `JournalEntries`, `Reports`, `AccountingPeriods`, `BulkImports`, `Dashboard`, `Logs`, `Users`) y las invalidaciones cruzadas correspondientes (ej. crear/editar/eliminar asientos o carga masiva invalida `JournalEntries` y `Dashboard`).
- **Paginación (`0-indexed` ↔ `1-indexed`)**:
  - `TablePagination` de MUI usa páginas base `0`, mientras que la API (`BaseFilterDto`) usa `pageNumber` base `1`. Convierte siempre con `pageNumber: page + 1` y reinicia la página a `0` (o `1` en filtros) al cambiar criterios de búsqueda o `pageSize`.
- **Archivos binarios y cargas**:
  - Descargas Excel/PDF/plantillas: usa `builder.query<Blob, ...>` con `responseHandler: async (response) => await response.blob()`, consume el hook `useLazy...Query`, dispara la descarga temporal vía `URL.createObjectURL` y libera siempre memoria con `URL.revokeObjectURL`.
  - Subidas de archivos (ej. Excel en carga masiva): envía `FormData` mediante `builder.mutation`.

---

## 8. Formularios y Validación (Formik + Yup)

- Usa siempre el hook **`useFormik`** encapsulado dentro de un custom hook del módulo (`app/modules/<modulo>/hooks/use<Recurso>Actions.ts`).
- Define esquemas de validación Yup en archivos dedicados (`schemas/<recurso>.schema.ts` para módulos nuevos), estrictamente alineados con los tipos del formulario y los DTOs del backend.
- Activa `enableReinitialize: true` cuando el formulario soporte tanto creación como edición (`initialData`).
- Usa `.unwrap()` sobre mutaciones RTK Query dentro de `try/catch` para despachar `showNotification` con severidad `'success'` o `'error'` y ejecutar el callback `onSuccess` solo cuando la operación tenga éxito.
- Respeta en cliente las reglas contables clave:
  - Asientos contables: mínimo 2 líneas, cada línea con `debit > 0 || credit > 0`, partida doble (`Math.abs(totalDebit - totalCredit) < 0.01`).
  - Cierre de período: filtrar cuentas de patrimonio (`account.type === 3`).

---

## 9. Pruebas y Verificación Obligatoria

- Actualmente no existe un framework de pruebas configurado en `package.json`. Si se agregan pruebas en el futuro, usa **Vitest** (integración nativa con Vite) y ejecútalas antes de finalizar cada tarea.
- **Verificación obligatoria antes de dar cualquier cambio por terminado**:
  1. `pnpm format` (o `pnpm exec prettier --write` sobre los archivos modificados si corresponde)
  2. `pnpm lint` (sin errores de ESLint ni Prettier)
  3. `pnpm build` (`tsc -b && vite build` sin errores de tipos ni empaquetado)

---

## 10. Control de Versiones (Git)

- **Nunca** ejecutes `git commit` ni `git push` a menos que el usuario lo solicite explícitamente.
- Cuando se solicite un commit, redacta mensajes claros y descriptivos del cambio técnico, sin agregar trailers ni metadatos de co-autoría acoplados a un agente concreto (salvo solicitud explícita del usuario).

---

## 11. Mantenimiento Continuo de `AGENTS.md`, Skills y Respaldo en Inglés (Obligatorio)

**Regla viva de documentación**: En **cada desarrollo o solicitud** realizada sobre este repositorio, antes de dar la tarea por terminada, evalúa si tus cambios afectan alguna información, arquitectura, regla o flujo documentado en `AGENTS.md` o en las skills de `.agents/skills/`.

Debes actualizar `AGENTS.md` y/o las skills correspondientes **en la misma intervención** siempre que:

- Se agreguen, eliminen o renombren dependencias clave, scripts de `package.json`, rutas, alias de importación, módulos, slices o `tagTypes`.
- Cambien convenciones de TypeScript, ESLint, Prettier, MUI, TailwindCSS, tema claro/oscuro, formularios o notificaciones.
- Cambien patrones de integración con `../SBC/`, autenticación/refresh JWT, paginación, descargas `Blob` o subidas `FormData`.
- Se configure un framework de pruebas (ej. Vitest) o surja un flujo repetitivo nuevo que justifique crear una nueva skill.

**Sincronización del respaldo en inglés**: Cada vez que modifiques `AGENTS.md` o cualquier archivo en `.agents/skills/<nombre>/SKILL.md`, actualiza también su copia espejo equivalente en `docs/agent-guidelines-en/` (`AGENTS.en.md` o `skills/<nombre>.en.md`) —y `docs/agent-guidelines-en/README.md` si se agregan o eliminan skills— para mantener ambos idiomas 100 % alineados.

---

## 12. Skills del Proyecto (`.agents/skills/`)

Consulta la skill especializada correspondiente cuando la tarea involucre alguno de estos flujos:

| Skill                        | Archivo                                                                                                  | Cuándo usarla                                                                                                                            |
| :--------------------------- | :------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `sbcclient-add-module`       | [.agents/skills/sbcclient-add-module/SKILL.md](.agents/skills/sbcclient-add-module/SKILL.md)             | Crear o ampliar un módulo funcional completo, nueva ruta/página, entrada de menú o vista CRUD/paginada                                   |
| `sbcclient-api-integration`  | [.agents/skills/sbcclient-api-integration/SKILL.md](.agents/skills/sbcclient-api-integration/SKILL.md)   | Agregar o actualizar endpoints RTK Query, tipos DTO sincronizados con `../SBC/`, tags, paginación, descargas `Blob` o subidas `FormData` |
| `sbcclient-forms-validation` | [.agents/skills/sbcclient-forms-validation/SKILL.md](.agents/skills/sbcclient-forms-validation/SKILL.md) | Crear o modificar formularios, diálogos con formulario, esquemas Yup, hooks `useFormik` o confirmaciones destructivas                    |
| `sbcclient-ui-theming`       | [.agents/skills/sbcclient-ui-theming/SKILL.md](.agents/skills/sbcclient-ui-theming/SKILL.md)             | Diseñar o estilizar vistas, tablas, grids MUI 7, CSS Layers con Tailwind 4, modo claro/oscuro o tokens Material 3                        |

---

## 13. Registro de Deuda Técnica (`docs/TECHNICAL_DEBT.md`)

- **Ubicación**: El backlog de deuda técnica del repositorio se mantiene en [docs/TECHNICAL_DEBT.md](docs/TECHNICAL_DEBT.md).
- **NO es base de conocimiento (prohibido)**: Este archivo **no** forma parte de las directrices ni de la base de conocimiento para agentes. **Nunca** lo utilices para inferir convenciones del proyecto ni repliques los defectos, desalineaciones o patrones temporales registrados en él.
- **Cuándo actualizarlo**:
  - **Al detectar nueva deuda**: Si durante una tarea o análisis identificas deuda técnica relevante fuera del alcance actual (desalineaciones con `../SBC/`, errores preexistentes de lint, funcionalidad incompleta o deuda estructural), regístrala en `docs/TECHNICAL_DEBT.md` con ubicación, detalle y acción sugerida.
  - **Al resolver deuda existente**: Si tu cambio corrige total o parcialmente un punto listado en `docs/TECHNICAL_DEBT.md`, elimínalo o actualiza su estado en la misma intervención.
  - **Separación estricta**: Mantén la deuda técnica exclusivamente en `docs/TECHNICAL_DEBT.md`; no la incorpores dentro de `AGENTS.md` ni en `.agents/skills/`.
