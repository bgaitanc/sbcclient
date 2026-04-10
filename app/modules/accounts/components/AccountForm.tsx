import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Stack,
  CircularProgress
} from '@mui/material'
import type { Account } from '@shared/types/accounts/accountTypes'
import { useAccountActions } from '../hooks/useAccountActions'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

interface AccountFormProps {
  selectedAccount: Account | null
  isAddingChild: boolean
  onSuccess: () => void
  onCancel: () => void
}

const accountTypes = [
  { value: 1, label: 'Activo' },
  { value: 2, label: 'Pasivo' },
  { value: 3, label: 'Patrimonio' },
  { value: 4, label: 'Ingresos' },
  { value: 5, label: 'Gastos' },
  { value: 6, label: 'Costos' }
]

export const AccountForm = ({
  selectedAccount,
  isAddingChild,
  onSuccess,
  onCancel
}: AccountFormProps) => {
  const { formik, handleDelete, isLoading } = useAccountActions(
    selectedAccount,
    isAddingChild,
    onSuccess
  )

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const title = isAddingChild
    ? `Agregar Cuenta Hija a: ${selectedAccount?.name}`
    : selectedAccount != null
      ? 'Editar Cuenta'
      : 'Nueva Cuenta Raíz'

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Stack spacing={3} mt={2}>
        <TextField
          fullWidth
          id="code"
          name="code"
          label="Código"
          value={formik.values.code}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.code === true && Boolean(formik.errors.code)}
          helperText={
            formik.touched.code === true ? formik.errors.code : undefined
          }
        />

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
            formik.touched.name === true ? formik.errors.name : undefined
          }
        />

        <TextField
          fullWidth
          id="type"
          name="type"
          select
          label="Tipo"
          value={formik.values.type}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.type === true && Boolean(formik.errors.type)}
          helperText={
            formik.touched.type === true ? formik.errors.type : undefined
          }
        >
          {accountTypes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Stack direction="row" spacing={1}>
            <Button
              color="primary"
              variant="contained"
              type="submit"
              disabled={isLoading || !formik.isValid}
              startIcon={
                isLoading ? <CircularProgress size={20} /> : <SaveIcon />
              }
            >
              Guardar
            </Button>
            <Button color="inherit" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          </Stack>

          {selectedAccount != null && !isAddingChild && (
            <Button
              color="error"
              variant="outlined"
              onClick={() => {
                setIsDeleteDialogOpen(true)
              }}
              disabled={isLoading}
              startIcon={<DeleteIcon />}
            >
              Eliminar
            </Button>
          )}
        </Box>
      </Stack>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Eliminar Cuenta"
        message={`¿Está seguro de que desea eliminar la cuenta "${selectedAccount?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={() => {
          void handleDelete()
          setIsDeleteDialogOpen(false)
        }}
        onCancel={() => {
          setIsDeleteDialogOpen(false)
        }}
        confirmText="Eliminar"
        color="error"
      />
    </Box>
  )
}
