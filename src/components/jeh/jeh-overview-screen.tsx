import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { canManageJehAssistant } from '@/lib/permissions'
import {
  JehAssistantService,
  type JehOverviewStats,
  type JehAssistantStatus,
} from '@/services/jeh-assistant'
import { JehPageHeader } from './jeh-header'
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Power,
  PowerOff,
  Activity,
  Layers,
  ShieldAlert,
} from 'lucide-react'

export function JehOverviewScreen() {
  const [stats, setStats] = useState<JehOverviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusDialogMode, setStatusDialogMode] = useState<JehAssistantStatus | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const { toast } = useToast()

  const userRole = (pb.authStore.record as any)?.role
  const hasAdminPerm = canManageJehAssistant(userRole)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await JehAssistantService.getOverviewStats()
      setStats(data)
    } catch {
      toast({
        title: 'Erro ao carregar indicadores',
        description: 'Não foi possível carregar as métricas da assistente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleConfirmStatusChange = async () => {
    if (!statusDialogMode || !hasAdminPerm) return
    setUpdatingStatus(true)
    try {
      await JehAssistantService.setAssistantStatus(statusDialogMode)
      toast({
        title: `Assistente ${statusDialogMode === 'ativa' ? 'Ativada' : 'Desativada'} com sucesso`,
        description: `O status operacional foi atualizado no banco para "${statusDialogMode}".`,
      })
      setStatusDialogMode(null)
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Falha ao alterar status',
        description: err.message || 'Erro de comunicação com o backend.',
        variant: 'destructive',
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const isAtiva = stats?.assistantStatus === 'ativa'

  return (
    <div className="space-y-6">
      <JehPageHeader
        title="Visão Geral da Assistente Jeh"
        description="Monitoramento operacional, indicadores consolidados de aprendizado e governança de status."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-8 text-xs font-medium border-[#005B2E]/30 text-[#005B2E] hover:bg-[#005B2E]/10"
          >
            <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Indicadores
          </Button>
        }
      />

      {/* BANNER DE GOVERNANÇA DO STATUS OPERACIONAL */}
      <Card className="border-2 border-border shadow-sm overflow-hidden">
        <div
          className={`p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            isAtiva
              ? 'bg-emerald-50/70 border-b border-emerald-200'
              : 'bg-amber-50/70 border-b border-amber-200'
          }`}
        >
          <div className="flex items-start md:items-center gap-3.5">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#C9A227] shrink-0 shadow-md bg-[#00381C]">
              <img
                src={JEH_AVATAR_URL}
                alt="Srta. Jeh"
                className="w-full h-full object-cover rounded-full"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  isAtiva ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={isAtiva ? 'Online / Ativa' : 'Pausada'}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Status Operacional:
                </span>
                <Badge
                  className={`text-xs font-bold ${
                    isAtiva
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  {isAtiva ? 'ATIVA PARA ATENDIMENTO' : 'INATIVA (EM TREINAMENTO)'}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                {isAtiva
                  ? 'A Assistente Jeh está habilitada para atender consultas institucionais públicas e direcionadas. Todas as respostas utilizam a base oficial validada.'
                  : 'A Assistente Jeh está pausada para o público externo (rejeita com 403). O ambiente de testes internos e treinamento continua 100% operacional para validações.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {isAtiva ? (
              <Button
                variant="destructive"
                size="sm"
                disabled={!hasAdminPerm}
                onClick={() => setStatusDialogMode('inativa')}
                className="font-medium text-xs h-9"
              >
                <PowerOff className="w-4 h-4 mr-1.5" />
                Desativar Assistente
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                disabled={!hasAdminPerm}
                onClick={() => setStatusDialogMode('ativa')}
                className="font-medium text-xs h-9 bg-[#005B2E] hover:bg-[#01361D] text-white"
              >
                <Power className="w-4 h-4 mr-1.5" />
                Ativar Assistente
              </Button>
            )}
          </div>
        </div>

        {!hasAdminPerm && (
          <div className="px-6 py-2 bg-gray-50 text-[11px] text-gray-500 border-t flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>
              Apenas perfis administradores e supervisores possuem autorização para alterar o status
              operacional.
            </span>
          </div>
        )}
      </Card>

      {/* CARDS DE INDICADORES QUANTITATIVOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-xs hover:border-[#005B2E]/40 transition-all">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Perguntas Totais
            </CardTitle>
            <HelpCircle className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-black text-gray-900">{stats?.totalQuestions ?? 0}</div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Volume total registrado na plataforma
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs hover:border-[#005B2E]/40 transition-all">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Respondidas / Q&A
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-black text-emerald-700">{stats?.answeredCount ?? 0}</div>
            <p className="text-[11px] text-gray-500 mt-0.5">Respostas oficiais mapeadas e ativas</p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs hover:border-[#005B2E]/40 transition-all">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Sem Resposta
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-black text-amber-700">{stats?.unansweredCount ?? 0}</div>
            <p className="text-[11px] text-gray-500 mt-0.5">Ocorrências aguardando tratamento</p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs hover:border-[#005B2E]/40 transition-all">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Precisão em Testes
            </CardTitle>
            <Activity className="w-4 h-4 text-[#C9A227]" />
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900">
                {stats?.evaluatedCorrectCount ?? 0}
              </span>
              <span className="text-xs text-emerald-600 font-semibold">corretas</span>
              <span className="text-xs text-gray-300">/</span>
              <span className="text-sm font-semibold text-amber-600">
                {stats?.evaluatedImprovementCount ?? 0}
              </span>
              <span className="text-[11px] text-gray-500">a revisar</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">Avaliações nos testes internos</p>
          </CardContent>
        </Card>
      </div>

      {/* ASSUNTOS MAIS CONSULTADOS E METADADOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#005B2E]" />
              Principais Assuntos Consultados
            </CardTitle>
            <CardDescription className="text-xs">
              Categorias com maior volume de perguntas e acessos na base de conhecimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            {!stats?.topSubjects || stats.topSubjects.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                Nenhum registro de consulta encontrado ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topSubjects.map((item, index) => {
                  const maxCount = stats.topSubjects[0]?.count || 1
                  const pct = Math.round((item.count / maxCount) * 100)
                  return (
                    <div key={item.subject} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-gray-400 font-mono text-[11px]">
                            {index + 1}º
                          </span>
                          <span className="font-semibold text-gray-800">{item.subject}</span>
                        </div>
                        <span className="text-gray-500 font-medium">
                          {item.count} acessos / ocorrências
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#005B2E] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">
                Governança & Integridade
              </CardTitle>
              <CardDescription className="text-xs">
                Controles e rastreabilidade institucional da assistente.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border space-y-1">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                  Última Atualização da Base
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {stats?.lastKnowledgeUpdate
                    ? new Date(stats.lastKnowledgeUpdate).toLocaleString('pt-BR')
                    : 'Sem alterações recentes'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border space-y-1">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                  Agente Vinculado
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-700">jeh-institucional</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    Nativo Skip Cloud
                  </Badge>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border space-y-1">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                  Regra de Segurança
                </span>
                <p className="text-[11px] text-gray-600 leading-tight">
                  Proibição estrita de alucinação e bloqueio total de acesso a dados operacionais
                  (clientes, faturamento, estoque).
                </p>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* DIÁLOGO DE CONFIRMAÇÃO DE ALTERAÇÃO DE STATUS */}
      <Dialog open={!!statusDialogMode} onOpenChange={(open) => !open && setStatusDialogMode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              {statusDialogMode === 'ativa' ? (
                <>
                  <Power className="w-5 h-5 text-emerald-600" />
                  Confirmar Ativação da Assistente Jeh
                </>
              ) : (
                <>
                  <PowerOff className="w-5 h-5 text-amber-600" />
                  Confirmar Desativação da Assistente Jeh
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600 pt-1">
              {statusDialogMode === 'ativa' ? (
                <>
                  Ao ativar, a Assistente Jeh passará a responder publicamente às perguntas dos
                  usuários. Certifique-se de que a base de conhecimento e as perguntas e respostas
                  oficiais foram aprovadas e testadas.
                </>
              ) : (
                <>
                  Ao desativar, qualquer chamada pública ao endpoint de chat receberá retorno HTTP
                  403 (Assistente Inativa). Os testes internos continuarão funcionando normalmente.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {statusDialogMode === 'ativa' && (
            <Alert className="border-emerald-200 bg-emerald-50/70 text-emerald-900 py-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <AlertTitle className="text-xs font-semibold">
                Confirmação de Responsabilidade
              </AlertTitle>
              <AlertDescription className="text-[11px] text-emerald-800">
                Esta ação ficará registrada com o seu usuário (
                {pb.authStore.record?.email || 'Administrador'}).
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusDialogMode(null)}
              disabled={updatingStatus}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmStatusChange}
              disabled={updatingStatus}
              className={`text-xs text-white ${
                statusDialogMode === 'ativa'
                  ? 'bg-[#005B2E] hover:bg-[#01361D]'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {updatingStatus
                ? 'Salvando...'
                : statusDialogMode === 'ativa'
                  ? 'Sim, Ativar Agora'
                  : 'Sim, Desativar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
