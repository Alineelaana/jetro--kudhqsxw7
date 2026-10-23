import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sliders, BookmarkCheck, RefreshCw, Building2, FileText } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'
import { ControladoriaGenericScreen } from '../controladoria-generic'
import { ControladoriaSavedViews } from '../controladoria-saved-views'
import { ControladoriaComments } from '../controladoria-comments'

export function ScreenConfiguracoesVisoes() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [activeTab, setActiveTab] = useState<'configuracoes' | 'visoes' | 'comentarios'>(
    'configuracoes',
  )
  const [refreshKey, setRefreshKey] = useState(0)

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    toast({ title: 'Configurações e Visões Gerenciais atualizadas' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Configurações e Visões
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Parâmetros & Visões Gerenciais
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Parametrização de regras e tolerâncias da controladoria, visões analíticas salvas e
              comentários executivos nas demonstrações.
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

      {/* ABAS: Configurações | Visões Gerenciais | Comentários */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'configuracoes' | 'visoes' | 'comentarios')}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 p-1 border border-border">
          <TabsTrigger
            value="configuracoes"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <Sliders className="w-3.5 h-3.5" />
            Configurações
          </TabsTrigger>
          <TabsTrigger
            value="visoes"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            Visões Gerenciais
          </TabsTrigger>
          <TabsTrigger
            value="comentarios"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            Comentários da Controladoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuracoes" className="space-y-4">
          <ControladoriaGenericScreen configKey="configuracoes" key={`config-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="visoes" className="space-y-4">
          <ControladoriaSavedViews key={`visoes-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="comentarios" className="space-y-4">
          <ControladoriaComments key={`comentarios-${refreshKey}`} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
