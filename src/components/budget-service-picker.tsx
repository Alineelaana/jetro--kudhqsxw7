import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Plus } from 'lucide-react'
import { getActiveServicesOffered } from '@/services/services-offered'
import type { ServiceOffered } from '@/lib/service-types'
import type { BudgetServiceItem } from '@/lib/types'

interface BudgetServicePickerProps {
  services: BudgetServiceItem[]
  onChange: (services: BudgetServiceItem[]) => void
}

function parseBR(v: string): number {
  if (!v) return 0
  const s = v.replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.')
  return parseFloat(s) || 0
}

function formatBR(n: number): string {
  return n.toFixed(2).replace('.', ',')
}

export function BudgetServicePicker({ services, onChange }: BudgetServicePickerProps) {
  const [available, setAvailable] = useState<ServiceOffered[]>([])
  const [search, setSearch] = useState('')
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    getActiveServicesOffered()
      .then((data) =>
        setAvailable(Array.isArray(data) ? (data as unknown as ServiceOffered[]) : []),
      )
      .catch(() => setAvailable([]))
  }, [])

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return available
    return available.filter(
      (s) =>
        s?.name?.toLowerCase()?.includes(term) || s?.service_code?.toLowerCase()?.includes(term),
    )
  }, [available, search])

  const selectedIds = useMemo(() => new Set(services.map((s) => s.id)), [services])

  const addService = (s: ServiceOffered) => {
    if (selectedIds.has(s.id)) return
    onChange([
      ...services,
      {
        id: s.id,
        name: s.name,
        service_code: s.service_code || '',
        professional_name: s.professional_name || '',
        service_area: s.service_area || '',
        quantity: 1,
        unit_price: s.value || '',
        tax_value: s.tax_value || '',
      },
    ])
    setShowList(false)
    setSearch('')
  }

  const removeService = (id: string) => onChange(services.filter((s) => s.id !== id))

  const updateField = (id: string, field: keyof BudgetServiceItem, value: string | number) => {
    onChange(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const subtotal = services.reduce(
    (sum, s) => sum + (Number(s.quantity) || 0) * parseBR(s.unit_price),
    0,
  )
  const totalTax = services.reduce(
    (sum, s) => sum + parseBR(s.tax_value || '0') * (Number(s.quantity) || 0),
    0,
  )
  const total = subtotal + totalTax

  return (
    <div className="space-y-3">
      {services.length > 0 && (
        <div className="space-y-2">
          {services.map((s) => {
            const lineTotal =
              (Number(s.quantity) || 0) * parseBR(s.unit_price) +
              parseBR(s.tax_value || '0') * (Number(s.quantity) || 0)
            return (
              <div
                key={s.id}
                className="flex items-center gap-2 p-2 rounded-lg border border-border bg-white"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {s.service_code && (
                      <span className="font-mono text-[#C89B3C]">{s.service_code}</span>
                    )}
                    {s.professional_name && <span>{s.professional_name}</span>}
                    {s.service_area && <span>{s.service_area}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={s.quantity}
                    onChange={(e) => updateField(s.id, 'quantity', Number(e.target.value) || 0)}
                    className="w-16 h-8 text-xs text-center"
                    min="1"
                  />
                  <Input
                    value={s.unit_price}
                    onChange={(e) => updateField(s.id, 'unit_price', e.target.value)}
                    className="w-24 h-8 text-xs"
                    placeholder="R$ 0,00"
                  />
                  <span className="text-sm font-bold text-[#005B2E] whitespace-nowrap w-24 text-right">
                    R$ {formatBR(lineTotal)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeService(s.id)}
                    className="p-1 h-8"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            )
          })}
          <div className="flex items-center justify-between px-2 py-2 bg-[#005B2E]/5 rounded-lg border border-[#005B2E]/20">
            <div className="text-sm">
              <span className="text-muted-foreground">Subtotal: </span>
              <span className="font-bold text-[#005B2E]">R$ {formatBR(subtotal)}</span>
              {totalTax > 0 && (
                <span className="text-muted-foreground ml-2">
                  Impostos: R$ {formatBR(totalTax)}
                </span>
              )}
            </div>
            <span className="text-lg font-black text-[#005B2E]">Total: R$ {formatBR(total)}</span>
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowList(!showList)}
        className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10"
      >
        <Plus className="w-4 h-4 mr-1" />
        Incluir Produto/Serviço
      </Button>

      {showList && (
        <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar serviço..."
              className="pl-10 h-9 text-sm"
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum serviço encontrado
              </p>
            ) : (
              filtered.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => addService(s)}
                  disabled={selectedIds.has(s.id)}
                  className="w-full text-left p-2 rounded border border-border hover:border-[#005B2E] hover:bg-[#005B2E]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.service_code && (
                          <span className="font-mono text-[#C89B3C] mr-2">{s.service_code}</span>
                        )}
                        {s.value && `R$ ${s.value}`}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-[#005B2E] shrink-0" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
