import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProducts } from '@/services/products'
import { getVaultEntries } from '@/services/pricing-governance'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency, type PriceVault } from '@/lib/pricing-types'
import type { Product } from '@/lib/product-types'
import { Loader2, Clock, GitCommit } from 'lucide-react'

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

export function PricingTimeline() {
  const [products, setProducts] = useState<Product[]>([])
  const [entries, setEntries] = useState<PriceVault[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState('')

  const load = async () => {
    try {
      const [prods, vault] = await Promise.all([
        getProducts(),
        selectedId ? getVaultEntries(selectedId) : Promise.resolve([]),
      ])
      setProducts(prods as unknown as Product[])
      setEntries(vault)
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [selectedId])
  useRealtime('price_vault', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="focus-visible:ring-[#005B2E]">
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} — {p.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {selectedId && entries.length > 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-[#005B2E]/20" />
              {entries.map((e, i) => (
                <div key={e.id} className="relative mb-6 last:mb-0">
                  <div className="absolute -left-4 top-1 w-4 h-4 rounded-full bg-[#005B2E] border-2 border-white shadow" />
                  <div className="ml-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#005B2E]">v{e.version_number}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(e.created)}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[#005B2E]/10 text-[#005B2E]">
                        {e.user_name}
                      </span>
                      {e.is_restored && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                          Restaurado
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm space-y-0.5">
                      <p>
                        De <strong>R$ {formatCurrency(e.previous_value)}</strong> para{' '}
                        <strong className="text-[#005B2E]">R$ {formatCurrency(e.new_value)}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Margem: {formatCurrency(e.previous_margin)}% →{' '}
                        {formatCurrency(e.new_margin)}% | Custo: R${' '}
                        {formatCurrency(e.previous_cost)} → R$ {formatCurrency(e.new_cost)}
                      </p>
                      <p className="text-xs">
                        <GitCommit className="w-3 h-3 inline mr-1" />
                        {e.reason}
                        {e.justification ? ` — ${e.justification}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {selectedId && entries.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Clock className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Sem histórico de alterações</p>
          </CardContent>
        </Card>
      )}
      {!selectedId && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Clock className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Selecione um produto para ver a linha do tempo</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
