export const dynamic = 'force-dynamic'

import { getAllExpensesSummary, getProjects, getDebtsByEntity, getEntityBySlug } from '@/lib/queries'
import { formatCurrency, currentMonth, formatMonth } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { GraficoConsolidado } from '@/components/dashboard/GraficoConsolidado'
import { ListaProjetos } from '@/components/dashboard/ListaProjetos'
import { FormProjeto } from '@/components/dashboard/FormProjeto'
import { TrendingDown, AlertTriangle } from 'lucide-react'

export default async function DashboardPage() {
  const month = currentMonth()
  const [summaries, projects] = await Promise.all([
    getAllExpensesSummary(month),
    getProjects(),
  ])

  const irmaoPerfil = await getEntityBySlug('irmao')
  const dividas = irmaoPerfil ? await getDebtsByEntity(irmaoPerfil.id) : []
  const dividasAtivas = dividas.filter((d) => d.status === 'active')
  const totalDivida = dividasAtivas.reduce((s, d) => s + Number(d.total_amount), 0)
  const paidDivida = dividasAtivas.reduce((s, d) => s + Number(d.paid_amount), 0)
  const restanteDivida = totalDivida - paidDivida

  const totalGeral = summaries.reduce((s, e) => s + e.total_expenses, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Visão Geral</h2>
        <p className="text-neutral-400 text-sm capitalize">{formatMonth(month)}</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaries.map((s) => (
          <Card key={s.entity.id} className="bg-neutral-800 border-neutral-700">
            <CardHeader className="pb-1 pt-4 px-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.entity.color }}
                />
                <CardTitle className="text-sm text-neutral-300">{s.entity.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xl font-bold text-white">{formatCurrency(s.total_expenses)}</p>
              <p className="text-xs text-neutral-500">{s.expense_count} lançamentos</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Card destaque: mínimo a faturar */}
      <Card className="bg-indigo-950 border-indigo-800 mb-6">
        <CardContent className="flex items-center gap-4 py-5 px-6">
          <TrendingDown className="w-8 h-8 text-indigo-400 shrink-0" />
          <div>
            <p className="text-indigo-300 text-sm font-medium">Mínimo a faturar esse mês</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(totalGeral)}</p>
            <p className="text-xs text-indigo-400 mt-0.5">Soma de todas as despesas fixas</p>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico */}
      <Card className="bg-neutral-800 border-neutral-700 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Despesas por Entidade</CardTitle>
        </CardHeader>
        <CardContent>
          <GraficoConsolidado summaries={summaries} />
        </CardContent>
      </Card>

      {/* Dívidas do irmão */}
      {dividasAtivas.length > 0 && (
        <Card className="bg-amber-950 border-amber-800 mb-6">
          <CardContent className="flex items-start gap-4 py-5 px-6">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-300 text-sm font-medium mb-1">
                Dívidas do Irmão — {dividasAtivas.length} ativa{dividasAtivas.length > 1 ? 's' : ''}
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold text-lg">{formatCurrency(restanteDivida)}</span>
                <span className="text-amber-400 text-xs">restante de {formatCurrency(totalDivida)}</span>
              </div>
              <Progress
                value={totalDivida > 0 ? (paidDivida / totalDivida) * 100 : 0}
                className="h-2 bg-amber-900"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projetos */}
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-white">Projetos & Metas</CardTitle>
          <FormProjeto />
        </CardHeader>
        <CardContent>
          <ListaProjetos projects={projects} />
        </CardContent>
      </Card>
    </div>
  )
}
