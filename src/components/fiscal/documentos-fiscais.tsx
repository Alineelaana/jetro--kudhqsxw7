import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getNfseRecords, getCteRecords, getMdfeRecords, getCorrections } from '@/services/fiscal'
import { getNfeRecords, getNfceRecords } from '@/services/sales'
import { getPurchaseInvoices } from '@/services/purchasing'
import { STATUS_COLORS } from '@/lib/fiscal-types'
import { useRealtime } from '@/hooks/use-realtime'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import { Loader2, Search, FileText, Download, Eye, Mail } from 'lucide-react'
import { toast } from 'sonner'

export function DocumentosFiscais() {
  const [allDocs, setAllDocs] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const load = async () => {
    try {
      const [nfse, cte, mdfe, corr, nfe, nfce, purInv] = await Promise.all([
        getNfseRecords().catch(() => []),
        getCteRecords().catch(() => []),
        getMdfeRecords().catch(() => []),
        getCorrections().catch(() => []),
        getNfeRecords().catch(() => []),
        getNfceRecords().catch(() => []),
        getPurchaseInvoices().catch(() => []),
      ])
      const tag = (arr: unknown[], t: string) =>
        arr.map((r) => ({ ...(r as Record<string, unknown>), _tipo: t }))
      setAllDocs([
        ...tag(nfe, 'NF-e'),
        ...tag(nfse, 'NFS-e'),
        ...tag(nfce, 'NFC-e'),
        ...tag(cte, 'CT-e'),
        ...tag(mdfe, 'MDF-e'),
        ...tag(purInv, 'Entrada'),
        ...tag(corr, 'CC-e'),
      ])
    } catch {
      setAllDocs([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('nfe_records', () => load())
  useRealtime('nfse_records', () => load())

  const filtered = useMemo(() => {
    return allDocs.filter((r) => {
      if (typeFilter !== 'all' && r._tipo !== typeFilter) return false
      if (!search) return true
      const num = (r.nfe_number ||
        r.nfse_number ||
        r.nfce_number ||
        r.cte_number ||
        r.mdfe_number ||
        r.invoice_number ||
        r.nota_numero ||
        '') as string
      const name = (r.client_name ||
        r.tomador ||
        r.consumer_name ||
        r.emitente ||
        r.supplier_name ||
        r.nota_cliente ||
        '') as string
      return num.includes(search) || name.toLowerCase().includes(search.toLowerCase())
    })
  }, [allDocs, search, typeFilter])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Documentos Fiscais</h3>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar documentos..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 focus-visible:ring-[#005B2E]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="NF-e">NF-e</SelectItem>
              <SelectItem value="NFS-e">NFS-e</SelectItem>
              <SelectItem value="NFC-e">NFC-e</SelectItem>
              <SelectItem value="CT-e">CT-e</SelectItem>
              <SelectItem value="MDF-e">MDF-e</SelectItem>
              <SelectItem value="Entrada">Entrada</SelectItem>
              <SelectItem value="CC-e">Carta Correção</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {allDocs.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum documento encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <JetroTable
          screenId="fiscal.documentos-fiscais"
          columns={[
            {
              id: 'tipo',
              header: 'Tipo',
              dataType: 'text',
              defaultWidth: 90,
              align: 'center',
              getSortValue: (row) => String(row._tipo || ''),
              cell: ({ row }) => (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#005B2E]/10 text-[#005B2E]">
                  {String(row._tipo || '')}
                </span>
              ),
            },
            {
              id: 'numero',
              header: 'Número',
              dataType: 'text',
              defaultWidth: 120,
              getSortValue: (row) =>
                (row.nfe_number ||
                  row.nfse_number ||
                  row.nfce_number ||
                  row.cte_number ||
                  row.mdfe_number ||
                  row.invoice_number ||
                  row.nota_numero ||
                  '') as string,
              cell: ({ row }) => {
                const num = (row.nfe_number ||
                  row.nfse_number ||
                  row.nfce_number ||
                  row.cte_number ||
                  row.mdfe_number ||
                  row.invoice_number ||
                  row.nota_numero ||
                  '—') as string
                return <span className="text-xs font-mono font-bold text-[#C89B3C]">{num}</span>
              },
            },
            {
              id: 'cliente_emitente',
              header: 'Cliente / Emitente',
              dataType: 'text',
              defaultWidth: 220,
              getSortValue: (row) =>
                (row.client_name ||
                  row.tomador ||
                  row.consumer_name ||
                  row.emitente ||
                  row.supplier_name ||
                  row.nota_cliente ||
                  '') as string,
              cell: ({ row }) => {
                const name = (row.client_name ||
                  row.tomador ||
                  row.consumer_name ||
                  row.emitente ||
                  row.supplier_name ||
                  row.nota_cliente ||
                  '—') as string
                return <span className="font-medium">{name}</span>
              },
            },
            {
              id: 'valor',
              header: 'Valor',
              dataType: 'currency',
              align: 'right',
              defaultWidth: 130,
              getSortValue: (row) => {
                const raw = (row.total_value || row.valor || row.valor_prestacao || '0') as string
                return (
                  parseFloat(
                    String(raw)
                      .replace(/[^\d.,]/g, '')
                      .replace(',', '.'),
                  ) || 0
                )
              },
              cell: ({ row }) => {
                const val = (row.total_value ||
                  row.valor ||
                  row.valor_prestacao ||
                  '0,00') as string
                return <span className="font-bold">R$ {val}</span>
              },
            },
            {
              id: 'status',
              header: 'Status',
              dataType: 'text',
              align: 'center',
              defaultWidth: 120,
              getSortValue: (row) => (row.status as string) || '',
              cell: ({ row }) => (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[row.status as string] || 'bg-gray-100 text-gray-600'}`}
                >
                  {(row.status as string) || '—'}
                </span>
              ),
            },
            {
              id: 'data',
              header: 'Data',
              dataType: 'date',
              defaultWidth: 110,
              getSortValue: (row) => (row.created as string) || '',
              cell: ({ row }) => (
                <span className="text-xs">
                  {row.created ? new Date(row.created as string).toLocaleDateString('pt-BR') : '—'}
                </span>
              ),
            },
            {
              id: 'acoes',
              header: 'Ações',
              align: 'center',
              sortable: false,
              hideable: false,
              resizable: false,
              draggable: false,
              defaultWidth: 120,
              cell: () => (
                <div className="flex items-center justify-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 h-7 w-7 p-0"
                    title="Visualizar"
                    onClick={() => toast.info('Visualizando documento')}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[#005B2E] h-7 w-7 p-0"
                    title="Baixar XML"
                    onClick={() => toast.info('Download XML')}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-amber-600 h-7 w-7 p-0"
                    title="Enviar e-mail"
                    onClick={() => toast.info('Enviando por e-mail')}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={filtered}
          rowKey={(r) => (r.id as string) || String(Math.random())}
          emptyMessage="Nenhum documento corresponde aos filtros selecionados."
          exportTitle="Documentos Fiscais — Jetro ERP"
          exportFilename="documentos-fiscais-jetro.xlsx"
        />
      )}
    </div>
  )
}
