import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, History, DollarSign, ArrowRight, FileText } from 'lucide-react'
import {
  getProductHistory,
  getProductCostHistory,
  type ProductCostHistoryRecord,
} from '@/services/products'
import type { Product } from '@/lib/product-types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
}

interface AuditEntry {
  id: string
  action: string
  user_name: string
  created: string
  target_summary: string
}

const ACTION_LABELS: Record<string, string> = {
  create: 'Criado',
  update: 'Editado',
  delete: 'Excluído',
  activate: 'Ativado',
  deactivate: 'Inativado',
  duplicate: 'Duplicado',
}

const METHOD_LABELS: Record<string, string> = {
  weighted_average: 'Custo Médio Ponderado',
  initial: 'Saldo Inicial',
  manual_adjustment: 'Ajuste Manual',
  op_production: 'Ordem de Produção',
  reversal: 'Estorno / Cancelamento',
  nfe_entry: 'Entrada de NF-e',
}

// Rótulos amigáveis em português para composição de custo
const COMPOSITION_LABELS: Record<string, string> = {
  preco_unitario: 'Preço unitário',
  frete_rateado: 'Frete rateado',
  seguro_rateado: 'Seguro rateado',
  despesas_acessorias: 'Outras despesas acessórias',
  desconto_unitario: 'Desconto unitário',
  tributos_nao_recuperaveis: 'Tributos não recuperáveis',
  icms_st_unitario: 'ICMS-ST unitário',
  ipi_unitario: 'IPI unitário',
  verba_unitaria: 'Verba de fornecedor',
  bonificacao: 'Bonificação',
  custo_unitario_composto: 'Custo unitário composto final',
}

