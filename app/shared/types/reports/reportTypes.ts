export interface BalanceSheetLine {
  accountId: string
  accountCode: string
  accountName: string
  amount: number
}

export interface BalanceSheet {
  date: string
  assets: BalanceSheetLine[]
  totalAssets: number
  liabilities: BalanceSheetLine[]
  totalLiabilities: number
  equity: BalanceSheetLine[]
  totalEquity: number
  netIncome: number
  totalLiabilitiesAndEquity: number
}

export interface IncomeStatementLine {
  accountId: string
  accountCode: string
  accountName: string
  amount: number
}

export interface IncomeStatement {
  startDate: string
  endDate: string
  revenues: IncomeStatementLine[]
  totalRevenues: number
  costs: IncomeStatementLine[]
  totalCosts: number
  grossProfit: number
  expenses: IncomeStatementLine[]
  totalExpenses: number
  netIncome: number
}

export interface ReportParams {
  startDate?: string
  endDate?: string
  date?: string
}
