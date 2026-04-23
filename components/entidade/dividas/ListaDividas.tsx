'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { FormDivida } from './FormDivida'
import { FormPagamento } from './FormPagamento'
import { excluirDivida } from '@/app/actions'
import { formatCurrency, priorityLabel, priorityColor } from '@/lib/utils'
import type { Debt } from '@/lib/types'

interface Props {
  debts: Debt[]
  entityId: string
}

export function ListaDividas({ debts, entityId }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await excluirDivida(id)
      toast.success('Dívida removida')
    } catch {
      toast.error('Erro ao remover dívida')
    } finally {
      setDeletingId(null)
    }
  }

  if (debts.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 text-sm bg-neutral-800 rounded-xl">
        Nenhuma dívida cadastrada.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {debts.map((d) => {
        const remaining = Number(d.total_amount) - Number(d.paid_amount)
        const pct = Math.min(100, Math.round((Number(d.paid_amount) / Number(d.total_amount)) * 100))
        const isPaid = d.status === 'paid'

        return (
          <div
            key={d.id}
            className={`bg-neutral-800 rounded-xl p-4 ${isPaid ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">{d.creditor}</span>
                  {isPaid && <Badge className="bg-green-800 text-green-200 text-xs">Quitada</Badge>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(d.priority)}`}>
                    {priorityLabel(d.priority)}
                  </span>
                  {d.interest_rate > 0 && (
                    <span className="text-xs text-neutral-400">{d.interest_rate}% a.m.</span>
                  )}
                </div>
                {d.due_date && (
                  <span className="text-xs text-neutral-500">
                    Venc.: {new Date(d.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!isPaid && <FormPagamento debtId={d.id} creditor={d.creditor} remaining={remaining} />}
                <FormDivida entityId={entityId} debt={d} />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-neutral-500 hover:text-red-400"
                  disabled={deletingId === d.id}
                  onClick={() => handleDelete(d.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>{formatCurrency(Number(d.paid_amount))} pago</span>
              <span className="font-medium text-white">
                {formatCurrency(remaining)} restante
              </span>
            </div>
            <Progress value={pct} className="h-2 bg-neutral-700" />
            <div className="text-right text-xs text-neutral-500 mt-1">
              Total: {formatCurrency(Number(d.total_amount))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
