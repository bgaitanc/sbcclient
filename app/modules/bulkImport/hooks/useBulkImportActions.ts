import {
  useUploadBulkImportMutation,
  useGetBulkImportHistoryQuery
} from '@/redux/api/apiSlice'

export const useBulkImportActions = () => {
  const [uploadBulkImport, { isLoading: isUploading }] =
    useUploadBulkImportMutation()
  const {
    data: historyResponse,
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useGetBulkImportHistoryQuery()

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      await uploadBulkImport(formData).unwrap()
      await refetchHistory()
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }

  return {
    handleUpload,
    isUploading,
    history: historyResponse?.data ?? [],
    isLoadingHistory,
    refetchHistory
  }
}
