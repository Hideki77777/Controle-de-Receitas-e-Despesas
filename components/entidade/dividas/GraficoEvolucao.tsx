'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { Debt } from '@/lib/types'

interface Props {
  debts: Debt[]
  disponivel: number
  totalMeses: number
}

function calcularEvolucao(debts: Debt[], disponivel: number, totalMeses: number) {
  const sorted = [...debts].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return Number(b.interest_rate) - Number(a.interest_rate)
  })

  // Estado inicial dos saldos
  const saldos = sorted.map((d) => ({
    id: d.id,
    saldo: Number(d.total_amount) - Number(d.paid_amount),
    juros: Number(d.interest_rate) / 100,
  }))

  const pontos: { mes: string; saldo: number }[] = []

  const totalInicial = saldos.reduce((s, d) => s + d.saldo, 0)
  pontos.push({ mes: 'Hoje', saldo: totalInicial })

  for (let mes = 1; mes <= Math.min(totalMeses, 120); mes++) {
    let pagamentoRestante = disponivel

    for (const item of saldos) {
      if (item.saldo <= 0.01) continue
      const jurosMes = item.saldo * item.juros
      const pagamento = Math.min(pagamentoRestante, item.saldo + jurosMes)
      const principal = pagamento - jurosMes
      item.saldo = Math.max(0, item.saldo - principal)
      pagamentoRestante -= pagamento
      if (pagamentoRestante <= 0) break
    }

    const totalAtual = saldos.reduce((s, d) => s + Math.max(0, d.saldo), 0)
    if (mes % Math.max(1, Math.floor(totalMeses / 24)) === 0 || mes === totalMeses) {
      pontos.push({ mes: `Mês ${mes}`, saldo: totalAtual })
    }
    if (totalAtual < 0.01) break
  }

  return pontos
}

export function GraficoEvolucao({ debts, disponivel, totalMeses }: Props) {
  const data = calcularEvolucao(debts, disponivel, totalMeses)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis dataKey="mes" tick={{ fill: '#a3a3a3', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: '#a3a3a3', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 8 }}
          formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Saldo restante']}
        />
        <Line
          type="monotone"
          dataKey="saldo"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
