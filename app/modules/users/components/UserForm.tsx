import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  MenuItem,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Chip
} from '@mui/material'
import type { FormikProps } from 'formik'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import type { UserDto } from '@shared/types/users/userTypes'
import { useUserActions } from '../hooks/useUserActions'

interface UserFormProps {
  initialData?: UserDto | null
  onSuccess: () => void
  onCancel: () => void
}

const ROLES = ['Admin', 'Accountant', 'Guest']

interface UserFormValues {
  userName: string
  email: string
  firstName: string
  lastName: string
  password?: string
  roles: string[]
}

const UserField = ({
  label,
  name,
  type = 'text',
  formik,
  disabled = false
}: {
  label: string
  name: keyof UserFormValues
  type?: string
  formik: FormikProps<UserFormValues>
  disabled?: boolean
}) => (
  <TextField
    fullWidth
    name={name}
    label={label}
    type={type}
    value={formik.values[name]}
    onChange={formik.handleChange}
    error={formik.touched[name] === true && Boolean(formik.errors[name])}
    helperText={
      formik.touched[name] === true && typeof formik.errors[name] === 'string'
        ? String(formik.errors[name])
        : undefined
    }
    disabled={disabled}
  />
)

export const UserForm = ({
  initialData,
  onSuccess,
  onCancel
}: UserFormProps) => {
  const { formik, isLoading, isEdit } = useUserActions(initialData, onSuccess)

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ p: 1 }}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <UserField
            label="Nombre de Usuario"
            name="userName"
            formik={formik}
            disabled={isEdit}
          />
          <UserField label="Correo Electrónico" name="email" formik={formik} />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <UserField label="Nombre" name="firstName" formik={formik} />
          <UserField label="Apellido" name="lastName" formik={formik} />
        </Stack>

        {!isEdit && (
          <UserField
            label="Contraseña"
            name="password"
            type="password"
            formik={formik}
          />
        )}

        <FormControl fullWidth>
          <InputLabel>Roles</InputLabel>
          <Select
            multiple
            name="roles"
            value={formik.values.roles}
            onChange={formik.handleChange}
            input={<OutlinedInput label="Roles" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {ROLES.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
            type="submit"
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={20} /> : <SaveIcon />
            }
          >
            {isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
