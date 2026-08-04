import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getStockPickings,
  updateStockPicking,
  createStockPicking,
  getProductsForStock,
} from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { type StockPicking } from '@/lib/stock-types'
import { StockBarcodeInput } from './stock-barcode-input'
import { Loader2, Search, Plus, CheckCircle2, XCircle, ScanBarcode } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  'Aguardando Separação': 'bg-amber-100 text-amber-700',
  'Em Separação': 'bg-blue-100 text-blue-700',
  'Separação Parcial': 'bg-cyan-100 text-cyan-700',
  Separada: 'bg-emerald-100 text-emerald-700',
  'Com Divergência': 'bg-red-100 text-red-700',
  Cancelada: 'bg-gray-100 text-gray-600',
}

interface PickItem {
  produto_nome: string
  produto_codigo: string
  lote: string
  validade: string
  localizacao: string
  quantidade: number
  produto_ok: boolean
  lote_ok: boolean
  validade_ok: boolean
  quantidade_ok: boolean
  localizacao_ok: boolean
}

export function StockPicking() {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<StockPicking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [scanResult, setScanResult] = useState<string | null>(null)

  const load = async () => {
    try {
      setRecords(await getStockPickings())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('stock_pickings', () => load())
  useEffect(() => {
    getProductsForStock()
      .then((p) => setProducts(p as any[]))
      .catch(() => {})
  }, [])

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      (r.numero_separacao || '').toLowerCase().includes(t) ||
      (r.cliente_destino || '').toLowerCase().includes(t) ||
      (r.documento_origem || '').toLowerCase().includes(t)
    )
  })

  const handleScan = (code: string) => {
    const product = products.find((p) => p.ean === code || p.code === code)
    if (product) {
      setScanResult(`✓ Produto encontrado: ${product.name}`)
      toast({ title: 'Produto identificado', description: product.name })
    } else {
      setScanResult(`✗ Produto não encontrado: ${code}`)
      toast({ title: 'Produto não encontrado', variant: 'destructive' })
    }
  }

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateStockPicking(id, { status })
      toast({ title: 'Status atualizado' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }
  const handleNew = async () => {
    try {
      await createStockPicking({
        numero_separacao: `SEP-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        documento_origem: '',
        documento_tipo: 'Manual',
        cliente_destino: '',
        data: new Date().toISOString().split('T')[0],
        prioridade: 'Normal',
        quantidade_itens: 0,
        responsavel: userName,
        status: 'Aguardando Separação',
        itens: [],
      })
      toast({ title: 'Separação criada' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
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
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-3 space-y-2">
          <div className="flex items-center gap-2">
            <ScanBarcode className="w-5 h-5 text-[#005B2E]" />
            <span className="text-sm font-semibold text-[#005B2E]">
              Leitura de Código de Barras
            </span>
          </div>
          <StockBarcodeInput onScan={handleScan} />
          {scanResult && (
            <p
              className={`text-xs ${scanResult.startsWith('✓') ? 'text-emerald-600' : 'text-red-600'}`}
            >
              {scanResult}
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Produto correto
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Lote correto
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Validade OK
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Quantidade
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Localização
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-500" /> Divergência
            </span>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar separação..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Separação
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Número</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Documento</th>
                <th className="text-left px-3 py-2 font-bold">Cliente/Destino</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Prioridade</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Responsável</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">
                    {r.numero_separacao}
                  </td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">
                    {r.documento_origem || '—'}
                  </td>
                  <td className="px-3 py-2 font-medium">{r.cliente_destino || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.prioridade}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.responsavel || '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-1">
                      {r.status === 'Aguardando Separação' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Em Separação')}
                          className="text-blue-600 h-7 text-xs"
                        >
                          Iniciar
                        </Button>
                      )}
                      {r.status === 'Em Separação' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Separada')}
                          className="text-emerald-600 h-7 text-xs"
                        >
                          Concluir
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
