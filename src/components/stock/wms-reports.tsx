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
  getWmsReceipts,
  getWmsPutawayTasks,
  getWmsWaves,
  getWmsReplenishments,
  getWmsSeparations,
  getWmsExpeditionChecks,
  getWmsShippings,
  getWmsRomaneios,
  getWmsReceiptChecks,
} from '@/services/wms'
import {
  getStockMovements,
  getStockInventories,
  getStockTransfers,
  getStockLocations,
  getStockBatches,
} from '@/services/stock'
import { useAuth } from '@/hooks/use-auth'
import { printWmsReport, exportWmsXls, exportWmsCsv } from '@/lib/wms-reports-export'
import { Printer, FileDown, FileSpreadsheet, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

const REPORT_TYPES = [
  { id: 'receipts', label: 'Recebimentos' },
  { id: 'receipt_divergences', label: 'Divergências de Recebimento' },
  { id: 'putaway', label: 'Endereçamentos' },
  { id: 'storage', label: 'Armazenagem' },
  { id: 'replenishments', label: 'Reabastecimentos' },
  { id: 'waves', label: 'Ondas de Separação' },
  { id: 'separations', label: 'Separações' },
  { id: 'checks', label: 'Conferências' },
  { id: 'expeditions', label: 'Expedições' },
  { id: 'romaneios', label: 'Romaneios' },
  { id: 'inventories', label: 'Inventários' },
  { id: 'transfers', label: 'Transferências Internas' },
  { id: 'occupation', label: 'Ocupação do Armazém' },
  { id: 'operator_productivity', label: 'Produtividade por Operador' },
  { id: 'avg_time', label: 'Tempo Médio por Operação' },
  { id: 'movements_by_product', label: 'Movimentações por Produto' },
  { id: 'movements_by_lot', label: 'Movimentações por Lote' },
  { id: 'movements_by_location', label: 'Movimentações por Localização' },
  { id: 'pallet_history', label: 'Histórico de Pallets' },
]

export function WmsReports() {
  const { user } = useAuth()
  const [reportType, setReportType] = useState('receipts')
  const [loading, setLoading] = useState(false)
  const [dataError, setDataError] = useState(false)
  const [allData, setAllData] = useState<Record<string, unknown[]>>({})

  useEffect(() => {
    setLoading(true)
    setDataError(false)
    Promise.all([
      getWmsReceipts().catch(() => []),
      getWmsReceiptChecks().catch(() => []),
      getWmsPutawayTasks().catch(() => []),
      getWmsWaves().catch(() => []),
      getWmsReplenishments().catch(() => []),
      getWmsSeparations().catch(() => []),
      getWmsExpeditionChecks().catch(() => []),
      getWmsShippings().catch(() => []),
      getWmsRomaneios().catch(() => []),
      getStockInventories().catch(() => []),
      getStockTransfers().catch(() => []),
      getStockLocations().catch(() => []),
      getStockMovements().catch(() => []),
      getStockBatches().catch(() => []),
    ])
      .then(
        ([
          receipts,
          rc,
          put,
          waves,
          repl,
          seps,
          ec,
          ships,
          rom,
          invs,
          trans,
          locs,
          movs,
          batches,
        ]) => {
          setAllData({
            receipts: receipts as unknown[],
            rc: rc as unknown[],
            put: put as unknown[],
            waves: waves as unknown[],
            repl: repl as unknown[],
            seps: seps as unknown[],
            ec: ec as unknown[],
            ships: ships as unknown[],
            rom: rom as unknown[],
            invs: invs as unknown[],
            trans: trans as unknown[],
            locs: locs as unknown[],
            movs: movs as unknown[],
            batches: batches as unknown[],
          })
        },
      )
      .catch(() => setDataError(true))
      .finally(() => setLoading(false))
  }, [])

  const report = useMemo(() => {
    const d = allData
    const map: Record<
      string,
      { headers: string[]; rows: string[][]; title: string; data: unknown[] }
    > = {
      receipts: {
        title: 'Recebimentos',
        headers: ['Número', 'Fornecedor', 'NF', 'Status', 'Data'],
        rows: (d.receipts || []).map((r: any) => [
          r.numero_recebimento || '—',
          r.fornecedor || '—',
          r.nota_fiscal || '—',
          r.status || '—',
          r.created ? new Date(r.created).toLocaleDateString('pt-BR') : '—',
        ]),
        data: d.receipts || [],
      },
      receipt_divergences: {
        title: 'Divergências de Recebimento',
        headers: ['Número', 'Produto', 'Qtd. Esperada', 'Qtd. Recebida', 'Diferença', 'Status'],
        rows: (d.rc || [])
          .filter((r: any) => r.status === 'Com Divergencia')
          .map((r: any) => [
            r.numero_conferencia || '—',
            r.produto_nome || '—',
            String(r.quantidade_esperada || 0),
            String(r.quantidade_recebida || 0),
            String(r.diferenca || 0),
            r.status || '—',
          ]),
        data: d.rc || [],
      },
      putaway: {
        title: 'Endereçamentos',
        headers: ['Número', 'Produto', 'Qtd', 'Origem', 'Destino', 'Status'],
        rows: (d.put || []).map((r: any) => [
          r.numero_task || '—',
          r.produto_nome || '—',
          String(r.quantidade || 0),
          r.localizacao_origem || '—',
          r.localizacao_destino || '—',
          r.status || '—',
        ]),
        data: d.put || [],
      },
      storage: {
        title: 'Armazenagem',
        headers: ['Número', 'Produto', 'Localização', 'Status'],
        rows: (d.put || [])
          .filter((r: any) => r.status === 'Concluído')
          .map((r: any) => [
            r.numero_task || '—',
            r.produto_nome || '—',
            r.localizacao_destino || '—',
            r.status || '—',
          ]),
        data: d.put || [],
      },
      replenishments: {
        title: 'Reabastecimentos',
        headers: ['Número', 'Produto', 'Qtd', 'Origem', 'Destino', 'Status'],
        rows: (d.repl || []).map((r: any) => [
          r.numero_reabastecimento || '—',
          r.produto_nome || '—',
          String(r.quantidade || 0),
          r.localizacao_origem || '—',
          r.localizacao_destino || '—',
          r.status || '—',
        ]),
        data: d.repl || [],
      },
      waves: {
        title: 'Ondas de Separação',
        headers: ['Número', 'Tipo', 'Status', 'Itens', 'Separados'],
        rows: (d.waves || []).map((r: any) => [
          r.numero_wave || '—',
          r.tipo || '—',
          r.status || '—',
          String(r.total_itens || 0),
          String(r.itens_separados || 0),
        ]),
        data: d.waves || [],
      },
      separations: {
        title: 'Separações',
        headers: ['Número', 'Pedido', 'Cliente', 'Produto', 'Qtd', 'Status'],
        rows: (d.seps || []).map((r: any) => [
          r.numero_separacao || '—',
          r.pedido || '—',
          r.cliente || '—',
          r.produto_nome || '—',
          String(r.quantidade_solicitada || 0),
          r.status || '—',
        ]),
        data: d.seps || [],
      },
      checks: {
        title: 'Conferências',
        headers: ['Número', 'Pedido', 'Produto', 'Separado', 'Conferido', 'Status'],
        rows: (d.ec || []).map((r: any) => [
          r.numero_conferencia || '—',
          r.pedido || '—',
          r.produto_nome || '—',
          String(r.quantidade_separada || 0),
          String(r.quantidade_conferida || 0),
          r.status || '—',
        ]),
        data: d.ec || [],
      },
      expeditions: {
        title: 'Expedições',
        headers: ['Número', 'Pedido', 'NF', 'Cliente', 'Transportadora', 'Status'],
        rows: (d.ships || []).map((r: any) => [
          r.numero_expedicao || '—',
          r.pedido || '—',
          r.nota_fiscal || '—',
          r.cliente || '—',
          r.transportadora || '—',
          r.status || '—',
        ]),
        data: d.ships || [],
      },
      romaneios: {
        title: 'Romaneios',
        headers: ['Número', 'Data', 'Rota', 'Transportadora', 'Volumes', 'Status'],
        rows: (d.rom || []).map((r: any) => [
          r.numero_romaneio || '—',
          r.data || '—',
          r.rota || '—',
          r.transportadora || '—',
          String(r.quantidade_volumes || 0),
          r.status || '—',
        ]),
        data: d.rom || [],
      },
      inventories: {
        title: 'Inventários',
        headers: ['ID', 'Tipo', 'Status', 'Data'],
        rows: (d.invs || []).map((r: any) => [
          r.id || '—',
          r.type || r.tipo || '—',
          r.status || '—',
          r.created ? new Date(r.created).toLocaleDateString('pt-BR') : '—',
        ]),
        data: d.invs || [],
      },
      transfers: {
        title: 'Transferências Internas',
        headers: ['ID', 'Produto', 'Qtd', 'Origem', 'Destino', 'Status'],
        rows: (d.trans || []).map((r: any) => [
          r.id || '—',
          r.product_name || r.produto_nome || '—',
          String(r.quantity || r.quantidade || 0),
          r.from_location || r.localizacao_origem || '—',
          r.to_location || r.localizacao_destino || '—',
          r.status || '—',
        ]),
        data: d.trans || [],
      },
      occupation: {
        title: 'Ocupação do Armazém',
        headers: ['Localização', 'Tipo', 'Ocupado'],
        rows: (d.locs || []).map((r: any) => [
          r.name || r.codigo || '—',
          r.type || r.tipo || '—',
          r.occupied ? 'Sim' : 'Não',
        ]),
        data: d.locs || [],
      },
      operator_productivity: {
        title: 'Produtividade por Operador',
        headers: ['Operador', 'Tarefas Concluídas', 'Divergências'],
        rows: Object.entries(
          (d.seps || []).reduce((acc: Record<string, { done: number; div: number }>, r: any) => {
            const op = r.operador || '—'
            if (!acc[op]) acc[op] = { done: 0, div: 0 }
            if (r.status === 'Concluído') acc[op].done++
            if (r.status === 'Com Divergência') acc[op].div++
            return acc
          }, {}),
        ).map(([k, v]) => [k, String(v.done), String(v.div)]),
        data: d.seps || [],
      },
      avg_time: {
        title: 'Tempo Médio por Operação',
        headers: ['Operação', 'Quantidade'],
        rows: Object.entries(
          (d.movs || []).reduce((acc: Record<string, number>, r: any) => {
            const t = r.type || r.movement_type || '—'
            acc[t] = (acc[t] || 0) + 1
            return acc
          }, {}),
        ).map(([k, v]) => [k, String(v)]),
        data: d.movs || [],
      },
      movements_by_product: {
        title: 'Movimentações por Produto',
        headers: ['Produto', 'Quantidade'],
        rows: Object.entries(
          (d.movs || []).reduce((acc: Record<string, number>, r: any) => {
            const p = r.product_name || r.produto_nome || '—'
            acc[p] = (acc[p] || 0) + 1
            return acc
          }, {}),
        ).map(([k, v]) => [k, String(v)]),
        data: d.movs || [],
      },
      movements_by_lot: {
        title: 'Movimentações por Lote',
        headers: ['Lote', 'Quantidade'],
        rows: Object.entries(
          (d.movs || []).reduce((acc: Record<string, number>, r: any) => {
            const l = r.lot || r.lote || '—'
            acc[l] = (acc[l] || 0) + 1
            return acc
          }, {}),
        ).map(([k, v]) => [k, String(v)]),
        data: d.movs || [],
      },
      movements_by_location: {
        title: 'Movimentações por Localização',
        headers: ['Localização', 'Quantidade'],
        rows: Object.entries(
          (d.movs || []).reduce((acc: Record<string, number>, r: any) => {
            const l = r.location || r.localizacao || '—'
            acc[l] = (acc[l] || 0) + 1
            return acc
          }, {}),
        ).map(([k, v]) => [k, String(v)]),
        data: d.movs || [],
      },
      pallet_history: {
        title: 'Histórico de Pallets',
        headers: ['ID', 'Criado'],
        rows: [],
        data: [],
      },
    }
    return map[reportType] || { headers: [], rows: [], title: '', data: [] }
  }, [reportType, allData])

  const userName = (user?.name as string) || 'Usuário'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Relatórios WMS</h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            disabled={!report.rows.length}
            onClick={() => printWmsReport(report.title, report.headers, report.rows, userName)}
            className="border-[#005B2E] text-[#005B2E]"
          >
            <Printer className="w-4 h-4 mr-2" /> PDF
          </Button>
          <Button
            variant="outline"
            disabled={!report.rows.length}
            onClick={() => exportWmsXls(report.title, report.headers, report.rows, userName)}
            className="border-[#005B2E] text-[#005B2E]"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
          </Button>
          <Button
            variant="outline"
            disabled={!report.rows.length}
            onClick={() => exportWmsCsv(report.title, report.headers, report.rows, userName)}
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
      {dataError ? (
        <Card className="border-2 border-dashed border-red-300">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-lg font-bold text-red-700">Erro ao carregar dados.</p>
          </CardContent>
        </Card>
      ) : loading ? (
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
