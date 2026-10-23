import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Briefcase, FileText, CheckCircle2, Calendar, Share2, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { MarketingRequestCenter } from '@/components/marketing/marketing-request-center'
import { MarketingJobs } from '@/components/marketing/marketing-jobs'
import { MarketingPieceApproval } from '@/components/marketing/marketing-piece-approval'
import { MarketingEditorialCalendar } from '@/components/marketing/marketing-editorial-calendar'
import { MarketingMediaManager } from '@/components/marketing/marketing-media-manager'

export function ScreenSolicitacoesJobs() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState<
    'solicitacoes' | 'jobs' | 'aprovacao' | 'calendario' | 'midia'
  >('solicitacoes')

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
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Solicitações e Jobs
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Fluxo Criativo & Mídia
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Abertura de briefings, gestão de jobs criativos, esteira de aprovação de peças,
              calendário editorial e gestão de campanhas de mídia.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS */}
      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-5 max-w-3xl h-auto gap-1">
          <TabsTrigger
            value="solicitacoes"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Solicitações</span>
          </TabsTrigger>
          <TabsTrigger value="jobs" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Jobs de Criação</span>
          </TabsTrigger>
          <TabsTrigger
            value="aprovacao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aprovação de Peças</span>
          </TabsTrigger>
          <TabsTrigger
            value="calendario"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>Calendário Editorial</span>
          </TabsTrigger>
          <TabsTrigger value="midia" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Campanhas de Mídia</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: SOLICITAÇÕES */}
        <TabsContent value="solicitacoes" className="space-y-4">
          <MarketingRequestCenter />
        </TabsContent>

        {/* ABA 2: JOBS */}
        <TabsContent value="jobs" className="space-y-4">
          <MarketingJobs />
        </TabsContent>

        {/* ABA 3: APROVAÇÃO */}
        <TabsContent value="aprovacao" className="space-y-4">
          <MarketingPieceApproval />
        </TabsContent>

        {/* ABA 4: CALENDÁRIO */}
        <TabsContent value="calendario" className="space-y-4">
          <MarketingEditorialCalendar />
        </TabsContent>

        {/* ABA 5: MÍDIA */}
        <TabsContent value="midia" className="space-y-4">
          <MarketingMediaManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
