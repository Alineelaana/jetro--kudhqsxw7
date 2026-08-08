import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { SstLoading } from '@/components/sst/sst-shared'
import { getComplianceStatus, getNRCatalog } from '@/services/sst-enterprise'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertTriangle, XCircle, MinusCircle, ShieldCheck } from 'lucide-react'

const STATUS_CONFIG: Record<string, { color: string; icon: typeof CheckCircle }> = {
  Conforme: { color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  Atenção: { color: 'text-amber-600 bg-amber-50', icon: AlertTriangle },
  'Não Conforme': { color: 'text-red-600 bg-red-50', icon: XCircle },
  'Não Aplicável': { color: 'text-gray-500 bg-gray-50', icon: MinusCircle },
}

export function SstComplianceDashboard() {
  const [items, setItems] = useState<any[]>([])
  const [nrCatalog, setNrCatalog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [compliance, catalog] = await Promise.all([getComplianceStatus(), getNRCatalog()])
      setItems(compliance)
      setNrCatalog(catalog)
    } catch {
      setItems([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('sst_compliance_status', () => load())

  if (loading) return <SstLoading />

  const byStatus = {
    conforme: items.filter((i) => i.status === 'Conforme').length,
    atencao: items.filter((i) => i.status === 'Atenção').length,
    naoConforme: items.filter((i) => i.status === 'Não Conforme').length,
    naoAplicavel: items.filter((i) => i.status === 'Não Aplicável').length,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-[#005B2E]" />
        <h3 className="text-lg font-bold">Compliance por NR × Empresa × Filial</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Conforme', value: byStatus.conforme, ...STATUS_CONFIG.Conforme },
          { label: 'Atenção', value: byStatus.atencao, ...STATUS_CONFIG.Atenção },
          { label: 'Não Conforme', value: byStatus.naoConforme, ...STATUS_CONFIG['Não Conforme'] },
          {
            label: 'Não Aplicável',
            value: byStatus.naoAplicavel,
            ...STATUS_CONFIG['Não Aplicável'],
          },
        ].map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="border-2 border-[#005B2E]/20">
              <CardContent className={cn('flex flex-col items-center justify-center p-4', s.color)}>
                <Icon className="w-6 h-6 mb-1" />
                <div className="text-2xl font-black">{s.value}</div>
                <div className="text-xs font-medium">{s.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <Card className="border-2 border-[#005B2E]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">NR</th>
                <th className="text-left px-3 py-3 font-bold">Empresa</th>
                <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Filial</th>
                <th className="text-left px-3 py-3 font-bold">Status</th>
                <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Pendências</th>
                <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Responsável</th>
                <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">
                  Próxima Avaliação
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG['Não Aplicável']
                const Icon = cfg.icon
                const pendencias = (() => {
                  try {
                    return JSON.parse(item.pendencias || '[]')
                  } catch {
                    return []
                  }
                })()
                return (
                  <tr key={item.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3 font-medium">{item.nr || '—'}</td>
                    <td className="px-3 py-3 text-xs">{item.empresa || '—'}</td>
                    <td className="px-3 py-3 text-xs hidden md:table-cell">{item.filial || '—'}</td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded',
                          cfg.color,
                        )}
                      >
                        <Icon className="w-3 h-3" /> {item.status || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs hidden lg:table-cell">
                      {pendencias.length > 0 ? pendencias.join('; ') : '—'}
                    </td>
                    <td className="px-3 py-3 text-xs hidden md:table-cell">
                      {item.responsavel || '—'}
                    </td>
                    <td className="px-3 py-3 text-xs hidden lg:table-cell">
                      {item.proxima_avaliacao || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {nrCatalog.length > 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h4 className="font-bold text-[#005B2E] mb-3">Catálogo de NRs (Versionado)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {nrCatalog.map((nr) => (
                <div key={nr.id} className="p-2 bg-muted/30 rounded text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#005B2E]">{nr.nr_numero}</span>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        nr.situacao === 'Vigente'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-600',
                      )}
                    >
                      {nr.situacao}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{nr.titulo}</p>
                  <p className="text-xs text-muted-foreground">{nr.versao}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
