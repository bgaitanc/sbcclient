---
name: sbcclient-forms-validation
description: >-
  Guide for building and maintaining forms, form dialogs, Yup schemas,
  useFormik hooks, eslint-config-love error handling, client-side accounting
  validations, and confirmation dialogs in sbcclient. Use when creating or
  editing *Form.tsx, *Dialog.tsx, *.schema.ts, or use*Actions.ts hooks.
---

# Forms, Validations & Actions in `sbcclient`

## 1. Separation of Concerns

Structure every new form into three clear pieces under `app/modules/<module>/`:

1. **Validation schema (`schemas/<resource>.schema.ts`)**: Spanish Yup validation rules typed and aligned with `app/shared/types/` DTOs.
2. **Action hook (`hooks/use<Resource>Actions.ts`)**: `useFormik<FormValues>` instance, RTK Query mutations, `try/catch` with `.unwrap()`, and `showNotification` dispatches.
3. **Presentational component (`components/<Resource>Form.tsx` or `*Dialog.tsx`)**: MUI 7 inputs, submit/cancel buttons, and `<ConfirmDialog />` when deletion is supported.

## 2. Yup Schemas (`*.schema.ts`)

- All user-facing validation messages must be written in **Spanish**.
- When create and edit rules differ (for example, `password` required only on creation), compose reusable schemas (`baseSchema.shape({ ... })`, as in `app/modules/users/schemas/user.schema.ts`).
- For cross-field or array validations (such as double-entry balance), use `.test('rule-name', 'Spanish message', (value) => ...)` and explicitly check `value == null` before inspecting values.

## 3. Custom Hook with `useFormik` (`use<Resource>Actions.ts`)

1. Explicitly type `useFormik<MyFormValues>({ ... })` to avoid weak inference around `null`/`undefined`.
2. Enable `enableReinitialize: true` whenever the form accepts `initialData` to switch between create and edit modes.
3. Standard `onSubmit` flow:
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
4. Return `formik`, a combined `isLoading` flag across mutations, and any helper handlers (`handleDelete`, UI validators, memoized lists via `useMemo`).
5. Avoid leaving `console.error` or `console.log` in production code; always communicate outcomes to the user through `showNotification`.

## 4. Strict `eslint-config-love` Compliance in JSX

Forms are the most frequent source of lint violations in this repository. Always follow these patterns:

- **Strict conditionals (`strict-boolean-expressions`)**:
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
- **Submitting from dialogs or buttons outside `<form>` (`no-misused-promises`)**:
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
- **Programmatic Formik updates (`setFieldValue` / `setValues`)**: always prefix with `void` inside synchronous handlers or `useEffect`.
- **Date and numeric inputs in MUI 7**: use `slotProps` (`slotProps={{ inputLabel: { shrink: true } }}` and `slotProps={{ htmlInput: { step: '0.01', min: '0' } }}`).

## 5. Client-Side Accounting Domain Rules

When modifying accounting forms, preserve these client-side checks (mirroring `../SBC/`):

- **Journal entries (`JournalEntryForm` / `journalEntry.schema.ts`)**:
  - At least 2 lines per entry (disable row removal when `lines.length <= 2`).
  - Each line must carry a positive Debit or Credit (`debit > 0 || credit > 0`), with no negative values; entering `debit > 0` resets `credit = 0` and vice versa.
  - Mandatory double-entry balance: `Math.abs(totalDebit - totalCredit) < 0.01`; display totals and imbalance difference, and disable submit when unbalanced.
  - Flatten the hierarchical `accountsTree` to populate account selectors formatted as `"{code} - {name}"`.
- **Period closing (`ClosePeriodDialog`)**:
  - Filter only equity accounts (`account.type === 3`) from the account tree for the `equityAccountId` selector.

## 6. Destructive Actions & Confirmations

- **NEVER** use `window.confirm`.
- Integrate `<ConfirmDialog />` (`@/components/shared/ConfirmDialog`) with local `open` state, clear Spanish title/message, `color="error"` for deletions, and a synchronous `void` wrapper in `onConfirm`:
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

## 7. Verification & Documentation Maintenance

1. Run:
   ```bash
   pnpm format
   pnpm lint
   pnpm build
   ```
2. **Agent documentation maintenance**: If you introduced new form patterns, validation libraries, or client-side accounting rules, update `AGENTS.md`, this skill (`sbcclient-forms-validation`), and its English mirror in `docs/agent-guidelines-en/`.
