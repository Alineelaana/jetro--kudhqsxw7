import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, User, Calendar, X, Filter } from 'lucide-react'
import type { AttendantOption } from '@/lib/request-filters'

interface RequestFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  clientFilter: string
  onClientChange: (value: string) => void
  attendantFilter: string
  onAttendantChange: (value: string) => void
  attendants: AttendantOption[]
  startDate: string
  onStartDateChange: (value: string) => void
  endDate: string
  onEndDateChange: (value: string) => void
  onClear: () => void
  hasActiveFilters: boolean
}

export function RequestFilters({
  searchTerm,
  onSearchChange,
  clientFilter,
  onClientChange,
  attendantFilter,
  onAttendantChange,
  attendants,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClear,
  hasActiveFilters,
}: RequestFiltersProps) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="rounded-lg border border-border bg-white p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-[#005B2E]">
        <Filter className="w-4 h-4" />
        <span>Filtros</span>
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={onClear}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Limpar filtros
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Search className="w-3 h-3" />
            Busca geral
          </Label>
          <Input
            placeholder="Buscar em todos os campos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="w-3 h-3" />
            Cliente
          </Label>
          <Input
            placeholder="Nome, e-mail ou telefone"
            value={clientFilter}
            onChange={(e) => onClientChange(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Responsável</Label>
          <Select
            value={attendantFilter || 'all'}
            onValueChange={(v) => onAttendantChange(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Todos os responsáveis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os responsáveis</SelectItem>
              {attendants.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Data inicial
          </Label>
          <Input
            type="date"
            value={startDate}
            max={today}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Data final
          </Label>
          <Input
            type="date"
            value={endDate}
            min={startDate || undefined}
            max={today}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  )
}
