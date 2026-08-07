import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGlobalSearch } from '@/hooks/use-global-search'
import { Input } from '@/components/ui/input'
import { Search, Loader2, ArrowRight } from 'lucide-react'

export function GlobalSearchBar() {
  const navigate = useNavigate()
  const { query, setQuery, results, loading, open, setOpen, clear } = useGlobalSearch()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [setOpen])

  const handleSelect = (route: string) => {
    navigate(route)
    clear()
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar em toda a plataforma..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          className="pl-9 pr-4 h-9 text-sm bg-muted/50 border-transparent focus-visible:border-[#005B2E]/30"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>
      {open && query.trim().length >= 2 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {results.length === 0 && !loading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado
            </div>
          ) : (
            <div className="py-1">
              {results.map((r) => (
                <button
                  key={`${r.collection}-${r.id}`}
                  onClick={() => handleSelect(r.route)}
                  className="w-full px-4 py-2 hover:bg-muted flex items-center gap-3 text-left transition-colors"
                >
                  <span className="text-xs font-semibold text-[#005B2E] bg-[#005B2E]/10 px-2 py-0.5 rounded shrink-0 min-w-[80px] text-center">
                    {r.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.label}</div>
                    {r.description && (
                      <div className="text-xs text-muted-foreground truncate">{r.description}</div>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
