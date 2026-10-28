import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  GitBranch,
  RefreshCw,
  ArrowRight,
  User,
  Sprout,
  Waves,
  Factory,
  Package,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Microscope,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { ExportActions } from '@/components/shared/export-actions'
import {
  traceCompleteChain,
  type BidirectionalTraceabilityResult,
} from '@/services/olive-industry-service'

export function ScreenRastreabilidadeCompleta() {
  const [searchTerm, setSearchTerm] = useState('')
  const [result, setResult] = useState<BidirectionalTraceabilityResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (term?: string) => {
    const query = (term ?? searchTerm).trim()
    if (!query) {
      toast({
        title: 'Informe o lote, tanque, ticket, OP ou laudo a rastrear',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const res = await traceCompleteChain(query)
      setResult(res)
      if (!res.harvestTicket && !res.curingBatch && !res.productionOrder && !res.laudo) {
        toast({
          title: 'Nenhum elo encontrado',
          description: `Nenhum registro corresponde a "${query}".`,
          variant: 'destructive',
        })
      }
    } catch {
      toast({ title: 'Erro ao rastrear cadeia', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // Linha do tempo da cadeia
  const timeline = result
    ? ([
        result.producer && {
          icon: Sprout,
          label: 'Origem Agrícola (Campo)',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
          detail: `${result.producer.name} — Propriedade ${result.producer.property_name}${
            result.producer.cadpro_car ? ` | CAR/CadPro: ${result.producer.cadpro_car}` : ''
          }`,
        },
        result.harvestTicket && {
          icon: Truck,
          label: 'Recebimento de Safra (Ticket de Pesagem)',
          color: 'text-blue-700 bg-blue-50 border-blue-300',
          detail: `Ticket #${result.harvestTicket.ticket_number} | Líquido: ${result.harvestTicket.net_weight_kg} kg | Grade ${result.harvestTicket.quality_grade} | Lote de MP: ${result.harvestTicket.stock_lot_number || 'não gerado'}`,
        },
        result.curingTank &&
          result.curingBatch && {
            icon: Waves,
            label: 'Tanque de Cura & Fermentação',
            color: 'text-cyan-700 bg-cyan-50 border-cyan-300',
            detail: `Tanque ${result.curingTank.code} | Lote ${result.curingBatch.batch_code} | Salmoura: ${result.curingBatch.brine_type.replace(/_/g, ' ')} | Status: ${result.curingBatch.status.replace(/_/g, ' ')}`,
          },
        result.productionOrder && {
          icon: Factory,
          label: 'Ordem de Produção',
          color: 'text-[#005B2E] bg-emerald-50 border-emerald-300',
          detail: `OP #${result.productionOrder.order_number || result.productionOrder.id.slice(0, 8)} | Status: ${result.productionOrder.status || 'N/D'}`,
        },
        result.analysis && {
          icon: Microscope,
          label: 'Análise Laboratorial',
          color: 'text-purple-700 bg-purple-50 border-purple-300',
          detail: `Análise ${result.analysis.analysis_number} | Veredito: ${result.analysis.overall_compliance.replace(/_/g, ' ')} | Liberação: ${result.analysis.batch_release_authorized ? 'Autorizada' : 'Bloqueada'}`,
        },
        result.laudo && {
          icon: FileText,
          label: 'Laudo Técnico (MAPA/RDC)',
          color: 'text-amber-700 bg-amber-50 border-amber-300',
          detail: `Laudo ${result.laudo.laudo_number} | Veredito: ${result.laudo.verdict.replace(/_/g, ' ')}`,
        },
        {
          icon: Package,
          label: 'Lote de Produto Acabado / Embalagem',
          color: 'text-gray-700 bg-gray-50 border-gray-300',
          detail:
            result.laudo?.lot_number ||
            (result.direction === 'reversa'
              ? result.originLot
              : 'Encadeamento disponível a partir do laudo ou OP'),
        },
      ].filter(Boolean) as Array<{ icon: any; label: string; color: string; detail: string }>)
    : []

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Rastreabilidade Completa
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Campo → Tanque → Lote → Embalagem
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Consulta bidirecional: do produto acabado até o produtor agrícola (recall reverso) ou
              do campo até a embalagem.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSearch()}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Rastrear Novamente
          </Button>

          {result && (
            <ExportActions
              title="Rastreabilidade Completa"
              subtitle={`Cadeia completa rastreada a partir de ${result.originLot}`}
              filenamePrefix={`rastreabilidade_${result.originLot}`}
              headers={['Elo da Cadeia', 'Detalhes']}
              data={timeline.map((t) => [t.label, t.detail])}
            />
          )}
        </div>
      </div>

      {/* BUSCA BIDIRECIONAL */}
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2 flex-1 w-full">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Informe lote de acabado, laudo, ticket de safra (SAFRA-TK-...), lote de MP, lote de cura (LCURA-...) ou nº da OP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-9 text-xs bg-background font-mono"
              />
            </div>
            <Button
              size="sm"
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs w-full sm:w-auto"
            >
              {loading ? 'Rastreando...' : 'Rastrear Cadeia Completa'}
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground italic">
            A busca detecta automaticamente o ponto de partida e monta a cadeia completa nas duas
            direções: reversa (do lote acabado até o produtor) e adiante (do ticket de safra até a
            embalagem).
          </p>
        </CardContent>
      </Card>

      {/* RESULTADO DA CADEIA */}
      {result &&
      (result.harvestTicket || result.curingBatch || result.productionOrder || result.laudo) ? (
        <Card className="border shadow-sm">
          <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-[#005B2E]" />
              Cadeia Completa{' '}
              {result.direction === 'reversa'
                ? '(Rastreabilidade Reversa — Recall)'
                : '(Rastreabilidade Adiante — do Campo à Embalagem)'}
            </CardTitle>
            <Badge className="text-[11px] bg-[#005B2E]/10 text-[#005B2E]">
              Origem: {result.originLot}
            </Badge>
          </CardHeader>

          <CardContent className="p-4">
            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-400 via-blue-400 to-gray-300" />

              <div className="space-y-4">
                {timeline.map((step, idx) => {
                  const Icon = step.icon
                  return (
                    <div key={idx} className="relative flex items-start gap-3 pl-0">
                      <div
                        className={`p-1.5 rounded-full border-2 bg-background z-10 ${step.color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className={`flex-1 p-3 rounded-xl border ${step.color}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{step.label}</span>
                          {idx < timeline.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                          )}
                        </div>
                        <p className="text-[11px] text-foreground/90 mt-1">{step.detail}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Perdas registradas na OP da cadeia */}
            {result.lineLosses && result.lineLosses.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Perdas Registradas na OP (
                  {result.lineLosses.length})
                </span>
                {result.lineLosses.slice(0, 5).map((l) => (
                  <div
                    key={l.id}
                    className="text-[11px] text-rose-900 flex items-center justify-between"
                  >
                    <span>
                      {l.phase_name} — {l.loss_type.replace(/_/g, ' ')}: {l.quantity} {l.unit}
                    </span>
                    <span className="font-mono">R$ {(l.total_cost_impact || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Selos de conformidade */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {result.analysis?.batch_release_authorized && (
                <Badge className="text-xs bg-emerald-600 text-white">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Lote Liberado pelo Laboratório
                </Badge>
              )}
              {result.laudo?.rdc_label_compliance && (
                <Badge className="text-xs bg-[#005B2E] text-white">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Rotulagem RDC Conforme
                </Badge>
              )}
              {result.analysis && !result.analysis.batch_release_authorized && (
                <Badge className="text-xs bg-rose-600 text-white">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Lote Retido — Sem Liberação
                  Laboratorial
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ) : searched && !loading ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center space-y-2">
            <User className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-sm font-bold text-foreground">
              Nenhum elo de rastreabilidade encontrado
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Verifique o identificador informado. A rastreabilidade cobre tickets de safra
              (SAFRA-TK-...), lotes de cura (LCURA-...), laudos (LAU-...), lotes de acabado e ordens
              de produção.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center space-y-2">
            <GitBranch className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-sm font-bold text-foreground">
              Informe um identificador para rastrear
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Exemplos: SAFRA-TK-2026-0001 (ticket de safra) • LCURA-2026-001 (lote de cura) •
              LAU-2026-0001 (laudo) • lote do produto acabado • OP-2026-0001.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
