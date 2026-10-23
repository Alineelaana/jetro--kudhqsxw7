import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FileCheck2, ShieldCheck, Receipt, FileText, Clock, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { SaCorporateAudit } from '@/components/supplier-allowance/sa-corporate-audit'
import { SaMovements } from '@/components/supplier-allowance/sa-movements'
import { SaTradeExpenses } from '@/components/supplier-allowance/sa-trade-expenses'
import { SaDocuments } from '@/components/supplier-allowance/sa-documents'
import { SaReportVersions } from '@/components/supplier-allowance/sa-report-versions'
import { MarketingAttribution } from '@/components/marketing/marketing-attribution'

export function ScreenRelatoriosAuditoriaMarketing() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState<
    'auditoria' | 'movimentacoes' | 'gastos' | 'atribuicao' | 'documentos'
  >('auditoria')

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Relatórios e Auditoria de Marketing
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Conformidade & Analytics
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Auditoria corporativa de verbas, extrato de movimentações contábeis do ledger, gastos
              de trade marketing, modelos de atribuição de receitas e repositório de documentos
              fiscais/comprobatórios.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS */}
      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-5 max-w-3xl h-auto gap-1">
          <TabsTrigger
            value="auditoria"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Auditoria de Verbas</span>
          </TabsTrigger>
          <TabsTrigger
            value="movimentacoes"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5 text-blue-600" />
            <span>Movimentações</span>
          </TabsTrigger>
          <TabsTrigger value="gastos" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Gastos de Trade</span>
          </TabsTrigger>
          <TabsTrigger
            value="atribuicao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Atribuição de Receita</span>
          </TabsTrigger>
          <TabsTrigger
            value="documentos"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Documentos & Versões</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: AUDITORIA CORPORATIVA */}
        <TabsContent value="auditoria" className="space-y-4">
          <SaCorporateAudit />
        </TabsContent>

        {/* ABA 2: MOVIMENTAÇÕES */}
        <TabsContent value="movimentacoes" className="space-y-4">
          <SaMovements />
        </TabsContent>

        {/* ABA 3: GASTOS DE TRADE */}
        <TabsContent value="gastos" className="space-y-4">
          <SaTradeExpenses />
        </TabsContent>

        {/* ABA 4: ATRIBUIÇÃO DE RECEITA */}
        <TabsContent value="atribuicao" className="space-y-4">
          <MarketingAttribution />
        </TabsContent>

        {/* ABA 5: DOCUMENTOS E VERSÕES */}
        <TabsContent value="documentos" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SaDocuments />
            <SaReportVersions />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
