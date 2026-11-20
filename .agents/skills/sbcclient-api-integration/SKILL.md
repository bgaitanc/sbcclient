---
name: sbcclient-api-integration
description: >-
  Guía para integrar y mantener endpoints RTK Query en app/redux/api/apiSlice.ts,
  sincronizar tipos DTO con el backend ../SBC/, configurar tagTypes e
  invalidación de caché, manejar paginación, descargas binarias Blob (Excel/PDF)
  y cargas FormData en sbcclient. Úsala al tocar apiSlice.ts, authSlice.ts o
  contratos en app/shared/types/.
---

# Integración con la API SBC y RTK Query (`apiSlice.ts`)

## 1. Fuente de Verdad del Contrato (`../SBC/`)

Antes de agregar o modificar endpoints o tipos compartidos:

1. Consulta `../SBC/SBC.Api/SBC.Api.http` y el controlador correspondiente en `../SBC/SBC.Api/Controllers/` para confirmar ruta exacta, verbo HTTP, parámetros de ruta/query y código de respuesta.
2. Verifica propiedades y tipos en `../SBC/SBC.Application.Models/` y valores numéricos de enums en `../SBC/SBC.Domain.Entities/Enums/`.
3. Usa siempre las interfaces base de `@shared/types/common/global`:
   - `SuccessResponse<T>`: `{ data: T; message: string | null; statusCode: number; success: boolean }`
   - `PagedResult<T>`: `{ items: T[]; totalCount: number; page: number; pageSize: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean }`

## 2. Arquitectura de `baseQueryWithReauth` y Autenticación

- La URL base se lee de `import.meta.env.VITE_API_URL` (definida en `.env.local` durante desarrollo).
- `baseQuery` inyecta automáticamente `Authorization: Bearer <token>` desde `state.auth.token`.
- `baseQueryWithReauth` intercepta respuestas `401`:
  1. Si existen `token` y `refreshToken` en el estado `auth`, llama a `POST /auth/refresh-token`.
  2. Si la respuesta tiene `success === true`, despacha `updateToken(...)` (actualizando `localStorage`: `'token'` y `'refresh-token'`) y reintenta la petición original.
  3. Si falla o no hay tokens, despacha `logout()` (limpiando `'token'`, `'refresh-token'` y `'user'` en `localStorage`), lo que provoca la redirección a `/login` vía `AuthLayout`.
- **Regla**: No implementes clientes `fetch` ni `axios` paralelos; centraliza toda comunicación HTTP en `apiSlice.ts` para preservar el flujo de reautenticación y caché.

## 3. Definición de Queries, Mutaciones y `tagTypes`

### Consultas GET paginadas y filtradas

- Pasa el objeto de filtro en `params` y omite cadenas vacías convirtiéndolas a `undefined` antes de invocar el hook (`field !== '' ? field : undefined`).
- Convierte siempre el índice de página entre MUI `TablePagination` (base `0`) y la API (base `1`): `pageNumber: page + 1`.
- Ejemplo estándar en `apiSlice.ts`:
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

### Matriz de invalidación de `tagTypes`

Mantén la caché consistente invalidando todos los recursos afectados por cada mutación:

| Dominio mutado                        | Tags mínimos a invalidar                                                                                           |
| :------------------------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Cuentas (`create`/`update`/`delete`)  | `'Accounts'`                                                                                                       |
| Asientos (`create`/`update`/`delete`) | `'JournalEntries'`, `'Dashboard'` (y `{ type: 'JournalEntries', id }` si aplica)                                   |
| Periodos contables (`create`)         | `'AccountingPeriods'`                                                                                              |
| Cierre de período (`close`)           | `'AccountingPeriods'`, `'JournalEntries'` (y `'Dashboard'` / `'Reports'` si el cierre afecta indicadores visibles) |
| Carga masiva (`uploadBulkImport`)     | `'BulkImports'`, `'JournalEntries'`, `'Dashboard'`                                                                 |
| Usuarios (`create`/`update`)          | `'Users'` (y `{ type: 'Users', id }` al editar)                                                                    |

- Usa `useAppDispatch` y `useAppSelector` de `@redux/hooks` al despachar notificaciones o leer estado desde hooks de acciones.
- Recuerda exportar al final de `apiSlice.ts` todos los hooks generados (`use<Nombre>Query`, `useLazy<Nombre>Query`, `use<Nombre>Mutation`).

## 4. Descargas Binarias (`Blob`: Excel, PDF y Plantillas)

El backend separa endpoints JSON (`/reports/...`) de descargas binarias (`/financialReports/.../excel`, `.../pdf` y `/bulkImports/template`). Para cualquier descarga de archivo:

1. Define el endpoint en `apiSlice.ts` devolviendo `Blob` con `responseHandler`:
   ```typescript
   getMyReportExcel: builder.query<Blob, MyReportParams>({
     query: ({ date, includeUnposted = false }) => ({
       url: `/financialReports/my-report/excel?date=${date}&includeUnposted=${includeUnposted}`,
       responseHandler: async (response) => await response.blob()
     })
   })
   ```
2. Exporta y consume el hook lazy (`useLazyGetMyReportExcelQuery`) dentro del custom hook del módulo (`use<Modulo>Actions.ts`).
3. Ejecuta con `.unwrap()`, crea el enlace temporal, dispara `.click()`, remueve el nodo y libera memoria con `window.URL.revokeObjectURL(url)`.
4. Despacha `showNotification` con `severity: 'success'` o `'error'`.

## 5. Subida de Archivos (`FormData`)

- Define la mutación con tipo de argumento `FormData` y **no** fijes manualmente la cabecera `Content-Type` (el navegador agrega el `boundary` de `multipart/form-data` automáticamente).
- Construye el payload con `formData.append('file', file)` alineado al nombre de parámetro esperado por el controlador backend.
- Tras `.unwrap()`, limpia el `input[type="file"]` (`fileInputRef.current.value = ''`), actualiza historial si aplica y muestra `showNotification`.

## 6. Verificación y Mantenimiento de Documentación

1. Ejecuta:
   ```bash
   pnpm format
   pnpm lint
   pnpm build
   ```
2. **Mantenimiento de documentación de agentes**: Si agregaste nuevos `tagTypes`, cambiaste el flujo de autenticación/refresh o incorporaste nuevos patrones de comunicación con la API, actualiza `AGENTS.md`, esta skill (`sbcclient-api-integration`) y su espejo en `docs/agent-guidelines-en/`.
