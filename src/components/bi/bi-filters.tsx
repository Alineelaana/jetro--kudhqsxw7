import { createContext, useContext, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Filter, X } from 'lucide-react'
import type { BIFilters } from '@/lib/bi-types'

interface BIFilterContextType {
  filters: BIFilters
  setFilters: (f: BIFilters) => void
}

const BIFilterContext = createContext<BIFilterContextType | undefined>(undefined)

export const useBIFilters = () => {
  const ctx = useContext(BIFilterContext)
  if (!ctx) throw new Error('useBIFilters must be used within BIFilterProvider')
  return ctx
}

export const BIFilterProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams] = useSearchParams()
  const entityFromUrl = searchParams.get('entity') || ''
  const areaFromUrl = searchParams.get('area') || ''

  const [filters, setFilters] = useState<BIFilters>({
    entity: entityFromUrl || undefined,
    area: areaFromUrl || undefined,
  })

  return (
    <BIFilterContext.Provider value={{ filters, setFilters }}>{children}</BIFilterContext.Provider>
  )
}

export function BIFilterBar() {
  const { filters, setFilters } = useBIFilters()
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
      <Input
        type="text"
        placeholder="Empresa"
        value={filters.empresa || ''}
        onChange={(e) => setFilters({ ...filters, empresa: e.target.value })}
        className="w-32 h-8 text-sm"
      />
      <Input
        type="text"
        placeholder="Filial"
        value={filters.filial || ''}
        onChange={(e) => setFilters({ ...filters, filial: e.target.value })}
        className="w-32 h-8 text-sm"
      />
      <Input
        type="date"
        value={filters.startDate || ''}
        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        className="w-36 h-8 text-sm"
      />
      <Input
        type="date"
        value={filters.endDate || ''}
        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        className="w-36 h-8 text-sm"
      />
      {filters.entity && (
        <div className="flex items-center gap-1 text-sm bg-[#005B2E]/10 text-[#005B2E] px-2 py-1 rounded font-bold">
          <span>Entidade: {filters.entity}</span>
          <button onClick={() => setFilters({ ...filters, entity: undefined })}>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      {filters.area && (
        <div className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
          <span>Área: {filters.area}</span>
          <button onClick={() => setFilters({ ...filters, area: undefined })}>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}
