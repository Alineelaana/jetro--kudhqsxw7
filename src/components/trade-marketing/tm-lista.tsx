import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ACTION_STATUS } from '@/lib/trade-marketing-types'
import type { TradeMarketingAction } from '@/lib/trade-marketing-types'

export function TmLista({ actions = [] }: { actions?: TradeMarketingAction[] }) {
  const statusLabel = (value: string) => {
    const s = (ACTION_STATUS as readonly { value: string; label: string }[]).find(
      (s) => s.value === value,
    )
    return s ? s.label : value || '—'
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Término</TableHead>
            <TableHead>Orçamento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                Nenhuma ação encontrada
              </TableCell>
            </TableRow>
          ) : (
            actions.map((action) => (
              <TableRow key={action.id}>
                <TableCell className="font-medium">{action.title || '—'}</TableCell>
                <TableCell>
                  <Badge variant="outline">{statusLabel(action.status)}</Badge>
                </TableCell>
                <TableCell>{action.responsible_name || '—'}</TableCell>
                <TableCell>{action.start_date || '—'}</TableCell>
                <TableCell>{action.end_date || '—'}</TableCell>
                <TableCell>{action.budget_planned || '—'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
