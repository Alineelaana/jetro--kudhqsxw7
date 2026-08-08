import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useOrgFilter } from '@/hooks/use-org-filter'
import { useAuth } from '@/hooks/use-auth'
import { ControladoriaExportBar } from '@/components/controladoria/controladoria-export-bar'
import pb from '@/lib/pocketbase/client'

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parseNum(v: unknown): number {
  const n = parseFloat(String(v || '0'))
  return isNaN(n) ? 0 : n
}

export function ControladoriaFluxoCaixa() {
  const { user } = useAuth()
  const { filter: orgFilter } = useOrgFilter()
  const [data, setData] = useState<{
    saldoInicial: number
    entradas: number
    saidas: number
    saldoFinal: number
    aReceber: number
    aPagar: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [recv, pay, mov] = await Promise.all([
          pb
            .collection('financial_receivables')
            .getFullList({ filter: orgFilter || undefined })
            .catch(() => []),
          pb
            .collection('financial_payables')
            .getFullList({ filter: orgFilter || undefined })
            .catch(() => []),
          pb
            .collection('financial_movements')
            .getFullList({ filter: orgFilter || undefined })
            .catch(() => []),
        ])
        const saldoInicial = (mov as Record<string, unknown>[]).reduce(
          (s, m) => s + parseNum(m.entrada) - parseNum(m.saida),
          0,
        )
        const aReceber = (recv as Record<string, unknown>[])
          .filter((r) => !['Recebido', 'Cancelado'].includes(String(r.status)))
          .reduce((s, r) => s + parseNum(r.valor_original), 0)
        const aPagar = (pay as Record<string, unknown>[])
          .filter((r) => !['Pago', 'Cancelado'].includes(String(r.status)))
          .reduce((s, r) => s + parseNum(r.valor_original), 0)
        setData({
          saldoInicial,
          entradas: aReceber,
          saidas: aPagar,
          saldoFinal: saldoInicial + aReceber - aPagar,
          aReceber,
          aPagar,
        })
      } catch {
        /* ignore */
      }
      setLoading(false)
    }
    load()
  }, [orgFilter])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!data) return <p className="text-center py-6 text-muted-foreground">Dados insuficientes.</p>

  const cards = [
    { l: 'Saldo Inicial', v: data.saldoInicial, icon: Wallet, color: 'text-[#005B2E]' },
    { l: 'A Receber', v: data.aReceber, icon: TrendingUp, color: 'text-emerald-600' },
    { l: 'A Pagar', v: data.aPagar, icon: TrendingDown, color: 'text-red-600' },
    {
      l: 'Saldo Projetado',
      v: data.saldoFinal,
      icon: Wallet,
      color: data.saldoFinal >= 0 ? 'text-[#005B2E]' : 'text-red-600',
    },
  ]

  return (
    <div className="space-y-4">
      <ControladoriaExportBar
        title="Fluxo_Caixa"
        headers={['Indicador', 'Valor']}
        rows={cards.map((c) => [c.l, fmt(c.v)])}
        userName={(user?.name as string) || 'Usuário'}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.l} className="border-2 border-[#005B2E]/20">
              <CardContent className="py-3 flex items-center gap-2">
                <Icon className={`w-6 h-6 ${c.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{c.l}</p>
                  <p className={`text-lg font-black ${c.color}`}>R$ {fmt(c.v)}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <h3 className="font-bold text-[#005B2E] mb-2 text-sm">Resumo do Fluxo de Caixa</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between border-b border-border py-1">
              <span className="text-muted-foreground">Saldo Inicial</span>
              <span className="font-bold">R$ {fmt(data.saldoInicial)}</span>
            </div>
            <div className="flex justify-between border-b border-border py-1">
              <span className="text-muted-foreground">(+) Contas a Receber</span>
              <span className="text-emerald-600 font-bold">R$ {fmt(data.entradas)}</span>
            </div>
            <div className="flex justify-between border-b border-border py-1">
              <span className="text-muted-foreground">(-) Contas a Pagar</span>
              <span className="text-red-600 font-bold">R$ {fmt(data.saidas)}</span>
            </div>
            <div className="flex justify-between py-1 font-black text-[#005B2E]">
              <span>Saldo Projetado</span>
              <span>R$ {fmt(data.saldoFinal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
