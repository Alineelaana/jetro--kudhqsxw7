import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getNetworkConsolidated, type NetworkConsolidatedData } from '@/services/client-networks'
import {
  Network,
  Wallet,
  AlertTriangle,
  Package,
  Clock,
  TrendingDown,
  Users,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  networkId: string
}

const riskColors: Record<string, string> = {
  Crítico: 'bg-red-100 text-red-700',
  Alto: 'bg-orange-100 text-orange-700',
  Médio: 'bg-yellow-100 text-yellow-700',
  Baixo: 'bg-green-100 text-green-700',
}

export function NetworkConsolidatedView({ open, onOpenChange, networkId }: Props) {
  const [data, setData] = useState<NetworkConsolidatedData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && networkId) {
      setLoading(true)
      getNetworkConsolidated(networkId)
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false))
    } else {
      setData(null)
    }
  }, [open, networkId])

  const fmtCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E] flex items-center gap-2">
            <Network className="w-5 h-5" />
            Visão Consolidada da Rede
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
          </div>
        ) : !data ? (
          <p className="text-center text-muted-foreground py-8">
            Não foi possível carregar os dados da rede.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#005B2E]">{data.network.name}</h3>
                {data.network.corporate_name && (
                  <p className="text-xs text-muted-foreground">{data.network.corporate_name}</p>
                )}
              </div>
              <Badge
                className={cn(
                  'font-bold',
                  riskColors[data.consolidatedRisk] || 'bg-gray-100 text-gray-700',
                )}
              >
                Risco {data.consolidatedRisk}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Card className="border-2 border-[#005B2E]/10">
                <CardContent className="p-2.5 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#005B2E] shrink-0" />
                  <div>
                    <p className="text-sm font-black">{fmtCurrency(data.creditLimit)}</p>
                    <p className="text-[10px] text-muted-foreground">Limite Total</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-red-200">
                <CardContent className="p-2.5 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600 shrink-0" />
                  <div>
                    <p className="text-sm font-black text-red-600">
                      {fmtCurrency(data.creditUsed)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Crédito Usado</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-200">
                <CardContent className="p-2.5 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-black text-green-600">
                      {fmtCurrency(data.creditAvailable)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Disponível</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-[#005B2E]/10">
                <CardContent className="p-2.5 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                  <div>
                    <p className="text-sm font-black">{data.maxDelay} dias</p>
                    <p className="text-[10px] text-muted-foreground">Maior Atraso</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-muted/30 rounded-lg p-2 text-center">
                <p className="text-sm font-bold">{fmtCurrency(data.totalReceivable)}</p>
                <p className="text-[10px] text-muted-foreground">Total a Receber</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <p className="text-sm font-bold text-red-600">{fmtCurrency(data.totalOverdue)}</p>
                <p className="text-[10px] text-muted-foreground">Total Vencido</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <p className="text-sm font-bold text-blue-600">{data.openOrders}</p>
                <p className="text-[10px] text-muted-foreground">Pedidos Abertos</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <p className="text-sm font-bold text-red-600">{data.blockedOrders}</p>
                <p className="text-[10px] text-muted-foreground">Pedidos Bloqueados</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#005B2E] mb-2 flex items-center gap-1">
                <Users className="w-4 h-4" /> Membros ({data.members.length})
              </h4>
              <div className="border-2 border-[#005B2E]/10 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#005B2E]/5">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-bold">Cliente</th>
                      <th className="px-2 py-1.5 text-left font-bold">CNPJ</th>
                      <th className="px-2 py-1.5 text-right font-bold">A Receber</th>
                      <th className="px-2 py-1.5 text-right font-bold">Vencido</th>
                      <th className="px-2 py-1.5 text-right font-bold">Atraso</th>
                      <th className="px-2 py-1.5 text-center font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.members.map((m) => (
                      <tr key={m.id} className="border-t border-border">
                        <td className="px-2 py-1.5 font-medium">{m.name}</td>
                        <td className="px-2 py-1.5 text-muted-foreground">{m.cnpj || '—'}</td>
                        <td className="px-2 py-1.5 text-right">{fmtCurrency(m.totalReceivable)}</td>
                        <td className="px-2 py-1.5 text-right font-bold text-red-600">
                          {fmtCurrency(m.totalOverdue)}
                        </td>
                        <td className="px-2 py-1.5 text-right">{m.maxDelay}d</td>
                        <td className="px-2 py-1.5 text-center">
                          {m.isRestricted ? (
                            <span className="inline-flex items-center gap-0.5 text-red-600 font-bold">
                              <ShieldAlert className="w-3 h-3" /> Restrito
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-green-600 font-bold">
                              <ShieldCheck className="w-3 h-3" /> OK
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {data.network.member_history && data.network.member_history.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-[#005B2E] mb-2">Histórico de Membros</h4>
                <ScrollArea className="h-32 rounded-lg border-2 border-[#005B2E]/10 p-2">
                  <div className="space-y-1">
                    {data.network.member_history
                      .slice()
                      .reverse()
                      .map((h, i) => (
                        <div key={i} className="text-xs flex items-center gap-2">
                          <span
                            className={cn(
                              'font-bold px-1.5 py-0.5 rounded',
                              h.action === 'added'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700',
                            )}
                          >
                            {h.action === 'added' ? 'Adicionado' : 'Removido'}
                          </span>
                          <span className="font-medium">{h.partner_name}</span>
                          <span className="text-muted-foreground">
                            {new Date(h.date).toLocaleDateString('pt-BR')} — {h.user}
                          </span>
                          {h.justification && (
                            <span className="text-muted-foreground italic">
                              ({h.justification})
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {data.members.some((m) => m.isRestricted) && (
              <Card className="border-2 border-red-300 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-sm font-bold text-red-600">
                    Restrição por Grupo Econômico Ativa
                  </p>
                </div>
                <div className="text-xs space-y-0.5">
                  {data.members
                    .filter((m) => m.isRestricted)
                    .map((m) => (
                      <div key={m.id} className="flex items-center gap-2">
                        <span className="font-medium">{m.name}</span>
                        {m.restrictionSource && (
                          <span className="text-muted-foreground">— {m.restrictionSource}</span>
                        )}
                      </div>
                    ))}
                </div>
              </Card>
            )}

            {data.network.observations && (
              <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
                <span className="font-bold">Observações:</span> {data.network.observations}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
