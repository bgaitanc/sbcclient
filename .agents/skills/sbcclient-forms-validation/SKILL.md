---
name: sbcclient-forms-validation
description: >-
  Guía para crear y mantener formularios, diálogos con formulario, esquemas Yup,
  hooks con useFormik, manejo de errores bajo eslint-config-love, validaciones
  contables en cliente y diálogos de confirmación en sbcclient. Úsala al crear o
  modificar componentes *Form.tsx, *Dialog.tsx, *.schema.ts o hooks
  use*Actions.ts.
---

# Formularios, Validaciones y Acciones en `sbcclient`

## 1. Separación de Responsabilidades

Estructura todo formulario nuevo en tres piezas claras dentro de `app/modules/<modulo>/`:

1. **Esquema de validación (`schemas/<recurso>.schema.ts`)**: Reglas Yup en español, tipadas y alineadas con los DTOs de `app/shared/types/`.
2. **Hook de acciones (`hooks/use<Recurso>Actions.ts`)**: Instancia de `useFormik<FormValues>`, mutaciones RTK Query, manejo `try/catch` con `.unwrap()` y despacho de `showNotification`.
3. **Componente presentacional (`components/<Recurso>Form.tsx` o `*Dialog.tsx`)**: Renderizado de campos MUI 7, botones de envío/cancelación y `<ConfirmDialog />` si incluye eliminación.

## 2. Esquemas Yup (`*.schema.ts`)

- Todos los mensajes de validación orientados al usuario deben escribirse en **español**.
- Cuando creación y edición difieren (por ejemplo, campo `password` requerido solo al crear), compone esquemas reutilizables (`baseSchema.shape({ ... })`, como en `app/modules/users/schemas/user.schema.ts`).
- Para validaciones complejas (como partida doble o campos dependientes), usa `.test('nombre-regla', 'Mensaje en español', (value) => ...)` verificando explícitamente `value == null` antes de operar.

## 3. Custom Hook con `useFormik` (`use<Recurso>Actions.ts`)

1. Tipa explícitamente `useFormik<MyFormValues>({ ... })` (evita inferencias implícitas débiles con `null`/`undefined`).
2. Usa `enableReinitialize: true` cuando el formulario reciba `initialData` para alternar entre creación y edición.
3. En `onSubmit`:
   ```typescript
   onSubmit: async (values) => {
     try {
       await saveItem(values).unwrap()
       dispatch(
         showNotification({
           message: 'Registro guardado exitosamente',
           severity: 'success'
         })
       )
       onSuccess?.()
     } catch {
       dispatch(
         showNotification({
           message: 'Error al guardar el registro',
           severity: 'error'
         })
       )
     }
   }
   ```
4. Expón desde el hook: `formik`, `isLoading` (combinando los flags de carga de las mutaciones) y handlers auxiliares (`handleDelete`, validadores de UI, listas derivadas memorizadas con `useMemo`).
5. Evita dejar `console.error` o `console.log` en producción; retroalimenta siempre al usuario con `showNotification`.

## 4. Cumplimiento Estricto de `eslint-config-love` en JSX

Los formularios son la fuente más común de errores de ESLint en este proyecto. Aplica siempre estos patrones:

- **Condicionales estrictas (`strict-boolean-expressions`)**:
  ```tsx
  <TextField
    fullWidth
    id="name"
    name="name"
    label="Nombre"
    value={formik.values.name}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    error={formik.touched.name === true && Boolean(formik.errors.name)}
    helperText={
      formik.touched.name === true && typeof formik.errors.name === 'string'
        ? formik.errors.name
        : undefined
    }
  />
  ```
- **Envío en diálogos o botones fuera de `<form>` (`no-misused-promises`)**:
  ```tsx
  <Button
    variant="contained"
    onClick={() => {
      void formik.submitForm()
    }}
    disabled={isLoading || !formik.isValid}
  >
    Guardar
  </Button>
  ```
- **Updates programáticos de Formik (`setFieldValue` / `setValues`)**: antepón siempre `void` cuando se invocan desde handlers síncronos o `useEffect`.
- **Inputs de fecha y numéricos en MUI 7**: usa `slotProps` (`slotProps={{ inputLabel: { shrink: true } }}` y `slotProps={{ htmlInput: { step: '0.01', min: '0' } }}`).

## 5. Reglas de Dominio Contable en Formularios

Cuando trabajes en formularios contables, preserva estas validaciones en cliente (que reflejan las reglas del backend `../SBC/`):

- **Asientos contables (`JournalEntryForm` / `journalEntry.schema.ts`)**:
  - Mínimo 2 líneas por asiento (deshabilitar eliminación de línea si `lines.length <= 2`).
  - Cada línea debe tener monto positivo en Debe o en Haber (`debit > 0 || credit > 0`), sin valores negativos; al ingresar `debit > 0` poner `credit = 0` y viceversa.
  - Partida doble obligatoria: `Math.abs(totalDebit - totalCredit) < 0.01`; mostrar visualmente totales y diferencia, y deshabilitar submit si no está balanceado.
  - Aplanar el árbol de cuentas (`accountsTree`) para poblar los selectores de cuenta con `"{code} - {name}"`.
- **Cierre de período (`ClosePeriodDialog`)**:
  - Filtrar únicamente cuentas de patrimonio (`account.type === 3`) del árbol de cuentas para la selección de `equityAccountId`.

## 6. Acciones Destructivas y Confirmaciones

- **NUNCA** uses `window.confirm`.
- Integra `<ConfirmDialog />` (`@/components/shared/ConfirmDialog`) con estado local `open`, título/mensaje claro en español, `color="error"` para eliminaciones y wrapper síncrono en `onConfirm`:
  ```tsx
  <ConfirmDialog
    open={isDeleteDialogOpen}
    title="Eliminar Registro"
    message="¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer."
    onConfirm={() => {
      void handleConfirmDelete()
    }}
    onCancel={() => {
      setIsDeleteDialogOpen(false)
    }}
    confirmText="Eliminar"
    color="error"
  />
  ```

## 7. Verificación y Mantenimiento de Documentación

1. Ejecuta:
   ```bash
   pnpm format
   pnpm lint
   pnpm build
   ```
2. **Mantenimiento de documentación de agentes**: Si introdujiste nuevos patrones de formularios, librerías de validación o reglas contables de cliente, actualiza `AGENTS.md`, esta skill (`sbcclient-forms-validation`) y su espejo en `docs/agent-guidelines-en/`.
