import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { pb } from '@/lib/pocketbase/client'
import { toast } from '@/hooks/use-toast'

interface AccessRequest {
  id: string
  client_id?: string
  partner_id?: string
  company_name: string
  trade_name?: string
  cnpj: string
  email: string
  phone?: string
  contact_name?: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  rejection_reason?: string
  approved_by?: string
  approved_at?: string
  notes?: string
  created?: string
}

interface PartnerOption {
  id: string
  company_name: string
  trade_name?: string
  cnpj: string
}

export function AdminB2BAccessRequestsScreen() {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [partners, setPartners] = useState<PartnerOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendente' | 'aprovado' | 'rejeitado'>(
    'all',
  )

  // Modais
  const [selectedReq, setSelectedReq] = useState<AccessRequest | null>(null)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      // 1. Carregar solicitações via endpoint seguro ou fallback
      let reqList: AccessRequest[] = []
      try {
        const res = await pb.send('/backend/v1/b2b/admin/access-requests', { method: 'GET' })
        if (res && res.requests) {
          reqList = res.requests
        }
      } catch (_) {
        // Fallback direto via collection
        try {
          const records = await pb.collection('b2b_access_requests').getList(1, 100, {
            sort: '-created',
          })
          reqList = records.items.map((r) => ({
            id: r.id,
            client_id: r.client_id,
            partner_id: r.partner_id,
            company_name: r.company_name,
            trade_name: r.trade_name,
            cnpj: r.cnpj,
            email: r.email,
            phone: r.phone,
            contact_name: r.contact_name,
            status: r.status || 'pendente',
            rejection_reason: r.rejection_reason,
            approved_by: r.approved_by,
            approved_at: r.approved_at,
            notes: r.notes,
            created: r.created,
          }))
        } catch {
          /* intentionally ignored */
        }
      }
      setRequests(reqList)

      // 2. Carregar parceiros tipo Cliente para opções de vínculo manual se necessário
      try {
        const pRecords = await pb.collection('partners').getList(1, 200, {
          filter: 'partner_type = "Cliente"',
          sort: 'company_name',
        })
        setPartners(
          pRecords.items.map((p) => ({
            id: p.id,
            company_name: p.company_name,
            trade_name: p.trade_name,
            cnpj: p.cnpj,
          })),
        )
      } catch {
        /* intentionally ignored */
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar solicitações',
        description: err.message || 'Falha de comunicação.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenApprove = (req: AccessRequest) => {
    setSelectedReq(req)
    // Tenta sugerir o parceiro já vinculado ou correspondente
    setSelectedPartnerId(req.partner_id || '')
    setIsApproveOpen(true)
  }

  const handleOpenReject = (req: AccessRequest) => {
    setSelectedReq(req)
    setRejectionReason('')
    setIsRejectOpen(true)
  }

  const handleConfirmApprove = async () => {
    if (!selectedReq) return
    setIsSubmitting(true)
    try {
      await pb.send('/backend/v1/b2b/admin/approve-access', {
        method: 'POST',
        body: {
          request_id: selectedReq.id,
          action: 'aprovar',
          partner_id: selectedPartnerId || undefined,
        },
      })

      toast({
        title: 'Acesso B2B Aprovado',
        description: `O cliente ${selectedReq.company_name} já pode acessar o Portal B2B e emitir pedidos.`,
      })
      setIsApproveOpen(false)
      loadData()
    } catch (err: any) {
      toast({
        title: 'Falha na aprovação',
        description: err.message || 'Não foi possível aprovar a solicitação.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmReject = async () => {
    if (!selectedReq) return
    setIsSubmitting(true)
    try {
      await pb.send('/backend/v1/b2b/admin/approve-access', {
        method: 'POST',
        body: {
          request_id: selectedReq.id,
          action: 'rejeitar',
          rejection_reason: rejectionReason,
        },
      })

      toast({
        title: 'Acesso B2B Rejeitado',
        description: `A solicitação foi marcada como rejeitada.`,
      })
      setIsRejectOpen(false)
      loadData()
    } catch (err: any) {
      toast({
        title: 'Falha na rejeição',
        description: err.message || 'Não foi possível rejeitar a solicitação.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cnpj.includes(searchTerm) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = requests.filter((r) => r.status === 'pendente').length
  const approvedCount = requests.filter((r) => r.status === 'aprovado').length
  const rejectedCount = requests.filter((r) => r.status === 'rejeitado').length

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600" />
            Acessos B2B (Aprovações e Vínculos)
          </h1>
          <p className="text-sm text-slate-500">
            Validação de autocadastro do Portal B2B, deliberação de solicitações e vínculo de
            parceiros comerciais.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50/40">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-amber-800 font-medium">
              Aguardando Aprovação
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-900 flex items-center justify-between">
              {pendingCount}
              <Clock className="w-5 h-5 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-amber-700">
            Cadastros pendentes com acesso restrito a tela de análise.
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-emerald-800 font-medium">
              Acessos Aprovados
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-900 flex items-center justify-between">
              {approvedCount}
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-emerald-700">
            Clientes ativos emitindo pedidos e acompanhando entregas.
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/40">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-rose-800 font-medium">
              Rejeitados / Suspensos
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-rose-900 flex items-center justify-between">
              {rejectedCount}
              <XCircle className="w-5 h-5 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-rose-700">
            Solicitações recusadas por divergência fiscal ou cadastral.
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader className="p-4 pb-3 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <Input
                placeholder="Buscar por Razão Social, CNPJ ou E-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-500 whitespace-nowrap">Filtrar Status:</Label>
            <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
              <SelectTrigger className="w-36 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="aprovado">Aprovados</SelectItem>
                <SelectItem value="rejeitado">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/70">
                <TableRow>
                  <TableHead>Empresa / Razão Social</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Contato & E-mail</TableHead>
                  <TableHead>Vínculo ERP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
                      Carregando solicitações de acesso...
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                      Nenhuma solicitação de acesso B2B encontrada com os filtros selecionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((req) => {
                    const isPending = req.status === 'pendente'
                    const isApproved = req.status === 'aprovado'
                    const isRejected = req.status === 'rejeitado'

                    return (
                      <TableRow key={req.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium">
                          <div>
                            <span className="text-slate-900 font-semibold">{req.company_name}</span>
                            {req.trade_name && req.trade_name !== req.company_name && (
                              <p className="text-xs text-slate-500">{req.trade_name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {req.cnpj}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {req.email}
                            </div>
                            {req.phone && (
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {req.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {req.partner_id ? (
                            <Badge
                              variant="outline"
                              className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              Vinculado ao ERP
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                            >
                              Novo Parceiro
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {isPending && (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300">
                              Em Análise
                            </Badge>
                          )}
                          {isApproved && (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300">
                              Aprovado
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-300">
                              Rejeitado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {req.created ? new Date(req.created).toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isPending && (
                              <>
                                <Button
                                  size="sm"
                                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                  onClick={() => handleOpenApprove(req)}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 border-rose-300 text-rose-700 hover:bg-rose-50 gap-1"
                                  onClick={() => handleOpenReject(req)}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Rejeitar
                                </Button>
                              </>
                            )}
                            {isApproved && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-rose-300 text-rose-700 hover:bg-rose-50"
                                onClick={() => handleOpenReject(req)}
                              >
                                Suspender
                              </Button>
                            )}
                            {isRejected && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleOpenApprove(req)}
                              >
                                Reavaliar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Aprovação */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
              Aprovar Acesso ao Portal B2B
            </DialogTitle>
            <DialogDescription>
              Ao aprovar, o cliente terá permissão imediata para acessar o catálogo, montar pedidos
              e consultar entregas no Portal B2B.
            </DialogDescription>
          </DialogHeader>

          {selectedReq && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-slate-50 rounded-lg text-sm space-y-1">
                <p>
                  <strong className="text-slate-700">Empresa:</strong> {selectedReq.company_name}
                </p>
                <p>
                  <strong className="text-slate-700">CNPJ:</strong> {selectedReq.cnpj}
                </p>
                <p>
                  <strong className="text-slate-700">E-mail:</strong> {selectedReq.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Vincular a Parceiro do ERP (Opcional):</Label>
                <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o parceiro correspondente..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectItem value="">Usar parceiro auto-criado no cadastro</SelectItem>
                    {partners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.company_name} ({p.cnpj})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Garante que os pedidos faturados no Portal B2B sejam contabilizados no parceiro
                  fiscal correto.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleConfirmApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Aprovando...' : 'Confirmar Aprovação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Rejeição */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <XCircle className="w-5 h-5" />
              Rejeitar Acesso B2B
            </DialogTitle>
            <DialogDescription>
              Informe o motivo da recusa cadastral. O cliente continuará visualizando apenas o aviso
              de cadastro pendente ou recusado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label>Motivo da Rejeição / Justificativa:</Label>
            <Textarea
              placeholder="Ex.: CNPJ inativo na Receita Federal, divergência de dados ou cliente com restrições cadastrais..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectOpen(false)}
              disabled={isSubmitting}
            >
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject} disabled={isSubmitting}>
              {isSubmitting ? 'Processando...' : 'Confirmar Rejeição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default AdminB2BAccessRequestsScreen
