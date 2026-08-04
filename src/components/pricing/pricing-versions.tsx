import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProducts } from '@/services/products'
import { getVaultEntries } from '@/services/pricing-governance'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency, type PriceVault } from '@/lib/pricing-types'
import type { Product } from '@/lib/product-types'
import { canRestoreVersions } from '@/lib/pricing-permissions'
import { Loader2, History, RotateCcw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

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

export function PricingVersions() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [versions, setVersions] = useState<PriceVault[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState('')

  const load = async () => {
    try {
      const [prods, vault] = await Promise.all([
        getProducts(),
        selectedId ? getVaultEntries(selectedId) : Promise.resolve([]),
      ])
      setProducts(prods as unknown as Product[])
      setVersions(vault)
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [selectedId])
  useRealtime('price_vault', () => load())

  const canRestore = canRestoreVersions(user?.role as string)

  const handleRestore = (v: PriceVault) => {
    if (!canRestore) {
      toast({ title: 'Sem permissão para restaurar versões', variant: 'destructive' })
      return
    }
    toast({ title: `Restauração da versão ${v.version_number} requer aprovação` })
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
      {selectedId && versions.length > 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader>
            <CardTitle className="text-base text-[#005B2E] flex items-center gap-2">
              <History className="w-4 h-4" /> Versões — {versions.length} registro(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#01361D] text-white">
                    <th className="text-left px-3 py-2">Versão</th>
                    <th className="text-left px-3 py-2">Data</th>
                    <th className="text-left px-3 py-2">Usuário</th>
                    <th className="text-right px-3 py-2">Valor Anterior</th>
                    <th className="text-right px-3 py-2">Novo Valor</th>
                    <th className="text-left px-3 py-2">Motivo</th>
                    <th className="text-center px-3 py-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map((v) => (
                    <tr key={v.id} className="border-b border-border hover:bg-[#005B2E]/5">
                      <td className="px-3 py-2 font-bold">
                        v{v.version_number}
                        {v.is_restored ? ' ↺' : ''}
                      </td>
                      <td className="px-3 py-2">{formatDate(v.created)}</td>
                      <td className="px-3 py-2">{v.user_name}</td>
                      <td className="text-right px-3 py-2">
                        R$ {formatCurrency(v.previous_value)}
                      </td>
                      <td className="text-right px-3 py-2 font-bold text-[#005B2E]">
                        R$ {formatCurrency(v.new_value)}
                      </td>
                      <td className="px-3 py-2 max-w-[200px] truncate">{v.reason}</td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRestore(v)}
                          disabled={!canRestore}
                          className="text-[#005B2E] hover:bg-[#005B2E]/10"
                          title="Restaurar versão"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      {selectedId && versions.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <History className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma versão registrada</p>
          </CardContent>
        </Card>
      )}
      {!selectedId && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <History className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Selecione um produto para ver as versões</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
