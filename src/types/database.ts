export type CategoryType = 'income' | 'expense' | 'saving'
export type AccountType = 'cash' | 'bank' | 'credit_card' | 'savings'

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  balance: number
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: CategoryType
  color: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string
  account_id: string | null
  type: CategoryType
  amount: number
  description: string | null
  date: string
  created_at: string
}
