import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  CircularProgress
} from '@mui/material'
import type { FormikProps } from 'formik'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import { usePasswordActions } from '../hooks/useUserActions'

interface ChangePasswordFormProps {
  userId: string
  userName: string
  onSuccess: () => void
  onCancel: () => void
}

interface PasswordFormValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const PasswordField = ({
  label,
  name,
  formik
}: {
  label: string
  name: keyof PasswordFormValues
  formik: FormikProps<PasswordFormValues>
}) => (
  <TextField
    fullWidth
    name={name}
    label={label}
    type="password"
    value={formik.values[name]}
    onChange={formik.handleChange}
    error={formik.touched[name] === true && Boolean(formik.errors[name])}
    helperText={
      formik.touched[name] === true && typeof formik.errors[name] === 'string'
        ? String(formik.errors[name])
        : undefined
    }
  />
)

export const ChangePasswordForm = ({
  userId,
  userName,
  onSuccess,
  onCancel
}: ChangePasswordFormProps) => {
  const { formik, isLoading } = usePasswordActions(userId, onSuccess)

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ p: 1 }}>
      <Typography variant="h5" gutterBottom>
        Cambiar Contraseña: {userName}
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <PasswordField
          label="Contraseña Actual"
          name="currentPassword"
          formik={formik}
        />
        <PasswordField
          label="Nueva Contraseña"
          name="newPassword"
          formik={formik}
        />
        <PasswordField
          label="Confirmar Nueva Contraseña"
          name="confirmPassword"
          formik={formik}
        />

        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ mt: 3 }}
        >
          <Button
            variant="outlined"
            color="secondary"
            onClick={onCancel}
            startIcon={<CancelIcon />}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="warning"
            type="submit"
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={20} /> : <SaveIcon />
            }
          >
            Actualizar Contraseña
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
