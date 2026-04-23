'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { criarProjeto } from '@/app/actions'

export function FormProjeto() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData(e.currentTarget)
      await criarProjeto(fd)
      toast.success('Projeto criado!')
      setOpen(false)
    } catch {
      toast.error('Erro ao criar projeto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800" />}>
        <Plus className="w-4 h-4 mr-1" /> Novo Projeto
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-700 text-white">
        <DialogHeader>
          <DialogTitle>Novo Projeto / Meta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <Label className="text-neutral-300">Nome</Label>
            <Input name="name" required placeholder="Ex: Compressor novo" className="mt-1 bg-neutral-800 border-neutral-600 text-white" />
          </div>
          <div>
            <Label className="text-neutral-300">Valor alvo (R$)</Label>
            <Input name="target_amount" type="number" step="0.01" min="0.01" required placeholder="0,00" className="mt-1 bg-neutral-800 border-neutral-600 text-white" />
          </div>
          <div>
            <Label className="text-neutral-300">Já economizado (R$)</Label>
            <Input name="saved_amount" type="number" step="0.01" min="0" defaultValue="0" className="mt-1 bg-neutral-800 border-neutral-600 text-white" />
          </div>
          <div>
            <Label className="text-neutral-300">Prazo (opcional)</Label>
            <Input name="deadline" type="date" className="mt-1 bg-neutral-800 border-neutral-600 text-white" />
          </div>
          <div>
            <Label className="text-neutral-300">Observações</Label>
            <Input name="notes" placeholder="Opcional" className="mt-1 bg-neutral-800 border-neutral-600 text-white" />
          </div>
          <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
