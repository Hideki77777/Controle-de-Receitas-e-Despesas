'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, RefreshCw } from 'lucide-react'
import { FormDespesa } from './FormDespesa'
import { excluirDespesa } from '@/app/actions'
import { formatCurrency } from '@/lib/utils'
import type { Expense, Category } from '@/lib/types'

interface Props {
  expenses: Expense[]
  entityId: string
  entitySlug: string
  categories: Category[]
}

export function ListaDespesas({ expenses, entityId, entitySlug, categories }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await excluirDespesa(id, entitySlug)
      toast.success('Despesa removida')
    } catch {
      toast.error('Erro ao remover despesa')
    } finally {
      setDeletingId(null)
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-10 text-neutral-500 text-sm">
        Nenhuma despesa lançada neste mês.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {expenses.map((e) => (
        <div key={e.id} className="flex items-center justify-between gap-3 bg-neutral-800 rounded-lg px-4 py-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-white truncate">{e.description}</span>
              {e.is_recurring && (
                <RefreshCw className="w-3 h-3 text-neutral-500 shrink-0" />
              )}
              {e.category && (
                <Badge variant="secondary" className="text-xs bg-neutral-700 text-neutral-300 shrink-0">
                  {e.category.name}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold text-white">{formatCurrency(Number(e.amount))}</span>
            <FormDespesa
              entityId={entityId}
              entitySlug={entitySlug}
              categories={categories}
              expense={e}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-neutral-500 hover:text-red-400"
              disabled={deletingId === e.id}
              onClick={() => handleDelete(e.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
