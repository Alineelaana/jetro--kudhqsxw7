import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ACTION_STATUS } from '@/lib/trade-marketing-types'
import type { TradeMarketingAction } from '@/lib/trade-marketing-types'

export function TmKanban({ actions = [] }: { actions?: TradeMarketingAction[] }) {
  const cols = ACTION_STATUS as readonly { value: string; label: string }[]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cols.map((status) => {
        const items = actions.filter((a) => a.status === status.value)
        return (
          <div key={status.value} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-gray-700">{status.label}</h3>
              <Badge variant="secondary">{items.length}</Badge>
            </div>
            <div className="space-y-2 min-h-[120px] bg-gray-50 rounded-lg p-2">
              {items.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Vazio</p>
              ) : (
                items.map((action) => (
                  <Card key={action.id} className="shadow-sm">
                    <CardContent className="p-3">
                      <p className="text-sm font-medium text-gray-800">
                        {action.title || 'Sem nome'}
                      </p>
                      {action.responsible_name && (
                        <p className="text-xs text-gray-500 mt-1">{action.responsible_name}</p>
                      )}
                      {action.budget_planned && (
                        <p className="text-xs text-[#005B2E] font-medium mt-1">
                          {action.budget_planned}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
