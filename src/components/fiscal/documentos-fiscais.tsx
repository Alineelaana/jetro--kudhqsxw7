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
import {
  Loader2,
  Search,
  FileText,
  Download,
  Eye,
  Mail,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface FocusTransmitResult {
  success: boolean
  message?: string
  error?: string
  registro?: {
    status?: string
    status_raw?: string
    codigo_status?: string
    motivo?: string
    protocolo?: string
    data_hora?: string
    url_pdf?: string
  }
}

export function DocumentosFiscais() {
  const [allDocs, setAllDocs] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [transmittingChave, setTransmittingChave] = useState<string | null>(null)
  const [consultingChave, setConsultingChave] = useState<string | null>(null)
  const [detailDoc, setDetailDoc] = useState<Record<string, unknown> | null>(null)

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
  useRealtime('nfe_records', () => {
    void load()
  })
  useRealtime('fiscal_document_artifacts', () => {
    void load()
  })
  useRealtime('nfse_records', () => {
    void load()
  })

  // Transmissão via Focus NFe
  const handleTransmitir = async (row: Record<string, unknown>) => {
    const chave = (row.chave_acesso || row.chave || '') as string
    const docId = (row.id || '') as string
    const num = (row.nfe_number || row.numero || '—') as string

    if (!chave && !docId) {
      toast.error('NF-e sem chave de acesso identificada para transmissão.')
      return
    }

    const toastId = toast.loading(`Transmitindo NF-e ${num} ao Focus NFe...`)
    setTransmittingChave(chave || docId)

    try {
      const res = await pb.send<FocusTransmitResult>(
        '/backend/v1/huram/fiscal/focus-nfe/transmit',
        {
          method: 'POST',
          body: {
            chave_acesso: chave,
            nfe_id: docId,
            empresa_id: row.empresa_id,
          },
        },
      )

      if (res?.success) {
        const reg = res.registro
        const status = reg?.status
        if (status === 'autorizado') {
          toast.success(
            `NF-e ${num} AUTORIZADA pela SEFAZ! Protocolo: ${reg?.protocolo || 'gravado'}`,
            { id: toastId, duration: 6000 },
          )
        } else if (status === 'rejeitado' || status === 'denegado') {
          toast.error(
            `NF-e ${num} REJEITADA pela SEFAZ [${reg?.codigo_status || 'erro'}]: ${reg?.motivo || 'Verifique os dados cadastrais'}`,
            { id: toastId, duration: 8000 },
          )
        } else {
          toast.info(
            res.message || `NF-e ${num} enviada ao Focus NFe. Em processamento na SEFAZ.`,
            { id: toastId, duration: 5000 },
          )
        }
        await load()
      } else {
        toast.error(res?.error || `Falha ao transmitir NF-e ${num}.`, {
          id: toastId,
          duration: 7000,
        })
      }
    } catch (err: unknown) {
      const errObj = err as {
        response?: Record<string, unknown>
        data?: Record<string, unknown>
        message?: string
      }
      const rawData =
        (errObj?.response?.data as Record<string, unknown> | undefined) ||
        (errObj?.response as Record<string, unknown> | undefined) ||
        (errObj?.data as Record<string, unknown> | undefined)

      const serverError =
        (typeof rawData?.error === 'string' && rawData.error) ||
        (typeof rawData?.message === 'string' && rawData.message) ||
        (typeof errObj?.response?.message === 'string' && errObj.response.message) ||
        (typeof errObj?.message === 'string' &&
          errObj.message !== 'Something went wrong.' &&
          errObj.message) ||
        ''

      const msg = serverError || 'Erro inesperado na transmissão'
      toast.error(`Falha ao transmitir NF-e ${num}: ${msg}`, { id: toastId, duration: 8000 })
    } finally {
      setTransmittingChave(null)
    }
  }

  // Consulta do recibo da NF-e no Focus NFe
  const handleConsultarRecibo = async (row: Record<string, unknown>) => {
    const chave = (row.chave_acesso || row.chave || '') as string
    const docId = (row.id || '') as string
    const num = (row.nfe_number || row.numero || '—') as string

    if (!chave && !docId) {
      toast.error('NF-e sem chave de acesso para consulta.')
      return
    }

    const toastId = toast.loading(`Consultando recibo da NF-e ${num}...`)
    setConsultingChave(chave || docId)

    try {
      const res = await pb.send<FocusTransmitResult>('/backend/v1/huram/fiscal/focus-nfe/consult', {
        method: 'POST',
        body: {
          chave_acesso: chave,
          nfe_id: docId,
        },
      })

      if (res?.success) {
        const reg = res.registro
        const status = reg?.status
        if (status === 'autorizado') {
          toast.success(`NF-e ${num} AUTORIZADA! Protocolo: ${reg?.protocolo || '—'}`, {
            id: toastId,
            duration: 6000,
          })
        } else if (status === 'rejeitado' || status === 'denegado') {
          toast.error(
            `NF-e ${num} ${status.toUpperCase()} [${reg?.codigo_status || ''}]: ${reg?.motivo || 'Sem motivo detalhado'}`,
            { id: toastId, duration: 7000 },
          )
        } else {
          toast.info(
            reg?.motivo || 'NF-e ainda em processamento na SEFAZ. Aguarde alguns instantes.',
            { id: toastId, duration: 5000 },
          )
        }
        await load()
      } else {
        toast.error(res?.error || 'Não foi possível consultar o recibo.', { id: toastId })
      }
    } catch (err: unknown) {
      const errObj = err as {
        response?: Record<string, unknown>
        data?: Record<string, unknown>
        message?: string
      }
      const rawData =
        (errObj?.response?.data as Record<string, unknown> | undefined) ||
        (errObj?.response as Record<string, unknown> | undefined) ||
        (errObj?.data as Record<string, unknown> | undefined)

      const serverError =
        (typeof rawData?.error === 'string' && rawData.error) ||
        (typeof rawData?.message === 'string' && rawData.message) ||
        (typeof errObj?.response?.message === 'string' && errObj.response.message) ||
        (typeof errObj?.message === 'string' &&
          errObj.message !== 'Something went wrong.' &&
          errObj.message) ||
        ''

      const msg = serverError || 'Falha ao consultar'
      toast.error(`Erro na consulta: ${msg}`, { id: toastId })
    } finally {
      setConsultingChave(null)
    }
  }

  // Baixar XML
  const handleDownloadXml = (row: Record<string, unknown>) => {
    const xml = (row.xml_conteudo || row.xml || '') as string
    const num = (row.nfe_number || row.numero || row.document_number || 'documento') as string
    if (!xml) {
      toast.info('XML não disponível para este documento.')
      return
    }
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `NFe-${num}.xml`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Download do XML da NF-e ${num} iniciado.`)
  }

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
              cell: ({ row }) => {
                const isNfe = row._tipo === 'NF-e'
                const statusStr = String(row.status || '').toLowerCase()
                const isGerada =
                  statusStr.includes('gerada') ||
                  statusStr.includes('pronta') ||
                  statusStr === 'pendente' ||
                  statusStr === 'emitida' ||
                  !row.authorization_protocol
                const isAutorizada =
                  statusStr === 'autorizada' ||
                  Boolean(row.authorization_protocol) ||
                  row.focus_nfe_status_sefaz === 'autorizado'
                const isProcessando =
                  statusStr.includes('processando') || row.focus_nfe_status_sefaz === 'processando'
                const chaveOuId = (row.chave_acesso || row.id || '') as string
                const isTransmitting = transmittingChave === chaveOuId
                const isConsulting = consultingChave === chaveOuId

                return (
                  <div className="flex items-center justify-center gap-1">
                    {/* Botão Transmitir NF-e ao Focus NFe */}
                    {isNfe && !isAutorizada && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs font-bold bg-[#005B2E] hover:bg-[#004B24] text-white border-0 gap-1 shadow-sm"
                        title="Transmitir NF-e à SEFAZ via Focus NFe"
                        disabled={isTransmitting}
                        onClick={() => void handleTransmitir(row)}
                      >
                        {isTransmitting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        <span>{isTransmitting ? 'Transmitindo…' : 'Transmitir'}</span>
                      </Button>
                    )}

                    {/* Botão Consultar Recibo quando em processamento ou com ref existente */}
                    {isNfe && (isProcessando || Boolean(row.focus_nfe_ref)) && !isAutorizada && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs font-medium border-[#005B2E]/40 text-[#005B2E] hover:bg-[#005B2E]/10 gap-1"
                        title="Consultar recibo no Focus NFe / SEFAZ"
                        disabled={isConsulting}
                        onClick={() => void handleConsultarRecibo(row)}
                      >
                        {isConsulting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        <span>Consultar</span>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-600 h-7 w-7 p-0"
                      title="Visualizar detalhes"
                      onClick={() => setDetailDoc(row)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[#005B2E] h-7 w-7 p-0"
                      title="Baixar XML"
                      onClick={() => handleDownloadXml(row)}
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
                )
              },
            },
          ]}
          data={filtered}
          rowKey={(r) => (r.id as string) || String(Math.random())}
          emptyMessage="Nenhum documento corresponde aos filtros selecionados."
          exportTitle="Documentos Fiscais — Jetro ERP"
          exportFilename="documentos-fiscais-jetro.xlsx"
        />
      )}

      {/* Modal de Detalhes da Nota Fiscal e Status SEFAZ */}
      <Dialog open={Boolean(detailDoc)} onOpenChange={(open) => !open && setDetailDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2 text-base font-bold text-[#005B2E]">
              <span>
                Detalhes do Documento Fiscal — {detailDoc?._tipo as string}{' '}
                {(detailDoc?.nfe_number as string) || (detailDoc?.numero as string) || ''}
              </span>
              <Badge variant="outline" className="text-xs">
                {String(detailDoc?.status || '—')}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Informações fiscais, dados de autorização SEFAZ e integração Focus NFe.
            </DialogDescription>
          </DialogHeader>

          {detailDoc && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg">
                <div>
                  <span className="text-muted-foreground block">Cliente / Tomador:</span>
                  <span className="font-semibold text-sm">
                    {String(
                      detailDoc.client_name ||
                        detailDoc.tomador ||
                        detailDoc.consumer_name ||
                        detailDoc.emitente ||
                        detailDoc.supplier_name ||
                        '—',
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Valor Total:</span>
                  <span className="font-bold text-sm text-[#005B2E]">
                    R$ {String(detailDoc.total_value || detailDoc.valor || '0,00')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Série / Ambiente:</span>
                  <span className="font-mono font-medium">
                    Série {String(detailDoc.serie || '1')} ·{' '}
                    {String(detailDoc.ambiente || 'produção')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Data de Emissão:</span>
                  <span>
                    {detailDoc.created
                      ? new Date(String(detailDoc.created)).toLocaleString('pt-BR')
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Chave de Acesso */}
              {Boolean(detailDoc.chave_acesso) && (
                <div className="p-3 border rounded-lg bg-slate-50 space-y-1">
                  <span className="text-muted-foreground font-bold block">
                    Chave de Acesso (44 dígitos):
                  </span>
                  <div className="font-mono text-xs break-all bg-white p-2 border rounded select-all font-semibold text-slate-800">
                    {String(detailDoc.chave_acesso)}
                  </div>
                </div>
              )}

              {/* Integração SEFAZ / Focus NFe */}
              <div className="p-3 border rounded-lg space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#005B2E] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#005B2E]" />
                  Status da Integração Focus NFe / SEFAZ
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Status SEFAZ:</span>
                    <span className="font-bold">
                      {String(
                        detailDoc.focus_nfe_status_sefaz || detailDoc.status || 'Não transmitida',
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Protocolo de Autorização:</span>
                    <span className="font-mono font-bold text-[#005B2E]">
                      {String(
                        detailDoc.authorization_protocol ||
                          detailDoc.protocolo ||
                          detailDoc.focus_nfe_protocolo ||
                          'Pendente',
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Código Status SEFAZ:</span>
                    <span className="font-mono">
                      {String(detailDoc.focus_nfe_codigo_status || '—')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Referência Focus:</span>
                    <span className="font-mono text-[11px] truncate block">
                      {String(detailDoc.focus_nfe_ref || '—')}
                    </span>
                  </div>
                </div>

                {/* Motivo / Rejeição se houver */}
                {(Boolean(detailDoc.motivo) ||
                  Boolean(detailDoc.focus_nfe_motivo) ||
                  Boolean(detailDoc.rejection_reason)) && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Mensagem da SEFAZ:</span>
                      <span>
                        {String(
                          detailDoc.focus_nfe_motivo ||
                            detailDoc.motivo ||
                            detailDoc.rejection_reason,
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Ações dentro do modal */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                {detailDoc._tipo === 'NF-e' && detailDoc.status !== 'Autorizada' && (
                  <Button
                    size="sm"
                    className="bg-[#005B2E] hover:bg-[#004B24] text-white text-xs font-bold gap-1"
                    disabled={transmittingChave === (detailDoc.chave_acesso || detailDoc.id)}
                    onClick={() => {
                      void handleTransmitir(detailDoc)
                      setDetailDoc(null)
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Transmitir Agora
                  </Button>
                )}
                {detailDoc._tipo === 'NF-e' && detailDoc.status !== 'Autorizada' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[#005B2E] border-[#005B2E]/40 text-xs font-semibold gap-1"
                    disabled={consultingChave === (detailDoc.chave_acesso || detailDoc.id)}
                    onClick={() => {
                      void handleConsultarRecibo(detailDoc)
                      setDetailDoc(null)
                    }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Consultar Recibo
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => handleDownloadXml(detailDoc)}
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Baixar XML
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => setDetailDoc(null)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
