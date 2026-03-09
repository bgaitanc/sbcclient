import * as Yup from 'yup'
import type { LoginValues } from '@shared/types/login/loginValues.ts'

export const loginSchema = Yup.object().shape<
  Record<keyof LoginValues, Yup.AnySchema>
>({
  username: Yup.string().required('El nombre del usuario es requerido'),
  password: Yup.string().required('La contraseña es requerida')
})
