import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CheckCircle, XCircle, FileCheck, Clock } from 'lucide-react'
import { getMkPieces, updateMkPiece, getMkVersions } from '@/services/marketing'
import { MK_PIECE_TYPES, MK_PIECE_STATUS, MK_STATUS_COLORS } from '@/lib/marketing-types'
import type { MkContentPiece } from '@/lib/marketing-types'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { canApprovePiece, canPublishPiece } from '@/lib/marketing-permissions'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function MarketingPieceApproval() {
  const { user, userRole } = useAuth()
  const [items, setItems] = useState<MkContentPiece[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPiece, setSelectedPiece] = useState<MkContentPiece | null>(null)
  const [versions, setVersions] = useState<Record<string, unknown>[]>([])

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

  useEffect(() => {
    if (selectedPiece) {
      getMkVersions(selectedPiece.id)
        .then(setVersions)
        .catch(() => setVersions([]))
    }
  }, [selectedPiece])

  const handleApprove = async (piece: MkContentPiece) => {
    const flow: Record<string, string> = {
      criacao: 'revisao_marketing',
      revisao_marketing: 'gestor',
      compliance: 'gestor',
      gestor: 'aprovado',
    }
    const next = flow[piece.status]
    if (!next) return
    try {
      await updateMkPiece(piece.id, {
        status: next,
        approver_name: (user?.name as string) || '',
        approved_at: new Date().toISOString(),
      })
      toast.success('Peça avançada')
      load()
    } catch {
      toast.error('Erro')
    }
  }

  const handlePublish = async (piece: MkContentPiece) => {
    try {
      await updateMkPiece(piece.id, { status: 'publicado', published_at: new Date().toISOString() })
      toast.success('Peça publicada')
      load()
    } catch {
      toast.error('Erro')
    }
  }

  const handleReject = async (piece: MkContentPiece) => {
    try {
      await updateMkPiece(piece.id, { status: 'reprovado' })
      load()
    } catch {
      toast.error('Erro')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const pending = items.filter((p) =>
    ['criacao', 'revisao_marketing', 'compliance', 'gestor'].includes(p.status),
  )

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[#005B2E]">Central de Aprovação de Peças</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-3">
            <Clock className="w-5 h-5 text-amber-600 mb-1" />
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="text-lg font-bold">{pending.length}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-3">
            <CheckCircle className="w-5 h-5 text-green-600 mb-1" />
            <p className="text-xs text-muted-foreground">Aprovadas</p>
            <p className="text-lg font-bold">
              {items.filter((p) => p.status === 'aprovado').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-3">
            <FileCheck className="w-5 h-5 text-emerald-600 mb-1" />
            <p className="text-xs text-muted-foreground">Publicadas</p>
            <p className="text-lg font-bold">
              {items.filter((p) => p.status === 'publicado').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-3">
            <XCircle className="w-5 h-5 text-red-600 mb-1" />
            <p className="text-xs text-muted-foreground">Reprovadas</p>
            <p className="text-lg font-bold">
              {items.filter((p) => p.status === 'reprovado').length}
            </p>
          </CardContent>
        </Card>
      </div>
      {pending.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <FileCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma peça pendente.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pending.map((p) => (
            <Card key={p.id} className="border-l-4 border-amber-400">
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
                <div className="flex gap-2 mt-2">
                  {canApprovePiece(userRole) && (
                    <Button
                      size="sm"
                      className="bg-[#005B2E] hover:bg-[#01361D] text-xs"
                      onClick={() => handleApprove(p)}
                    >
                      Aprovar
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 text-xs"
                    onClick={() => handleReject(p)}
                  >
                    Reprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setSelectedPiece(p)}
                  >
                    Versões
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {selectedPiece && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-[#005B2E]">
                Histórico de Versões — {selectedPiece.title}
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setSelectedPiece(null)}>
                Fechar
              </Button>
            </div>
            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma versão registrada.</p>
            ) : (
              <div className="space-y-2">
                {versions.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs border-b pb-2">
                    <span className="font-bold text-[#005B2E]">v{v.version}</span>
                    <span>{v.author || '—'}</span>
                    <span className="text-muted-foreground">
                      {v.date} {v.time || ''}
                    </span>
                    <span className="text-muted-foreground">{v.change_reason || ''}</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded',
                        MK_STATUS_COLORS[v.status as string] || 'bg-gray-100',
                      )}
                    >
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
