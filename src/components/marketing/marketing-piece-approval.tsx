import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Loader2,
  CheckCircle,
  XCircle,
  FileCheck,
  Clock,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react'
import { getMkPieces, updateMkPiece, createMkVersion } from '@/services/marketing'
import { MK_PIECE_TYPES, MK_PIECE_STATUS, MK_STATUS_COLORS } from '@/lib/marketing-types'
import type { MkContentPiece } from '@/lib/marketing-types'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { canApprovePiece, canPublishPiece } from '@/lib/marketing-permissions'
import { MarketingVersionHistory } from '@/components/marketing/marketing-version-history'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'

function getNextStatus(piece: MkContentPiece): string | null {
  if (piece.status === 'criacao') return 'revisao_marketing'
  if (piece.status === 'revisao_marketing') return piece.needs_compliance ? 'compliance' : 'gestor'
  if (piece.status === 'compliance') return 'gestor'
  if (piece.status === 'gestor') return 'aprovado'
  return null
}

function getPrevStatus(piece: MkContentPiece): string | null {
  if (piece.status === 'revisao_marketing') return 'criacao'
  if (piece.status === 'compliance') return 'revisao_marketing'
  if (piece.status === 'gestor') return piece.needs_compliance ? 'compliance' : 'revisao_marketing'
  return null
}

const PENDING = ['criacao', 'revisao_marketing', 'compliance', 'gestor']

