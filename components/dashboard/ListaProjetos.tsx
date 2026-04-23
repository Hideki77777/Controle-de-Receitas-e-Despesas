'use client'

import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Target } from 'lucide-react'

interface Props {
  projects: Project[]
}

export function ListaProjetos({ projects }: Props) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 text-sm">
        Nenhum projeto cadastrado ainda.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {projects.map((p) => {
        const pct = Math.min(100, Math.round((p.saved_amount / p.target_amount) * 100))
        const remaining = p.target_amount - p.saved_amount
        return (
          <div key={p.id} className="bg-neutral-800 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-medium text-sm">{p.name}</span>
              </div>
              {p.entity && (
                <Badge variant="secondary" className="text-xs bg-neutral-700 text-neutral-300">
                  {p.entity.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>{formatCurrency(p.saved_amount)} de {formatCurrency(p.target_amount)}</span>
              <span className="font-medium text-white">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2 bg-neutral-700" />
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>Falta: {formatCurrency(remaining)}</span>
              {p.deadline && (
                <span>Prazo: {new Date(p.deadline + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
