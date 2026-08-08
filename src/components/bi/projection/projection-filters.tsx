import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Filter, X, Settings } from 'lucide-react'
import type { ProjectionFilters } from '@/lib/projection-utils'

interface Props {
  filters: ProjectionFilters
  onFilterChange: (f: ProjectionFilters) => void
  onClear: () => void
  onOpenConfig: () => void
}

export function ProjectionFilters({ filters, onFilterChange, onClear, onOpenConfig }: Props) {
  const update = (key: keyof ProjectionFilters, value: string) =>
    onFilterChange({ ...filters, [key]: value })

  const fields: Array<{ key: keyof ProjectionFilters; label: string; type?: string }> = [
    { key: 'competencia', label: 'Competência', type: 'month' },
    { key: 'rca', label: 'RCA' },
    { key: 'gerente', label: 'Gerente' },
    { key: 'fornecedor', label: 'Fornecedor' },
    { key: 'produto', label: 'Produto' },
    { key: 'regiao', label: 'Região' },
    { key: 'empresa', label: 'Empresa' },
    { key: 'filial', label: 'Filial' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'marca', label: 'Marca' },
    { key: 'industria', label: 'Indústria' },
    { key: 'canal', label: 'Canal' },
    { key: 'origem_venda', label: 'Origem' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
      {fields.map((f) => (
        <Input
          key={f.key}
          type={f.type || 'text'}
          placeholder={f.label}
          value={filters[f.key] || ''}
          onChange={(e) => update(f.key, e.target.value)}
          className="w-28 h-8 text-sm"
        />
      ))}
      <Button variant="outline" size="sm" onClick={onClear} className="h-8">
        <X className="w-3.5 h-3.5 mr-1" /> Limpar
      </Button>
      <Button variant="outline" size="sm" onClick={onOpenConfig} className="h-8">
        <Settings className="w-3.5 h-3.5 mr-1" /> Dias Úteis
      </Button>
    </div>
  )
}
