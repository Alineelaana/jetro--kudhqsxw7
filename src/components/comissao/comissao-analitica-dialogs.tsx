import { useState } from 'react'
import { type LancamentoComissao, type StatusApuracaoInfo } from '@/services/comissao-analitica'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  FileText,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Lock,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  Package,
} from 'lucide-react'

// Formatador moeda
function formatMoeda(val: number): string {
  const abs = Math.abs(val)
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs)
  return val < 0 ? `- R$ ${formatted}` : `R$ ${formatted}`
}

function formatData(dataStr?: string): string {
  if (!dataStr) return '—'
  const partes = dataStr.slice(0, 10).split('-')
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  return dataStr
}

// ----------------------------------------------------
// 1. Diálogo de Rastreabilidade e Composição do Cálculo
// ----------------------------------------------------
interface DialogComposicaoProps {
  lancamento: LancamentoComissao | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DialogComposicaoCalculo({ lancamento, open, onOpenChange }: DialogComposicaoProps) {
  if (!lancamento) return null

  const isDevolucao =
    lancamento.tipoOperacao === 'Devolução' || lancamento.tipoOperacao === 'Estorno'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#002817] dark:text-[#E4C46A]" />
            <DialogTitle className="text-base font-bold text-[#002817] dark:text-[#E4C46A]">
              Rastreabilidade e Memória de Cálculo
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Identificação Geral */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-3 rounded-lg">
            <div>
              <span className="text-muted-foreground block text-[11px]">Operação:</span>
              <span className="font-bold">{lancamento.tipoOperacao}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">NF de Origem:</span>
              <span className="font-bold">{lancamento.nf}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Pedido Vinculado:</span>
              <span className="font-bold">{lancamento.pedido}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Título Financeiro:</span>
              <span className="font-bold">{lancamento.titulo}</span>
            </div>
          </div>

          {/* Dados do RCA e Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-border p-3 rounded-lg">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Cliente / Razão Social:
              </span>
              <span className="font-semibold">{lancamento.razaoSocial}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">RCA Responsável:</span>
              <span className="font-semibold">
                {lancamento.rcaCode} — {lancamento.rcaName}
              </span>
            </div>
          </div>

          {/* Memória Matemática */}
          <div className="bg-[#002817]/5 dark:bg-[#002817]/20 border border-[#002817]/20 p-3.5 rounded-lg space-y-2">
            <span className="font-bold text-[#002817] dark:text-[#E4C46A] flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4" />
              Fórmula e Regra de Comissionamento Aplicada
            </span>
            <div className="bg-background border border-border p-2.5 rounded font-mono text-xs">
              {lancamento.formulaCalculo}
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-muted-foreground block">Base Tributável/Elegível:</span>
                <span className="font-bold">{formatMoeda(lancamento.baseComissao)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Alíquota Aplicada:</span>
                <span className="font-bold">{lancamento.percentualComissao.toFixed(3)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Comissão Apurada:</span>
                <span
                  className={`font-bold ${
                    isDevolucao ? 'text-red-600' : 'text-[#002817] dark:text-[#E4C46A]'
                  }`}
                >
                  {formatMoeda(lancamento.valorComissao)}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground italic pt-1">
              Origem do evento: <b>{lancamento.origem}</b> | Regra:{' '}
              <b>{lancamento.regraAplicada}</b>
            </p>
          </div>

          {/* Seção Específica para Devoluções / Estornos */}
          {isDevolucao && lancamento.devolucao && (
            <div className="border border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 p-3.5 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>Auditoria da Devolução e Estorno Vinculado</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground block">NF Venda Original:</span>
                  <span className="font-bold">{lancamento.devolucao.nfVendaOriginal || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">NF de Devolução:</span>
                  <span className="font-bold">{lancamento.devolucao.nfDevolucao || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Data da Devolução:</span>
                  <span>{formatData(lancamento.devolucao.dataDevolucao)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Competência Estorno:</span>
                  <span className="font-bold">{lancamento.devolucao.competenciaEstorno}</span>
                </div>
              </div>

              {lancamento.devolucao.itensDevolvidos &&
                lancamento.devolucao.itensDevolvidos.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-900">
                    <span className="font-semibold block mb-1 text-muted-foreground text-[11px]">
                      Itens / Mercadorias Devolvidas:
                    </span>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {lancamento.devolucao.itensDevolvidos.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-[11px] bg-background/60 p-1.5 rounded"
                        >
                          <span>
                            {it.code} - {it.product} (Qtd: {it.quantity})
                          </span>
                          <span className="font-bold">{formatMoeda(it.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ----------------------------------------------------
// 2. Diálogo de Abertura / Visualização de Documentos
//    (Pedido, NF ou Título)
// ----------------------------------------------------
export interface DocumentoConsulta {
  tipo: 'pedido' | 'nf' | 'titulo'
  codigo: string
  id?: string
  dados?: any
}

interface DialogDocumentoProps {
  documento: DocumentoConsulta | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DialogVisualizacaoDocumento({
  documento,
  open,
  onOpenChange,
}: DialogDocumentoProps) {
  if (!documento) return null

  const titulos = {
    pedido: `Consulta de Pedido de Venda nº ${documento.codigo}`,
    nf: `Consulta de Nota Fiscal nº ${documento.codigo}`,
    titulo: `Consulta de Título a Receber nº ${documento.codigo}`,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#002817] dark:text-[#E4C46A]" />
            <DialogTitle className="text-base font-bold text-[#002817] dark:text-[#E4C46A]">
              {titulos[documento.tipo]}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {documento.dados ? (
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Identificador ERP:
                  </span>
                  <span className="font-mono font-bold">{documento.id || documento.codigo}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Cliente:</span>
                  <span className="font-semibold">
                    {documento.dados.cliente ||
                      documento.dados.client_name ||
                      documento.dados.razao_social ||
                      'Cliente Cadastrado'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Valor Registrado:</span>
                  <span className="font-bold text-[#002817] dark:text-[#E4C46A]">
                    {formatMoeda(
                      parseFloat(
                        documento.dados.total_value ||
                          documento.dados.valor_original ||
                          documento.dados.total_amount ||
                          '0',
                      ),
                    )}
                  </span>
                </div>
              </div>

              {documento.dados.status && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <span className="text-muted-foreground">Situação no Módulo:</span>
                  <Badge variant="outline" className="font-semibold text-xs">
                    {documento.dados.status}
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-muted/30 p-6 rounded-lg text-center space-y-2">
              <p className="font-semibold text-foreground">
                Documento nº {documento.codigo} identificado e integrado ao motor de apuração.
              </p>
              <p className="text-muted-foreground text-xs max-w-md mx-auto">
                Os dados fiscais e financeiros deste documento compõem a base analítica com
                rastreabilidade direta aos lançamentos.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center sm:justify-between">
          <span className="text-[11px] text-muted-foreground">
            Consulta em tempo real — Preserva filtros e posição da tabela.
          </span>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="bg-[#002817] hover:bg-[#00381C] text-white text-xs"
          >
            Concluir Consulta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ----------------------------------------------------
// 3. Diálogo de Gestão de Status e Reabertura de Apuração
// ----------------------------------------------------
interface DialogAcoesApuracaoProps {
  statusInfo: StatusApuracaoInfo
  open: boolean
  onOpenChange: (open: boolean) => void
  onAtualizarStatus: (novoStatus: string, justificativa?: string) => Promise<void>
}

export function DialogAcoesApuracao({
  statusInfo,
  open,
  onOpenChange,
  onAtualizarStatus,
}: DialogAcoesApuracaoProps) {
  const [justificativa, setJustificativa] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [acaoSelecionada, setAcaoSelecionada] = useState<'aprovar' | 'pagar' | 'reabrir' | null>(
    null,
  )

  const executar = async () => {
    if (!acaoSelecionada) return
    if (acaoSelecionada === 'reabrir' && !justificativa.trim()) {
      alert('Por favor, informe a justificativa formal para a reabertura da apuração.')
      return
    }

    setSalvando(true)
    try {
      const mapa = {
        aprovar: 'aprovada',
        pagar: 'paga',
        reabrir: 'reaberta',
      }
      await onAtualizarStatus(mapa[acaoSelecionada], justificativa)
      onOpenChange(false)
      setAcaoSelecionada(null)
      setJustificativa('')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#002817] dark:text-[#E4C46A]" />
            <DialogTitle className="text-base font-bold text-[#002817] dark:text-[#E4C46A]">
              Fluxo de Fechamento e Auditoria
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="bg-muted/40 p-3 rounded-lg space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Competência:</span>
              <span className="font-bold">{statusInfo.competencia}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status Atual:</span>
              <Badge className="font-bold">{statusInfo.statusLabel}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Responsável Apuração:</span>
              <span>{statusInfo.responsavelApuracao || 'Sistema'}</span>
            </div>
            {statusInfo.responsavelAprovacao && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aprovado por:</span>
                <span>{statusInfo.responsavelAprovacao}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Selecione a Ação de Fechamento:</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={acaoSelecionada === 'aprovar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAcaoSelecionada('aprovar')}
                className={`text-xs ${
                  acaoSelecionada === 'aprovar'
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Aprovar
              </Button>

              <Button
                type="button"
                variant={acaoSelecionada === 'pagar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAcaoSelecionada('pagar')}
                className={`text-xs ${
                  acaoSelecionada === 'pagar'
                    ? 'bg-emerald-700 text-white'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Marcar Paga
              </Button>

              <Button
                type="button"
                variant={acaoSelecionada === 'reabrir' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAcaoSelecionada('reabrir')}
                className={`text-xs ${
                  acaoSelecionada === 'reabrir'
                    ? 'bg-rose-700 text-white'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reabrir
              </Button>
            </div>
          </div>

          {acaoSelecionada === 'reabrir' && (
            <div className="space-y-1.5 pt-2 border-t border-border">
              <Label className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                Justificativa Obrigatória para Auditoria:
              </Label>
              <Textarea
                placeholder="Informe o motivo da reabertura para registro no log de conformidade..."
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                className="text-xs min-h-[70px]"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={salvando}
            className="text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={executar}
            disabled={!acaoSelecionada || salvando}
            className="bg-[#002817] hover:bg-[#00381C] text-white text-xs"
          >
            {salvando ? 'Processando...' : 'Confirmar Ação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
