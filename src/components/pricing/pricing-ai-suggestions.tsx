import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAIAnalysis } from '@/services/pricing-governance'
import { useAuth } from '@/hooks/use-auth'
import { canApprovePrices } from '@/lib/pricing-permissions'
import { formatCurrency } from '@/lib/pricing-types'
import { Loader2, Bot, Sparkles, Check, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface AISuggestion {
  product?: string
  code?: string
  issue?: string
  suggested_price?: string | number
  suggested_margin?: string | number
  suggested_markup?: string | number
  recommended_table?: string
  reason?: string
}

export function PricingAISuggestions() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [analyzed, setAnalyzed] = useState(0)
  const [hasRun, setHasRun] = useState(false)

  const canApprove = canApprovePrices(user?.role as string)

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const result = await getAIAnalysis()
      setSuggestions((result.suggestions as AISuggestion[]) || [])
      setAnalyzed(result.total_analyzed || 0)
      setHasRun(true)
      toast({ title: `${(result.suggestions as AISuggestion[])?.length || 0} sugestões geradas` })
    } catch {
      toast({ title: 'Erro ao analisar com IA', variant: 'destructive' })
    }
    setLoading(false)
  }

  const handleApply = (s: AISuggestion) => {
    if (!canApprove) {
      toast({ title: 'Sem permissão para aprovar', variant: 'destructive' })
      return
    }
    toast({ title: `Sugestão para ${s.product} enviada para aprovação` })
  }

  const issueLabels: Record<string, string> = {
    negative_margin: 'Margem Negativa',
    below_minimum: 'Abaixo do Mínimo',
    no_price: 'Sem Preço',
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardHeader>
          <CardTitle className="text-base text-[#005B2E] flex items-center gap-2">
            <Bot className="w-4 h-4" /> Análise de IA — Formação de Preços
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            A IA analisa produtos com problemas de margem, custo e tributação, e sugere ajustes.
            Nenhuma sugestão é aplicada automaticamente.
          </p>
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Analisando...' : 'Executar Análise IA'}
          </Button>
          {hasRun && (
            <p className="text-xs text-muted-foreground">
              {analyzed} produto(s) analisado(s), {suggestions.length} sugestão(ões) gerada(s).
            </p>
          )}
        </CardContent>
      </Card>
      {suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <Card key={i} className="border-2 border-[#005B2E]/20">
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm">{s.product || '—'}</span>
                      {s.issue && (
                        <Badge variant="outline" className="text-xs border-red-300 text-red-600">
                          {issueLabels[s.issue] || s.issue}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <span>
                        Preço: <strong>R$ {formatCurrency(s.suggested_price || 0)}</strong>
                      </span>
                      <span>
                        Margem: <strong>{formatCurrency(s.suggested_margin || 0)}%</strong>
                      </span>
                      <span>
                        Markup: <strong>{formatCurrency(s.suggested_markup || 0)}x</strong>
                      </span>
                      <span>
                        Tabela: <strong>{s.recommended_table || '—'}</strong>
                      </span>
                    </div>
                    {s.reason && <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApply(s)}
                    disabled={!canApprove}
                    className="border-[#005B2E] text-[#005B2E] shrink-0"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Aprovar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {hasRun && suggestions.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma sugestão gerada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Todos os produtos estão com precificação adequada.
            </p>
          </CardContent>
        </Card>
      )}
      {!hasRun && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Bot className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Execute a análise para ver sugestões</p>
            <p className="text-sm text-muted-foreground mt-1">
              A IA identificará produtos com problemas e sugerirá ajustes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
