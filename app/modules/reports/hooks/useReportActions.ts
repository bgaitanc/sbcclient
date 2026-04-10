import {
  useLazyGetBalanceSheetExcelQuery,
  useLazyGetBalanceSheetPdfQuery,
  useLazyGetIncomeStatementExcelQuery,
  useLazyGetIncomeStatementPdfQuery
} from '@/redux/api/apiSlice'
import { useAppDispatch } from '@redux/hooks'
import { showNotification } from '@redux/slices/notificationSlice'

export const useReportActions = () => {
  const dispatch = useAppDispatch()
  const [triggerBalanceSheetExcel, { isFetching: isDownloadingBSExcel }] =
    useLazyGetBalanceSheetExcelQuery()
  const [triggerBalanceSheetPdf, { isFetching: isDownloadingBSPdf }] =
    useLazyGetBalanceSheetPdfQuery()
  const [triggerIncomeStatementExcel, { isFetching: isDownloadingISExcel }] =
    useLazyGetIncomeStatementExcelQuery()
  const [triggerIncomeStatementPdf, { isFetching: isDownloadingISPdf }] =
    useLazyGetIncomeStatementPdfQuery()

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleDownloadBalanceSheetExcel = async (
    date: string,
    includeUnposted: boolean
  ) => {
    try {
      const blob = await triggerBalanceSheetExcel({
        date,
        includeUnposted
      }).unwrap()
      downloadFile(blob, `BalanceGeneral_${date.replace(/-/g, '')}.xlsx`)
      dispatch(
        showNotification({
          message: 'Reporte Excel generado exitosamente',
          severity: 'success'
        })
      )
      return { success: true }
    } catch (error) {
      dispatch(
        showNotification({
          message: 'Error al generar el reporte Excel',
          severity: 'error'
        })
      )
      return { success: false, error }
    }
  }

  const handleDownloadBalanceSheetPdf = async (
    date: string,
    includeUnposted: boolean
  ) => {
    try {
      const blob = await triggerBalanceSheetPdf({
        date,
        includeUnposted
      }).unwrap()
      downloadFile(blob, `BalanceGeneral_${date.replace(/-/g, '')}.pdf`)
      dispatch(
        showNotification({
          message: 'Reporte PDF generado exitosamente',
          severity: 'success'
        })
      )
      return { success: true }
    } catch (error) {
      dispatch(
        showNotification({
          message: 'Error al generar el reporte PDF',
          severity: 'error'
        })
      )
      return { success: false, error }
    }
  }

  const handleDownloadIncomeStatementExcel = async (
    startDate: string,
    endDate: string,
    includeUnposted: boolean
  ) => {
    try {
      const blob = await triggerIncomeStatementExcel({
        startDate,
        endDate,
        includeUnposted
      }).unwrap()
      downloadFile(
        blob,
        `EstadoDeResultados_${startDate.replace(/-/g, '')}_${endDate.replace(/-/g, '')}.xlsx`
      )
      dispatch(
        showNotification({
          message: 'Reporte Excel generado exitosamente',
          severity: 'success'
        })
      )
      return { success: true }
    } catch (error) {
      dispatch(
        showNotification({
          message: 'Error al generar el reporte Excel',
          severity: 'error'
        })
      )
      return { success: false, error }
    }
  }

  const handleDownloadIncomeStatementPdf = async (
    startDate: string,
    endDate: string,
    includeUnposted: boolean
  ) => {
    try {
      const blob = await triggerIncomeStatementPdf({
        startDate,
        endDate,
        includeUnposted
      }).unwrap()
      downloadFile(
        blob,
        `EstadoDeResultados_${startDate.replace(/-/g, '')}_${endDate.replace(/-/g, '')}.pdf`
      )
      dispatch(
        showNotification({
          message: 'Reporte PDF generado exitosamente',
          severity: 'success'
        })
      )
      return { success: true }
    } catch (error) {
      dispatch(
        showNotification({
          message: 'Error al generar el reporte PDF',
          severity: 'error'
        })
      )
      return { success: false, error }
    }
  }

  return {
    handleDownloadBalanceSheetExcel,
    handleDownloadBalanceSheetPdf,
    handleDownloadIncomeStatementExcel,
    handleDownloadIncomeStatementPdf,
    isDownloading:
      isDownloadingBSExcel ||
      isDownloadingBSPdf ||
      isDownloadingISExcel ||
      isDownloadingISPdf
  }
}
