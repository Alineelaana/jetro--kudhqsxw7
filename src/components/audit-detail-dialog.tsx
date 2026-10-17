import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AuditLog } from '@/services/audit-logs'
import { getSessionBySessionId, type AuditSession } from '@/services/audit-sessions'
import { AuditSessionTimeline } from '@/components/audit-session-timeline'
import { COLLECTION_ROUTE_MAP } from '@/lib/audit-helpers'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: AuditLog | null
}

interface DataChange {
  field: string
  oldValue: string
  newValue: string
}

function formatVal(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'object') return JSON.stringify(v, null, 2)
  return String(v)
}

function diffValues(
  prev: Record<string, unknown> | null,
  next: Record<string, unknown> | null,
): DataChange[] {
  if (!prev && !next) return []
  const allKeys = new Set([...Object.keys(prev || {}), ...Object.keys(next || {})])
  const changes: DataChange[] = []
  allKeys.forEach((key) => {
    const p = prev?.[key]
    const n = next?.[key]
    if (JSON.stringify(p) !== JSON.stringify(n)) {
      changes.push({ field: key, oldValue: formatVal(p), newValue: formatVal(n) })
    }
  })
  return changes
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="font-bold text-[#005B2E]">{label}:</span> {value || '—'}
    </div>
  )
}

export function AuditDetailDialog({ open, onOpenChange, log }: Props) {
  const [session, setSession] = useState<AuditSession | null>(null)

  useEffect(() => {
    if (log?.session_id) {
      getSessionBySessionId(log.session_id)
        .then((res) => setSession(res as unknown as AuditSession))
        .catch(() => setSession(null))
    } else {
      setSession(null)
    }
  }, [log?.session_id])

  if (!log) return null

  const changes = diffValues(log.previous_value, log.new_value)
  const route = COLLECTION_ROUTE_MAP[log.target_collection]
  const sessionDuration =
    session?.login_time && session?.logout_time
      ? `${new Date(session.login_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} → ${new Date(session.logout_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
      : session?.login_time
        ? `${new Date(session.login_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} → Em andamento`
        : '—'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">Detalhes do Registro de Auditoria</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh] pr-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <InfoField label="Data/Hora" value={new Date(log.created).toLocaleString('pt-BR')} />
              <InfoField label="Usuário" value={log.user_name} />
              <InfoField label="Perfil" value={<Badge variant="outline">{log.user_role}</Badge>} />
              <InfoField label="Empresa" value={log.empresa} />
              <InfoField label="Filial" value={log.filial} />
              <InfoField label="Módulo" value={log.module} />
              <InfoField label="Tela" value={log.target_collection} />
              <InfoField label="Registro relacionado" value={log.target_summary} />
              <InfoField
                label="Tipo da ação"
                value={<Badge variant="outline">{log.action}</Badge>}
              />
              <InfoField
                label="Criticidade"
                value={<Badge variant="outline">{log.criticidade}</Badge>}
              />
              <InfoField label="Endereço IP" value={log.ip_address} />
              <InfoField label="Navegador" value={log.browser} />
              <InfoField label="Sistema Operacional" value={log.os} />
              <InfoField label="Dispositivo" value={log.device} />
              <InfoField label="Origem da ação" value={log.origem} />
              <InfoField
                label="ID da Sessão"
                value={<code className="text-xs">{log.session_id}</code>}
              />
              <InfoField label="Tempo da Sessão" value={sessionDuration} />
              {log.approval_responsible && (
                <InfoField label="Responsável pela aprovação" value={log.approval_responsible} />
              )}
              {log.justification && <InfoField label="Justificativa" value={log.justification} />}
              <div className="sm:col-span-2">
                <InfoField
                  label="User Agent"
                  value={<span className="text-xs break-all">{log.user_agent}</span>}
                />
              </div>
            </div>

            {route && (
              <div>
                <Link to={route}>
                  <Button variant="outline" size="sm" className="border-[#005B2E] text-[#005B2E]">
                    <ExternalLink className="w-3.5 h-3.5 mr-1" /> Ver registro relacionado
                  </Button>
                </Link>
              </div>
            )}

            {changes.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-[#005B2E] mb-2 border-b-2 border-[#C89B3C] pb-1">
                  Alterações de Dados
                </h4>
                <div className="space-y-2">
                  {changes.map((c, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-gray-50 rounded-lg p-2"
                    >
                      <div>
                        <span className="font-semibold text-[#005B2E]">Campo:</span> {c.field}
                      </div>
                      <div>
                        <span className="font-semibold text-red-600">Antes:</span> {c.oldValue}
                      </div>
                      <div>
                        <span className="font-semibold text-green-600">Depois:</span> {c.newValue}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {log.session_id && (
              <div>
                <h4 className="text-sm font-bold text-[#005B2E] mb-2 border-b-2 border-[#C89B3C] pb-1">
                  Linha do Tempo da Sessão
                </h4>
                <AuditSessionTimeline sessionId={log.session_id} />
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
