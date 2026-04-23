'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil } from 'lucide-react'
import { salvarDespesa } from '@/app/actions'
import { currentMonth, monthOptions } from '@/lib/utils'
import type { Category, Expense } from '@/lib/types'

interface Props {
  entityId: string
  entitySlug: string
  categories: Category[]
  expense?: Expense
  onClose?: () => void
}

export function FormDespesa({ entityId, entitySlug, categories, expense, onClose }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categoryId, setCategoryId] = useState(expense?.category_id ?? '')
  const [month, setMonth] = useState(expense?.month ?? currentMonth())

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData(e.currentTarget)
      fd.set('entity_id', entityId)
      fd.set('slug', entitySlug)
      fd.set('category_id', categoryId)
      fd.set('month', month)
      await salvarDespesa(fd)
      toast.success(expense ? 'Despesa atualizada!' : 'Despesa adicionada!')
      setOpen(false)
      onClose?.()
    } catch {
      toast.error('Erro ao salvar despesa')
    } finally {
      setLoading(false)
    }
  }

  const months = monthOptions()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {expense ? (
          <DialogTrigger render={<Button size="icon" variant="ghost" className="h-7 w-7 text-neutral-400 hover:text-white" />}>
            <Pencil className="w-3.5 h-3.5" />
          </DialogTrigger>
        ) : (
          <DialogTrigger render={<Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" />}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar despesa
          </DialogTrigger>
        )}
      <DialogContent className="bg-neutral-900 border-neutral-700 text-white">
        <DialogHeader>
          <DialogTitle>{expense ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {expense && <input type="hidden" name="id" value={expense.id} />}

          <div>
            <Label className="text-neutral-300">Descrição</Label>
            <Input
              name="description"
              required
              defaultValue={expense?.description}
              placeholder="Ex: Aluguel apartamento"
              className="mt-1 bg-neutral-800 border-neutral-600 text-white"
            />
          </div>

          <div>
            <Label className="text-neutral-300">Valor (R$)</Label>
            <Input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={expense?.amount}
              placeholder="0,00"
              className="mt-1 bg-neutral-800 border-neutral-600 text-white"
            />
          </div>

          <div>
            <Label className="text-neutral-300">Categoria</Label>
            <Select value={categoryId} onValueChange={(v) => v !== null && setCategoryId(v)}>
              <SelectTrigger className="mt-1 bg-neutral-800 border-neutral-600 text-white">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-600 text-white">
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="focus:bg-neutral-700">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-neutral-300">Mês de referência</Label>
            <Select value={month} onValueChange={(v) => v !== null && setMonth(v)}>
              <SelectTrigger className="mt-1 bg-neutral-800 border-neutral-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-600 text-white">
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="focus:bg-neutral-700 capitalize">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_recurring"
              id="is_recurring"
              value="true"
              defaultChecked={expense?.is_recurring}
              className="rounded"
            />
            <Label htmlFor="is_recurring" className="text-neutral-300 cursor-pointer">
              Despesa recorrente (mensal)
            </Label>
          </div>

          <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
