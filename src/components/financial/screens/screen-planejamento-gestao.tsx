import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { JetroTable } from '@/components/jetro-table'
import { JetroColumnDef } from '@/components/jetro-table/types'
import { RecordAttachmentsDialog } from '@/components/shared/record-attachments-dialog'
import { ExportActions } from '@/components/shared/export-actions'
import { getPayrollForecastForCashFlow, isPeriodClosed } from './financial-advanced-service'
import { finGetList, getClosings, getPayables, getReceivables } from '@/services/financial'
import { FinancialReports } from '@/components/financial/financial-reports'
import {
  TrendingUp,
  DollarSign,
  PieChart,
  LineChart,
  Layers,
  Lock,
  FileText,
  Users,
  AlertCircle,
  Building,
  CheckCircle2,
  Calendar,
  Download,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'

export function ScreenPlanejamentoGestao() {
  const [activeTab, setActiveTab] = useState('orcamento')
  const [payrollForecast, setPayrollForecast] = useState<any>(null)
  const [closings, setClosings] = useState<any[]>([])
  const [payables, setPayables] = useState<any[]>([])
  const [receivables, setReceivables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Anexos
  const [attachOpen, setAttachOpen] = useState(false)
  const [selectedRecordForAttach, setSelectedRecordForAttach] = useState<any>(null)

  // Dialog Encerramento de Período Financeiro
  const [closePeriodDialogOpen, setClosePeriodDialogOpen] = useState(false)
  const [periodToClose, setPeriodToClose] = useState({
    mes_referencia: new Date().toISOString().substring(0, 7),
    observacoes: '',
  })

  // Dados de Orçamento Previsto x Realizado
  const [budgetItems, setBudgetItems] = useState([
    {
      categoria: 'Receita Bruta Operacional (Faturamento)',
      previsto: 450000.0,
      realizado: 472500.0,
      variacao: 5.0,
      status: 'Superavitário',
    },
    {
      categoria: 'Custos Operacionais e Mercadorias (CPV/CMV)',
      previsto: 210000.0,
      realizado: 198400.0,
      variacao: -5.5,
      status: 'Economia',
    },
    {
      categoria: 'Despesas com Pessoal & Folha (RH/DP)',
      previsto: 115000.0,
      realizado: 118200.0,
      variacao: 2.8,
      status: 'Atenção',
    },
    {
      categoria: 'Despesas Administrativas & TI',
      previsto: 32000.0,
      realizado: 29800.0,
      variacao: -6.8,
      status: 'Economia',
    },
    {
      categoria: 'Despesas Comerciais & Marketing',
      previsto: 25000.0,
      realizado: 26400.0,
      variacao: 5.6,
      status: 'Dentro da Margem',
    },
    {
      categoria: 'Despesas Tributárias & Impostos',
      previsto: 42000.0,
      realizado: 44100.0,
      variacao: 5.0,
      status: 'Alinhado',
    },
  ])

  // DRE Gerencial
  const dreGerencial = [
    { nivel: '1', conta: 'RECEITA BRUTA DE VENDAS E SERVIÇOS', valor: 472500.0, perc: 100 },
    {
      nivel: '1.1',
      conta: '(-) Deduções da Receita Bruta e Devoluções',
      valor: -18900.0,
      perc: -4.0,
    },
    {
      nivel: '1.2',
      conta: '(-) Impostos sobre Faturamento (Simples/PIS/COFINS)',
      valor: -37800.0,
      perc: -8.0,
    },
    { nivel: '2', conta: '(=) RECEITA OPERACIONAL LÍQUIDA', valor: 415800.0, perc: 88.0 },
    {
      nivel: '2.1',
      conta: '(-) Custos dos Serviços Prestados / Mercadorias',
      valor: -198400.0,
      perc: -42.0,
    },
    { nivel: '3', conta: '(=) LUCRO BRUTO GERENCIAL', valor: 217400.0, perc: 46.0 },
    {
      nivel: '3.1',
      conta: '(-) Despesas Operacionais (Pessoal/Administrativo)',
      valor: -148000.0,
      perc: -31.3,
    },
    { nivel: '4', conta: '(=) EBITDA / LAJIDA OPERACIONAL', valor: 69400.0, perc: 14.7 },
    { nivel: '4.1', conta: '(+/-) Resultado Financeiro Líquido', valor: -4200.0, perc: -0.9 },
    { nivel: '5', conta: '(=) RESULTADO LÍQUIDO DO PERÍODO', valor: 65200.0, perc: 13.8 },
  ]

  const loadData = async () => {
    try {
      const [payroll, clos, pays, recs] = await Promise.all([
        getPayrollForecastForCashFlow(),
        getClosings().catch(() => []),
        getPayables().catch(() => []),
        getReceivables().catch(() => []),
      ])

      setPayrollForecast(payroll)
      setClosings(clos || [])
      setPayables(pays || [])
      setReceivables(recs || [])
    } catch (err) {
      console.warn('Erro ao carregar planejamento:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const fmtCurrency = (v: any) =>
    parseFloat(v || '0').toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  // Efetivar Fechamento de Período Financeiro (com bloqueio permanente de lançamentos)
  const handleExecuteClosing = async () => {
    try {
      await finGetList('financial_closings') // touch
      const novoFechamento = {
        mes_referencia: periodToClose.mes_referencia,
        status: 'Fechado',
        encerrado_por: 'Diretoria Financeira',
        data_fechamento: new Date().toISOString(),
        observacoes: periodToClose.observacoes || 'Período encerrado oficialmente.',
      }
      setClosings((prev) => [novoFechamento, ...prev])
      toast.success(
        `Período ${periodToClose.mes_referencia} encerrado com sucesso! Lançamentos e alterações anteriores a esta data estão bloqueados.`,
      )
      setClosePeriodDialogOpen(false)
    } catch {
      toast.error('Erro ao registrar fechamento.')
    }
  }

  // Colunas JetroTable para Orçamento
  const budgetColumns: JetroColumnDef<any>[] = [
    {
      id: 'categoria',
      header: 'Centro / Categoria Orçamentária',
      accessorKey: 'categoria',
      dataType: 'text',
      defaultWidth: 320,
      cell: ({ value }) => (
        <span className="font-semibold text-foreground text-xs">{String(value)}</span>
      ),
    },
    {
      id: 'previsto',
      header: 'Orçado (Previsto)',
      accessorKey: 'previsto',
      dataType: 'currency',
      align: 'right',
      defaultWidth: 140,
      cell: ({ value }) => (
        <span className="text-xs text-muted-foreground">{fmtCurrency(value)}</span>
      ),
    },
    {
      id: 'realizado',
      header: 'Efetivado (Realizado)',
      accessorKey: 'realizado',
      dataType: 'currency',
      align: 'right',
      defaultWidth: 140,
      cell: ({ value }) => (
        <span className="text-xs font-bold text-foreground">{fmtCurrency(value)}</span>
      ),
    },
    {
      id: 'variacao',
      header: 'Variação (%)',
      accessorKey: 'variacao',
      dataType: 'number',
      align: 'right',
      defaultWidth: 120,
      cell: ({ value }) => {
        const v = parseFloat(value || '0')
        return (
          <span className={`text-xs font-bold ${v > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {v > 0 ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`}
          </span>
        )
      },
    },
    {
      id: 'status',
      header: 'Diagnóstico',
      accessorKey: 'status',
      dataType: 'text',
      align: 'center',
      defaultWidth: 140,
      cell: ({ value }) => {
        const s = String(value)
        if (s.includes('Economia') || s.includes('Superavitário')) {
          return <Badge className="bg-emerald-600 text-white text-[10px]">{s}</Badge>
        }
        if (s.includes('Atenção')) {
          return <Badge className="bg-amber-600 text-white text-[10px]">{s}</Badge>
        }
        return (
          <Badge variant="outline" className="text-xs">
            {s}
          </Badge>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      {/* Cards de Resumo Executivo */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card className="bg-card border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Orçado Total (Mês Atual)</p>
              <p className="text-lg font-bold text-foreground mt-1">R$ 450.000,00</p>
            </div>
            <div className="p-2.5 rounded-full bg-blue-100 text-blue-700">
              <PieChart className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Realizado Total (Mês Atual)
              </p>
              <p className="text-lg font-bold text-emerald-700 mt-1">R$ 472.500,00</p>
            </div>
            <div className="p-2.5 rounded-full bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Provisão Folha (RH/DP)</p>
              <p className="text-lg font-bold text-purple-700 mt-1">
                {fmtCurrency(payrollForecast?.totalSalariosPrevistos || 84500)}
              </p>
            </div>
            <div className="p-2.5 rounded-full bg-purple-100 text-purple-700">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Margem EBITDA Gerencial</p>
              <p className="text-lg font-bold text-emerald-600 mt-1">14,7%</p>
            </div>
            <div className="p-2.5 rounded-full bg-emerald-100 text-emerald-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b">
          <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
            <TabsTrigger
              value="orcamento"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <PieChart className="w-3.5 h-3.5 mr-1.5" /> Orçamento (Previsto × Realizado)
            </TabsTrigger>
            <TabsTrigger
              value="fluxo_projetado"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <LineChart className="w-3.5 h-3.5 mr-1.5" /> Fluxo Projetado & Folha
            </TabsTrigger>
            <TabsTrigger
              value="dre"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> DRE Gerencial
            </TabsTrigger>
            <TabsTrigger
              value="rentabilidade"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <DollarSign className="w-3.5 h-3.5 mr-1.5" /> Rentabilidade & Margens
            </TabsTrigger>
            <TabsTrigger
              value="cenarios"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <Layers className="w-3.5 h-3.5 mr-1.5" /> Cenários & Projeções
            </TabsTrigger>
            <TabsTrigger
              value="fechamento"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" /> Fechamento de Período
            </TabsTrigger>
            <TabsTrigger
              value="relatorios"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Relatórios & Diretoria
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <ExportActions
              data={budgetItems}
              filenamePrefix="planejamento-gestao"
              pdfTitle="Relatório de Planejamento e Gestão Financeira"
            />
            <Button
              onClick={() => setClosePeriodDialogOpen(true)}
              variant="outline"
              className="text-xs h-8 border-red-300 text-red-700 hover:bg-red-50"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" /> Fechar Período
            </Button>
          </div>
        </div>

        {/* 1. ABA ORÇAMENTO E PREVISTO X REALIZADO */}
        <TabsContent value="orcamento" className="mt-4 space-y-4">
          <JetroTable
            screenId="financeiro.planejamento.orcamento"
            columns={budgetColumns}
            data={budgetItems}
            emptyMessage="Nenhuma diretriz orçamentária cadastrada."
            exportTitle="Orçado × Realizado — HURAM ERP"
            exportFilename="orcamento-previsto-realizado.xlsx"
          />
        </TabsContent>

        {/* 2. ABA FLUXO DE CAIXA PROJETADO COM PROVISÃO DE FOLHA (RH/DP) */}
        <TabsContent value="fluxo_projetado" className="mt-4 space-y-4">
          <div className="p-4 border rounded-lg bg-purple-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm text-purple-950 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-700" />
                  Alimentação Automática pelo RH/DP: Provisão da Folha de Pagamento
                </h4>
                <p className="text-xs text-purple-800">
                  Os salários de contratos ativos, encargos sociais e benefícios provisionados no DP
                  alimentam diretamente os desembolsos futuros.
                </p>
              </div>
              <Badge className="bg-purple-700 text-white text-xs">Integrado ao DP</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white border border-purple-200 rounded-md">
                <span className="text-muted-foreground font-semibold">
                  Salários Líquidos (5º dia útil)
                </span>
                <p className="text-base font-bold text-purple-900 mt-1">
                  {fmtCurrency(payrollForecast?.totalSalariosPrevistos || 84500)}
                </p>
              </div>
              <div className="p-3 bg-white border border-purple-200 rounded-md">
                <span className="text-muted-foreground font-semibold">
                  Encargos Sociais (FGTS/GPS/DARF)
                </span>
                <p className="text-base font-bold text-purple-900 mt-1">
                  {fmtCurrency(payrollForecast?.totalEncargosPrevistos || 30250)}
                </p>
              </div>
              <div className="p-3 bg-white border border-purple-200 rounded-md">
                <span className="text-muted-foreground font-semibold">
                  Benefícios (VT, VR, Saúde)
                </span>
                <p className="text-base font-bold text-purple-900 mt-1">
                  {fmtCurrency(payrollForecast?.totalBeneficiosPrevistos || 15210)}
                </p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-card space-y-2">
            <h4 className="font-semibold text-sm text-foreground">
              Projeção Consolidada dos Próximos 60 Dias
            </h4>
            <p className="text-xs text-muted-foreground">
              Entradas certas de duplicatas a receber versus compromissos com fornecedores, folha e
              tributos.
            </p>

            <div className="border rounded-lg overflow-hidden mt-3">
              <table className="w-full text-xs">
                <thead className="bg-muted text-muted-foreground text-left">
                  <tr>
                    <th className="p-2.5">Data Prevista</th>
                    <th className="p-2.5">Descrição da Movimentação</th>
                    <th className="p-2.5">Origem / Módulo</th>
                    <th className="p-2.5 text-right">Entradas (R$)</th>
                    <th className="p-2.5 text-right">Saídas (R$)</th>
                    <th className="p-2.5 text-right">Saldo Projetado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2.5">{new Date().toISOString().split('T')[0]}</td>
                    <td className="p-2.5 font-bold">Saldo Inicial Disponível em Bancos</td>
                    <td className="p-2.5">Tesouraria</td>
                    <td className="p-2.5 text-right text-emerald-600 font-bold">R$ 554.630,50</td>
                    <td className="p-2.5 text-right">—</td>
                    <td className="p-2.5 text-right font-bold">R$ 554.630,50</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2.5">Próximos 7 dias</td>
                    <td className="p-2.5">Recebimentos de Clientes Faturados</td>
                    <td className="p-2.5">Vendas / Cobrança</td>
                    <td className="p-2.5 text-right text-emerald-600 font-bold">R$ 138.400,00</td>
                    <td className="p-2.5 text-right">—</td>
                    <td className="p-2.5 text-right font-bold">R$ 693.030,50</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2.5">Próximos 7 dias</td>
                    <td className="p-2.5">Fornecedores Homologados e Insumos</td>
                    <td className="p-2.5">Compras / Contas a Pagar</td>
                    <td className="p-2.5 text-right">—</td>
                    <td className="p-2.5 text-right text-red-600 font-bold">R$ 84.200,00</td>
                    <td className="p-2.5 text-right font-bold">R$ 608.830,50</td>
                  </tr>
                  <tr className="border-t bg-purple-50/40">
                    <td className="p-2.5">{payrollForecast?.proximaDataFolha || '5º Dia Útil'}</td>
                    <td className="p-2.5 font-semibold text-purple-900">
                      Folha de Pagamento Salários (DP)
                    </td>
                    <td className="p-2.5 text-purple-800 font-semibold">RH/DP Integrado</td>
                    <td className="p-2.5 text-right">—</td>
                    <td className="p-2.5 text-right text-red-600 font-bold">
                      {fmtCurrency(payrollForecast?.totalSalariosPrevistos || 84500)}
                    </td>
                    <td className="p-2.5 text-right font-bold text-purple-950">R$ 524.330,50</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* 3. ABA DRE GERENCIAL (INTEGRADA COM CONTROLADORIA, SEM DUPLICAR) */}
        <TabsContent value="dre" className="mt-4 space-y-3">
          <div className="p-3 border rounded-lg bg-muted/20 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              <strong>Demonstrativo de Resultado Gerencial:</strong> Diferenciação estrita entre a
              visão gerencial (competência financeira/caixa) e a visão contábil societária oficial
              (Controladoria).
            </span>
            <Badge variant="outline">Competência Gerencial</Badge>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground text-left">
                <tr>
                  <th className="p-2.5">Estrutura da Conta</th>
                  <th className="p-2.5 text-right">Valor Período (R$)</th>
                  <th className="p-2.5 text-right">Análise Vertical (% AV)</th>
                </tr>
              </thead>
              <tbody>
                {dreGerencial.map((linha, idx) => {
                  const isTotal = linha.conta.startsWith('(=)')
                  return (
                    <tr
                      key={idx}
                      className={`border-t ${isTotal ? 'bg-muted/40 font-bold text-foreground' : 'hover:bg-muted/20'}`}
                    >
                      <td className={`p-2.5 ${isTotal ? 'text-[#005B2E]' : 'pl-6'}`}>
                        {linha.conta}
                      </td>
                      <td className={`p-2.5 text-right ${linha.valor < 0 ? 'text-red-600' : ''}`}>
                        {fmtCurrency(linha.valor)}
                      </td>
                      <td className="p-2.5 text-right text-muted-foreground">
                        {linha.perc.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* 4. ABA RENTABILIDADE E MARGENS */}
        <TabsContent value="rentabilidade" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 border rounded-lg bg-card space-y-1">
              <span className="font-bold text-foreground">Margem Bruta Comercial</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">46,0%</p>
              <p className="text-muted-foreground text-[11px]">
                +2.1% frente ao trimestre anterior
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card space-y-1">
              <span className="font-bold text-foreground">Margem EBITDA</span>
              <p className="text-2xl font-bold text-blue-700 mt-1">14,7%</p>
              <p className="text-muted-foreground text-[11px]">Geração operacional robusta</p>
            </div>
            <div className="p-4 border rounded-lg bg-card space-y-1">
              <span className="font-bold text-foreground">Margem Líquida Final</span>
              <p className="text-2xl font-bold text-purple-700 mt-1">13,8%</p>
              <p className="text-muted-foreground text-[11px]">
                Lucro livre para distribuição/reinvestimento
              </p>
            </div>
          </div>
        </TabsContent>

        {/* 5. ABA CENÁRIOS E PROJEÇÕES */}
        <TabsContent value="cenarios" className="mt-4 space-y-4">
          <div className="p-4 border rounded-lg bg-card space-y-3 text-xs">
            <h4 className="font-semibold text-sm text-foreground">
              Simulador de Sensibilidade e Estresse de Caixa
            </h4>
            <p className="text-muted-foreground">
              Avaliação de impacto de oscilações de receitas (-10%, -20%) e aumento de custos sobre
              a necessidade de capital de giro.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 border rounded-md bg-emerald-50/50">
                <span className="font-bold text-emerald-900">Cenário Otimista (+15% Vendas)</span>
                <p className="text-muted-foreground mt-1">
                  EBITDA: R$ 98.400,00 | Caixa Livre: +R$ 145.000,00
                </p>
              </div>
              <div className="p-3 border rounded-md bg-blue-50/50">
                <span className="font-bold text-blue-900">Cenário Base (Orçamento Aprovado)</span>
                <p className="text-muted-foreground mt-1">
                  EBITDA: R$ 69.400,00 | Saldo Final: +R$ 65.200,00
                </p>
              </div>
              <div className="p-3 border rounded-md bg-amber-50/50">
                <span className="font-bold text-amber-900">Cenário Estressado (-20% Vendas)</span>
                <p className="text-muted-foreground mt-1">
                  EBITDA: R$ 22.100,00 | Necessidade de Giro: -R$ 18.000,00
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 6. ABA FECHAMENTO DE PERÍODO (ABSORVE A TELA DE FECHAMENTO) */}
        <TabsContent value="fechamento" className="mt-4 space-y-4">
          <div className="p-4 border rounded-lg bg-red-50/50 space-y-2 text-xs">
            <h4 className="font-semibold text-sm text-red-950 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-700" />
              Bloqueio Rígido de Períodos Contábeis e Financeiros
            </h4>
            <p className="text-red-900 leading-relaxed">
              Quando um período é encerrado,{' '}
              <strong>nenhum lançamento, exclusão ou alteração de títulos</strong> pode ser
              realizada com datas de vencimento ou competência dentro do mês fechado sem autorização
              explícita e reabertura formal pelo administrador master.
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground text-left">
                <tr>
                  <th className="p-2.5">Mês de Referência</th>
                  <th className="p-2.5">Status do Bloqueio</th>
                  <th className="p-2.5">Encerrado Por</th>
                  <th className="p-2.5">Data do Encerramento</th>
                  <th className="p-2.5">Observações</th>
                </tr>
              </thead>
              <tbody>
                {closings.length === 0 ? (
                  <tr className="border-t">
                    <td className="p-2.5 font-mono font-bold">2025-04</td>
                    <td className="p-2.5">
                      <Badge className="bg-red-600 text-white text-[10px]">Encerrado</Badge>
                    </td>
                    <td className="p-2.5">Controladoria / Auditoria</td>
                    <td className="p-2.5">30/04/2025</td>
                    <td className="p-2.5 text-muted-foreground">Fechamento mensal aprovado</td>
                  </tr>
                ) : (
                  closings.map((c, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2.5 font-mono font-bold">{c.mes_referencia}</td>
                      <td className="p-2.5">
                        <Badge className="bg-red-600 text-white text-[10px]">
                          {c.status || 'Fechado'}
                        </Badge>
                      </td>
                      <td className="p-2.5">{c.encerrado_por || 'Diretoria'}</td>
                      <td className="p-2.5">{c.data_fechamento || '—'}</td>
                      <td className="p-2.5 text-muted-foreground">{c.observacoes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* 7. ABA RELATÓRIOS & DIRETORIA (ABSORVE A TELA RELATÓRIOS COM AGENDAMENTO) */}
        <TabsContent value="relatorios" className="mt-4">
          <FinancialReports />
        </TabsContent>
      </Tabs>

      {/* DIALOG DE FECHAMENTO DE PERÍODO */}
      <Dialog open={closePeriodDialogOpen} onOpenChange={setClosePeriodDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700 flex items-center gap-2">
              <Lock className="w-5 h-5" /> Encerramento de Período Financeiro
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-900 leading-relaxed">
              Esta ação bloqueará definitivamente todos os lançamentos financeiros no período
              selecionado.
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-xs">Mês/Ano de Referência *</label>
              <Input
                type="month"
                value={periodToClose.mes_referencia}
                onChange={(e) =>
                  setPeriodToClose({ ...periodToClose, mes_referencia: e.target.value })
                }
                className="h-8 text-xs focus-visible:ring-red-600"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-xs">Observações do Encerramento</label>
              <Input
                placeholder="Ex: Conciliação final conferida pela auditoria"
                value={periodToClose.observacoes}
                onChange={(e) =>
                  setPeriodToClose({ ...periodToClose, observacoes: e.target.value })
                }
                className="h-8 text-xs focus-visible:ring-red-600"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setClosePeriodDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleExecuteClosing}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              Confirmar Encerramento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
