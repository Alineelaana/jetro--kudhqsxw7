import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, X, Package } from 'lucide-react'
import { getActiveServicesOffered } from '@/services/services-offered'
import type { ServiceOffered } from '@/lib/service-types'
import type { ContractService } from '@/lib/contract-types'

interface ServicePickerProps {
  selectedServices: ContractService[]
  onChange: (services: ContractService[]) => void
}

function parseBR(v: string): number {
  if (!v) return 0
  const s = v.replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.')
  return parseFloat(s) || 0
}

export function ServicePicker({ selectedServices, onChange }: ServicePickerProps) {
  const [services, setServices] = useState<ServiceOffered[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getActiveServicesOffered()
      .then((data) => setServices(Array.isArray(data) ? (data as unknown as ServiceOffered[]) : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return services
    return services.filter(
      (s) =>
        s?.name?.toLowerCase()?.includes(term) || s?.service_code?.toLowerCase()?.includes(term),
    )
  }, [services, search])

  const selectedIds = useMemo(() => new Set(selectedServices.map((s) => s.id)), [selectedServices])

  const toggleService = (service: {
    id: string
    name: string
    service_code: string
    value: string
  }) => {
    if (selectedIds.has(service.id)) {
      onChange(selectedServices.filter((s) => s.id !== service.id))
    } else {
      onChange([
        ...selectedServices,
        {
          id: service.id,
          name: service.name,
          service_code: service.service_code || '',
          value: service.value || '',
        },
      ])
    }
  }

  const totalValue = useMemo(
    () => selectedServices.reduce((sum, s) => sum + parseBR(s.value || ''), 0),
    [selectedServices],
  )

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {selectedServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum serviço selecionado.</p>
        ) : (
          selectedServices.map((s) => (
            <Badge key={s.id} className="bg-[#005B2E] text-white gap-1 pr-1">
              {s.name}
              <button
                type="button"
                onClick={() => toggleService(s)}
                className="ml-1 hover:bg-[#01361D] rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar serviço por nome ou código..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>

      <div className="border border-border rounded-lg max-h-[280px] overflow-y-auto divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="py-8 text-center">
            <Package className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum serviço ativo encontrado.</p>
          </div>
        ) : (
          filtered.map((s) => (
            <label
              key={s.id}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#005B2E]/5 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={selectedIds.has(s.id)}
                onCheckedChange={() => toggleService(s)}
                className="data-[state=checked]:bg-[#005B2E] data-[state=checked]:border-[#005B2E]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.name}</p>
                {s.service_code && (
                  <p className="text-xs text-[#C89B3C] font-mono">{s.service_code}</p>
                )}
              </div>
              {s.value && (
                <span className="text-sm font-semibold text-[#005B2E] whitespace-nowrap">
                  R$ {s.value}
                </span>
              )}
            </label>
          ))
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-[#005B2E]/5 rounded-lg border border-[#005B2E]/20">
        <span className="text-sm font-bold text-[#005B2E]">
          {selectedServices.length} serviço(s) selecionado(s)
        </span>
        <span className="text-lg font-black text-[#005B2E]">
          Total: R$ {totalValue.toFixed(2).replace('.', ',')}
        </span>
      </div>
    </div>
  )
}
