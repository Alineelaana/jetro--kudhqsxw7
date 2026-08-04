import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AuditLog } from '@/services/audit-logs'

const CRITICIDADE_STYLES: Record<string, string> = {
  Baixa: 'bg-gray-100 text-gray-700',
  Média: 'bg-blue-100 text-blue-700',
  Alta: 'bg-orange-100 text-orange-700',
  Crítica: 'bg-red-100 text-red-700',
}

interface Props {
  logs: AuditLog[]
  loading: boolean
  error: string
  onViewDetails: (log: AuditLog) => void
  onRetry: () => void
}

export function AuditTable({ logs, loading, error, onViewDetails, onRetry }: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }
  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-8 text-center text-destructive">
          {error}
          <Button variant="outline" size="sm" onClick={onRetry} className="ml-2">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }
  if (logs.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhum registro de auditoria encontrado.
        </CardContent>
      </Card>
    )
  }

  return (
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
              <th className="text-left px-3 py-3 font-bold">Criticidade</th>
              <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Módulo</th>
              <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Registro</th>
              <th className="text-center px-3 py-3 font-bold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                className={cn(
                  'border-b border-border hover:bg-[#005B2E]/5',
                  log.is_suspicious && 'bg-red-50/60',
                )}
              >
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
                  {log.is_suspicious && (
                    <AlertTriangle className="w-3 h-3 text-red-600 inline mr-1" />
                  )}
                  {log.user_name || '—'}
                </td>
                <td className="px-3 py-2 hidden md:table-cell">{log.user_role || '—'}</td>
                <td className="px-3 py-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#005B2E]/10 text-[#005B2E]">
                    {log.action}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {log.criticidade && (
                    <span
                      className={cn(
                        'text-xs font-bold px-2 py-0.5 rounded',
                        CRITICIDADE_STYLES[log.criticidade] || 'bg-gray-100 text-gray-700',
                      )}
                    >
                      {log.criticidade}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 hidden lg:table-cell">{log.module}</td>
                <td className="px-3 py-2 hidden lg:table-cell max-w-[200px] truncate">
                  {log.target_summary || '—'}
                </td>
                <td className="px-3 py-2 text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(log)}
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
  )
}
