'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, User, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

const entities = [
  { name: 'Eu', slug: 'eu', color: '#6366f1', icon: User },
  { name: 'Irmão', slug: 'irmao', color: '#f59e0b', icon: User },
  { name: 'Pai', slug: 'pai', color: '#10b981', icon: User },
  { name: 'Oficina', slug: 'oficina', color: '#ef4444', icon: Wrench },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-neutral-950 border-r border-neutral-800 flex flex-col py-6 px-3 gap-1">
      <div className="px-3 mb-6">
        <h1 className="text-white font-bold text-lg leading-tight">Controle</h1>
        <p className="text-neutral-400 text-xs">Financeiro Familiar</p>
      </div>

      <nav className="flex flex-col gap-1">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            pathname === '/dashboard'
              ? 'bg-white/10 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          )}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Geral
        </Link>

        <div className="mx-3 my-2 border-t border-neutral-800" />

        {entities.map((entity) => {
          const href = `/entidade/${entity.slug}`
          const active = pathname === href || pathname.startsWith(href + '/')
          const Icon = entity.icon
          return (
            <Link
              key={entity.slug}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              )}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entity.color }}
              />
              <Icon className="w-4 h-4 shrink-0" />
              {entity.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
