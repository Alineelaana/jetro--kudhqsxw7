import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Filter, X, Save, FolderOpen, ChevronDown, ChevronUp } from 'lucide-react'
import {
  RISK_CLASSIFICATIONS,
  PRIORITIES,
  AGING_BUCKETS,
  type FilterOptions,
} from '@/lib/collection-center-types'

const PROMESSA_OPTS = [
  'Pendente',
  'Quebrada',
  'Cumprida',
  'Parcialmente cumprida',
  'Cancelada',
  'Sem promessa',
]
const DISPUTA_OPTS = ['Aberta', 'Em análise', 'Resolvida', 'Cancelada', 'Sem disputa']
const ACORDO_OPTS = [
  { value: 'com_acordo', label: 'Com acordo' },
  { value: 'sem_acordo', label: 'Sem acordo' },
]

export function CollectionFilterBar({
  filters,
  onFilterChange,
  filterOptions,
}: {
  filters: Record<string, string>
  onFilterChange: (f: Record<string, string>) => void
  filterOptions: FilterOptions
}) {
  const [expanded, setExpanded] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  const set = (key: string, val: string) => onFilterChange({ ...filters, [key]: val })
  const activeCount = Object.entries(filters).filter(([, v]) => v && v !== '').length

  const saveView = () => {
    const name = prompt('Nome da vista:')
    if (!name) return
    const saved = JSON.parse(localStorage.getItem('cc-views') || '[]')
    saved.push({ name, filters })
    localStorage.setItem('cc-views', JSON.stringify(saved))
  }

  const loadViews = () => JSON.parse(localStorage.getItem('cc-views') || '[]')

  const applyView = (view: any) => {
    onFilterChange(view.filters || {})
    setShowSaved(false)
  }

  const renderSelect = (
    label: string,
    key: string,
    options: { value: string; label: string }[],
  ) => (
    <div className="space-y-0.5">
      <label className="text-[10px] font-medium text-muted-foreground">{label}</label>
      <Select value={filters[key] || 'all'} onValueChange={(v) => set(key, v === 'all' ? '' : v)}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const renderText = (label: string, key: string, type: string = 'text') => (
    <div className="space-y-0.5">
      <label className="text-[10px] font-medium text-muted-foreground">{label}</label>
      <Input
        type={type}
        value={filters[key] || ''}
        onChange={(e) => set(key, e.target.value)}
        className="h-8 text-xs"
      />
    </div>
  )

  return (
    <Card className="border-2 border-[#005B2E]/20 shadow-sm">
      <div className="flex items-center justify-between p-2.5 border-b border-[#005B2E]/10">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#005B2E]" />
          <span className="text-sm font-bold text-[#005B2E]">Filtros</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5">
              {activeCount} ativos
            </Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={saveView}
            title="Salvar vista"
          >
            <Save className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={() => setShowSaved(!showSaved)}
            title="Vistas salvas"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </Button>
          {activeCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => onFilterChange({})}
              title="Limpar filtros"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>

      {showSaved && (
        <div className="p-2 border-b border-[#005B2E]/10 flex flex-wrap gap-1">
          {loadViews().length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhuma vista salva</p>
          )}
          {loadViews().map((v: any, i: number) => (
            <Button
              key={i}
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() => applyView(v)}
            >
              {v.name}
            </Button>
          ))}
        </div>
      )}

      <div className="p-2.5 grid grid-cols-2 md:grid-cols-4 gap-2">
        {renderSelect(
          'Vendedor/RCA',
          'vendedor',
          filterOptions.vendedores.map((v) => ({ value: v, label: v })),
        )}
        {renderSelect(
          'Gerente',
          'gerente',
          filterOptions.gerentes.map((v) => ({ value: v, label: v })),
        )}
        {renderSelect(
          'Cidade',
          'cidade',
          filterOptions.cidades.map((v) => ({ value: v, label: v })),
        )}
        {renderSelect(
          'UF/Estado',
          'uf',
          filterOptions.ufs.map((v) => ({ value: v, label: v })),
        )}
      </div>

      {expanded && (
        <div className="p-2.5 pt-0 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 border-t border-[#005B2E]/10">
          {renderSelect(
            'Supervisor',
            'supervisor',
            filterOptions.supervisores.map((v) => ({ value: v, label: v })),
          )}
          {renderSelect(
            'Região',
            'regiao',
            filterOptions.regioes.map((v) => ({ value: v, label: v })),
          )}
          {renderSelect(
            'Cobrador',
            'cobrador',
            filterOptions.cobradores.map((v) => ({ value: v, label: v })),
          )}
          {renderSelect(
            'Risco',
            'risco',
            RISK_CLASSIFICATIONS.map((r) => ({ value: r.key, label: `${r.emoji} ${r.label}` })),
          )}
          {renderSelect(
            'Prioridade',
            'prioridade',
            PRIORITIES.map((p) => ({ value: p, label: p })),
          )}
          {renderSelect(
            'Status',
            'status',
            filterOptions.statuses.map((s) => ({ value: s, label: s })),
          )}
          {renderSelect(
            'Faixa Aging',
            'faixa_aging',
            AGING_BUCKETS.map((b) => ({ value: b.key, label: b.label })),
          )}
          {renderSelect(
            'Promessa',
            'promessa',
            PROMESSA_OPTS.map((p) => ({ value: p, label: p })),
          )}
          {renderSelect('Acordo', 'acordo', ACORDO_OPTS)}
          {renderSelect(
            'Disputa',
            'disputa',
            DISPUTA_OPTS.map((d) => ({ value: d, label: d })),
          )}
          {renderText('Cliente', 'cliente')}
          {renderText('CNPJ/CPF', 'cnpj_cpf')}
          {renderText('Título', 'titulo')}
          {renderText('NF', 'nf')}
          {renderText('Pedido', 'pedido')}
          {renderText('Empresa', 'empresa')}
          {renderText('Filial', 'filial')}
          {renderText('Venc. Inicial', 'vencimento_start', 'date')}
          {renderText('Venc. Final', 'vencimento_end', 'date')}
          {renderText('Dias Mín.', 'dias_atraso_min', 'number')}
          {renderText('Dias Máx.', 'dias_atraso_max', 'number')}
          {renderText('Valor Mín.', 'valor_min', 'number')}
          {renderText('Valor Máx.', 'valor_max', 'number')}
        </div>
      )}
    </Card>
  )
}
