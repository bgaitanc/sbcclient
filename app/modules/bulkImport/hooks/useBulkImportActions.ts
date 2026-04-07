import { useState } from 'react'
import {
  useUploadBulkImportMutation,
  useGetBulkImportHistoryQuery
} from '@/redux/api/apiSlice'
import type { BulkImportFilter } from '@/shared/types/bulkImports/bulkImportTypes'

export const useBulkImportActions = () => {
  const [filter, setFilter] = useState<BulkImportFilter>({
    pageNumber: 1,
    pageSize: 10
  })

  const [uploadBulkImport, { isLoading: isUploading }] =
    useUploadBulkImportMutation()
  const {
    data: historyResponse,
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useGetBulkImportHistoryQuery(filter)

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

  const handlePageChange = (newPage: number) => {
    setFilter((prev) => ({ ...prev, pageNumber: newPage }))
  }

  const handlePageSizeChange = (newSize: number) => {
    setFilter((prev) => ({ ...prev, pageSize: newSize, pageNumber: 1 }))
  }

  return {
    handleUpload,
    isUploading,
    history: historyResponse?.data.items ?? [],
    totalCount: historyResponse?.data.totalCount ?? 0,
    pageNumber: filter.pageNumber ?? 1,
    pageSize: filter.pageSize ?? 10,
    isLoadingHistory,
    refetchHistory,
    handlePageChange,
    handlePageSizeChange,
    filter,
    setFilter
  }
}
