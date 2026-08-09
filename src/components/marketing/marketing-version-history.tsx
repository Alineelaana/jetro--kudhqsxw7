import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { getMkVersions } from '@/services/marketing'
import { MK_STATUS_COLORS } from '@/lib/marketing-types'
import type { MkContentPiece } from '@/lib/marketing-types'
import { cn } from '@/lib/utils'

interface Props {
  piece: MkContentPiece
  onClose: () => void
}

export function MarketingVersionHistory({ piece, onClose }: Props) {
  const [versions, setVersions] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMkVersions(piece.id)
      .then(setVersions)
      .catch(() => setVersions([]))
      .finally(() => setLoading(false))
  }, [piece.id])

  return (
    <Card className="border-2 border-[#005B2E]/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm text-[#005B2E]">Histórico de Versões — {piece.title}</h3>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 text-[#005B2E] animate-spin" />
          </div>
        ) : versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma versão registrada.</p>
        ) : (
          <div className="space-y-2">
            {versions.map((v, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-3 text-xs border-b pb-2 last:border-b-0"
              >
                <span className="font-bold text-[#005B2E]">v{v.version}</span>
                <span>{v.author || '—'}</span>
                <span className="text-muted-foreground">
                  {v.date} {v.time || ''}
                </span>
                <span className="text-muted-foreground">{v.change_reason || ''}</span>
                <span className="text-muted-foreground">Aprovador: {v.approver || '—'}</span>
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
  )
}
