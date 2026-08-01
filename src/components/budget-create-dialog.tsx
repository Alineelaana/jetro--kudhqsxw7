import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Loader2, Download, Package, CheckSquare, DollarSign } from 'lucide-react'
import { getNextBudgetNumber, saveQuoteData } from '@/services/budget-requests'
import { generateBudgetPdf } from '@/lib/pdf-generator'
import { type BudgetRecord } from '@/lib/types'
import { CARGO_TYPE_OPTIONS, PAYMENT_OPTIONS, DEADLINE_OPTIONS } from '@/lib/constants'

const INTERNAL_SERVICES_CHECKLIST = [
  'Recebimento',
  'Conferência',
  'Armazenagem',
  'Separação',
  'Embalagem',
  'Expedição',
  'Transporte',
  'Monitoramento',
  'Entrega',
]

interface BudgetCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: BudgetRecord | null
  authorName: string
  onSuccess?: () => void
}

function getString(obj: Record<string, unknown>, key: string): string {
  const val = obj[key]
  return typeof val === 'string' ? val : ''
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function BudgetCreateDialog({
  open,
  onOpenChange,
  record,
  authorName,
  onSuccess,
}: BudgetCreateDialogProps) {
  const [value, setValue] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [responsible, setResponsible] = useState('')
  const [responsibleEmail, setResponsibleEmail] = useState('')
  const [responsiblePhone, setResponsiblePhone] = useState('')
  const [observations, setObservations] = useState('')

  const [valorMercadoria, setValorMercadoria] = useState('')
  const [tipoCarga, setTipoCarga] = useState('')
  const [prazoDesejado, setPrazoDesejado] = useState('')
  const [quantidadeVolumes, setQuantidadeVolumes] = useState('')
  const [peso, setPeso] = useState('')
  const [cubagem, setCubagem] = useState('')
  const [valorSeguro, setValorSeguro] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [prazoComercial, setPrazoComercial] = useState('')

  const [necessitaSeguro, setNecessitaSeguro] = useState(false)
  const [necessitaPicking, setNecessitaPicking] = useState(false)
  const [necessitaCrossDocking, setNecessitaCrossDocking] = useState(false)
  const [necessitaFracionamento, setNecessitaFracionamento] = useState(false)
  const [necessitaDistribuicao, setNecessitaDistribuicao] = useState(false)

  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && record) {
      const data = (record.data || {}) as Record<string, unknown>
      setValue(getString(data, 'valor_orcamento') || '')
      setValidUntil('')
      setResponsible(authorName)
      setResponsibleEmail(record.responsible_email || '')
      setResponsiblePhone(record.responsible_phone || '')
      setObservations(getString(data, 'observacoes') || '')

      setValorMercadoria(getString(data, 'valor_mercadoria') || '')
      setTipoCarga(getString(data, 'tipo_carga') || '')
      setPrazoDesejado(getString(data, 'prazo_desejado') || '')
      setQuantidadeVolumes(getString(data, 'quantidade_volumes') || '')
      setPeso(getString(data, 'peso') || '')
      setCubagem(getString(data, 'cubagem') || '')
      setValorSeguro(getString(data, 'valor_seguro') || '')
      setFormaPagamento(getString(data, 'forma_pagamento') || '')
      setPrazoComercial(getString(data, 'prazo') || '')

      setNecessitaSeguro(getString(data, 'necessita_seguro') === 'Sim')
      setNecessitaPicking(getString(data, 'necessita_picking') === 'Sim')
      setNecessitaCrossDocking(getString(data, 'necessita_cross_docking') === 'Sim')
      setNecessitaFracionamento(getString(data, 'necessita_fracionamento') === 'Sim')
      setNecessitaDistribuicao(getString(data, 'necessita_distribuicao') === 'Sim')

      const rawServices = getString(data, 'servicos_inclusos')
      setSelectedServices(rawServices ? rawServices.split(',').filter(Boolean) : [])
      setError('')
    }
  }, [open, record, authorName])

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service],
    )
  }

  const handleGeneratePdf = async () => {
    if (!record) return
    const rec = record as BudgetRecord
    setGenerating(true)
    setError('')
    try {
      const { number } = await getNextBudgetNumber()
      const quoteCreatedAt = new Date().toISOString()
      const existingData = (rec.data || {}) as Record<string, unknown>
      const emissionDate = formatDateTime(quoteCreatedAt)
      const requestDate = rec.created ? formatDateTime(rec.created) : ''
      const formattedValidUntil = validUntil
        ? new Date(validUntil + 'T00:00:00').toLocaleDateString('pt-BR')
        : ''

      const updatedData: Record<string, unknown> = {
        ...existingData,
        valor_mercadoria: valorMercadoria,
        tipo_carga: tipoCarga,
        prazo_desejado: prazoDesejado,
        quantidade_volumes: quantidadeVolumes,
        peso,
        cubagem,
        valor_seguro: valorSeguro,
        forma_pagamento: formaPagamento,
        prazo: prazoComercial,
        necessita_seguro: necessitaSeguro ? 'Sim' : 'Não',
        necessita_picking: necessitaPicking ? 'Sim' : 'Não',
        necessita_cross_docking: necessitaCrossDocking ? 'Sim' : 'Não',
        necessita_fracionamento: necessitaFracionamento ? 'Sim' : 'Não',
        necessita_distribuicao: necessitaDistribuicao ? 'Sim' : 'Não',
        servicos_inclusos: selectedServices.join(','),
        valor_orcamento: value,
        observacoes: observations,
      }

      generateBudgetPdf({
        budgetNumber: number,
        emissionDate,
        requestDate,
        clientName: rec.client_name || '',
        clientEmail: rec.client_email || '',
        clientPhone: rec.client_phone || '',
        clientCompany: getString(existingData, 'empresa'),
        service: rec.service || '',
        origin: getString(existingData, 'cidade_origem'),
        destination: getString(existingData, 'cidade_destino'),
        merchandise: getString(existingData, 'tipo_mercadoria'),
        volume: getString(existingData, 'volume_estimado'),
        operationType: getString(existingData, 'tipo_operacao'),
        periodicity: getString(existingData, 'periodicidade'),
        value,
        validUntil: formattedValidUntil,
        responsible,
        responsibleEmail,
        responsiblePhone,
        observations,
        servicosInclusos: selectedServices,
        valorMercadoria,
        necessitaSeguro: necessitaSeguro ? 'Sim' : 'Não',
        necessitaPicking: necessitaPicking ? 'Sim' : 'Não',
        necessitaCrossDocking: necessitaCrossDocking ? 'Sim' : 'Não',
        necessitaFracionamento: necessitaFracionamento ? 'Sim' : 'Não',
        necessitaDistribuicao: necessitaDistribuicao ? 'Sim' : 'Não',
        prazoDesejado,
        quantidadeVolumes,
        peso,
        cubagem,
        tipoCarga,
        valorSeguro,
        formaPagamento,
        prazoComercial,
      })

      await saveQuoteData(record.id, {
        budget_number: number,
        responsible_email: responsibleEmail,
        responsible_phone: responsiblePhone,
        quote_created_at: quoteCreatedAt,
        data: updatedData,
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar orçamento. Tente novamente.')
    } finally {
      setGenerating(false)
    }
  }

  if (!record) return null

  const safeRecord = record as BudgetRecord
  const data = (safeRecord?.data || {}) as Record<string, unknown>

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E]">
            Gerar Proposta Comercial de Orçamento
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes técnicos, comerciais e serviços inclusos para gerar o orçamento em
            PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-xl border border-[#005B2E]/20 bg-[#005B2E]/5 p-4 text-xs sm:text-sm">
            <p className="font-bold text-[#005B2E] mb-2 uppercase tracking-wide">
              Resumo da Solicitação do Cliente
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <p>
                <strong>Nome:</strong> {safeRecord.client_name || '—'}
              </p>
              <p>
                <strong>Empresa:</strong> {getString(data, 'empresa') || '—'}
              </p>
              <p>
                <strong>E-mail:</strong> {safeRecord.client_email || '—'}
              </p>
              <p>
                <strong>Telefone:</strong> {safeRecord.client_phone || '—'}
              </p>
              <p>
                <strong>Serviço:</strong> {safeRecord.service || '—'}
              </p>
              <p>
                <strong>Origem ➔ Destino:</strong> {getString(data, 'cidade_origem') || 'ES'} ➔{' '}
                {getString(data, 'cidade_destino') || 'ES'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#005B2E]/20 bg-white space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#005B2E]" />
              <h4 className="text-sm font-bold text-[#005B2E]">Checklist de Serviços Inclusos</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              {INTERNAL_SERVICES_CHECKLIST.map((svc) => (
                <div key={svc} className="flex items-center gap-2">
                  <Checkbox
                    id={`attendant-svc-${svc}`}
                    checked={selectedServices.includes(svc)}
                    onCheckedChange={() => toggleService(svc)}
                    className="border-border data-[state=checked]:bg-[#005B2E] data-[state=checked]:border-[#005B2E]"
                  />
                  <label
                    htmlFor={`attendant-svc-${svc}`}
                    className="text-xs sm:text-sm font-medium cursor-pointer"
                  >
                    {svc}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#C89B3C]/40 bg-[#C89B3C]/5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#C89B3C]" />
              <h4 className="text-sm font-bold text-[#005B2E]">
                Especificações Técnicas e Operacionais da Carga
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="necessitaSeguro"
                  checked={necessitaSeguro}
                  onCheckedChange={(c) => setNecessitaSeguro(c === true)}
                  className="data-[state=checked]:bg-[#005B2E]"
                />
                <label htmlFor="necessitaSeguro" className="text-xs sm:text-sm cursor-pointer">
                  Necessita seguro?
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="necessitaPicking"
                  checked={necessitaPicking}
                  onCheckedChange={(c) => setNecessitaPicking(c === true)}
                  className="data-[state=checked]:bg-[#005B2E]"
                />
                <label htmlFor="necessitaPicking" className="text-xs sm:text-sm cursor-pointer">
                  Necessita picking?
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="necessitaCrossDocking"
                  checked={necessitaCrossDocking}
                  onCheckedChange={(c) => setNecessitaCrossDocking(c === true)}
                  className="data-[state=checked]:bg-[#005B2E]"
                />
                <label
                  htmlFor="necessitaCrossDocking"
                  className="text-xs sm:text-sm cursor-pointer"
                >
                  Necessita cross-docking?
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="necessitaFracionamento"
                  checked={necessitaFracionamento}
                  onCheckedChange={(c) => setNecessitaFracionamento(c === true)}
                  className="data-[state=checked]:bg-[#005B2E]"
                />
                <label
                  htmlFor="necessitaFracionamento"
                  className="text-xs sm:text-sm cursor-pointer"
                >
                  Necessita fracionamento?
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="necessitaDistribuicao"
                  checked={necessitaDistribuicao}
                  onCheckedChange={(c) => setNecessitaDistribuicao(c === true)}
                  className="data-[state=checked]:bg-[#005B2E]"
                />
                <label
                  htmlFor="necessitaDistribuicao"
                  className="text-xs sm:text-sm cursor-pointer"
                >
                  Necessita distribuição?
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Valor da mercadoria (R$)</Label>
                <Input
                  value={valorMercadoria}
                  onChange={(e) => setValorMercadoria(e.target.value)}
                  placeholder="Ex: 50.000,00"
                  className="h-9 focus-visible:ring-[#005B2E]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Tipo de carga</Label>
                <Select value={tipoCarga} onValueChange={setTipoCarga}>
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {CARGO_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Prazo desejado</Label>
                <Select value={prazoDesejado} onValueChange={setPrazoDesejado}>
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {DEADLINE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Qtd. de volumes</Label>
                <Input
                  type="number"
                  value={quantidadeVolumes}
                  onChange={(e) => setQuantidadeVolumes(e.target.value)}
                  placeholder="Ex: 150"
                  className="h-9 focus-visible:ring-[#005B2E]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Peso (kg)</Label>
                <Input
                  type="number"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ex: 1200"
                  className="h-9 focus-visible:ring-[#005B2E]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Cubagem (m³)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={cubagem}
                  onChange={(e) => setCubagem(e.target.value)}
                  placeholder="Ex: 2.5"
                  className="h-9 focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#005B2E]/20 bg-white space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#005B2E]" />
              <h4 className="text-sm font-bold text-[#005B2E]">Proposta e Valores Comerciais</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Valor do Orçamento (R$)</Label>
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ex: 4.500,00"
                  className="h-9 focus-visible:ring-[#005B2E]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Validade do Orçamento</Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="h-9 focus-visible:ring-[#005B2E]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Valor do seguro (R$)</Label>
                <Input
                  value={valorSeguro}
                  onChange={(e) => setValorSeguro(e.target.value)}
                  placeholder="Ex: 250,00"
                  className="h-9 focus-visible:ring-[#005B2E]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Forma de Pagamento</Label>
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold">Prazo Comercial</Label>
                <Input
                  value={prazoComercial}
                  onChange={(e) => setPrazoComercial(e.target.value)}
                  placeholder="Ex: 5 a 7 dias úteis após a coleta"
                  className="h-9 focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Responsável</Label>
                <Input
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="Nome do responsável"
                  className="h-9 focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">E-mail do responsável</Label>
                <Input
                  type="email"
                  value={responsibleEmail}
                  onChange={(e) => setResponsibleEmail(e.target.value)}
                  placeholder="responsavel@veloralog.com.br"
                  className="h-9 focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Telefone do responsável</Label>
                <Input
                  type="tel"
                  value={responsiblePhone}
                  onChange={(e) => setResponsiblePhone(e.target.value)}
                  placeholder="(27) 99999-9999"
                  className="h-9 focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <Label className="text-xs font-semibold">Observações / Condições Especiais</Label>
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observações importantes sobre o frete, horários de entrega ou restrições..."
                rows={3}
                className="resize-none focus-visible:ring-[#005B2E] text-xs"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleGeneratePdf}
            disabled={generating}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Gerar PDF e Salvar Orçamento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
