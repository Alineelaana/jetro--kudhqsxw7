import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  CalendarClock,
  Clock,
  ShieldAlert,
  GitFork,
  Building2,
  AlertTriangle,
  Layers,
  History,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { StockBatches } from '@/components/stock/stock-batches'
import { StockExpiry } from '@/components/stock/stock-expiry'
import { ValidityAlertsCenter } from '@/components/validity/validity-alerts-center'
import { ValidityDashboard } from '@/components/validity/validity-dashboard'
import { ValidityRulesConfig } from '@/components/validity/validity-rules-config'
import { ValidityChat } from '@/components/validity/validity-chat'

export function ScreenLotesValidade() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('lotes')

  const empresaAtualNome = useMemo(() => {
    const emp = empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)
    return (
      emp?.nome_fantasia ||
      emp?.razao_social ||
      brand?.nomeExibicao ||
      brand?.empresaNome ||
      'Todas as Empresas'
    )
  }, [empresasDisponiveis, empresaAtivaId, brand])

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Lotes e Validade
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Controle de Validade, Lotes & FEFO
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Gestão integrada de lotes fabris e recebidos, expiração de validades (FEFO), bloqueios
              sanitários e da qualidade, alertas preventivos e rastreabilidade genealógica completa.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS DA TELA CONFORME ESPECIFICAÇÃO:
          1. Lotes (entrada/saída, saldo por lote)
          2. Validade (bloqueio por vencimento, janelas de alerta, FEFO)
          3. Bloqueios e Liberações da qualidade
          4. Rastreabilidade de lote */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 md:grid-cols-4 max-w-3xl h-auto gap-1">
          <TabsTrigger value="lotes" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Saldos por Lote</span>
          </TabsTrigger>
          <TabsTrigger
            value="validade"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-orange-600" />
            <span>Validade & FEFO</span>
          </TabsTrigger>
          <TabsTrigger
            value="bloqueios"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            <span>Bloqueios & Qualidade</span>
          </TabsTrigger>
          <TabsTrigger
            value="rastreabilidade"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <GitFork className="w-3.5 h-3.5 text-blue-600" />
            <span>Rastreabilidade de Lote</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: LOTES (ENTRADA/SAÍDA, SALDO POR LOTE) */}
        <TabsContent value="lotes" className="space-y-4">
          <StockBatches />
        </TabsContent>

        {/* ABA 2: VALIDADE (BLOQUEIO POR VENCIMENTO, JANELAS DE ALERTA, FEFO) - ABSORVE O MÓDULO VALIDADE */}
        <TabsContent value="validade" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Monitor FEFO e Curva de Vencimento do Estoque */}
            <Card className="border-2 border-[#005B2E]/20 p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <h3 className="text-sm font-bold text-foreground">
                    Controle de Vencimento & Estratégia FEFO (First-Expired, First-Out)
                  </h3>
                </div>
              </div>
              <StockExpiry />
            </Card>

            {/* Painel e Central de Alertas de Vencimento Absorvidos */}
            <Card className="border-2 border-[#005B2E]/20 p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-foreground">
                    Central de Alertas & Janelas de Vencimento
                  </h3>
                </div>
              </div>
              <ValidityAlertsCenter />
            </Card>
          </div>
        </TabsContent>

        {/* ABA 3: BLOQUEIOS E LIBERAÇÕES DA QUALIDADE */}
        <TabsContent value="bloqueios" className="space-y-4">
          <div className="space-y-4">
            <Card className="border-2 border-purple-200 bg-purple-50/20 p-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-semibold text-purple-950">
                  Gerenciamento de Bloqueios e Liberações: Lotes marcados como "Bloqueado",
                  "Quarentena" ou "Rejeitado" não podem ser empenhados nem expedidos no WMS.
                </span>
              </div>
            </Card>
            <StockBatches filterBloqueados />
          </div>
        </TabsContent>

        {/* ABA 4: RASTREABILIDADE DE LOTE */}
        <TabsContent value="rastreabilidade" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-2 border-[#005B2E]/20 p-4 space-y-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  <GitFork className="w-4 h-4 text-[#005B2E]" />
                  <h3 className="text-sm font-bold text-foreground">
                    Linha do Tempo e Genealogia do Lote
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Acompanhamento de toda a cadeia do lote: da nota fiscal de entrada do fornecedor,
                  ordens de produção vinculadas, inspeções de qualidade, até a nota fiscal de
                  expedição ao cliente final.
                </p>
                <StockBatches showTraceabilityView />
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-2 border-[#005B2E]/20 p-4 space-y-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  <CalendarClock className="w-4 h-4 text-[#005B2E]" />
                  <h3 className="text-sm font-bold text-foreground">Regras de Vencimento</h3>
                </div>
                <ValidityRulesConfig />
              </Card>

              <Card className="border-2 border-[#005B2E]/20 p-4 space-y-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  <History className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-foreground">Assistente de Validade</h3>
                </div>
                <ValidityChat />
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
