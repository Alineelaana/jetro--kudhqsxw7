import { useState } from 'react'
import {
  Compass,
  Sparkles,
  Send,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Workflow,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { askSegundoCerebro } from '@/services/segundo-cerebro'

const STRATEGIC_SCENARIOS = [
  'Estamos avaliando substituir nosso ERP atual. Quais pontos precisamos considerar com base nos nossos processos documentados?',
  'Queremos unificar a alçada de desconto do televendas com a do varejo físico. Quais os impactos e riscos?',
  'Qual é a viabilidade de terceirizar 100% da frota logística mantendo os SLAs de entrega?',
  'Como expandir a produção sem comprometer a conformidade fiscal e normas de auditoria interna?',
]

export function SegundoCerebroAdvisor() {
  const { toast } = useToast()
  const [dilemma, setDilemma] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [citations, setCitations] = useState<
    Array<{ id?: string; title?: string; path?: string; area?: string; excerpt?: string }>
  >([])

  const handleAnalyze = async (textToUse?: string) => {
    const text = (textToUse || dilemma).trim()
    if (!text || loading) return

    setLoading(true)
    setAnalysis(null)
    setCitations([])

    try {
      const response = await askSegundoCerebro({
        message: text,
        mode: 'conselheiro',
      })
      setAnalysis(response.content)
      setCitations(response.citations || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na avaliação'
      toast({
        title: 'Não foi possível gerar parecer do conselheiro',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Apresentação do Conselheiro */}
      <Card className="p-5 bg-linear-to-r from-stone-900 via-stone-800 to-[#005B2E]/90 text-white border-0 shadow-md">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-[#C9A227]/40 flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6 text-[#E4C46A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Conselheiro Estratégico Corporativo</h2>
              <span className="text-[10px] font-semibold bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#E4C46A] px-2 py-0.5 rounded-full uppercase">
                Apoio à Decisão Executiva
              </span>
            </div>
            <p className="text-xs text-stone-200 mt-1 max-w-3xl leading-relaxed">
              Apresente uma ideia, dilema ou decisão corporativa. A IA cruza o histórico
              documentado, decisões anteriores, riscos, impactos financeiros e operacionais e
              dependências técnicas, diferenciando rigorosamente fatos registrados de hipóteses.{' '}
              <strong>A IA nunca decide nem executa</strong> — apenas subsidia a liderança.
            </p>
          </div>
        </div>
      </Card>

      {/* Caixa de Entrada do Dilema */}
      <Card className="p-5 bg-white border border-gray-200 shadow-2xs space-y-3">
        <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
          Apresente sua ideia, problema ou decisão a avaliar:
        </label>
        <Textarea
          value={dilemma}
          onChange={(e) => setDilemma(e.target.value)}
          placeholder="Ex.: Estamos avaliando substituir nosso ERP atual. Quais pontos precisamos considerar com base nos nossos documentos, atas e políticas?"
          rows={3}
          className="text-sm border-gray-300 focus-visible:ring-[#005B2E]"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#005B2E]" />
            Estrutura analítica em 8 dimensões com fontes citadas
          </div>
          <Button
            onClick={() => handleAnalyze()}
            disabled={!dilemma.trim() || loading}
            className="bg-[#005B2E] hover:bg-[#004724] text-white font-semibold text-xs px-5 shadow-xs"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Estruturando Parecer...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C9A227]" />
                Emitir Parecer Estratégico
              </span>
            )}
          </Button>
        </div>

        {/* Cenários Rápidos para Teste */}
        <div className="pt-3 border-t border-gray-100">
          <span className="text-[11px] font-semibold text-gray-500 block mb-2">
            Ou escolha um cenário estratégico frequente:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {STRATEGIC_SCENARIOS.map((sc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDilemma(sc)
                  handleAnalyze(sc)
                }}
                disabled={loading}
                className="text-left p-2.5 rounded-lg border border-gray-200 hover:border-[#005B2E] hover:bg-[#005B2E]/5 text-xs text-gray-700 transition-colors disabled:opacity-50"
              >
                ⚖️ {sc}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Exibição do Parecer Estruturado */}
      {analysis && (
        <Card className="p-6 bg-white border border-[#005B2E]/40 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#005B2E]" />
              <h3 className="text-base font-bold text-[#005B2E]">
                Parecer do Conselheiro Estratégico
              </h3>
            </div>
            <span className="text-[11px] bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md font-medium">
              Avaliação Consultiva Jetro
            </span>
          </div>

          {/* Destaque das 3 Categorias de Rotulagem Obrigatória */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-stone-50 border border-stone-200 text-[11px]">
            <div className="flex items-center gap-1.5 text-blue-800">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <strong>[DADO OPERACIONAL DO ERP]</strong>: Fatos de vendas/financeiro.
            </div>
            <div className="flex items-center gap-1.5 text-[#005B2E]">
              <span className="w-2 h-2 rounded-full bg-[#005B2E]" />
              <strong>[INFORMAÇÃO DOCUMENTADA]</strong>: Diretrizes e atas vigentes.
            </div>
            <div className="flex items-center gap-1.5 text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <strong>[INTERPRETAÇÃO DA IA]</strong>: Sugestões e riscos inferidos.
            </div>
          </div>

          {/* Conteúdo completo da análise */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800 space-y-4">
            {analysis}
          </div>

          {/* Citações com fontes */}
          {citations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-xs font-bold text-gray-700 block mb-2">
                Fontes e Documentos Referenciados:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {citations.map((cite, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-md bg-stone-50 border border-stone-200 text-xs"
                  >
                    <p className="font-semibold text-gray-900">
                      {cite.title || 'Documento corporativo'}
                    </p>
                    {cite.path && <p className="text-[10px] text-gray-500 truncate">{cite.path}</p>}
                    {cite.excerpt && (
                      <p className="text-[10px] text-gray-600 mt-1 italic">"{cite.excerpt}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
