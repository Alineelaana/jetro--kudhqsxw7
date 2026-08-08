import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VERBA_AGREEMENT_STATUS } from '@/lib/tm-verbas-types'
import type { TmVerbaFilters } from '@/lib/tm-verbas-types'
import { Search, X } from 'lucide-react'

interface TmVerbaFiltersProps {
  filters: TmVerbaFilters
  onFiltersChange: (filters: TmVerbaFilters) => void
  suppliers: string[]
  brands: string[]
  responsibles: string[]
}

export function TmVerbaFilters({
  filters,
  onFiltersChange,
  brands,
  responsibles,
}: TmVerbaFiltersProps) {
  const hasActive = Object.values(filters).some((v) => v !== '')
  const clear = () =>
    onFiltersChange({
      supplier: '',
      brand: '',
      product: '',
      campaign: '',
      action: '',
      status: '',
      responsible: '',
      company: '',
      branch: '',
      startDate: '',
      endDate: '',
      validityDate: '',
    })

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={filters.supplier}
            onChange={(e) => onFiltersChange({ ...filters, supplier: e.target.value })}
            placeholder="Fornecedor..."
            className="pl-10 h-8 w-40 text-xs focus-visible:ring-[#005B2E]"
          />
        </div>
        <Select
          value={filters.status || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, status: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {VERBA_AGREEMENT_STATUS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.brand || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, brand: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.responsible || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, responsible: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {responsibles.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
          className="h-8 w-32 text-xs"
        />
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
          className="h-8 w-32 text-xs"
        />
        <Input
          type="date"
          value={filters.validityDate}
          onChange={(e) => onFiltersChange({ ...filters, validityDate: e.target.value })}
          className="h-8 w-32 text-xs"
          title="Validade até"
        />
        {hasActive && (
          <Button variant="ghost" size="sm" onClick={clear} className="text-xs h-8">
            <X className="w-3 h-3 mr-1" /> Limpar
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={filters.product}
          onChange={(e) => onFiltersChange({ ...filters, product: e.target.value })}
          placeholder="Produto..."
          className="h-8 w-36 text-xs focus-visible:ring-[#005B2E]"
        />
        <Input
          value={filters.campaign}
          onChange={(e) => onFiltersChange({ ...filters, campaign: e.target.value })}
          placeholder="Campanha..."
          className="h-8 w-36 text-xs focus-visible:ring-[#005B2E]"
        />
        <Input
          value={filters.action}
          onChange={(e) => onFiltersChange({ ...filters, action: e.target.value })}
          placeholder="Ação..."
          className="h-8 w-36 text-xs focus-visible:ring-[#005B2E]"
        />
        <Input
          value={filters.company}
          onChange={(e) => onFiltersChange({ ...filters, company: e.target.value })}
          placeholder="Empresa..."
          className="h-8 w-32 text-xs focus-visible:ring-[#005B2E]"
        />
        <Input
          value={filters.branch}
          onChange={(e) => onFiltersChange({ ...filters, branch: e.target.value })}
          placeholder="Filial..."
          className="h-8 w-32 text-xs focus-visible:ring-[#005B2E]"
        />
      </div>
    </div>
  )
}
