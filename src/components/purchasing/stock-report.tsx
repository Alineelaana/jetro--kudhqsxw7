import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProducts } from '@/services/products'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import type { Product } from '@/lib/product-types'
import { printPurchasingReport, exportPurchasingXls } from '@/lib/purchasing-reports-export'
import {
  Search,
  Printer,
  FileDown,
  FileSpreadsheet,
  Loader2,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

function getSituation(p: Product): string {
  if ((p.stock ?? 0) <= 0) return 'Sem estoque'
  if ((p.stock ?? 0) < (p.min_stock ?? 0)) return 'Abaixo do mínimo'
  return 'Estoque OK'
}

export function StockReport() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [situation, setSituation] = useState('all')

  const load = async () => {
    try {
      setProducts(await getProducts())
    } catch {
      setProducts([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('products', () => load())

  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return Array.from(set).sort()
  }, [products])

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return products.filter((p) => {
      const ms =
        !term || p.name?.toLowerCase().includes(term) || p.code?.toLowerCase().includes(term)
      const mc = category === 'all' || p.category === category
      const isBelow = (p.stock ?? 0) <= 0 || (p.stock ?? 0) < (p.min_stock ?? 0)
      const msi =
        situation === 'all' ||
        (situation === 'below' && isBelow) ||
        (situation === 'ok' && !isBelow)
      return ms && mc && msi
    })
  }, [products, search, category, situation])

  const userName = (user?.name as string) || 'Usuário'
  const headers = [
    'Código',
    'Produto',
    'Categoria',
    'Unidade',
    'Estoque Atual',
    'Estoque Mínimo',
    'Situação',
  ]
  const rows = filtered.map((p) => [
    p.code || '—',
    p.name || '—',
    p.category || '—',
    p.unit || '—',
    String(p.stock ?? 0),
    String(p.min_stock ?? 0),
    getSituation(p),
  ])
  const belowCount = filtered.filter((p) => getSituation(p) !== 'Estoque OK').length

  const handlePrint = () => {
    if (!rows.length) {
      toast.error('Sem dados para exportar')
      return
    }
    printPurchasingReport('Relatório de Estoque', headers, rows, userName)
  }
  const handleExcel = () => {
    if (!rows.length) {
      toast.error('Sem dados para exportar')
      return
    }
    exportPurchasingXls('Relatório de Estoque', headers, rows, userName)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Relatório de Estoque</h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="border-[#005B2E] text-[#005B2E]"
          >
            <Printer className="w-4 h-4 mr-2" /> Imprimir
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="border-[#005B2E] text-[#005B2E]"
          >
            <FileDown className="w-4 h-4 mr-2" /> PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleExcel}
            className="border-[#005B2E] text-[#005B2E]"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
          </Button>
        </div>
      </div>
      {belowCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <AlertTriangle className="w-4 h-4" /> {belowCount} produto(s) abaixo do estoque mínimo ou
          sem estoque.
        </div>
      )}
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={situation} onValueChange={setSituation}>
              <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas situações</SelectItem>
                <SelectItem value="below">Abaixo do mínimo</SelectItem>
                <SelectItem value="ok">Estoque OK</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum produto encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  {headers.map((h, i) => (
                    <th key={i} className="text-left px-3 py-3 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const sit = getSituation(p)
                  const below = sit !== 'Estoque OK'
                  return (
                    <tr
                      key={p.id}
                      className={
                        below
                          ? 'bg-amber-50 border-b border-border'
                          : 'border-b border-border hover:bg-[#005B2E]/5'
                      }
                    >
                      <td className="px-3 py-3 text-xs font-mono font-bold text-[#C89B3C]">
                        {p.code || '—'}
                      </td>
                      <td className="px-3 py-3 font-medium">{p.name || '—'}</td>
                      <td className="px-3 py-3 hidden md:table-cell">{p.category || '—'}</td>
                      <td className="px-3 py-3 hidden sm:table-cell">{p.unit || '—'}</td>
                      <td className={`px-3 py-3 font-bold ${below ? 'text-red-600' : ''}`}>
                        {p.stock ?? 0}
                      </td>
                      <td className="px-3 py-3">{p.min_stock ?? 0}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            sit === 'Abaixo do mínimo'
                              ? 'bg-amber-100 text-amber-700'
                              : sit === 'Sem estoque'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {sit}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
