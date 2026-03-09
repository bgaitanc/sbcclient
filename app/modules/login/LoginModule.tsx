import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import LockIcon from '@mui/icons-material/Lock'
import { useLoginActions } from '@modules/login/hooks/useLoginActions.ts'

function Login() {
  const { formik, error } = useLoginActions()

  const username = formik.getFieldMeta<string>('username')
  const password = formik.getFieldMeta<string>('password')

  return (
    <Box className="flex items-center justify-center h-screen bg-slate-200">
      <Box className="bg-slate-800 p-6 rounded shadow-md w-80 text-slate-300">
        <Typography className="text-xl font-bold mb-4 text-center">
          Iniciar Sesión
        </Typography>

        {!(error === '') && (
          <Typography className="text-red-500 text-sm mb-2">{error}</Typography>
        )}

        <Box className="flex flex-col mb-3">
          <TextField
            label="Usuario"
            className="w-full"
            name="username"
            value={username.value}
            onBlur={formik.handleBlur}
            error={username.touched && Boolean(username.error)}
            onChange={formik.handleChange}
            slotProps={{
              inputLabel: {
                className: 'text-slate-300'
              },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon className="text-slate-300" />
                  </InputAdornment>
                ),
                className:
                  '[&_.MuiOutlinedInput-notchedOutline]:border-slate-300 text-slate-300' // hover:[&_.MuiOutlinedInput-notchedOutline]:border-slate-700 [&.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-slate-700
              }
            }}
          />
          {username.touched && Boolean(username.error) && (
            <Typography className="text-red-500 text-sm pl-1">
              {username.error}
            </Typography>
          )}
        </Box>

        <Box className="flex flex-col mb-3">
          <TextField
            label="Contraseña"
            type="password"
            className="w-full text-slate-300"
            name="password"
            onBlur={formik.handleBlur}
            value={password.value}
            error={password.touched && Boolean(password.error)}
            onChange={formik.handleChange}
            slotProps={{
              inputLabel: {
                className: 'text-slate-300'
              },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon className="text-slate-300" />
                  </InputAdornment>
                ),
                className:
                  '[&_.MuiOutlinedInput-notchedOutline]:border-slate-300 text-slate-300' // hover:[&_.MuiOutlinedInput-notchedOutline]:border-slate-700 [&.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-slate-700
              }
            }}
          />
          {password.touched && Boolean(password.error) && (
            <Typography className="text-red-500 text-sm">
              {formik.errors.password}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          className="w-full bg-slate-300 hover:bg-slate-100 text-slate-800 p-2 rounded"
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
