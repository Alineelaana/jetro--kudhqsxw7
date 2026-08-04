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
  getReceivables,
  getPayables,
  getMovements,
  getBoletos,
  getPix,
  getChecks,
  getCardTransactions,
  getCashRegisters,
  getReconciliation,
  getCollections,
} from '@/services/financial'
import { useAuth } from '@/hooks/use-auth'
import { exportToCsv } from '@/services/configuracoes'
import { Printer, FileDown, Loader2, FileText } from 'lucide-react'

const REPORT_TYPES = [
  { id: 'receivables', label: 'Contas a Receber' },
  { id: 'payables', label: 'Contas a Pagar' },
  { id: 'overdue', label: 'Títulos Vencidos' },
  { id: 'default_rate', label: 'Inadimplência' },
  { id: 'receipts', label: 'Recebimentos' },
  { id: 'payments', label: 'Pagamentos' },
  { id: 'cash_flow', label: 'Fluxo de Caixa' },
  { id: 'bank_position', label: 'Posição Bancária' },
  { id: 'treasury', label: 'Tesouraria' },
  { id: 'reconciliation', label: 'Conciliação Bancária' },
  { id: 'movements_account', label: 'Movimentações por Conta' },
  { id: 'movements_cost_center', label: 'Movimentações por Centro de Custo' },
  { id: 'boletos', label: 'Boletos' },
  { id: 'pix', label: 'PIX' },
  { id: 'checks', label: 'Cheques' },
  { id: 'cards', label: 'Cartões' },
  { id: 'collections', label: 'Cobranças' },
  { id: 'cash_registers', label: 'Caixas' },
  { id: 'dre', label: 'DRE Gerencial' },
  { id: 'forecast_vs_actual', label: 'Previsto vs Realizado' },
  { id: 'all_movements', label: 'Movimentações Financeiras' },
]

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function FinancialReports() {
  const { user } = useAuth()
  const [reportType, setReportType] = useState('receivables')
  const [loading, setLoading] = useState(false)
  const [allData, setAllData] = useState<Record<string, unknown[]>>({})

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getReceivables().catch(() => []),
      getPayables().catch(() => []),
      getMovements().catch(() => []),
      getBoletos().catch(() => []),
      getPix().catch(() => []),
      getChecks().catch(() => []),
      getCardTransactions().catch(() => []),
      getCashRegisters().catch(() => []),
      getReconciliation().catch(() => []),
      getCollections().catch(() => []),
    ])
      .then(([recv, pay, mov, bol, pix, chk, cardTx, cash, recon, coll]) => {
        setAllData({ recv, pay, mov, bol, pix, chk, cardTx, cash, recon, coll })
      })
      .finally(() => setLoading(false))
  }, [])

  const report = useMemo(() => {
    const d = allData
    const today = new Date().toISOString().split('T')[0]
    const map: Record<string, { headers: string[]; rows: string[][]; title: string }> = {
      receivables: {
        title: 'Contas a Receber',
        headers: ['Nº', 'Cliente', 'Vencimento', 'Valor', 'Status'],
        rows: (d.recv || []).map((r: any) => [
          r.numero_titulo || '—',
          r.cliente || '—',
          r.data_vencimento || '—',
          r.valor_original || '0',
          r.status || '—',
        ]),
      },
      payables: {
        title: 'Contas a Pagar',
        headers: ['Nº', 'Fornecedor', 'Vencimento', 'Valor', 'Status'],
        rows: (d.pay || []).map((r: any) => [
          r.numero_titulo || '—',
          r.fornecedor || '—',
          r.data_vencimento || '—',
          r.valor_original || '0',
          r.status || '—',
        ]),
      },
      overdue: {
        title: 'Títulos Vencidos',
        headers: ['Tipo', 'Nº', 'Cliente/Forn.', 'Vencimento', 'Valor'],
        rows: [
          ...(d.recv || [])
            .filter(
              (r: any) =>
                r.data_vencimento < today &&
                ['Em Aberto', 'Parcialmente Recebido'].includes(r.status),
            )
            .map((r: any) => [
              'Receber',
              r.numero_titulo || '—',
              r.cliente || '—',
              r.data_vencimento || '—',
              r.valor_original || '0',
            ]),
          ...(d.pay || [])
            .filter(
              (r: any) => r.data_vencimento < today && !['Pago', 'Cancelado'].includes(r.status),
            )
            .map((r: any) => [
              'Pagar',
              r.numero_titulo || '—',
              r.fornecedor || '—',
              r.data_vencimento || '—',
              r.valor_original || '0',
            ]),
        ],
      },
      default_rate: {
        title: 'Inadimplência',
        headers: ['Cliente', 'Valor', 'Dias Atraso'],
        rows: (d.recv || [])
          .filter(
            (r: any) =>
              r.data_vencimento < today &&
              ['Em Aberto', 'Parcialmente Recebido'].includes(r.status),
          )
          .map((r: any) => [r.cliente || '—', r.valor_original || '0', '—']),
      },
      receipts: {
        title: 'Recebimentos',
        headers: ['Data', 'Documento', 'Cliente', 'Valor'],
        rows: (d.mov || [])
          .filter((m: any) => m.tipo_movimentacao === 'Recebimento')
          .map((m: any) => [
            m.data_hora || '—',
            m.documento || '—',
            m.cliente_fornecedor || '—',
            m.entrada || '0',
          ]),
      },
      payments: {
        title: 'Pagamentos',
        headers: ['Data', 'Documento', 'Fornecedor', 'Valor'],
        rows: (d.mov || [])
          .filter((m: any) => m.tipo_movimentacao === 'Pagamento')
          .map((m: any) => [
            m.data_hora || '—',
            m.documento || '—',
            m.cliente_fornecedor || '—',
            m.saida || '0',
          ]),
      },
      cash_flow: {
        title: 'Fluxo de Caixa',
        headers: ['Data', 'Entrada', 'Saída', 'Saldo'],
        rows: (d.mov || []).map((m: any) => [
          m.data_hora || '—',
          m.entrada || '0',
          m.saida || '0',
          m.saldo || '0',
        ]),
      },
      bank_position: {
        title: 'Posição Bancária',
        headers: ['Conta', 'Entradas', 'Saídas', 'Saldo'],
        rows: [],
      },
      treasury: { title: 'Tesouraria', headers: ['Descrição', 'Valor'], rows: [] },
      reconciliation: {
        title: 'Conciliação Bancária',
        headers: ['Data', 'Descrição', 'Valor', 'Status'],
        rows: (d.recon || []).map((r: any) => [
          r.data || '—',
          r.descricao_bancaria || '—',
          r.valor || '0',
          r.status || '—',
        ]),
      },
      movements_account: {
        title: 'Movimentações por Conta',
        headers: ['Conta', 'Entrada', 'Saída', 'Saldo'],
        rows: [],
      },
      movements_cost_center: {
        title: 'Movimentações por Centro de Custo',
        headers: ['Centro de Custo', 'Entrada', 'Saída'],
        rows: [],
      },
      boletos: {
        title: 'Boletos',
        headers: ['Cliente', 'Nosso Nº', 'Valor', 'Vencimento', 'Status'],
        rows: (d.bol || []).map((r: any) => [
          r.cliente || '—',
          r.nosso_numero || '—',
          r.valor || '0',
          r.data_vencimento || '—',
          r.status || '—',
        ]),
      },
      pix: {
        title: 'PIX',
        headers: ['Cliente', 'Identificador', 'Valor', 'Status'],
        rows: (d.pix || []).map((r: any) => [
          r.cliente || '—',
          r.identificador_transacao || '—',
          r.valor || '0',
          r.status || '—',
        ]),
      },
      checks: {
        title: 'Cheques',
        headers: ['Nº', 'Emitente', 'Valor', 'Vencimento', 'Status'],
        rows: (d.chk || []).map((r: any) => [
          r.numero_cheque || '—',
          r.emitente || '—',
          r.valor || '0',
          r.data_vencimento || '—',
          r.status || '—',
        ]),
      },
      cards: {
        title: 'Cartões',
        headers: ['Cliente', 'Bandeira', 'Valor Bruto', 'Valor Líquido', 'Status'],
        rows: (d.cardTx || []).map((r: any) => [
          r.cliente || '—',
          r.bandeira || '—',
          r.valor_bruto || '0',
          r.valor_liquido || '0',
          r.status || '—',
        ]),
      },
      collections: {
        title: 'Cobranças',
        headers: ['Cliente', 'Valor Atualizado', 'Dias Atraso', 'Status'],
        rows: (d.coll || []).map((r: any) => [
          r.cliente || '—',
          r.valor_atualizado || '0',
          String(r.dias_atraso || '—'),
          r.status || '—',
        ]),
      },
      cash_registers: {
        title: 'Caixas',
        headers: ['Caixa', 'Operador', 'Saldo Inicial', 'Status'],
        rows: (d.cash || []).map((r: any) => [
          r.nome_caixa || '—',
          r.operador || '—',
          r.saldo_inicial || '0',
          r.status || '—',
        ]),
      },
      dre: { title: 'DRE Gerencial', headers: ['Descrição', 'Valor'], rows: [] },
      forecast_vs_actual: {
        title: 'Previsto vs Realizado',
        headers: ['Descrição', 'Previsto', 'Realizado'],
        rows: [],
      },
      all_movements: {
        title: 'Movimentações Financeiras',
        headers: ['Data', 'Tipo', 'Documento', 'Entrada', 'Saída'],
        rows: (d.mov || []).map((m: any) => [
          m.data_hora || '—',
          m.tipo_movimentacao || '—',
          m.documento || '—',
          m.entrada || '0',
          m.saida || '0',
        ]),
      },
    }
    return map[reportType] || { headers: [], rows: [], title: '' }
  }, [reportType, allData])

  const userName = (user?.name as string) || 'Usuário'

  const handlePdf = () => {
    const headerHtml = report.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')
    const rowsHtml = report.rows
      .map(
        (r, i) =>
          `<tr class="${i % 2 === 0 ? '' : 'alt'}">${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`,
      )
      .join('')
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escapeHtml(report.title)}</title><style>@page{size:A4;margin:0}*{margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif}.stripe{background:linear-gradient(135deg,#005B2E,#01361D);height:8mm}.content{padding:8mm 15mm}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:5mm}.header h1{color:#005B2E;font-size:20px}.header .meta{font-size:10px;color:#666;text-align:right}table{width:100%;border-collapse:collapse;font-size:10px}th{background:#005B2E;color:#fff;padding:6px;text-align:left}td{padding:5px;border-bottom:1px solid #e0e0e0}tr.alt{background:#f7f7f5}</style></head><body><div class="stripe"></div><div class="content"><div class="header"><h1>${escapeHtml(report.title)}</h1><div class="meta">Gerado por: ${escapeHtml(userName)}<br>Registros: ${report.rows.length}</div></div><table><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></div><script>window.onload=function(){setTimeout(function(){window.print()},500)}</script></body></html>`
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
  }

  const handleCsv = () => {
    exportToCsv(
      report.rows as Record<string, unknown>[],
      `${report.title.toLowerCase().replace(/\s+/g, '_')}.csv`,
      { module: `Financeiro > ${report.title}`, format: 'csv', filters: {} },
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Relatórios Financeiros</h3>
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
            <FileDown className="w-4 h-4 mr-2" /> Excel
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
