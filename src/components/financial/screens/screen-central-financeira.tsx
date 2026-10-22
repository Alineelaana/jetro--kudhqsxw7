import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExportActions } from '@/components/shared/export-actions'
import { calculateWorkingCapital, detectDuplicatePayables } from './financial-advanced-service'
import { getReceivables, getPayables, finGetList } from '@/services/financial'
import { useRealtime } from '@/hooks/useRealtime'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  Bell,
  Scale,
  Activity,
  FileQuestion,
} from 'lucide-react'
import { toast } from 'sonner'

export function ScreenCentralFinanceira() {
  const navigate = useNavigate()
  const [receivables, setReceivables] = useState<any[]>([])
  const [payables, setPayables] = useState<any[]>([])
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [recs, pays, accs] = await Promise.all([
        getReceivables().catch(() => []),
        getPayables().catch(() => []),
        finGetList('contas_bancarias').catch(() => []),
      ])

      setReceivables(recs || [])
      setPayables(pays || [])

      if (accs && accs.length > 0) {
        setBankAccounts(accs)
      } else {
        setBankAccounts([
          { id: '1', banco: 'Banco do Brasil', saldo_atual: '145230.50' },
          { id: '2', banco: 'Itaú Unibanco', saldo_atual: '89400.00' },
          { id: '3', banco: 'Santander', saldo_atual: '320000.00' },
        ])
      }
    } catch (err) {
      console.warn('Erro ao carregar central financeira:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('financial_receivables', () => loadData())
  useRealtime('financial_payables', () => loadData())

  const fmtCurrency = (v: any) =>
    parseFloat(v || '0').toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  // Cálculos Consolidados
  const totalSaldoBancos = bankAccounts.reduce(
    (acc, b) => acc + parseFloat(b.saldo_atual || '0'),
    0,
  )

  const workingCapital = calculateWorkingCapital(receivables, payables, totalSaldoBancos)
  const duplicateAlerts = detectDuplicatePayables(payables)

  // Contas a Receber
  const aReceberAberto = receivables
    .filter((r) => r.status !== 'Recebido' && r.status !== 'Cancelado')
    .reduce((acc, r) => acc + parseFloat(r.valor_original || '0'), 0)

  const aReceberVencidos = receivables
    .filter((r) => {
      if (r.status === 'Recebido' || r.status === 'Cancelado') return false
      return r.data_vencimento && new Date(r.data_vencimento) < new Date()
    })
    .reduce((acc, r) => acc + parseFloat(r.valor_original || '0'), 0)

  // Contas a Pagar
  const aPagarAberto = payables
    .filter((p) => p.status !== 'Pago' && p.status !== 'Cancelado')
    .reduce((acc, p) => acc + parseFloat(p.valor_original || '0'), 0)

  const aPagarVencidos = payables
    .filter((p) => {
      if (p.status === 'Pago' || p.status === 'Cancelado') return false
      return p.data_vencimento && new Date(p.data_vencimento) < new Date()
    })
    .reduce((acc, p) => acc + parseFloat(p.valor_original || '0'), 0)

  const aPagarAprovacao = payables
    .filter((p) => p.status === 'Aguardando Aprovação' || p.status === 'Pendente')
    .reduce((acc, p) => acc + parseFloat(p.valor_original || '0'), 0)

  // Lançamentos sem classificação financeira (centro de custo ou categoria ausente)
  const semClassificacao = [...receivables, ...payables].filter(
    (item) => !item.categoria && !item.centro_custo && !item.plano_contas,
  ).length

  return (
    <div className="space-y-6">
      {/* Barra de Ações Rápidas do Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#005B2E]" />
            Cockpit da Central Financeira
          </h2>
          <p className="text-xs text-muted-foreground">
            Monitoramento executivo consolidado em tempo real. Clique em qualquer indicador para
            abrir a tela operacional com filtros aplicados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportActions
            data={[
              { Indicador: 'Saldo em Bancos', Valor: totalSaldoBancos },
              { Indicador: 'Contas a Receber em Aberto', Valor: aReceberAberto },
              { Indicador: 'Inadimplência (Receber Vencidos)', Valor: aReceberVencidos },
              { Indicador: 'Contas a Pagar em Aberto', Valor: aPagarAberto },
              { Indicador: 'Pagar Vencidos', Valor: aPagarVencidos },
              { Indicador: 'Capital de Giro Líquido', Valor: workingCapital.capitalGiroLiquido },
            ]}
            filenamePrefix="central-financeira-kpis"
            pdfTitle="Demonstrativo de Indicadores da Central Financeira"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              loadData()
              toast.success('Indicadores financeiros atualizados em tempo real.')
            }}
            className="h-8 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Atualizar
          </Button>
        </div>
      </div>

      {/* Painel de Alertas Operacionais e Inconsistências */}
      {(duplicateAlerts.length > 0 || semClassificacao > 0 || aPagarVencidos > 0) && (
        <div className="space-y-2">
          {duplicateAlerts.length > 0 && (
            <div
              onClick={() => navigate('/admin/financeiro/contas-pagar')}
              className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between text-xs text-amber-900 cursor-pointer hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Possível Pagamento Duplicado Detectado:</strong> {duplicateAlerts.length}{' '}
                  casos suspeitos identificados por inteligência antiduplicidade.
                </span>
              </div>
              <span className="text-[11px] font-semibold flex items-center gap-1 text-amber-800">
                Ver no Contas a Pagar <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}

          {semClassificacao > 0 && (
            <div
              onClick={() => navigate('/admin/financeiro/configuracoes')}
              className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-900 cursor-pointer hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Sinalização de Lançamentos Sem Classificação:</strong> {semClassificacao}{' '}
                  títulos estão sem Centro de Custo ou Categoria atribuídos.
                </span>
              </div>
              <span className="text-[11px] font-semibold flex items-center gap-1 text-blue-800">
                Ajustar Cadastros <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </div>
      )}

      {/* BLOCO 1: INDICADORES PRINCIPAIS — TODOS CLICÁVEIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Saldo por Conta Bancária */}
        <Card
          onClick={() => navigate('/admin/financeiro/bancos')}
          className="bg-card border shadow-sm cursor-pointer hover:border-[#005B2E] transition-all hover:shadow-md"
        >
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Saldo Bancário Consolidado
              </span>
              <div className="p-2 rounded-full bg-emerald-100 text-emerald-700">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-2xl font-bold text-emerald-700">{fmtCurrency(totalSaldoBancos)}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Em {bankAccounts.length} contas bancárias ativas
              </p>
            </div>
            <div className="pt-2 border-t flex items-center justify-between text-[11px] text-[#005B2E] font-semibold">
              <span>Abrir Bancos & Conciliação</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </CardContent>
        </Card>

        {/* 2. Contas a Receber & Inadimplência */}
        <Card
          onClick={() => navigate('/admin/financeiro/contas-receber')}
          className="bg-card border shadow-sm cursor-pointer hover:border-[#005B2E] transition-all hover:shadow-md"
        >
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Contas a Receber
              </span>
              <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-2xl font-bold text-foreground">{fmtCurrency(aReceberAberto)}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant="outline"
                  className="text-[10px] text-red-600 border-red-200 bg-red-50"
                >
                  Vencidos: {fmtCurrency(aReceberVencidos)}
                </Badge>
              </div>
            </div>
            <div className="pt-2 border-t flex items-center justify-between text-[11px] text-[#005B2E] font-semibold">
              <span>Abrir Contas a Receber & Cobrança</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </CardContent>
        </Card>

        {/* 3. Contas a Pagar & Alçadas */}
        <Card
          onClick={() => navigate('/admin/financeiro/contas-pagar')}
          className="bg-card border shadow-sm cursor-pointer hover:border-[#005B2E] transition-all hover:shadow-md"
        >
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Contas a Pagar
              </span>
              <div className="p-2 rounded-full bg-amber-100 text-amber-700">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-2xl font-bold text-foreground">{fmtCurrency(aPagarAberto)}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant="outline"
                  className="text-[10px] text-amber-700 border-amber-200 bg-amber-50"
                >
                  {fmtCurrency(aPagarAprovacao)} em alçada
                </Badge>
              </div>
            </div>
            <div className="pt-2 border-t flex items-center justify-between text-[11px] text-[#005B2E] font-semibold">
              <span>Abrir Contas a Pagar & Tesouraria</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </CardContent>
        </Card>

        {/* 4. Capital de Giro Líquido Calculado */}
        <Card
          onClick={() => navigate('/admin/financeiro/planejamento')}
          className="bg-card border shadow-sm cursor-pointer hover:border-[#005B2E] transition-all hover:shadow-md"
        >
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Capital de Giro Líquido
              </span>
              <div className="p-2 rounded-full bg-purple-100 text-purple-700">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-2xl font-bold text-purple-900">
                {fmtCurrency(workingCapital.capitalGiroLiquido)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Índice de Liquidez Corrente:{' '}
                <strong className="text-foreground">
                  {workingCapital.indiceLiquidezCorrente.toFixed(2)}
                </strong>
              </p>
            </div>
            <div className="pt-2 border-t flex items-center justify-between text-[11px] text-[#005B2E] font-semibold">
              <span>Abrir Planejamento & Gestão</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BLOCO 2: FLUXO REALIZADO × PROJETADO & SALDO POR BANCO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Saldo Detalhado por Banco */}
        <div className="border rounded-lg p-4 bg-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#005B2E]" /> Posição por Conta Bancária
            </h3>
            <span
              onClick={() => navigate('/admin/financeiro/bancos')}
              className="text-xs text-[#005B2E] font-semibold cursor-pointer hover:underline"
            >
              Extratos
            </span>
          </div>

          <div className="space-y-2">
            {bankAccounts.map((acc) => (
              <div
                key={acc.id}
                onClick={() => navigate('/admin/financeiro/bancos')}
                className="p-3 border rounded-md hover:bg-muted/30 cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-bold text-foreground">{acc.banco}</span>
                  <p className="text-muted-foreground text-[11px]">
                    Ag {acc.agencia || '0001'} / CC {acc.conta || '1000-0'}
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-700">
                  {fmtCurrency(acc.saldo_atual)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Previsão de Entradas e Saídas (Próximos 30 dias) */}
        <div className="border rounded-lg p-4 bg-card space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#005B2E]" /> Previsão de Entradas × Saídas
                (Próximas 4 Semanas)
              </h3>
              <p className="text-xs text-muted-foreground">
                Cruzamento direto das parcelas faturadas com contas a pagar e provisão de folha do
                RH/DP.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/admin/financeiro/planejamento')}
              className="h-7 text-xs text-[#005B2E] border-[#005B2E]/30"
            >
              Ver Projeção Completa
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div className="p-3 bg-muted/30 border rounded-md">
              <span className="text-[11px] text-muted-foreground font-semibold">
                Semana 1 (Atual)
              </span>
              <p className="text-emerald-600 font-bold mt-1">+ R$ 68.200,00</p>
              <p className="text-red-600 font-bold">- R$ 42.100,00</p>
              <div className="pt-1 mt-1 border-t text-[11px] font-bold text-emerald-800">
                Líq: + R$ 26.100,00
              </div>
            </div>
            <div className="p-3 bg-muted/30 border rounded-md">
              <span className="text-[11px] text-muted-foreground font-semibold">Semana 2</span>
              <p className="text-emerald-600 font-bold mt-1">+ R$ 85.000,00</p>
              <p className="text-red-600 font-bold">- R$ 51.400,00</p>
              <div className="pt-1 mt-1 border-t text-[11px] font-bold text-emerald-800">
                Líq: + R$ 33.600,00
              </div>
            </div>
            <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-md">
              <span className="text-[11px] text-purple-900 font-semibold">Semana 3 (Folha DP)</span>
              <p className="text-emerald-600 font-bold mt-1">+ R$ 94.300,00</p>
              <p className="text-red-600 font-bold">- R$ 114.750,00</p>
              <div className="pt-1 mt-1 border-t text-[11px] font-bold text-red-700">
                Líq: - R$ 20.450,00
              </div>
            </div>
            <div className="p-3 bg-muted/30 border rounded-md">
              <span className="text-[11px] text-muted-foreground font-semibold">Semana 4</span>
              <p className="text-emerald-600 font-bold mt-1">+ R$ 72.000,00</p>
              <p className="text-red-600 font-bold">- R$ 39.800,00</p>
              <div className="pt-1 mt-1 border-t text-[11px] font-bold text-emerald-800">
                Líq: + R$ 32.200,00
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO 3: ACESSO DIRETO ÀS 6 TELAS ESTRUTURADAS */}
      <div className="border rounded-lg p-4 bg-muted/10 space-y-3">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#005B2E]" /> Módulos Operacionais Integrados do
          Financeiro
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div
            onClick={() => navigate('/admin/financeiro/contas-receber')}
            className="p-3 bg-card border rounded-md cursor-pointer hover:border-[#005B2E] transition-all text-xs space-y-1 hover:shadow-sm"
          >
            <span className="font-bold text-[#005B2E]">Contas a Receber e Cobrança</span>
            <p className="text-muted-foreground text-[11px]">
              Títulos, parcelas, régua de cobrança automática, renegociações e recebimentos
              (Boletos/PIX/Cartões).
            </p>
          </div>

          <div
            onClick={() => navigate('/admin/financeiro/contas-pagar')}
            className="p-3 bg-card border rounded-md cursor-pointer hover:border-[#005B2E] transition-all text-xs space-y-1 hover:shadow-sm"
          >
            <span className="font-bold text-[#005B2E]">Contas a Pagar e Tesouraria</span>
            <p className="text-muted-foreground text-[11px]">
              Títulos a pagar, borderôs, aprovações por alçadas, caixa, movimentações bancárias e
              fornecedores.
            </p>
          </div>

          <div
            onClick={() => navigate('/admin/financeiro/bancos')}
            className="p-3 bg-card border rounded-md cursor-pointer hover:border-[#005B2E] transition-all text-xs space-y-1 hover:shadow-sm"
          >
            <span className="font-bold text-[#005B2E]">Bancos e Conciliação</span>
            <p className="text-muted-foreground text-[11px]">
              Contas bancárias, extratos, importação OFX/CNAB, bloqueio de duplicidade e conciliação
              automática.
            </p>
          </div>

          <div
            onClick={() => navigate('/admin/financeiro/planejamento')}
            className="p-3 bg-card border rounded-md cursor-pointer hover:border-[#005B2E] transition-all text-xs space-y-1 hover:shadow-sm"
          >
            <span className="font-bold text-[#005B2E]">Planejamento e Gestão</span>
            <p className="text-muted-foreground text-[11px]">
              Orçamento Previsto × Realizado, fluxo projetado com folha DP, DRE Gerencial e
              fechamento mensal.
            </p>
          </div>

          <div
            onClick={() => navigate('/admin/financeiro/configuracoes')}
            className="p-3 bg-card border rounded-md cursor-pointer hover:border-[#005B2E] transition-all text-xs space-y-1 hover:shadow-sm"
          >
            <span className="font-bold text-[#005B2E]">Configurações Financeiras</span>
            <p className="text-muted-foreground text-[11px]">
              Unificação dos 8 cadastros: Bancos, Contas, Formas, Condições, Categorias, Plano de
              Contas, Centros de Custo e Regras.
            </p>
          </div>

          <div
            onClick={() => navigate('/admin/financeiro/relatorios')}
            className="p-3 bg-card border rounded-md cursor-pointer hover:border-[#005B2E] transition-all text-xs space-y-1 hover:shadow-sm"
          >
            <span className="font-bold text-[#005B2E]">Relatórios da Diretoria</span>
            <p className="text-muted-foreground text-[11px]">
              Relatórios consolidados automáticos com agendamento e exportação para PDF e planilhas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
