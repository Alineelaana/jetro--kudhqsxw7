import { useState, useEffect } from 'react'
import { SstStatCard, SstLoading } from '@/components/sst/sst-shared'
import { getEmployees } from '@/services/rh'
import { sstGetList } from '@/services/sst'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Users,
  FileX,
  FileCheck,
  Shield,
  AlertTriangle,
  AlertCircle,
  ClipboardCheck,
  FileWarning,
  GraduationCap,
  Award,
  Brain,
} from 'lucide-react'

export function SstDashboard() {
  const [kpi, setKpi] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [
        emp,
        asos,
        epis,
        accidents,
        ncs,
        actions,
        pgrs,
        inspections,
        dds,
        certs,
        psychosocial,
      ] = await Promise.all([
        getEmployees().catch(() => []),
        sstGetList('sst_aso').catch(() => []),
        sstGetList('sst_epis').catch(() => []),
        sstGetList('sst_accidents').catch(() => []),
        sstGetList('sst_non_conformities').catch(() => []),
        sstGetList('sst_action_plans').catch(() => []),
        sstGetList('sst_pgr').catch(() => []),
        sstGetList('sst_inspections').catch(() => []),
        sstGetList('sst_dds').catch(() => []),
        sstGetList('sst_certificates').catch(() => []),
        sstGetList('sst_psychosocial_assessments').catch(() => []),
      ])
      const now = new Date()
      setKpi({
        total: emp.length,
        asoExpired: asos.filter(
          (a: any) =>
            a.situacao === 'Vencido' || (a.data_validade && new Date(a.data_validade) < now),
        ).length,
        asoValid: asos.filter((a: any) => a.situacao === 'Válido').length,
        episDelivered: epis.filter((e: any) => e.situacao === 'Entregue').length,
        accidents: accidents.length,
        ncsOpen: ncs.filter((n: any) => ['Aberta', 'Em Tratamento'].includes(n.situacao)).length,
        actionsPending: actions.filter((a: any) =>
          ['Pendente', 'Em Andamento'].includes(a.situacao),
        ).length,
        pgrActive: pgrs.filter((p: any) => p.situacao === 'Ativo').length,
        pgrExpired: pgrs.filter((p: any) => p.situacao === 'Vencido').length,
        inspectionsDone: inspections.filter((i: any) => i.situacao === 'Realizada').length,
        ddsDone: dds.filter((d: any) => d.situacao === 'Realizado').length,
        certsExpired: certs.filter((c: any) => c.situacao === 'Vencido').length,
        psychPending: psychosocial.filter((p: any) => p.situacao === 'Pendente').length,
      })
    } catch {
      setKpi(null)
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('sst_aso', () => load())
  useRealtime('sst_accidents', () => load())

  if (loading || !kpi) return <SstLoading />

  const cards = [
    { label: 'Total de Colaboradores', value: kpi.total, icon: Users, color: 'text-[#005B2E]' },
    { label: 'ASO Vencidos', value: kpi.asoExpired, icon: FileX, color: 'text-red-600' },
    { label: 'ASO Válidos', value: kpi.asoValid, icon: FileCheck, color: 'text-emerald-600' },
    { label: 'EPIs Entregues', value: kpi.episDelivered, icon: Shield, color: 'text-blue-600' },
    {
      label: 'Acidentes Registrados',
      value: kpi.accidents,
      icon: AlertTriangle,
      color: 'text-red-600',
    },
    {
      label: 'Não Conformidades Abertas',
      value: kpi.ncsOpen,
      icon: AlertCircle,
      color: 'text-amber-600',
    },
    {
      label: 'Planos de Ação Pendentes',
      value: kpi.actionsPending,
      icon: ClipboardCheck,
      color: 'text-amber-700',
    },
    { label: 'PGR Ativo', value: kpi.pgrActive, icon: FileCheck, color: 'text-emerald-600' },
    { label: 'PGR Vencido', value: kpi.pgrExpired, icon: FileWarning, color: 'text-red-600' },
    {
      label: 'Inspeções Realizadas',
      value: kpi.inspectionsDone,
      icon: ClipboardCheck,
      color: 'text-blue-600',
    },
    { label: 'DDS Realizados', value: kpi.ddsDone, icon: GraduationCap, color: 'text-cyan-600' },
    { label: 'Certificados Vencidos', value: kpi.certsExpired, icon: Award, color: 'text-red-600' },
    {
      label: 'Avaliações Psicossociais Pendentes',
      value: kpi.psychPending,
      icon: Brain,
      color: 'text-amber-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <SstStatCard key={c.label} {...c} />
      ))}
    </div>
  )
}
