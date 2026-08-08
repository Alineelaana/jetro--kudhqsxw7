import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRealtime } from '@/hooks/use-realtime'
import { getTmVerbas } from '@/services/tm-verbas'
import { SA_COLLECTIONS } from '@/services/supplier-allowance'
import { formatBRL } from '@/lib/supplier-allowance-types'
import { TmVerbaFilters } from '@/components/trade-marketing/tm-verba-filters'
import { TmVerbaFlow } from '@/components/trade-marketing/tm-verba-flow'
import { TmVerbaLinkDialog } from '@/components/trade-marketing/tm-verba-link-dialog'
import { EMPTY_VERBA_FILTERS, VERBA_STATUS_BADGE } from '@/lib/tm-verbas-types'
import type { TmVerbaRow, TmVerbaFilters as FilterType } from '@/lib/tm-verbas-types'
import pb from '@/lib/pocketbase/client'
import { Loader2, Eye, Link2, HandCoins, Wallet, Lock, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TmVerbasFornecedor() {
  const [verbas, setVerbas] = useState<TmVerbaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterType>(EMPTY_VERBA_FILTERS)
  const [flowVerba, setFlowVerba] = useState<TmVerbaRow | null>(null)
  const [linkVerba, setLinkVerba] = useState<TmVerbaRow | null>(null)
  const [tmActions, setTmActions] = useState<any[]>([])

  const load = async () => {
    try {
      const [data, actions] = await Promise.all([
        getTmVerbas(),
        pb.collection('trade_marketing_actions').getFullList({ sort: '-created' }) as Promise<
          any[]
        >,
      ])
      setVerbas(data)
      setTmActions(actions)
    } catch {
      setVerbas([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime(SA_COLLECTIONS.agreements, () => load())
  useRealtime(SA_COLLECTIONS.accounts, () => load())
  useRealtime(SA_COLLECTIONS.movements, () => load())
  useRealtime('trade_marketing_actions', () => load())

  const filtered = useMemo(
    () =>
      verbas.filter((v) => {
        const f = filters
        if (f.supplier && !v.supplier_name.toLowerCase().includes(f.supplier.toLowerCase()))
          return false
        if (f.brand && !v.brands.includes(f.brand)) return false
        if (f.product && !v.products.some((p) => p.toLowerCase().includes(f.product.toLowerCase())))
          return false
        if (
          f.campaign &&
          !v.campaigns.some((c) => c.toLowerCase().includes(f.campaign.toLowerCase()))
        )
          return false
        if (f.action && !v.actions.some((a) => a.toLowerCase().includes(f.action.toLowerCase())))
          return false
        if (f.status && v.status !== f.status) return false
        if (f.responsible && v.responsible_user !== f.responsible) return false
        if (f.company && !v.company.toLowerCase().includes(f.company.toLowerCase())) return false
        if (f.branch && !v.branch.toLowerCase().includes(f.branch.toLowerCase())) return false
        if (f.startDate && v.start_date < f.startDate) return false
        if (f.endDate && v.start_date > f.endDate) return false
        if (f.validityDate && v.end_date > f.validityDate) return false
        return true
      }),
    [verbas, filters],
  )

  const summary = useMemo(
    () => ({
      captado: filtered.reduce((s, v) => s + (parseFloat(v.value_original) || 0), 0),
      disponivel: filtered.reduce((s, v) => s + (parseFloat(v.current_balance) || 0), 0),
      comprometido: filtered.reduce((s, v) => s + (parseFloat(v.committed_total) || 0), 0),
      gasto: filtered.reduce((s, v) => s + (parseFloat(v.consumed_total) || 0), 0),
    }),
    [filtered],
  )

  const suppliers = [...new Set(verbas.map((v) => v.supplier_name).filter((n) => n && n !== '—'))]
  const brands = [...new Set(verbas.flatMap((v) => v.brands))]
  const responsibles = [...new Set(verbas.map((v) => v.responsible_user).filter(Boolean))]

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const cards = [
    { label: 'Captado', value: summary.captado, icon: HandCoins },
    { label: 'Disponível', value: summary.disponivel, icon: Wallet },
    { label: 'Comprometido', value: summary.comprometido, icon: Lock },
    { label: 'Gasto', value: summary.gasto, icon: TrendingDown },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-[#005B2E]">Verbas por Fornecedor</h3>
        <p className="text-xs text-muted-foreground">
          Verbas captadas de indústrias para campanhas, PDV, catálogos, merchandising, eventos e
          convenções.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Card key={c.label} className="border-l-4 border-[#005B2E]">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-base font-bold text-[#005B2E]">R$ {formatBRL(c.value)}</p>
              </div>
              <c.icon className="w-6 h-6 text-[#005B2E]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <TmVerbaFilters
        filters={filters}
        onFiltersChange={setFilters}
        suppliers={suppliers}
        brands={brands}
        responsibles={responsibles}
      />
      <Card className="border-2 border-[#005B2E]/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#01361D] text-white">
              <th className="text-left px-2 py-2 text-xs">Fornecedor</th>
              <th className="text-left px-2 py-2 text-xs hidden sm:table-cell">Marca</th>
              <th className="text-right px-2 py-2 text-xs">Verba</th>
              <th className="text-right px-2 py-2 text-xs hidden md:table-cell">Recebido</th>
              <th className="text-right px-2 py-2 text-xs hidden md:table-cell">Comprom.</th>
              <th className="text-right px-2 py-2 text-xs">Gasto</th>
              <th className="text-right px-2 py-2 text-xs">Saldo</th>
              <th className="text-left px-2 py-2 text-xs hidden lg:table-cell">Validade</th>
              <th className="text-left px-2 py-2 text-xs hidden lg:table-cell">Resp.</th>
              <th className="text-left px-2 py-2 text-xs">Status</th>
              <th className="text-center px-2 py-2 text-xs">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-8 text-muted-foreground">
                  Nenhuma verba encontrada
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.id} className="border-b hover:bg-[#005B2E]/5">
                  <td className="px-2 py-2 font-medium text-xs">{v.supplier_name}</td>
                  <td className="px-2 py-2 text-xs hidden sm:table-cell">
                    {v.brands.join(', ') || '—'}
                  </td>
                  <td className="px-2 py-2 text-right text-xs font-semibold">
                    {formatBRL(v.value_original)}
                  </td>
                  <td className="px-2 py-2 text-right text-xs hidden md:table-cell text-emerald-600">
                    {formatBRL(v.accrued_total)}
                  </td>
                  <td className="px-2 py-2 text-right text-xs hidden md:table-cell text-amber-600">
                    {formatBRL(v.committed_total)}
                  </td>
                  <td className="px-2 py-2 text-right text-xs text-red-600">
                    {formatBRL(v.consumed_total)}
                  </td>
                  <td className="px-2 py-2 text-right text-xs font-bold text-[#005B2E]">
                    {formatBRL(v.current_balance)}
                  </td>
                  <td className="px-2 py-2 text-xs hidden lg:table-cell">{v.end_date || '—'}</td>
                  <td className="px-2 py-2 text-xs hidden lg:table-cell">
                    {v.responsible_user || '—'}
                  </td>
                  <td className="px-2 py-2">
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        VERBA_STATUS_BADGE[v.status] || 'bg-gray-100 text-gray-700',
                      )}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setFlowVerba(v)}
                      className="h-7 px-2"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setLinkVerba(v)}
                      className="h-7 px-2 text-[#005B2E]"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
      <Dialog
        open={!!flowVerba}
        onOpenChange={(o) => {
          if (!o) setFlowVerba(null)
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              Fluxo da Verba — {flowVerba?.supplier_name}
            </DialogTitle>
          </DialogHeader>
          {flowVerba && <TmVerbaFlow verba={flowVerba} />}
        </DialogContent>
      </Dialog>
      <TmVerbaLinkDialog verba={linkVerba} actions={tmActions} onClose={() => setLinkVerba(null)} />
    </div>
  )
}
