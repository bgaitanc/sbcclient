import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import LockIcon from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useState } from 'react'
import { useLoginActions } from '@modules/login/hooks/useLoginActions.ts'

function Login() {
  const { formik, error } = useLoginActions()
  const [showPassword, setShowPassword] = useState(false)

  const username = formik.getFieldMeta<string>('username')
  const password = formik.getFieldMeta<string>('password')

  return (
    <Box className="flex items-center justify-center h-screen bg-background">
      <Box className="bg-surface-variant p-6 rounded-xl shadow-lg w-96 text-on-surface-variant border border-outline-variant">
        <Typography className="text-2xl font-bold mb-6 text-center text-primary">
          Iniciar Sesión
        </Typography>

        {!(error === '') && (
          <Typography
            color="error"
            className="text-sm mb-4 text-center font-medium"
          >
            {error}
          </Typography>
        )}

        <Box className="flex flex-col mb-4">
          <TextField
            label="Usuario"
            className="w-full"
            name="username"
            value={username.value}
            onBlur={formik.handleBlur}
            error={username.touched && Boolean(username.error)}
            onChange={formik.handleChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                )
              }
            }}
          />
          {username.touched && Boolean(username.error) && (
            <Typography color="error" className="text-xs pl-1 mt-1">
              {username.error}
            </Typography>
          )}
        </Box>

        <Box className="flex flex-col mb-6">
          <TextField
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            className="w-full"
            name="password"
            onBlur={formik.handleBlur}
            value={password.value}
            error={password.touched && Boolean(password.error)}
            onChange={formik.handleChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => {
                        setShowPassword(!showPassword)
                      }}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
          {password.touched && Boolean(password.error) && (
            <Typography color="error" className="text-xs pl-1 mt-1">
              {formik.errors.password}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          fullWidth
          size="large"
          className="rounded-lg py-3 font-bold"
          disabled={!formik.isValid || formik.isSubmitting}
          onClick={() => {
            formik.handleSubmit()
          }}
        >
          Entrar
        </Button>
      </Box>
    </Box>
  )
}

export default Login
