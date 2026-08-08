import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import {
  canNegotiateExternalQuotation,
  canRecommendExternalQuotation,
  canExportExternalQuotation,
} from '@/lib/mk-external-quotations-permissions'
import {
  EQ_STATUS,
  EQ_STATUS_COLORS,
  EQ_SUPPLIER_STATUS,
  EQ_TIMELINE_STEPS,
} from '@/lib/mk-external-quotations-types'
import {
  getEqOne,
  updateEq,
  addEqSupplier,
  updateEqSupplierStatus,
  addEqProposal,
  addEqNegotiationRound,
  setEqRecommendation,
  getCorporateSuppliers,
} from '@/services/mk-external-quotations'
import { exportComparativePdf, exportComparativeExcel } from '@/lib/mk-external-quotations-export'
import type {
  MkExternalQuotation,
  MkQuotationSupplier,
  MkQuotationProposal,
} from '@/lib/mk-external-quotations-types'
import { MkEqComparative } from '@/components/trade-marketing/mk-eq-comparative'
import { MkEqApprover } from '@/components/trade-marketing/mk-eq-approver'
import {
  ArrowLeft,
  Plus,
  FileDown,
  FileSpreadsheet,
  Send,
  Star,
  Users,
  FileText,
  GitCompare,
  CheckCircle,
  ShoppingCart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface MkEqDetailProps {
  quotation: MkExternalQuotation
  onBack: () => void
}

export function MkEqDetail({ quotation: initialQ, onBack }: MkEqDetailProps) {
  const { userRole, user } = useAuth()
  const [q, setQ] = useState(initialQ)
  const [activeStep, setActiveStep] = useState(0)
  const [suppliers, setSuppliers] = useState<Record<string, unknown>[]>([])
  const [selSupplier, setSelSupplier] = useState('')
  const [negValue, setNegValue] = useState('')
  const [negNotes, setNegNotes] = useState('')
  const [recSupplier, setRecSupplier] = useState('')
  const [recJustification, setRecJustification] = useState('')

  const userName = (user?.name as string) || ''
  const refresh = async () => {
    setQ(await getEqOne(initialQ.id))
  }
  useEffect(() => {
    getCorporateSuppliers()
      .then(setSuppliers)
      .catch(() => {})
  }, [])

  const handleAddSupplier = async () => {
    if (!selSupplier) return
    const s = suppliers.find((sp) => sp.id === selSupplier)
    if (!s) return
    const newSupplier: MkQuotationSupplier = {
      supplier_id: s.id as string,
      supplier_name: (s.full_name as string) || (s.company_name as string) || '',
      trade_name: (s.trade_name as string) || '',
      cnpj_cpf: (s.cnpj as string) || (s.cpf as string) || '',
      contact: '',
      phone: (s.phone as string) || '',
      email: (s.email as string) || '',
      city: (s.address_city as string) || '',
      state: (s.address_state as string) || '',
      category: (s.partner_type as string) || '',
      status: 'solicitado',
      invited_at: new Date().toISOString(),
    }
    await addEqSupplier(q.id, newSupplier)
    setSelSupplier('')
    refresh()
    toast.success('Fornecedor adicionado')
  }

  const handleAddProposal = async () => {
    const proposal: MkQuotationProposal = {
      id: crypto.randomUUID(),
      supplier_id: '',
      supplier_name: '',
      supplier_quotation_number: '',
      proposal_date: new Date().toISOString().split('T')[0],
      validity: '30 dias',
      description: q.description,
      quantity: q.quantity,
      unit_price: '0',
      total_value: '0',
      discount: '0',
      freight: '0',
      taxes: '0',
      other_expenses: '0',
      final_value: '0',
      production_deadline: '',
      delivery_deadline: q.desired_deadline,
      payment_condition: '',
      entry: '0',
      installments: '1',
      warranty: '',
      technical_specifications: '',
      observations: '',
      internal_observations: '',
      attachments: [],
      original_pdf: '',
    }
    await addEqProposal(q.id, proposal)
    refresh()
    toast.success('Proposta adicionada')
  }

  const handleNegotiate = async (supplierId: string, supplierName: string) => {
    if (!negValue) return
    await addEqNegotiationRound(q.id, {
      id: crypto.randomUUID(),
      supplier_id: supplierId,
      supplier_name: supplierName,
      round: (q.negotiation_history || []).filter((n) => n.supplier_id === supplierId).length + 1,
      previous_value: q.proposals?.find((p) => p.supplier_id === supplierId)?.final_value || '0',
      new_value: negValue,
      date: new Date().toISOString().split('T')[0],
      user: userName,
      notes: negNotes,
    })
    setNegValue('')
    setNegNotes('')
    refresh()
    toast.success('Negociação registrada')
  }

  const handleRecommend = async () => {
    if (!recSupplier || !recJustification) {
      toast.error('Selecione o fornecedor e escreva a justificativa')
      return
    }
    const s = (q.suppliers || []).find((s) => s.supplier_id === recSupplier)
    await setEqRecommendation(q.id, recSupplier, s?.supplier_name || '', recJustification)
    refresh()
    toast.success('Recomendação enviada para aprovação')
  }

  const handleSendToSuppliers = async () => {
    await updateEq(q.id, { status: 'aguardando_fornecedores' })
    refresh()
    toast.success('Cotação enviada para fornecedores')
  }

  const stepIcons = [FileText, Users, FileText, GitCompare, Star, CheckCircle, ShoppingCart]
  const canNegotiate = canNegotiateExternalQuotation(userRole)
  const canRecommend = canRecommendExternalQuotation(userRole)
  const canExport = canExportExternalQuotation(userRole)

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} className="text-[#005B2E]">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Badge className={cn('font-bold', EQ_STATUS_COLORS[q.status])}>
            {EQ_STATUS.find((s) => s.value === q.status)?.label || q.status}
          </Badge>
          {canExport && (q.proposals || []).length > 0 && (
            <>
              <Button size="sm" variant="outline" onClick={() => exportComparativePdf(q, userName)}>
                <FileDown className="w-4 h-4 mr-1" /> PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportComparativeExcel(q, userName)}
              >
                <FileSpreadsheet className="w-4 h-4 mr-1" /> Excel
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#005B2E]">{q.title}</h2>
        <p className="text-sm text-muted-foreground">
          {q.quotation_number} — {q.requester} — {q.company} / {q.branch || '—'}
        </p>
      </div>
      <div className="flex flex-wrap gap-1 mb-6">
        {EQ_TIMELINE_STEPS.map((step, idx) => {
          const Icon = stepIcons[idx]
          return (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => setActiveStep(idx)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                  activeStep === idx
                    ? 'bg-[#005B2E] text-white'
                    : 'hover:bg-[#005B2E]/10 text-muted-foreground',
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-semibold">{step.label}</span>
              </button>
              {idx < EQ_TIMELINE_STEPS.length - 1 && <div className="w-4 h-0.5 bg-gray-300" />}
            </div>
          )
        })}
      </div>
      {activeStep === 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4 space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Descrição: </span>
                {q.description}
              </div>
              <div>
                <span className="text-muted-foreground">Especificações: </span>
                {q.specifications}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Qtd: </span>
                {q.quantity} {q.unit}
              </div>
              <div>
                <span className="text-muted-foreground">Prazo: </span>
                {q.desired_deadline}
              </div>
              <div>
                <span className="text-muted-foreground">Entrega: </span>
                {q.delivery_location}
              </div>
              <div>
                <span className="text-muted-foreground">Prazo Propostas: </span>
                {q.proposal_deadline}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Centro de Custo: </span>
                {q.cost_center}
              </div>
              <div>
                <span className="text-muted-foreground">Campanha: </span>
                {q.campaign_name}
              </div>
              <div>
                <span className="text-muted-foreground">Tipo: </span>
                {q.contract_type}
              </div>
            </div>
            {q.observations && (
              <div>
                <span className="text-muted-foreground">Obs: </span>
                {q.observations}
              </div>
            )}
            {q.status === 'em_preparacao' && canNegotiate && (
              <Button
                onClick={handleSendToSuppliers}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white"
              >
                <Send className="w-4 h-4 mr-2" /> Enviar para Fornecedores
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      {activeStep === 1 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4 space-y-3">
            {canNegotiate && q.status !== 'encerrada' && (
              <div className="flex gap-2">
                <Select value={selSupplier} onValueChange={setSelSupplier}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Adicionar fornecedor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers
                      .filter((s) => !(q.suppliers || []).some((qs) => qs.supplier_id === s.id))
                      .map((s) => (
                        <SelectItem key={s.id as string} value={s.id as string}>
                          {(s.full_name as string) || (s.company_name as string) || '—'}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddSupplier}
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white"
                >
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-2">Fornecedor</th>
                    <th className="text-left p-2">CNPJ/CPF</th>
                    <th className="text-left p-2">Cidade/UF</th>
                    <th className="text-left p-2">Status</th>
                    {canNegotiate && <th className="p-2"></th>}
                  </tr>
                </thead>
                <tbody>
                  {(q.suppliers || []).map((s) => (
                    <tr key={s.supplier_id} className="border-b">
                      <td className="p-2 font-medium">
                        {s.supplier_name}
                        <div className="text-[10px] text-muted-foreground">
                          {s.email} | {s.phone}
                        </div>
                      </td>
                      <td className="p-2">{s.cnpj_cpf}</td>
                      <td className="p-2">
                        {s.city}/{s.state}
                      </td>
                      <td className="p-2">
                        {canNegotiate ? (
                          <Select
                            value={s.status}
                            onValueChange={(v) => {
                              updateEqSupplierStatus(q.id, s.supplier_id, v)
                              refresh()
                            }}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {EQ_SUPPLIER_STATUS.map((st) => (
                                <SelectItem key={st.value} value={st.value}>
                                  {st.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline">
                            {EQ_SUPPLIER_STATUS.find((st) => st.value === s.status)?.label ||
                              s.status}
                          </Badge>
                        )}
                      </td>
                      {canNegotiate && (
                        <td className="p-2">
                          {s.status === 'proposta_recebida' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleNegotiate(s.supplier_id, s.supplier_name)}
                              className="text-[#005B2E]"
                            >
                              Negociar
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {canNegotiate && (
              <div className="flex gap-2 items-end">
                <div>
                  <Label className="text-xs">Novo Valor</Label>
                  <Input
                    value={negValue}
                    onChange={(e) => setNegValue(e.target.value)}
                    className="h-8 w-32 text-xs"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Notas</Label>
                  <Input
                    value={negNotes}
                    onChange={(e) => setNegNotes(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {activeStep === 2 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4 space-y-3">
            {canNegotiate && (
              <Button
                onClick={handleAddProposal}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white"
              >
                <Plus className="w-4 h-4 mr-1" /> Adicionar Proposta
              </Button>
            )}
            {(q.proposals || []).map((p) => (
              <Card key={p.id} className="border border-[#005B2E]/10">
                <CardContent className="py-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{p.supplier_name}</span>
                    <span className="font-bold text-[#005B2E]">R$ {p.final_value}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span>Unit: R$ {p.unit_price}</span>
                    <span>Frete: R$ {p.freight}</span>
                    <span>Desc: R$ {p.discount}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span>Entrega: {p.delivery_deadline}</span>
                    <span>Pag: {p.payment_condition}</span>
                    <span>Validade: {p.validity}</span>
                  </div>
                  {p.technical_specifications && (
                    <p className="text-muted-foreground">Spec: {p.technical_specifications}</p>
                  )}
                  {p.internal_observations && (
                    <p className="text-amber-600">Interno: {p.internal_observations}</p>
                  )}
                </CardContent>
              </Card>
            ))}
            {(q.negotiation_history || []).length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold mb-1">Histórico de Negociações</p>
                {(q.negotiation_history || []).map((n) => (
                  <div key={n.id} className="text-xs flex gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      R{n.round}
                    </Badge>
                    <span>
                      {n.supplier_name}: R$ {n.previous_value} → R$ {n.new_value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {activeStep === 3 && <MkEqComparative quotation={q} />}
      {activeStep === 4 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4 space-y-3">
            <div className="flex gap-2">
              <Select value={recSupplier} onValueChange={setRecSupplier}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecionar fornecedor recomendado..." />
                </SelectTrigger>
                <SelectContent>
                  {(q.suppliers || [])
                    .filter(
                      (s) => s.status === 'proposta_recebida' || s.status === 'proposta_revisada',
                    )
                    .map((s) => (
                      <SelectItem key={s.supplier_id} value={s.supplier_id}>
                        {s.supplier_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Justificativa</Label>
              <Textarea
                value={recJustification}
                onChange={(e) => setRecJustification(e.target.value)}
                rows={3}
                placeholder="Ex: Gráfica Alfa recomendada apesar de R$ 600 acima da menor cotação porque entrega seis dias antes..."
              />
            </div>
            {canRecommend && (
              <Button
                onClick={handleRecommend}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white"
              >
                <Star className="w-4 h-4 mr-2" /> Enviar Recomendação
              </Button>
            )}
            {q.recommendation_justification && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
                <p className="font-semibold text-amber-800">
                  Recomendado: {q.recommended_supplier_name}
                </p>
                <p className="text-amber-700 mt-1">{q.recommendation_justification}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {activeStep === 5 && <MkEqApprover quotation={q} onChanged={refresh} />}
      {activeStep === 6 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Status: </span>
                <Badge className={EQ_STATUS_COLORS[q.status]}>
                  {EQ_STATUS.find((s) => s.value === q.status)?.label}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Fornecedor Escolhido: </span>
                {q.recommended_supplier_name || '—'}
              </div>
              <div>
                <span className="text-muted-foreground">Solicitação de Compra: </span>
                {q.purchase_request_number || '—'}
              </div>
            </div>
            {q.purchase_request_number && (
              <p className="text-sm text-emerald-700">
                ✓ Processo encaminhado para o módulo de Compras. O Financeiro receberá as
                informações através do fluxo oficial.
              </p>
            )}
            {!q.purchase_request_id && q.status === 'aprovada' && (
              <p className="text-sm text-amber-600">
                Aguardando geração da solicitação de compra na aba Aprovação.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
