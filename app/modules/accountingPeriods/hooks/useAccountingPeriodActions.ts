import {
  useCreateAccountingPeriodMutation,
  useCloseAccountingPeriodMutation,
  useGetAccountsTreeQuery
} from '../../../redux/api/apiSlice'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import type { Account } from '@shared/types/accounts/accountTypes'
import { useMemo } from 'react'

export const useAccountingPeriodActions = (onSuccess?: () => void) => {
  const [createPeriod, { isLoading: isCreating }] =
    useCreateAccountingPeriodMutation()
  const [closePeriod, { isLoading: isClosing }] =
    useCloseAccountingPeriodMutation()
  const { data: accountsData } = useGetAccountsTreeQuery()

  const createFormik = useFormik({
    initialValues: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    },
    validationSchema: Yup.object({
      year: Yup.number().required('Requerido').min(2000),
      month: Yup.number().required('Requerido').min(1).max(12)
    }),
    onSubmit: async (values) => {
      try {
        await createPeriod(values).unwrap()
        onSuccess?.()
      } catch (error) {
        console.error('Error creating period:', error)
      }
    }
  })

  const closeFormik = useFormik({
    initialValues: {
      year: 0,
      month: 0,
      equityAccountId: ''
    },
    validationSchema: Yup.object({
      year: Yup.number().required('Requerido'),
      month: Yup.number().required('Requerido'),
      equityAccountId: Yup.string().required('Debe seleccionar una cuenta de patrimonio')
    }),
    onSubmit: async (values) => {
      try {
        await closePeriod(values).unwrap()
        onSuccess?.()
      } catch (error) {
        console.error('Error closing period:', error)
      }
    }
  })

  // Obtener cuentas de patrimonio (tipo 3) para el cierre
  const equityAccounts = useMemo(() => {
    if (accountsData == null || !accountsData.success) return []

    const flatten = (accounts: Account[]): Account[] => {
      return accounts.reduce<Account[]>((acc, account) => {
        if (account.type === 3) {
          acc.push(account)
        }
        if (account.children != null && account.children.length > 0) {
          acc.push(...flatten(account.children))
        }
        return acc
      }, [])
    }

    return flatten(accountsData.data)
  }, [accountsData])

  return {
    createFormik,
    closeFormik,
    isLoading: isCreating || isClosing,
    equityAccounts
  }
}
