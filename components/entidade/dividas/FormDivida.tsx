'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil } from 'lucide-react'
import { salvarDivida } from '@/app/actions'
import type { Debt } from '@/lib/types'

interface Props {
  entityId: string
  debt?: Debt
}

export function FormDivida({ entityId, debt }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [priority, setPriority] = useState(String(debt?.priority ?? '2'))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData(e.currentTarget)
      fd.set('entity_id', entityId)
      fd.set('priority', priority)
      await salvarDivida(fd)
      toast.success(debt ? 'Dívida atualizada!' : 'Dívida cadastrada!')
      setOpen(false)
    } catch {
      toast.error('Erro ao salvar dívida')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {debt ? (
        <DialogTrigger render={<Button size="icon" variant="ghost" className="h-7 w-7 text-neutral-400 hover:text-white" />}>
          <Pencil className="w-3.5 h-3.5" />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="sm" variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800" />}>
          <Plus className="w-4 h-4 mr-1" /> Nova Dívida
        </DialogTrigger>
      )}
      <DialogContent className="bg-neutral-900 border-neutral-700 text-white">
        <DialogHeader>
          <DialogTitle>{debt ? 'Editar Dívida' : 'Cadastrar Dívida'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {debt && <input type="hidden" name="id" value={debt.id} />}

          <div>
            <Label className="text-neutral-300">Credor</Label>
            <Input
              name="creditor"
              required
              defaultValue={debt?.creditor}
              placeholder="Ex: Banco, Loja, Pessoa"
              className="mt-1 bg-neutral-800 border-neutral-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-neutral-300">Valor total (R$)</Label>
              <Input
                name="total_amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                defaultValue={debt?.total_amount}
                placeholder="0,00"
                className="mt-1 bg-neutral-800 border-neutral-600 text-white"
              />
            </div>
            <div>
              <Label className="text-neutral-300">Já pago (R$)</Label>
              <Input
                name="paid_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={debt?.paid_amount ?? 0}
                placeholder="0,00"
                className="mt-1 bg-neutral-800 border-neutral-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-neutral-300">Juros ao mês (%)</Label>
              <Input
                name="interest_rate"
                type="number"
                step="0.01"
                min="0"
                defaultValue={debt?.interest_rate ?? 0}
                placeholder="0"
                className="mt-1 bg-neutral-800 border-neutral-600 text-white"
              />
            </div>
            <div>
              <Label className="text-neutral-300">Prioridade</Label>
              <Select value={priority} onValueChange={(v) => v !== null && setPriority(v)}>
                <SelectTrigger className="mt-1 bg-neutral-800 border-neutral-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-600 text-white">
                  <SelectItem value="1" className="focus:bg-neutral-700">Alta</SelectItem>
                  <SelectItem value="2" className="focus:bg-neutral-700">Média</SelectItem>
                  <SelectItem value="3" className="focus:bg-neutral-700">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-neutral-300">Vencimento (opcional)</Label>
            <Input
              name="due_date"
              type="date"
              defaultValue={debt?.due_date ?? ''}
              className="mt-1 bg-neutral-800 border-neutral-600 text-white"
            />
          </div>

          <div>
            <Label className="text-neutral-300">Observações</Label>
            <Input
              name="notes"
              defaultValue={debt?.notes ?? ''}
              placeholder="Opcional"
              className="mt-1 bg-neutral-800 border-neutral-600 text-white"
            />
          </div>

          <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700">
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
