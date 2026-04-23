export type EntityType = 'person' | 'workshop'

export interface Entity {
  id: string
  name: string
  slug: string
  color: string
  type: EntityType
  created_at: string
}

export interface Category {
  id: string
  name: string
  entity_id: string | null
  type: 'income' | 'expense'
  created_at: string
}

export interface Expense {
  id: string
  entity_id: string
  category_id: string | null
  description: string
  amount: number
  month: string // ISO date string, primeiro dia do mês
  is_recurring: boolean
  created_at: string
  category?: Category
  entity?: Entity
}

export interface Project {
  id: string
  entity_id: string | null
  name: string
  target_amount: number
  saved_amount: number
  deadline: string | null
  notes: string | null
  created_at: string
  entity?: Entity
}

export type DebtPriority = 1 | 2 | 3
export type DebtStatus = 'active' | 'paid'

export interface Debt {
  id: string
  entity_id: string
  creditor: string
  total_amount: number
  paid_amount: number
  interest_rate: number
  due_date: string | null
  priority: DebtPriority
  status: DebtStatus
  notes: string | null
  created_at: string
  entity?: Entity
  debt_payments?: DebtPayment[]
}

export interface DebtPayment {
  id: string
  debt_id: string
  amount: number
  paid_at: string
  notes: string | null
  created_at: string
}

export interface EntitySummary {
  entity: Entity
  total_expenses: number
  expense_count: number
}

export interface DebtsSummary {
  total_debt: number
  remaining_debt: number
  paid_debt: number
  active_count: number
}
