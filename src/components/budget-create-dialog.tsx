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
import { AlertCircle, Loader2, Download } from 'lucide-react'
import { getNextBudgetNumber } from '@/services/budget-requests'
import { generateBudgetPdf } from '@/lib/pdf-generator'
import { type BudgetRecord } from '@/lib/types'

interface BudgetCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: BudgetRecord | null
  authorName: string
}

function getString(obj: Record<string, unknown>, key: string): string {
  const val = obj[key]
  return typeof val === 'string' ? val : ''
}

export function BudgetCreateDialog({
  open,
  onOpenChange,
  record,
  authorName,
}: BudgetCreateDialogProps) {
  const [value, setValue] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [responsible, setResponsible] = useState('')
  const [observations, setObservations] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setValue('')
      setValidUntil('')
      setResponsible(authorName)
      setObservations('')
      setError('')
    }
  }, [open, authorName])

  const handleGeneratePdf = async () => {
    if (!record) return
    setGenerating(true)
    setError('')
    try {
      const { number } = await getNextBudgetNumber()
      const data = record.data as Record<string, unknown>
      const emissionDate = new Date().toLocaleDateString('pt-BR')
      const formattedValidUntil = validUntil
        ? new Date(validUntil + 'T00:00:00').toLocaleDateString('pt-BR')
        : ''

      generateBudgetPdf({
        budgetNumber: number,
        emissionDate,
        clientName: record.client_name,
        clientEmail: record.client_email,
        clientPhone: record.client_phone,
        clientCompany: getString(data, 'empresa'),
        service: record.service,
        origin: getString(data, 'cidade_origem'),
        destination: getString(data, 'cidade_destino'),
        merchandise: getString(data, 'tipo_mercadoria'),
        volume: getString(data, 'volume_estimado'),
        operationType: getString(data, 'tipo_operacao'),
        periodicity: getString(data, 'periodicidade'),
        value,
        validUntil: formattedValidUntil,
        responsible,
        observations,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar orçamento. Tente novamente.')
    } finally {
      setGenerating(false)
    }
  }

  if (!record) return null

  const data = record.data as Record<string, unknown>

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Orçamento</DialogTitle>
          <DialogDescription>
            Preencha os dados do orçamento e gere o PDF com a identidade da Velora Log.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-[#005B2E]/20 bg-[#005B2E]/5 p-4">
            <p className="text-sm font-bold text-[#005B2E] mb-2">Dados do Cliente</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>
                <strong>Nome:</strong> {record.client_name || '—'}
              </p>
              <p>
                <strong>Empresa:</strong> {getString(data, 'empresa') || '—'}
              </p>
              <p>
                <strong>E-mail:</strong> {record.client_email || '—'}
              </p>
              <p>
                <strong>Telefone:</strong> {record.client_phone || '—'}
              </p>
              <p>
                <strong>Serviço:</strong> {record.service || '—'}
              </p>
              <p>
                <strong>Origem:</strong> {getString(data, 'cidade_origem') || '—'}
              </p>
              <p>
                <strong>Destino:</strong> {getString(data, 'cidade_destino') || '—'}
              </p>
              <p>
                <strong>Mercadoria:</strong> {getString(data, 'tipo_mercadoria') || '—'}
              </p>
              <p>
                <strong>Volume:</strong> {getString(data, 'volume_estimado') || '—'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="value" className="text-sm font-semibold">
                Valor (R$)
              </Label>
              <Input
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ex: 5.000,00"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="validUntil" className="text-sm font-semibold">
                Validade do Orçamento
              </Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="responsible" className="text-sm font-semibold">
              Nome do Responsável
            </Label>
            <Input
              id="responsible"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="Ex: João Silva"
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="observations" className="text-sm font-semibold">
              Observações
            </Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações importantes sobre o orçamento..."
              rows={4}
              className="resize-none focus-visible:ring-[#005B2E]"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
        <DialogFooter>
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
                Gerando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Gerar PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
