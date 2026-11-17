import { useState, useMemo } from 'react'
import { Loader2, Search, X, ChevronDown, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SelectOption } from '@/components/pricing/rule-options'

interface Props {
  label: string
  options: SelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  loading?: boolean
  placeholder?: string
}

/**
 * Seletor multi-seleção com busca interna — substitui os campos de texto livre
 * das Regras de Aplicação. Em branco = aplica a todos.
 */
export function MultiSelectField({
  label,
  options,
  selected,
  onChange,
  loading,
  placeholder,
}: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase()
    if (!t) return options
    return options.filter((o) => o.label.toLowerCase().includes(t))
  }, [options, search])

  const toggle = (value: string) => {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value))
    else onChange([...selected, value])
  }

  const clear = () => onChange([])

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{label}</span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-[11px] text-muted-foreground hover:text-foreground underline"
          >
            limpar ({selected.length})
          </button>
        )}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005B2E]',
          )}
        >
          <span
            className={cn('truncate text-left', selected.length === 0 && 'text-muted-foreground')}
          >
            {loading
              ? 'Carregando...'
              : selected.length === 0
                ? placeholder || 'Todos (aplica a todos)'
                : selected.length === 1
                  ? selected[0]
                  : `${selected.length} selecionados`}
          </span>
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
        {selected.length > 1 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {selected.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 rounded bg-[#005B2E]/10 px-1.5 py-0.5 text-[11px] text-[#005B2E]"
              >
                {v}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggle(v)} />
              </span>
            ))}
          </div>
        )}
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="h-8 pl-7 text-sm focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {loading ? (
                <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Carregando...
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-4">
                  {options.length === 0
                    ? 'Nenhum registro cadastrado no sistema'
                    : 'Nenhum resultado para a busca'}
                </p>
              ) : (
                filtered.map((opt) => {
                  const checked = selected.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggle(opt.value)}
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-[#005B2E]/5 text-left"
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border',
                          checked ? 'bg-[#005B2E] border-[#005B2E] text-white' : 'border-input',
                        )}
                      >
                        {checked && <Check className="w-3 h-3" />}
                      </span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  )
                })
              )}
            </div>
            {selected.length > 0 && (
              <div className="border-t p-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="w-full h-7 text-xs"
                  onClick={clear}
                >
                  Limpar seleção
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
