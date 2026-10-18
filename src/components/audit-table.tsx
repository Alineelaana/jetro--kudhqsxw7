import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AuditLog } from '@/services/audit-logs'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'

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

  const columns: JetroColumnDef<AuditLog>[] = [
    {
      id: 'date',
      header: 'Data',
      accessorKey: 'created',
      dataType: 'date',
      defaultWidth: 110,
      cell: ({ value }) => (
        <span className="whitespace-nowrap text-xs">
          {value ? new Date(String(value)).toLocaleDateString('pt-BR') : '—'}
        </span>
      ),
    },
    {
      id: 'time',
      header: 'Hora',
      accessorKey: 'created',
      dataType: 'text',
      defaultWidth: 90,
      cell: ({ value }) => (
        <span className="whitespace-nowrap font-mono text-xs">
          {value
            ? new Date(String(value)).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—'}
        </span>
      ),
    },
    {
      id: 'user_name',
      header: 'Usuário',
      accessorKey: 'user_name',
      dataType: 'text',
      defaultWidth: 160,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 truncate text-xs font-medium">
          {row.is_suspicious && <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />}
          <span className="truncate">{row.user_name || '—'}</span>
        </div>
      ),
    },
    {
      id: 'user_role',
      header: 'Perfil',
      accessorKey: 'user_role',
      dataType: 'text',
      defaultWidth: 130,
      cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
    },
    {
      id: 'action',
      header: 'Ação',
      accessorKey: 'action',
      dataType: 'text',
      defaultWidth: 130,
      cell: ({ value }) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#005B2E]/10 text-[#005B2E]">
          {String(value || '—')}
        </span>
      ),
    },
    {
      id: 'criticidade',
      header: 'Criticidade',
      accessorKey: 'criticidade',
      dataType: 'text',
      defaultWidth: 120,
      cell: ({ value }) =>
        value ? (
          <span
            className={cn(
              'text-xs font-bold px-2 py-0.5 rounded',
              CRITICIDADE_STYLES[String(value)] || 'bg-gray-100 text-gray-700',
            )}
          >
            {String(value)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      id: 'module',
      header: 'Módulo',
      accessorKey: 'module',
      dataType: 'text',
      defaultWidth: 130,
      cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
    },
    {
      id: 'target_summary',
      header: 'Registro',
      accessorKey: 'target_summary',
      dataType: 'text',
      defaultWidth: 200,
      cell: ({ value }) => (
        <span className="text-xs text-muted-foreground truncate block max-w-xs">
          {String(value || '—')}
        </span>
      ),
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
      cell: ({ row: log }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetails(log)}
          className="border-[#005B2E] text-[#005B2E] h-7 px-2 text-xs"
        >
          <Eye className="w-3.5 h-3.5 mr-1" /> Detalhes
        </Button>
      ),
    },
  ]

  return (
    <JetroTable
      screenId="auditoria.logs"
      columns={columns}
      data={logs}
      onRowClick={(log) => onViewDetails(log)}
      emptyMessage="Nenhum registro de auditoria encontrado."
      exportTitle="Logs de Auditoria — Jetro"
      exportFilename="auditoria-logs.xlsx"
    />
  )
}
