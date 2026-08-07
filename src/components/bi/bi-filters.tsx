import { createContext, useContext, useState, type ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Filter } from 'lucide-react'
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
  const [filters, setFilters] = useState<BIFilters>({})
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
    </div>
  )
}
