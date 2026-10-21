import { useState, useEffect } from 'react'
import {
  XCircle,
  Calendar,
  Clock,
  User,
  AlertCircle,
  RefreshCw,
  Mail,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import type { AgendaInvitation } from '@/types/jetro-agenda'
import {
  fetchRejectedInvitations,
  fetchPendingInvitations,
  acceptInvitation,
  rejectInvitation,
} from '@/services/jetro-agenda'

interface InvitationsManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  initialTab?: 'rejected' | 'pending'
  onRefreshCalendar: () => void
}

export function InvitationsManagementDialog({
  open,
  onOpenChange,
  userId,
  initialTab = 'rejected',
  onRefreshCalendar,
}: InvitationsManagementDialogProps) {
  const [activeTab, setActiveTab] = useState<'rejected' | 'pending'>(initialTab)
  const [rejectedList, setRejectedList] = useState<AgendaInvitation[]>([])
  const [pendingList, setPendingList] = useState<AgendaInvitation[]>([])
  const [loading, setLoading] = useState(false)

  // Modal para recusa com motivo opcional
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [invitationToReject, setInvitationToReject] = useState<AgendaInvitation | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const loadData = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [rejected, pending] = await Promise.all([
        fetchRejectedInvitations(userId),
        fetchPendingInvitations(userId),
      ])
      setRejectedList(rejected)
      setPendingList(pending)
    } catch (err) {
      console.error('Erro ao carregar convites:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, userId])

  // Ação de Aceitar convite
  const handleAccept = async (inv: AgendaInvitation) => {
    setProcessing(true)
    try {
      await acceptInvitation(inv.id)
      toast({
        title: 'Convite aceito',
        description: 'O compromisso permanecerá na sua agenda como confirmado.',
      })
      await loadData()
      onRefreshCalendar()
    } catch (err) {
      console.error('Erro ao aceitar convite:', err)
      toast({
        title: 'Erro ao aceitar convite',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  // Abertura do modal de recusa
  const handleOpenReject = (inv: AgendaInvitation) => {
    setInvitationToReject(inv)
    setRejectionReason('')
    setRejectModalOpen(true)
  }

  // Confirmação de Recusar convite
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitationToReject) return

    setProcessing(true)
    try {
      await rejectInvitation(invitationToReject.id, rejectionReason.trim())
      toast({
        title: 'Convite recusado',
        description:
          'O agendamento foi identificado na cor vermelha e encaminhado para os Convites Recusados.',
        variant: 'destructive',
      })
      setRejectModalOpen(false)
      setInvitationToReject(null)
      await loadData()
      onRefreshCalendar()
    } catch (err) {
      console.error('Erro ao recusar convite:', err)
      toast({
        title: 'Erro ao recusar convite',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between pr-4">
              <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-sky-600" />
                Gestão de Convites para Compromissos
              </DialogTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={loadData}
                className="h-7 w-7 p-0 text-gray-500"
                title="Recarregar"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Visualize convites recebidos, confirme sua presença ou consulte os compromissos
              recusados.
            </p>
          </DialogHeader>

          {/* Abas: Convites Recusados (Destaque da regra) vs Convites Pendentes */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('rejected')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'rejected'
                  ? 'bg-red-100 text-red-900 border border-red-300 shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              Convites Recusados ({rejectedList.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-sky-100 text-sky-900 border border-sky-300 shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              Convites Pendentes ({pendingList.length})
            </button>
          </div>

          {/* Conteúdo da Aba 1: Convites Recusados */}
          {activeTab === 'rejected' && (
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Área: Convites Recusados</span>
                  <p className="text-[11px] text-red-800 mt-0.5">
                    Todos os convites de compromissos recusados são identificados na{' '}
                    <strong>cor vermelha</strong> e preservados aqui para consulta e histórico de
                    auditoria.
                  </p>
                </div>
              </div>

              {rejectedList.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500 rounded-lg border border-dashed border-gray-200">
                  <XCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  Nenhum convite recusado encontrado.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {rejectedList.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 transition-colors shadow-2xs space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                          <h4 className="text-xs sm:text-sm font-bold text-red-950">
                            {inv.appointment?.title || 'Compromisso'}
                          </h4>
                          <Badge className="bg-red-600 text-white text-[10px] font-bold">
                            Recusado (Vermelho)
                          </Badge>
                        </div>

                        {inv.responded_at && (
                          <span className="text-[10px] text-red-700 font-medium">
                            Recusado em: {new Date(inv.responded_at).toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-red-100">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-red-600" />
                          <span>
                            Data: <strong>{inv.appointment?.date || 'Não informada'}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock className="w-3.5 h-3.5 text-red-600" />
                          <span>
                            Horário: <strong>{inv.appointment?.start_time || 'Dia inteiro'}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <User className="w-3.5 h-3.5 text-red-600" />
                          <span>
                            Convidado por: <strong>{inv.invited_by_name || 'Organizador'}</strong>
                          </span>
                        </div>
                        {inv.appointment?.type && (
                          <div className="text-gray-600">
                            Tipo: <strong>{inv.appointment.type}</strong>
                          </div>
                        )}
                      </div>

                      {inv.rejection_reason && (
                        <div className="text-[11px] text-red-900 bg-white/80 p-2 rounded border border-red-200">
                          <strong>Motivo da recusa:</strong> {inv.rejection_reason}
                        </div>
                      )}

                      {/* Opção para reverter e aceitar se o usuário desejar */}
                      <div className="flex justify-end pt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={processing}
                          onClick={() => handleAccept(inv)}
                          className="h-7 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          Reverter e Aceitar Convite
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Conteúdo da Aba 2: Convites Pendentes */}
          {activeTab === 'pending' && (
            <div className="space-y-3 pt-2">
              {pendingList.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500 rounded-lg border border-dashed border-gray-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  Nenhum convite pendente. Todos os seus convites foram respondidos!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingList.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 rounded-xl border border-sky-200 bg-sky-50/60 shadow-2xs space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                            {inv.appointment?.title || 'Compromisso'}
                          </h4>
                          <Badge
                            variant="outline"
                            className="bg-sky-100 text-sky-800 border-sky-300 text-[10px]"
                          >
                            Aguardando resposta
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-sky-100">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-sky-600" />
                          <span>
                            Data: <strong>{inv.appointment?.date || 'Não informada'}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          <span>
                            Horário: <strong>{inv.appointment?.start_time || 'Dia todo'}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <User className="w-3.5 h-3.5 text-sky-600" />
                          <span>
                            Convidado por: <strong>{inv.invited_by_name || 'Colega'}</strong>
                          </span>
                        </div>
                        {inv.appointment?.type && (
                          <div className="text-gray-600">
                            Tipo: <strong>{inv.appointment.type}</strong>
                          </div>
                        )}
                      </div>

                      {/* Botões Aceitar / Recusar especificados no pedido */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          disabled={processing}
                          onClick={() => handleOpenReject(inv)}
                          className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white font-bold"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Recusar Convite
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={processing}
                          onClick={() => handleAccept(inv)}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Aceitar Convite
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Recusa com Motivo */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold text-red-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Recusar Convite de Compromisso
            </DialogTitle>
            <p className="text-xs text-gray-500">
              Ao recusar, o agendamento será identificado na{' '}
              <strong className="text-red-700">cor vermelha</strong> e movido para a área{' '}
              <strong>Convites Recusados</strong> com registro de auditoria.
            </p>
          </DialogHeader>

          {invitationToReject && (
            <form onSubmit={handleConfirmReject} className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-gray-800">
                Compromisso: {invitationToReject.appointment?.title}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rej-reason" className="text-xs font-bold text-gray-700">
                  Motivo da recusa (opcional)
                </Label>
                <Textarea
                  id="rej-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex.: Conflito de agenda, compromisso prioritário, etc."
                  rows={3}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="border-t pt-3 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectModalOpen(false)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={processing}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  Confirmar Recusa (Vermelho)
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
