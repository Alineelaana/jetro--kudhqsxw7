import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  BarChart2,
  TrendingUp,
  Users,
  GitCommit,
  Download,
  Building2,
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'
import { exportCsv } from '@/lib/csv-export'
import { SalesReports } from '@/components/sales/sales-reports'
import { CrmReports } from '@/components/crm/crm-reports'
import { BiCommercial } from '@/components/bi/centers/bi-commercial'

export function ScreenRelatoriosComerciais() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('vendas')

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const handleExportBatch = (tipo: string) => {
    const dataHora = new Date().toISOString().slice(0, 10)
    if (tipo === 'vendas') {
      const headers = [
        'Canal',
        'Total Pedidos',
        'Faturamento (R$)',
        'Ticket Médio (R$)',
        'Margem (%)',
      ]
      const rows = [
        ['Varejo Geral', 142, 689000, 4852.11, 24.5],
        ['Atacado / Distribuição', 45, 1250000, 27777.78, 18.2],
        ['Farma / Hospitalar', 88, 890000, 10113.64, 28.0],
        ['E-commerce / B2B', 210, 430000, 2047.62, 31.4],
      ]
      exportCsv(`relatorio_vendas_consolidado_${dataHora}`, headers, rows)
      toast({ title: 'Relatório de vendas exportado com sucesso' })
    } else if (tipo === 'carteira') {
      const headers = [
        'Segmento',
        'Clientes Ativos',
        'Inativos (>60d)',
        'Positivação (%)',
        'Total Faturado (R$)',
      ]
      const rows = [
        ['Curva A (Top 20%)', 48, 2, 95.8, 1850000],
        ['Curva B (30%)', 112, 8, 92.8, 890000],
        ['Curva C (50%)', 340, 45, 86.7, 519000],
      ]
      exportCsv(`analise_carteira_clientes_${dataHora}`, headers, rows)
      toast({ title: 'Análise de carteira exportada com sucesso' })
    } else if (tipo === 'crm') {
      const headers = ['Etapa do Funil', 'Oportunidades', 'Valor Total (R$)', 'Taxa Conversão (%)']
      const rows = [
        ['Prospecção', 85, 950000, 100],
        ['Qualificação', 62, 740000, 72.9],
        ['Proposta Apresentada', 44, 520000, 51.7],
        ['Negociação', 28, 380000, 32.9],
        ['Fechamento / Ganho', 19, 290000, 22.3],
      ]
      exportCsv(`funil_conversao_crm_${dataHora}`, headers, rows)
      toast({ title: 'Relatório de funil exportado com sucesso' })
    }
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Relatórios Comerciais
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Inteligência Analítica de Vendas
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Visões consolidadas de faturamento por período, produto e canal, análise da carteira
              de clientes, funil de conversão CRM e central de exportações em CSV/Excel e PDF.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            className="text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Imprimir Relatório
          </Button>
        </div>
      </div>

      {/* ABAS */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-4 max-w-xl h-auto gap-1">
          <TabsTrigger value="vendas" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Vendas & Faturamento</span>
          </TabsTrigger>
          <TabsTrigger
            value="carteira"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Análise de Carteira</span>
          </TabsTrigger>
          <TabsTrigger value="funil" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5 text-purple-600" />
            <span>Funil & Conversão</span>
          </TabsTrigger>
          <TabsTrigger
            value="exportacoes"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>Exportações</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: VENDAS & FATURAMENTO */}
        <TabsContent value="vendas" className="space-y-4">
          <SalesReports />
        </TabsContent>

        {/* ABA 2: ANÁLISE DE CARTEIRA (BI COMERCIAL CONSOLIDADO) */}
        <TabsContent value="carteira" className="space-y-4">
          <BiCommercial />
        </TabsContent>

        {/* ABA 3: FUNIL & CONVERSÃO (RELATÓRIOS CRM) */}
        <TabsContent value="funil" className="space-y-4">
          <CrmReports />
        </TabsContent>

        {/* ABA 4: CENTRAL DE EXPORTAÇÕES */}
        <TabsContent value="exportacoes" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="border-b pb-3">
                <h3 className="text-base font-bold text-foreground">
                  Central de Exportações Comerciais
                </h3>
                <p className="text-xs text-muted-foreground">
                  Gere downloads diretos de relatórios consolidados em formatos abertos para
                  auditoria e análises executivas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Vendas Consolidadas</span>
                    <FileSpreadsheet className="w-4 h-4 text-[#005B2E]" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Faturamento agrupado por canal, margem média, ticket por pedido e totais
                    faturados.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleExportBatch('vendas')}
                    className="w-full bg-[#005B2E] hover:bg-[#004724] text-white font-bold text-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Exportar Planilha (CSV)
                  </Button>
                </div>

                <div className="p-4 rounded-xl border bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Carteira & Curva ABC</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Concentração de faturamento, clientes ativos, inativos em risco e taxas de
                    positivação.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleExportBatch('carteira')}
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Exportar Planilha (CSV)
                  </Button>
                </div>

                <div className="p-4 rounded-xl border bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Funil de Vendas & CRM</span>
                    <GitCommit className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Oportunidades em aberto, taxa de conversão por etapa do funil e motivos de
                    perda.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleExportBatch('crm')}
                    variant="outline"
                    className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 font-bold text-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Exportar Planilha (CSV)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
