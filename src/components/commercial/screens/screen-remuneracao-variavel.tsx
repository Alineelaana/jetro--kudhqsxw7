import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  TrendingUp,
  Calculator,
  Award,
  Target,
  Building2,
  Sliders,
  Sparkles,
  BarChart3,
  Users,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { VrApuration } from '@/components/variable-remuneration/vr-apuration'
import { VrSimulator } from '@/components/variable-remuneration/vr-simulator'
import { VrRules } from '@/components/variable-remuneration/vr-rules'
import { VrCampaigns } from '@/components/variable-remuneration/vr-campaigns'
import { VrGoalsDashboard } from '@/components/variable-remuneration/goals/vr-goals-dashboard'
import { VrGoalsManagement } from '@/components/variable-remuneration/goals/vr-goals-management'
import { VrSellerView } from '@/components/variable-remuneration/goals/vr-seller-view'

export function ScreenRemuneracaoVariavel() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('apuracao')

  // Sub-abas internas para manter a tela limpa e modular
  const [apuracaoSubTab, setApuracaoSubTab] = useState<'apuracao' | 'simulador'>('apuracao')
  const [regrasSubTab, setRegrasSubTab] = useState<'regras' | 'campanhas'>('regras')
  const [metasSubTab, setMetasSubTab] = useState<'painel' | 'gestao' | 'vendedor'>('painel')

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
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Remuneração Variável
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Incentivo & Metas Comerciais
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Unificação consolidada das ferramentas de remuneração variável: apuração de
              pagamentos, simulador de cenários, regras com campanhas sazonais e acompanhamento de
              metas comerciais.
            </p>
          </div>
        </div>
      </div>

      {/* 3 ABAS PRINCIPAIS */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-3 max-w-xl h-auto gap-1">
          <TabsTrigger
            value="apuracao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Apuração e Simulador</span>
          </TabsTrigger>
          <TabsTrigger value="regras" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Regras e Campanhas</span>
          </TabsTrigger>
          <TabsTrigger value="metas" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-600" />
            <span>Metas Comerciais</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: APURAÇÃO E SIMULADOR */}
        <TabsContent value="apuracao" className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <button
              type="button"
              onClick={() => setApuracaoSubTab('apuracao')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                apuracaoSubTab === 'apuracao'
                  ? 'bg-[#005B2E] text-white'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Apuração Mensal
            </button>
            <button
              type="button"
              onClick={() => setApuracaoSubTab('simulador')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                apuracaoSubTab === 'simulador'
                  ? 'bg-[#005B2E] text-white'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Simulador de RV
            </button>
          </div>

          {apuracaoSubTab === 'apuracao' ? <VrApuration /> : <VrSimulator />}
        </TabsContent>

        {/* ABA 2: REGRAS E CAMPANHAS */}
        <TabsContent value="regras" className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <button
              type="button"
              onClick={() => setRegrasSubTab('regras')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                regrasSubTab === 'regras'
                  ? 'bg-[#005B2E] text-white'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Regras e Aceleradores
            </button>
            <button
              type="button"
              onClick={() => setRegrasSubTab('campanhas')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                regrasSubTab === 'campanhas'
                  ? 'bg-[#005B2E] text-white'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Campanhas de Incentivo
            </button>
          </div>

          {regrasSubTab === 'regras' ? <VrRules /> : <VrCampaigns />}
        </TabsContent>

        {/* ABA 3: METAS (absorve as telas antigas de metas) */}
        <TabsContent value="metas" className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <button
              type="button"
              onClick={() => setMetasSubTab('painel')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                metasSubTab === 'painel'
                  ? 'bg-[#005B2E] text-white'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Painel de Metas
            </button>
            <button
              type="button"
              onClick={() => setMetasSubTab('gestao')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                metasSubTab === 'gestao'
                  ? 'bg-[#005B2E] text-white'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Gestão e Parâmetros
            </button>
            <button
              type="button"
              onClick={() => setMetasSubTab('vendedor')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                metasSubTab === 'vendedor'
                  ? 'bg-[#005B2E] text-white'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Visão do Vendedor
            </button>
          </div>

          {metasSubTab === 'painel' && <VrGoalsDashboard />}
          {metasSubTab === 'gestao' && <VrGoalsManagement />}
          {metasSubTab === 'vendedor' && <VrSellerView />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
