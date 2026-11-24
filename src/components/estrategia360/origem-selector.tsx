// Seletor multi-seleção usado nos filtros globais da tela 360° (Origem).
import { useMemo, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { EmpresaOption } from './types'

export function OrigemSelector({
  options,
  selected,
  onChange,
}: {
  options: EmpresaOption[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase()
    if (!t) return options
    return options.filter((o) => o.label.toLowerCase().includes(t))
  }, [options, search])

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <span
          className={cn('truncate text-left', selected.length === 0 && 'text-muted-foreground')}
        >
          {selected.length === 0
            ? 'Todas as origens'
            : selected.length === 1
              ? (options.find((o) => o.value === selected[0])?.label ?? selected[0])
              : `${selected.length} selecionadas`}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {selected.length > 1 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {selected.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[11px]"
            >
              {options.find((o) => o.value === v)?.label ?? v}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggle(v)} />
            </span>
          ))}
        </div>
      )}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="border-b p-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar…"
                className="h-8 pl-7 text-sm"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Nenhuma empresa encontrada
              </p>
            ) : (
              filtered.map((opt) => {
                const checked = selected.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(opt.value)}
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded border',
                        checked
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-input',
                      )}
                    >
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
