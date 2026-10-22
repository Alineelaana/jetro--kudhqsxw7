import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DpStatCard, DpLoading, DpTable, DpStatusBadge } from '@/components/dp/dp-shared'
import { getEmployees, getTimeRecords, getVacations, getPayroll } from '@/services/rh'
import { getFgtsByCompetencia, getEsocialEventsByStatus } from '@/services/dp-enterprise'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  FileClock,
  AlertCircle,
  Wallet,
  FileCheck,
  AlertTriangle,
  SendHorizontal,
  DollarSign,
  ChevronRight,
} from 'lucide-react'
import { ExportActions } from '@/components/shared/export-actions'
import { Link } from 'react-router-dom'

export function DpPainelScreen() {
  const [kpi, setKpi] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [prazos, setPrazos] = useState<any[]>([])

  const load = async () => {
    try {
      const [emp, time, vac, pay, fgts, esocial] = await Promise.all([
        getEmployees().catch(() => []),
        getTimeRecords().catch(() => []),
        getVacations().catch(() => []),
        getPayroll().catch(() => []),
        getFgtsByCompetencia(new Date().toISOString().slice(0, 7)).catch(() => []),
        getEsocialEventsByStatus('Pendente').catch(() => []),
      ])

      const now = new Date()
      const totalColab = emp.length
      const ativos = emp.filter((e: any) => e.situacao === 'Ativo').length
      const admissions = emp.filter(
        (e: any) => e.data_admissao && new Date(e.data_admissao).getMonth() === now.getMonth(),
      ).length
      const onVacation = emp.filter((e: any) => e.situacao === 'Em Férias').length
      const pendingTime = time.filter((t: any) => t.situacao === 'Pendente').length
      const overtime = time.filter((t: any) => t.horas_extras && t.horas_extras !== '00:00').length
      const pendingPay = pay.filter((p: any) =>
        ['Em Preparação', 'Em Processamento', 'Aguardando Aprovação'].includes(p.situacao),
      ).length
      const overdueVac = vac.filter((v: any) => v.situacao === 'Vencida').length
      const pendingEsocial = esocial.length
      const fgtsDiverg = fgts.filter((f: any) => f.divergencia).length

      setKpi({
        total: totalColab,
        active: ativos,
        admissions,
        onVacation,
        pendingTime,
        overtime,
        pendingPay,
        overdueVac,
        pendingEsocial,
        fgtsDiverg,
      })

      // Gerar prazos legais automáticos
      const mesAtual = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      const mockPrazos = [
        {
          obrigacao: 'Fechamento da Folha Mensal',
          base: 'CLT art. 459',
          vencimento: `05/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`,
          status: pendingPay > 0 ? 'Pendente' : 'Concluído',
          modulo: '/admin/dp/folha-beneficios',
        },
        {
          obrigacao: 'Vencimento Guia FGTS Digital',
          base: 'Lei 14.438/2022',
          vencimento: `20/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`,
          status: fgtsDiverg > 0 ? 'Atenção' : 'Regular',
          modulo: '/admin/dp/obrigacoes-esocial',
        },
        {
          obrigacao: 'Transmissão eSocial S-1200 / S-1210',
          base: 'Manual eSocial S-1.3',
          vencimento: `15/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`,
          status: pendingEsocial > 0 ? 'Pendente' : 'Regular',
          modulo: '/admin/dp/obrigacoes-esocial',
        },
        {
          obrigacao: 'Férias em Limite de Dobro',
          base: 'CLT art. 134',
          vencimento: 'Próximos 30 dias',
          status: overdueVac > 0 ? 'Crítico' : 'Regular',
          modulo: '/admin/dp/ferias-afastamentos',
        },
        {
          obrigacao: 'Espelho de Ponto e Banco de Horas',
          base: 'Portaria 671 MTE',
          vencimento: 'Último dia útil do mês',
          status: pendingTime > 0 ? 'Pendente' : 'Regular',
          modulo: '/admin/dp/jornada-ponto',
        },
      ]
      setPrazos(mockPrazos)
    } catch {
      setKpi(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  useRealtime('rh_employees', () => load())
  useRealtime('rh_time_records', () => load())
  useRealtime('rh_payroll', () => load())
  useRealtime('dp_esocial_events', () => load())

  if (loading || !kpi) return <DpLoading />

  const cards = [
    { label: 'Total de Colaboradores', value: kpi.total, icon: Users, color: 'text-[#005B2E]' },
    {
      label: 'Colaboradores Ativos',
      value: kpi.active,
      icon: FileCheck,
      color: 'text-emerald-600',
    },
    { label: 'Admissões do Mês', value: kpi.admissions, icon: UserPlus, color: 'text-blue-600' },
    { label: 'Em Férias', value: kpi.onVacation, icon: Calendar, color: 'text-cyan-600' },
    { label: 'Pendências de Ponto', value: kpi.pendingTime, icon: Clock, color: 'text-amber-700' },
    { label: 'Horas Extras', value: kpi.overtime, icon: AlertCircle, color: 'text-orange-600' },
    { label: 'Folha Aguardando', value: kpi.pendingPay, icon: FileClock, color: 'text-amber-700' },
    { label: 'Férias Vencidas', value: kpi.overdueVac, icon: Wallet, color: 'text-red-600' },
    {
      label: 'eSocial Pendentes',
      value: kpi.pendingEsocial,
      icon: SendHorizontal,
      color: 'text-indigo-600',
    },
    {
      label: 'Divergências FGTS',
      value: kpi.fgtsDiverg,
      icon: AlertTriangle,
      color: 'text-red-600',
    },
  ]

  const exportHeaders = ['Obrigação Legal', 'Base Normativa', 'Prazo Vencimento', 'Situação']
  const exportRows = prazos.map((p) => [p.obrigacao, p.base, p.vencimento, p.status])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#005B2E]">
            Painel DP — Gestão de Prazos e Indicadores
          </h2>
          <p className="text-xs text-muted-foreground">
            Acompanhamento central de vencimentos legais, eSocial, ponto, férias e obrigações
            trabalhistas
          </p>
        </div>
        <ExportActions
          title="Painel Departamento Pessoal — Prazos e Indicadores"
          headers={exportHeaders}
          data={exportRows}
          filenamePrefix="dp_painel_indicadores"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <DpStatCard key={c.label} {...c} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-2 border-[#005B2E]/20">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold text-[#005B2E] flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Calendário de Prazos Legais e Tributários
            </CardTitle>
            <span className="text-xs text-muted-foreground font-normal">
              Conformidade CLT / eSocial
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <DpTable headers={['Obrigação', 'Base Legal', 'Prazo', 'Situação', 'Ação']}>
              {prazos.map((p, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-3 font-semibold text-xs">{p.obrigacao}</td>
                  <td className="px-3 py-3 text-[11px] text-muted-foreground">{p.base}</td>
                  <td className="px-3 py-3 text-xs font-mono">{p.vencimento}</td>
                  <td className="px-3 py-3">
                    <DpStatusBadge status={p.status} />
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      to={p.modulo}
                      className="inline-flex items-center text-xs font-medium text-[#005B2E] hover:underline"
                    >
                      Abrir <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </DpTable>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-bold text-[#005B2E] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Ações Prioritárias DP
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="p-3 bg-amber-50 rounded border border-amber-200">
              <p className="font-semibold text-amber-900">Afastamentos e Atestados</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Verifique se atestados superiores a 15 dias foram encaminhados ao INSS e geraram
                evento S-2230.
              </p>
              <Link
                to="/admin/dp/ferias-afastamentos"
                className="text-[#005B2E] font-bold mt-1 inline-block hover:underline"
              >
                Ir para Afastamentos →
              </Link>
            </div>

            <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
              <p className="font-semibold text-emerald-900">Fechamento de Ponto</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Existem {kpi.pendingTime} pendência(s) de marcação aguardando justificativa do
                colaborador ou gestor.
              </p>
              <Link
                to="/admin/dp/jornada-ponto"
                className="text-[#005B2E] font-bold mt-1 inline-block hover:underline"
              >
                Ajustar Batidas →
              </Link>
            </div>

            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="font-semibold text-blue-900">Integração com SST e Saúde</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                ASOs periódicos e admissionais são geridos no módulo SST com sigilo médico integral.
              </p>
              <Link
                to="/admin/sst/saude-ocupacional"
                className="text-blue-700 font-bold mt-1 inline-block hover:underline"
              >
                Ver Saúde Ocupacional →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
