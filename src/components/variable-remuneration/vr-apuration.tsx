import { useState, useEffect } from 'react'
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
import { getApurations, apurateCommissions } from '@/services/variable-remuneration'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canApurate } from '@/lib/variable-remuneration-permissions'
import { formatCurrency, parseNum } from '@/lib/variable-remuneration-types'
import { Loader2, Calculator, Search, FileText } from 'lucide-react'
import { toast } from 'sonner'

export function VrApuration() {
  const { user } = useAuth()
  const [apurations, setApurations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [apurating, setApurating] = useState(false)
  const [filters, setFilters] = useState<Record<string, string>>({
    empresa: '',
    filial: '',
    periodo: '',
    vendedor: '',
    supervisor: '',
    gerente: '',
    coordenador: '',
    fornecedor: '',
    industria: '',
    marca: '',
    categoria: '',
    produto: '',
    cliente: '',
    cidade: '',
    estado: '',
    regiao: '',
    canal: '',
    tipo_pedido: '',
    origem_venda: '',
  })
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setApurations(await getApurations())
    } catch {
      setApurations([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('commission_apurations', () => load())

  const handleApurate = async () => {
    setApurating(true)
    try {
      const result = await apurateCommissions(filters)
      toast.success(`${result?.length || 0} comissões apuradas`)
      load()
    } catch {
      toast.error('Erro ao apurar comissões')
    }
    setApurating(false)
  }

  const filtered = apurations.filter((r) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return Object.values(r).some((v) =>
      String(v || '')
        .toLowerCase()
        .includes(q),
    )
  })

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const filterFields = [
    { name: 'empresa', label: 'Empresa' },
    { name: 'filial', label: 'Filial' },
    { name: 'periodo', label: 'Período' },
    { name: 'vendedor', label: 'Vendedor' },
    { name: 'supervisor', label: 'Supervisor' },
    { name: 'gerente', label: 'Gerente' },
    { name: 'coordenador', label: 'Coordenador' },
    { name: 'fornecedor', label: 'Fornecedor' },
    { name: 'industria', label: 'Indústria' },
    { name: 'marca', label: 'Marca' },
    { name: 'categoria', label: 'Categoria' },
    { name: 'produto', label: 'Produto' },
    { name: 'cliente', label: 'Cliente' },
    { name: 'cidade', label: 'Cidade' },
    { name: 'estado', label: 'Estado' },
    { name: 'regiao', label: 'Região' },
    { name: 'canal', label: 'Canal de Venda' },
    { name: 'tipo_pedido', label: 'Tipo de Pedido' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Apuração de Comissões</h3>
        {canApurate(user?.role) && (
          <Button
            onClick={handleApurate}
            disabled={apurating}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            {apurating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4 mr-2" />
            )}{' '}
            APURAR COMISSÃO
          </Button>
        )}
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filterFields.map((f) => (
              <div key={f.name} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{f.label}</Label>
                <Input
                  value={filters[f.name] || ''}
                  onChange={(e) => setFilters({ ...filters, [f.name]: e.target.value })}
                  placeholder={f.label}
                  className="h-9 text-sm focus-visible:ring-[#005B2E]"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar apuração..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Vendedor</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Competência</th>
                <th className="text-left px-3 py-3 font-bold">Base</th>
                <th className="text-left px-3 py-3 font-bold">Comissão</th>
                <th className="text-left px-3 py-3 font-bold">Situação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-3 font-medium">{r.vendedor_name || '—'}</td>
                  <td className="px-3 py-3 hidden sm:table-cell">{r.competencia || '—'}</td>
                  <td className="px-3 py-3">R$ {formatCurrency(r.base_value)}</td>
                  <td className="px-3 py-3 font-bold text-[#005B2E]">
                    R$ {formatCurrency(r.commission_value)}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${r.situacao === 'paga' ? 'bg-emerald-100 text-emerald-700' : r.situacao === 'pendente' ? 'bg-amber-100 text-amber-700' : r.situacao === 'bloqueada' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
                    >
                      {r.situacao || '—'}
                    </span>
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
