import type { SuccessResponse, PagedResult } from '../common/global'

export interface BulkImportHistory {
  id: string
  fileName: string
  successCount: number
  errorCount: number
  totalCount: number
  createdAt: string
  createdBy?: string
}

export interface BulkImportFilter {
  fileName?: string
  fromDate?: string
  toDate?: string
  pageNumber?: number
  pageSize?: number
}

export type BulkImportHistoryRes = SuccessResponse<
  PagedResult<BulkImportHistory>
>
