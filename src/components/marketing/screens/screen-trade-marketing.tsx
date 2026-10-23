import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Store, Calendar, Layers, FileCheck2, Box, PlusCircle, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import type { TradeMarketingAction } from '@/lib/trade-marketing-types'
import { TmCalendar } from '@/components/trade-marketing/tm-calendar'
import { TmMaterials } from '@/components/trade-marketing/tm-materials'
import { TmAccountability } from '@/components/trade-marketing/tm-accountability'
import { TmNewActionDialog } from '@/components/trade-marketing/tm-new-action-dialog'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export function ScreenTradeMarketing() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const { user } = useAuth()
  const [currentTab, setCurrentTab] = useState<
    'acoes' | 'materiais' | 'prestacao' | 'planejamento'
  >('acoes')
  const [actions, setActions] = useState<TradeMarketingAction[]>([])
  const [newActionOpen, setNewActionOpen] = useState(false)

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const reloadActions = () => {
    pb.collection('trade_marketing_actions')
      .getFullList({ sort: '-created' })
      .then((data) => setActions(data as unknown as TradeMarketingAction[]))
      .catch((err) => {
        setActions([])
        toast.error(getErrorMessage(err))
      })
  }

  useEffect(() => {
    reloadActions()
  }, [])

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Trade Marketing
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Ações no Ponto de Venda
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Execução de campanhas no PDV, cronograma e calendário de ações, catálogo de materiais
              promocionais, prestação de contas com comprovantes e planejamento anual.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setNewActionOpen(true)}
            className="text-xs bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Nova Ação Trade
          </Button>
        </div>
      </div>

      {/* ABAS */}
      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-4 max-w-2xl h-auto gap-1">
          <TabsTrigger value="acoes" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Ações & Calendário</span>
          </TabsTrigger>
          <TabsTrigger
            value="materiais"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Box className="w-3.5 h-3.5 text-blue-600" />
            <span>Materiais PDV</span>
          </TabsTrigger>
          <TabsTrigger
            value="prestacao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Prestação de Contas</span>
          </TabsTrigger>
          <TabsTrigger
            value="planejamento"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Planejamento Anual</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: AÇÕES E CALENDÁRIO */}
        <TabsContent value="acoes" className="space-y-4">
          <TmCalendar actions={actions} onEdit={() => {}} />
        </TabsContent>

        {/* ABA 2: MATERIAIS PDV */}
        <TabsContent value="materiais" className="space-y-4">
          <TmMaterials />
        </TabsContent>

        {/* ABA 3: PRESTAÇÃO DE CONTAS */}
        <TabsContent value="prestacao" className="space-y-4">
          <TmAccountability />
        </TabsContent>

        {/* ABA 4: PLANEJAMENTO ANUAL */}
        <TabsContent value="planejamento" className="space-y-4">
          <TmCalendar actions={actions} onEdit={() => {}} initialView="kanban" />
        </TabsContent>
      </Tabs>

      <TmNewActionDialog
        open={newActionOpen}
        onOpenChange={setNewActionOpen}
        onSaved={reloadActions}
        userName={(user?.name as string) || ''}
      />
    </div>
  )
}
