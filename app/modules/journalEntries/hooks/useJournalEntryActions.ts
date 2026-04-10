import {
  useCreateJournalEntryMutation,
  useUpdateJournalEntryMutation,
  useDeleteJournalEntryMutation
} from '@/redux/api/apiSlice'
import type {
  CreateJournalEntryReq,
  UpdateJournalEntryReq,
  JournalEntry,
  UpdateJournalEntryLineReq
} from '@shared/types/journalEntries/journalEntryTypes'
import { useFormik } from 'formik'
import { journalEntrySchema } from '../utils/journalEntry.schema'
import { useAppDispatch } from '@redux/hooks'
import { showNotification } from '@redux/slices/notificationSlice'

export interface JournalEntryFormValues {
  date: string
  description: string
  lines: UpdateJournalEntryLineReq[]
}

export const useJournalEntryActions = (
  initialData?: JournalEntry | null,
  onSuccess?: () => void
) => {
  const dispatch = useAppDispatch()
  const [createJournalEntry, { isLoading: isCreating }] =
    useCreateJournalEntryMutation()
  const [updateJournalEntry, { isLoading: isUpdating }] =
    useUpdateJournalEntryMutation()
  const [deleteJournalEntry, { isLoading: isDeleting }] =
    useDeleteJournalEntryMutation()

  const formik = useFormik<JournalEntryFormValues>({
    initialValues: {
      date:
        initialData?.date != null
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      description: initialData?.description ?? '',
      lines: initialData?.lines.map((l) => ({
        id: l.id,
        accountId: l.accountId,
        debit: l.debit,
        credit: l.credit
      })) ?? [
        { accountId: '', debit: 0, credit: 0 },
        { accountId: '', debit: 0, credit: 0 }
      ]
    },
    validationSchema: journalEntrySchema,
    onSubmit: async (values) => {
      try {
        if (initialData != null) {
          const updateData: UpdateJournalEntryReq = {
            id: initialData.id,
            date: values.date,
            description: values.description,
            lines: values.lines
          }
          await updateJournalEntry(updateData).unwrap()
          dispatch(
            showNotification({
              message: 'Asiento contable actualizado exitosamente',
              severity: 'success'
            })
          )
        } else {
          const createData: CreateJournalEntryReq = {
            date: values.date,
            description: values.description,
            lines: values.lines.map((l) => ({
              accountId: l.accountId,
              debit: l.debit,
              credit: l.credit
            }))
          }
          await createJournalEntry(createData).unwrap()
          dispatch(
            showNotification({
              message: 'Asiento contable creado exitosamente',
              severity: 'success'
            })
          )
        }
        onSuccess?.()
      } catch (error) {
        dispatch(
          showNotification({
            message: 'Error al guardar el asiento contable',
            severity: 'error'
          })
        )
      }
    }
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteJournalEntry(id).unwrap()
      dispatch(
        showNotification({
          message: 'Asiento contable eliminado exitosamente',
          severity: 'success'
        })
      )
      return { success: true }
    } catch (error) {
      dispatch(
        showNotification({
          message: 'Error al eliminar el asiento contable',
          severity: 'error'
        })
      )
      return { success: false, error }
    }
  }

  const validateBalance = (lines: Array<{ debit: number; credit: number }>) => {
    const totalDebit = lines.reduce(
      (sum, line) => sum + (line.debit !== 0 ? line.debit : 0),
      0
    )
    const totalCredit = lines.reduce(
      (sum, line) => sum + (line.credit !== 0 ? line.credit : 0),
      0
    )
    return Math.abs(totalDebit - totalCredit) < 0.01
  }

  return {
    formik,
    handleDelete,
    validateBalance,
    isLoading: isCreating || isUpdating || isDeleting
  }
}