function formatCurrency(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00'
  return val.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

function formatCompositionLabel(key: string): string {
  if (COMPOSITION_LABELS[key]) return COMPOSITION_LABELS[key]
  if (key.startsWith('VERBA_') || key.toLowerCase().includes('verba')) {
    return `Verba de fornecedor (${key.replace(/^VERBA_/, '')})`
  }
  return key.replace(/_/g, ' ')
}

export function ProductHistoryDialog({ open, onOpenChange, product }: Props) {
  const [activeTab, setActiveTab] = useState<'cost' | 'audit'>('cost')
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [costEntries, setCostEntries] = useState<ProductCostHistoryRecord[]>([])
  const [loadingAudit, setLoadingAudit] = useState(false)
  const [loadingCost, setLoadingCost] = useState(false)

  useEffect(() => {
    if (open && product) {
      setLoadingAudit(true)
      getProductHistory(product.id)
        .then((res) => setAuditEntries((res.items as unknown as AuditEntry[]) || []))
        .catch(() => setAuditEntries([]))
        .finally(() => setLoadingAudit(false))

      setLoadingCost(true)
      getProductCostHistory(product.id)
        .then((res) => setCostEntries(res.items || []))
        .catch(() => setCostEntries([]))
        .finally(() => setLoadingCost(false))
    }
  }, [open, product])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-[#005B2E] flex items-center gap-2">
            <History className="w-5 h-5" /> Histórico do Produto
          </DialogTitle>
          {product && (
            <p className="text-sm text-muted-foreground">
              {product.name} — Código: <span className="font-semibold">{product.code}</span>
            </p>
          )}
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'cost' | 'audit')}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid grid-cols-2 mb-3">
            <TabsTrigger
              value="cost"
              className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm"
            >
              <DollarSign className="w-4 h-4 text-[#005B2E]" /> Histórico de Custo (
              {costEntries.length})
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm"
            >
              <History className="w-4 h-4 text-muted-foreground" /> Auditoria Cadastral (
              {auditEntries.length})
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: HISTÓRICO DE CUSTO */}
          <TabsContent value="cost" className="flex-1 min-h-0 m-0">
            <ScrollArea className="max-h-[62vh] pr-3">
              {loadingCost ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
                </div>
              ) : costEntries.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <DollarSign className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground">
                    Nenhum recálculo de custo registrado
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    Os registros de custo médio e decomposição analítica são gerados automaticamente
                    pelo motor server-side a cada entrada de nota fiscal de compra ou ordem de
                    produção.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {costEntries.map((rec) => {
                    let parsedComposition: Record<string, any> | null = null
                    if (rec.cost_composition) {
                      if (typeof rec.cost_composition === 'string') {
                        try {
                          parsedComposition = JSON.parse(rec.cost_composition)
                        } catch {
                          parsedComposition = null
                        }
                      } else if (typeof rec.cost_composition === 'object') {
                        parsedComposition = rec.cost_composition as Record<string, any>
                      }
                    }

                    const dateFormatted = rec.date
                      ? new Date(rec.date).toLocaleString('pt-BR')
                      : new Date(rec.created).toLocaleString('pt-BR')

                    return (
                      <div
                        key={rec.id}
                        className="rounded-lg border border-border bg-card p-3.5 space-y-2.5 shadow-sm hover:border-[#005B2E]/40 transition-colors"
                      >
                        {/* Header do registro */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-[#005B2E] text-white hover:bg-[#005B2E] text-xs">
                              {METHOD_LABELS[rec.calculation_method || ''] ||
                                rec.calculation_method ||
                                'Custo Médio'}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-medium">
                              {dateFormatted}
                            </span>
                          </div>
                          {rec.reference_id && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                              <FileText className="w-3 h-3 text-[#005B2E]" />
                              <span>
                                {rec.reference_type || 'Doc'}: {rec.reference_id}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Comparativo de Custos: Anterior -> Novo */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-muted/30 p-2.5 rounded-md text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[11px]">
                              Custo Anterior
                            </span>
                            <span className="font-semibold text-foreground">
                              {formatCurrency(rec.previous_cost)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px] flex items-center gap-1">
                              Novo Custo <ArrowRight className="w-3 h-3 text-emerald-600 inline" />
                            </span>
                            <span className="font-bold text-[#005B2E]">
                              {formatCurrency(rec.new_cost)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px]">
                              Qtd. Entrada
                            </span>
                            <span className="font-semibold text-foreground">
                              {rec.quantity_in !== undefined && rec.quantity_in !== null
                                ? Number(rec.quantity_in).toLocaleString('pt-BR')
                                : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px]">
                              Saldo Resultante
                            </span>
                            <span className="font-semibold text-foreground">
                              {rec.balance_after !== undefined && rec.balance_after !== null
                                ? Number(rec.balance_after).toLocaleString('pt-BR')
                                : '—'}
                            </span>
                          </div>
                        </div>

                        {/* Composição JSON exibida com rótulos amigáveis */}
                        {parsedComposition && Object.keys(parsedComposition).length > 0 && (
                          <div className="pt-1">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                              Composição Analítica do Custo Unitário:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-muted/20 p-2 rounded border border-border/40 text-xs">
                              {Object.entries(parsedComposition).map(([cKey, cVal]) => {
                                const friendlyLabel = formatCompositionLabel(cKey)
                                const isNumber = typeof cVal === 'number'
                                const displayVal = isNumber
                                  ? formatCurrency(cVal)
                                  : typeof cVal === 'object'
                                    ? JSON.stringify(cVal)
                                    : String(cVal)

                                return (
                                  <div
                                    key={cKey}
                                    className="flex items-center justify-between py-0.5 px-1 border-b border-border/20 last:border-0"
                                  >
                                    <span className="text-muted-foreground capitalize">
                                      {friendlyLabel}:
                                    </span>
                                    <span className="font-mono font-medium text-foreground">
                                      {displayVal}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* ABA 2: AUDITORIA CADASTRAL */}
          <TabsContent value="audit" className="flex-1 min-h-0 m-0">
            <ScrollArea className="max-h-[62vh] pr-3">
              {loadingAudit ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
                </div>
              ) : auditEntries.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground">
                    Nenhum evento cadastral registrado
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Eventos de criação, edição cadastral e alterações de status aparecem aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditEntries.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[#005B2E]">
                            {ACTION_LABELS[e.action] || e.action}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(e.created).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm">
                          Por: <span className="font-semibold">{e.user_name || 'Sistema'}</span>
                        </p>
                        {e.target_summary && e.target_summary !== product?.id && (
                          <p className="text-xs text-muted-foreground mt-0.5">{e.target_summary}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
