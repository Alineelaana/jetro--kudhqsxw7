import { useState, useEffect, useCallback } from 'react'
import {
  Brain,
  BookOpen,
  Compass,
  FolderGit2,
  Scale,
  Radar,
  Network,
  Lightbulb,
  MessageSquare,
  Settings,
  Lock,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import {
  canViewSegundoCerebro,
  canConsultSegundoCerebroDocs,
  canUseSegundoCerebroAI,
  canViewStrategicIntelligence,
  canViewConfidentialDocs,
  canAdminSegundoCerebroIntegrations,
} from '@/lib/permissions'
import {
  getSegundoCerebroMetrics,
  listSegundoCerebroDocs,
  listSegundoCerebroDecisions,
  listSegundoCerebroOpportunities,
  listSegundoCerebroInsights,
  listSegundoCerebroSyncLogs,
  listUserChats,
  createChat,
  toggleChatFavorite,
} from '@/services/segundo-cerebro'
import type {
  SegundoCerebroDoc,
  SegundoCerebroDecision,
  SegundoCerebroOpportunity,
  SegundoCerebroInsight,
  SegundoCerebroSyncLog,
  SegundoCerebroChat,
  SegundoCerebroMetrics,
} from '@/types/segundo-cerebro'

import { SegundoCerebroHeader } from './segundo-cerebro-header'
import { SegundoCerebroAssistant } from './segundo-cerebro-assistant'
import { SegundoCerebroLibrary } from './segundo-cerebro-library'
import { SegundoCerebroAdvisor } from './segundo-cerebro-advisor'
import { SegundoCerebroProjects } from './segundo-cerebro-projects'
import { SegundoCerebroDecisions } from './segundo-cerebro-decisions'
import { SegundoCerebroRadar } from './segundo-cerebro-radar'
import { SegundoCerebroKnowledgeMap } from './segundo-cerebro-knowledge-map'
import { SegundoCerebroInsights } from './segundo-cerebro-insights'
import { SegundoCerebroHistory } from './segundo-cerebro-history'
import { SegundoCerebroSettings } from './segundo-cerebro-settings'

export function SegundoCerebroScreen() {
  const { toast } = useToast()
  const user = pb.authStore.record
  const userRole = user?.role as string | undefined

  // Checagem de permissão principal
  const hasAccess = canViewSegundoCerebro(userRole)
  const canStrategic = canViewStrategicIntelligence(userRole)
  const canConfidential = canViewConfidentialDocs(userRole)
  const canAdmin = canAdminSegundoCerebroIntegrations(userRole)

  // Estado das abas
  const [activeTab, setActiveTab] = useState<string>('assistente')

  // Estados de dados
  const [metrics, setMetrics] = useState<SegundoCerebroMetrics>({
    totalDocs: 0,
    totalAreas: 0,
    totalProjects: 0,
    totalDecisions: 0,
    totalOpportunities: 0,
    pendingReviews: 0,
    lastSyncDate: null,
  })
  const [documents, setDocuments] = useState<SegundoCerebroDoc[]>([])
  const [decisions, setDecisions] = useState<SegundoCerebroDecision[]>([])
  const [opportunities, setOpportunities] = useState<SegundoCerebroOpportunity[]>([])
  const [insights, setInsights] = useState<SegundoCerebroInsight[]>([])
  const [syncLogs, setSyncLogs] = useState<SegundoCerebroSyncLog[]>([])
  const [chats, setChats] = useState<SegundoCerebroChat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | undefined>()

  const [isLoading, setIsLoading] = useState(true)

  // Modal de documento aberto a partir de qualquer aba (citações, decisões, mapa)
  const [modalDoc, setModalDoc] = useState<Partial<SegundoCerebroDoc> | null>(null)

  // Carregar dados gerais
  const loadData = useCallback(async () => {
    if (!hasAccess) return
    setIsLoading(true)
    try {
      const [m, docs, decs, opps, ins, logs, userChats] = await Promise.all([
        getSegundoCerebroMetrics(),
        listSegundoCerebroDocs({ canConfidential, canStrategic }),
        listSegundoCerebroDecisions(),
        listSegundoCerebroOpportunities(),
        listSegundoCerebroInsights(),
        listSegundoCerebroSyncLogs(),
        listUserChats(),
      ])

      setMetrics(m)
      setDocuments(docs)
      setDecisions(decs)
      setOpportunities(opps)
      setInsights(ins)
      setSyncLogs(logs)
      setChats(userChats)
    } catch (err) {
      console.error('Erro ao carregar dados do Segundo Cérebro:', err)
      toast({
        title: 'Erro de carregamento',
        description: 'Não foi possível carregar os dados completos do módulo.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [hasAccess, canConfidential, canStrategic, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Caso o usuário não tenha permissão de acesso ao módulo
  if (!hasAccess) {
    return (
      <div className="p-8 max-w-md mx-auto my-12 text-center bg-white border border-gray-200 rounded-xl shadow-xs">
        <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Acesso Restrito</h2>
        <p className="text-xs text-gray-600 mt-1">
          Você não possui permissão para acessar o módulo{' '}
          <strong>Segundo Cérebro da Empresa</strong>. Solicite autorização ao administrador do
          sistema.
        </p>
      </div>
    )
  }

  const handleOpenDoc = (doc: Partial<SegundoCerebroDoc>) => {
    // Localizar documento completo se só tiver id ou título
    const full = documents.find((d) => d.id === doc.id || d.title === doc.title)
    setModalDoc(full || doc)
    setActiveTab('biblioteca')
  }

  const handleSelectChat = (chat: SegundoCerebroChat) => {
    setCurrentChatId(chat.id)
    setActiveTab('assistente')
  }

  const handleNewChat = async () => {
    try {
      const created = await createChat({
        title: `Nova Consulta ${new Date().toLocaleDateString('pt-BR')}`,
      })
      setCurrentChatId(created.id)
      setChats((prev) => [created, ...prev])
      setActiveTab('assistente')
    } catch {
      /* intentionally ignored */
    }
  }

  const handleToggleFavoriteChat = async (chatId: string, current: boolean) => {
    try {
      await toggleChatFavorite(chatId, current)
      setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, is_favorite: !current } : c)))
    } catch {
      /* intentionally ignored */
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Cabeçalho com Identidade Jetro & Indicadores Reais */}
      <SegundoCerebroHeader metrics={metrics} isLoading={isLoading} onRefresh={loadData} />

      {/* 2. Navegação Interna por Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto pb-1 scrollbar-thin">
          <TabsList className="bg-stone-100/90 p-1 rounded-xl h-auto flex flex-nowrap border border-gray-200 min-w-max">
            <TabsTrigger
              value="assistente"
              className="text-xs font-semibold py-2 px-3 data-[state=active]:bg-[#005B2E] data-[state=active]:text-white flex items-center gap-1.5 rounded-lg"
            >
              <Brain className="w-3.5 h-3.5 text-[#E4C46A]" />
              Assistente IA
            </TabsTrigger>

            <TabsTrigger
              value="biblioteca"
              className="text-xs font-semibold py-2 px-3 data-[state=active]:bg-[#005B2E] data-[state=active]:text-white flex items-center gap-1.5 rounded-lg"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Biblioteca ({documents.length})
            </TabsTrigger>

            {canStrategic && (
              <TabsTrigger
                value="conselheiro"
                className="text-xs font-semibold py-2 px-3 data-[state=active]:bg-[#005B2E] data-[state=active]:text-white flex items-center gap-1.5 rounded-lg"
              >
                <Compass className="w-3.5 h-3.5" />
                Conselheiro Estratégico
              </TabsTrigger>
            )}

            <TabsTrigger
              value="projetos"
              className="text-xs font-semibold py-2 px-3 data-[state=active]:bg-[#005B2E] data-[state=active]:text-white flex items-center gap-1.5 rounded-lg"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              Memória de Projetos
            </TabsTrigger>

            <TabsTrigger
              value="decisoes"
              className="text-xs font-semibold py-2 px-3 data-[state=active]:bg-[#005B2E] data-[state=active]:text-white flex items-center gap-1.5 rounded-lg"
            >
              <Scale className="w-3.5 h-3.5" />
              Decisões ({decisions.length})
            </TabsTrigger>

            {canStrategic && (
              <TabsTrigger
                value="radar"
                className="text-xs font-semibold py-2 px-3 data-[state=active]:bg-[#005B2E] data-[state=active]:text-white flex items-center gap-1.5 rounded-lg"
              >
                <Radar className="w-3.5 h-3.5 text-emerald-400" />
                Radar ({opportunities.length})
              </TabsTrigger>
            )}

            <TabsTrigger
              value="mapa"
              className="text-xs font-semibold py-2 px-3 data-[state=active]:bg-[#005B2E] data-[state=active]:text-white flex items-center gap-1.5 rounded-lg"
            >
              <Network className="w-3.5 h-3.5" />
              Mapa de Conhecimento
            </TabsTrigger>

            <TabsTrigger
              value="insights"
              className="text-xs font-semibold py-2 px-3 data-[state=active]:bg-[#005B2E] data-[state=active]:text-white flex items-center gap-1.5 rounded-lg"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Insights & Processos
            </TabsTrigger>

            <TabsTrigger
              value="historico"
              className="text-xs font-semibold py-2 px-3 data-[state=active]:bg-[#005B2E] data-[state=active]:text-white flex items-center gap-1.5 rounded-lg"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Histórico
            </TabsTrigger>

            {canAdmin && (
              <TabsTrigger
                value="configuracoes"
                className="text-xs font-semibold py-2 px-3 data-[state=active]:bg-[#005B2E] data-[state=active]:text-white flex items-center gap-1.5 rounded-lg"
              >
                <Settings className="w-3.5 h-3.5" />
                Configurações & Obsidian
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Conteúdo das Abas */}
        <TabsContent value="assistente" className="mt-0">
          <SegundoCerebroAssistant currentChatId={currentChatId} onSelectDocument={handleOpenDoc} />
        </TabsContent>

        <TabsContent value="biblioteca" className="mt-0">
          <SegundoCerebroLibrary
            documents={documents}
            isLoading={isLoading}
            onRefresh={loadData}
            selectedDocModal={modalDoc}
            onCloseSelectedDocModal={() => setModalDoc(null)}
          />
        </TabsContent>

        {canStrategic && (
          <TabsContent value="conselheiro" className="mt-0">
            <SegundoCerebroAdvisor />
          </TabsContent>
        )}

        <TabsContent value="projetos" className="mt-0">
          <SegundoCerebroProjects
            documents={documents}
            decisions={decisions}
            onOpenDoc={handleOpenDoc}
          />
        </TabsContent>

        <TabsContent value="decisoes" className="mt-0">
          <SegundoCerebroDecisions
            decisions={decisions}
            isLoading={isLoading}
            onOpenDoc={handleOpenDoc}
          />
        </TabsContent>

        {canStrategic && (
          <TabsContent value="radar" className="mt-0">
            <SegundoCerebroRadar
              opportunities={opportunities}
              isLoading={isLoading}
              onRefresh={loadData}
              onOpenDoc={handleOpenDoc}
            />
          </TabsContent>
        )}

        <TabsContent value="mapa" className="mt-0">
          <SegundoCerebroKnowledgeMap
            documents={documents}
            decisions={decisions}
            onOpenDoc={handleOpenDoc}
          />
        </TabsContent>

        <TabsContent value="insights" className="mt-0">
          <SegundoCerebroInsights
            insights={insights}
            isLoading={isLoading}
            onOpenDoc={handleOpenDoc}
          />
        </TabsContent>

        <TabsContent value="historico" className="mt-0">
          <SegundoCerebroHistory
            chats={chats}
            isLoading={isLoading}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onToggleFavorite={handleToggleFavoriteChat}
          />
        </TabsContent>

        {canAdmin && (
          <TabsContent value="configuracoes" className="mt-0">
            <SegundoCerebroSettings
              syncLogs={syncLogs}
              onSyncCompleted={loadData}
              userRole={userRole}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
