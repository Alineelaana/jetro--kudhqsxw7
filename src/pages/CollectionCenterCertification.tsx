import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCorporateDocuments } from '@/hooks/use-corporate-documents'
import {
  runCertificationTests,
  type CertificationResult,
} from '@/services/collection-center-certification'
import type { DocumentSection } from '@/lib/corporate-document-engine/types'
import { CheckCircle, XCircle, Play, FileText, Loader2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'

export default function CollectionCenterCertification() {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<CertificationResult | null>(null)
  const { generate } = useCorporateDocuments()

  const handleRun = async () => {
    setLoading(true)
    try {
      const res = await runCertificationTests()
      setResult(res)
      toast({ title: `${res.totalPassed}/${res.totalTests} testes aprovados` })
    } catch (err) {
      toast({ title: 'Erro ao executar certificação', variant: 'destructive' })
    }
    setLoading(false)
  }

  const handleReport = async () => {
    if (!result) return
    setGenerating(true)
    try {
      const sections: DocumentSection[] = result.tests.map((t) => ({
        title: `Caso ${t.case}: ${t.name}`,
        summary: [
          { label: 'Status', value: t.passed ? 'Aprovado' : 'Reprovado' },
          { label: 'Esperado', value: t.expected },
          { label: 'Obtido', value: t.actual },
        ],
        content: `Passos executados:\n${t.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
      }))
      const res = await generate({
        title: 'Relatório de Certificação - Central de Cobrança',
        module: 'Financeiro',
        documentType: 'certificacao_cobranca',
        format: 'pdf',
        sections,
        recordCount: result.tests.length,
      })
      if (res.success) {
        toast({ title: 'Relatório gerado com sucesso' })
      } else {
        toast({ title: 'Erro ao gerar relatório: ' + (res.error || ''), variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Erro ao gerar relatório', variant: 'destructive' })
    }
    setGenerating(false)
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/financeiro/cobrancas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Certificação da Central de Cobrança</h1>
          <p className="text-sm text-muted-foreground">
            Programa oficial de testes - 6 casos obrigatórios
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleRun} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Executar Testes
        </Button>
        {result && (
          <Button variant="outline" onClick={handleReport} disabled={generating}>
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Gerar Relatório PDF
          </Button>
        )}
      </div>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resultado da Certificação</span>
                <Badge
                  variant={result.totalPassed === result.totalTests ? 'default' : 'destructive'}
                >
                  {result.totalPassed}/{result.totalTests} Aprovados
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Executado por: {result.executedBy} em{' '}
              {new Date(result.executedAt).toLocaleString('pt-BR')}
            </CardContent>
          </Card>

          {result.tests.map((t) => (
            <Card key={t.case}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    {t.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    Caso {t.case}: {t.name}
                  </span>
                  <Badge variant={t.passed ? 'default' : 'destructive'}>
                    {t.passed ? 'Aprovado' : 'Reprovado'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Passos executados:
                  </p>
                  <ol className="text-sm list-decimal list-inside space-y-1">
                    {t.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Esperado:</p>
                    <p className="text-sm">{t.expected}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Obtido:</p>
                    <p className={`text-sm ${t.passed ? 'text-green-700' : 'text-red-700'}`}>
                      {t.actual}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
