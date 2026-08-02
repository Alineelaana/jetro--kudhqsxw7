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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Loader2, AlertCircle, UserCheck, Building2, User } from 'lucide-react'
import { searchPartners } from '@/services/partners'
import { getActiveServicesOffered } from '@/services/services-offered'
import { createBudgetRequest } from '@/services/budget-requests'
import { toast } from '@/hooks/use-toast'

interface PartnerResult {
  id: string
  full_name: string
  company_name: string
  email: string
  phone: string
  cpf: string
  cnpj: string
  person_type: string
  address_city: string
  address_state: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const OPERATION_TYPES = [
  'Armazenagem',
  'Transporte',
  'Distribuição',
  'Logística Reversa',
  'Movimentação',
  'Outros',
]
const PERIODICITIES = ['Único', 'Diário', 'Semanal', 'Quinzenal', 'Mensal', 'Sob Demanda']

export function InternalBudgetDialog({ open, onOpenChange, onSuccess }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<PartnerResult[]>([])
  const [selected, setSelected] = useState<PartnerResult | null>(null)
  const [services, setServices] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [service, setService] = useState('')
  const [operationType, setOperationType] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [merchandise, setMerchandise] = useState('')
  const [volume, setVolume] = useState('')
  const [periodicity, setPeriodicity] = useState('')

  useEffect(() => {
    if (open) {
      getActiveServicesOffered()
        .then((data) => {
          const names = (data || [])
            .filter((s: unknown) => s && typeof s === 'object' && 'name' in s)
            .map((s: { name: string }) => s.name)
            .filter(Boolean)
          setServices(names)
        })
        .catch(() => {})
      setError('')
      setSelected(null)
      setSearchQuery('')
      setResults([])
    }
  }, [open])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setError('')
    try {
      const data = await searchPartners(searchQuery.trim())
      setResults(data as unknown as PartnerResult[])
      if (data.length === 0) setError('Nenhum parceiro encontrado.')
    } catch {
      setError('Erro ao buscar parceiros. Tente novamente.')
      setResults([])
    }
    setSearching(false)
  }

  const handleSelect = (partner: PartnerResult) => {
    setSelected(partner)
    setResults([])
    setSearchQuery('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) {
      setError('Selecione um parceiro para continuar.')
      return
    }
    if (!service) {
      setError('Selecione um serviço.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const clientName =
        selected.person_type === 'PJ'
          ? selected.company_name || selected.full_name
          : selected.full_name || selected.company_name
      await createBudgetRequest({
        data: {
          nome_completo: clientName,
          empresa: selected.company_name || '',
          email: selected.email || '',
          telefone: selected.phone || '',
          servico_interesse: service,
          tipo_operacao: operationType,
          cidade_origem: origin,
          cidade_destino: destination,
          tipo_mercadoria: merchandise,
          volume_estimado: volume,
          periodicidade: periodicity,
          origem_interna: 'true',
        },
        client_name: clientName,
        client_email: selected.email || '',
        client_phone: selected.phone || '',
        service,
      })
      toast({ title: 'Orçamento interno criado com sucesso!' })
      onSuccess()
      onOpenChange(false)
    } catch {
      setError('Erro ao criar orçamento. Tente novamente.')
    }
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E]">
            Novo Orçamento Interno
          </DialogTitle>
          <DialogDescription>
            Busque um parceiro cadastrado para preencher automaticamente os dados do cliente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!selected ? (
            <div className="space-y-3">
              <Label className="text-sm font-bold text-[#005B2E]">Buscar Parceiro</Label>
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                  placeholder="CPF, CNPJ, nome, razão social ou e-mail..."
                  className="focus-visible:ring-[#005B2E]"
                />
                <Button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white flex-shrink-0"
                >
                  {searching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {error}
                </p>
              )}
              {results.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelect(p)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:border-[#005B2E] hover:bg-[#005B2E]/5 transition-colors flex items-center gap-3"
                    >
                      {p.person_type === 'PJ' ? (
                        <Building2 className="w-5 h-5 text-[#005B2E] flex-shrink-0" />
                      ) : (
                        <User className="w-5 h-5 text-[#005B2E] flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate">
                          {p.person_type === 'PJ'
                            ? p.company_name || p.full_name
                            : p.full_name || p.company_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.email || 'Sem e-mail'} • {p.phone || 'Sem telefone'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.cpf && `CPF: ${p.cpf}`}
                          {p.cnpj && `CNPJ: ${p.cnpj}`}
                          {p.address_city && ` • ${p.address_city}/${p.address_state || ''}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-[#005B2E]/20 bg-[#005B2E]/5 p-4 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="w-5 h-5 text-[#005B2E]" />
                  <span className="text-sm font-bold text-[#005B2E]">Cliente Selecionado</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p>
                    <strong>Nome:</strong>{' '}
                    {selected.person_type === 'PJ' ? selected.company_name : selected.full_name}
                  </p>
                  <p>
                    <strong>E-mail:</strong> {selected.email || '—'}
                  </p>
                  <p>
                    <strong>Telefone:</strong> {selected.phone || '—'}
                  </p>
                  <p>
                    <strong>Documento:</strong> {selected.cpf || selected.cnpj || '—'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(null)}
                  className="text-xs h-7 mt-1"
                >
                  Trocar parceiro
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold">Serviço *</Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger className="h-9 bg-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {services.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tipo de Operação</Label>
                  <Select value={operationType} onValueChange={setOperationType}>
                    <SelectTrigger className="h-9 bg-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {OPERATION_TYPES.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Periodicidade</Label>
                  <Select value={periodicity} onValueChange={setPeriodicity}>
                    <SelectTrigger className="h-9 bg-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {PERIODICITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Origem</Label>
                  <Input
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Cidade de origem"
                    className="h-9 focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Destino</Label>
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Cidade de destino"
                    className="h-9 focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Mercadoria</Label>
                  <Input
                    value={merchandise}
                    onChange={(e) => setMerchandise(e.target.value)}
                    placeholder="Tipo de mercadoria"
                    className="h-9 focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Volume Estimado</Label>
                  <Input
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    placeholder="Ex: 500 unidades"
                    className="h-9 focus-visible:ring-[#005B2E]"
                  />
                </div>
              </div>
            </>
          )}

          {error && selected && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {error}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            {selected && (
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Criar Solicitação
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
