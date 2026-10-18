import { useState, useEffect } from 'react'
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  EyeOff,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  User,
  Building2,
  Mail,
  Instagram,
  Calendar,
  AlertCircle,
  FileText,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  getAllTestimonialsAdmin,
  approveTestimonial,
  rejectTestimonial,
  unpublishTestimonial,
  deleteTestimonialAdmin,
  getTestimonialPhotoUrl,
  buildInstagramUrl,
  type SiteTestimonial,
  type TestimonialStatus,
} from '@/services/site-testimonials'

export default function SiteTestimonialsAdmin() {
  const { toast } = useToast()
  const { user, userRole } = useAuth()
  const [testimonials, setTestimonials] = useState<SiteTestimonial[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [search, setSearch] = useState('')
  const [empresaFilter, setEmpresaFilter] = useState('')

  // Modal Detalhes & Ações
  const [selectedItem, setSelectedItem] = useState<SiteTestimonial | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Ação de Aprovação
  const [verificadoCheck, setVerificadoCheck] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Modal Reprovação com Justificativa obrigatória
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [reprovacaoMotivo, setReprovacaoMotivo] = useState('')

  // Modal Despublicação com Motivo
  const [unpublishModalOpen, setUnpublishModalOpen] = useState(false)
  const [despublicacaoMotivo, setDespublicacaoMotivo] = useState('')

  // Modal Exclusão permanente (LGPD / Retenção)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getAllTestimonialsAdmin()
      setTestimonials(data)
    } catch (err) {
      console.error('Erro ao carregar depoimentos:', err)
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível buscar a lista de depoimentos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openDetails = (t: SiteTestimonial) => {
    setSelectedItem(t)
    setVerificadoCheck(Boolean(t.verificado))
    setDetailsOpen(true)
  }

  const handleApprove = async () => {
    if (!selectedItem) return
    setActionLoading(true)
    try {
      const aprovadorNome = user?.name || user?.email || 'Administrador Master'
      const updated = await approveTestimonial(selectedItem.id, {
        aprovadorNome,
        verificado: verificadoCheck,
      })
      toast({
        title: 'Depoimento aprovado com sucesso!',
        description: `O depoimento de "${updated.nome_autor}" foi publicado no site institucional.`,
      })
      setSelectedItem(updated)
      setDetailsOpen(false)
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao aprovar',
        description: err?.message || 'Falha ao aprovar o depoimento.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectConfirm = async () => {
    if (!selectedItem) return
    if (!reprovacaoMotivo.trim()) {
      toast({
        title: 'Justificativa obrigatória',
        description: 'Informe o motivo interno da reprovação para histórico administrativo.',
        variant: 'destructive',
      })
      return
    }

    setActionLoading(true)
    try {
      const reprovadorNome = user?.name || user?.email || 'Administrador Master'
      const updated = await rejectTestimonial(selectedItem.id, {
        reprovadorNome,
        motivo: reprovacaoMotivo,
      })
      toast({
        title: 'Depoimento reprovado',
        description: 'O registro foi arquivado como Reprovado e não será exibido publicamente.',
      })
      setRejectModalOpen(false)
      setDetailsOpen(false)
      setReprovacaoMotivo('')
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao reprovar',
        description: err?.message || 'Falha ao reprovar depoimento.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnpublishConfirm = async () => {
    if (!selectedItem) return
    setActionLoading(true)
    try {
      const responsavelNome = user?.name || user?.email || 'Administrador Master'
      const updated = await unpublishTestimonial(selectedItem.id, {
        responsavelNome,
        motivo: despublicacaoMotivo,
      })
      toast({
        title: 'Depoimento despublicado',
        description: 'O depoimento foi removido do site e mantido no histórico interno.',
      })
      setUnpublishModalOpen(false)
      setDetailsOpen(false)
      setDespublicacaoMotivo('')
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao despublicar',
        description: err?.message || 'Falha ao despublicar depoimento.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteTestimonialAdmin(deleteId)
      toast({
        title: 'Depoimento removido',
        description: 'O registro e seus arquivos foram excluídos permanentemente (LGPD).',
      })
      setDeleteId(null)
      if (selectedItem?.id === deleteId) {
        setDetailsOpen(false)
      }
      loadData()
    } catch (err) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o depoimento.',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  // Filtragem
  const filtered = testimonials.filter((t) => {
    if (statusFilter !== 'todos' && t.status !== statusFilter) return false
    if (empresaFilter && !t.empresa.toLowerCase().includes(empresaFilter.toLowerCase()))
      return false
    if (search) {
      const q = search.toLowerCase()
      const matchNome = t.nome_autor.toLowerCase().includes(q)
      const matchEmpresa = t.empresa.toLowerCase().includes(q)
      const matchEmail = t.email.toLowerCase().includes(q)
      const matchDepoimento = t.depoimento.toLowerCase().includes(q)
      const matchInsta = t.instagram.toLowerCase().includes(q)
      if (!matchNome && !matchEmpresa && !matchEmail && !matchDepoimento && !matchInsta) {
        return false
      }
    }
    return true
  })

  const getStatusBadge = (status: TestimonialStatus) => {
    switch (status) {
      case 'Aprovado':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
            Aprovado
          </Badge>
        )
      case 'Pendente de Aprovação':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold">
            <AlertCircle className="w-3 h-3 mr-1 text-amber-500" />
            Pendente de Aprovação
          </Badge>
        )
      case 'Reprovado':
        return (
          <Badge className="bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30 font-bold">
            <XCircle className="w-3 h-3 mr-1 text-red-500" />
            Reprovado
          </Badge>
        )
      case 'Despublicado':
        return (
          <Badge className="bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30 font-bold">
            <EyeOff className="w-3 h-3 mr-1 text-zinc-500" />
            Despublicado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-2xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#005B2E]/10 text-[#005B2E]">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Moderação de Depoimentos do Site
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Aprovação, moderação e conformidade LGPD de depoimentos enviados por clientes no site
            institucional (/site).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-10 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Métricas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter('todos')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'todos' ? 'border-[#005B2E] bg-[#005B2E]/5 shadow-xs' : 'bg-card'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Total Recebido
          </span>
          <span className="text-2xl font-black text-foreground mt-1 block">
            {testimonials.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Pendente de Aprovação')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'Pendente de Aprovação'
              ? 'border-amber-500 bg-amber-500/10 shadow-xs'
              : 'bg-card'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
            Pendentes
          </span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {testimonials.filter((t) => t.status === 'Pendente de Aprovação').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Aprovado')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'Aprovado'
              ? 'border-emerald-500 bg-emerald-500/10 shadow-xs'
              : 'bg-card'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
            Aprovados no Site
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {testimonials.filter((t) => t.status === 'Aprovado').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Reprovado')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'Reprovado' ? 'border-red-500 bg-red-500/10 shadow-xs' : 'bg-card'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 block">
            Reprovados / Arquivados
          </span>
          <span className="text-2xl font-black text-red-600 mt-1 block">
            {
              testimonials.filter((t) => t.status === 'Reprovado' || t.status === 'Despublicado')
                .length
            }
          </span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-card border rounded-2xl p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por autor, e-mail, texto..."
            className="pl-9 h-10 text-xs sm:text-sm"
          />
        </div>

        <div>
          <Input
            value={empresaFilter}
            onChange={(e) => setEmpresaFilter(e.target.value)}
            placeholder="Filtrar por nome da empresa..."
            className="h-10 text-xs sm:text-sm"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
          >
            <option value="todos">Todos os status</option>
            <option value="Pendente de Aprovação">Pendente de Aprovação</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Reprovado">Reprovado</option>
            <option value="Despublicado">Despublicado</option>
          </select>
        </div>
      </div>

      {/* Tabela de Depoimentos */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-muted/50 border-b text-muted-foreground font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-14">Foto</th>
                <th className="py-3.5 px-4">Autor & Empresa</th>
                <th className="py-3.5 px-4">E-mail (Restrito)</th>
                <th className="py-3.5 px-4">Instagram</th>
                <th className="py-3.5 px-4 max-w-xs">Depoimento</th>
                <th className="py-3.5 px-4">Data Envio</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#005B2E]" />
                    Carregando depoimentos...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    Nenhum depoimento encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const photoUrl = getTestimonialPhotoUrl(item)
                  const instaUrl = buildInstagramUrl(item.instagram)
                  const dataFormatada = item.created
                    ? new Date(item.created).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => openDetails(item)}
                    >
                      {/* Foto */}
                      <td className="py-3 px-4">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={item.nome_autor}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted border flex items-center justify-center font-bold text-xs text-muted-foreground">
                            {item.nome_autor.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>

                      {/* Autor & Empresa */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                          {item.nome_autor}
                          {item.verificado && (
                            <span title="Depoimento verificado pela equipe">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {item.empresa}
                        </div>
                      </td>

                      {/* E-mail Restrito */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <Lock className="w-3 h-3 text-amber-500" />
                          <span className="truncate max-w-[160px]">{item.email}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/80 block">
                          Não público
                        </span>
                      </td>

                      {/* Instagram */}
                      <td className="py-3 px-4">
                        {item.instagram ? (
                          <a
                            href={instaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-400 hover:underline font-medium text-xs"
                          >
                            <Instagram className="w-3.5 h-3.5 shrink-0" />
                            <span>@{item.instagram.replace(/^@/, '')}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>

                      {/* Prévia Depoimento */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="line-clamp-2 text-xs text-muted-foreground italic">
                          "{item.depoimento}"
                        </p>
                      </td>

                      {/* Data */}
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {dataFormatada}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openDetails(item)}
                          className="h-8 text-xs font-semibold"
                        >
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Completo de Detalhes e Ações Administrativas */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-6">
                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#005B2E]" />
                    Análise do Depoimento
                  </DialogTitle>
                  <div>{getStatusBadge(selectedItem.status)}</div>
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  ID do Registro: <span className="font-mono">{selectedItem.id}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-3">
                {/* Header do Autor com Foto */}
                <div className="flex items-start gap-4 p-4 rounded-xl border bg-muted/20">
                  {getTestimonialPhotoUrl(selectedItem) ? (
                    <img
                      src={getTestimonialPhotoUrl(selectedItem)!}
                      alt={selectedItem.nome_autor}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#005B2E] shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted border flex items-center justify-center font-bold text-lg text-muted-foreground shrink-0">
                      {selectedItem.nome_autor.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      {selectedItem.nome_autor}
                      {selectedItem.verificado && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Selo Verificado Ativo
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      Empresa: <strong className="text-foreground">{selectedItem.empresa}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      E-mail: <span className="font-mono">{selectedItem.email}</span> (não público)
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-purple-600" />
                      Instagram:{' '}
                      <a
                        href={buildInstagramUrl(selectedItem.instagram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline font-medium inline-flex items-center gap-1"
                      >
                        @{selectedItem.instagram.replace(/^@/, '')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>
                </div>

                {/* Texto do Depoimento */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Depoimento Original Declarado
                  </Label>
                  <div className="p-4 rounded-xl border bg-background text-sm text-foreground leading-relaxed italic border-l-4 border-l-[#005B2E]">
                    "{selectedItem.depoimento}"
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-0.5">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                    Regra de integridade: O texto original não pode ser adulterado
                    administrativamente para proteger a fidelidade da declaração do cliente.
                  </p>
                </div>

                {/* Registro LGPD e Termo de Autorização */}
                <div className="p-3.5 rounded-xl border bg-muted/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      Autorização de Publicação LGPD Registrada
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      Versão {selectedItem.autorizacao_versao || 'v1.0-2026'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
                    <div>
                      <strong>Data da aceitação:</strong>{' '}
                      {selectedItem.autorizacao_data
                        ? new Date(selectedItem.autorizacao_data).toLocaleString('pt-BR')
                        : 'Simultânea ao envio'}
                    </div>
                    <div>
                      <strong>IP de origem:</strong> {selectedItem.ip_origem || 'Registrado'}
                    </div>
                  </div>
                  {selectedItem.autorizacao_hash && (
                    <div className="text-[10px] text-muted-foreground/80 font-mono break-all pt-1">
                      Hash criptográfico: {selectedItem.autorizacao_hash}
                    </div>
                  )}
                </div>

                {/* Histórico Administrativo de Moderação */}
                {(selectedItem.aprovado_por ||
                  selectedItem.reprovado_por ||
                  selectedItem.despublicado_por) && (
                  <div className="p-3 rounded-xl border bg-muted/20 space-y-1.5 text-xs">
                    <span className="font-bold text-foreground block">
                      Histórico Administrativo:
                    </span>
                    {selectedItem.aprovado_por && (
                      <p className="text-emerald-700 dark:text-emerald-400">
                        • <strong>Aprovado por:</strong> {selectedItem.aprovado_por} em{' '}
                        {new Date(selectedItem.aprovado_em!).toLocaleString('pt-BR')}
                      </p>
                    )}
                    {selectedItem.reprovado_motivo && (
                      <p className="text-red-600 dark:text-red-400">
                        • <strong>Reprovado por:</strong> {selectedItem.reprovado_por} em{' '}
                        {new Date(selectedItem.reprovado_em!).toLocaleString('pt-BR')} —
                        Justificativa: <em>"{selectedItem.reprovado_motivo}"</em>
                      </p>
                    )}
                    {selectedItem.despublicado_por && (
                      <p className="text-zinc-600 dark:text-zinc-400">
                        • <strong>Despublicado por:</strong> {selectedItem.despublicado_por} em{' '}
                        {new Date(selectedItem.despublicado_em!).toLocaleString('pt-BR')}{' '}
                        {selectedItem.despublicado_motivo &&
                          `— Motivo: "${selectedItem.despublicado_motivo}"`}
                      </p>
                    )}
                  </div>
                )}

                {/* Opção Selo Verificado na Aprovação */}
                {selectedItem.status !== 'Aprovado' && (
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start gap-3">
                    <Checkbox
                      id="check-verificado"
                      checked={verificadoCheck}
                      onCheckedChange={(c) => setVerificadoCheck(Boolean(c))}
                      className="mt-0.5"
                    />
                    <div>
                      <label
                        htmlFor="check-verificado"
                        className="text-xs font-bold text-foreground cursor-pointer block"
                      >
                        Conceder selo "Depoimento verificado"
                      </label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Marque apenas se a equipe confirmou que o autor realmente representa a
                        empresa parceira.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 border-t pt-4">
                {/* Botão de Exclusão (LGPD) */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(selectedItem.id)}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Excluir Registro (LGPD)
                </Button>

                <div className="flex-1" />

                {/* Ações de Estado */}
                {selectedItem.status === 'Aprovado' ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUnpublishModalOpen(true)}
                    disabled={actionLoading}
                    className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 border-zinc-400"
                  >
                    <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                    Despublicar Depoimento
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRejectModalOpen(true)}
                      disabled={actionLoading}
                      className="text-xs font-semibold text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Reprovar Depoimento
                    </Button>
                    <Button
                      type="button"
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="bg-[#005B2E] hover:bg-[#004824] text-white font-bold text-xs px-5 shadow-sm"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Aprovando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Aprovar Depoimento
                        </>
                      )}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Reprovação com Justificativa */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-600 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Reprovar Depoimento
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Informe a justificativa interna para arquivamento deste depoimento. O motivo fica
              registrado administrativamente e não será visível publicamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="motivo-reprovacao" className="text-xs font-semibold">
              Justificativa interna *
            </Label>
            <Textarea
              id="motivo-reprovacao"
              rows={3}
              required
              value={reprovacaoMotivo}
              onChange={(e) => setReprovacaoMotivo(e.target.value)}
              placeholder="Ex: Não foi possível validar vínculo com a empresa / linguagem inadequada..."
              className="text-xs"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
              disabled={actionLoading}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRejectConfirm}
              disabled={!reprovacaoMotivo.trim() || actionLoading}
              className="text-xs font-bold"
            >
              {actionLoading ? 'Gravando...' : 'Confirmar Reprovação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Despublicação */}
      <Dialog open={unpublishModalOpen} onOpenChange={setUnpublishModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-zinc-600" />
              Despublicar Depoimento do Site
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              O depoimento sairá imediatamente do site institucional. O registro histórico será
              preservado com status "Despublicado".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="motivo-despublicacao" className="text-xs font-semibold">
              Motivo da retirada (opcional / solicitação do cliente)
            </Label>
            <Textarea
              id="motivo-despublicacao"
              rows={2}
              value={despublicacaoMotivo}
              onChange={(e) => setDespublicacaoMotivo(e.target.value)}
              placeholder="Ex: Solicitação de retirada pelo titular (LGPD) / alteração contratual..."
              className="text-xs"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUnpublishModalOpen(false)}
              disabled={actionLoading}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleUnpublishConfirm}
              disabled={actionLoading}
              className="bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-bold"
            >
              {actionLoading ? 'Processando...' : 'Confirmar Despublicação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Exclusão Definitiva (LGPD) */}
      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Exclusão Definitiva de Dados (LGPD)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Esta ação removerá permanentemente o depoimento, a foto anexada e todos os dados
              pessoais vinculados do banco de dados. Deseja prosseguir?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="text-xs font-bold"
            >
              {deleting ? 'Excluindo...' : 'Confirmar Exclusão Definitiva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
