import {
  useCreateJournalEntryMutation,
  useUpdateJournalEntryMutation,
  useDeleteJournalEntryMutation
} from '@/redux/api/apiSlice'
import type {
  CreateJournalEntryReq,
  UpdateJournalEntryReq
} from '@shared/types/journalEntries/journalEntryTypes'

export const useJournalEntryActions = () => {
  const [createJournalEntry, { isLoading: isCreating }] =
    useCreateJournalEntryMutation()
  const [updateJournalEntry, { isLoading: isUpdating }] =
    useUpdateJournalEntryMutation()
  const [deleteJournalEntry, { isLoading: isDeleting }] =
    useDeleteJournalEntryMutation()

  const handleCreate = async (data: CreateJournalEntryReq) => {
    try {
      const result = await createJournalEntry(data).unwrap()
      return result
    } catch (error) {
      console.error('Failed to create journal entry:', error)
      throw error
    }
  }

  const handleUpdate = async (data: UpdateJournalEntryReq) => {
    try {
      const result = await updateJournalEntry(data).unwrap()
      return result
    } catch (error) {
      console.error('Failed to update journal entry:', error)
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteJournalEntry(id).unwrap()
      return result
    } catch (error) {
      console.error('Failed to delete journal entry:', error)
      throw error
    }
  }

  const validateBalance = (lines: { debit: number; credit: number }[]) => {
    const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
    const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
    // Usar una pequeña tolerancia para errores de punto flotante si es necesario,
    // pero para contabilidad lo ideal es que coincidan exactamente (o trabajar en centavos/enteros).
    return Math.abs(totalDebit - totalCredit) < 0.001
  }

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    validateBalance,
    isLoading: isCreating || isUpdating || isDeleting
  }
}
