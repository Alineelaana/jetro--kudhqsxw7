import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  Clock,
  Radio,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Laptop,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogOut,
  Ban,
  FileSpreadsheet,
  FileText,
  Lock,
  Layers,
  Info,
} from 'lucide-react'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import { exportToExcel, exportToPdf } from '@/components/jetro-table/table-export'
import type {
  UserAuditRecord,
  AuthEvent,
  AuditSession,
  AuditAlert,
  DeviceSummary,
} from '@/services/user-audit-service'
import {
  aggregateUserDevices,
  terminateUserSession,
  logSensitiveAccessConsultation,
} from '@/services/user-audit-service'

interface UserDetailsScreenProps {
  user: UserAuditRecord
  events: AuthEvent[]
  sessions: AuditSession[]
  alerts: AuditAlert[]
  onBack: () => void
  onRefresh: () => void
  canViewPreciseCoords: boolean
  canTerminateSessions: boolean
  canExport: boolean
}

export function UserDetailsScreen({
  user,
  events,
  sessions,
  alerts,
  onBack,
  onRefresh,
  canViewPreciseCoords,
  canTerminateSessions,
  canExport,
}: UserDetailsScreenProps) {
  const [activeTab, setActiveTab] = useState('summary')
  const [preciseCoordsRevealed, setPreciseCoordsRevealed] = useState(false)
  const [revealingCoords, setRevealingCoords] = useState(false)

  // Encerramento de sessão
  const [terminateConfirm, setTerminateConfirm] = useState<{
    open: boolean
    all: boolean
    sessionId?: string
  }>({
    open: false,
    all: false,
  })
  const [terminating, setTerminating] = useState(false)

  // Dispositivos consolidados
  const devices: DeviceSummary[] = useMemo(() => aggregateUserDevices(events), [events])

  // Indicadores consolidados do topo
  const totalLogins = useMemo(
    () => events.filter((e) => e.event_type === 'login' && e.result === 'sucesso').length,
    [events],
  )
  const failedAttempts = useMemo(() => events.filter((e) => e.result === 'falha').length, [events])
  const uniqueIps = useMemo(() => {
    const s = new Set<string>()
    events.forEach((e) => {
      if (e.ip_address) s.add(e.ip_address)
    })
    return s.size
  }, [events])

  const activeSessionsList = useMemo(
    () => sessions.filter((s) => s.status === 'active' && !s.is_invalidated),
    [sessions],
  )

  // Eventos com coordenadas para o mapa interativo
  const mapPoints = useMemo(() => {
    return events
      .filter(
        (e) =>
          e.latitude !== null &&
          e.latitude !== undefined &&
          e.longitude !== null &&
          e.longitude !== undefined,
      )
      .map((e) => ({
        id: e.id,
        created: e.created,
        ip: e.ip_address || 'Informação não registrada',
        device: e.device_type || 'Desktop',
        locationOrigin: e.location_origin || 'ip',
        city: e.city || 'Desconhecida',
        state: e.state || '',
        country: e.country || 'Brasil',
        lat: Number(e.latitude),
        lon: Number(e.longitude),
        accuracy:
          e.accuracy_meters || (e.location_origin === 'geolocalizacao_autorizada' ? 25 : 5000),
      }))
  }, [events])

  // Ação de auditoria: revelar coordenadas precisas
  const handleRevealPreciseCoords = async () => {
    if (preciseCoordsRevealed) return
    setRevealingCoords(true)
    try {
      await logSensitiveAccessConsultation({
        targetUserId: user.id,
        targetUserName: user.name,
        actionConsulted: 'visualizar_coordenadas_precisas',
        justification: 'Auditoria de segurança de acesso em conformidade com LGPD',
      })
      setPreciseCoordsRevealed(true)
    } finally {
      setRevealingCoords(false)
    }
  }

  // Executar encerramento real de sessão
  const handleExecuteTerminate = async () => {
    setTerminating(true)
    try {
      await terminateUserSession({
        userId: user.id,
        sessionId: terminateConfirm.sessionId,
        terminateAll: terminateConfirm.all,
        reason: terminateConfirm.all
          ? 'Encerramento de todas as sessões ativas pelo administrador'
          : 'Encerramento de sessão específica pelo administrador',
      })
      setTerminateConfirm({ open: false, all: false })
      onRefresh()
    } finally {
      setTerminating(false)
    }
  }

  // Exportar histórico individual
  const handleExportUserHistory = (type: 'excel' | 'pdf') => {
    const data = events.map((e) => ({
      'Data/Hora': new Date(e.created).toLocaleString('pt-BR'),
      Evento: e.event_type,
      Resultado: e.result,
      'Motivo Falha': e.failure_reason || '—',
      IP: e.ip_address || 'Informação não registrada',
      Versão: e.ip_version || 'IPv4',
      Dispositivo: e.device_type || 'Informação não registrada',
      SO: e.os_name || 'Informação não registrada',
      Navegador: e.browser_name || 'Informação não registrada',
      'Origem Localização':
        e.location_origin === 'geolocalizacao_autorizada'
          ? 'Autorizada (GPS)'
          : e.location_origin === 'ip'
            ? 'Estimativa de IP'
            : 'Informação não registrada',
      Cidade: e.city || 'Informação não registrada',
      Estado: e.state || 'Informação não registrada',
      País: e.country || 'Informação não registrada',
      'Provedor / ISP': e.isp_network || 'Informação não registrada',
      'ID Sessão': e.session_id || '—',
    }))

    if (type === 'excel') {
      exportToExcel(
        data,
        `historico-acessos-${user.name.toLowerCase().replace(/\s+/g, '-')}.xlsx`,
        `Histórico de Acessos — ${user.name} (Jetro ERP)`,
      )
    } else {
      exportToPdf(
        data,
        `historico-acessos-${user.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        `Histórico de Acessos — ${user.name} (Jetro ERP)`,
      )
    }
  }

  // Colunas JetroTable do histórico de logins
  const eventColumns: JetroColumnDef<AuthEvent>[] = [
    {
      id: 'created',
      header: 'Data e Hora (Fuso Local)',
      accessorKey: 'created',
      dataType: 'date',
      defaultWidth: 160,
      cell: ({ value }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">
          {value ? new Date(String(value)).toLocaleString('pt-BR') : '—'}
        </span>
      ),
    },
    {
      id: 'event_type',
      header: 'Tipo de Evento',
      accessorKey: 'event_type',
      dataType: 'text',
      defaultWidth: 140,
      cell: ({ value }) => {
        const val = String(value)
        const labels: Record<string, string> = {
          login: 'Login',
          login_failed: 'Tentativa Falha',
          logout: 'Logout Voluntário',
          session_expired: 'Sessão Expirada',
          session_terminated: 'Sessão Encerrada',
          blocked_attempt: 'Bloqueio',
          session_activity: 'Atividade de Sessão',
        }
        return (
          <Badge variant="outline" className="text-[11px] font-semibold">
            {labels[val] || val}
          </Badge>
        )
      },
    },
    {
      id: 'result',
      header: 'Resultado',
      accessorKey: 'result',
      dataType: 'text',
      defaultWidth: 110,
      cell: ({ row }) =>
        row.result === 'sucesso' ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3.5 h-3.5" /> Sucesso
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/40 px-2 py-0.5 rounded">
            <XCircle className="w-3.5 h-3.5" /> Falha
          </span>
        ),
    },
    {
      id: 'ip_address',
      header: 'IP de Origem (Infra)',
      accessorKey: 'ip_address',
      dataType: 'text',
      defaultWidth: 130,
      cell: ({ row }) => (
        <div className="flex flex-col font-mono text-xs">
          <span>{row.ip_address || 'Informação não registrada'}</span>
          <span className="text-[10px] text-muted-foreground">{row.ip_version || 'IPv4'}</span>
        </div>
      ),
    },
    {
      id: 'device',
      header: 'Dispositivo / SO',
      accessorKey: 'device_type',
      dataType: 'text',
      defaultWidth: 160,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs">
          {row.device_type?.toLowerCase().includes('mobile') ? (
            <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          ) : (
            <Monitor className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
          <span className="truncate">
            {row.device_type || 'Informação não registrada'} • {row.os_name || 'SO não id.'}
          </span>
        </div>
      ),
    },
    {
      id: 'browser',
      header: 'Navegador',
      accessorKey: 'browser_name',
      dataType: 'text',
      defaultWidth: 130,
      cell: ({ value }) => (
        <span className="text-xs text-muted-foreground">
          {String(value || 'Informação não registrada')}
        </span>
      ),
    },
    {
      id: 'location',
      header: 'Localização Registrada',
      accessorKey: 'city',
      dataType: 'text',
      defaultWidth: 170,
      cell: ({ row }) => {
        const parts = [row.city, row.state, row.country].filter(Boolean)
        const text = parts.length > 0 ? parts.join(', ') : 'Informação não registrada'
        const isAuth = row.location_origin === 'geolocalizacao_autorizada'
        const isIp = row.location_origin === 'ip'

        return (
          <div className="flex items-center gap-1 text-xs truncate" title={text}>
            <MapPin
              className={`w-3.5 h-3.5 shrink-0 ${
                isAuth ? 'text-emerald-600' : isIp ? 'text-amber-600' : 'text-muted-foreground'
              }`}
            />
            <span className="truncate">{text}</span>
          </div>
        )
      },
    },
    {
      id: 'location_origin',
      header: 'Origem Localiz.',
      accessorKey: 'location_origin',
      dataType: 'text',
      defaultWidth: 130,
      cell: ({ value }) => {
        if (value === 'geolocalizacao_autorizada') {
          return (
            <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300">
              Autorizada
            </Badge>
          )
        }
        if (value === 'ip') {
          return (
            <Badge
              variant="outline"
              className="border-amber-400 text-amber-700 bg-amber-50/50 text-[10px] dark:text-amber-300"
            >
              Estimativa IP
            </Badge>
          )
        }
        return <span className="text-[11px] text-muted-foreground">Não disponível</span>
      },
    },
    {
      id: 'precise_coords',
      header: 'Coordenadas Precisas',
      accessorKey: 'latitude',
      dataType: 'text',
      defaultWidth: 170,
      cell: ({ row }) => {
        if (
          row.location_origin !== 'geolocalizacao_autorizada' ||
          row.latitude === null ||
          row.latitude === undefined
        ) {
          return <span className="text-[11px] text-muted-foreground">Não coletadas</span>
        }
        if (!canViewPreciseCoords) {
          return <span className="text-[11px] text-muted-foreground italic">Restrito a admin</span>
        }
        if (!preciseCoordsRevealed) {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRevealPreciseCoords}
              disabled={revealingCoords}
              className="h-6 px-1.5 text-[10px] text-blue-700 hover:text-blue-900"
            >
              <Lock className="w-3 h-3 mr-1" /> Revelar (Auditar)
            </Button>
          )
        }
        return (
          <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 font-semibold">
            {row.latitude?.toFixed(4)}, {row.longitude?.toFixed(4)} (±{row.accuracy_meters}m)
          </span>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      {/* Top Header com Voltar e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-[#005B2E]/40 text-[#005B2E] hover:bg-[#005B2E]/10 h-8"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para Lista
          </Button>
          <div>
            <h1 className="text-lg font-black text-foreground flex items-center gap-2">
              Histórico de Acessos — {user.name}
              {user.is_online && (
                <Badge className="bg-emerald-500 text-white font-bold text-[10px] animate-pulse">
                  ONLINE
                </Badge>
              )}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {user.email} • Perfil: {user.role} • Status: {user.active ? 'Ativo' : 'Inativo'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canExport && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportUserHistory('excel')}
                className="text-xs h-8 text-emerald-700 border-emerald-600/40 hover:bg-emerald-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportUserHistory('pdf')}
                className="text-xs h-8 text-red-700 border-red-600/40 hover:bg-red-50"
              >
                <FileText className="w-3.5 h-3.5 mr-1" />
                PDF
              </Button>
            </>
          )}

          {canTerminateSessions && activeSessionsList.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setTerminateConfirm({ open: true, all: true })}
              className="text-xs h-8 font-bold"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Encerrar Todas as Sessões ({activeSessionsList.length})
            </Button>
          )}
        </div>
      </div>

      {/* Indicadores Principais (KPI Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-3">
            <span className="text-[11px] text-muted-foreground font-medium block">
              Último Acesso
            </span>
            <span className="text-xs font-bold text-foreground block mt-1 truncate">
              {user.last_login
                ? new Date(user.last_login).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })
                : 'Informação não registrada'}
            </span>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-3">
            <span className="text-[11px] text-muted-foreground font-medium block">
              Total de Logins
            </span>
            <span className="text-base font-extrabold text-[#005B2E] block mt-0.5">
              {totalLogins}
            </span>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-3">
            <span className="text-[11px] text-muted-foreground font-medium block">
              Dispositivos
            </span>
            <span className="text-base font-extrabold text-foreground block mt-0.5">
              {devices.length}
            </span>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-3">
            <span className="text-[11px] text-muted-foreground font-medium block">
              IPs Utilizados
            </span>
            <span className="text-base font-extrabold text-foreground block mt-0.5">
              {uniqueIps}
            </span>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-3">
            <span className="text-[11px] text-muted-foreground font-medium block">
              Tentativas Falhas
            </span>
            <span
              className={`text-base font-extrabold block mt-0.5 ${failedAttempts > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}
            >
              {failedAttempts}
            </span>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-3">
            <span className="text-[11px] text-muted-foreground font-medium block">
              Sessões Ativas
            </span>
            <span
              className={`text-base font-extrabold block mt-0.5 ${activeSessionsList.length > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}
            >
              {activeSessionsList.length}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Abas com Conteúdo Detalhado */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/40 p-1 border border-border/70 w-full justify-start overflow-x-auto">
          <TabsTrigger value="summary" className="text-xs">
            Resumo do Usuário
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            Histórico de Logins ({events.length})
          </TabsTrigger>
          <TabsTrigger value="devices" className="text-xs">
            Dispositivos ({devices.length})
          </TabsTrigger>
          <TabsTrigger value="map" className="text-xs">
            Mapa de Acessos ({mapPoints.length})
          </TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs">
            Sessões Ativas ({activeSessionsList.length})
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs">
            Alertas de Segurança ({alerts.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. Aba Resumo */}
        <TabsContent value="summary" className="space-y-4 pt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-border">
              <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border/70">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#005B2E]" />
                  Perfil & Segurança da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">ID do Usuário:</span>
                  <span className="font-mono text-foreground font-semibold">{user.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Nome Completo:</span>
                  <span className="text-foreground font-semibold">{user.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">E-mail:</span>
                  <span className="text-foreground font-semibold font-mono">{user.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Perfil de Acesso:</span>
                  <Badge variant="outline" className="border-[#005B2E]/40 text-[#005B2E]">
                    {user.role}
                  </Badge>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Status da Conta:</span>
                  <span
                    className={
                      user.active ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'
                    }
                  >
                    {user.active ? 'Ativo' : 'Inativo / Bloqueado'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Status Atual de Presença:</span>
                  <span className="font-semibold text-foreground">
                    {user.is_online ? 'Online (sessão ativa válida)' : 'Offline'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border/70">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#005B2E]" />
                  Último Acesso Registrado
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Data/Hora:</span>
                  <span className="text-foreground font-semibold">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleString('pt-BR')
                      : 'Informação não registrada'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">IP de Origem:</span>
                  <span className="font-mono text-foreground font-semibold">
                    {user.last_ip || 'Informação não registrada'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Dispositivo / SO:</span>
                  <span className="text-foreground font-semibold">
                    {user.last_device || 'Informação não registrada'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Localização Estimada:</span>
                  <span className="text-foreground font-semibold">
                    {[user.last_city, user.last_state, user.last_country]
                      .filter(Boolean)
                      .join(', ') || 'Informação não registrada'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Origem do Dado:</span>
                  <span className="text-foreground font-semibold">
                    {user.location_origin === 'geolocalizacao_autorizada'
                      ? 'Geolocalização Autorizada (GPS)'
                      : user.location_origin === 'ip'
                        ? 'Estimativa de IP (ip-api)'
                        : 'Informação não registrada'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. Aba Histórico de Logins */}
        <TabsContent value="history" className="pt-3">
          <Card className="border border-border">
            <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">
                  Histórico Cronológico Completo de Autenticações
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">
                  Registros imutáveis de cada tentativa de login, logout e encerramento.
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <JetroTable
                screenId="admin.usuarios.historico"
                columns={eventColumns}
                data={events}
                emptyMessage="Nenhum evento de autenticação registrado para este usuário."
                exportTitle={`Histórico de Acessos — ${user.name}`}
                exportFilename={`historico-${user.name.toLowerCase().replace(/\s+/g, '-')}.xlsx`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Aba Dispositivos */}
        <TabsContent value="devices" className="space-y-4 pt-3">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/60 text-xs text-muted-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Identificação por Sessão Confiável:</strong> Os dados abaixo representam
              dispositivos e navegadores verificados em cada acesso válido. O Jetro não utiliza
              técnicas probabilísticas invasivas de fingerprinting contínuo.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {devices.map((d, i) => (
              <Card key={i} className="border border-border/80 shadow-xs">
                <CardHeader className="py-3 px-4 bg-muted/10 border-b border-border/60 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    {d.deviceType.toLowerCase().includes('mobile') ? (
                      <Smartphone className="w-4 h-4 text-blue-600" />
                    ) : d.deviceType.toLowerCase().includes('tablet') ? (
                      <Tablet className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Monitor className="w-4 h-4 text-emerald-700" />
                    )}
                    <CardTitle className="text-xs font-bold text-foreground">
                      {d.deviceType} • {d.osName}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {d.loginCount} login(s)
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Navegador:</span>
                    <span className="font-semibold text-foreground">{d.browserName}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Último IP:</span>
                    <span className="font-mono text-muted-foreground">{d.lastIp}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Primeiro Acesso:</span>
                    <span className="text-muted-foreground">
                      {new Date(d.firstSeen).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Último Acesso:</span>
                    <span className="text-foreground font-semibold">
                      {new Date(d.lastSeen).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {devices.length === 0 && (
              <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                Nenhum dispositivo registrado até o momento.
              </div>
            )}
          </div>
        </TabsContent>

        {/* 4. Aba Mapa de Acessos */}
        <TabsContent value="map" className="space-y-4 pt-3">
          <Card className="border border-border">
            <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#005B2E]" />
                  Pontos Geográficos de Acesso Registrados
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">
                  Representação estática dos eventos autorizados ou estimados por IP. Não representa
                  trajeto ou tempo real.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  Autorizado (GPS)
                </span>
                <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  Estimativa por IP
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {mapPoints.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  Nenhum registro com coordenadas geográficas disponível para este usuário.
                  <br />
                  <span className="text-[11px] text-muted-foreground/70">
                    (Coordenadas são capturadas apenas no momento do login com autorização do
                    usuário ou por IP válido).
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Visualizador de Pontos em Lista com Coordenadas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {mapPoints.map((pt) => (
                      <div
                        key={pt.id}
                        className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                          pt.locationOrigin === 'geolocalizacao_autorizada'
                            ? 'bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/20'
                            : 'bg-amber-50/50 border-amber-300 dark:bg-amber-950/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-foreground" />
                            {pt.city}, {pt.state}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              pt.locationOrigin === 'geolocalizacao_autorizada'
                                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300'
                                : 'border-amber-600 text-amber-800 dark:text-amber-300'
                            }
                          >
                            {pt.locationOrigin === 'geolocalizacao_autorizada'
                              ? 'GPS Preciso'
                              : 'IP Estimado'}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {new Date(pt.created).toLocaleString('pt-BR')} • {pt.device}
                        </div>
                        <div className="font-mono text-[11px] text-foreground">IP: {pt.ip}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          Lat: {pt.lat.toFixed(4)}, Lon: {pt.lon.toFixed(4)} (±{pt.accuracy}m)
                        </div>
                        <div className="pt-1">
                          <a
                            href={`https://www.google.com/maps?q=${pt.lat},${pt.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                          >
                            Abrir no Google Maps →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Aba Sessões Ativas */}
        <TabsContent value="sessions" className="space-y-4 pt-3">
          <Card className="border border-border">
            <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Sessões Válidas no Backend</CardTitle>
                <p className="text-[11px] text-muted-foreground">
                  O encerramento é executado diretamente no banco de dados, invalidando a sessão
                  imediatamente.
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-card"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">
                        {sess.device || 'Desktop'} • {sess.os || 'SO'} •{' '}
                        {sess.browser || 'Navegador'}
                      </span>
                      {sess.status === 'active' && !sess.is_invalidated ? (
                        <Badge className="bg-emerald-500 text-white text-[10px]">Ativa</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[10px]">
                          Encerrada ({sess.terminated_reason || 'Logout'})
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                      <span>Início: {sess.login_time}</span>
                      {sess.last_activity && <span>Última Atividade: {sess.last_activity}</span>}
                      {sess.logout_time && <span>Encerramento: {sess.logout_time}</span>}
                      <span className="font-mono">IP: {sess.ip_address}</span>
                      <span>Sessão: {sess.session_id.substring(0, 10)}...</span>
                    </div>
                  </div>

                  {sess.status === 'active' && !sess.is_invalidated && canTerminateSessions && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTerminateConfirm({
                          open: true,
                          all: false,
                          sessionId: sess.session_id,
                        })
                      }
                      className="border-red-500/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs h-7 shrink-0 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1" />
                      Encerrar Sessão
                    </Button>
                  )}
                </div>
              ))}

              {sessions.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Nenhuma sessão registrada para este usuário.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. Aba Alertas de Segurança */}
        <TabsContent value="alerts" className="space-y-4 pt-3">
          <Card className="border border-border">
            <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border/70">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Alertas e Notificações de Segurança do Usuário
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">
                Classificação cautelosa (considera VPNs, redes corporativas e imprecisão de IP sem
                conclusões precipitadas).
              </p>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-3 rounded-lg border text-xs flex items-start gap-3 ${
                    al.severity === 'critical'
                      ? 'bg-red-50/50 border-red-300 dark:bg-red-950/30'
                      : al.severity === 'warning'
                        ? 'bg-amber-50/50 border-amber-300 dark:bg-amber-950/30'
                        : 'bg-blue-50/50 border-blue-300 dark:bg-blue-950/30'
                  }`}
                >
                  <AlertTriangle
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      al.severity === 'critical'
                        ? 'text-red-600'
                        : al.severity === 'warning'
                          ? 'text-amber-600'
                          : 'text-blue-600'
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{al.alert_type}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {new Date(al.created).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-foreground/90 leading-relaxed">{al.description}</p>
                    <div className="text-[10px] text-muted-foreground">
                      Severidade: {al.severity.toUpperCase()} • Status:{' '}
                      {al.resolved ? 'Resolvido' : 'Pendente de análise'}
                    </div>
                  </div>
                </div>
              ))}

              {alerts.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Nenhum alerta de segurança emitido para este usuário.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de Confirmação para Encerramento de Sessão */}
      <Dialog
        open={terminateConfirm.open}
        onOpenChange={(open) => !terminating && setTerminateConfirm({ ...terminateConfirm, open })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-600 flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              {terminateConfirm.all ? 'Encerrar Todas as Sessões' : 'Encerrar Sessão Selecionada'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Esta ação invalidará a sessão no banco de dados imediatamente. O usuário será
              desconectado na próxima requisição ou atividade.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
            <p>
              <strong>Usuário:</strong> {user.name} ({user.email})
            </p>
            <p>
              <strong>Ação auditada:</strong> Seu usuário administrador será registrado na auditoria
              LGPD como responsável por este encerramento.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTerminateConfirm({ open: false, all: false })}
              disabled={terminating}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleExecuteTerminate}
              disabled={terminating}
            >
              {terminating ? 'Encerrando...' : 'Confirmar Encerramento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
