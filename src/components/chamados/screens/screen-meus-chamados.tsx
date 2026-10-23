import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Inbox, PlusCircle, FileText, RefreshCw, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'

// Reutilização dos componentes existentes
import MeusChamadosScreen from '@/components/chamados/meus-chamados-screen'
import NovoChamadoScreen from '@/components/chamados/novo-chamado-screen'
import ChamadoDetalhesScreen from '@/components/chamados/chamado-detalhes-screen'

export function ScreenMeusChamados() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const tabParam = searchParams.get('tab')
  const idParam = searchParams.get('id')

  // Determinar aba ativa inicial a partir da query string
  const getInitialTab = (): 'meus' | 'novo' | 'acompanhamento' => {
    if (tabParam === 'novo') return 'novo'
    if (tabParam === 'detalhe' || tabParam === 'acompanhamento' || idParam) return 'acompanhamento'
    return 'meus'
  }

  const [activeTab, setActiveTab] = useState<'meus' | 'novo' | 'acompanhamento'>(getInitialTab())
  const [refreshKey, setRefreshKey] = useState(0)

  // Sincronizar activeTab quando os searchParams mudarem
  useEffect(() => {
    const t = searchParams.get('tab')
    const id = searchParams.get('id')
    if (t === 'novo') {
      setActiveTab('novo')
    } else if (t === 'detalhe' || t === 'acompanhamento' || id) {
      setActiveTab('acompanhamento')
    } else if (t === 'meus') {
      setActiveTab('meus')
    }
  }, [searchParams])

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const handleTabChange = (val: string) => {
    const nextTab = val as 'meus' | 'novo' | 'acompanhamento'
    setActiveTab(nextTab)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('tab', nextTab)
    if (nextTab !== 'acompanhamento') {
      newParams.delete('id')
    }
    setSearchParams(newParams, { replace: true })
  }

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    toast({ title: 'Dados de Meus Chamados atualizados' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO PADRÃO MULTITENANT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">Meus Chamados</h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                TI & Suporte Corporativo
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Abertura de tickets, acompanhamento de demandas corporativas e histórico de
              atendimento.
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

      {/* SUB-ABAS: Meus Chamados · Novo Chamado · Acompanhamento */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 border border-border">
          <TabsTrigger
            value="meus"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <Inbox className="w-3.5 h-3.5" />
            Meus Chamados
          </TabsTrigger>
          <TabsTrigger
            value="novo"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Novo Chamado
          </TabsTrigger>
          <TabsTrigger
            value="acompanhamento"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            Acompanhamento
          </TabsTrigger>
        </TabsList>

        {/* 1. Lista de Chamados */}
        <TabsContent value="meus" className="space-y-4">
          <MeusChamadosScreen key={`meus-${refreshKey}`} />
        </TabsContent>

        {/* 2. Abertura de Novo Chamado */}
        <TabsContent value="novo" className="space-y-4">
          <NovoChamadoScreen key={`novo-${refreshKey}`} />
        </TabsContent>

        {/* 3. Acompanhamento / Detalhes */}
        <TabsContent value="acompanhamento" className="space-y-4">
          {idParam ? (
            <ChamadoDetalhesScreen key={`detalhe-${idParam}-${refreshKey}`} />
          ) : (
            <div className="border border-dashed rounded-xl p-10 text-center space-y-3 bg-muted/20">
              <FileText className="w-10 h-10 mx-auto text-muted-foreground/50" />
              <h3 className="font-bold text-base text-foreground">
                Nenhum chamado selecionado para acompanhamento
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Selecione um chamado na aba &quot;Meus Chamados&quot; ou na Central de Chamados para
                visualizar o histórico completo de interações, anexos e status de SLA.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTabChange('meus')}
                className="text-xs text-[#005B2E]"
              >
                Voltar para Meus Chamados
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
