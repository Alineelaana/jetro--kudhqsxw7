import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FlaskConical,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Microscope,
  Printer,
  Lock,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { ExportActions } from '@/components/shared/export-actions'
import {
  getLaboratoryAnalyses,
  getLaboratoryAnalysisPlans,
  getLaboratoryLaudos,
  createLaboratoryAnalysis,
  updateLaboratoryAnalysis,
  createLaboratoryLaudo,
  type LaboratoryAnalysis,
  type LaboratoryAnalysisPlan,
  type LaboratoryLaudo,
} from '@/services/olive-industry-service'
import { getProductionOrders } from '@/services/production-orders'

export function ScreenLaboratorioLaudos() {
  const [analyses, setAnalyses] = useState<LaboratoryAnalysis[]>([])
  const [plans, setPlans] = useState<LaboratoryAnalysisPlan[]>([])
  const [laudos, setLaudos] = useState<LaboratoryLaudo[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Diálogos
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false)
  const [laudoModalOpen, setLaudoModalOpen] = useState(false)
  const [viewAnalysisModal, setViewAnalysisModal] = useState<LaboratoryAnalysis | null>(null)

  // Form da análise
  const [analysisFormData, setAnalysisFormData] = useState({
    plan_id: '',
    sample_type: 'lote_acabado' as const,
    production_order_id: '',
    tank_id: '',
    lot_number: '',
    collection_date: new Date().toISOString().slice(0, 16),
    analysis_date: new Date().toISOString().slice(0, 16),
    analyst_name: 'Analista Lab HURAM',
    notes: '',
  })

  // Resultados dinâmicos de parâmetros conforme plano
  const [results, setResults] = useState<
    Array<{
      parameter: string
      unit: string
      min_limit?: number
      max_limit?: number
      result_value: number | string
      method?: string
    }>
  >([])

  // Form do laudo
  const [laudoFormData, setLaudoFormData] = useState({
    analysis_id: '',
    lot_number: '',
    product_id: '',
    production_order_id: '',
    package_type: 'Pote de Vidro 500g',
    manufacturing_date: new Date().toISOString().slice(0, 10),
    expiry_date: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    drained_weight_target_g: 280,
    drained_weight_measured_g: 285,
    net_weight_target_g: 500,
    net_weight_measured_g: 505,
    mapa_registration_number: 'MAPA-SP-2026-00123',
    rdc_label_compliance: true,
    technical_responsible_crq: 'CRF-12345 / CRQ-98765',
    emission_date: new Date().toISOString().slice(0, 10),
    pdf_notes: '',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [anList, plList, laList, ordList] = await Promise.all([
        getLaboratoryAnalyses(),
        getLaboratoryAnalysisPlans(),
        getLaboratoryLaudos(),
        getProductionOrders().catch(() => []),
      ])
      setAnalyses(anList)
      setPlans(plList)
      setLaudos(laList)
      setOrders(ordList)
    } catch {
      toast({ title: 'Erro ao carregar laboratório e laudos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Ao selecionar o plano de análise, carrega os parâmetros dinâmicos
  const handlePlanChange = (planId: string) => {
    const plan = plans.find((p) => p.id === planId)
    const params = (plan?.parameters as any[]) || []
    setResults(
      params.map((par) => ({
        parameter: par.name || par.parameter || 'Parâmetro',
        unit: par.unit || '',
        min_limit: par.min_limit,
        max_limit: par.max_limit,
        method: par.method || '',
        result_value: '',
      })),
    )
    setAnalysisFormData((prev) => ({ ...prev, plan_id: planId }))
  }

  // Veredito automático conforme resultados comparados aos limites
  const autoVerdict = useMemo(() => {
    if (results.length === 0) return 'em_analise'
    const evaluated = results.filter(
      (r) => r.result_value !== '' && r.result_value !== null && !isNaN(Number(r.result_value)),
    )
    if (evaluated.length === 0) return 'em_analise'
    const anyNonCompliant = evaluated.some((r) => {
      const val = Number(r.result_value)
      if (r.min_limit !== undefined && r.min_limit !== null && val < r.min_limit) return true
      if (r.max_limit !== undefined && r.max_limit !== null && val > r.max_limit) return true
      return false
    })
    return anyNonCompliant ? 'nao_conforme' : 'conforme'
  }, [results])

  const handleSaveAnalysis = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!analysisFormData.lot_number) {
      toast({ title: 'Informe o número do lote/tanque analisado', variant: 'destructive' })
      return
    }
    if (results.length === 0) {
      toast({ title: 'Selecione um plano de análise com parâmetros', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const resultsData = results.map((r) => {
        const val = Number(r.result_value)
        const compliant =
          r.result_value === '' || isNaN(val)
            ? false
            : (r.min_limit === undefined || val >= r.min_limit) &&
              (r.max_limit === undefined || val <= r.max_limit)
        return {
          parameter: r.parameter,
          result_value: val,
          unit: r.unit,
          min_limit: r.min_limit,
          max_limit: r.max_limit,
          compliant,
        }
      })

      const analysisNumber = `LAB-${new Date().getFullYear()}-${String(analyses.length + 1).padStart(4, '0')}`

      await createLaboratoryAnalysis({
        analysis_number: analysisNumber,
        plan_id: analysisFormData.plan_id || undefined,
        sample_type: analysisFormData.sample_type,
        production_order_id: analysisFormData.production_order_id || undefined,
        tank_id: analysisFormData.tank_id || undefined,
        lot_number: analysisFormData.lot_number,
        collection_date: new Date(analysisFormData.collection_date).toISOString(),
        analysis_date: new Date(analysisFormData.analysis_date).toISOString(),
        analyst_name: analysisFormData.analyst_name,
        results_data: resultsData,
        overall_compliance: autoVerdict as any,
        non_conformity_reason:
          autoVerdict === 'nao_conforme'
            ? 'Um ou mais parâmetros fora da faixa especificada no plano de análise.'
            : '',
        batch_release_authorized: autoVerdict === 'conforme',
        authorized_by: autoVerdict === 'conforme' ? analysisFormData.analyst_name : '',
        notes: analysisFormData.notes,
      })

      toast({
        title: 'Análise registrada!',
        description: `Veredito automático: ${autoVerdict === 'conforme' ? 'CONFORME — lote liberado para faturamento' : 'NÃO CONFORME — liberação bloqueada'}.`,
      })
      setAnalysisModalOpen(false)
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao registrar análise',
        description: err?.message,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Atualizar liberação manual (bloqueada no backend se não conforme)
  const handleToggleRelease = async (a: LaboratoryAnalysis) => {
    setActionLoading(a.id)
    try {
      await updateLaboratoryAnalysis(a.id, {
        batch_release_authorized: !a.batch_release_authorized,
        authorized_by: !a.batch_release_authorized ? a.analyst_name : '',
      })
      toast({
        title: !a.batch_release_authorized
          ? 'Lote liberado para faturamento!'
          : 'Liberação revogada',
      })
      loadData()
    } catch (err: any) {
      toast({
        title: 'Liberação bloqueada pelo backend',
        description: err?.message || 'Laudo não conforme não pode liberar o lote.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Gerar Laudo
  const handleOpenLaudo = (a: LaboratoryAnalysis) => {
    setLaudoFormData((prev) => ({
      ...prev,
      analysis_id: a.id,
      lot_number: a.lot_number,
      production_order_id: a.production_order_id || '',
    }))
    setLaudoModalOpen(true)
  }

  const handleSaveLaudo = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const laudoNumber = `LAU-${new Date().getFullYear()}-${String(laudos.length + 1).padStart(4, '0')}`
      await createLaboratoryLaudo({
        laudo_number: laudoNumber,
        analysis_id: laudoFormData.analysis_id || undefined,
        lot_number: laudoFormData.lot_number,
        product_id: laudoFormData.product_id || undefined,
        production_order_id: laudoFormData.production_order_id || undefined,
        package_type: laudoFormData.package_type,
        manufacturing_date: new Date(laudoFormData.manufacturing_date).toISOString(),
        expiry_date: new Date(laudoFormData.expiry_date).toISOString(),
        drained_weight_target_g: Number(laudoFormData.drained_weight_target_g),
        drained_weight_measured_g: Number(laudoFormData.drained_weight_measured_g),
        net_weight_target_g: Number(laudoFormData.net_weight_target_g),
        net_weight_measured_g: Number(laudoFormData.net_weight_measured_g),
        mapa_registration_number: laudoFormData.mapa_registration_number,
        rdc_label_compliance: laudoFormData.rdc_label_compliance,
        technical_responsible_crq: laudoFormData.technical_responsible_crq,
        verdict: 'liberado',
        emission_date: new Date(laudoFormData.emission_date).toISOString(),
        pdf_notes: laudoFormData.pdf_notes,
      })
      toast({
        title: 'Laudo emitido!',
        description: `Laudo ${laudoNumber} emitido com assinatura e conformidade RDC.`,
      })
      setLaudoModalOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao emitir laudo', description: err?.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  // Impressão do laudo (abre janela imprimível com o conteúdo estruturado)
  const handlePrintLaudo = (l: LaboratoryLaudo) => {
    const analysis = l.expand?.analysis_id
    const html = `
      <html>
        <head><title>Laudo ${l.laudo_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111 }
            h1 { color: #005B2E; font-size: 20px; margin-bottom: 4px }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px }
            td, th { border: 1px solid #ccc; padding: 6px; text-align: left }
            th { background: #f0f0f0 }
            .header { border-bottom: 3px solid #005B2E; padding-bottom: 12px; margin-bottom: 16px }
            .verdict { padding: 8px 14px; border-radius: 6px; display: inline-block; font-weight: bold; margin-top: 12px }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HURAM — Indústria de Conservas de Azeitona</h1>
            <span style="font-size: 12px; color: #555">Laudo Técnico de Qualidade — ${l.laudo_number}</span>
          </div>
          <table>
            <tr><th>Lote / Embalagem</th><td>${l.lot_number} — ${l.package_type || 'N/D'}</td></tr>
            <tr><th>Produto</th><td>${l.expand?.product_id?.name || 'N/D'}</td></tr>
            <tr><th>Ordem de Produção</th><td>#${l.expand?.production_order_id?.order_number || 'N/D'}</td></tr>
            <tr><th>Registro MAPA</th><td>${l.mapa_registration_number || 'N/D'}</td></tr>
            <tr><th>Data de Fabricação</th><td>${l.manufacturing_date ? new Date(l.manufacturing_date).toLocaleDateString('pt-BR') : 'N/D'}</td></tr>
            <tr><th>Validade</th><td>${l.expiry_date ? new Date(l.expiry_date).toLocaleDateString('pt-BR') : 'N/D'}</td></tr>
            <tr><th>Peso Drenado (Nominal/Aferido)</th><td>${l.drained_weight_target_g || 'N/D'}g / ${l.drained_weight_measured_g || 'N/D'}g</td></tr>
            <tr><th>Peso Líquido (Nominal/Aferido)</th><td>${l.net_weight_target_g || 'N/D'}g / ${l.net_weight_measured_g || 'N/D'}g</td></tr>
            <tr><th>Rotulagem RDC 727/2022</th><td>${l.rdc_label_compliance ? 'CONFORME' : 'NÃO CONFORME'}</td></tr>
            <tr><th>Responsável Técnico</th><td>${l.technical_responsible_crq || 'N/D'}</td></tr>
            ${
              analysis?.results_data
                ? `<tr><th colspan="2" style="background:#e8f5e9">Resultados Analíticos (Plano: ${analysis.expand?.plan_id?.title || analysis.analysis_number})</th></tr>
                 ${(analysis.results_data as any[])
                   .map(
                     (r: any) =>
                       `<tr><td>${r.parameter} (${r.unit || ''})</td><td>${r.result_value} — limites: ${r.min_limit ?? '—'} a ${r.max_limit ?? '—'} ${r.compliant ? '✓' : '✗ NÃO CONFORME'}</td></tr>`,
                   )
                   .join('')}`
                : ''
            }
          </table>
          <div class="verdict" style="background: ${l.verdict === 'liberado' ? '#dcfce7; color:#166534' : l.verdict === 'reprovado_descarte' ? '#fee2e2; color:#991b1b' : '#fef9c3; color:#854d0e'}">
            VEREDITO: ${l.verdict.toUpperCase().replace(/_/g, ' ')}
          </div>
          <p style="margin-top: 24px; font-size: 11px; color: #666">
            Documento gerado eletronicamente pelo ERP HURAM em ${new Date(l.emission_date).toLocaleDateString('pt-BR')}.
            ${l.digital_signature_hash ? `Assinatura digital: ${l.digital_signature_hash.slice(0, 24)}...` : ''}
          </p>
          <script>window.print()</script>
        </body>
      </html>
    `
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(html)
      w.document.close()
    }
  }

  // Filtragem
  const filteredAnalyses = useMemo(() => {
    return analyses.filter((a) => {
      return (
        a.analysis_number.toLowerCase().includes(search.toLowerCase()) ||
        a.lot_number.toLowerCase().includes(search.toLowerCase()) ||
        (a.expand?.plan_id?.title || '').toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [analyses, search])

  const stats = useMemo(() => {
    const conformes = analyses.filter((a) => a.overall_compliance === 'conforme').length
    const naoConformes = analyses.filter((a) => a.overall_compliance === 'nao_conforme').length
    const liberados = analyses.filter((a) => a.batch_release_authorized).length
    const laudosEmitidos = laudos.filter((l) => l.verdict === 'liberado').length
    return { conformes, naoConformes, liberados, laudosEmitidos }
  }, [analyses, laudos])

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-700 text-white shadow-sm">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Laboratório & Laudos
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-purple-50 text-purple-700 font-bold border-purple-200"
              >
                Controle Físico-Químico & Microbiológico
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Planos de análise, veredito automático por limites e liberação de lotes com laudo
              conforme (MAPA / RDC 727).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => setAnalysisModalOpen(true)}
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Nova Análise Laboratorial
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <ExportActions
            title="Laboratório e Laudos"
            subtitle="Análises físico-químicas e microbiológicas de lotes e tanques"
            filenamePrefix="laboratorio_analises_huram"
            headers={[
              'Análise',
              'Lote',
              'Tipo de Amostra',
              'Plano',
              'Data',
              'Analista',
              'Veredito',
              'Liberado',
            ]}
            data={filteredAnalyses.map((a) => [
              a.analysis_number,
              a.lot_number,
              a.sample_type,
              a.expand?.plan_id?.title || '',
              a.analysis_date,
              a.analyst_name,
              a.overall_compliance,
              a.batch_release_authorized ? 'Sim' : 'Não',
            ])}
          />
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-2 border-emerald-200 bg-emerald-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-emerald-900">Análises Conformes</span>
            <span className="text-2xl font-black text-emerald-700 block mt-1">
              {stats.conformes}
            </span>
            <span className="text-[10px] text-muted-foreground">Dentro da especificação</span>
          </CardContent>
        </Card>

        <Card className="border-2 border-rose-200 bg-rose-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-rose-900">Não Conformidades</span>
            <span className="text-2xl font-black text-rose-700 block mt-1">
              {stats.naoConformes}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Liberação bloqueada pelo sistema
            </span>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-blue-900">Lotes Liberados</span>
            <span className="text-2xl font-black text-blue-700 block mt-1">{stats.liberados}</span>
            <span className="text-[10px] text-muted-foreground">Autorizados ao faturamento</span>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-purple-900">Laudos Ativos</span>
            <span className="text-2xl font-black text-purple-700 block mt-1">
              {stats.laudosEmitidos}
            </span>
            <span className="text-[10px] text-muted-foreground">Liberados com RDC 727/2022</span>
          </CardContent>
        </Card>
      </div>

      {/* FILTROS */}
      <div className="bg-muted/30 p-2.5 rounded-xl border">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por análise, lote ou plano..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs bg-background max-w-sm"
          />
        </div>
      </div>

      {/* TABELA DE ANÁLISES */}
      <Card className="border shadow-sm">
        <CardHeader className="py-3 px-4 border-b bg-muted/20">
          <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Microscope className="w-4 h-4 text-purple-600" /> Análises Registradas e Liberação de
            Lotes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-bold">Análise</TableHead>
                <TableHead className="text-xs font-bold">Plano / Tipo de Amostra</TableHead>
                <TableHead className="text-xs font-bold">Lote / Tanque</TableHead>
                <TableHead className="text-xs font-bold">Data / Analista</TableHead>
                <TableHead className="text-xs font-bold text-center">Veredito Automático</TableHead>
                <TableHead className="text-xs font-bold text-center">Liberação do Lote</TableHead>
                <TableHead className="text-xs font-bold text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnalyses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                    Nenhuma análise registrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnalyses.map((a) => {
                  const isNc = a.overall_compliance === 'nao_conforme'
                  return (
                    <TableRow key={a.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono font-bold text-xs text-purple-800">
                        {a.analysis_number}
                      </TableCell>

                      <TableCell className="text-xs">
                        <strong className="block text-foreground">
                          {a.expand?.plan_id?.title || 'Plano avulso'}
                        </strong>
                        <Badge variant="outline" className="text-[10px] capitalize mt-0.5">
                          {a.sample_type.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs font-mono">{a.lot_number}</TableCell>

                      <TableCell className="text-xs">
                        {new Date(a.analysis_date).toLocaleDateString('pt-BR')}
                        <div className="text-[10px] text-muted-foreground">{a.analyst_name}</div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-xs font-bold ${
                            a.overall_compliance === 'conforme'
                              ? 'bg-emerald-600 text-white'
                              : a.overall_compliance === 'nao_conforme'
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-500 text-white'
                          }`}
                        >
                          {a.overall_compliance === 'conforme' ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Conforme
                            </span>
                          ) : a.overall_compliance === 'nao_conforme' ? (
                            <span className="flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> N/Conforme
                            </span>
                          ) : (
                            'Em Análise'
                          )}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        {a.batch_release_authorized ? (
                          <Badge className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Liberado
                          </Badge>
                        ) : (
                          <Badge className="text-[11px] bg-rose-100 text-rose-800 border border-rose-300">
                            <Lock className="w-3 h-3 mr-1" /> Bloqueado
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewAnalysisModal(a)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-600"
                            title="Ver resultados detalhados"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Button>

                          {a.overall_compliance !== 'nao_conforme' &&
                            a.overall_compliance !== 'em_analise' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleRelease(a)}
                                disabled={actionLoading === a.id}
                                className="h-7 text-[10px] text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                              >
                                {a.batch_release_authorized ? 'Revogar' : 'Liberar Lote'}
                              </Button>
                            )}

                          {a.overall_compliance !== 'em_analise' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenLaudo(a)}
                              disabled={a.overall_compliance === 'nao_conforme'}
                              className="h-7 text-[10px] text-purple-800 border-purple-300 hover:bg-purple-50"
                              title={
                                a.overall_compliance === 'nao_conforme'
                                  ? 'Laudo de liberação exige análise conforme'
                                  : 'Emitir laudo técnico'
                              }
                            >
                              Laudo
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* LAUDOS EMITIDOS */}
      <Card className="border shadow-sm">
        <CardHeader className="py-3 px-4 border-b bg-muted/20">
          <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#005B2E]" /> Laudos Técnicos Emitidos (Imprimíveis)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-bold">Laudo</TableHead>
                <TableHead className="text-xs font-bold">Lote / Embalagem</TableHead>
                <TableHead className="text-xs font-bold">Validade</TableHead>
                <TableHead className="text-xs font-bold">Registro MAPA</TableHead>
                <TableHead className="text-xs font-bold text-center">Rotulagem RDC</TableHead>
                <TableHead className="text-xs font-bold text-center">Veredito</TableHead>
                <TableHead className="text-xs font-bold text-center">Imprimir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laudos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">
                    Nenhum laudo técnico emitido.
                  </TableCell>
                </TableRow>
              ) : (
                laudos.map((l) => (
                  <TableRow key={l.id} className="hover:bg-muted/20">
                    <TableCell className="font-mono font-bold text-xs text-[#005B2E]">
                      {l.laudo_number}
                    </TableCell>
                    <TableCell className="text-xs">
                      <strong className="block">{l.lot_number}</strong>
                      <span className="text-[10px] text-muted-foreground">{l.package_type}</span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {l.expiry_date ? new Date(l.expiry_date).toLocaleDateString('pt-BR') : 'N/D'}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[11px]">
                      {l.mapa_registration_number || 'N/D'}
                    </TableCell>
                    <TableCell className="text-center">
                      {l.rdc_label_compliance ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-emerald-700 border-emerald-300"
                        >
                          Conforme
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-rose-700 border-rose-300"
                        >
                          Não conforme
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`text-[11px] font-bold ${
                          l.verdict === 'liberado'
                            ? 'bg-emerald-600 text-white'
                            : l.verdict === 'reprovado_descarte'
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-500 text-white'
                        }`}
                      >
                        {l.verdict.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrintLaudo(l)}
                        className="h-7 text-[10px]"
                      >
                        <Printer className="w-3 h-3 mr-1" /> PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DIÁLOGO: NOVA ANÁLISE */}
      <Dialog open={analysisModalOpen} onOpenChange={setAnalysisModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-purple-800 flex items-center gap-2">
              <FlaskConical className="w-5 h-5" /> Registro de Análise Laboratorial
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveAnalysis} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Plano de Análise *</Label>
                <Select value={analysisFormData.plan_id} onValueChange={handlePlanChange}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="Selecione o plano..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.code} — {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Tipo de Amostra *</Label>
                <Select
                  value={analysisFormData.sample_type}
                  onValueChange={(val: any) =>
                    setAnalysisFormData((p) => ({ ...p, sample_type: val }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tanque_cura">Tanque de Cura (Salmoura)</SelectItem>
                    <SelectItem value="lote_acabado">Lote de Produto Acabado</SelectItem>
                    <SelectItem value="recebimento_safra">Fruta in Natura (Safra)</SelectItem>
                    <SelectItem value="salmoura">Salmoura de Cobertura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Lote / Identificação da Amostra *</Label>
                <Input
                  className="h-8 text-xs font-mono"
                  value={analysisFormData.lot_number}
                  onChange={(e) =>
                    setAnalysisFormData((p) => ({ ...p, lot_number: e.target.value }))
                  }
                  placeholder="Ex: OP-2026-0145 / TQ-03 / SAFRA-TK-2026-0001"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Ordem de Produção (Opcional)</Label>
                <Select
                  value={analysisFormData.production_order_id}
                  onValueChange={(val) =>
                    setAnalysisFormData((p) => ({ ...p, production_order_id: val }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="Selecione a OP..." />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.slice(0, 30).map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        OP #{o.order_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Data de Coleta</Label>
                <Input
                  type="datetime-local"
                  className="h-8 text-xs"
                  value={analysisFormData.collection_date}
                  onChange={(e) =>
                    setAnalysisFormData((p) => ({ ...p, collection_date: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Data da Análise</Label>
                <Input
                  type="datetime-local"
                  className="h-8 text-xs"
                  value={analysisFormData.analysis_date}
                  onChange={(e) =>
                    setAnalysisFormData((p) => ({ ...p, analysis_date: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Analista</Label>
                <Input
                  className="h-8 text-xs"
                  value={analysisFormData.analyst_name}
                  onChange={(e) =>
                    setAnalysisFormData((p) => ({ ...p, analyst_name: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Parâmetros dinâmicos conforme plano */}
            {results.length > 0 && (
              <div className="p-3 bg-muted/40 rounded-xl border space-y-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Microscope className="w-4 h-4 text-purple-600" /> Resultados dos Parâmetros
                  (veredito automático)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {results.map((r, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-white border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-foreground">{r.parameter}</span>
                        <span className="text-[10px] text-muted-foreground">
                          Faixa: {r.min_limit ?? '—'} a {r.max_limit ?? '—'} {r.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          className="h-7 text-xs font-mono"
                          placeholder="Resultado"
                          value={r.result_value as string}
                          onChange={(e) =>
                            setResults((prev) =>
                              prev.map((pr, i) =>
                                i === idx ? { ...pr, result_value: e.target.value } : pr,
                              ),
                            )
                          }
                        />
                        {r.result_value !== '' &&
                          !isNaN(Number(r.result_value)) &&
                          (() => {
                            const val = Number(r.result_value)
                            const ok =
                              (r.min_limit === undefined || val >= r.min_limit) &&
                              (r.max_limit === undefined || val <= r.max_limit)
                            return ok ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )
                          })()}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className={`text-xs font-bold flex items-center gap-1.5 ${
                    autoVerdict === 'conforme' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {autoVerdict === 'conforme' ? (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Veredito automático: CONFORME — lote
                      liberável.
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" /> Veredito automático: NÃO CONFORME —
                      liberação bloqueada.
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs">Observações / Justificativa de Não Conformidade</Label>
              <Textarea
                rows={2}
                className="text-xs"
                value={analysisFormData.notes}
                onChange={(e) => setAnalysisFormData((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAnalysisModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold"
              >
                {submitting ? 'Salvando...' : 'Gravar Análise'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: EMISSÃO DE LAUDO */}
      <Dialog open={laudoModalOpen} onOpenChange={setLaudoModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#005B2E] flex items-center gap-2">
              <FileText className="w-5 h-5" /> Emissão de Laudo Técnico (MAPA / RDC)
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveLaudo} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Lote / Embalagem *</Label>
                <Input
                  className="h-8 text-xs font-mono bg-muted"
                  value={laudoFormData.lot_number}
                  readOnly
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo de Embalagem</Label>
                <Select
                  value={laudoFormData.package_type}
                  onValueChange={(val) => setLaudoFormData((p) => ({ ...p, package_type: val }))}
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pote de Vidro 500g">Pote de Vidro 500g</SelectItem>
                    <SelectItem value="Pote de Vidro 250g">Pote de Vidro 250g</SelectItem>
                    <SelectItem value="Sachê 2kg">Sachê 2kg</SelectItem>
                    <SelectItem value="Balde 5kg">Balde 5kg</SelectItem>
                    <SelectItem value="Tambor 200L">Tambor 200L</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Data de Fabricação</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={laudoFormData.manufacturing_date}
                  onChange={(e) =>
                    setLaudoFormData((p) => ({ ...p, manufacturing_date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Validade</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={laudoFormData.expiry_date}
                  onChange={(e) => setLaudoFormData((p) => ({ ...p, expiry_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Peso Drenado Nominal (g)</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-mono"
                  value={laudoFormData.drained_weight_target_g}
                  onChange={(e) =>
                    setLaudoFormData((p) => ({
                      ...p,
                      drained_weight_target_g: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Peso Drenado Aferido (g)</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-mono"
                  value={laudoFormData.drained_weight_measured_g}
                  onChange={(e) =>
                    setLaudoFormData((p) => ({
                      ...p,
                      drained_weight_measured_g: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Registro MAPA</Label>
              <Input
                className="h-8 text-xs font-mono"
                value={laudoFormData.mapa_registration_number}
                onChange={(e) =>
                  setLaudoFormData((p) => ({ ...p, mapa_registration_number: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/40">
              <Label className="text-xs font-bold">Rotulagem RDC 727/2022 conforme?</Label>
              <input
                type="checkbox"
                checked={laudoFormData.rdc_label_compliance}
                onChange={(e) =>
                  setLaudoFormData((p) => ({ ...p, rdc_label_compliance: e.target.checked }))
                }
                className="w-4 h-4"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Responsável Técnico (CRQ/CRF)</Label>
              <Input
                className="h-8 text-xs"
                value={laudoFormData.technical_responsible_crq}
                onChange={(e) =>
                  setLaudoFormData((p) => ({ ...p, technical_responsible_crq: e.target.value }))
                }
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLaudoModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white text-xs font-bold"
              >
                {submitting ? 'Emitindo...' : 'Emitir Laudo Técnico'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: DETALHE DA ANÁLISE */}
      <Dialog
        open={!!viewAnalysisModal}
        onOpenChange={(open) => !open && setViewAnalysisModal(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-purple-800 flex items-center gap-2">
              <Microscope className="w-5 h-5" /> Resultados: {viewAnalysisModal?.analysis_number}
            </DialogTitle>
          </DialogHeader>

          {viewAnalysisModal && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Lote:{' '}
                <strong className="font-mono text-foreground">
                  {viewAnalysisModal.lot_number}
                </strong>{' '}
                | Analista: {viewAnalysisModal.analyst_name}
              </div>

              <div className="space-y-1.5">
                {((viewAnalysisModal.results_data || []) as any[]).map((r, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                      r.compliant
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-rose-50 border-rose-200'
                    }`}
                  >
                    <div>
                      <strong>{r.parameter}</strong>
                      <span className="text-muted-foreground"> ({r.unit})</span>
                    </div>
                    <div className="font-mono">
                      {r.result_value}{' '}
                      <span className="text-[10px] text-muted-foreground">
                        ({r.min_limit ?? '—'} a {r.max_limit ?? '—'})
                      </span>{' '}
                      {r.compliant ? (
                        <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 inline text-rose-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
