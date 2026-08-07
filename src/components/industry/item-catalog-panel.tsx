import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Package, Loader2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

const ITEM_TYPES = [
  'Não Classificado',
  'Matéria-prima',
  'Embalagem',
  'Produto Acabado',
  'Insumo',
  'Componente',
  'Subproduto',
]

export function ItemCatalogPanel() {
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const load = async () => {
    try {
      const data = await pb.collection('products').getFullList({ sort: '-created' })
      setItems(data as Record<string, unknown>[])
    } catch {
      setItems([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('products', () => load())

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return items.filter((p) => {
      const matchesSearch =
        !term ||
        String(p.name || '')
          .toLowerCase()
          .includes(term) ||
        String(p.code || '')
          .toLowerCase()
          .includes(term)
      const matchesType = typeFilter === 'all' || p.item_type === typeFilter
      return matchesSearch && matchesType
    })
  }, [items, search, typeFilter])

  const updateItemType = async (id: string, itemType: string) => {
    try {
      await pb.collection('products').update(id, { item_type: itemType })
      load()
    } catch {
      /* ignore */
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Package className="w-6 h-6 text-[#005B2E]" />
        <h2 className="text-xl font-black text-foreground">Catálogo de Itens</h2>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar item..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {ITEM_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Card className="border-2 border-[#005B2E]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-4 py-3 font-bold">Código</th>
                <th className="text-left px-4 py-3 font-bold">Nome</th>
                <th className="text-left px-4 py-3 font-bold hidden sm:table-cell">Unidade</th>
                <th className="text-left px-4 py-3 font-bold">Tipo</th>
                <th className="text-center px-4 py-3 font-bold hidden md:table-cell">Industrial</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={String(p.id)} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-bold text-[#C89B3C]">
                      {String(p.code || '—')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{String(p.name || '—')}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{String(p.unit || '—')}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={String(p.item_type || 'Não Classificado')}
                      onValueChange={(v) => updateItemType(String(p.id), v)}
                    >
                      <SelectTrigger className="h-8 text-xs focus-visible:ring-[#005B2E]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ITEM_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    {p.is_industrial ? (
                      <Badge className="bg-[#005B2E] text-white">Sim</Badge>
                    ) : (
                      <Badge variant="outline">Não</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-sm text-muted-foreground">{filtered.length} item(s) encontrado(s)</p>
    </div>
  )
}
