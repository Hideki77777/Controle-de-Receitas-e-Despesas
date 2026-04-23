export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getEntityBySlug, getExpensesByEntity, getCategories, getDebtsByEntity } from '@/lib/queries'
import { formatCurrency, currentMonth, formatMonth } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraficoDespesas } from '@/components/entidade/GraficoDespesas'
import { ListaDespesas } from '@/components/entidade/ListaDespesas'
import { FormDespesa } from '@/components/entidade/FormDespesa'
import { ListaDividas } from '@/components/entidade/dividas/ListaDividas'
import { FormDivida } from '@/components/entidade/dividas/FormDivida'
import { PlanoAcao } from '@/components/entidade/dividas/PlanoAcao'
import { TrendingDown, ReceiptText, ArrowUpRight } from 'lucide-react'

export default async function EntidadePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entity = await getEntityBySlug(slug)
  if (!entity) notFound()

  const month = currentMonth()
  const [expenses, categories] = await Promise.all([
    getExpensesByEntity(entity.id, month),
    getCategories(),
  ])

  const totalMonth = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const highestExpense = expenses.reduce((max, e) => (Number(e.amount) > max ? Number(e.amount) : max), 0)

  const isIrmao = slug === 'irmao'
  const debts = isIrmao ? await getDebtsByEntity(entity.id) : []
  const activaDebts = debts.filter((d) => d.status === 'active')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: entity.color }}
        />
        <div>
          <h2 className="text-2xl font-bold text-white">{entity.name}</h2>
          <p className="text-neutral-400 text-sm capitalize">{formatMonth(month)}</p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="pt-5 px-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-xs text-neutral-400">Total despesas</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(totalMonth)}</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="pt-5 px-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <ReceiptText className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-neutral-400">Lançamentos</span>
            </div>
            <p className="text-xl font-bold text-white">{expenses.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="pt-5 px-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-neutral-400">Maior despesa</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(highestExpense)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico por categoria */}
      {expenses.length > 0 && (
        <Card className="bg-neutral-800 border-neutral-700 mb-6">
          <CardHeader className="pb-0">
            <CardTitle className="text-base text-white">Por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoDespesas expenses={expenses} />
          </CardContent>
        </Card>
      )}

      {/* Lista de despesas */}
      <Card className="bg-neutral-800 border-neutral-700 mb-6">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-white">Despesas</CardTitle>
          <FormDespesa entityId={entity.id} entitySlug={slug} categories={categories} />
        </CardHeader>
        <CardContent>
          <ListaDespesas
            expenses={expenses}
            entityId={entity.id}
            entitySlug={slug}
            categories={categories}
          />
        </CardContent>
      </Card>

      {/* Módulo de dívidas — somente para o irmão */}
      {isIrmao && (
        <>
          <div className="flex items-center justify-between mb-3 mt-8">
            <h3 className="text-lg font-semibold text-white">Dívidas</h3>
            <FormDivida entityId={entity.id} />
          </div>

          <ListaDividas debts={debts} entityId={entity.id} />

          {activaDebts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Plano de Ação</h3>
              <PlanoAcao debts={activaDebts} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
