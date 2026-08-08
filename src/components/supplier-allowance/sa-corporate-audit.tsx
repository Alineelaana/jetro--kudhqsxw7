import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { queryLedger, type LedgerQueryResult } from '@/services/verbas-audit'
import { formatBRL } from '@/lib/supplier-allowance-types'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, Search, BarChart3, FileText, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/pocketbase/errors'

const AUDIT_ROLES = ['SUP', 'FINANCEIRO', 'COMERCIAL']

export function SaCorporateAudit() {
  const { userRole } = useAuth()
  const [view, setView] = useState<'summary' | 'analytical'>('summary')
  const [data, setData] = useState<LedgerQueryResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true)
    try {
      setData(await queryLedger(filters))
    } catch (err) {
      setData(null)
      toast.error(getErrorMessage(err))
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])

  if (!AUDIT_ROLES.includes(userRole || '')) {
    return (
      <Card className="border-destructive/30">
        <div className="py-8 text-center">
          <ShieldCheck className="w-10 h-10 text-destructive mx-auto mb-2" />
          <p className="font-bold text-destructive">
            Acesso restrito a Diretoria, Controladoria, Financeiro e Auditoria.
          </p>
        </div>
      </Card>
    )
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const k = data?.kpis
  const kpiCards = k
    ? [
        { l: 'Total Earned', v: formatBRL(k.total_earned) },
        { l: 'Total Recebido', v: formatBRL(k.total_received) },
        { l: 'Aplicado Compras', v: formatBRL(k.total_applied_compras) },
        { l: 'Consumido Trade', v: formatBRL(k.total_consumed_trade) },
        { l: 'Consumido Marketing', v: formatBRL(k.total_consumed_marketing) },
        { l: 'Claims', v: formatBRL(k.total_claims) },
        { l: 'Saldo Disponivel', v: formatBRL(k.total_available) },
        { l: 'ROI', v: `${formatBRL(k.roi)}%` },
      ]
    : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-[#005B2E]">Auditoria Corporativa de Verbas</h3>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={view === 'summary' ? 'default' : 'outline'}
            onClick={() => setView('summary')}
            className={view === 'summary' ? 'bg-[#005B2E]' : ''}
          >
            <BarChart3 className="w-4 h-4 mr-1" /> Resumida
          </Button>
          <Button
            size="sm"
            variant={view === 'analytical' ? 'default' : 'outline'}
            onClick={() => setView('analytical')}
            className={view === 'analytical' ? 'bg-[#005B2E]' : ''}
          >
            <FileText className="w-4 h-4 mr-1" /> Analitica
          </Button>
        </div>
      </div>
      <Card className="border-2 border-[#005B2E]/20 p-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          <Input
            placeholder="Fornecedor"
            value={filters.supplier_name || ''}
            onChange={(e) => setFilters({ ...filters, supplier_name: e.target.value })}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Comprador"
            value={filters.buyer_name || ''}
            onChange={(e) => setFilters({ ...filters, buyer_name: e.target.value })}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Programa"
            value={filters.program || ''}
            onChange={(e) => setFilters({ ...filters, program: e.target.value })}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Campanha"
            value={filters.campaign || ''}
            onChange={(e) => setFilters({ ...filters, campaign: e.target.value })}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Categoria"
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Marca"
            value={filters.brand || ''}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Competencia"
            value={filters.competence_period || ''}
            onChange={(e) => setFilters({ ...filters, competence_period: e.target.value })}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Vendedor"
            value={filters.seller || ''}
            onChange={(e) => setFilters({ ...filters, seller: e.target.value })}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Gerente"
            value={filters.sales_manager || ''}
            onChange={(e) => setFilters({ ...filters, sales_manager: e.target.value })}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Supervisor"
            value={filters.supervisor || ''}
            onChange={(e) => setFilters({ ...filters, supervisor: e.target.value })}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Centro Custo"
            value={filters.cost_center_code || ''}
            onChange={(e) => setFilters({ ...filters, cost_center_code: e.target.value })}
            className="h-8 text-xs"
          />
          <Button size="sm" onClick={load} className="bg-[#005B2E] hover:bg-[#01361D] h-8">
            <Search className="w-3 h-3 mr-1" /> Filtrar
          </Button>
        </div>
      </Card>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {kpiCards.map((kp) => (
          <Card key={kp.l} className="border-l-4 border-[#005B2E] p-2">
            <p className="text-[10px] text-muted-foreground">{kp.l}</p>
            <p className="text-sm font-bold text-[#005B2E]">{kp.v}</p>
          </Card>
        ))}
      </div>
      {view === 'summary' && data && (
        <Card className="border-2 border-[#005B2E]/20 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-2 py-2">Fornecedor</th>
                <th className="text-right px-2 py-2">Earned</th>
                <th className="text-right px-2 py-2">Compras</th>
                <th className="text-right px-2 py-2">Trade</th>
                <th className="text-right px-2 py-2">Marketing</th>
                <th className="text-right px-2 py-2">Bonif.</th>
                <th className="text-right px-2 py-2">Recebido</th>
                <th className="text-right px-2 py-2">Pendente</th>
                <th className="text-right px-2 py-2">Claims</th>
                <th className="text-right px-2 py-2">Disponivel</th>
              </tr>
            </thead>
            <tbody>
              {data.summary.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-6 text-muted-foreground">
                    Nenhum dado encontrado
                  </td>
                </tr>
              ) : (
                data.summary.map((s, i) => (
                  <tr key={i} className="border-b hover:bg-[#005B2E]/5">
                    <td className="px-2 py-2 font-medium">{s.supplier_name}</td>
                    <td className="px-2 py-2 text-right text-emerald-600">{formatBRL(s.earned)}</td>
                    <td className="px-2 py-2 text-right text-purple-600">
                      {formatBRL(s.applied_compras)}
                    </td>
                    <td className="px-2 py-2 text-right text-orange-600">
                      {formatBRL(s.consumed_trade)}
                    </td>
                    <td className="px-2 py-2 text-right text-pink-600">
                      {formatBRL(s.consumed_marketing)}
                    </td>
                    <td className="px-2 py-2 text-right">{formatBRL(s.consumed_bonificacao)}</td>
                    <td className="px-2 py-2 text-right text-blue-600">{formatBRL(s.received)}</td>
                    <td className="px-2 py-2 text-right text-amber-600">
                      {formatBRL(s.pending_receipt)}
                    </td>
                    <td className="px-2 py-2 text-right text-red-600">{formatBRL(s.claim)}</td>
                    <td className="px-2 py-2 text-right font-bold text-[#005B2E]">
                      {formatBRL(s.available)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}
      {view === 'analytical' && data && (
        <Card className="border-2 border-[#005B2E]/20 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-2 py-2">Data</th>
                <th className="text-left px-2 py-2">Fornecedor</th>
                <th className="text-left px-2 py-2 hidden md:table-cell">Comprador</th>
                <th className="text-left px-2 py-2 hidden lg:table-cell">Programa</th>
                <th className="text-left px-2 py-2">Tipo</th>
                <th className="text-left px-2 py-2">Dir</th>
                <th className="text-right px-2 py-2">Valor</th>
                <th className="text-left px-2 py-2 hidden sm:table-cell">Categoria</th>
                <th className="text-left px-2 py-2 hidden lg:table-cell">Documento</th>
                <th className="text-left px-2 py-2 hidden xl:table-cell">Competencia</th>
                <th className="text-left px-2 py-2 hidden xl:table-cell">Workflow</th>
                <th className="text-left px-2 py-2 hidden xl:table-cell">Justificativa</th>
              </tr>
            </thead>
            <tbody>
              {data.analytical.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-6 text-muted-foreground">
                    Nenhuma movimentacao encontrada
                  </td>
                </tr>
              ) : (
                data.analytical.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-[#005B2E]/5">
                    <td className="px-2 py-2 whitespace-nowrap">
                      {m.created ? new Date(m.created).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-2 py-2 font-medium">{m.supplier_name || '—'}</td>
                    <td className="px-2 py-2 hidden md:table-cell">{m.buyer_name || '—'}</td>
                    <td className="px-2 py-2 hidden lg:table-cell">{m.program || '—'}</td>
                    <td className="px-2 py-2 capitalize">{m.movement_type || '—'}</td>
                    <td className="px-2 py-2">
                      <span
                        className={m.direction === 'credito' ? 'text-emerald-600' : 'text-red-600'}
                      >
                        {m.direction === 'credito' ? '↑' : '↓'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right font-bold">R$ {formatBRL(m.value)}</td>
                    <td className="px-2 py-2 hidden sm:table-cell capitalize">
                      {m.category || '—'}
                    </td>
                    <td className="px-2 py-2 hidden lg:table-cell font-mono">
                      {m.document_number || '—'}
                    </td>
                    <td className="px-2 py-2 hidden xl:table-cell">{m.competence_period || '—'}</td>
                    <td className="px-2 py-2 hidden xl:table-cell">{m.workflow_state || '—'}</td>
                    <td className="px-2 py-2 hidden xl:table-cell max-w-[200px] truncate">
                      {m.justification || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
