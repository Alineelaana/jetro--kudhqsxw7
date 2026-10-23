import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LockKeyhole, CheckCheck, Building, Shuffle, Eye, RefreshCw, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'
import { ControladoriaClosing } from '../controladoria-closing'
import { ControladoriaGenericScreen } from '../controladoria-generic'

export function ScreenFechamentoConsolidacao() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [activeTab, setActiveTab] = useState<
    'fechamento' | 'consolidacao' | 'reclassificacoes' | 'materialidade'
  >('fechamento')
  const [refreshKey, setRefreshKey] = useState(0)

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    toast({ title: 'Fechamento e Consolidação atualizados' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <LockKeyhole className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Fechamento e Consolidação
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Governança Contábil & Gerencial
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Rotina oficial de fechamento mensal com snapshots imutáveis, consolidação
              multi-empresa, reclassificações gerenciais e motor de materialidade.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="text-xs focus-visible:ring-[#005B2E]"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* ABAS: Fechamento | Consolidação | Reclassificações | Materialidade */}
      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          setActiveTab(v as 'fechamento' | 'consolidacao' | 'reclassificacoes' | 'materialidade')
        }
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 p-1 border border-border">
          <TabsTrigger
            value="fechamento"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Fechamento Gerencial
          </TabsTrigger>
          <TabsTrigger
            value="consolidacao"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <Building className="w-3.5 h-3.5" />
            Consolidação
          </TabsTrigger>
          <TabsTrigger
            value="reclassificacoes"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Reclassificações
          </TabsTrigger>
          <TabsTrigger
            value="materialidade"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <Eye className="w-3.5 h-3.5" />
            Materialidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fechamento" className="space-y-4">
          <ControladoriaClosing key={`closing-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="consolidacao" className="space-y-4">
          <ControladoriaGenericScreen
            configKey="consolidation"
            key={`consolidacao-${refreshKey}`}
          />
        </TabsContent>

        <TabsContent value="reclassificacoes" className="space-y-4">
          <ControladoriaGenericScreen configKey="reclassifications" key={`reclass-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="materialidade" className="space-y-4">
          <ControladoriaGenericScreen configKey="materiality" key={`mat-${refreshKey}`} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
