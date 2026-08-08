import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { FinancialLoading, FinancialEmptyState } from '@/components/financial/financial-shared'
import {
  RISK_CLASSIFICATIONS,
  PRIORITIES,
  SORT_OPTIONS,
  formatCurrency,
  type QueueItem,
} from '@/lib/collection-center-types'
import { Search, Save, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CollectionQueue({
  items,
  loading,
  sortBy,
  onSortChange,
  filters,
  onFilterChange,
  selectedCliente,
  onSelectClient,
}: {
  items: QueueItem[]
  loading: boolean
  sortBy: string
  onSortChange: (s: string) => void
  filters: Record<string, string>
  onFilterChange: (f: Record<string, string>) => void
  selectedCliente: string | null
  onSelectClient: (c: string) => void
}) {
  const [showSaved, setShowSaved] = useState(false)

  const saveView = () => {
    const name = prompt('Nome da vista:')
    if (!name) return
    const saved = JSON.parse(localStorage.getItem('cc-views') || '[]')
    saved.push({ name, filters, sortBy })
    localStorage.setItem('cc-views', JSON.stringify(saved))
  }

  const loadViews = () => JSON.parse(localStorage.getItem('cc-views') || '[]')

  const applyView = (view: any) => {
    onFilterChange(view.filters || {})
    onSortChange(view.sortBy || 'maior_valor')
    setShowSaved(false)
  }

  const getRiskBadge = (risco: string) => {
    const r = RISK_CLASSIFICATIONS.find((rc) => rc.key === risco)
    return r ? (
      <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded', r.className)}>
        {r.emoji} {r.label}
      </span>
    ) : (
      risco
    )
  }

  const getAlerts = (item: QueueItem): string[] => {
    const alerts: string[] = []
    if (item.collectionRecord?.promise_status === 'Quebrada') alerts.push('🔴')
    if (!item.ultimoContato) alerts.push('🟠')
    if (item.collectionRecord?.dispute_status === 'Aberta') alerts.push('🟣')
    if (
      item.collectionRecord?.promise_status === 'Pendente' &&
      item.collectionRecord?.promise_date === new Date().toISOString().split('T')[0]
    )
      alerts.push('🔵')
    return alerts
  }

  return (
    <Card className="border-2 border-[#005B2E]/20 shadow-md">
      <div className="p-3 space-y-2 border-b border-[#005B2E]/10">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#005B2E]">Carteira de Cobrança</h3>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={saveView}
              title="Salvar vista"
            >
              <Save className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => setShowSaved(!showSaved)}
              title="Vistas salvas"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        {showSaved && (
          <div className="space-y-1">
            {loadViews().map((v: any, i: number) => (
              <Button
                key={i}
                size="sm"
                variant="outline"
                className="w-full text-xs h-7"
                onClick={() => applyView(v)}
              >
                {v.name}
              </Button>
            ))}
            {loadViews().length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhuma vista salva</p>
            )}
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={filters.cliente || ''}
            onChange={(e) => onFilterChange({ ...filters, cliente: e.target.value })}
            placeholder="Buscar cliente..."
            className="h-8 pl-8 text-sm focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="grid grid-cols-3 gap-1">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.key} value={o.key}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.risco || ''}
            onValueChange={(v) => onFilterChange({ ...filters, risco: v === 'all' ? '' : v })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Risco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {RISK_CLASSIFICATIONS.map((r) => (
                <SelectItem key={r.key} value={r.key}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.prioridade || ''}
            onValueChange={(v) => onFilterChange({ ...filters, prioridade: v === 'all' ? '' : v })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <FinancialLoading />
        ) : items.length === 0 ? (
          <FinancialEmptyState message="Nenhum cliente inadimplente" />
        ) : (
          items.map((item) => (
            <div
              key={item.cliente}
              onClick={() => onSelectClient(item.cliente)}
              className={cn(
                'p-2.5 border-b border-border cursor-pointer transition-colors',
                selectedCliente === item.cliente ? 'bg-[#005B2E]/10' : 'hover:bg-[#005B2E]/5',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-bold truncate">{item.cliente}</p>
                    {getAlerts(item).map((a, i) => (
                      <span key={i}>{a}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {getRiskBadge(item.risco)}
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded',
                        item.prioridade === 'Urgente'
                          ? 'bg-red-100 text-red-700'
                          : item.prioridade === 'Alta'
                            ? 'bg-orange-100 text-orange-700'
                            : item.prioridade === 'Média'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600',
                      )}
                    >
                      {item.prioridade}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-red-600">
                    {formatCurrency(item.valorVencido)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.diasAtraso} dias · {item.quantidadeTitulos} títulos
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                <span>Último: {item.ultimoContato || '—'}</span>
                <span>Próx: {item.proximaAcao || '—'}</span>
                {item.promessaExistente && (
                  <Badge variant="outline" className="text-[9px] h-4">
                    P: {item.promessaExistente}
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