export function MarketingPieceApproval() {
  const { user, userRole } = useAuth()
  const [items, setItems] = useState<MkContentPiece[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [historyPiece, setHistoryPiece] = useState<MkContentPiece | null>(null)
  const [actionDialog, setActionDialog] = useState<{
    piece: MkContentPiece
    type: 'reject' | 'change'
  } | null>(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setItems(await getMkPieces())
    } catch {
      setItems([])
    }
    setLoading(false)
  }, [])
  useEffect(() => {
    load()
  }, [load])
  useRealtime('mk_content_pieces', () => load())

  const logVersion = async (piece: MkContentPiece, next: string, changeReason: string) => {
    await createMkVersion({
      piece_id: piece.id,
      version: piece.current_version || 1,
      author: (user?.name as string) || '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      change_reason: changeReason,
      approver: (user?.name as string) || '',
      status: next,
    })
  }

  const handleApprove = async (piece: MkContentPiece) => {
    const next = getNextStatus(piece)
    if (!next) return
    try {
      await logVersion(piece, next, `Aprovado: ${piece.status} → ${next}`)
      await updateMkPiece(piece.id, {
        status: next,
        approver_name: (user?.name as string) || '',
        approved_at: new Date().toISOString(),
        rejection_reason: '',
      })
      toast.success('Peça avançada')
      load()
    } catch {
      toast.error('Erro')
    }
  }

  const handlePublish = async (piece: MkContentPiece) => {
    try {
      await logVersion(piece, 'publicado', `Publicado por ${(user?.name as string) || ''}`)
      await updateMkPiece(piece.id, {
        status: 'publicado',
        published_at: new Date().toISOString(),
      })
      toast.success('Peça publicada')
      load()
    } catch {
      toast.error('Erro')
    }
  }

  const handleConfirmAction = async () => {
    if (!actionDialog || !reason.trim()) return
    setSaving(true)
    try {
      const { piece, type } = actionDialog
      if (type === 'reject') {
        await logVersion(piece, 'reprovado', `Reprovado: ${reason}`)
        await updateMkPiece(piece.id, { status: 'reprovado', rejection_reason: reason })
        toast.success('Peça reprovada')
      } else {
        const prev = getPrevStatus(piece)
        if (prev) {
          await logVersion(piece, prev, `Alteração solicitada: ${reason}`)
          await updateMkPiece(piece.id, { status: prev, rejection_reason: reason })
          toast.success('Alteração solicitada')
        }
      }
      setActionDialog(null)
      setReason('')
      load()
    } catch {
      toast.error('Erro')
    }
    setSaving(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const pending = items.filter((p) => PENDING.includes(p.status))
  const approved = items.filter((p) => p.status === 'aprovado')
  const display = [...pending, ...approved]

  const stats = [
    { label: 'Pendentes', value: pending.length, icon: Clock, color: 'text-amber-600' },
    {
      label: 'Aprovadas',
      value: items.filter((p) => p.status === 'aprovado').length,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      label: 'Publicadas',
      value: items.filter((p) => p.status === 'publicado').length,
      icon: FileCheck,
      color: 'text-emerald-600',
    },
    {
      label: 'Reprovadas',
      value: items.filter((p) => p.status === 'reprovado').length,
      icon: XCircle,
      color: 'text-red-600',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#005B2E]">Central de Aprovação de Peças</h2>
        <div className="flex items-center rounded-lg border p-0.5 bg-muted/40">
          <Button
            size="sm"
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            className={`h-8 px-2.5 text-xs ${viewMode === 'table' ? 'bg-[#005B2E] text-white hover:bg-[#01361D]' : ''}`}
            onClick={() => setViewMode('table')}
            title="Visualização em Tabela"
          >
            <TableIcon className="w-4 h-4 mr-1" /> Tabela
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            className={`h-8 px-2.5 text-xs ${viewMode === 'cards' ? 'bg-[#005B2E] text-white hover:bg-[#01361D]' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Visualização em Cards"
          >
            <LayoutGrid className="w-4 h-4 mr-1" /> Cards
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-3">
              <s.icon className={cn('w-5 h-5 mb-1', s.color)} />
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {viewMode === 'table' ? (
        <JetroTable
          screenId="marketing.aprovacao_pecas"
          columns={[
            {
              id: 'version',
              header: 'Versão',
              accessorKey: 'current_version',
              dataType: 'number',
              defaultWidth: 90,
              cell: ({ row }) => (
                <span className="font-mono text-xs text-[#C89B3C] font-bold">
                  v{row.current_version || 1}
                </span>
              ),
            },
            {
              id: 'title',
              header: 'Título',
              accessorKey: 'title',
              dataType: 'text',
              defaultWidth: 260,
              cell: ({ row }) => (
                <div>
                  <span className="font-semibold text-sm">{row.title}</span>
                  {row.rejection_reason && (
                    <p className="text-xs text-red-600 truncate">Motivo: {row.rejection_reason}</p>
                  )}
                </div>
              ),
            },
            {
              id: 'type',
              header: 'Tipo',
              accessorKey: 'type',
              dataType: 'text',
              defaultWidth: 140,
              getSortValue: (row) =>
                MK_PIECE_TYPES.find((t) => t.value === row.type)?.label || row.type,
              cell: ({ row }) => (
                <span className="text-xs">
                  {MK_PIECE_TYPES.find((t) => t.value === row.type)?.label || row.type}
                </span>
              ),
            },
            {
              id: 'compliance',
              header: 'Compliance',
              accessorKey: 'needs_compliance',
              dataType: 'boolean',
              align: 'center',
              defaultWidth: 120,
              cell: ({ value }) =>
                value ? (
                  <Badge variant="outline" className="text-[10px]">
                    Requer
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">Não</span>
                ),
            },
            {
              id: 'status',
              header: 'Status',
              accessorKey: 'status',
              dataType: 'text',
              defaultWidth: 140,
              getSortValue: (row) =>
                MK_PIECE_STATUS.find((s) => s.value === row.status)?.label || row.status,
              cell: ({ row }) => (
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded font-medium',
                    MK_STATUS_COLORS[row.status] || 'bg-gray-100',
                  )}
                >
                  {MK_PIECE_STATUS.find((s) => s.value === row.status)?.label || row.status}
                </span>
              ),
            },
            {
              id: 'actions',
              header: 'Ações',
              sortable: false,
              hideable: false,
              resizable: false,
              draggable: false,
              defaultWidth: 260,
              cell: ({ row: p }) => (
                <div className="flex flex-wrap gap-1">
                  {canApprovePiece(userRole) && p.status !== 'aprovado' && (
                    <Button
                      size="sm"
                      className="bg-[#005B2E] hover:bg-[#01361D] text-xs h-7 px-2"
                      onClick={() => handleApprove(p)}
                    >
                      Aprovar
                    </Button>
                  )}
                  {canApprovePiece(userRole) && getPrevStatus(p) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2"
                      onClick={() => {
                        setActionDialog({ piece: p, type: 'change' })
                        setReason('')
                      }}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" /> Alterar
                    </Button>
                  )}
                  {canPublishPiece(userRole) && p.status === 'aprovado' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2"
                      onClick={() => handlePublish(p)}
                    >
                      Publicar
                    </Button>
                  )}
                  {canApprovePiece(userRole) &&
                    p.status !== 'aprovado' &&
                    p.status !== 'publicado' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 text-xs h-7 px-2"
                        onClick={() => {
                          setActionDialog({ piece: p, type: 'reject' })
                          setReason('')
                        }}
                      >
                        Rejeitar
                      </Button>
                    )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7 px-2"
                    onClick={() => setHistoryPiece(p)}
                  >
                    Versões
                  </Button>
                </div>
              ),
            },
          ]}
          data={display}
          emptyMessage="Nenhuma peça pendente de aprovação."
          exportTitle="Central de Aprovação de Peças — Marketing Jetro"
          exportFilename="aprovacao-pecas-marketing.xlsx"
        />
      ) : display.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <FileCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma peça pendente.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {display.map((p) => (
            <Card
              key={p.id}
              className={cn(
                'border-l-4',
                p.status === 'aprovado' ? 'border-green-400' : 'border-amber-400',
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-[#C89B3C]">
                    v{p.current_version || 1}
                  </span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded',
                      MK_STATUS_COLORS[p.status] || 'bg-gray-100',
                    )}
                  >
                    {MK_PIECE_STATUS.find((s) => s.value === p.status)?.label || p.status}
                  </span>
                </div>
                <p className="font-semibold text-sm">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {MK_PIECE_TYPES.find((t) => t.value === p.type)?.label || p.type}
                </p>
                {p.needs_compliance && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    Requer Compliance
                  </Badge>
                )}
                {p.rejection_reason && (
                  <p className="text-xs text-red-600 mt-1">Motivo: {p.rejection_reason}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {canApprovePiece(userRole) && p.status !== 'aprovado' && (
                    <Button
                      size="sm"
                      className="bg-[#005B2E] hover:bg-[#01361D] text-xs"
                      onClick={() => handleApprove(p)}
                    >
                      Aprovar
                    </Button>
                  )}
                  {canApprovePiece(userRole) && getPrevStatus(p) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => {
                        setActionDialog({ piece: p, type: 'change' })
                        setReason('')
                      }}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" /> Solicitar Alteração
                    </Button>
                  )}
                  {canPublishPiece(userRole) && p.status === 'aprovado' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handlePublish(p)}
                    >
                      Publicar
                    </Button>
                  )}
                  {canApprovePiece(userRole) &&
                    p.status !== 'aprovado' &&
                    p.status !== 'publicado' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 text-xs"
                        onClick={() => {
                          setActionDialog({ piece: p, type: 'reject' })
                          setReason('')
                        }}
                      >
                        Rejeitar
                      </Button>
                    )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setHistoryPiece(p)}
                  >
                    Versões
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {historyPiece && (
        <MarketingVersionHistory piece={historyPiece} onClose={() => setHistoryPiece(null)} />
      )}
      <Dialog
        open={!!actionDialog}
        onOpenChange={(open) => {
          if (!open) {
            setActionDialog(null)
            setReason('')
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {actionDialog?.type === 'reject' ? 'Rejeitar Peça' : 'Solicitar Alteração'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>
                {actionDialog?.type === 'reject' ? 'Motivo da Reprovação' : 'Motivo da Alteração'}
              </Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialog(null)
                setReason('')
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={saving || !reason.trim()}
              className={
                actionDialog?.type === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-[#005B2E] hover:bg-[#01361D]'
              }
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
