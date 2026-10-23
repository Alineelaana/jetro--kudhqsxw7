import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Database, GraduationCap, RefreshCw, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'
import { AiKnowledgeBase } from '@/components/ai-module/ai-knowledge-base'
import { AiTrainingV2Panel } from '@/components/ai-module/ai-training-v2'

export function ScreenBaseConhecimento() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [activeTab, setActiveTab] = useState<'knowledge' | 'training'>('knowledge')
  const [refreshKey, setRefreshKey] = useState(0)

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    toast({ title: 'Base de Conhecimento e Treinamento atualizados' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Base de Conhecimento
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Inteligência Artificial
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Biblioteca documental da IA, regras organizacionais e calibração de treinamentos com
              exemplos supervisionados.
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

      {/* SUB-ABAS: Base de Conhecimento · Treinamento */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'knowledge' | 'training')}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 p-1 border border-border">
          <TabsTrigger
            value="knowledge"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <Database className="w-3.5 h-3.5" />
            Base de Conhecimento
          </TabsTrigger>
          <TabsTrigger
            value="training"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Treinamento da IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge" className="space-y-4">
          <AiKnowledgeBase key={`kb-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <AiTrainingV2Panel key={`training-${refreshKey}`} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
