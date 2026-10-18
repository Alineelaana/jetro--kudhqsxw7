import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Link2 } from 'lucide-react'
import { getMkAttributions } from '@/services/marketing'
import type { MkResultAttribution } from '@/lib/marketing-types'
import { useRealtime } from '@/hooks/use-realtime'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'

export function MarketingAttribution() {
  const [items, setItems] = useState<MkResultAttribution[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setItems(await getMkAttributions())
    } catch {
      setItems([])
    }
    setLoading(false)
  }, [])
  useEffect(() => {
    load()
  }, [load])
  useRealtime('mk_result_attributions', () => load())

  const totalRevenue = items.reduce((s, a) => s + (parseFloat(a.revenue) || 0), 0)
  const byMethod = items.reduce(
    (acc, a) => {
      acc[a.attribution_method] = (acc[a.attribution_method] || 0) + (parseFloat(a.revenue) || 0)
      return acc
    },
    {} as Record<string, number>,
  )

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[#005B2E]">Atribuição de Resultado</h2>
      <p className="text-xs text-muted-foreground">
        Campanha → Lead → Oportunidade → Pedido → Faturamento — leads permanecem no CRM
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-[#005B2E]">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Receita Atribuída</p>
            <p className="text-lg font-bold text-[#005B2E]">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-[#005B2E]">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Atribuições</p>
            <p className="text-lg font-bold text-[#005B2E]">{items.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-[#005B2E]">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Direta</p>
            <p className="text-lg font-bold text-green-600">
              R$ {(byMethod.direta || 0).toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-[#005B2E]">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Correlacionada</p>
            <p className="text-lg font-bold text-amber-600">
              R$ {(byMethod.correlacionada || 0).toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>
      </div>
      <JetroTable
        screenId="marketing.atribuicao"
        columns={[
          {
            id: 'campaign_name',
            header: 'Campanha',
            accessorKey: 'campaign_name',
            dataType: 'text',
            defaultWidth: 200,
            cell: ({ value }) => <span className="font-medium">{String(value || '—')}</span>,
          },
          {
            id: 'channel',
            header: 'Canal',
            accessorKey: 'channel',
            dataType: 'text',
            defaultWidth: 120,
            cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
          },
          {
            id: 'lead_name',
            header: 'Lead',
            accessorKey: 'lead_name',
            dataType: 'text',
            defaultWidth: 160,
            cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
          },
          {
            id: 'order_number',
            header: 'Pedido',
            accessorKey: 'order_number',
            dataType: 'text',
            defaultWidth: 120,
            cell: ({ value }) => <span className="text-xs font-mono">{String(value || '—')}</span>,
          },
          {
            id: 'revenue',
            header: 'Receita',
            accessorKey: 'revenue',
            dataType: 'currency',
            align: 'right',
            defaultWidth: 130,
            getSortValue: (row) => parseFloat(row.revenue) || 0,
            cell: ({ value }) => (
              <span className="font-semibold text-[#005B2E]">
                R${' '}
                {parseFloat(String(value || '0')).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            ),
          },
          {
            id: 'attribution_method',
            header: 'Método',
            accessorKey: 'attribution_method',
            dataType: 'text',
            defaultWidth: 130,
            cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
          },
        ]}
        data={items}
        emptyMessage="Nenhuma atribuição registrada."
        exportTitle="Atribuição de Resultado — Marketing Jetro"
        exportFilename="atribuicao-marketing.xlsx"
      />
    </div>
  )
}
