'use server'

import { revalidatePath } from 'next/cache'
import {
  upsertExpense,
  deleteExpense,
  upsertProject,
  deleteProject,
  upsertDebt,
  deleteDebt,
  addDebtPayment,
} from '@/lib/queries'

// ── Despesas ───────────────────────────────────────────────────────────────

export async function salvarDespesa(fd: FormData) {
  const id = fd.get('id') as string | null
  const entity_id = fd.get('entity_id') as string
  const category_id = (fd.get('category_id') as string) || null
  const description = fd.get('description') as string
  const amount = parseFloat(fd.get('amount') as string)
  const month = fd.get('month') as string
  const is_recurring = fd.get('is_recurring') === 'true'

  await upsertExpense({
    ...(id ? { id } : {}),
    entity_id,
    category_id,
    description,
    amount,
    month,
    is_recurring,
  })

  revalidatePath('/dashboard')
  revalidatePath(`/entidade/${fd.get('slug') as string}`)
}

export async function excluirDespesa(id: string, slug: string) {
  await deleteExpense(id)
  revalidatePath('/dashboard')
  revalidatePath(`/entidade/${slug}`)
}

// ── Projetos ───────────────────────────────────────────────────────────────

export async function criarProjeto(fd: FormData) {
  const id = fd.get('id') as string | null
  await upsertProject({
    ...(id ? { id } : {}),
    entity_id: (fd.get('entity_id') as string) || null,
    name: fd.get('name') as string,
    target_amount: parseFloat(fd.get('target_amount') as string),
    saved_amount: parseFloat((fd.get('saved_amount') as string) || '0'),
    deadline: (fd.get('deadline') as string) || null,
    notes: (fd.get('notes') as string) || null,
  })
  revalidatePath('/dashboard')
}

export async function excluirProjeto(id: string) {
  await deleteProject(id)
  revalidatePath('/dashboard')
}

// ── Dívidas ────────────────────────────────────────────────────────────────

export async function salvarDivida(fd: FormData) {
  const id = fd.get('id') as string | null
  const entity_id = fd.get('entity_id') as string

  await upsertDebt({
    ...(id ? { id } : {}),
    entity_id,
    creditor: fd.get('creditor') as string,
    total_amount: parseFloat(fd.get('total_amount') as string),
    paid_amount: parseFloat((fd.get('paid_amount') as string) || '0'),
    interest_rate: parseFloat((fd.get('interest_rate') as string) || '0'),
    due_date: (fd.get('due_date') as string) || null,
    priority: parseInt(fd.get('priority') as string) as 1 | 2 | 3,
    status: 'active',
    notes: (fd.get('notes') as string) || null,
  })

  revalidatePath('/entidade/irmao')
  revalidatePath('/dashboard')
}

export async function excluirDivida(id: string) {
  await deleteDebt(id)
  revalidatePath('/entidade/irmao')
  revalidatePath('/dashboard')
}

export async function registrarPagamentoDivida(fd: FormData) {
  const debt_id = fd.get('debt_id') as string
  const amount = parseFloat(fd.get('amount') as string)
  const paid_at = fd.get('paid_at') as string
  const notes = (fd.get('notes') as string) || undefined

  await addDebtPayment(debt_id, amount, paid_at, notes)

  revalidatePath('/entidade/irmao')
  revalidatePath('/dashboard')
}
