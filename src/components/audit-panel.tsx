import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PaginationControls } from '@/components/pagination-controls'
import { AuditDetailDialog } from '@/components/audit-detail-dialog'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getAuditLogs, type AuditLog } from '@/services/audit-logs'
import { AUDIT_MODULE_OPTIONS, AUDIT_ACTION_OPTIONS, AUDIT_ROLE_OPTIONS } from '@/lib/audit-helpers'
import { exportAuditExcel, exportAuditPdf } from '@/lib/audit-export'
import { AuditSettingsPanel } from '@/components/audit-settings-panel'
import {
  Loader2,
  FileDown,
  FileSpreadsheet,
  Search,
  ShieldCheck,
  Eye,
  AlertCircle,
  Settings,
} from 'lucide-react'

export function AuditPanel() {
  const { isAdmin, user } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [totalItems, setTotalItems] = useState(0)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [fUser, setFUser] = useState('')
  const [fStart, setFStart] = useState('')
  const [fEnd, setFEnd] = useState('')
  const [fModule, setFModule] = useState('')
  const [fAction, setFAction] = useState('')
  const [fRole, setFRole] = useState('')
  const [fKeyword, setFKeyword] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const authorName = (user?.name as string) || (user?.email as string) || 'Usuário'

  const loadLogs = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getAuditLogs({
        page,
        perPage,
        user: fUser,
        startDate: fStart,
        endDate: fEnd,
        module: fModule,
        action: fAction,
        role: fRole,
        keyword: fKeyword,
      })
      setLogs(result.items as unknown as AuditLog[])
      setTotalItems(result.totalItems)
    } catch {
      setError('Erro ao carregar registros de auditoria.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [page, perPage])
  useEffect(() => {
    setPage(1)
  }, [fUser, fStart, fEnd, fModule, fAction, fRole, fKeyword])
  useRealtime('audit_logs', () => {
    loadLogs()
  })

  const hasFilters = fUser || fStart || fEnd || fModule || fAction || fRole || fKeyword
  const clearFilters = () => {
    setFUser('')
    setFStart('')
    setFEnd('')
    setFModule('')
    setFAction('')
    setFRole('')
    setFKeyword('')
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setDetailOpen(true)
  }

  if (!isAdmin) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-8 text-center">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
          <p className="font-bold text-destructive">
            Acesso negado. Apenas usuários SUP podem acessar a auditoria.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (showSettings) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setShowSettings(false)} className="text-[#005B2E]">
          ← Voltar para Auditoria
        </Button>
        <AuditSettingsPanel />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#005B2E]" /> Auditoria do Sistema
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="border-[#005B2E] text-[#005B2E] font-bold"
          >
            <Settings className="w-4 h-4 mr-2" /> Configurações
          </Button>
          <Button
            onClick={() => exportAuditExcel(logs, authorName)}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            disabled={logs.length === 0}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar Excel
          </Button>
          <Button
            onClick={() => exportAuditPdf(logs, authorName)}
            className="bg-[#C89B3C] hover:bg-[#b8881f] text-white font-bold"
            disabled={logs.length === 0}
          >
            <FileDown className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>

      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Usuário</Label>
              <Input
                value={fUser}
                onChange={(e) => setFUser(e.target.value)}
                placeholder="Nome ou e-mail"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Data inicial</Label>
              <Input
                type="date"
                value={fStart}
                onChange={(e) => setFStart(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Data final</Label>
              <Input
                type="date"
                value={fEnd}
                onChange={(e) => setFEnd(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Módulo</Label>
              <Select
                value={fModule || 'all'}
                onValueChange={(v) => setFModule(v === 'all' ? '' : v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {AUDIT_MODULE_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Ação</Label>
              <Select
                value={fAction || 'all'}
                onValueChange={(v) => setFAction(v === 'all' ? '' : v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {AUDIT_ACTION_OPTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Perfil</Label>
              <Select value={fRole || 'all'} onValueChange={(v) => setFRole(v === 'all' ? '' : v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {AUDIT_ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Search className="w-3 h-3" /> Palavra-chave
              </Label>
              <Input
                value={fKeyword}
                onChange={(e) => setFKeyword(e.target.value)}
                placeholder="Buscar em ação, módulo, registro, usuário..."
                className="h-9 text-sm"
              />
            </div>
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              Limpar filtros
            </Button>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : error ? (
        <Card className="border-destructive/30">
          <CardContent className="py-8 text-center text-destructive">{error}</CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum registro de auditoria encontrado.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#01361D] text-white">
                    <th className="text-left px-3 py-3 font-bold">Data</th>
                    <th className="text-left px-3 py-3 font-bold">Hora</th>
                    <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Usuário</th>
                    <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Perfil</th>
                    <th className="text-left px-3 py-3 font-bold">Ação</th>
                    <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Módulo</th>
                    <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Registro</th>
                    <th className="text-center px-3 py-3 font-bold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-[#005B2E]/5">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(log.created).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(log.created).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-3 py-2 hidden sm:table-cell max-w-[150px] truncate">
                        {log.user_name || '—'}
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell">{log.user_role || '—'}</td>
                      <td className="px-3 py-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#005B2E]/10 text-[#005B2E]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-3 py-2 hidden lg:table-cell">{log.module}</td>
                      <td className="px-3 py-2 hidden lg:table-cell max-w-[200px] truncate">
                        {log.target_summary || '—'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(log)}
                          className="border-[#005B2E] text-[#005B2E]"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <PaginationControls
            totalRecords={totalItems}
            pageSize={perPage}
            currentPage={page}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPerPage(s)
              setPage(1)
            }}
          />
        </>
      )}

      <AuditDetailDialog open={detailOpen} onOpenChange={setDetailOpen} log={selectedLog} />
    </div>
  )
}
