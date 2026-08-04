import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getVaultEntries } from '@/services/pricing-governance'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency, type PriceVault } from '@/lib/pricing-types'
import { Loader2, Lock, Search } from 'lucide-react'

function formatDate(iso: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export function PricingVault() {
  const [entries, setEntries] = useState<PriceVault[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setEntries(await getVaultEntries())
    } catch {
      setEntries([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('price_vault', () => load())

  const filtered = entries.filter((e) => {
    const term = search.toLowerCase().trim()
    if (!term) return true
    return (
      e.product_name?.toLowerCase().includes(term) ||
      e.product_code?.toLowerCase().includes(term) ||
      e.user_name?.toLowerCase().includes(term)
    )
  })

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#C89B3C]/40 bg-gradient-to-br from-[#005B2E]/5 to-transparent">
        <CardContent className="py-4 flex items-center gap-3">
          <Lock className="w-6 h-6 text-[#C89B3C]" />
          <div>
            <h3 className="font-bold text-[#005B2E]">Cofre de Preços</h3>
            <p className="text-xs text-muted-foreground">
              Histórico imutável e permanente de todas as alterações. Nenhum registro pode ser
              excluído.
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por produto, código ou usuário..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {filtered.length > 0 ? (
        <Card className="border-2 border-[#005B2E]/20 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base text-[#005B2E]">
              {filtered.length} registro(s) no cofre
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-2">Versão</th>
                  <th className="text-left px-3 py-2">Produto</th>
                  <th className="text-left px-3 py-2">Usuário</th>
                  <th className="text-right px-3 py-2">Anterior</th>
                  <th className="text-right px-3 py-2">Novo</th>
                  <th className="text-left px-3 py-2 hidden md:table-cell">Motivo</th>
                  <th className="text-left px-3 py-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((v) => (
                  <tr key={v.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-bold">v{v.version_number}</td>
                    <td className="px-3 py-2">
                      <span className="font-medium">{v.product_name}</span>
                      <p className="text-xs text-muted-foreground">{v.product_code}</p>
                    </td>
                    <td className="px-3 py-2">{v.user_name}</td>
                    <td className="text-right px-3 py-2">R$ {formatCurrency(v.previous_value)}</td>
                    <td className="text-right px-3 py-2 font-bold text-[#005B2E]">
                      R$ {formatCurrency(v.new_value)}
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell max-w-[200px] truncate">
                      {v.reason}
                    </td>
                    <td className="px-3 py-2 text-xs">{formatDate(v.created)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Lock className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Cofre vazio</p>
            <p className="text-sm text-muted-foreground mt-1">
              Alterações de preço aparecerão aqui permanentemente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
