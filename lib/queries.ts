import { createClient } from '@/lib/supabase/server'
import type {
  Entity,
  Category,
  Expense,
  Project,
  Debt,
  DebtPayment,
  EntitySummary,
  DebtsSummary,
} from '@/lib/types'

// ── Entidades ──────────────────────────────────────────────────────────────

export async function getEntities(): Promise<Entity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function getEntityBySlug(slug: string): Promise<Entity | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

// ── Categorias ─────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

// ── Despesas ───────────────────────────────────────────────────────────────

export async function getExpensesByEntity(
  entityId: string,
  month: string
): Promise<Expense[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('*, category:categories(*)')
    .eq('entity_id', entityId)
    .eq('month', month)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getAllExpensesSummary(month: string): Promise<EntitySummary[]> {
  const supabase = await createClient()

  const { data: entities, error: entitiesError } = await supabase
    .from('entities')
    .select('*')
    .order('name')
  if (entitiesError) throw entitiesError

  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('entity_id, amount')
    .eq('month', month)
  if (expensesError) throw expensesError

  return entities.map((entity) => {
    const entityExpenses = expenses.filter((e) => e.entity_id === entity.id)
    const total = entityExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    return {
      entity,
      total_expenses: total,
      expense_count: entityExpenses.length,
    }
  })
}

export async function upsertExpense(
  data: Omit<Expense, 'id' | 'created_at' | 'category' | 'entity'> & { id?: string }
): Promise<Expense> {
  const supabase = await createClient()
  const { data: result, error } = await supabase
    .from('expenses')
    .upsert(data)
    .select('*, category:categories(*)')
    .single()
  if (error) throw error
  return result
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

// ── Projetos ───────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, entity:entities(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function upsertProject(
  data: Omit<Project, 'id' | 'created_at' | 'entity'> & { id?: string }
): Promise<Project> {
  const supabase = await createClient()
  const { data: result, error } = await supabase
    .from('projects')
    .upsert(data)
    .select('*, entity:entities(*)')
    .single()
  if (error) throw error
  return result
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

// ── Dívidas ────────────────────────────────────────────────────────────────

export async function getDebtsByEntity(entityId: string): Promise<Debt[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('debts')
    .select('*, debt_payments(*)')
    .eq('entity_id', entityId)
    .order('priority', { ascending: true })
    .order('interest_rate', { ascending: false })
  if (error) throw error
  return data
}

export async function getDebtsSummary(entityId: string): Promise<DebtsSummary> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('debts')
    .select('total_amount, paid_amount, status')
    .eq('entity_id', entityId)
  if (error) throw error

  const active = data.filter((d) => d.status === 'active')
  const total_debt = active.reduce((s, d) => s + Number(d.total_amount), 0)
  const paid_debt = active.reduce((s, d) => s + Number(d.paid_amount), 0)

  return {
    total_debt,
    remaining_debt: total_debt - paid_debt,
    paid_debt,
    active_count: active.length,
  }
}

export async function upsertDebt(
  data: Omit<Debt, 'id' | 'created_at' | 'entity' | 'debt_payments'> & { id?: string }
): Promise<Debt> {
  const supabase = await createClient()
  const { data: result, error } = await supabase
    .from('debts')
    .upsert(data)
    .select('*, debt_payments(*)')
    .single()
  if (error) throw error
  return result
}

export async function deleteDebt(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('debts').delete().eq('id', id)
  if (error) throw error
}

export async function addDebtPayment(
  debtId: string,
  amount: number,
  paidAt: string,
  notes?: string
): Promise<void> {
  const supabase = await createClient()

  // Registra o pagamento
  const { error: paymentError } = await supabase.from('debt_payments').insert({
    debt_id: debtId,
    amount,
    paid_at: paidAt,
    notes: notes ?? null,
  })
  if (paymentError) throw paymentError

  // Atualiza paid_amount na dívida
  const { data: debt, error: fetchError } = await supabase
    .from('debts')
    .select('paid_amount, total_amount')
    .eq('id', debtId)
    .single()
  if (fetchError) throw fetchError

  const newPaid = Number(debt.paid_amount) + amount
  const status = newPaid >= Number(debt.total_amount) ? 'paid' : 'active'

  const { error: updateError } = await supabase
    .from('debts')
    .update({ paid_amount: newPaid, status })
    .eq('id', debtId)
  if (updateError) throw updateError
}
