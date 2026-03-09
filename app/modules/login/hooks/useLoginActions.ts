import { useLoginMutation } from '@redux/api/apiSlice.ts'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LoginReq, LoginValues } from '@shared/types/login/loginValues.ts'
import { type FormikProps, useFormik } from 'formik'
import { loginSchema } from '@modules/login/utils/login.schema.ts'
import { useAppDispatch } from '@redux/hooks.ts'
import { setCredentials } from '@redux/slices/authSlice.ts'

export const useLoginActions = () => {
  const [login, { data, isLoading, isSuccess, isError, error: loginError }] =
    useLoginMutation()

  const dispatch = useAppDispatch()

  const [error, setError] = useState('')

  const loginAction = useCallback(
    async (credentials: LoginReq) => {
      await login(credentials)
    },
    [login]
  )

  const initialValues = useMemo(
    () => ({
      username: '',
      password: ''
    }),
    []
  )

  const formik: FormikProps<LoginValues> = useFormik<LoginValues>({
    initialValues,
    validationSchema: loginSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await loginAction({
        username: values.username,
        password: values.password
      })
    }
  })

  useEffect(() => {
    if (isSuccess) {
      const { data: loginData } = data
      dispatch(setCredentials(loginData))
    }
  }, [data, dispatch, isSuccess])

  useEffect(() => {
    const setErrorMsg = (msg: string) => {
      setError(msg)
    }

    if (isError) {
      const {
        data: { message }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- TODO
      } = loginError as unknown as { data: { message: string } }

      setErrorMsg(message)
    }
  }, [isError, loginError])

  return {
    formik,
    isLoading,
    isError,
    error
  }
}
