import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getProofDeliveries } from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import { canViewProofDelivery } from '@/lib/logistics-permissions'
import { useAuth } from '@/hooks/use-auth'
import { Search, Loader2, FileCheck } from 'lucide-react'

export function LogisticsProofDelivery() {
  const { user } = useAuth()
  const role = user?.role as string
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setRecords(await getProofDeliveries())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_proof_delivery', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    const cliente = String(r.cliente || '').toLowerCase()
    const entrega = String(r.entrega || '').toLowerCase()
    return !t || cliente.includes(t) || entrega.includes(t)
  })

  if (!canViewProofDelivery(role)) {
    return (
      <Card className="border-2 border-dashed">
        <div className="py-16 text-center">
          <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-bold">Você não tem permissão para visualizar comprovantes.</p>
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

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar comprovante..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <div className="py-16 text-center">
            <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum comprovante encontrado</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <Card key={i} className="border-2 border-[#005B2E]/20 shadow-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck className="w-5 h-5 text-[#005B2E]" />
                <span className="font-bold text-sm">{String(r.entrega || '—')}</span>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Cliente:</span> {String(r.cliente || '—')}
                </p>
                <p>
                  <span className="text-muted-foreground">Recebedor:</span>{' '}
                  {String(r.recebedor_nome || '—')}
                </p>
                <p>
                  <span className="text-muted-foreground">Documento:</span>{' '}
                  {String(r.recebedor_documento || '—')}
                </p>
                <p>
                  <span className="text-muted-foreground">Data/Hora:</span>{' '}
                  {r.data_hora ? new Date(String(r.data_hora)).toLocaleString('pt-BR') : '—'}
                </p>
                {r.observacoes ? (
                  <p className="text-xs text-muted-foreground mt-2">{String(r.observacoes)}</p>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
