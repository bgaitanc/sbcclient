import { useFormik } from 'formik'
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserPasswordMutation
} from '@/redux/api/apiSlice'
import {
  createUserSchema,
  updateUserSchema,
  passwordSchema
} from '../schemas/user.schema'
import type { UserDto, UpdatePasswordDto } from '@shared/types/users/userTypes'
import { useAppDispatch } from '@redux/hooks'
import { showNotification } from '@redux/slices/notificationSlice'

interface UserFormValues {
  userName: string
  email: string
  firstName: string
  lastName: string
  password?: string
  roles: string[]
}

export const useUserActions = (
  initialData?: UserDto | null,
  onSuccess?: () => void
) => {
  const dispatch = useAppDispatch()
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation()
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()
  const isEdit = initialData !== null && initialData !== undefined

  const handleSubmit = async (values: UserFormValues) => {
    try {
      if (isEdit && initialData !== null && initialData !== undefined) {
        await updateUser({
          id: initialData.id,
          user: {
            userName: values.userName,
            email: values.email,
            firstName: values.firstName,
            lastName: values.lastName,
            roles: values.roles
          }
        }).unwrap()
        dispatch(
          showNotification({
            message: 'Usuario actualizado exitosamente',
            severity: 'success'
          })
        )
      } else if (isEdit === false) {
        await createUser({
          userName: values.userName,
          email: values.email,
          password: values.password ?? '',
          firstName: values.firstName,
          lastName: values.lastName,
          roles: values.roles
        }).unwrap()
        dispatch(
          showNotification({
            message: 'Usuario creado exitosamente',
            severity: 'success'
          })
        )
      }
      onSuccess?.()
    } catch {
      dispatch(
        showNotification({
          message: 'Error al procesar el usuario',
          severity: 'error'
        })
      )
    }
  }

  const formik = useFormik<UserFormValues>({
    initialValues: {
      userName: initialData?.userName ?? '',
      email: initialData?.email ?? '',
      firstName: initialData?.firstName ?? '',
      lastName: initialData?.lastName ?? '',
      password: '',
      roles: initialData?.roles ?? ['Guest']
    },
    validationSchema: isEdit ? updateUserSchema : createUserSchema,
    validateOnBlur: true,
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: handleSubmit
  })

  return {
    formik,
    isLoading: isCreating || isUpdating,
    isEdit
  }
}

export const usePasswordActions = (userId: string, onSuccess?: () => void) => {
  const dispatch = useAppDispatch()
  const [updatePassword, { isLoading }] = useUpdateUserPasswordMutation()

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      try {
        const passwordData: UpdatePasswordDto = {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        }
        await updatePassword({ id: userId, passwordData }).unwrap()
        dispatch(
          showNotification({
            message: 'Contraseña actualizada exitosamente',
            severity: 'success'
          })
        )
        onSuccess?.()
      } catch {
        dispatch(
          showNotification({
            message: 'Error al actualizar la contraseña',
            severity: 'error'
          })
        )
      }
    }
  })

  return {
    formik,
    isLoading
  }
}
