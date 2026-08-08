import { useState, useEffect } from 'react'
import { SstStatCard, SstLoading } from '@/components/sst/sst-shared'
import { Card, CardContent } from '@/components/ui/card'
import { getEmployees } from '@/services/rh'
import { sstGetList } from '@/services/sst'
import {
  getComplianceStatus,
  getTrainingMatrixAlerts,
  getEsocialSSTStats,
} from '@/services/sst-enterprise'
import { useRealtime } from '@/hooks/use-realtime'
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  XCircle,
  CheckCircle,
  TrendingDown,
  FileWarning,
  Brain,
  Activity,
  Target,
} from 'lucide-react'

export function SstCockpit() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [
        emp,
        accidents,
        ncs,
        actions,
        risks,
        certs,
        asos,
        epis,
        compliance,
        trainingAlerts,
        esocial,
      ] = await Promise.all([
        getEmployees().catch(() => []),
        sstGetList('sst_accidents').catch(() => []),
        sstGetList('sst_non_conformities').catch(() => []),
        sstGetList('sst_action_plans').catch(() => []),
        sstGetList('sst_risk_inventory').catch(() => []),
        sstGetList('sst_certificates').catch(() => []),
        sstGetList('sst_aso').catch(() => []),
        sstGetList('sst_epis').catch(() => []),
        getComplianceStatus().catch(() => []),
        getTrainingMatrixAlerts().catch(() => ({ expired: 0, expiring: 0, pending: 0, valid: 0 })),
        getEsocialSSTStats().catch(() => null),
      ])

      const now = new Date()
      const delayedActions = actions.filter(
        (a: any) =>
          ['Pendente', 'Em Andamento'].includes(a.situacao) &&
          a.data_fim &&
          new Date(a.data_fim) < now,
      ).length
      const criticalRisks = risks.filter(
        (r: any) => r.intensidade === 'Alto' || r.tipo_risco === 'Acidente',
      ).length
      const uncontrolledCritical = risks.filter(
        (r: any) =>
          (r.intensidade === 'Alto' || r.tipo_risco === 'Acidente') &&
          (!r.medidas_controle || r.medidas_controle.trim() === ''),
      ).length
      const expiredCerts = certs.filter((c: any) => c.situacao === 'Vencido').length
      const expiredAsos = asos.filter(
        (a: any) =>
          a.situacao === 'Vencido' || (a.data_validade && new Date(a.data_validade) < now),
      ).length
      const expiredEpis = epis.filter((e: any) => e.validade && new Date(e.validade) < now).length
      const nonCompliantNRs = compliance.filter((c: any) => c.status === 'Não Conforme').length
      const attentionNRs = compliance.filter((c: any) => c.status === 'Atenção').length

      setData({
        totalEmployees: emp.length,
        totalAccidents: accidents.length,
        openNCs: ncs.filter((n: any) => ['Aberta', 'Em Tratamento'].includes(n.situacao)).length,
        delayedActions,
        criticalRisks,
        uncontrolledCritical,
        expiredCerts,
        expiredAsos,
        expiredEpis,
        nonCompliantNRs,
        attentionNRs,
        trainingAlerts,
        esocial,
      })
    } catch {
      setData(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('sst_accidents', () => load())
  useRealtime('sst_action_plans', () => load())
  useRealtime('sst_non_conformities', () => load())

  if (loading || !data) return <SstLoading />

  const cards = [
    { label: 'Colaboradores', value: data.totalEmployees, icon: Activity, color: 'text-[#005B2E]' },
    {
      label: 'Acidentes Registrados',
      value: data.totalAccidents,
      icon: AlertTriangle,
      color: 'text-red-600',
    },
    { label: 'NCs em Aberto', value: data.openNCs, icon: XCircle, color: 'text-amber-600' },
    { label: 'Ações Atrasadas', value: data.delayedActions, icon: Clock, color: 'text-red-600' },
    {
      label: 'Riscos Críticos',
      value: data.criticalRisks,
      icon: ShieldAlert,
      color: 'text-red-600',
    },
    {
      label: 'Críticos Sem Controle',
      value: data.uncontrolledCritical,
      icon: ShieldAlert,
      color: 'text-red-700',
    },
    { label: 'ASOs Vencidos', value: data.expiredAsos, icon: FileWarning, color: 'text-red-600' },
    {
      label: 'Certificados Vencidos',
      value: data.expiredCerts,
      icon: FileWarning,
      color: 'text-red-600',
    },
    { label: 'EPIs Vencidos', value: data.expiredEpis, icon: ShieldAlert, color: 'text-amber-600' },
    {
      label: 'Treinamentos Vencidos',
      value: data.trainingAlerts.expired,
      icon: Clock,
      color: 'text-red-600',
    },
    {
      label: 'NRs Não Conformes',
      value: data.nonCompliantNRs,
      icon: XCircle,
      color: 'text-red-600',
    },
    {
      label: 'NRs em Atenção',
      value: data.attentionNRs,
      icon: AlertTriangle,
      color: 'text-amber-600',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-[#005B2E]" />
        <h3 className="text-lg font-bold">Cockpit Executivo SST</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <SstStatCard key={c.label} {...c} />
        ))}
      </div>
      {data.esocial && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h4 className="font-bold text-[#005B2E] mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" /> Monitor eSocial SST
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['S-2210', 'S-2220', 'S-2221', 'S-2240'].map((evt) => {
                const stats = (data.esocial as any)[evt.toLowerCase().replace('s-', 's')] || {}
                return (
                  <div key={evt} className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-sm font-bold text-[#005B2E]">{evt}</p>
                    <div className="flex justify-center gap-2 mt-1 text-xs">
                      <span className="text-amber-600">P:{stats.pending || 0}</span>
                      <span className="text-blue-600">E:{stats.sent || 0}</span>
                      <span className="text-emerald-600">A:{stats.accepted || 0}</span>
                      <span className="text-red-600">R:{stats.rejected || 0}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <h4 className="font-bold text-[#005B2E] mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> Indicadores de Compliance
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-sm">
                NRs Conformes: {12 - data.nonCompliantNRs - data.attentionNRs}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm">NRs em Atenção: {data.attentionNRs}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm">NRs Não Conformes: {data.nonCompliantNRs}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
