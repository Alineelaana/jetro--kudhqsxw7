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
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum documento encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Tipo</th>
                  <th className="text-left px-3 py-3 font-bold">Número</th>
                  <th className="text-left px-3 py-3 font-bold">Cliente/Emitente</th>
                  <th className="text-left px-3 py-3 font-bold">Valor</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Data</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((r, i) => {
                  const num = (r.nfe_number ||
                    r.nfse_number ||
                    r.nfce_number ||
                    r.cte_number ||
                    r.mdfe_number ||
                    r.invoice_number ||
                    r.nota_numero ||
                    '—') as string
                  const name = (r.client_name ||
                    r.tomador ||
                    r.consumer_name ||
                    r.emitente ||
                    r.supplier_name ||
                    r.nota_cliente ||
                    '—') as string
                  const val = (r.total_value || r.valor || r.valor_prestacao || '0,00') as string
                  return (
                    <tr key={i} className="border-b border-border hover:bg-[#005B2E]/5">
                      <td className="px-3 py-3">
                        <span className="text-xs font-bold px-2 py-1 rounded bg-[#005B2E]/10 text-[#005B2E]">
                          {r._tipo as string}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-mono font-bold text-[#C89B3C]">{num}</span>
                      </td>
                      <td className="px-3 py-3">{name}</td>
                      <td className="px-3 py-3 font-bold">R$ {val}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[r.status as string] || 'bg-gray-100 text-gray-600'}`}
                        >
                          {(r.status as string) || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs hidden sm:table-cell">
                        {r.created
                          ? new Date(r.created as string).toLocaleDateString('pt-BR')
                          : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600"
                            title="Visualizar"
                            onClick={() => toast.info('Visualizando documento')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#005B2E]"
                            title="Baixar XML"
                            onClick={() => toast.info('Download XML')}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-amber-600"
                            title="Enviar e-mail"
                            onClick={() => toast.info('Enviando por e-mail')}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
