import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getDeliveries,
  getRoutes,
  getVehicles,
  getDrivers,
  getFreights,
  getOccurrences,
  getCosts,
} from '@/services/logistics'
import { useAuth } from '@/hooks/use-auth'
import { exportToCsv } from '@/services/configuracoes'
import logoUrl from '@/assets/chatgpt-image-1-de-ago.de-2026-103549-f6f46.png'
import { Printer, FileDown, Loader2, FileText } from 'lucide-react'

const REPORT_TYPES = [
  { id: 'deliveries', label: 'Entregas' },
  { id: 'routes', label: 'Rotas' },
  { id: 'vehicles', label: 'Veículos' },
  { id: 'drivers', label: 'Motoristas' },
  { id: 'freights', label: 'Fretes' },
  { id: 'occurrences', label: 'Ocorrências' },
  { id: 'costs', label: 'Custos Logísticos' },
  { id: 'on_time', label: 'Entregas no Prazo' },
  { id: 'delayed', label: 'Entregas Atrasadas' },
]

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function LogisticsReports() {
  const { user } = useAuth()
  const [reportType, setReportType] = useState('deliveries')
  const [loading, setLoading] = useState(false)
  const [allData, setAllData] = useState<Record<string, unknown[]>>({})

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getDeliveries().catch(() => []),
      getRoutes().catch(() => []),
      getVehicles().catch(() => []),
      getDrivers().catch(() => []),
      getFreights().catch(() => []),
      getOccurrences().catch(() => []),
      getCosts().catch(() => []),
    ])
      .then(([del, rt, veh, drv, frt, occ, cst]) => {
        setAllData({
          del: del as unknown[],
          rt: rt as unknown[],
          veh: veh as unknown[],
          drv: drv as unknown[],
          frt: frt as unknown[],
          occ: occ as unknown[],
          cst: cst as unknown[],
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const report = useMemo(() => {
    const d = allData
    const today = new Date().toISOString().split('T')[0]
    const map: Record<string, { headers: string[]; rows: string[][]; title: string }> = {
      deliveries: {
        title: 'Entregas',
        headers: ['Número', 'Cliente', 'Rota', 'Status', 'Data Prevista'],
        rows: (d.del || []).map((r: any) => [
          r.numero_entrega || '—',
          r.cliente || '—',
          r.rota || '—',
          r.status || '—',
          r.data_prevista || '—',
        ]),
      },
      routes: {
        title: 'Rotas',
        headers: ['Código', 'Nome', 'Região', 'Situação'],
        rows: (d.rt || []).map((r: any) => [
          r.codigo_rota || '—',
          r.nome_rota || '—',
          r.regiao || '—',
          r.situacao || '—',
        ]),
      },
      vehicles: {
        title: 'Veículos',
        headers: ['Código', 'Placa', 'Marca/Modelo', 'Situação'],
        rows: (d.veh || []).map((r: any) => [
          r.codigo || '—',
          r.placa || '—',
          `${r.marca || ''} ${r.modelo || ''}`,
          r.situacao || '—',
        ]),
      },
      drivers: {
        title: 'Motoristas',
        headers: ['Nome', 'CNH', 'Vínculo', 'Situação'],
        rows: (d.drv || []).map((r: any) => [
          r.nome || '—',
          r.numero_cnh || '—',
          r.tipo_vinculo || '—',
          r.situacao || '—',
        ]),
      },
      freights: {
        title: 'Fretes',
        headers: ['Número', 'Cliente', 'Transportadora', 'Valor Total', 'Situação'],
        rows: (d.frt || []).map((r: any) => [
          r.numero_frete || '—',
          r.cliente || '—',
          r.transportadora || '—',
          r.valor_total || '0',
          r.situacao || '—',
        ]),
      },
      occurrences: {
        title: 'Ocorrências',
        headers: ['Entrega', 'Cliente', 'Tipo', 'Situação'],
        rows: (d.occ || []).map((r: any) => [
          r.entrega || '—',
          r.cliente || '—',
          r.tipo_ocorrencia || '—',
          r.situacao || '—',
        ]),
      },
      costs: {
        title: 'Custos Logísticos',
        headers: ['Descrição', 'Tipo', 'Valor', 'Data'],
        rows: (d.cst || []).map((r: any) => [
          r.descricao || '—',
          r.tipo_custo || '—',
          r.valor || '0',
          r.data || '—',
        ]),
      },
      on_time: {
        title: 'Entregas no Prazo',
        headers: ['Número', 'Cliente', 'Data Prevista', 'Data Realizada'],
        rows: (d.del || [])
          .filter((r: any) => r.status === 'Entregue')
          .map((r: any) => [
            r.numero_entrega || '—',
            r.cliente || '—',
            r.data_prevista || '—',
            r.data_realizada || '—',
          ]),
      },
      delayed: {
        title: 'Entregas Atrasadas',
        headers: ['Número', 'Cliente', 'Data Prevista', 'Status'],
        rows: (d.del || [])
          .filter(
            (r: any) =>
              r.data_prevista &&
              r.data_prevista < today &&
              !['Entregue', 'Cancelada'].includes(r.status),
          )
          .map((r: any) => [
            r.numero_entrega || '—',
            r.cliente || '—',
            r.data_prevista || '—',
            r.status || '—',
          ]),
      },
    }
    return map[reportType] || { headers: [], rows: [], title: '' }
  }, [reportType, allData])

  const userName = (user?.name as string) || 'Usuário'

  const handlePdf = () => {
    const fullLogoUrl = new URL(logoUrl, window.location.href).href
    const headerHtml = report.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')
    const rowsHtml = report.rows
      .map(
        (r, i) =>
          `<tr class="${i % 2 === 0 ? '' : 'alt'}">${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`,
      )
      .join('')
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escapeHtml(report.title)}</title><style>@page{size:A4;margin:0}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif}.stripe{background:linear-gradient(135deg,#005B2E,#01361D);height:8mm}.content{padding:8mm 15mm}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:5mm}.header img{height:40px}.header h1{color:#005B2E;font-size:20px}.header .meta{font-size:10px;color:#666;text-align:right}table{width:100%;border-collapse:collapse;font-size:10px}th{background:#005B2E;color:#fff;padding:6px;text-align:left}td{padding:5px;border-bottom:1px solid #e0e0e0}tr.alt{background:#f7f7f5}</style></head><body><div class="stripe"></div><div class="content"><div class="header"><img src="${fullLogoUrl}" alt="Velora Log" /><h1>${escapeHtml(report.title)}</h1><div class="meta">Gerado por: ${escapeHtml(userName)}<br>Registros: ${report.rows.length}</div></div><table><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></div><script>window.onload=function(){setTimeout(function(){window.print()},500)}</script></body></html>`
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
  }

  const handleCsv = () => {
    const records = report.rows.map((row) => {
      const obj: Record<string, unknown> = {}
      report.headers.forEach((h, idx) => {
        obj[h] = row[idx] ?? ''
      })
      return obj
    })
    exportToCsv(records, `${report.title.toLowerCase().replace(/\s+/g, '_')}.csv`, {
      module: `Logística > ${report.title}`,
      format: 'csv',
      filters: {},
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Relatórios Logísticos</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!report.rows.length}
            onClick={handlePdf}
            className="border-[#005B2E] text-[#005B2E]"
          >
            <Printer className="w-4 h-4 mr-2" /> PDF
          </Button>
          <Button
            variant="outline"
            disabled={!report.rows.length}
            onClick={handleCsv}
            className="border-[#005B2E] text-[#005B2E]"
          >
            <FileDown className="w-4 h-4 mr-2" /> CSV
          </Button>
        </div>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <Label className="text-xs mb-2 block">Tipo de Relatório</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="focus-visible:ring-[#005B2E]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : report.rows.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Sem dados para este relatório.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  {report.headers.map((h, i) => (
                    <th key={i} className="text-left px-3 py-3 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row, i) => (
                  <tr key={i} className="border-b border-border hover:bg-[#005B2E]/5">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
