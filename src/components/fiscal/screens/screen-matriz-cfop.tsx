import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Grid,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Search,
  Check,
  ShieldAlert,
  Info,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import pb from '@/lib/pocketbase/client'
import { toast } from '@/hooks/use-toast'
import { FiscalCfopRule, FiscalOperation } from '@/lib/fiscal-cfop-engine'
import { fiscalCfopService } from '@/lib/fiscal-cfop-service'
import {
  CfopValidationReport,
  ValidationFinding,
  validateFiscalCfopRules,
} from '@/lib/fiscal-cfop-validator'
import { formatCfopCode } from '@/lib/fiscal-cfop-table'

export function ScreenMatrizCfop() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [rules, setRules] = useState<FiscalCfopRule[]>([])
  const [operations, setOperations] = useState<FiscalOperation[]>([])
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [validationReport, setValidationReport] = useState<CfopValidationReport | null>(null)
  const [showValidationPanel, setShowValidationPanel] = useState(false)
  const [filterSeverity, setFilterSeverity] = useState<'todos' | 'erro' | 'aviso' | 'info'>('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOperacao, setFilterOperacao] = useState<string>('todas')
  const [filterDestino, setFilterDestino] = useState<string>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<FiscalCfopRule | null>(null)

  const [formData, setFormData] = useState({
    operacao_codigo: 'VENDA_NORMAL',
    empresa_id: '',
    filial_id: '',
    procedencia_item: 'producao_propria' as FiscalCfopRule['procedencia_item'],
    destino_tipo: 'dentro_estado' as FiscalCfopRule['destino_tipo'],
    uf_origem: '',
    uf_destino: '',
    cfop_resultado: '',
    descricao_cfop: '',
    cst_padrao: '00',
    prioridade: 10,
    vigencia_inicio: '2026-01-01',
    vigencia_fim: '',
    ativa: true,
    versao: 1,
    explicacao_padrao: '',
    is_exemplo_didatico: false,
    validado_responsavel_fiscal: false,
    observacoes: '',
  })

  const empresaAtualNome = useMemo(() => {
    const emp = empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)
    return (
      emp?.nome_fantasia ||
      emp?.razao_social ||
      brand?.nomeExibicao ||
      brand?.empresaNome ||
      'Todas as Empresas'
    )
  }, [empresasDisponiveis, empresaAtivaId, brand])

  const loadData = async () => {
    setLoading(true)
    try {
      const [rulesList, opsList] = await Promise.all([
        pb.collection('fiscal_cfop_rules').getFullList<FiscalCfopRule>({
          sort: '-prioridade,operacao_codigo,cfop_resultado',
        }),
        pb.collection('fiscal_operations').getFullList<FiscalOperation>({
          filter: 'ativa = true',
          sort: 'nome',
        }),
      ])
      setRules(rulesList)
      setOperations(opsList)
      // Executa validação de background automática
      const report = validateFiscalCfopRules(rulesList, opsList)
      setValidationReport(report)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar matriz de CFOP',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRunValidation = async () => {
    setValidating(true)
    try {
      const report = await fiscalCfopService.runCfopRulesValidation(empresaAtivaId)
      setValidationReport(report)
      setShowValidationPanel(true)
      if (report.is100PorcentoConsistente && report.totalAchados === 0) {
        toast({
          title: 'Validação Concluída: 100% Consistente!',
          description: 'Nenhum erro, aviso ou inconsistência fiscal detectada.',
        })
      } else if (report.totalErros > 0) {
        toast({
          title: `Validação Concluída com ${report.totalErros} Inconsistência(s) Crítica(s)`,
          description: 'Existem regras conflitantes ou com códigos incompatíveis.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Validação Concluída',
          description: `Regras consistentes sem erros bloqueantes (${report.totalAvisos} aviso(s)).`,
        })
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao executar validação de regras',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setValidating(false)
    }
  }

  // Verifica se uma regra específica é semente com validação oficial
  const isRegraOficialValidada = (r: FiscalCfopRule) => {
    const cfopNorm = r.cfop_resultado?.replace(/\D/g, '')
    const isSemente =
      ['5101', '5102', '6101', '6102'].includes(cfopNorm) && r.operacao_codigo === 'VENDA_NORMAL'
    const temValidacaoOficial =
      r.validado_responsavel_fiscal &&
      (r.observacoes?.includes('Receita Federal') ||
        r.validado_por?.includes('Receita Federal') ||
        (isSemente && !r.is_exemplo_didatico))
    return isSemente && temValidacaoOficial
  }

  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      const matchesSearch =
        r.cfop_resultado.includes(searchTerm) ||
        r.operacao_codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.descricao_cfop && r.descricao_cfop.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.explicacao_padrao &&
          r.explicacao_padrao.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesOp = filterOperacao === 'todas' || r.operacao_codigo === filterOperacao
      const matchesDest = filterDestino === 'todos' || r.destino_tipo === filterDestino

      const matchesEmpresa = !empresaAtivaId || !r.empresa_id || r.empresa_id === empresaAtivaId

      return matchesSearch && matchesOp && matchesDest && matchesEmpresa
    })
  }, [rules, searchTerm, filterOperacao, filterDestino, empresaAtivaId])

  const filteredFindings = useMemo(() => {
    if (!validationReport) return []
    return validationReport.achados.filter((f) => {
      if (filterSeverity === 'todos') return true
      return f.gravidade === filterSeverity
    })
  }, [validationReport, filterSeverity])

  const handleOpenCreate = () => {
    setEditingRule(null)
    setFormData({
      operacao_codigo: operations[0]?.codigo || 'VENDA_NORMAL',
      empresa_id: empresaAtivaId || '',
      filial_id: '',
      procedencia_item: 'producao_propria',
      destino_tipo: 'dentro_estado',
      uf_origem: '',
      uf_destino: '',
      cfop_resultado: '',
      descricao_cfop: '',
      cst_padrao: '00',
      prioridade: 10,
      vigencia_inicio: '2026-01-01',
      vigencia_fim: '',
      ativa: true,
      versao: 1,
      explicacao_padrao: '',
      is_exemplo_didatico: false,
      validado_responsavel_fiscal: false,
      observacoes: '',
    })
    setDialogOpen(true)
  }

  const handleOpenEdit = (rule: FiscalCfopRule) => {
    setEditingRule(rule)
    setFormData({
      operacao_codigo: rule.operacao_codigo,
      empresa_id: rule.empresa_id || '',
      filial_id: rule.filial_id || '',
      procedencia_item: rule.procedencia_item,
      destino_tipo: rule.destino_tipo,
      uf_origem: rule.uf_origem || '',
      uf_destino: rule.uf_destino || '',
      cfop_resultado: rule.cfop_resultado,
      descricao_cfop: rule.descricao_cfop || '',
      cst_padrao: rule.cst_padrao || '00',
      prioridade: rule.prioridade || 10,
      vigencia_inicio: rule.vigencia_inicio || '2026-01-01',
      vigencia_fim: rule.vigencia_fim || '',
      ativa: rule.ativa,
      versao: (rule.versao || 1) + 1,
      explicacao_padrao: rule.explicacao_padrao || '',
      is_exemplo_didatico: Boolean(rule.is_exemplo_didatico),
      validado_responsavel_fiscal: Boolean(rule.validado_responsavel_fiscal),
      observacoes: rule.observacoes || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        cfop_resultado: formData.cfop_resultado.replace(/\D/g, ''),
        prioridade: Number(formData.prioridade),
      }

      if (editingRule) {
        await pb.collection('fiscal_cfop_rules').update(editingRule.id, payload)
        toast({ title: 'Regra de CFOP atualizada com sucesso' })
      } else {
        await pb.collection('fiscal_cfop_rules').create(payload)
        toast({ title: 'Regra de CFOP criada na Matriz' })
      }
      setDialogOpen(false)
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar regra',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const handleValidateFiscal = async (ruleId: string) => {
    try {
      const respNome = brand?.nomeExibicao || 'Responsável Fiscal'
      await fiscalCfopService.validateRuleAsFiscal(ruleId, respNome)
      toast({ title: 'Regra validada formalmente pelo fiscal!' })
      loadData()
    } catch (err: any) {
      toast({
        title: 'Falha ao validar regra',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string, cfop: string) => {
    if (!window.confirm(`Deseja remover a regra do CFOP ${cfop}?`)) return
    try {
      await pb.collection('fiscal_cfop_rules').delete(id)
      toast({ title: 'Regra excluída com sucesso' })
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir regra',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO COM AÇÕES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Grid className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Matriz Fiscal de CFOP
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Camada 3 • Determinação por Item
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Cruza: Operação CGO + Empresa emitente + Procedência do item + Destino + Vigência +
              Prioridade.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <Button
            onClick={handleRunValidation}
            disabled={validating}
            variant="outline"
            className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 font-bold text-xs gap-1.5"
          >
            {validating ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#005B2E]" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#005B2E]" />
            )}
            Validar Regras
          </Button>

          <Button
            onClick={handleOpenCreate}
            className="bg-[#005B2E] hover:bg-[#004222] text-white font-bold text-xs gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nova Regra Fiscal
          </Button>
        </div>
      </div>

      {/* PAINEL DE VALIDAÇÃO AUTOMÁTICA DE CONSISTÊNCIA */}
      {validationReport && (
        <div className="space-y-3">
          {/* Card Resumo do Status de Validação */}
          {validationReport.is100PorcentoConsistente && validationReport.totalAchados === 0 ? (
            <Card className="border-2 border-emerald-300 bg-emerald-50/70 shadow-sm">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">
                        Todas as regras estão consistentes
                      </h2>
                      <Badge className="bg-emerald-600 text-white font-mono text-[10px]">
                        100% Consistente
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-900 mt-0.5">
                      {validationReport.totalRegrasAtivas} regra(s) ativas avaliadas contra a tabela
                      oficial da Receita Federal/SEFAZ. Nenhum código inválido, duplicidade,
                      conflito de prioridade ou incoerência de procedência/destino detectado.
                    </p>
                    <span className="text-[11px] text-emerald-800/80 mt-1 block">
                      Última validação executada em:{' '}
                      {new Date(validationReport.executadoEm).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowValidationPanel(!showValidationPanel)}
                  className="border-emerald-300 text-emerald-900 hover:bg-emerald-100 text-xs shrink-0 self-end md:self-center gap-1"
                >
                  {showValidationPanel ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {showValidationPanel ? 'Recolher Detalhes' : 'Ver Categorias'}
                </Button>
              </CardContent>
            </Card>
          ) : validationReport.totalErros > 0 ? (
            <Card className="border-2 border-rose-300 bg-rose-50/80 shadow-sm">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-bold text-rose-950 uppercase tracking-wide">
                        Inconsistências Detectadas na Matriz ({validationReport.totalErros}{' '}
                        Bloqueante(s))
                      </h2>
                      <Badge variant="destructive" className="font-mono text-[10px]">
                        Bloqueio Ativo
                      </Badge>
                    </div>
                    <p className="text-xs text-rose-900 mt-0.5">
                      Foram detectadas inconsistências que bloqueiam ou distorcem a emissão de notas
                      fiscais (conflito de prioridade, CFOPs incompatíveis ou procedência
                      incorreta).
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-rose-800 font-semibold mt-1">
                      <span>Erros: {validationReport.totalErros}</span>
                      <span>Avisos: {validationReport.totalAvisos}</span>
                      <span>Info: {validationReport.totalInfo}</span>
                      <span className="font-normal text-muted-foreground">
                        | Validado em:{' '}
                        {new Date(validationReport.executadoEm).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowValidationPanel(!showValidationPanel)}
                  className="border-rose-300 text-rose-900 hover:bg-rose-100 text-xs shrink-0 self-end md:self-center gap-1"
                >
                  {showValidationPanel ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {showValidationPanel ? 'Recolher Relatório' : 'Ver Relatório de Achados'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-amber-300 bg-amber-50/80 shadow-sm">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                        Regras Operacionais com {validationReport.totalAvisos} Aviso(s)
                        Preventivo(s)
                      </h2>
                      <Badge className="bg-amber-500 text-white font-mono text-[10px]">
                        Sem Erros Bloqueantes
                      </Badge>
                    </div>
                    <p className="text-xs text-amber-900 mt-0.5">
                      Nenhum erro bloqueante identificado. Avisos fiscais preventivos (regras
                      vencidas ou redundâncias) recomendam saneamento cadastral.
                    </p>
                    <span className="text-[11px] text-amber-800/80 mt-1 block">
                      Validação em: {new Date(validationReport.executadoEm).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowValidationPanel(!showValidationPanel)}
                  className="border-amber-300 text-amber-900 hover:bg-amber-100 text-xs shrink-0 self-end md:self-center gap-1"
                >
                  {showValidationPanel ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {showValidationPanel ? 'Recolher Relatório' : 'Ver Avisos'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Painel Expansível de Detalhes da Validação */}
          {showValidationPanel && (
            <Card className="border border-border shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#005B2E]" />
                    <h3 className="text-xs font-bold uppercase text-foreground">
                      Relatório de Consistência da Matriz de CFOP ({validationReport.totalAchados}{' '}
                      apontamento(s))
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-muted-foreground mr-1">Filtrar:</span>
                    <Button
                      size="sm"
                      variant={filterSeverity === 'todos' ? 'default' : 'outline'}
                      onClick={() => setFilterSeverity('todos')}
                      className={`h-6 text-[10px] px-2 ${filterSeverity === 'todos' ? 'bg-[#005B2E]' : ''}`}
                    >
                      Todos ({validationReport.totalAchados})
                    </Button>
                    <Button
                      size="sm"
                      variant={filterSeverity === 'erro' ? 'default' : 'outline'}
                      onClick={() => setFilterSeverity('erro')}
                      className={`h-6 text-[10px] px-2 ${filterSeverity === 'erro' ? 'bg-rose-600 text-white' : 'text-rose-700'}`}
                    >
                      Erros ({validationReport.totalErros})
                    </Button>
                    <Button
                      size="sm"
                      variant={filterSeverity === 'aviso' ? 'default' : 'outline'}
                      onClick={() => setFilterSeverity('aviso')}
                      className={`h-6 text-[10px] px-2 ${filterSeverity === 'aviso' ? 'bg-amber-600 text-white' : 'text-amber-700'}`}
                    >
                      Avisos ({validationReport.totalAvisos})
                    </Button>
                    <Button
                      size="sm"
                      variant={filterSeverity === 'info' ? 'default' : 'outline'}
                      onClick={() => setFilterSeverity('info')}
                      className={`h-6 text-[10px] px-2 ${filterSeverity === 'info' ? 'bg-blue-600 text-white' : 'text-blue-700'}`}
                    >
                      Info ({validationReport.totalInfo})
                    </Button>
                  </div>
                </div>

                {/* Categorias avaliadas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded bg-muted/40 border">
                    <div className="text-[10px] text-muted-foreground font-medium">
                      CFOP Inválido
                    </div>
                    <div className="text-base font-black text-foreground">
                      {validationReport.resumoPorCategoria.cfop_invalido || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-muted/40 border">
                    <div className="text-[10px] text-muted-foreground font-medium">Duplicidade</div>
                    <div className="text-base font-black text-foreground">
                      {validationReport.resumoPorCategoria.duplicidade_regra || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-muted/40 border">
                    <div className="text-[10px] text-muted-foreground font-medium">Prioridade</div>
                    <div className="text-base font-black text-foreground">
                      {validationReport.resumoPorCategoria.conflito_prioridade || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-muted/40 border">
                    <div className="text-[10px] text-muted-foreground font-medium">
                      Origem x CFOP
                    </div>
                    <div className="text-base font-black text-foreground">
                      {validationReport.resumoPorCategoria.incoerencia_origem || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-muted/40 border">
                    <div className="text-[10px] text-muted-foreground font-medium">
                      Destino x CFOP
                    </div>
                    <div className="text-base font-black text-foreground">
                      {validationReport.resumoPorCategoria.incoerencia_destino || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-muted/40 border">
                    <div className="text-[10px] text-muted-foreground font-medium">
                      Vigência Sobreposta
                    </div>
                    <div className="text-base font-black text-foreground">
                      {validationReport.resumoPorCategoria.vigencia_sobreposta || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-muted/40 border">
                    <div className="text-[10px] text-muted-foreground font-medium">
                      Regra Vencida
                    </div>
                    <div className="text-base font-black text-foreground">
                      {validationReport.resumoPorCategoria.regra_vencida || 0}
                    </div>
                  </div>
                </div>

                {/* Lista de Achados */}
                {filteredFindings.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground bg-muted/20 rounded">
                    Nenhum achado fiscal para a gravidade selecionada.
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    {filteredFindings.map((finding) => (
                      <div
                        key={finding.id}
                        className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                          finding.gravidade === 'erro'
                            ? 'bg-rose-50/50 border-rose-200'
                            : finding.gravidade === 'aviso'
                              ? 'bg-amber-50/50 border-amber-200'
                              : 'bg-blue-50/50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                finding.gravidade === 'erro'
                                  ? 'bg-rose-600 text-white'
                                  : finding.gravidade === 'aviso'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-blue-600 text-white'
                              }
                            >
                              {finding.gravidade.toUpperCase()}
                            </Badge>
                            <span className="font-bold text-foreground">{finding.titulo}</span>
                            <span className="text-[10px] text-muted-foreground">
                              ({finding.categoriaLabel})
                            </span>
                          </div>

                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            {finding.cfopsRelacionados.map((c, i) => (
                              <Badge key={i} variant="outline" className="font-mono font-bold">
                                CFOP {formatCfopCode(c)}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <p className="text-foreground leading-relaxed">{finding.mensagem}</p>

                        <div className="p-2 rounded bg-white/80 border text-[11px] space-y-1">
                          <div className="font-semibold text-muted-foreground">
                            Fundamentação Fiscal / Risco SEFAZ:
                          </div>
                          <p className="text-muted-foreground italic leading-relaxed">
                            {finding.explicacaoFiscal}
                          </p>
                          {finding.sugestaoAcao && (
                            <div className="pt-0.5 text-[#005B2E] font-medium">
                              Sugestão de Ação: {finding.sugestaoAcao}
                            </div>
                          )}
                        </div>

                        {finding.regrasAfetadas.length > 0 && (
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 flex-wrap pt-0.5">
                            <span>Regra(s) afetada(s):</span>
                            {finding.regrasAfetadas.map((r) => (
                              <Badge
                                key={r.id}
                                variant="secondary"
                                className="font-mono text-[9px]"
                              >
                                {r.operacao_codigo} • CFOP {r.cfop_resultado} (id:{' '}
                                {r.id.slice(0, 8)}...)
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* AVISO MANDATÓRIO DE GOVERNANÇA: RESPONSABILIDADE DO RESPONSÁVEL FISCAL */}
      <Card className="border border-blue-200 bg-blue-50/50">
        <CardContent className="p-3.5 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <h4 className="font-bold text-blue-950 uppercase tracking-wide">
              Validação Oficial e Governança Tributária HURAM
            </h4>
            <p className="text-blue-900 leading-relaxed text-[11px]">
              As 4 regras-semente principais (<strong>5.101</strong>, <strong>5.102</strong>,{' '}
              <strong>6.101</strong>, <strong>6.102</strong>) foram conferidas contra a Tabela
              Oficial da Receita Federal/SEFAZ e receberam o selo <em>Validada Oficialmente</em> com
              a distinção legal estrita mantida (produção própria vs mercadoria de terceiros). Casos
              especiais (consumidor final não contribuinte, substituição tributária e benefícios
              fiscais de SP e ES) continuam sob homologação contínua do responsável fiscal da
              empresa.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por CFOP, operação ou texto..."
              className="pl-8 text-xs h-9"
            />
          </div>

          <Select value={filterOperacao} onValueChange={setFilterOperacao}>
            <SelectTrigger className="w-48 text-xs h-9">
              <SelectValue placeholder="Operação Comercial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Operações</SelectItem>
              {operations.map((op) => (
                <SelectItem key={op.codigo} value={op.codigo}>
                  {op.nome} ({op.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterDestino} onValueChange={setFilterDestino}>
            <SelectTrigger className="w-40 text-xs h-9">
              <SelectValue placeholder="Destino" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Destinos</SelectItem>
              <SelectItem value="dentro_estado">Dentro do Estado</SelectItem>
              <SelectItem value="fora_estado">Fora do Estado</SelectItem>
              <SelectItem value="exterior">Exterior</SelectItem>
              <SelectItem value="qualquer">Qualquer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground">
          {filteredRules.length} regra(s) na matriz
        </div>
      </div>

      {/* TABELA DA MATRIZ */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">CFOP</th>
                <th className="py-2.5 px-3">Operação CGO</th>
                <th className="py-2.5 px-3">Procedência do Item</th>
                <th className="py-2.5 px-3">Destino / UF</th>
                <th className="py-2.5 px-3">Prioridade / Vigência</th>
                <th className="py-2.5 px-3">Escopo Empresa</th>
                <th className="py-2.5 px-3">Status / Validação</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted-foreground">
                    Carregando matriz de CFOP...
                  </td>
                </tr>
              ) : filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted-foreground">
                    Nenhuma regra fiscal encontrada para os filtros.
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => {
                  const oficialValidada = isRegraOficialValidada(rule)

                  return (
                    <tr
                      key={rule.id}
                      className={
                        !rule.ativa
                          ? 'opacity-60 bg-muted/20 hover:opacity-90 transition-opacity'
                          : 'hover:bg-muted/20'
                      }
                    >
                      <td className="py-2.5 px-3 font-mono font-black text-base text-[#005B2E]">
                        {formatCfopCode(rule.cfop_resultado)}
                        <span className="block text-[10px] font-normal text-muted-foreground">
                          CST: {rule.cst_padrao || '00'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-foreground block">
                          {rule.operacao_codigo}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {rule.descricao_cfop || 'Sem descrição'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant="outline"
                          className={
                            rule.procedencia_item === 'producao_propria'
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                              : rule.procedencia_item === 'mercadoria_terceiros'
                                ? 'border-amber-300 bg-amber-50 text-amber-800'
                                : 'border-slate-300'
                          }
                        >
                          {rule.procedencia_item === 'producao_propria'
                            ? 'Produção Própria'
                            : rule.procedencia_item === 'mercadoria_terceiros'
                              ? 'Mercadoria Terceiros (Revenda)'
                              : 'Qualquer Procedência'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-foreground block">
                          {rule.destino_tipo === 'dentro_estado'
                            ? 'Dentro do Estado (Interno)'
                            : rule.destino_tipo === 'fora_estado'
                              ? 'Fora do Estado (Interestadual)'
                              : rule.destino_tipo === 'exterior'
                                ? 'Exterior'
                                : 'Qualquer Destino'}
                        </span>
                        {rule.uf_destino && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            UF específica: {rule.uf_destino}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <div>
                          Prio: {rule.prioridade || 10} (v{rule.versao || 1})
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {rule.vigencia_inicio ? `Desde: ${rule.vigencia_inicio}` : 'Permanente'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        {rule.empresa_id ? (
                          <Badge variant="secondary" className="text-[10px] font-bold">
                            Empresa Específica
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Compartilhada
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 px-3 space-y-1">
                        {!rule.ativa ? (
                          <div className="space-y-0.5">
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-900 border-amber-300 text-[10px] font-bold gap-1 shadow-sm"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Aguarda ativação pelo responsável fiscal
                            </Badge>
                            <span className="block text-[9px] text-muted-foreground font-medium">
                              Decisão do Resp. Fiscal
                            </span>
                          </div>
                        ) : oficialValidada ? (
                          <div className="space-y-0.5">
                            <Badge className="bg-[#005B2E] text-white hover:bg-[#004222] text-[10px] font-bold gap-1 shadow-sm">
                              <Sparkles className="w-3 h-3 text-amber-300" />
                              Validada Oficialmente
                            </Badge>
                            <span className="block text-[9px] text-emerald-800 font-medium">
                              Tabela Oficial RFB/SEFAZ
                            </span>
                          </div>
                        ) : rule.is_exemplo_didatico ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 block text-center text-[10px]">
                            Exemplo Didático
                          </Badge>
                        ) : null}

                        {rule.ativa &&
                          !oficialValidada &&
                          (rule.validado_responsavel_fiscal ? (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Validado Fiscal
                            </span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleValidateFiscal(rule.id)}
                              className="h-6 text-[10px] px-2 border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Validar Regra
                            </Button>
                          ))}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(rule)}
                            className="h-7 w-7 p-0"
                            title="Editar Regra"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(rule.id, rule.cfop_resultado)}
                            className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            title="Excluir Regra"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              {editingRule
                ? `Editar Regra CFOP: ${formatCfopCode(editingRule.cfop_resultado)} (v${editingRule.versao || 1})`
                : 'Nova Regra na Matriz Fiscal'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Operação Comercial (CGO) *</Label>
                <Select
                  value={formData.operacao_codigo}
                  onValueChange={(v) => setFormData({ ...formData, operacao_codigo: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operations.map((op) => (
                      <SelectItem key={op.codigo} value={op.codigo}>
                        {op.nome} ({op.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">CFOP Resultado (4 dígitos) *</Label>
                <Input
                  required
                  maxLength={4}
                  value={formData.cfop_resultado}
                  onChange={(e) => setFormData({ ...formData, cfop_resultado: e.target.value })}
                  placeholder="EX: 5101"
                  className="font-mono font-bold text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Procedência do Item *</Label>
                <Select
                  value={formData.procedencia_item}
                  onValueChange={(v: any) => setFormData({ ...formData, procedencia_item: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="producao_propria">Produção do Estabelecimento</SelectItem>
                    <SelectItem value="mercadoria_terceiros">
                      Mercadoria Adquirida de Terceiros (Revenda)
                    </SelectItem>
                    <SelectItem value="materia_prima">Matéria-Prima</SelectItem>
                    <SelectItem value="qualquer">Qualquer Procedência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Destino da Operação *</Label>
                <Select
                  value={formData.destino_tipo}
                  onValueChange={(v: any) => setFormData({ ...formData, destino_tipo: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dentro_estado">Dentro do Estado (Interno)</SelectItem>
                    <SelectItem value="fora_estado">Fora do Estado (Interestadual)</SelectItem>
                    <SelectItem value="exterior">Exterior (Exportação)</SelectItem>
                    <SelectItem value="qualquer">Qualquer Destino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Prioridade (Score Desempate)</Label>
                <Input
                  type="number"
                  value={formData.prioridade}
                  onChange={(e) => setFormData({ ...formData, prioridade: Number(e.target.value) })}
                  className="font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">CST / CSOSN Padrão</Label>
                <Input
                  value={formData.cst_padrao}
                  onChange={(e) => setFormData({ ...formData, cst_padrao: e.target.value })}
                  placeholder="00"
                  className="font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Vigência Início</Label>
                <Input
                  type="date"
                  value={formData.vigencia_inicio}
                  onChange={(e) => setFormData({ ...formData, vigencia_inicio: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Descrição do CFOP</Label>
              <Input
                value={formData.descricao_cfop}
                onChange={(e) => setFormData({ ...formData, descricao_cfop: e.target.value })}
                placeholder="Exemplo: Venda de produção do estabelecimento"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Explicação Automática da Regra</Label>
              <Input
                value={formData.explicacao_padrao}
                onChange={(e) => setFormData({ ...formData, explicacao_padrao: e.target.value })}
                placeholder="Ex: CFOP 5.101 — Produção do estabelecimento, nesta empresa, destino dentro do estado."
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Observações / Fundamentação Legal</Label>
              <Input
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Ex: Conferido contra Convênio S/Nº 1970 e Tabela Oficial SEFAZ."
              />
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={formData.ativa}
                  onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                  className="rounded text-[#005B2E] w-4 h-4"
                />
                Regra Ativa
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={formData.validado_responsavel_fiscal}
                  onChange={(e) =>
                    setFormData({ ...formData, validado_responsavel_fiscal: e.target.checked })
                  }
                  className="rounded text-[#005B2E] w-4 h-4"
                />
                Validado pelo Responsável Fiscal
              </label>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#005B2E] hover:bg-[#004222] text-white font-bold"
              >
                Salvar Regra
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
