export interface Account {
  id: string
  code: string
  name: string
  type: number
  typeName: string
  parentAccountId: string | null
  parentAccountName: string | null
  createdAt: string
  createdBy: string | null
  updatedAt: string | null
  updatedBy: string | null
  children: Account[]
}

export interface CreateAccountReq {
  code: string
  name: string
  type: number
  parentAccountId: string | null
}

export interface UpdateAccountReq {
  id: string
  code: string
  name: string
  type: number
  parentAccountId: string | null
}
