import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useClientAuth } from '@/hooks/use-client-auth'
import pbClient from '@/lib/pocketbase/client-client'
import { LogisticsMap } from '@/components/logistics/logistics-map'
import {
  LogOut,
  ArrowLeft,
  MapPin,
  Package,
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileCheck,
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  Programada: 'bg-blue-100 text-blue-700',
  'Em Trânsito': 'bg-cyan-100 text-cyan-700',
  'Saiu para Entrega': 'bg-indigo-100 text-indigo-700',
  Entregue: 'bg-emerald-100 text-emerald-700',
  Cancelada: 'bg-red-100 text-red-700',
  Devolvida: 'bg-orange-100 text-orange-700',
}

interface DeliveryRecord {
  id: string
  numero_entrega: string
  cliente: string
  endereco: string
  cidade: string
  status: string
  data_prevista: string
  data_realizada: string
  valor_mercadoria: string
  veiculo: string
  motorista: string
  recebedor_nome: string
  recebedor_documento: string
  historico_movimentacoes: Array<
    { evento?: string; status?: string; data?: string; acao?: string } | undefined
  >
  client_id: string
}

export default function ClientTracking() {
  const navigate = useNavigate()
  const { client, isAuthenticated, clientLogout } = useClientAuth()
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([])
  const [occurrences, setOccurrences] = useState<Record<string, unknown>[]>([])
  const [proofs, setProofs] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<DeliveryRecord | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/cliente/login')
      return
    }
    const partnerId = (client as Record<string, unknown>)?.partner_id as string
    if (!partnerId) {
      setLoading(false)
      return
    }
    pbClient
      .collection('partners')
      .getOne(partnerId)
      .then(async (partner) => {
        const p = partner as unknown as Record<string, unknown>
        const name = p.person_type === 'PF' ? (p.full_name as string) : (p.company_name as string)
        const clientId = (client as Record<string, unknown>)?.id as string
        const all = (await pbClient.collection('logistics_deliveries').getFullList({
          sort: '-created',
        })) as unknown as DeliveryRecord[]
        const matched = all.filter(
          (d) => (d.client_id && d.client_id === clientId) || d.cliente === name,
        )
        setDeliveries(matched)
        const [occs, prfs] = await Promise.all([
          pbClient.collection('logistics_occurrences').getFullList({ sort: '-created' }),
          pbClient.collection('logistics_proof_delivery').getFullList({ sort: '-created' }),
        ])
        setOccurrences(occs as unknown as Record<string, unknown>[])
        setProofs(prfs as unknown as Record<string, unknown>[])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [client, isAuthenticated, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (selected) {
    const deliveryOccs = occurrences.filter((o) => o.entrega === selected.numero_entrega)
    const deliveryProofs = proofs.filter((p) => p.entrega === selected.numero_entrega)
    const timeline = (selected.historico_movimentacoes || []).filter(Boolean)

    return (
      <div className="min-h-[calc(100vh-6rem)] bg-gray-50">
        <header className="bg-[#01361D] text-white py-4 px-4 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-lg font-black">Rastreamento — {selected.numero_entrega}</h1>
            <Button
              onClick={() => setSelected(null)}
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6 max-w-3xl space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#C89B3C]">
                  {selected.numero_entrega}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[selected.status] || 'bg-gray-100 text-gray-600'}`}
                >
                  {selected.status}
                </span>
              </div>
              <p className="font-bold text-lg">{selected.cliente}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {selected.endereco || '—'}, {selected.cidade || '—'}
              </p>
              <div className="flex gap-4 text-sm">
                <span>
                  <Clock className="w-3 h-3 inline mr-1" />
                  Prevista:{' '}
                  {selected.data_prevista
                    ? new Date(selected.data_prevista).toLocaleDateString('pt-BR')
                    : '—'}
                </span>
                <span>
                  <Package className="w-3 h-3 inline mr-1" />
                  R$ {selected.valor_mercadoria || '0,00'}
                </span>
              </div>
            </CardContent>
          </Card>

          <LogisticsMap
            query={`${selected.endereco || ''} ${selected.cidade || ''}`.trim()}
            height="250px"
          />

          {timeline.length > 0 && (
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="p-4">
                <h3 className="font-bold text-[#005B2E] mb-3">Linha do Tempo</h3>
                <div className="space-y-2">
                  {timeline.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[#005B2E]" />
                      <span className="flex-1">{t?.evento || t?.status || t?.acao || '—'}</span>
                      {t?.data && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(t.data).toLocaleString('pt-BR')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {deliveryOccs.length > 0 && (
            <Card className="border-2 border-orange-300">
              <CardContent className="p-4">
                <h3 className="font-bold text-orange-600 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Ocorrências
                </h3>
                {deliveryOccs.map((o, i) => (
                  <div key={i} className="text-sm py-1 border-b border-border last:border-0">
                    <span className="font-medium">{o.tipo_ocorrencia || '—'}</span>
                    <p className="text-xs text-muted-foreground">{o.descricao || ''}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {deliveryProofs.length > 0 && (
            <Card className="border-2 border-emerald-300">
              <CardContent className="p-4">
                <h3 className="font-bold text-emerald-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Comprovante de Entrega
                </h3>
                {deliveryProofs.map((p, i) => (
                  <div key={i} className="text-sm space-y-1">
                    <p>
                      <FileCheck className="w-3 h-3 inline mr-1" />
                      Recebedor: {p.recebedor_nome || '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Data:{' '}
                      {p.data_hora ? new Date(String(p.data_hora)).toLocaleString('pt-BR') : '—'}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Link to="/cliente" className="text-sm text-[#005B2E] hover:underline font-bold">
              Voltar ao Portal
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-gray-50">
      <header className="bg-[#01361D] text-white py-4 px-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-lg font-black">Rastreamento de Entregas</h1>
          <Button
            onClick={() => {
              clientLogout()
              navigate('/cliente/login')
            }}
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-3">
        {deliveries.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-muted-foreground">Nenhuma entrega encontrada</p>
            </CardContent>
          </Card>
        ) : (
          deliveries.map((d) => (
            <Card
              key={d.id}
              className="border-2 border-[#005B2E]/20 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelected(d)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#C89B3C]">
                    {d.numero_entrega}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[d.status] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {d.status}
                  </span>
                </div>
                <p className="font-bold">{d.cliente}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {d.endereco || '—'}, {d.cidade || '—'}
                </p>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>
                    Prevista:{' '}
                    {d.data_prevista ? new Date(d.data_prevista).toLocaleDateString('pt-BR') : '—'}
                  </span>
                  <span>R$ {d.valor_mercadoria || '0,00'}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        <div className="text-center pt-2">
          <Link to="/cliente" className="text-sm text-[#005B2E] hover:underline font-bold">
            Voltar ao Portal
          </Link>
        </div>
      </main>
    </div>
  )
}
