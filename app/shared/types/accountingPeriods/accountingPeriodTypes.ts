export interface AccountingPeriod {
  id: string
  year: number
  month: number
  isClosed: boolean
  closedAt?: string
  closedBy?: string
  closingJournalEntryId?: string
}

export interface CreateAccountingPeriodReq {
  year: number
  month: number
}

export interface ClosePeriodReq {
  year: number
  month: number
  equityAccountId: string
}
