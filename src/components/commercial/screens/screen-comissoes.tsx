import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Percent,
  Calculator,
  Trophy,
  Building2,
  ExternalLink,
  Sliders,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBrand } from '@/hooks/use-brand'
import { CommissionRulesPanel } from '@/components/commission-rules-panel'
import ComissaoAnaliticaPage from '@/pages/sales/ComissaoAnaliticaPage'
import PremiacoesPage from '@/pages/sales/PremiacoesPage'

export function ScreenComissoes() {
  const navigate = useNavigate()
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('regras')

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Comissões Comerciais
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Remuneração Comercial
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Parametrização de regras de comissionamento por papel/faixa, apuração e fechamento de
              período e gestão de premiações comerciais.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/admin/comissao-analitica')}
            className="text-xs font-semibold border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Comissão Analítica Completa
          </Button>
        </div>
      </div>

      {/* ABAS */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-3 max-w-lg h-auto gap-1">
          <TabsTrigger value="regras" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Regras de Comissão</span>
          </TabsTrigger>
          <TabsTrigger
            value="apuracao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>Apuração e Fechamento</span>
          </TabsTrigger>
          <TabsTrigger
            value="premiacoes"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Premiações</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: REGRAS DE COMISSÃO */}
        <TabsContent value="regras" className="space-y-4">
          <CommissionRulesPanel />
        </TabsContent>

        {/* ABA 2: APURAÇÃO E FECHAMENTO (renderiza motor analítico de conferência e fechamento) */}
        <TabsContent value="apuracao" className="space-y-4">
          <ComissaoAnaliticaPage />
        </TabsContent>

        {/* ABA 3: PREMIAÇÕES */}
        <TabsContent value="premiacoes" className="space-y-4">
          <PremiacoesPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}
