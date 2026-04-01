import {
  useCreateJournalEntryMutation,
  useUpdateJournalEntryMutation,
  useDeleteJournalEntryMutation
} from '@/redux/api/apiSlice'
import type {
  CreateJournalEntryReq,
  UpdateJournalEntryReq,
  JournalEntry
} from '@shared/types/journalEntries/journalEntryTypes'
import { useFormik } from 'formik'
import { journalEntrySchema } from '../utils/journalEntry.schema'

export const useJournalEntryActions = (
  initialData?: JournalEntry | null,
  onSuccess?: () => void
) => {
  const [createJournalEntry, { isLoading: isCreating }] =
    useCreateJournalEntryMutation()
  const [updateJournalEntry, { isLoading: isUpdating }] =
    useUpdateJournalEntryMutation()
  const [deleteJournalEntry, { isLoading: isDeleting }] =
    useDeleteJournalEntryMutation()

  const formik = useFormik<CreateJournalEntryReq>({
    initialValues: {
      date:
        initialData?.date != null
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      description: initialData?.description ?? '',
      lines: initialData?.lines.map((l) => ({
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
            ...values,
            id: initialData.id,
            lines: values.lines.map((l, index) => ({
              ...l,
              id: initialData.lines[index]?.id
            }))
          }
          await updateJournalEntry(updateData).unwrap()
        } else {
          await createJournalEntry(values).unwrap()
        }
        onSuccess?.()
      } catch (error) {
        // Error handling is handled by the mutation result/error state if needed
      }
    }
  })

  const handleDelete = async (id: string) => {
    const result = await deleteJournalEntry(id).unwrap()
    return result
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
