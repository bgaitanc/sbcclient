import type { SuccessResponse } from '../common/global'

export interface BulkImportHistory {
  id: string
  fileName: string
  status: string
  processedAt: string
  errorMessage?: string
  totalRecords: number
  successRecords: number
  errorRecords: number
}

export type BulkImportHistoryRes = SuccessResponse<BulkImportHistory[]>
