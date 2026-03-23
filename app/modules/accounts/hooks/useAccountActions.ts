import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation
} from '@redux/api/apiSlice'
import type { Account } from '@shared/types/accounts/accountTypes'
import { useMemo } from 'react'

export const useAccountActions = (
  selectedAccount: Account | null,
  isAddingChild: boolean,
  onSuccess: () => void
) => {
  const [createAccount, { isLoading: isCreating }] = useCreateAccountMutation()
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation()
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation()

  const initialValues = useMemo(() => {
    if (isAddingChild) {
      return {
        code: '',
        name: '',
        type: selectedAccount?.type ?? 1,
        parentAccountId: selectedAccount?.id ?? null
      }
    }
    if (selectedAccount != null) {
      return {
        code: selectedAccount.code,
        name: selectedAccount.name,
        type: selectedAccount.type,
        parentAccountId: selectedAccount.parentAccountId
      }
    }
    return {
      code: '',
      name: '',
      type: 1,
      parentAccountId: null
    }
  }, [selectedAccount, isAddingChild])

  const validationSchema = Yup.object({
    code: Yup.string().required('El código es requerido'),
    name: Yup.string().required('El nombre es requerido'),
    type: Yup.number().required('El tipo es requerido'),
    parentAccountId: Yup.string().nullable()
  })

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (selectedAccount != null && !isAddingChild) {
          await updateAccount({
            id: selectedAccount.id,
            ...values
          }).unwrap()
        } else {
          await createAccount(values).unwrap()
        }
        onSuccess()
      } catch (err) {
        // eslint-disable-next-line no-console -- Logging de error de API
        console.error('Error saving account:', err)
      }
    }
  })

  const handleDelete = async () => {
    if (selectedAccount != null) {
      try {
        await deleteAccount(selectedAccount.id).unwrap()
        onSuccess()
      } catch (err) {
        // eslint-disable-next-line no-console -- Logging de error de API
        console.error('Error deleting account:', err)
      }
    }
  }

  return {
    formik,
    handleDelete,
    isLoading: isCreating || isUpdating || isDeleting
  }
}
