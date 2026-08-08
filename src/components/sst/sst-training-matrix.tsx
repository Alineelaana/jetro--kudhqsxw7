import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { SstLoading, SstTable, SstStatusBadge } from '@/components/sst/sst-shared'
import { getTrainingMatrix, getTrainingMatrixAlerts } from '@/services/sst-enterprise'
import { useRealtime } from '@/hooks/use-realtime'
import { Clock, AlertTriangle, XCircle, CheckCircle, GraduationCap } from 'lucide-react'

export function SstTrainingMatrix() {
  const [records, setRecords] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [items, a] = await Promise.all([getTrainingMatrix(), getTrainingMatrixAlerts()])
      setRecords(items)
      setAlerts(a)
    } catch {
      setRecords([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('sst_training_matrix', () => load())

  if (loading) return <SstLoading />

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-[#005B2E]" />
        <h3 className="text-lg font-bold">Matriz de Treinamento SST</h3>
      </div>
      {alerts && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Válidos', value: alerts.valid, icon: CheckCircle, color: 'text-emerald-600' },
            { label: 'Vencidos', value: alerts.expired, icon: XCircle, color: 'text-red-600' },
            {
              label: 'Próximos Vencimento',
              value: alerts.expiring,
              icon: AlertTriangle,
              color: 'text-amber-600',
            },
            { label: 'Pendentes', value: alerts.pending, icon: Clock, color: 'text-amber-600' },
          ].map((s) => {
            const Icon = s.icon
            return (
              <Card key={s.label} className="border-2 border-[#005B2E]/20">
                <CardContent className="flex items-center gap-2 p-3">
                  <Icon className={`w-5 h-5 ${s.color}`} />
                  <div>
                    <p className="text-lg font-black">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      {records.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold">Nenhum treinamento registrado</p>
          </CardContent>
        </Card>
      ) : (
        <SstTable
          headers={[
            'Colaborador',
            'Cargo',
            'Treinamento',
            'NR',
            'Realização',
            'Validade',
            'Situação',
          ]}
        >
          {records.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 font-medium">{r.employee_name || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.cargo || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.treinamento || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.nr || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.data_realizacao || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.validade || '—'}</td>
              <td className="px-3 py-3">
                <SstStatusBadge status={r.situacao} />
              </td>
            </tr>
          ))}
        </SstTable>
      )}
    </div>
  )
}
