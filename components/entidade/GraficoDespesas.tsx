'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Expense } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

interface Props {
  expenses: Expense[]
}

export function GraficoDespesas({ expenses }: Props) {
  const grouped: Record<string, number> = {}
  for (const e of expenses) {
    const label = e.category?.name ?? 'Outros'
    grouped[label] = (grouped[label] ?? 0) + Number(e.amount)
  }
  const data = Object.entries(grouped).map(([name, value]) => ({ name, value }))

  if (data.length === 0) {
    return <div className="text-center py-8 text-neutral-500 text-sm">Sem dados para exibir</div>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 8 }}
          formatter={(value) => [formatCurrency(Number(value ?? 0)), '']}
        />
        <Legend
          formatter={(value) => <span className="text-xs text-neutral-300">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
