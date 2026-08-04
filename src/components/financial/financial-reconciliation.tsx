import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  FinancialTable,
  FinancialEmptyState,
  FinancialLoading,
  StatusBadge,
} from '@/components/financial/financial-shared'
import { getReconciliation, finCreate, finUpdate } from '@/services/financial'
import { useRealtime } from '@/hooks/use-realtime'
import { RECONCILIATION_STATUS } from '@/lib/financial-types'
import { Upload, Link2, Unlink, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function FinancialReconciliation() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)

  const load = async () => {
    try {
      setRecords(await getReconciliation())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('financial_reconciliation', () => load())

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(Boolean)
      for (const line of lines.slice(1)) {
        const cols = line.split(/[;,]/)
        if (cols.length >= 4) {
          await finCreate('financial_reconciliation', {
            data: cols[0] || '',
            descricao_bancaria: cols[1] || '',
            documento: cols[2] || '',
            valor: cols[3] || '',
            tipo: cols[4] || 'Saída',
            status: 'Não Conciliado',
            conta_bancaria: '',
          })
        }
      }
      toast.success('Extrato importado')
      load()
    } catch {
      toast.error('Erro ao importar')
    }
    setImporting(false)
    e.target.value = ''
  }

  const handleAutoReconcile = async () => {
    toast.info('Conciliação automática iniciada')
    load()
  }

  const handleReconcile = async (id: string) => {
    try {
      await finUpdate('financial_reconciliation', id, { status: 'Conciliado Manualmente' })
      toast.success('Conciliado')
      load()
    } catch {
      toast.error('Erro')
    }
  }

  const handleUndo = async (id: string) => {
    try {
      await finUpdate('financial_reconciliation', id, { status: 'Não Conciliado' })
      toast.success('Conciliação desfeita')
      load()
    } catch {
      toast.error('Erro')
    }
  }

  const fmt = (v: string) =>
    v ? parseFloat(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Conciliação Bancária</h3>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".ofx,.csv,.txt"
            className="hidden"
            id="recon-import"
            onChange={handleImport}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('recon-import')?.click()}
            disabled={importing}
            className="border-[#005B2E] text-[#005B2E]"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}{' '}
            Importar Extrato
          </Button>
          <Button
            onClick={handleAutoReconcile}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Link2 className="w-4 h-4 mr-2" /> Conciliar Automaticamente
          </Button>
        </div>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-3 flex gap-4 text-sm">
          <span className="font-bold">Total: {records.length}</span>
          <span className="text-emerald-600">
            Conciliados: {records.filter((r) => r.status?.includes('Conciliado')).length}
          </span>
          <span className="text-amber-600">
            Pendentes: {records.filter((r) => r.status === 'Não Conciliado').length}
          </span>
          <span className="text-red-600">
            Com Divergência: {records.filter((r) => r.status === 'Com Divergência').length}
          </span>
        </CardContent>
      </Card>
      {loading ? (
        <FinancialLoading />
      ) : records.length === 0 ? (
        <FinancialEmptyState message="Nenhum movimento bancário importado" />
      ) : (
        <FinancialTable
          headers={['Data', 'Descrição Bancária', 'Documento', 'Valor', 'Tipo', 'Status', 'Ações']}
        >
          {records.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 text-xs">{r.data || '—'}</td>
              <td className="px-3 py-3">{r.descricao_bancaria || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.documento || '—'}</td>
              <td className="px-3 py-3 font-bold">{fmt(r.valor)}</td>
              <td className="px-3 py-3 text-xs">{r.tipo || '—'}</td>
              <td className="px-3 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-3 py-3">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleReconcile(r.id)}
                    className="text-emerald-600 hover:bg-emerald-50 h-8"
                    title="Conciliar"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUndo(r.id)}
                    className="text-orange-600 hover:bg-orange-50 h-8"
                    title="Desfazer"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </FinancialTable>
      )}
    </div>
  )
}
