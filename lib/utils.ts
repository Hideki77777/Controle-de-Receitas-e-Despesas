import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

export function formatMonth(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export function monthOptions(): { value: string; label: string }[] {
  const options = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    options.push({ value, label })
  }
  return options
}

export function priorityLabel(priority: number): string {
  return priority === 1 ? 'Alta' : priority === 2 ? 'Média' : 'Baixa'
}

export function priorityColor(priority: number): string {
  return priority === 1
    ? 'bg-red-100 text-red-800'
    : priority === 2
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-green-100 text-green-800'
}
