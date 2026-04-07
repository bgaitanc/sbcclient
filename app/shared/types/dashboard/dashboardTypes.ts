export interface RecentMovement {
  id: string
  code: string
  date: string
  description: string
  totalAmount: number
}

export interface TopAccount {
  accountId: string
  accountCode: string
  accountName: string
  movementCount: number
  totalAmount: number
}

export interface DashboardSummary {
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  totalRevenue: number
  totalCosts: number
  totalExpenses: number
  netIncome: number
  recentMovements: RecentMovement[]
  topAccounts: TopAccount[]
}
