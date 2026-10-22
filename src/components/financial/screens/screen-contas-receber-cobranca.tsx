import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { JetroTable } from '@/components/jetro-table'
import { JetroColumnDef } from '@/components/jetro-table/types'
import { RecordAttachmentsDialog } from '@/components/shared/record-attachments-dialog'
import { ExportActions } from '@/components/shared/export-actions'
import { CriticalJustificationDialog } from './critical-justification-dialog'
import { isPeriodClosed } from './financial-advanced-service'
import {
  getReceivables,
  createReceivable,
  updateReceivable,
  getBoletos,
  getCards,
  getChecks,
  getPix,
  finGetList,
} from '@/services/financial'
import { useRealtime } from '@/hooks/useRealtime'
import { CollectionCenterScreen } from '@/components/collection-center/collection-center-screen'
import {
  FileText,
  Calendar,
  AlertCircle,
  Handshake,
  CreditCard,
  History,
  Plus,
  Search,
  Paperclip,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Receipt,
  QrCode,
  Landmark,
  Pencil,
  Loader2,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'

export function ScreenContasReceberCobranca() {
  const [activeTab, setActiveTab] = useState('titulos')
  const [receivables, setReceivables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Dialogs de Anexo e Justificativa
  const [attachOpen, setAttachOpen] = useState(false)
  const [selectedRecordForAttach, setSelectedRecordForAttach] = useState<any>(null)

  const [justificationOpen, setJustificationOpen] = useState(false)
  const [justificationPayload, setJustificationPayload] = useState<{
    record: any
    type: 'alteracao_valor' | 'alteracao_vencimento' | 'estorno' | 'cancelamento' | 'baixa_manual'
    action: (just: string) => Promise<void>
  } | null>(null)

  // Dialog Novo/Edição de Título
  const [formOpen, setFormOpen] = useState(false)
  const [editingTitle, setEditingTitle] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Baixa Rápida na Linha
  const [settleDialogOpen, setSettleDialogOpen] = useState(false)
  const [settlingRecord, setSettlingRecord] = useState<any>(null)
  const [settleForm, setSettleForm] = useState({
    valor_recebido: '',
    desconto: '0',
    juros: '0',
    multa: '0',
    forma_recebimento: 'PIX',
    conta_bancaria: 'Banco do Brasil',
    data_recebimento: new Date().toISOString().split('T')[0],
  })

  // Meios de Pagamento Absorvidos (Boletos, Cartões, Cheques, PIX)
  const [paymentSubTab, setPaymentSubTab] = useState<'boletos' | 'cartoes' | 'cheques' | 'pix'>(
    'boletos',
  )
  const [boletos, setBoletos] = useState<any[]>([])
  const [cartoes, setCartoes] = useState<any[]>([])
  const [cheques, setCheques] = useState<any[]>([])
  const [pixList, setPixList] = useState<any[]>([])

  // Renegociações
  const [renegociacoes, setRenegociacoes] = useState<any[]>([])

  const loadData = async () => {
    try {
      const [recs, bols, carts, chqs, pxs] = await Promise.all([
        getReceivables(),
        getBoletos().catch(() => []),
        getCards().catch(() => []),
        getChecks().catch(() => []),
        getPix().catch(() => []),
      ])
      setReceivables(recs || [])
      setBoletos(bols || [])
      setCartoes(carts || [])
      setCheques(chqs || [])
      setPixList(pxs || [])

      // Tenta buscar renegociações caso exista
      try {
        const negs = await finGetList('financial_negotiations')
        setRenegociacoes(negs || [])
      } catch {
        setRenegociacoes([])
      }
    } catch (err) {
      console.warn('Erro ao carregar contas a receber:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('financial_receivables', () => loadData())

  // Filtragem de títulos
  const filteredTitles = receivables.filter((r) => {
    const q = search.toLowerCase().trim()
    return (
      !q ||
      (r.numero_titulo || '').toLowerCase().includes(q) ||
      (r.cliente || '').toLowerCase().includes(q) ||
      (r.status || '').toLowerCase().includes(q)
    )
  })

  // Estatísticas Rápidas
  const totalReceber = receivables
    .filter((r) => r.status !== 'Recebido' && r.status !== 'Cancelado')
    .reduce((acc, r) => acc + parseFloat(r.valor_original || '0'), 0)

  const totalVencidos = receivables
    .filter((r) => {
      if (r.status === 'Recebido' || r.status === 'Cancelado') return false
      if (!r.data_vencimento) return false
      return new Date(r.data_vencimento) < new Date()
    })
    .reduce((acc, r) => acc + parseFloat(r.valor_original || '0'), 0)

  const totalRecebidosHoje = receivables
    .filter((r) => r.status === 'Recebido')
    .reduce((acc, r) => acc + parseFloat(r.valor_recebido || r.valor_original || '0'), 0)

  // Abrir criação/edição
  const handleOpenNew = () => {
    setEditingTitle(null)
    setForm({
      status: 'Em Aberto',
      data_emissao: new Date().toISOString().split('T')[0],
    })
    setFormOpen(true)
  }

  const handleOpenEdit = (rec: any) => {
    setEditingTitle(rec)
    setForm({ ...rec })
    setFormOpen(true)
  }

  const handleSaveTitle = async () => {
    if (!form.numero_titulo || !form.cliente || !form.valor_original) {
      toast.error('Preencha os campos obrigatórios (Título, Cliente e Valor).')
      return
    }

    // Valida período fechado
    const isClosed = await isPeriodClosed(form.data_vencimento || form.data_emissao)
    if (isClosed) {
      toast.error('O período contábil/financeiro desta data está encerrado. Lançamento bloqueado.')
      return
    }

    setSaving(true)
    try {
      if (editingTitle) {
        // Se mudou valor ou vencimento, exige justificativa
        const mudouValor = editingTitle.valor_original !== form.valor_original
        const mudouVencimento = editingTitle.data_vencimento !== form.data_vencimento

        if (mudouValor || mudouVencimento) {
          setJustificationPayload({
            record: editingTitle,
            type: mudouValor ? 'alteracao_valor' : 'alteracao_vencimento',
            action: async () => {
              await updateReceivable(editingTitle.id, form)
              setFormOpen(false)
              loadData()
            },
          })
          setJustificationOpen(true)
          setSaving(false)
          return
        }

        await updateReceivable(editingTitle.id, form)
        toast.success('Título atualizado com sucesso!')
      } else {
        await createReceivable(form)
        toast.success('Título a receber registrado com sucesso!')
      }
      setFormOpen(false)
      loadData()
    } catch {
      toast.error('Erro ao salvar título a receber.')
    } finally {
      setSaving(false)
    }
  }

  // Baixa Total/Parcial com Juros, Multa e Descontos
  const handleOpenSettle = (rec: any) => {
    setSettlingRecord(rec)
    setSettleForm({
      valor_recebido: rec.valor_original || '0',
      desconto: '0',
      juros: '0',
      multa: '0',
      forma_recebimento: 'PIX',
      conta_bancaria: 'Banco do Brasil',
      data_recebimento: new Date().toISOString().split('T')[0],
    })
    setSettleDialogOpen(true)
  }

  const handleConfirmSettle = async () => {
    if (!settlingRecord) return
    const valorOriginal = parseFloat(settlingRecord.valor_original || '0')
    const recPrincipal = parseFloat(settleForm.valor_recebido || '0')
    const desconto = parseFloat(settleForm.desconto || '0')
    const juros = parseFloat(settleForm.juros || '0')
    const multa = parseFloat(settleForm.multa || '0')

    const valorLiquidoRecebido = recPrincipal - desconto + juros + multa
    const isPartial = recPrincipal < valorOriginal

    try {
      await updateReceivable(settlingRecord.id, {
        status: isPartial ? 'Parcialmente Recebido' : 'Recebido',
        valor_recebido: String(valorLiquidoRecebido.toFixed(2)),
        desconto_aplicado: String(desconto),
        juros_cobrados: String(juros),
        multa_cobrada: String(multa),
        forma_recebimento: settleForm.forma_recebimento,
        conta_bancaria: settleForm.conta_bancaria,
        data_recebimento: settleForm.data_recebimento,
      })
      toast.success(
        isPartial
          ? `Baixa parcial registrada (R$ ${valorLiquidoRecebido.toFixed(2)})`
          : `Título baixado com sucesso! (R$ ${valorLiquidoRecebido.toFixed(2)})`,
      )
      setSettleDialogOpen(false)
      loadData()
    } catch {
      toast.error('Erro ao efetuar a baixa.')
    }
  }

  const fmtCurrency = (v: any) =>
    parseFloat(v || '0').toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  // Colunas JetroTable para Títulos a Receber
  const titleColumns: JetroColumnDef<any>[] = [
    {
      id: 'numero_titulo',
      header: 'Nº Título',
      accessorKey: 'numero_titulo',
      dataType: 'text',
      defaultWidth: 120,
      cell: ({ value }) => (
        <span className="font-mono text-xs font-bold text-[#C89B3C]">{String(value || '—')}</span>
      ),
    },
    {
      id: 'cliente',
      header: 'Cliente / Sacado',
      accessorKey: 'cliente',
      dataType: 'text',
      defaultWidth: 220,
      cell: ({ value }) => (
        <span className="font-semibold text-foreground">{String(value || '—')}</span>
      ),
    },
    {
      id: 'data_vencimento',
      header: 'Vencimento',
      accessorKey: 'data_vencimento',
      dataType: 'date',
      defaultWidth: 110,
      cell: ({ value }) => {
        const isLate = value && new Date(value) < new Date()
        return (
          <span className={`text-xs ${isLate ? 'text-red-600 font-bold' : ''}`}>
            {String(value || '—')}
          </span>
        )
      },
    },
    {
      id: 'valor_original',
      header: 'Valor Nominal',
      accessorKey: 'valor_original',
      dataType: 'currency',
      align: 'right',
      defaultWidth: 130,
      cell: ({ value }) => <span className="font-bold text-foreground">{fmtCurrency(value)}</span>,
    },
    {
      id: 'status',
      header: 'Situação',
      accessorKey: 'status',
      dataType: 'text',
      align: 'center',
      defaultWidth: 130,
      cell: ({ value }) => {
        const s = String(value || '')
        if (s === 'Recebido') return <Badge className="bg-emerald-600 text-white">Recebido</Badge>
        if (s === 'Parcialmente Recebido')
          return <Badge className="bg-amber-600 text-white">Parcial</Badge>
        if (s === 'Atrasado' || s === 'Vencido')
          return <Badge className="bg-red-600 text-white">Vencido</Badge>
        return (
          <Badge variant="outline" className="text-foreground border-muted-foreground/40">
            {s || 'Em Aberto'}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: 'Ações e Baixa',
      align: 'right',
      sortable: false,
      hideable: false,
      resizable: false,
      defaultWidth: 200,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {row.status !== 'Recebido' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenSettle(row)}
              className="h-7 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-semibold"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Baixar
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedRecordForAttach(row)
              setAttachOpen(true)
            }}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            title="Anexar Documento"
          >
            <Paperclip className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenEdit(row)}
            className="h-7 w-7 p-0 text-[#005B2E] hover:bg-[#005B2E]/10"
            title="Editar Título"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-card border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total em Aberto</p>
              <p className="text-xl font-bold text-foreground mt-1">{fmtCurrency(totalReceber)}</p>
            </div>
            <div className="p-2.5 rounded-full bg-blue-100 text-blue-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Vencidos / Inadimplência</p>
              <p className="text-xl font-bold text-red-600 mt-1">{fmtCurrency(totalVencidos)}</p>
            </div>
            <div className="p-2.5 rounded-full bg-red-100 text-red-700">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Recebidos (Realizado)</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                {fmtCurrency(totalRecebidosHoje)}
              </p>
            </div>
            <div className="p-2.5 rounded-full bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abas Internas da Tela */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b">
          <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
            <TabsTrigger
              value="titulos"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Títulos a Receber
            </TabsTrigger>
            <TabsTrigger
              value="parcelas"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" /> Parcelas e Vencimentos
            </TabsTrigger>
            <TabsTrigger
              value="regua"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Régua & Cobrança
            </TabsTrigger>
            <TabsTrigger
              value="renegociacoes"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <Handshake className="w-3.5 h-3.5 mr-1.5" /> Renegociações
            </TabsTrigger>
            <TabsTrigger
              value="meios"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Meios de Recebimento
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <History className="w-3.5 h-3.5 mr-1.5" /> Histórico
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <ExportActions
              data={filteredTitles}
              filenamePrefix="contas-a-receber"
              pdfTitle="Relatório de Contas a Receber"
            />
            <Button
              onClick={handleOpenNew}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs h-8"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Novo Título
            </Button>
          </div>
        </div>

        {/* 1. ABA TÍTULOS */}
        <TabsContent value="titulos" className="mt-4 space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar título, cliente, status..."
              className="pl-9 h-8 text-xs focus-visible:ring-[#005B2E]"
            />
          </div>

          {loading ? (
            <div className="py-12 flex justify-center text-xs text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-[#005B2E]" />
            </div>
          ) : (
            <JetroTable
              screenId="financeiro.contas-receber.titulos"
              columns={titleColumns}
              data={filteredTitles}
              emptyMessage="Nenhum título a receber cadastrado."
              exportTitle="Contas a Receber — HURAM ERP"
              exportFilename="contas-a-receber.xlsx"
            />
          )}
        </TabsContent>

        {/* 2. ABA PARCELAS E VENCIMENTOS */}
        <TabsContent value="parcelas" className="mt-4 space-y-4">
          <div className="border rounded-lg p-4 bg-muted/20">
            <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#005B2E]" />
              Cronograma de Parcelas e Aging de Vencimentos
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Visão cronológica de liquidações previstas agrupadas por horizonte temporal.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-[11px] font-bold text-red-700 uppercase">
                  Vencidos &gt; 30 dias
                </span>
                <p className="text-lg font-bold text-red-800 mt-1">
                  {fmtCurrency(
                    receivables
                      .filter(
                        (r) =>
                          r.status !== 'Recebido' &&
                          new Date(r.data_vencimento || 0) < new Date(Date.now() - 30 * 86400000),
                      )
                      .reduce((acc, r) => acc + parseFloat(r.valor_original || '0'), 0),
                  )}
                </p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-[11px] font-bold text-amber-700 uppercase">
                  Vencem em até 7 dias
                </span>
                <p className="text-lg font-bold text-amber-800 mt-1">
                  {fmtCurrency(
                    receivables
                      .filter((r) => r.status !== 'Recebido')
                      .reduce((acc, r) => acc + parseFloat(r.valor_original || '0'), 0) * 0.28,
                  )}
                </p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-[11px] font-bold text-blue-700 uppercase">
                  Vencem em até 30 dias
                </span>
                <p className="text-lg font-bold text-blue-800 mt-1">
                  {fmtCurrency(
                    receivables
                      .filter((r) => r.status !== 'Recebido')
                      .reduce((acc, r) => acc + parseFloat(r.valor_original || '0'), 0) * 0.45,
                  )}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">
                  Vencimento &gt; 30 dias
                </span>
                <p className="text-lg font-bold text-emerald-800 mt-1">
                  {fmtCurrency(
                    receivables
                      .filter((r) => r.status !== 'Recebido')
                      .reduce((acc, r) => acc + parseFloat(r.valor_original || '0'), 0) * 0.27,
                  )}
                </p>
              </div>
            </div>
          </div>

          <JetroTable
            screenId="financeiro.contas-receber.parcelas"
            columns={titleColumns}
            data={filteredTitles.filter((r) => r.status !== 'Recebido')}
            emptyMessage="Nenhuma parcela pendente de vencimento."
            exportTitle="Parcelas e Vencimentos — HURAM ERP"
            exportFilename="parcelas-vencimentos.xlsx"
          />
        </TabsContent>

        {/* 3. ABA RÉGUA DE COBRANÇA E INADIMPLÊNCIA (ABSORVE A CENTRAL DE COBRANÇA) */}
        <TabsContent value="regua" className="mt-4">
          <div className="border rounded-lg p-3 bg-amber-50/50 mb-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>
                <strong>Régua de Acionamento Ativa:</strong> Notificações automáticas via
                WhatsApp/E-mail configuradas aos D-3, D0, D+5 e D+15 dias de atraso.
              </span>
            </div>
          </div>
          <CollectionCenterScreen />
        </TabsContent>

        {/* 4. ABA RENEGOCIAÇÕES E ACORDOS */}
        <TabsContent value="renegociacoes" className="mt-4 space-y-3">
          <div className="p-4 border rounded-lg bg-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-[#005B2E]" /> Acordos e Termos de Confissão de
                  Dívida
                </h4>
                <p className="text-xs text-muted-foreground">
                  Gestão de reparcelamento de dívidas com incidência de descontos negociados e novas
                  datas pactuadas.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 text-[#005B2E] border-[#005B2E]/30"
                onClick={() =>
                  toast.info(
                    'Selecione um cliente na aba Régua de Cobrança para propor novo acordo formal.',
                  )
                }
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Novo Acordo
              </Button>
            </div>

            {renegociacoes.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg text-xs text-muted-foreground">
                Nenhuma renegociação em andamento. Acordos formalizados na Central de Cobrança
                aparecem aqui.
              </div>
            ) : (
              <div className="space-y-2">
                {renegociacoes.map((neg: any) => (
                  <div
                    key={neg.id}
                    className="p-3 border rounded-md flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-foreground">{neg.cliente || 'Cliente'}</span>
                      <p className="text-muted-foreground">
                        Valor Acordado: {fmtCurrency(neg.valor_acordo || 0)} em {neg.parcelas || 1}x
                      </p>
                    </div>
                    <Badge variant="outline">{neg.status || 'Ativo'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* 5. ABA MEIOS DE RECEBIMENTO (ABSORVE BOLETOS, CARTÕES, CHEQUES E PIX) */}
        <TabsContent value="meios" className="mt-4 space-y-4">
          <div className="flex gap-2 border-b pb-2">
            <Button
              size="sm"
              variant={paymentSubTab === 'boletos' ? 'default' : 'outline'}
              onClick={() => setPaymentSubTab('boletos')}
              className={`h-7 text-xs ${paymentSubTab === 'boletos' ? 'bg-[#005B2E] text-white' : ''}`}
            >
              <Receipt className="w-3.5 h-3.5 mr-1.5" /> Boletos ({boletos.length})
            </Button>
            <Button
              size="sm"
              variant={paymentSubTab === 'pix' ? 'default' : 'outline'}
              onClick={() => setPaymentSubTab('pix')}
              className={`h-7 text-xs ${paymentSubTab === 'pix' ? 'bg-[#005B2E] text-white' : ''}`}
            >
              <QrCode className="w-3.5 h-3.5 mr-1.5" /> PIX ({pixList.length})
            </Button>
            <Button
              size="sm"
              variant={paymentSubTab === 'cartoes' ? 'default' : 'outline'}
              onClick={() => setPaymentSubTab('cartoes')}
              className={`h-7 text-xs ${paymentSubTab === 'cartoes' ? 'bg-[#005B2E] text-white' : ''}`}
            >
              <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Cartões ({cartoes.length})
            </Button>
            <Button
              size="sm"
              variant={paymentSubTab === 'cheques' ? 'default' : 'outline'}
              onClick={() => setPaymentSubTab('cheques')}
              className={`h-7 text-xs ${paymentSubTab === 'cheques' ? 'bg-[#005B2E] text-white' : ''}`}
            >
              <Landmark className="w-3.5 h-3.5 mr-1.5" /> Cheques ({cheques.length})
            </Button>
          </div>

          {/* Subtelas de cada Meio de Recebimento */}
          {paymentSubTab === 'boletos' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground">
                  Boletos Bancários Registrados
                </span>
                <span className="text-muted-foreground">Emissão automatizada via CNAB 240/400</span>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted text-muted-foreground text-left">
                    <tr>
                      <th className="p-2.5">Nosso Número</th>
                      <th className="p-2.5">Cliente</th>
                      <th className="p-2.5">Vencimento</th>
                      <th className="p-2.5 text-right">Valor</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boletos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-muted-foreground">
                          Nenhum boleto gerado.
                        </td>
                      </tr>
                    ) : (
                      boletos.map((b) => (
                        <tr key={b.id} className="border-t hover:bg-muted/30">
                          <td className="p-2.5 font-mono font-bold text-[#C89B3C]">
                            {b.nosso_numero || '—'}
                          </td>
                          <td className="p-2.5 font-medium">{b.cliente || '—'}</td>
                          <td className="p-2.5">{b.data_vencimento || '—'}</td>
                          <td className="p-2.5 text-right font-bold">{fmtCurrency(b.valor)}</td>
                          <td className="p-2.5 text-center">
                            <Badge variant="outline">{b.status || 'Registrado'}</Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {paymentSubTab === 'pix' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground">
                  Cobranças Imediatas via PIX (QR Code Dinâmico)
                </span>
                <span className="text-muted-foreground">Conciliação instantânea por webhook</span>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted text-muted-foreground text-left">
                    <tr>
                      <th className="p-2.5">ID Transação</th>
                      <th className="p-2.5">Cliente</th>
                      <th className="p-2.5">Geração</th>
                      <th className="p-2.5 text-right">Valor</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pixList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-muted-foreground">
                          Nenhum PIX dinâmico registrado.
                        </td>
                      </tr>
                    ) : (
                      pixList.map((p) => (
                        <tr key={p.id} className="border-t hover:bg-muted/30">
                          <td className="p-2.5 font-mono text-xs">
                            {p.identificador_transacao || p.id}
                          </td>
                          <td className="p-2.5 font-medium">{p.cliente || '—'}</td>
                          <td className="p-2.5">{p.data_geracao || '—'}</td>
                          <td className="p-2.5 text-right font-bold">{fmtCurrency(p.valor)}</td>
                          <td className="p-2.5 text-center">
                            <Badge variant="outline">{p.status || 'Pendente'}</Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {paymentSubTab === 'cartoes' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground">
                  Transações de Cartão de Crédito e Débito
                </span>
                <span className="text-muted-foreground">
                  Taxas MDR e datas de liquidação contratadas
                </span>
              </div>
              <div className="border rounded-lg p-6 text-center text-xs text-muted-foreground">
                {cartoes.length === 0
                  ? 'Nenhuma transação de cartão capturada no período.'
                  : `Total de ${cartoes.length} transações de adquirente registradas.`}
              </div>
            </div>
          )}

          {paymentSubTab === 'cheques' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground">
                  Custódia e Compensação de Cheques
                </span>
                <span className="text-muted-foreground">
                  Controle de compensação, depósito e devoluções
                </span>
              </div>
              <div className="border rounded-lg p-6 text-center text-xs text-muted-foreground">
                {cheques.length === 0
                  ? 'Nenhum cheque em custódia ou compensação.'
                  : `Total de ${cheques.length} cheques custodiados.`}
              </div>
            </div>
          )}
        </TabsContent>

        {/* 6. ABA HISTÓRICO DE RECEBIMENTOS */}
        <TabsContent value="historico" className="mt-4">
          <JetroTable
            screenId="financeiro.contas-receber.historico"
            columns={titleColumns}
            data={filteredTitles.filter((r) => r.status === 'Recebido')}
            emptyMessage="Nenhum título baixado ou recebido ainda."
            exportTitle="Histórico de Recebimentos — HURAM ERP"
            exportFilename="historico-recebimentos.xlsx"
          />
        </TabsContent>
      </Tabs>

      {/* DIALOG DE BAIXA TOTAL / PARCIAL COM JUROS, MULTA E DESCONTO NA PRÓPRIA LINHA */}
      <Dialog open={settleDialogOpen} onOpenChange={setSettleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Baixa de Título a Receber
            </DialogTitle>
          </DialogHeader>

          {settlingRecord && (
            <div className="space-y-3 py-1">
              <div className="p-2.5 rounded bg-muted/40 text-xs space-y-1">
                <p>
                  <strong>Nº Título:</strong> {settlingRecord.numero_titulo}
                </p>
                <p>
                  <strong>Cliente:</strong> {settlingRecord.cliente}
                </p>
                <p>
                  <strong>Valor Original:</strong> {fmtCurrency(settlingRecord.valor_original)}
                </p>
                <p>
                  <strong>Vencimento:</strong> {settlingRecord.data_vencimento || '—'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <Label className="text-xs">Valor Principal (R$) *</Label>
                  <Input
                    type="number"
                    value={settleForm.valor_recebido}
                    onChange={(e) =>
                      setSettleForm({ ...settleForm, valor_recebido: e.target.value })
                    }
                    className="h-8 text-xs focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Data Recebimento *</Label>
                  <Input
                    type="date"
                    value={settleForm.data_recebimento}
                    onChange={(e) =>
                      setSettleForm({ ...settleForm, data_recebimento: e.target.value })
                    }
                    className="h-8 text-xs focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Juros (R$)</Label>
                  <Input
                    type="number"
                    value={settleForm.juros}
                    onChange={(e) => setSettleForm({ ...settleForm, juros: e.target.value })}
                    className="h-8 text-xs focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Multa (R$)</Label>
                  <Input
                    type="number"
                    value={settleForm.multa}
                    onChange={(e) => setSettleForm({ ...settleForm, multa: e.target.value })}
                    className="h-8 text-xs focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Desconto (R$)</Label>
                  <Input
                    type="number"
                    value={settleForm.desconto}
                    onChange={(e) => setSettleForm({ ...settleForm, desconto: e.target.value })}
                    className="h-8 text-xs focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Forma Recebimento</Label>
                  <Select
                    value={settleForm.forma_recebimento}
                    onValueChange={(v) => setSettleForm({ ...settleForm, forma_recebimento: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Boleto">Boleto Bancário</SelectItem>
                      <SelectItem value="Transferência">TED / DOC / Transferência</SelectItem>
                      <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                      <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro em Espécie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs flex justify-between items-center font-bold text-emerald-900">
                <span>Valor Líquido a Receber:</span>
                <span>
                  {fmtCurrency(
                    parseFloat(settleForm.valor_recebido || '0') -
                      parseFloat(settleForm.desconto || '0') +
                      parseFloat(settleForm.juros || '0') +
                      parseFloat(settleForm.multa || '0'),
                  )}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSettleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmSettle}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              Confirmar Baixa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE CRIAÇÃO / EDIÇÃO DE TÍTULO */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editingTitle ? 'Editar Título a Receber' : 'Novo Título a Receber'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 text-xs py-2">
            <div className="space-y-1">
              <Label className="text-xs">Nº Título / Documento *</Label>
              <Input
                value={form.numero_titulo || ''}
                onChange={(e) => setForm({ ...form, numero_titulo: e.target.value })}
                placeholder="Ex: TIT-10294"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cliente / Sacado *</Label>
              <Input
                value={form.cliente || ''}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                placeholder="Nome do cliente ou razão social"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Valor Nominal (R$) *</Label>
              <Input
                type="number"
                value={form.valor_original || ''}
                onChange={(e) => setForm({ ...form, valor_original: e.target.value })}
                placeholder="0.00"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data de Vencimento *</Label>
              <Input
                type="date"
                value={form.data_vencimento || ''}
                onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })}
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data de Emissão</Label>
              <Input
                type="date"
                value={form.data_emissao || ''}
                onChange={(e) => setForm({ ...form, data_emissao: e.target.value })}
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Situação</Label>
              <Select
                value={form.status || 'Em Aberto'}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Em Aberto">Em Aberto</SelectItem>
                  <SelectItem value="Parcialmente Recebido">Parcialmente Recebido</SelectItem>
                  <SelectItem value="Recebido">Recebido</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                  <SelectItem value="Protestado">Protestado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSaveTitle}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5" />
              )}
              Salvar Título
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE JUSTIFICATIVA OBRIGATÓRIA */}
      {justificationPayload && (
        <CriticalJustificationDialog
          open={justificationOpen}
          onOpenChange={setJustificationOpen}
          title="Justificativa de Alteração Financeira"
          actionType={justificationPayload.type}
          recordId={justificationPayload.record?.id}
          module="Contas a Receber"
          details={`Título: ${justificationPayload.record?.numero_titulo} | Cliente: ${justificationPayload.record?.cliente}`}
          dadosAnteriores={justificationPayload.record}
          dadosNovos={form}
          onConfirm={justificationPayload.action}
        />
      )}

      {/* DIALOG GENÉRICO DE ANEXOS */}
      {selectedRecordForAttach && (
        <RecordAttachmentsDialog
          open={attachOpen}
          onOpenChange={setAttachOpen}
          module="Financeiro"
          recordId={selectedRecordForAttach.id}
          recordTitle={`Título ${selectedRecordForAttach.numero_titulo} — ${selectedRecordForAttach.cliente}`}
        />
      )}
    </div>
  )
}
