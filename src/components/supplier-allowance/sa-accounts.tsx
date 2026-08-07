import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SA_COLLECTIONS, saGetList } from '@/services/supplier-allowance'
import { useRealtime } from '@/hooks/use-realtime'
import { formatBRL } from '@/lib/supplier-allowance-types'
import { Search, Loader2, Wallet } from 'lucide-react'

export function SaAccounts() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setRecords(await saGetList(SA_COLLECTIONS.accounts))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime(SA_COLLECTIONS.accounts, () => load())
  useRealtime(SA_COLLECTIONS.movements, () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return !q || (r.id || '').includes(q)
  })

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Conta Corrente de Verbas</h3>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar contas..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <Card className="border-2 border-dashed col-span-full">
            <CardContent className="py-16 text-center">
              <Wallet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-bold">Nenhuma conta corrente encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((r) => (
            <Card
              key={r.id}
              className="border-2 border-[#005B2E]/20 hover:shadow-lg transition-shadow"
            >
              <CardContent className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">
                    {r.id.substring(0, 8)}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#005B2E]/10 text-[#005B2E]">
                    CONTA
                  </span>
                </div>
                <div className="space-y-1 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Saldo Atual</span>
                    <span className="font-black text-[#005B2E]">
                      R$ {formatBRL(r.current_balance)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Acumulado</span>
                    <span className="font-bold text-emerald-600">
                      R$ {formatBRL(r.accrued_total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Liquidado</span>
                    <span className="font-bold text-amber-600">
                      R$ {formatBRL(r.settled_total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Consumido</span>
                    <span className="font-bold text-red-600">R$ {formatBRL(r.consumed_total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
