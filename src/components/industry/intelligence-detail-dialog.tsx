import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, X, AlertCircle, Lightbulb } from 'lucide-react'
import type {
  IntelligenceAlert,
  IntelligenceRecommendation,
} from '@/lib/industrial-intelligence-types'
import { resolveIntelligence } from '@/services/industrial-intelligence'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  alerts?: IntelligenceAlert[]
  recommendations?: IntelligenceRecommendation[]
  onResolved?: () => void
}

export function IntelligenceDetailDialog({
  open,
  onOpenChange,
  title,
  alerts = [],
  recommendations = [],
  onResolved,
}: Props) {
  const handleResolve = async (
    collection: string,
    id: string,
    action: 'resolve' | 'dismiss' | 'accept' | 'reject',
  ) => {
    try {
      await resolveIntelligence(collection, id, action)
      onResolved?.()
    } catch {
      /* ignore */
    }
  }

  const sevColor: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border-red-300',
    warning: 'bg-amber-100 text-amber-700 border-amber-300',
    info: 'bg-blue-100 text-blue-700 border-blue-300',
  }
  const priColor: Record<string, string> = {
    urgent: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-gray-400 text-white',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#005B2E]" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Badge className={sevColor[a.severity] || ''} variant="outline">
                      {a.severity}
                    </Badge>
                    <Badge className={priColor[a.priority] || ''}>{a.priority}</Badge>
                  </div>
                </div>
                {a.justification && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Justificativa:</strong> {a.justification}
                  </p>
                )}
                {a.expected_impact && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Impacto:</strong> {a.expected_impact}
                  </p>
                )}
                {a.origin && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Origem:</strong> {a.origin}
                  </p>
                )}
                {a.status === 'open' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 text-xs"
                      onClick={() =>
                        handleResolve('industrial_intelligence_alerts', a.id, 'resolve')
                      }
                    >
                      <Check className="w-3 h-3 mr-1" /> Resolver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() =>
                        handleResolve('industrial_intelligence_alerts', a.id, 'dismiss')
                      }
                    >
                      <X className="w-3 h-3 mr-1" /> Dispensar
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {recommendations.map((r) => (
              <div key={r.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> {r.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                  <Badge className={priColor[r.priority] || ''}>{r.priority}</Badge>
                </div>
                {r.justification && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Justificativa:</strong> {r.justification}
                  </p>
                )}
                {r.expected_impact && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Impacto Esperado:</strong> {r.expected_impact}
                  </p>
                )}
                {r.origin && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Origem:</strong> {r.origin}
                  </p>
                )}
                {r.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 text-xs"
                      onClick={() =>
                        handleResolve('industrial_intelligence_recommendations', r.id, 'accept')
                      }
                    >
                      <Check className="w-3 h-3 mr-1" /> Aceitar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() =>
                        handleResolve('industrial_intelligence_recommendations', r.id, 'reject')
                      }
                    >
                      <X className="w-3 h-3 mr-1" /> Rejeitar
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {alerts.length === 0 && recommendations.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhum registro encontrado.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
