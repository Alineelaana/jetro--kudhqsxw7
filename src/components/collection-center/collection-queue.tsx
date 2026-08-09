import { Input } from '@/components/ui/input'
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
  SORT_OPTIONS,
  formatCurrency,
  type QueueItem,
} from '@/lib/collection-center-types'
import { Search, Network } from 'lucide-react'
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
        <h3 className="text-sm font-bold text-[#005B2E]">Carteira de Cobrança</h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={filters.cliente || ''}
              onChange={(e) => onFilterChange({ ...filters, cliente: e.target.value })}
              placeholder="Buscar cliente..."
              className="h-8 pl-8 text-sm focus-visible:ring-[#005B2E]"
            />
          </div>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-8 text-xs w-36">
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
              {item.networkName && (
                <div className="flex items-center gap-1 mt-0.5 text-[10px]">
                  <Network className="w-3 h-3 text-[#005B2E]" />
                  <span className="text-[#005B2E] font-medium">{item.networkName}</span>
                  {item.networkRestrictionStatus && (
                    <span className="text-red-600 font-bold">
                      • {item.networkRestrictionStatus}
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    • Rede: {formatCurrency(item.networkOverdueTotal)}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
