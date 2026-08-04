import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export interface StockFilterValues {
  empresa: string
  filial: string
  deposito: string
  localizacao: string
  produto: string
  categoria: string
  marca: string
  lote: string
  dataInicio: string
  dataFim: string
}

export const EMPTY_FILTERS: StockFilterValues = {
  empresa: '',
  filial: '',
  deposito: '',
  localizacao: '',
  produto: '',
  categoria: '',
  marca: '',
  lote: '',
  dataInicio: '',
  dataFim: '',
}

const FIELDS: Array<{ key: keyof StockFilterValues; label: string; type?: string }> = [
  { key: 'empresa', label: 'Empresa' },
  { key: 'filial', label: 'Filial' },
  { key: 'deposito', label: 'Depósito' },
  { key: 'localizacao', label: 'Localização' },
  { key: 'produto', label: 'Produto' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'marca', label: 'Marca' },
  { key: 'lote', label: 'Lote' },
  { key: 'dataInicio', label: 'Data Inicial', type: 'date' },
  { key: 'dataFim', label: 'Data Final', type: 'date' },
]

export function StockFilterBar({
  filters,
  onChange,
  onClear,
}: {
  filters: StockFilterValues
  onChange: (f: StockFilterValues) => void
  onClear?: () => void
}) {
  const hasActive = Object.values(filters).some((v) => v.trim())
  return (
    <Card className="border-2 border-[#005B2E]/20">
      <CardContent className="py-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{f.label}</Label>
              <Input
                type={f.type || 'text'}
                value={filters[f.key]}
                onChange={(e) => onChange({ ...filters, [f.key]: e.target.value })}
                className="h-8 text-sm focus-visible:ring-[#005B2E]"
              />
            </div>
          ))}
        </div>
        {hasActive && onClear && (
          <button onClick={onClear} className="mt-2 text-xs text-[#005B2E] hover:underline">
            Limpar filtros
          </button>
        )}
      </CardContent>
    </Card>
  )
}
