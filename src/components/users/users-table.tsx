import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  FilterX,
  Eye,
  ShieldCheck,
  Radio,
  FileSpreadsheet,
  FileText,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import { exportToExcel, exportToPdf } from '@/components/jetro-table/table-export'
import type { UserAuditRecord } from '@/services/user-audit-service'

interface UsersTableProps {
  users: UserAuditRecord[]
  loading: boolean
  onRefresh: () => void
  onSelectUser: (user: UserAuditRecord) => void
  canExport: boolean
  onOpenRetentionConfig?: () => void
}

export function UsersTable({
  users,
  loading,
  onRefresh,
  onSelectUser,
  canExport,
  onOpenRetentionConfig,
}: UsersTableProps) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [onlineFilter, setOnlineFilter] = useState('ALL')
  const [deviceFilter, setDeviceFilter] = useState('ALL')
  const [locationOriginFilter, setLocationOriginFilter] = useState('ALL')

  // Extrair opções únicas para filtros
  const uniqueRoles = useMemo(() => {
    const set = new Set<string>()
    users.forEach((u) => {
      if (u.role) set.add(u.role)
    })
    return Array.from(set).sort()
  }, [users])

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.username && u.username.toLowerCase().includes(search.toLowerCase())) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.last_ip && u.last_ip.toLowerCase().includes(search.toLowerCase())) ||
        (u.last_city && u.last_city.toLowerCase().includes(search.toLowerCase())) ||
        (u.last_state && u.last_state.toLowerCase().includes(search.toLowerCase()))

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'active' && u.active) ||
        (statusFilter === 'inactive' && !u.active)

      const matchOnline =
        onlineFilter === 'ALL' ||
        (onlineFilter === 'online' && u.is_online) ||
        (onlineFilter === 'offline' && !u.is_online)

      const matchDevice =
        deviceFilter === 'ALL' ||
        (u.last_device && u.last_device.toLowerCase().includes(deviceFilter.toLowerCase()))

      const matchLocOrigin =
        locationOriginFilter === 'ALL' ||
        (locationOriginFilter === 'geolocalizacao_autorizada' &&
          u.location_origin === 'geolocalizacao_autorizada') ||
        (locationOriginFilter === 'ip' && u.location_origin === 'ip') ||
        (locationOriginFilter === 'nao_disponivel' &&
          (!u.location_origin || u.location_origin === 'nao_disponivel'))

      return matchSearch && matchRole && matchStatus && matchOnline && matchDevice && matchLocOrigin
    })
  }, [users, search, roleFilter, statusFilter, onlineFilter, deviceFilter, locationOriginFilter])

  const clearFilters = () => {
    setSearch('')
    setRoleFilter('ALL')
    setStatusFilter('ALL')
    setOnlineFilter('ALL')
    setDeviceFilter('ALL')
    setLocationOriginFilter('ALL')
  }

  const columns: JetroColumnDef<UserAuditRecord>[] = [
    {
      id: 'name',
      header: 'Nome Completo',
      accessorKey: 'name',
      dataType: 'text',
      defaultWidth: 180,
      cell: ({ row }) => (
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-xs text-foreground truncate">{row.name}</span>
          <span className="text-[11px] text-muted-foreground truncate">{row.email}</span>
        </div>
      ),
    },
    {
      id: 'username',
      header: 'Nome de Usuário',
      accessorKey: 'username',
      dataType: 'text',
      defaultWidth: 140,
      cell: ({ value }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {String(value || 'Informação não registrada')}
        </span>
      ),
    },
    {
      id: 'role',
      header: 'Perfil de Acesso',
      accessorKey: 'role',
      dataType: 'text',
      defaultWidth: 130,
      cell: ({ value }) => (
        <Badge
          variant="outline"
          className="border-[#005B2E]/40 text-[#005B2E] bg-[#005B2E]/5 font-semibold text-[11px]"
        >
          {String(value || 'PADRAO')}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status da Conta',
      accessorKey: 'active',
      dataType: 'boolean',
      defaultWidth: 110,
      cell: ({ value }) =>
        value ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            Ativo
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300">
            Inativo
          </span>
        ),
    },
    {
      id: 'session_status',
      header: 'Status da Sessão',
      accessorKey: 'is_online',
      dataType: 'boolean',
      defaultWidth: 130,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {row.is_online ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
              Offline
            </span>
          )}
          {row.active_sessions_count && row.active_sessions_count > 1 ? (
            <span
              className="text-[10px] bg-[#C89B3C]/15 text-[#916b1e] dark:text-[#E4C46A] px-1.5 py-0.2 rounded font-bold"
              title={`${row.active_sessions_count} sessões ativas`}
            >
              {row.active_sessions_count}x
            </span>
          ) : null}
        </div>
      ),
    },
    {
      id: 'last_login',
      header: 'Último Acesso',
      accessorKey: 'last_login',
      dataType: 'date',
      defaultWidth: 140,
      cell: ({ value }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {value
            ? new Date(String(value)).toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })
            : 'Informação não registrada'}
        </span>
      ),
    },
    {
      id: 'last_ip',
      header: 'Último IP',
      accessorKey: 'last_ip',
      dataType: 'text',
      defaultWidth: 120,
      cell: ({ value }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {String(value || 'Informação não registrada')}
        </span>
      ),
    },
    {
      id: 'last_device',
      header: 'Dispositivo',
      accessorKey: 'last_device',
      dataType: 'text',
      defaultWidth: 120,
      cell: ({ value }) => {
        const val = String(value || '').toLowerCase()
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {val.includes('mobile') ? (
              <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            ) : val.includes('tablet') ? (
              <Tablet className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            ) : (
              <Monitor className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="truncate">{value || 'Informação não registrada'}</span>
          </div>
        )
      },
    },
    {
      id: 'location',
      header: 'Localização (Cidade/UF/País)',
      accessorKey: 'last_city',
      dataType: 'text',
      defaultWidth: 170,
      cell: ({ row }) => {
        const parts = [row.last_city, row.last_state, row.last_country].filter(Boolean)
        const text = parts.length > 0 ? parts.join(', ') : 'Informação não registrada'
        const isAuthGeo = row.location_origin === 'geolocalizacao_autorizada'
        const isIpGeo = row.location_origin === 'ip'

        return (
          <div className="flex items-center gap-1 text-xs truncate" title={text}>
            <MapPin
              className={`w-3.5 h-3.5 shrink-0 ${
                isAuthGeo
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isIpGeo
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-muted-foreground/60'
              }`}
            />
            <span className="truncate">{text}</span>
          </div>
        )
      },
    },
    {
      id: 'location_origin',
      header: 'Origem da Localização',
      accessorKey: 'location_origin',
      dataType: 'text',
      defaultWidth: 150,
      cell: ({ value }) => {
        if (value === 'geolocalizacao_autorizada') {
          return (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-300 text-[10px] font-semibold dark:bg-emerald-950/50 dark:text-emerald-300">
              Autorizada (GPS)
            </Badge>
          )
        }
        if (value === 'ip') {
          return (
            <Badge
              variant="outline"
              className="border-amber-400 text-amber-700 bg-amber-50/50 text-[10px] font-medium dark:text-amber-300 dark:bg-amber-950/20"
            >
              Estimativa por IP
            </Badge>
          )
        }
        return <span className="text-[11px] text-muted-foreground">Informação não registrada</span>
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      align: 'center',
      sortable: false,
      hideable: false,
      resizable: false,
      draggable: false,
      defaultWidth: 110,
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSelectUser(row)}
          className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 h-7 px-2.5 text-xs font-semibold"
        >
          <Eye className="w-3.5 h-3.5 mr-1" /> Detalhes
        </Button>
      ),
    },
  ]

  const handleExportFiltered = (type: 'excel' | 'pdf') => {
    const exportData = filteredUsers.map((u) => ({
      Nome: u.name,
      'Nome de Usuário': u.username || 'Informação não registrada',
      'E-mail': u.email,
      'Perfil de Acesso': u.role,
      'Status Conta': u.active ? 'Ativo' : 'Inativo',
      'Status Sessão': u.is_online ? 'Online' : 'Offline',
      'Último Login': u.last_login
        ? new Date(u.last_login).toLocaleString('pt-BR')
        : 'Informação não registrada',
      'Último IP': u.last_ip || 'Informação não registrada',
      Dispositivo: u.last_device || 'Informação não registrada',
      Cidade: u.last_city || 'Informação não registrada',
      Estado: u.last_state || 'Informação não registrada',
      País: u.last_country || 'Informação não registrada',
      'Origem Localização':
        u.location_origin === 'geolocalizacao_autorizada'
          ? 'Geolocalização Autorizada'
          : u.location_origin === 'ip'
            ? 'Estimativa de IP'
            : 'Informação não registrada',
    }))

    if (type === 'excel') {
      exportToExcel(
        exportData,
        'gestao-usuarios-auditoria.xlsx',
        'Usuários e Auditoria de Acessos — Jetro ERP',
      )
    } else {
      exportToPdf(
        exportData,
        'gestao-usuarios-auditoria.pdf',
        'Usuários e Auditoria de Acessos — Jetro ERP',
      )
    }
  }

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="p-4 bg-muted/20 border-b border-border/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#005B2E]/10 text-[#005B2E]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Central de Usuários & Auditoria de Acessos
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Gestão centralizada de contas, rastreamento de acessos, dispositivos e sessões
                válidas.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenRetentionConfig && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenRetentionConfig}
                className="text-xs border-[#C89B3C]/60 text-[#002817] hover:bg-[#C89B3C]/10 h-8"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-[#C89B3C]" />
                Política de Retenção LGPD
              </Button>
            )}

            {canExport && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportFiltered('excel')}
                  className="text-xs h-8 text-emerald-700 border-emerald-600/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  title="Exportar para planilha Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportFiltered('pdf')}
                  className="text-xs h-8 text-red-700 border-red-600/40 hover:bg-red-50 dark:hover:bg-red-950/30"
                  title="Exportar para PDF"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  PDF
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="text-xs h-8"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 pt-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, usuário, e-mail, IP, cidade..."
              className="pl-8 text-xs h-8"
            />
          </div>

          <div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Perfis</SelectItem>
                {uniqueRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Status Conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Status: Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={onlineFilter} onValueChange={setOnlineFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Sessão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Sessão: Todas</SelectItem>
                <SelectItem value="online">Online Agora</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Select value={locationOriginFilter} onValueChange={setLocationOriginFilter}>
              <SelectTrigger className="text-xs h-8 flex-1">
                <SelectValue placeholder="Localização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Localiz.: Todas</SelectItem>
                <SelectItem value="geolocalizacao_autorizada">Autorizada (GPS)</SelectItem>
                <SelectItem value="ip">Estimativa IP</SelectItem>
                <SelectItem value="nao_disponivel">Não disponível</SelectItem>
              </SelectContent>
            </Select>

            {(search ||
              roleFilter !== 'ALL' ||
              statusFilter !== 'ALL' ||
              onlineFilter !== 'ALL' ||
              locationOriginFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                title="Limpar filtros"
              >
                <FilterX className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <JetroTable
          screenId="admin.usuarios.lista"
          columns={columns}
          data={filteredUsers}
          onRowClick={(row) => onSelectUser(row)}
          emptyMessage="Nenhum usuário encontrado com os filtros aplicados."
          exportTitle="Usuários e Auditoria — Jetro ERP"
          exportFilename="usuarios-auditoria-jetro.xlsx"
        />
      </CardContent>
    </Card>
  )
}
