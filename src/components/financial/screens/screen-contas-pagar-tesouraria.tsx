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
import { isPeriodClosed, detectDuplicatePayables } from './financial-advanced-service'
import {
  getPayables,
  createPayable,
  updatePayable,
  getCashRegisters,
  getMovements,
  getTransfers,
  finGetList,
} from '@/services/financial'
import { FinancialApprovalsEvolved } from '@/components/financial/financial-approvals-evolved'
import { FinancialCashRegister } from '@/components/financial/financial-cash-register'
import { FinancialTreasury } from '@/components/financial/financial-treasury'
import { useRealtime } from '@/hooks/useRealtime'
import {
  FileText,
  CalendarDays,
  ShieldCheck,
  Wallet,
  Paperclip,
  Building2,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  Layers,
  ArrowRightLeft,
  Pencil,
  Loader2,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'

export function ScreenContasPagarTesouraria() {
  const [activeTab, setActiveTab] = useState('titulos')
  const [payables, setPayables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Anexos e Auditoria
  const [attachOpen, setAttachOpen] = useState(false)
  const [selectedRecordForAttach, setSelectedRecordForAttach] = useState<any>(null)

  const [justificationOpen, setJustificationOpen] = useState(false)
  const [justificationPayload, setJustificationPayload] = useState<{
    record: any
    type: 'alteracao_valor' | 'alteracao_vencimento' | 'estorno' | 'cancelamento' | 'baixa_manual'
    action: (just: string) => Promise<void>
  } | null>(null)

  // Dialog Título a Pagar
  const [formOpen, setFormOpen] = useState(false)
  const [editingTitle, setEditingTitle] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Baixa / Pagamento
  const [settleDialogOpen, setSettleDialogOpen] = useState(false)
  const [settlingRecord, setSettlingRecord] = useState<any>(null)
  const [settleForm, setSettleForm] = useState({
    valor_pago: '',
    desconto: '0',
    juros: '0',
    multa: '0',
    forma_pagamento: 'PIX',
    conta_origem: 'Banco do Brasil - CC',
    data_pagamento: new Date().toISOString().split('T')[0],
  })

  // Sub-abas Caixa & Contas
  const [caixaSubTab, setCaixaSubTab] = useState<
    'movimentacoes' | 'caixa_diario' | 'transferencias'
  >('movimentacoes')
  const [movements, setMovements] = useState<any[]>([])
  const [transfers, setTransfers] = useState<any[]>([])

  // Fornecedores (consulta)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [searchSupplier, setSearchSupplier] = useState('')

  const loadData = async () => {
    try {
      const [pays, movs, trans] = await Promise.all([
        getPayables(),
        getMovements().catch(() => []),
        getTransfers().catch(() => []),
      ])
      setPayables(pays || [])
      setMovements(movs || [])
      setTransfers(trans || [])

      try {
        const sups = await finGetList('fornecedores')
        setSuppliers(sups || [])
      } catch {
        setSuppliers([])
      }
    } catch (err) {
      console.warn('Erro ao carregar contas a pagar:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('financial_payables', () => loadData())

  // Detecção de Duplicidade
  const duplicateAlerts = detectDuplicatePayables(payables)

  // Filtros
  const filteredTitles = payables.filter((p) => {
    const q = search.toLowerCase().trim()
    return (
      !q ||
      (p.numero_titulo || '').toLowerCase().includes(q) ||
      (p.fornecedor || '').toLowerCase().includes(q) ||
      (p.status || '').toLowerCase().includes(q)
    )
  })

  // Indicadores
  const totalPagar = payables
    .filter((p) => p.status !== 'Pago' && p.status !== 'Cancelado')
    .reduce((acc, p) => acc + parseFloat(p.valor_original || '0'), 0)

  const totalVencidos = payables
    .filter((p) => {
      if (p.status === 'Pago' || p.status === 'Cancelado') return false
      if (!p.data_vencimento) return false
      return new Date(p.data_vencimento) < new Date()
    })
    .reduce((acc, p) => acc + parseFloat(p.valor_original || '0'), 0)

  const totalAguardandoAprovacao = payables
    .filter((p) => p.status === 'Aguardando Aprovação' || p.status === 'Pendente')
    .reduce((acc, p) => acc + parseFloat(p.valor_original || '0'), 0)

  const fmtCurrency = (v: any) =>
    parseFloat(v || '0').toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  // Salvar Título a Pagar com verificação de período fechado e auditoria
  const handleSaveTitle = async () => {
    if (!form.numero_titulo || !form.fornecedor || !form.valor_original) {
      toast.error('Preencha os campos obrigatórios (Título, Fornecedor e Valor).')
      return
    }

    const isClosed = await isPeriodClosed(form.data_vencimento || form.data_emissao)
    if (isClosed) {
      toast.error('O período contábil/financeiro desta data está encerrado. Lançamento bloqueado.')
      return
    }

    setSaving(true)
    try {
      if (editingTitle) {
        const mudouValor = editingTitle.valor_original !== form.valor_original
        const mudouVencimento = editingTitle.data_vencimento !== form.data_vencimento

        if (mudouValor || mudouVencimento) {
          setJustificationPayload({
            record: editingTitle,
            type: mudouValor ? 'alteracao_valor' : 'alteracao_vencimento',
            action: async () => {
              await updatePayable(editingTitle.id, form)
              setFormOpen(false)
              loadData()
            },
          })
          setJustificationOpen(true)
          setSaving(false)
          return
        }

        await updatePayable(editingTitle.id, form)
        toast.success('Título atualizado com sucesso!')
      } else {
        await createPayable(form)
        toast.success('Título a pagar cadastrado!')
      }
      setFormOpen(false)
      loadData()
    } catch {
      toast.error('Erro ao salvar título a pagar.')
    } finally {
      setSaving(false)
    }
  }

  // Baixa / Pagamento
  const handleOpenSettle = (rec: any) => {
    setSettlingRecord(rec)
    setSettleForm({
      valor_pago: rec.valor_original || '0',
      desconto: '0',
      juros: '0',
      multa: '0',
      forma_pagamento: 'PIX',
      conta_origem: 'Banco do Brasil - CC',
      data_pagamento: new Date().toISOString().split('T')[0],
    })
    setSettleDialogOpen(true)
  }

  const handleConfirmSettle = async () => {
    if (!settlingRecord) return
    const valorOriginal = parseFloat(settlingRecord.valor_original || '0')
    const principal = parseFloat(settleForm.valor_pago || '0')
    const desconto = parseFloat(settleForm.desconto || '0')
    const juros = parseFloat(settleForm.juros || '0')
    const multa = parseFloat(settleForm.multa || '0')

    const valorLiquido = principal - desconto + juros + multa
    const isPartial = principal < valorOriginal

    try {
      await updatePayable(settlingRecord.id, {
        status: isPartial ? 'Parcialmente Pago' : 'Pago',
        valor_pago: String(valorLiquido.toFixed(2)),
        desconto_obtido: String(desconto),
        juros_pagos: String(juros),
        multa_paga: String(multa),
        forma_pagamento: settleForm.forma_pagamento,
        conta_pagamento: settleForm.conta_origem,
        data_pagamento: settleForm.data_pagamento,
      })
      toast.success(
        isPartial
          ? `Pagamento parcial efetuado (R$ ${valorLiquido.toFixed(2)})`
          : `Título quitado com sucesso! (R$ ${valorLiquido.toFixed(2)})`,
      )
      setSettleDialogOpen(false)
      loadData()
    } catch {
      toast.error('Erro ao efetuar o pagamento.')
    }
  }

  // Colunas JetroTable
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
      id: 'fornecedor',
      header: 'Fornecedor / Favorecido',
      accessorKey: 'fornecedor',
      dataType: 'text',
      defaultWidth: 230,
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
      defaultWidth: 140,
      cell: ({ value }) => {
        const s = String(value || '')
        if (s === 'Pago') return <Badge className="bg-emerald-600 text-white">Pago</Badge>
        if (s === 'Aguardando Aprovação')
          return <Badge className="bg-amber-600 text-white">Aprovação</Badge>
        if (s === 'Aprovado') return <Badge className="bg-blue-600 text-white">Aprovado</Badge>
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
      header: 'Ações e Pagamento',
      align: 'right',
      sortable: false,
      hideable: false,
      resizable: false,
      defaultWidth: 200,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {row.status !== 'Pago' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenSettle(row)}
              className="h-7 text-xs text-blue-700 border-blue-300 hover:bg-blue-50 font-semibold"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Pagar
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
            title="Anexar Comprovante / NF"
          >
            <Paperclip className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingTitle(row)
              setForm({ ...row })
              setFormOpen(true)
            }}
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
      {/* Alerta de Possíveis Pagamentos Duplicados */}
      {duplicateAlerts.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Aviso de Proteção Antiduplicidade:</span> Foram detectados{' '}
            <strong>{duplicateAlerts.length}</strong> potenciais lançamentos duplicados para o mesmo
            fornecedor e valor. Verifique antes de autorizar o borderô.
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              {duplicateAlerts.slice(0, 3).map((a, idx) => (
                <li key={idx}>
                  <strong>{a.fornecedor}</strong>: {a.motivo}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-card border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total a Pagar em Aberto</p>
              <p className="text-xl font-bold text-foreground mt-1">{fmtCurrency(totalPagar)}</p>
            </div>
            <div className="p-2.5 rounded-full bg-blue-100 text-blue-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Contas Vencidas</p>
              <p className="text-xl font-bold text-red-600 mt-1">{fmtCurrency(totalVencidos)}</p>
            </div>
            <div className="p-2.5 rounded-full bg-red-100 text-red-700">
              <TrendingDown className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Aguardando Aprovação de Alçada
              </p>
              <p className="text-xl font-bold text-amber-600 mt-1">
                {fmtCurrency(totalAguardandoAprovacao)}
              </p>
            </div>
            <div className="p-2.5 rounded-full bg-amber-100 text-amber-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abas Principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b">
          <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
            <TabsTrigger
              value="titulos"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Títulos a Pagar
            </TabsTrigger>
            <TabsTrigger
              value="programacao"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Programação & Lotes
            </TabsTrigger>
            <TabsTrigger
              value="aprovacoes"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Aprovações & Alçadas
            </TabsTrigger>
            <TabsTrigger
              value="caixa_contas"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <Wallet className="w-3.5 h-3.5 mr-1.5" /> Caixa & Contas
            </TabsTrigger>
            <TabsTrigger
              value="comprovantes"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <Paperclip className="w-3.5 h-3.5 mr-1.5" /> Comprovantes & Anexos
            </TabsTrigger>
            <TabsTrigger
              value="fornecedores"
              className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
            >
              <Building2 className="w-3.5 h-3.5 mr-1.5" /> Fornecedores
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <ExportActions
              data={filteredTitles}
              filenamePrefix="contas-a-pagar"
              pdfTitle="Relatório de Contas a Pagar"
            />
            <Button
              onClick={() => {
                setEditingTitle(null)
                setForm({
                  status: 'Em Aberto',
                  data_emissao: new Date().toISOString().split('T')[0],
                })
                setFormOpen(true)
              }}
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
              placeholder="Buscar título, fornecedor, status..."
              className="pl-9 h-8 text-xs focus-visible:ring-[#005B2E]"
            />
          </div>

          {loading ? (
            <div className="py-12 flex justify-center text-xs text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-[#005B2E]" />
            </div>
          ) : (
            <JetroTable
              screenId="financeiro.contas-pagar.titulos"
              columns={titleColumns}
              data={filteredTitles}
              emptyMessage="Nenhum título a pagar cadastrado."
              exportTitle="Contas a Pagar — HURAM ERP"
              exportFilename="contas-a-pagar.xlsx"
            />
          )}
        </TabsContent>

        {/* 2. ABA PROGRAMAÇÃO E LOTES DE PAGAMENTO */}
        <TabsContent value="programacao" className="mt-4 space-y-4">
          <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#005B2E]" /> Borderô e Lotes de Pagamento
                </h4>
                <p className="text-xs text-muted-foreground">
                  Grupamento de títulos aprovados para remessa bancária (CNAB Pagamento / PIX em
                  lote).
                </p>
              </div>
              <Button
                size="sm"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white text-xs h-8"
                onClick={() => toast.success('Novo Lote/Borderô de pagamento aberto.')}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Criar Lote de Pagamento
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white border rounded-md">
                <span className="font-bold text-foreground">Programação de Hoje</span>
                <p className="text-muted-foreground mt-1">2 títulos agendados</p>
                <p className="text-sm font-bold text-emerald-700 mt-2">R$ 14.500,00</p>
              </div>
              <div className="p-3 bg-white border rounded-md">
                <span className="font-bold text-foreground">Esta Semana</span>
                <p className="text-muted-foreground mt-1">7 títulos liberados</p>
                <p className="text-sm font-bold text-blue-700 mt-2">R$ 48.920,00</p>
              </div>
              <div className="p-3 bg-white border rounded-md">
                <span className="font-bold text-foreground">Retenções Tributárias</span>
                <p className="text-muted-foreground mt-1">DARF / GPS / ISS Retido</p>
                <p className="text-sm font-bold text-amber-700 mt-2">R$ 6.310,00</p>
              </div>
            </div>
          </div>

          <JetroTable
            screenId="financeiro.contas-pagar.programacao"
            columns={titleColumns}
            data={filteredTitles.filter((p) => p.status !== 'Pago')}
            emptyMessage="Nenhum título pendente de programação."
            exportTitle="Programação de Pagamentos — HURAM ERP"
            exportFilename="programacao-pagamentos.xlsx"
          />
        </TabsContent>

        {/* 3. ABA APROVAÇÕES E ALÇADAS (ABSORVE A TELA DE APROVAÇÕES) */}
        <TabsContent value="aprovacoes" className="mt-4">
          <div className="p-3 border rounded-lg bg-blue-50/50 mb-3 text-xs text-blue-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <strong>Segregação de Funções:</strong> O fluxo preserva rigidamente Cadastrar →
              Aprovar → Efetivar Pagamento com alçadas configuradas por valor.
            </span>
          </div>
          <FinancialApprovalsEvolved />
        </TabsContent>

        {/* 4. ABA CAIXA E CONTAS (ABSORVE CAIXA, TESOURARIA, TRANSFERÊNCIAS E MOVIMENTAÇÕES) */}
        <TabsContent value="caixa_contas" className="mt-4 space-y-4">
          <div className="flex gap-2 border-b pb-2">
            <Button
              size="sm"
              variant={caixaSubTab === 'movimentacoes' ? 'default' : 'outline'}
              onClick={() => setCaixaSubTab('movimentacoes')}
              className={`h-7 text-xs ${caixaSubTab === 'movimentacoes' ? 'bg-[#005B2E] text-white' : ''}`}
            >
              <Wallet className="w-3.5 h-3.5 mr-1.5" /> Movimentações Bancárias ({movements.length})
            </Button>
            <Button
              size="sm"
              variant={caixaSubTab === 'caixa_diario' ? 'default' : 'outline'}
              onClick={() => setCaixaSubTab('caixa_diario')}
              className={`h-7 text-xs ${caixaSubTab === 'caixa_diario' ? 'bg-[#005B2E] text-white' : ''}`}
            >
              <DollarSign className="w-3.5 h-3.5 mr-1.5" /> Caixa Físico / Fundo Fixo
            </Button>
            <Button
              size="sm"
              variant={caixaSubTab === 'transferencias' ? 'default' : 'outline'}
              onClick={() => setCaixaSubTab('transferencias')}
              className={`h-7 text-xs ${caixaSubTab === 'transferencias' ? 'bg-[#005B2E] text-white' : ''}`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" /> Transferências entre Contas (
              {transfers.length})
            </Button>
          </div>

          {caixaSubTab === 'movimentacoes' && (
            <div className="space-y-3">
              <FinancialTreasury />
            </div>
          )}

          {caixaSubTab === 'caixa_diario' && (
            <div className="space-y-3">
              <FinancialCashRegister />
            </div>
          )}

          {caixaSubTab === 'transferencias' && (
            <div className="border rounded-lg p-6 text-center text-xs text-muted-foreground space-y-2">
              <ArrowRightLeft className="w-8 h-8 mx-auto text-[#005B2E] opacity-60" />
              <p className="font-semibold text-foreground">Transferências Internas Registradas</p>
              <p>
                Total de {transfers.length} transferências interbancárias e suprimentos efetuados.
              </p>
            </div>
          )}
        </TabsContent>

        {/* 5. ABA COMPROVANTES E ANEXOS */}
        <TabsContent value="comprovantes" className="mt-4 space-y-3">
          <div className="p-4 border rounded-lg bg-card text-xs space-y-2">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-[#005B2E]" /> Repositório Central de Comprovantes
              Fiscais e Bancários
            </h4>
            <p className="text-muted-foreground">
              Acesse qualquer título nas abas acima e utilize o ícone de anexo para vincular notas
              fiscais, DANFEs, recibos e autenticações bancárias.
            </p>
          </div>

          <JetroTable
            screenId="financeiro.contas-pagar.comprovantes"
            columns={titleColumns}
            data={filteredTitles.filter((p) => p.status === 'Pago')}
            emptyMessage="Nenhum comprovante de pagamento registrado ainda."
            exportTitle="Comprovantes de Pagamento — HURAM ERP"
            exportFilename="comprovantes-pagamento.xlsx"
          />
        </TabsContent>

        {/* 6. ABA FORNECEDORES (CONSULTA) */}
        <TabsContent value="fornecedores" className="mt-4 space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchSupplier}
              onChange={(e) => setSearchSupplier(e.target.value)}
              placeholder="Buscar razão social ou CNPJ do fornecedor..."
              className="pl-9 h-8 text-xs focus-visible:ring-[#005B2E]"
            />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground text-left">
                <tr>
                  <th className="p-2.5">Razão Social / Nome</th>
                  <th className="p-2.5">CNPJ / CPF</th>
                  <th className="p-2.5">Cidade / UF</th>
                  <th className="p-2.5">Telefone / Contato</th>
                  <th className="p-2.5 text-right">Títulos em Aberto</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">
                      Nenhum fornecedor cadastrado.
                    </td>
                  </tr>
                ) : (
                  suppliers
                    .filter((s) => {
                      const q = searchSupplier.toLowerCase()
                      return (
                        !q ||
                        (s.razao_social || s.nome || '').toLowerCase().includes(q) ||
                        (s.cnpj || s.cpf || '').includes(q)
                      )
                    })
                    .map((s) => (
                      <tr key={s.id} className="border-t hover:bg-muted/30">
                        <td className="p-2.5 font-bold text-foreground">
                          {s.razao_social || s.nome}
                        </td>
                        <td className="p-2.5 font-mono">{s.cnpj || s.cpf || '—'}</td>
                        <td className="p-2.5">
                          {s.cidade ? `${s.cidade}/${s.estado || ''}` : '—'}
                        </td>
                        <td className="p-2.5">{s.telefone || s.email || '—'}</td>
                        <td className="p-2.5 text-right font-bold text-blue-700">
                          {fmtCurrency(
                            payables
                              .filter(
                                (p) =>
                                  p.status !== 'Pago' &&
                                  (p.fornecedor || '').toLowerCase() ===
                                    (s.razao_social || s.nome || '').toLowerCase(),
                              )
                              .reduce((acc, p) => acc + parseFloat(p.valor_original || '0'), 0),
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* DIALOG DE PAGAMENTO / BAIXA */}
      <Dialog open={settleDialogOpen} onOpenChange={setSettleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Efetivar Pagamento de Título
            </DialogTitle>
          </DialogHeader>

          {settlingRecord && (
            <div className="space-y-3 py-1">
              <div className="p-2.5 rounded bg-muted/40 text-xs space-y-1">
                <p>
                  <strong>Nº Título:</strong> {settlingRecord.numero_titulo}
                </p>
                <p>
                  <strong>Fornecedor:</strong> {settlingRecord.fornecedor}
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
                    value={settleForm.valor_pago}
                    onChange={(e) => setSettleForm({ ...settleForm, valor_pago: e.target.value })}
                    className="h-8 text-xs focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Data Pagamento *</Label>
                  <Input
                    type="date"
                    value={settleForm.data_pagamento}
                    onChange={(e) =>
                      setSettleForm({ ...settleForm, data_pagamento: e.target.value })
                    }
                    className="h-8 text-xs focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Juros Pagos (R$)</Label>
                  <Input
                    type="number"
                    value={settleForm.juros}
                    onChange={(e) => setSettleForm({ ...settleForm, juros: e.target.value })}
                    className="h-8 text-xs focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Multa Paga (R$)</Label>
                  <Input
                    type="number"
                    value={settleForm.multa}
                    onChange={(e) => setSettleForm({ ...settleForm, multa: e.target.value })}
                    className="h-8 text-xs focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Desconto Obtido (R$)</Label>
                  <Input
                    type="number"
                    value={settleForm.desconto}
                    onChange={(e) => setSettleForm({ ...settleForm, desconto: e.target.value })}
                    className="h-8 text-xs focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Forma de Pagamento</Label>
                  <Select
                    value={settleForm.forma_pagamento}
                    onValueChange={(v) => setSettleForm({ ...settleForm, forma_pagamento: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="TED">TED / Transferência</SelectItem>
                      <SelectItem value="Boleto">Boleto Bancário</SelectItem>
                      <SelectItem value="Débito em Conta">Débito Automático</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Dinheiro">Caixa Físico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-xs flex justify-between items-center font-bold text-blue-900">
                <span>Valor Total Efetivado:</span>
                <span>
                  {fmtCurrency(
                    parseFloat(settleForm.valor_pago || '0') -
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
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE CRIAÇÃO / EDIÇÃO DE TÍTULO */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editingTitle ? 'Editar Título a Pagar' : 'Novo Título a Pagar'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 text-xs py-2">
            <div className="space-y-1">
              <Label className="text-xs">Nº Título / NF *</Label>
              <Input
                value={form.numero_titulo || ''}
                onChange={(e) => setForm({ ...form, numero_titulo: e.target.value })}
                placeholder="Ex: NF-5521"
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fornecedor / Favorecido *</Label>
              <Input
                value={form.fornecedor || ''}
                onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
                placeholder="Razão social do fornecedor"
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
              <Label className="text-xs">Situação / Alçada</Label>
              <Select
                value={form.status || 'Em Aberto'}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Em Aberto">Em Aberto</SelectItem>
                  <SelectItem value="Aguardando Aprovação">Aguardando Aprovação</SelectItem>
                  <SelectItem value="Aprovado">Aprovado</SelectItem>
                  <SelectItem value="Parcialmente Pago">Parcialmente Pago</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
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
          module="Contas a Pagar"
          details={`Título: ${justificationPayload.record?.numero_titulo} | Fornecedor: ${justificationPayload.record?.fornecedor}`}
          dadosAnteriores={justificationPayload.record}
          dadosNovos={form}
          onConfirm={justificationPayload.action}
        />
      )}

      {/* ANEXOS */}
      {selectedRecordForAttach && (
        <RecordAttachmentsDialog
          open={attachOpen}
          onOpenChange={setAttachOpen}
          module="Financeiro"
          recordId={selectedRecordForAttach.id}
          recordTitle={`Título ${selectedRecordForAttach.numero_titulo} — ${selectedRecordForAttach.fornecedor}`}
        />
      )}
    </div>
  )
}
