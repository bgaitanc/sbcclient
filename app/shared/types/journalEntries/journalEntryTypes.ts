export interface JournalEntryLine {
  id: string
  accountId: string
  accountName?: string
  accountCode?: string
  debit: number
  credit: number
}

export interface JournalEntry {
  id: string
  code: string
  date: string
  description: string
  isPosted: boolean
  lines: JournalEntryLine[]
  totalDebit: number
  totalCredit: number
  createdAt: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}

export interface CreateJournalEntryLineReq {
  accountId: string
  debit: number
  credit: number
}

export interface CreateJournalEntryReq {
  date: string
  description: string
  lines: CreateJournalEntryLineReq[]
}

export interface UpdateJournalEntryLineReq {
  id?: string
  accountId: string
  debit: number
  credit: number
}

export interface UpdateJournalEntryReq {
  id: string
  date: string
  description: string
  lines: UpdateJournalEntryLineReq[]
}

export interface JournalEntryFilter {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  fromDate?: string
  toDate?: string
  isPosted?: boolean
}
