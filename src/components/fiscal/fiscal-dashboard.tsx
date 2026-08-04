import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  getNfseRecords,
  getCteRecords,
  getMdfeRecords,
  getApuracoes,
  getCorrections,
  getManifestations,
  getCertificates,
  getReformCredits,
  getReformValidations,
} from '@/services/fiscal'
import { getNfeRecords, getNfceRecords } from '@/services/sales'
import { getPurchaseInvoices } from '@/services/purchasing'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Loader2,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react'

export function FiscalDashboard() {
  const [data, setData] = useState<Record<string, unknown[]>>({})
  const [loading, setLoading] = useState(true)
  const [filterPeriod, setFilterPeriod] = useState('')

  const load = async () => {
    try {
      const [
        nfse,
        cte,
        mdfe,
        apur,
        corr,
        manifest,
        certs,
        credits,
        validations,
        nfe,
        nfce,
        purInv,
      ] = await Promise.all([
        getNfseRecords().catch(() => []),
        getCteRecords().catch(() => []),
        getMdfeRecords().catch(() => []),
        getApuracoes().catch(() => []),
        getCorrections().catch(() => []),
        getManifestations().catch(() => []),
        getCertificates().catch(() => []),
        getReformCredits().catch(() => []),
        getReformValidations().catch(() => []),
        getNfeRecords().catch(() => []),
        getNfceRecords().catch(() => []),
        getPurchaseInvoices().catch(() => []),
      ])
      setData({
        nfse,
        cte,
        mdfe,
        apur,
        corr,
        manifest,
        certs,
        credits,
        validations,
        nfe,
        nfce,
        purInv,
      })
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('nfe_records', () => load())
  useRealtime('nfse_records', () => load())
  useRealtime('cte_records', () => load())

  const stats = useMemo(() => {
    const d = data
    const arr = (k: string) => (d[k] as unknown[]) || []
    const authorized = (r: unknown) => (r as Record<string, string>)?.status === 'Autorizada'
    const rejected = (r: unknown) => (r as Record<string, string>)?.status === 'Rejeitada'
    const canceled = (r: unknown) => (r as Record<string, string>)?.status === 'Cancelada'
    const waiting = (r: unknown) =>
      ['Em Digitação', 'Aguardando Transmissão', 'Em Validação'].includes(
        (r as Record<string, string>)?.status || '',
      )
    const certs = arr('certs') as Record<string, string>[]
    const now = new Date()
    const certAlerts = certs.filter((c) => {
      if (!c?.data_vencimento) return false
      const diff = new Date(c.data_vencimento).getTime() - now.getTime()
      return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
    }).length
    const manifestPend = arr('manifest').filter(
      (m) => !(m as Record<string, string>)?.tipo_manifestacao,
    ).length
    const valErrors = arr('validations').filter((v) =>
      ['Com Erro', 'Aguardando Correcao'].includes((v as Record<string, string>)?.status || ''),
    ).length
    const creditsAvail = arr('credits').filter(
      (c) => (c as Record<string, string>)?.situacao === 'Disponivel',
    )
    const totalCBS = creditsAvail.reduce(
      (s, c) => s + parseFloat((c as Record<string, string>)?.cbs || '0'),
      0,
    )
    const totalIBS = creditsAvail.reduce(
      (s, c) => s + parseFloat((c as Record<string, string>)?.ibs || '0'),
      0,
    )
    const totalSel = creditsAvail.reduce(
      (s, c) => s + parseFloat((c as Record<string, string>)?.imposto_seletivo || '0'),
      0,
    )
    return {
      entradas: arr('purInv').length,
      saidasNfe: arr('nfe').length,
      nfse: arr('nfse').length,
      nfce: arr('nfce').length,
      cte: arr('cte').length,
      mdfe: arr('mdfe').length,
      autorizadas: [...arr('nfe'), ...arr('nfse'), ...arr('nfce')].filter(authorized).length,
      rejeitadas: [...arr('nfe'), ...arr('nfse'), ...arr('nfce')].filter(rejected).length,
      canceladas: [...arr('nfe'), ...arr('nfse'), ...arr('nfce')].filter(canceled).length,
      aguardando: [...arr('nfe'), ...arr('nfse'), ...arr('nfce')].filter(waiting).length,
      apuracoes: arr('apur').length,
      correcoes: arr('corr').length,
      manifestPend,
      certAlerts,
      valErrors,
      totalCBS,
      totalIBS,
      totalSel,
    }
  }, [data])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const cards = [
    { icon: FileText, label: 'Notas de Entrada', value: stats.entradas, color: '#005B2E' },
    { icon: FileText, label: 'NF-e Emitidas', value: stats.saidasNfe, color: '#C89B3C' },
    { icon: FileText, label: 'NFS-e', value: stats.nfse, color: '#3b82f6' },
    { icon: FileText, label: 'NFC-e', value: stats.nfce, color: '#22c55e' },
    { icon: FileText, label: 'CT-e', value: stats.cte, color: '#8b5cf6' },
    { icon: FileText, label: 'MDF-e', value: stats.mdfe, color: '#06b6d4' },
    { icon: CheckCircle, label: 'Autorizadas', value: stats.autorizadas, color: '#10b981' },
    { icon: XCircle, label: 'Rejeitadas', value: stats.rejeitadas, color: '#ef4444' },
    { icon: XCircle, label: 'Canceladas', value: stats.canceladas, color: '#f59e0b' },
    { icon: Clock, label: 'Aguardando', value: stats.aguardando, color: '#f59e0b' },
    { icon: DollarSign, label: 'Apurações', value: stats.apuracoes, color: '#005B2E' },
    { icon: FileText, label: 'Cartas de Correção', value: stats.correcoes, color: '#3b82f6' },
    {
      icon: AlertTriangle,
      label: 'Manifest. Pendentes',
      value: stats.manifestPend,
      color: '#f59e0b',
    },
    { icon: ShieldAlert, label: 'Certif. Vencendo', value: stats.certAlerts, color: '#ef4444' },
    { icon: AlertTriangle, label: 'Divergências', value: stats.valErrors, color: '#ef4444' },
    {
      icon: TrendingUp,
      label: 'CBS Disponível',
      value: `R$ ${stats.totalCBS.toFixed(2)}`,
      color: '#005B2E',
    },
    {
      icon: TrendingUp,
      label: 'IBS Disponível',
      value: `R$ ${stats.totalIBS.toFixed(2)}`,
      color: '#C89B3C',
    },
    {
      icon: TrendingUp,
      label: 'Imp. Seletivo',
      value: `R$ ${stats.totalSel.toFixed(2)}`,
      color: '#8b5cf6',
    },
  ]

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-3">
          <Input
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            type="month"
            className="max-w-xs focus-visible:ring-[#005B2E]"
          />
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c, i) => (
          <Card key={i} className="border-2" style={{ borderColor: `${c.color}33` }}>
            <CardContent className="py-3 px-4 flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${c.color}1A` }}
              >
                <c.icon className="w-4 h-4" style={{ color: c.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-base font-black text-foreground truncate">{c.value}</p>
                <p className="text-[10px] text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-2 border-[#C89B3C]/30">
        <CardHeader>
          <CardTitle className="text-base text-[#C89B3C]">
            Impacto Estimado da Reforma Tributária
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#005B2E]/5">
              <p className="text-xs text-muted-foreground">CBS Total (Créditos)</p>
              <p className="text-2xl font-black text-[#005B2E]">R$ {stats.totalCBS.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#C89B3C]/5">
              <p className="text-xs text-muted-foreground">IBS Total (Créditos)</p>
              <p className="text-2xl font-black text-[#C89B3C]">R$ {stats.totalIBS.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#8b5cf6]/5">
              <p className="text-xs text-muted-foreground">Imposto Seletivo</p>
              <p className="text-2xl font-black text-[#8b5cf6]">R$ {stats.totalSel.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
