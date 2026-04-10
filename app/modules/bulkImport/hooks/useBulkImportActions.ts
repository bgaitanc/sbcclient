import { useState } from 'react'
import {
  useUploadBulkImportMutation,
  useGetBulkImportHistoryQuery,
  useLazyGetBulkImportTemplateQuery
} from '@/redux/api/apiSlice'
import type { BulkImportFilter } from '@/shared/types/bulkImports/bulkImportTypes'
import { useAppDispatch } from '@redux/hooks'
import { showNotification } from '@redux/slices/notificationSlice'

export const useBulkImportActions = () => {
  const dispatch = useAppDispatch()
  const [filter, setFilter] = useState<BulkImportFilter>({
    pageNumber: 1,
    pageSize: 10
  })

  const [uploadBulkImport, { isLoading: isUploading }] =
    useUploadBulkImportMutation()
  const [triggerDownload, { isFetching: isDownloadingTemplate }] =
    useLazyGetBulkImportTemplateQuery()

  const {
    data: historyResponse,
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useGetBulkImportHistoryQuery(filter)

  const handleDownloadTemplate = async () => {
    try {
      const blob = await triggerDownload().unwrap()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'PlantillaAsientos.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
      dispatch(
        showNotification({
          message: 'Plantilla descargada exitosamente',
          severity: 'success'
        })
      )
      return { success: true }
    } catch (error) {
      dispatch(
        showNotification({
          message: 'Error al descargar la plantilla',
          severity: 'error'
        })
      )
      return { success: false, error }
    }
  }

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      await uploadBulkImport(formData).unwrap()
      await refetchHistory()
      dispatch(
        showNotification({
          message: 'Archivo importado exitosamente',
          severity: 'success'
        })
      )
      return { success: true }
    } catch (error) {
      dispatch(
        showNotification({
          message: 'Error al importar el archivo',
          severity: 'error'
        })
      )
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
    handleDownloadTemplate,
    isUploading,
    isDownloadingTemplate,
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
