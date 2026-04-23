'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { EntitySummary } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  summaries: EntitySummary[]
}

export function GraficoConsolidado({ summaries }: Props) {
  const data = summaries.map((s) => ({
    name: s.entity.name,
    despesas: s.total_expenses,
    color: s.entity.color,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: '#a3a3a3', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 8 }}
          labelStyle={{ color: '#fff', fontWeight: 600 }}
          formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Despesas']}
        />
        <Bar dataKey="despesas" radius={[4, 4, 0, 0]} fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  )
}
