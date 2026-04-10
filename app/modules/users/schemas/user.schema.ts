import * as Yup from 'yup'

export const userSchema = Yup.object().shape({
  userName: Yup.string().required('El nombre de usuario es requerido'),
  email: Yup.string()
    .email('Ingrese un correo válido')
    .required('El correo es requerido'),
  firstName: Yup.string().required('El nombre es requerido'),
  lastName: Yup.string().required('El apellido es requerido'),
  roles: Yup.array()
    .of(Yup.string().required())
    .min(1, 'Debe asignar al menos un rol')
    .required('Los roles son requeridos')
})

export const createUserSchema = userSchema.shape({
  password: Yup.string()
    .required('La contraseña es requerida')
    .min(6, 'Mínimo 6 caracteres')
})

export const updateUserSchema = userSchema

export const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('La contraseña actual es requerida'),
  newPassword: Yup.string()
    .required('La nueva contraseña es requerida')
    .min(6, 'Mínimo 6 caracteres')
    .notOneOf(
      [Yup.ref('currentPassword')],
      'La nueva contraseña debe ser diferente a la actual'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Las contraseñas no coinciden')
    .required('Confirme la contraseña')
})
