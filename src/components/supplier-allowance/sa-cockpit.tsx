import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { getSaBiData, type SaBiData } from '@/services/sa-bi-bridge'
import { Loader2, BarChart3 } from 'lucide-react'

export function SaCockpit() {
  const [biData, setBiData] = useState<SaBiData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSaBiData()
      .then((data) => setBiData(data))
      .catch(() => setBiData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  if (!biData)
    return (
      <Card className="border-2 border-dashed border-[#005B2E]/30">
        <CardContent className="py-16 text-center">
          <BarChart3 className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#005B2E]">Cockpit Executivo</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Este cockpit é uma camada de apresentação que consome inteligência exclusivamente do BI
            Enterprise 360. A integração será implementada no Épico 3. Nenhuma inteligência própria
            é implementada nesta fase.
          </p>
        </CardContent>
      </Card>
    )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Cockpit Executivo de Verbas</h3>
      <p className="text-xs text-muted-foreground">Dados fornecidos pelo BI Enterprise 360</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {biData.kpis.map((kpi, i) => (
          <Card key={i} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-lg font-black text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {biData.alerts.length > 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h4 className="text-sm font-bold text-[#005B2E] mb-3">Alertas</h4>
            <div className="space-y-2">
              {biData.alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-sm ${
                    alert.severity === 'critical'
                      ? 'text-red-600'
                      : alert.severity === 'warning'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      alert.severity === 'critical'
                        ? 'bg-red-500'
                        : alert.severity === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                    }`}
                  />
                  {alert.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
