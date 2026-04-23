'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DollarSign } from 'lucide-react'
import { registrarPagamentoDivida } from '@/app/actions'

interface Props {
  debtId: string
  creditor: string
  remaining: number
}

export function FormPagamento({ debtId, creditor, remaining }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData(e.currentTarget)
      fd.set('debt_id', debtId)
      await registrarPagamentoDivida(fd)
      toast.success('Pagamento registrado!')
      setOpen(false)
    } catch {
      toast.error('Erro ao registrar pagamento')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="border-amber-700 text-amber-400 hover:bg-amber-900/30 text-xs h-7" />}>
        <DollarSign className="w-3 h-3 mr-1" /> Pagar
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-700 text-white">
        <DialogHeader>
          <DialogTitle>Registrar pagamento — {creditor}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <Label className="text-neutral-300">Valor pago (R$)</Label>
            <Input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={remaining}
              required
              defaultValue={remaining}
              className="mt-1 bg-neutral-800 border-neutral-600 text-white"
            />
          </div>
          <div>
            <Label className="text-neutral-300">Data do pagamento</Label>
            <Input
              name="paid_at"
              type="date"
              required
              defaultValue={today}
              className="mt-1 bg-neutral-800 border-neutral-600 text-white"
            />
          </div>
          <div>
            <Label className="text-neutral-300">Observações</Label>
            <Input name="notes" placeholder="Opcional" className="mt-1 bg-neutral-800 border-neutral-600 text-white" />
          </div>
          <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700">
            {loading ? 'Salvando...' : 'Confirmar pagamento'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
