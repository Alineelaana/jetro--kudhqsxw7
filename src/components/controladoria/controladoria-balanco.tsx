import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { getPlanoContas } from '@/services/contabil'
import { useOrgFilter } from '@/hooks/use-org-filter'
import { useAuth } from '@/hooks/use-auth'
import { ControladoriaExportBar } from '@/components/controladoria/controladoria-export-bar'
import pb from '@/lib/pocketbase/client'

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const GROUPS = ['Ativo', 'Passivo', 'Patrimônio Líquido']

export function ControladoriaBalanco() {
  const { user } = useAuth()
  const { filter: orgFilter } = useOrgFilter()
  const [contas, setContas] = useState<Record<string, unknown>[]>([])
  const [balances, setBalances] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const contasData = await getPlanoContas()
        setContas(contasData as Record<string, unknown>[])
        const allLanc: Record<string, unknown>[] = []
        let page = 1
        while (true) {
          const res = await pb.collection('contabil_lancamentos').getList(page, 500, {
            filter: orgFilter || undefined,
          })
          allLanc.push(...(res.items as Record<string, unknown>[]))
          if (res.items.length < 500) break
          page++
        }
        const balMap: Record<string, number> = {}
        for (const l of allLanc) {
          const debito = l.conta_debito as string
          const credito = l.conta_credito as string
          const valor = parseFloat(String(l.valor || '0')) || 0
          if (debito) balMap[debito] = (balMap[debito] || 0) + valor
          if (credito) balMap[credito] = (balMap[credito] || 0) - valor
        }
        setBalances(balMap)
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

  const getBalance = (code: string): number => Math.abs(balances[code] || 0)
  const totalAtivo = contas
    .filter((c) => String(c.grupo) === 'Ativo')
    .reduce((s, c) => s + getBalance(String(c.code)), 0)
  const totalPassivo = contas
    .filter((c) => String(c.grupo) === 'Passivo')
    .reduce((s, c) => s + getBalance(String(c.code)), 0)
  const totalPL = contas
    .filter((c) => String(c.grupo) === 'Patrimônio Líquido')
    .reduce((s, c) => s + getBalance(String(c.code)), 0)
  const diff = totalAtivo - totalPassivo - totalPL

  return (
    <div className="space-y-4">
      <ControladoriaExportBar
        title="Balanco_Patrimonial"
        headers={['Código', 'Nome', 'Grupo', 'Saldo']}
        rows={contas.map((c) => [
          String(c.code || '—'),
          String(c.name || '—'),
          String(c.grupo || '—'),
          fmt(getBalance(String(c.code))),
        ])}
        userName={(user?.name as string) || 'Usuário'}
      />
      <Card
        className={`border-2 ${Math.abs(diff) < 0.01 ? 'border-emerald-600/30' : 'border-red-600/30'}`}
      >
        <CardContent className="py-2">
          <span className="text-xs font-medium">
            Total Ativo: R$ {fmt(totalAtivo)} | Total Passivo + PL: R$ {fmt(totalPassivo + totalPL)}{' '}
            | Diferença: R$ {fmt(diff)}
          </span>
        </CardContent>
      </Card>
      {GROUPS.map((grupo) => {
        const groupContas = contas.filter((c) => String(c.grupo) === grupo)
        if (groupContas.length === 0) return null
        const groupTotal = groupContas.reduce((s, c) => s + getBalance(String(c.code)), 0)
        return (
          <Card key={grupo} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-3">
              <h3 className="font-bold text-[#005B2E] mb-2 text-sm">
                {grupo} — R$ {fmt(groupTotal)}
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1 px-2 text-xs text-[#005B2E]">Código</th>
                    <th className="text-left py-1 px-2 text-xs text-[#005B2E]">Nome</th>
                    <th className="text-right py-1 px-2 text-xs text-[#005B2E]">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {groupContas.map((c) => (
                    <tr
                      key={c.id as string}
                      className="border-b border-border hover:bg-[#005B2E]/5"
                    >
                      <td className="py-1 px-2 font-mono text-xs">{String(c.code || '—')}</td>
                      <td className="py-1 px-2">{String(c.name || '—')}</td>
                      <td className="py-1 px-2 text-right font-medium">
                        R$ {fmt(getBalance(String(c.code)))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
