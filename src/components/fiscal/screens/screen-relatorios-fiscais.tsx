import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  FileSpreadsheet,
  BookOpen,
  Building2,
  Download,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { RelatoriosFiscais } from '@/components/fiscal/relatorios-fiscais'
import { DocumentosFiscais } from '@/components/fiscal/documentos-fiscais'

export function ScreenRelatoriosFiscais() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('livros_registros')

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.razao_social ||
    brand?.nomeExibicao ||
    brand?.empresaNome ||
    'Todas as Empresas'

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Relatórios Fiscais
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Demonstrativos & Exportações Oficiais
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Relatórios consolidados de livros e registros fiscais, comparativos tributários por
              empresa (Dec Eldorado × Gran Romano) e exportações em PDF/Excel.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS INTERNAS */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-1 sm:grid-cols-3 max-w-xl h-auto gap-1">
          <TabsTrigger
            value="livros_registros"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Livros e Registros</span>
          </TabsTrigger>

          <TabsTrigger
            value="comparativos"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Comparativos por Empresa</span>
          </TabsTrigger>

          <TabsTrigger
            value="exportacoes"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>Exportações</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: LIVROS E REGISTROS */}
        <TabsContent value="livros_registros" className="space-y-4">
          <RelatoriosFiscais />
        </TabsContent>

        {/* ABA 2: COMPARATIVOS POR EMPRESA */}
        <TabsContent value="comparativos" className="space-y-4">
          <Card className="border-2 border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Comparativo Fiscal Multitenant
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Análise comparativa de alíquotas, créditos de ICMS, PIS/COFINS e projeções de
                    IBS/CBS entre as empresas ativas.
                  </p>
                </div>
                <Badge variant="outline" className="border-[#005B2E] text-[#005B2E] font-bold">
                  Dec Eldorado × Gran Romano
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Card className="border-2 border-emerald-200 bg-emerald-50/20">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#005B2E]" />
                      Dec Eldorado (ES)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Operações internas com incentivos e CFOP 5101/5102, saídas interestaduais
                      (6101/6102) e Simples/Regime Geral conforme enquadramento.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-indigo-200 bg-indigo-50/20">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      Gran Romano (SP / ES)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Produção e distribuição industrial com apuração de IPI, alíquotas cheias de
                      PIS/COFINS e tributação interestadual parametrizada.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: EXPORTAÇÕES */}
        <TabsContent value="exportacoes" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-base font-bold text-foreground">
                Documentos e Arquivos Fiscais Exportáveis
              </h2>
              <span className="text-xs text-muted-foreground">
                Formatos PDF, Excel e TXT (SPED)
              </span>
            </div>
            <DocumentosFiscais />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
