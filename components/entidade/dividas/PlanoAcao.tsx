'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, priorityLabel, priorityColor } from '@/lib/utils'
import type { Debt } from '@/lib/types'
import { GraficoEvolucao } from './GraficoEvolucao'

interface Props {
  debts: Debt[]
}

interface SimulacaoItem {
  creditor: string
  priority: number
  interest_rate: number
  remaining: number
  mesesParaQuitar: number
  totalPago: number
  jurosTotal: number
  iniciaEm: number // mês em que começa a pagar (após quitar anteriores)
}

function simular(debts: Debt[], disponivel: number): SimulacaoItem[] {
  if (disponivel <= 0) return []

  // Ordena: prioridade (1 > 2 > 3), depois maior juros primeiro
  const sorted = [...debts].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return Number(b.interest_rate) - Number(a.interest_rate)
  })

  const resultado: SimulacaoItem[] = []
  let mesAtual = 0

  for (const debt of sorted) {
    let saldo = Number(debt.total_amount) - Number(debt.paid_amount)
    const juros = Number(debt.interest_rate) / 100
    let meses = 0
    let totalPago = 0
    let jurosTotal = 0

    while (saldo > 0.01 && meses < 600) {
      const jurosMes = saldo * juros
      const pagamento = Math.min(disponivel, saldo + jurosMes)
      const principal = pagamento - jurosMes
      saldo -= principal
      totalPago += pagamento
      jurosTotal += jurosMes
      meses++
    }

    resultado.push({
      creditor: debt.creditor,
      priority: debt.priority,
      interest_rate: Number(debt.interest_rate),
      remaining: Number(debt.total_amount) - Number(debt.paid_amount),
      mesesParaQuitar: meses,
      totalPago,
      jurosTotal,
      iniciaEm: mesAtual,
    })

    mesAtual += meses
  }

  return resultado
}

export function PlanoAcao({ debts }: Props) {
  const [disponivel, setDisponivel] = useState<number>(500)

  const plano = useMemo(() => simular(debts, disponivel), [debts, disponivel])

  const totalRestante = debts.reduce(
    (s, d) => s + (Number(d.total_amount) - Number(d.paid_amount)),
    0
  )
  const totalMeses = plano.length > 0 ? plano[plano.length - 1].iniciaEm + plano[plano.length - 1].mesesParaQuitar : 0
  const totalJuros = plano.reduce((s, p) => s + p.jurosTotal, 0)

  return (
    <div className="flex flex-col gap-5">
      {/* Controle de disponível */}
      <div className="bg-neutral-800 rounded-xl p-4">
        <Label className="text-neutral-300 text-sm">Quanto pode pagar por mês (R$)</Label>
        <Input
          type="number"
          min="1"
          step="50"
          value={disponivel}
          onChange={(e) => setDisponivel(Number(e.target.value))}
          className="mt-2 bg-neutral-700 border-neutral-600 text-white w-48"
        />
        <p className="text-xs text-neutral-500 mt-2">
          Estratégia: maior prioridade primeiro, depois maior juros (avalanche)
        </p>
      </div>

      {/* Resumo */}
      {disponivel > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-neutral-800 rounded-xl p-3 text-center">
            <p className="text-neutral-400 text-xs mb-1">Dívida total</p>
            <p className="text-white font-bold">{formatCurrency(totalRestante)}</p>
          </div>
          <div className="bg-neutral-800 rounded-xl p-3 text-center">
            <p className="text-neutral-400 text-xs mb-1">Tempo estimado</p>
            <p className="text-white font-bold">{totalMeses} meses</p>
            <p className="text-neutral-500 text-xs">{(totalMeses / 12).toFixed(1)} anos</p>
          </div>
          <div className="bg-amber-950 border border-amber-800 rounded-xl p-3 text-center">
            <p className="text-amber-400 text-xs mb-1">Juros no período</p>
            <p className="text-white font-bold">{formatCurrency(totalJuros)}</p>
          </div>
        </div>
      )}

      {/* Tabela de ordem de pagamento */}
      {plano.length > 0 && (
        <div className="bg-neutral-800 rounded-xl p-4">
          <p className="text-sm font-medium text-white mb-3">Ordem de quitação</p>
          <div className="flex flex-col gap-2">
            {plano.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-neutral-700 last:border-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-neutral-500 text-xs w-5 shrink-0">{i + 1}.</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-white font-medium">{item.creditor}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(item.priority)}`}>
                        {priorityLabel(item.priority)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Começa no mês {item.iniciaEm + 1} · {item.interest_rate}% a.m.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-white">
                    {item.mesesParaQuitar} meses
                  </p>
                  <p className="text-xs text-neutral-500">
                    Total pago: {formatCurrency(item.totalPago)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráfico de evolução */}
      {plano.length > 0 && totalMeses > 0 && (
        <div className="bg-neutral-800 rounded-xl p-4">
          <p className="text-sm font-medium text-white mb-3">Evolução do saldo devedor</p>
          <GraficoEvolucao debts={debts} disponivel={disponivel} totalMeses={totalMeses} />
        </div>
      )}
    </div>
  )
}
