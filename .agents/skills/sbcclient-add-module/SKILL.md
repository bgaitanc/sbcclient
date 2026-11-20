---
name: sbcclient-add-module
description: >-
  Guía paso a paso para crear o ampliar un módulo funcional completo, nueva
  ruta/página, entrada en el menú lateral y flujo CRUD o listado paginado en
  sbcclient. Úsala siempre que se agregue una nueva pantalla, dominio funcional
  o sección de navegación en la aplicación frontend.
---

# Flujo Completo para Agregar un Módulo o Ruta en `sbcclient`

Sigue este orden de capas de datos hacia interfaz para mantener consistencia arquitectónica, tipado estricto, invalidación de caché y compatibilidad con ESLint (`eslint-config-love`).

## 1. Verificar el Contrato Backend (`../SBC/`)

Antes de escribir tipos o endpoints en el frontend:

1. Revisa `../SBC/SBC.Api/SBC.Api.http` para confirmar rutas exactas, verbos HTTP, query params y cuerpos de ejemplo.
2. Verifica los DTOs de entrada/salida y filtros en `../SBC/SBC.Application.Models/` y los enums en `../SBC/SBC.Domain.Entities/Enums/`.
3. Si el endpoint devuelve una colección, confirma que utilice `PagedResultDto<T>` y los parámetros de `BaseFilterDto` (`pageNumber`, `pageSize`, más filtros específicos).

## 2. Tipos Compartidos (`app/shared/types/<dominio>/`)

1. Crea `app/shared/types/<dominio>/<recurso>Types.ts`.
2. Modela con exactitud los DTOs del backend (en camelCase JSON): entidad de lectura, DTOs de creación/actualización (`Create...Req` / `Update...Req` o `...Dto`) y filtro (`...Filter` con `pageNumber?: number` y `pageSize?: number`).
3. **Nunca uses `enum` de TypeScript** (`erasableSyntaxOnly: true`); usa objetos `as const` con tipo derivado:

   ```typescript
   export const ExampleStatus = {
     Active: 0,
     Inactive: 1
   } as const

   export type ExampleStatus =
     (typeof ExampleStatus)[keyof typeof ExampleStatus]
   ```

4. Reutiliza `SuccessResponse<T>` y `PagedResult<T>` desde `@shared/types/common/global` mediante `import type`.

## 3. Endpoints y Caché RTK Query (`app/redux/api/apiSlice.ts`)

_(Consulta la skill `sbcclient-api-integration` para detalles de tags, descargas binarias o subidas `FormData`.)_

1. Si es un dominio nuevo, registra el tag en `tagTypes` de `apiSlice`.
2. Define queries y mutations tipadas usando `SuccessResponse<...>` / `SuccessResponse<PagedResult<...>>`.
3. Configura `providesTags` en las queries e `invalidatesTags` en las mutaciones (incluyendo tags relacionados como `'Dashboard'` si el cambio afecta indicadores globales).
4. Exporta los hooks generados al final de `app/redux/api/apiSlice.ts`.

## 4. Estructura del Módulo (`app/modules/<modulo>/`)

Organiza el código del dominio en una carpeta dedicada:

```text
app/modules/<modulo>/
├── components/           # Formularios, tablas, filtros y diálogos del módulo
├── hooks/
│   └── use<Recurso>Actions.ts  # Mutaciones, useFormik y notificaciones
└── schemas/
    └── <recurso>.schema.ts     # Esquemas de validación Yup
```

- Encapsula la lógica de formularios y mutaciones en `hooks/use<Recurso>Actions.ts` (ver skill `sbcclient-forms-validation`).
- Despacha `showNotification({ message, severity })` desde `@redux/slices/notificationSlice` en cada operación de creación, actualización, eliminación o descarga.
- Para acciones destructivas, utiliza siempre `<ConfirmDialog />` (`@/components/shared/ConfirmDialog`), **nunca** `window.confirm`.

## 5. Página de Ruta (`app/routes/<Pagina>.tsx`)

1. Crea el componente de página con export por defecto (`export default function <Pagina>()`) usando los alias (`@redux/...`, `@modules/...`, `@shared/...`, `@/...`).
2. Contempla siempre los 4 estados de vista:
   - **Carga (`isLoading`)**: `<CircularProgress />` centrado.
   - **Error (`isError`)**: mensaje claro o `<Alert severity="error">`.
   - **Vacío**: fila o `<Paper>` indicando en español que no existen registros.
   - **Datos**: tabla o tarjetas usando componentes MUI 7 (ver skill `sbcclient-ui-theming`).
3. Para listados paginados con `TablePagination`:
   - Mantén `page` en base `0` para MUI y envía `pageNumber: page + 1` al query RTK.
   - Reinicia `setPage(0)` al cambiar `pageSize` o cualquier filtro de búsqueda.
   - Envuelve llamadas async o `refetch()` en handlers síncronos con `void` para cumplir `@typescript-eslint/no-misused-promises`.

## 6. Registrar la Ruta y la Navegación

1. **Enrutamiento (`app/routes.ts`)**:
   - Agrega la nueva ruta dentro del bloque protegido `AuthLayout` → `MainLayout` (o fuera si es pública):
     ```typescript
     route('miRuta', 'routes/MiPagina.tsx')
     ```
2. **Menú lateral (`app/components/layout/MainLayout.tsx`)**:
   - Si la sección debe aparecer en la barra lateral, agrega una entrada en `menuItems` con texto en español, icono de `@mui/icons-material` y el mismo `path` registrado en `app/routes.ts`.

## 7. Verificación y Mantenimiento de Documentación

1. Ejecuta en orden desde la raíz de `sbcclient`:
   ```bash
   pnpm format
   pnpm lint
   pnpm build
   ```
2. **Mantenimiento de documentación de agentes**: Si este módulo agregó rutas, módulos, `tagTypes`, dependencias o patrones nuevos, actualiza `AGENTS.md`, las skills afectadas en `.agents/skills/` y su respaldo espejo en `docs/agent-guidelines-en/`.
