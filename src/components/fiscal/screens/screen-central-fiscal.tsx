import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  FileCheck,
  FileText,
  AlertTriangle,
  Clock,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Building2,
  CheckCircle2,
  Activity,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBrand } from '@/hooks/use-brand'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { FiscalDashboard } from '@/components/fiscal/fiscal-dashboard'
import {
  getNfseRecords,
  getCteRecords,
  getMdfeRecords,
  getApuracoes,
  getCorrections,
  getManifestations,
  getCertificates,
  getReformCredits,
  getReformValidations,
} from '@/services/fiscal'
import { getNfeRecords, getNfceRecords } from '@/services/sales'
import { getPurchaseInvoices } from '@/services/purchasing'

export function ScreenCentralFiscal() {
  const navigate = useNavigate()
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('painel')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    entradasTotal: 0,
    nfeEmitidas: 0,
    pendenciasSefaz: 0,
    certificadosAlerta: 0,
    apuracoesAbertas: 0,
    divergenciasVal: 0,
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

  const loadKpis = async () => {
    try {
      const [nfe, nfse, nfce, cte, mdfe, purInv, certs, apur, validations, manifest] =
        await Promise.all([
          getNfeRecords().catch(() => []),
          getNfseRecords().catch(() => []),
          getNfceRecords().catch(() => []),
          getCteRecords().catch(() => []),
          getMdfeRecords().catch(() => []),
          getPurchaseInvoices().catch(() => []),
          getCertificates().catch(() => []),
          getApuracoes().catch(() => []),
          getReformValidations().catch(() => []),
          getManifestations().catch(() => []),
        ])

      const nfeArr = (nfe || []) as any[]
      const purArr = (purInv || []) as any[]
      const certArr = (certs || []) as any[]
      const apurArr = (apur || []) as any[]
      const valArr = (validations || []) as any[]
      const manArr = (manifest || []) as any[]

      // 1. Notas Emitidas (NF-e)
      const nfeEmitidas = nfeArr.length

      // 2. Notas de Entrada (XML / Compras)
      const entradasTotal = purArr.length

      // 3. Pendências SEFAZ / Aguardando
      const pendencias =
        [...nfeArr, ...((nfse as any[]) || []), ...((nfce as any[]) || [])].filter((d) =>
          ['Em Digitação', 'Aguardando Transmissão', 'Em Validação', 'Rejeitada'].includes(
            d.status || '',
          ),
        ).length + manArr.filter((m) => !m?.tipo_manifestacao).length

      // 4. Certificados vencendo em 30 dias
      const now = new Date()
      const d30 = 30 * 24 * 60 * 60 * 1000
      const certsAlerta = certArr.filter((c) => {
        if (!c?.data_vencimento) return false
        const diff = new Date(c.data_vencimento).getTime() - now.getTime()
        return diff < d30
      }).length

      // 5. Apurações
      const apuracoes = apurArr.length

      // 6. Divergências / Validações com erro
      const divergencias = valArr.filter((v) =>
        ['Com Erro', 'Aguardando Correcao', 'Com Alerta'].includes(v?.status || ''),
      ).length

      setStats({
        entradasTotal,
        nfeEmitidas,
        pendenciasSefaz: pendencias,
        certificadosAlerta: certsAlerta,
        apuracoesAbertas: apuracoes,
        divergenciasVal: divergencias,
      })
    } catch {
      // safe fallback
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadKpis()
  }, [empresaAtivaId])

  useRealtime('nfe_records', () => loadKpis())
  useRealtime('purchase_invoices', () => loadKpis())
  useRealtime('fiscal_certificates', () => loadKpis())
  useRealtime('fiscal_apuracoes', () => loadKpis())

  const handleRefresh = () => {
    setRefreshing(true)
    loadKpis()
    toast({ title: 'Dados da Central Fiscal atualizados' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">Central Fiscal</h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Torre de Controle Fiscal & Tributária
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Monitoramento integrado de documentos emitidos, entradas via XML com idempotência,
              pendências SEFAZ, apuração tributária e governança de certificados digitais.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs focus-visible:ring-[#005B2E]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* 6 INDICADORES CLICÁVEIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. NF-e Emitidas -> Documentos Fiscais */}
        <button
          type="button"
          onClick={() => navigate('/admin/fiscal/documentos')}
          className="text-left p-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 hover:border-[#005B2E] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800">NF-e Emitidas</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#005B2E]" />
          </div>
          <span className="text-2xl font-black text-[#005B2E] block mt-1">{stats.nfeEmitidas}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Documentos Fiscais <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 2. Notas de Entrada -> Compras e Entradas */}
        <button
          type="button"
          onClick={() => navigate('/admin/fiscal/compras-entradas')}
          className="text-left p-3 rounded-xl border-2 border-blue-200 bg-blue-50/40 hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800">Notas de Entrada</span>
            <ArrowDownLeft className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-blue-700 block mt-1">
            {stats.entradasTotal}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Compras & XML <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 3. Pendências SEFAZ -> Documentos Fiscais */}
        <button
          type="button"
          onClick={() => navigate('/admin/fiscal/documentos')}
          className="text-left p-3 rounded-xl border-2 border-amber-200 bg-amber-50/40 hover:border-amber-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800">Pendências SEFAZ</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-700 block mt-1">
            {stats.pendenciasSefaz}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Regularizar <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 4. Certificados A1 -> Certificados e Configurações */}
        <button
          type="button"
          onClick={() => navigate('/admin/fiscal/certificados-configuracoes')}
          className="text-left p-3 rounded-xl border-2 border-purple-200 bg-purple-50/40 hover:border-purple-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800">Certificados A1</span>
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <span className="text-2xl font-black text-purple-700 block mt-1">
            {stats.certificadosAlerta > 0 ? `${stats.certificadosAlerta} alerta` : 'Válido'}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Certificados <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 5. Apurações -> Escrituração e Obrigações */}
        <button
          type="button"
          onClick={() => navigate('/admin/fiscal/escrituracao')}
          className="text-left p-3 rounded-xl border-2 border-teal-200 bg-teal-50/40 hover:border-teal-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-800">Apurações</span>
            <DollarSign className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <span className="text-2xl font-black text-teal-700 block mt-1">
            {stats.apuracoesAbertas}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Escrituração <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* 6. Divergências Reforma -> Reforma Tributária */}
        <button
          type="button"
          onClick={() => navigate('/admin/fiscal/reforma')}
          className="text-left p-3 rounded-xl border-2 border-rose-200 bg-rose-50/40 hover:border-rose-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800">Divergências</span>
            <Clock className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <span className="text-2xl font-black text-rose-700 block mt-1">
            {stats.divergenciasVal}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            Reforma & Regras <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>
      </div>

      {/* ABAS DA CENTRAL FISCAL */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 max-w-md h-auto gap-1">
          <TabsTrigger value="painel" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Painel Consolidado</span>
          </TabsTrigger>
          <TabsTrigger
            value="pendencias"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Pendências & Auditoria</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: PAINEL CONSOLIDADO */}
        <TabsContent value="painel" className="space-y-4">
          <FiscalDashboard />
        </TabsContent>

        {/* ABA 2: PENDÊNCIAS E AUDITORIA */}
        <TabsContent value="pendencias" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-amber-200">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Monitoramento de Transmissão SEFAZ
                  </h3>
                  <Badge variant="outline" className="border-amber-400 text-amber-700 font-bold">
                    Homologação Ativa
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Documentos fiscais eletrônicos em status temporário ou aguardando protocolo da
                  SEFAZ. Para emissão em produção, verifique a aba de Certificados Digitais A1.
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => navigate('/admin/fiscal/documentos')}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                  >
                    Ver Fila de Documentos
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-200">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#005B2E]" />
                    Idempotência e Entradas XML
                  </h3>
                  <Badge variant="outline" className="border-emerald-400 text-[#005B2E] font-bold">
                    44 Dígitos
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Garantia antifalhas com trava de chave de acesso de 44 dígitos e matching de
                  de-para de fornecedor antes de qualquer movimentação de estoque ou faturamento.
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => navigate('/admin/fiscal/compras-entradas')}
                    className="bg-[#005B2E] hover:bg-[#004222] text-white font-bold text-xs"
                  >
                    Acessar Notas de Compra & XML
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
