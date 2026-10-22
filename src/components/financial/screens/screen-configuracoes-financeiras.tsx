import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CADASTROS_CONFIG } from '@/lib/cadastros-config'
import { CadastroStandardScreen } from '@/components/cadastros/cadastro-standard-screen'
import { ExportActions } from '@/components/shared/export-actions'
import {
  Landmark,
  CreditCard,
  FolderTree,
  Target,
  Percent,
  Sliders,
  ShieldAlert,
  Layers,
  Settings2,
  Bell,
  Scale,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'

export function ScreenConfiguracoesFinanceiras() {
  const [activeTab, setActiveTab] = useState('contas_bancarias')

  // Parâmetros de Juros, Multas e Descontos
  const [jurosRules, setJurosRules] = useState({
    multaPadraoPercent: '2.0',
    jurosMoraMensalPercent: '1.0',
    diasToleranciaCarencia: '0',
    descontoPontualidadePercent: '3.0',
    diasAntecedenciaDesconto: '5',
  })

  // Parâmetros de Régua de Cobrança
  const [cobrancaParams, setCobrancaParams] = useState({
    diasAntesVencimento: '3',
    diasAposVencimento1: '5',
    diasAposVencimento2: '15',
    canalPrincipal: 'WhatsApp e E-mail',
    bloqueioCreditoDias: '30',
  })

  // Parâmetros de Alçadas de Aprovação
  const [alcadaParams, setAlcadaParams] = useState({
    limiteSupervisor: '5000.00',
    limiteGerente: '25000.00',
    limiteDiretoria: '100000.00',
    exigeDuplaAssinaturaAcimaDe: '50000.00',
  })

  // Integrações Bancárias
  const [integracoes, setIntegracoes] = useState({
    layoutCnabPadrao: 'CNAB 240 Febraban',
    ambientePix: 'Produção (Chave Direta Banco)',
    webhookAtivo: true,
  })

  // Configurações dos 8 Cadastros de Apoio Financeiro
  const cfgBancos = CADASTROS_CONFIG['bancos']
  const cfgContas = CADASTROS_CONFIG['contas_bancarias']
  const cfgFormas = CADASTROS_CONFIG['formas_pagamento']
  const cfgCondicoes = CADASTROS_CONFIG['condicoes_pagamento']
  const cfgCategorias = CADASTROS_CONFIG['categorias']
  const cfgSubcategorias = CADASTROS_CONFIG['subcategorias']
  const cfgPlanoContas = CADASTROS_CONFIG['plano_contas']
  const cfgCentrosCusto = CADASTROS_CONFIG['centros_custo']

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-[#005B2E]" />
            Configurações e Parâmetros Financeiros
          </h2>
          <p className="text-xs text-muted-foreground">
            Centralização técnica dos 8 cadastros financeiros fundamentais, alçadas, regras de juros
            e integrações bancárias.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportActions
            data={[{ Aba: activeTab, Modulo: 'Configurações Financeiras' }]}
            filenamePrefix="configuracoes-financeiras"
            pdfTitle="Parâmetros e Configurações Financeiras"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="contas_bancarias"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Landmark className="w-3.5 h-3.5 mr-1.5" /> Contas & Bancos
          </TabsTrigger>
          <TabsTrigger
            value="formas_condicoes"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Formas & Condições
          </TabsTrigger>
          <TabsTrigger
            value="plano_contas"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <FolderTree className="w-3.5 h-3.5 mr-1.5" /> Plano de Contas & Categorias
          </TabsTrigger>
          <TabsTrigger
            value="centros_custo"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Target className="w-3.5 h-3.5 mr-1.5" /> Centros de Custo
          </TabsTrigger>
          <TabsTrigger
            value="regras_juros"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Percent className="w-3.5 h-3.5 mr-1.5" /> Juros, Multas & Descontos
          </TabsTrigger>
          <TabsTrigger
            value="parametros_cobranca"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Sliders className="w-3.5 h-3.5 mr-1.5" /> Parâmetros de Cobrança
          </TabsTrigger>
          <TabsTrigger
            value="alcadas"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Scale className="w-3.5 h-3.5 mr-1.5" /> Alçadas de Aprovação
          </TabsTrigger>
          <TabsTrigger
            value="integracoes"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" /> Integrações & Conciliação
          </TabsTrigger>
          <TabsTrigger
            value="alertas"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Bell className="w-3.5 h-3.5 mr-1.5" /> Alertas & Auditoria
          </TabsTrigger>
        </TabsList>

        {/* 1. ABA CONTAS BANCÁRIAS E BANCOS */}
        <TabsContent value="contas_bancarias" className="mt-4 space-y-6">
          <div className="border rounded-lg p-4 bg-card space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#005B2E]" /> Cadastro Oficial de Contas Bancárias
            </h3>
            {cfgContas && <CadastroStandardScreen config={cfgContas} />}
          </div>

          <div className="border rounded-lg p-4 bg-card space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#005B2E]" /> Tabela Febraban de Bancos Homologados
            </h3>
            {cfgBancos && <CadastroStandardScreen config={cfgBancos} />}
          </div>
        </TabsContent>

        {/* 2. ABA FORMAS E CONDIÇÕES DE PAGAMENTO */}
        <TabsContent value="formas_condicoes" className="mt-4 space-y-6">
          <div className="border rounded-lg p-4 bg-card space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#005B2E]" /> Formas de Pagamento e Meios de
              Liquidação
            </h3>
            {cfgFormas && <CadastroStandardScreen config={cfgFormas} />}
          </div>

          <div className="border rounded-lg p-4 bg-card space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#005B2E]" /> Condições e Prazos Comerciais (Ex:
              30/60/90)
            </h3>
            {cfgCondicoes && <CadastroStandardScreen config={cfgCondicoes} />}
          </div>
        </TabsContent>

        {/* 3. ABA PLANO DE CONTAS E CATEGORIAS/SUBCATEGORIAS */}
        <TabsContent value="plano_contas" className="mt-4 space-y-6">
          <div className="border rounded-lg p-4 bg-card space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-[#005B2E]" /> Estrutura do Plano de Contas
              Contábil e Financeiro
            </h3>
            {cfgPlanoContas && <CadastroStandardScreen config={cfgPlanoContas} />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-card space-y-4">
              <h4 className="font-bold text-sm text-foreground">Categorias Financeiras</h4>
              {cfgCategorias && <CadastroStandardScreen config={cfgCategorias} />}
            </div>
            <div className="border rounded-lg p-4 bg-card space-y-4">
              <h4 className="font-bold text-sm text-foreground">Subcategorias</h4>
              {cfgSubcategorias && <CadastroStandardScreen config={cfgSubcategorias} />}
            </div>
          </div>
        </TabsContent>

        {/* 4. ABA CENTROS DE CUSTO */}
        <TabsContent value="centros_custo" className="mt-4 space-y-4">
          <div className="border rounded-lg p-4 bg-card space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-[#005B2E]" /> Centros de Custo e Unidades de Negócio
            </h3>
            {cfgCentrosCusto && <CadastroStandardScreen config={cfgCentrosCusto} />}
          </div>
        </TabsContent>

        {/* 5. ABA REGRAS DE JUROS, MULTA E DESCONTOS */}
        <TabsContent value="regras_juros" className="mt-4 space-y-4">
          <div className="p-4 border rounded-lg bg-card space-y-4 max-w-2xl">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#005B2E]" /> Parâmetros Padronizados de Encargos por
              Atraso
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <Label className="text-xs">Multa Moratória Padrão (%)</Label>
                <Input
                  value={jurosRules.multaPadraoPercent}
                  onChange={(e) =>
                    setJurosRules({ ...jurosRules, multaPadraoPercent: e.target.value })
                  }
                  className="h-8 text-xs focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Juros de Mora Mensal (%)</Label>
                <Input
                  value={jurosRules.jurosMoraMensalPercent}
                  onChange={(e) =>
                    setJurosRules({ ...jurosRules, jurosMoraMensalPercent: e.target.value })
                  }
                  className="h-8 text-xs focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tolerância / Carência (Dias)</Label>
                <Input
                  value={jurosRules.diasToleranciaCarencia}
                  onChange={(e) =>
                    setJurosRules({ ...jurosRules, diasToleranciaCarencia: e.target.value })
                  }
                  className="h-8 text-xs focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Desconto de Pontualidade (%)</Label>
                <Input
                  value={jurosRules.descontoPontualidadePercent}
                  onChange={(e) =>
                    setJurosRules({ ...jurosRules, descontoPontualidadePercent: e.target.value })
                  }
                  className="h-8 text-xs focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => toast.success('Parâmetros de juros e encargos salvos com sucesso!')}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white text-xs h-8 font-bold"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" /> Gravar Parâmetros
            </Button>
          </div>
        </TabsContent>

        {/* 6. ABA PARÂMETROS DE COBRANÇA */}
        <TabsContent value="parametros_cobranca" className="mt-4 space-y-4">
          <div className="p-4 border rounded-lg bg-card space-y-4 max-w-2xl text-xs">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#005B2E]" /> Régua de Acionamento Automático de
              Cobrança
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Lembrete Preventivo (Dias antes do Vencimento)</Label>
                <Input
                  value={cobrancaParams.diasAntesVencimento}
                  onChange={(e) =>
                    setCobrancaParams({ ...cobrancaParams, diasAntesVencimento: e.target.value })
                  }
                  className="h-8 text-xs focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">1º Acionamento de Cobrança (Dias após Vencimento)</Label>
                <Input
                  value={cobrancaParams.diasAposVencimento1}
                  onChange={(e) =>
                    setCobrancaParams({ ...cobrancaParams, diasAposVencimento1: e.target.value })
                  }
                  className="h-8 text-xs focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">2º Acionamento Rigoroso (Dias após Vencimento)</Label>
                <Input
                  value={cobrancaParams.diasAposVencimento2}
                  onChange={(e) =>
                    setCobrancaParams({ ...cobrancaParams, diasAposVencimento2: e.target.value })
                  }
                  className="h-8 text-xs focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  Bloqueio Automático de Faturamento (Dias em Atraso)
                </Label>
                <Input
                  value={cobrancaParams.bloqueioCreditoDias}
                  onChange={(e) =>
                    setCobrancaParams({ ...cobrancaParams, bloqueioCreditoDias: e.target.value })
                  }
                  className="h-8 text-xs focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => toast.success('Parâmetros da régua de cobrança gravados!')}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white text-xs h-8 font-bold"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" /> Salvar Régua de Cobrança
            </Button>
          </div>
        </TabsContent>

        {/* 7. ABA ALÇADAS DE APROVAÇÃO */}
        <TabsContent value="alcadas" className="mt-4 space-y-4">
          <div className="p-4 border rounded-lg bg-card space-y-4 max-w-2xl text-xs">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#005B2E]" /> Limites e Alçadas por Perfil de Usuário
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <span className="font-bold text-foreground">Alçada Nível 1 — Supervisores</span>
                  <p className="text-muted-foreground">
                    Aprovação direta de contas a pagar operacionais
                  </p>
                </div>
                <div className="w-36">
                  <Input
                    value={alcadaParams.limiteSupervisor}
                    onChange={(e) =>
                      setAlcadaParams({ ...alcadaParams, limiteSupervisor: e.target.value })
                    }
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <span className="font-bold text-foreground">
                    Alçada Nível 2 — Gerência Financeira
                  </span>
                  <p className="text-muted-foreground">
                    Aprovação de despesas intermediárias e compras
                  </p>
                </div>
                <div className="w-36">
                  <Input
                    value={alcadaParams.limiteGerente}
                    onChange={(e) =>
                      setAlcadaParams({ ...alcadaParams, limiteGerente: e.target.value })
                    }
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <span className="font-bold text-foreground">
                    Alçada Nível 3 — Diretoria Executiva
                  </span>
                  <p className="text-muted-foreground">
                    Grandes desembolsos, investimentos e contratos
                  </p>
                </div>
                <div className="w-36">
                  <Input
                    value={alcadaParams.limiteDiretoria}
                    onChange={(e) =>
                      setAlcadaParams({ ...alcadaParams, limiteDiretoria: e.target.value })
                    }
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => toast.success('Alçadas de aprovação atualizadas.')}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white text-xs h-8 font-bold"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" /> Atualizar Alçadas
            </Button>
          </div>
        </TabsContent>

        {/* 8. ABA INTEGRAÇÕES E CONCILIAÇÃO */}
        <TabsContent value="integracoes" className="mt-4 space-y-4">
          <div className="p-4 border rounded-lg bg-card space-y-4 max-w-2xl text-xs">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#005B2E]" /> Layouts e Protocolos Bancários
            </h3>

            <div className="space-y-3">
              <div className="p-3 border rounded-md">
                <span className="font-bold text-foreground">Layout de Remessa e Retorno CNAB</span>
                <p className="text-muted-foreground mt-1">
                  Padrão ativo: Febraban 240 posições para cobrança e pagamento a fornecedores.
                </p>
              </div>

              <div className="p-3 border rounded-md">
                <span className="font-bold text-foreground">
                  Regras de Tolerância da Conciliação Automática
                </span>
                <p className="text-muted-foreground mt-1">
                  Bloqueio de tolerância centavos: R$ 0,00 | Tolerância temporal: ± 2 dias úteis.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 9. ABA ALERTAS E AUDITORIA */}
        <TabsContent value="alertas" className="mt-4 space-y-4">
          <div className="p-4 border rounded-lg bg-card space-y-3 text-xs max-w-2xl">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#005B2E]" /> Notificações Automáticas e Gatilhos do
              Sistema
            </h3>

            <div className="space-y-2">
              <div className="p-3 border rounded-md flex items-center justify-between">
                <span>Alertar pagamentos aguardando aprovação de alçada há mais de 24h</span>
                <Badge className="bg-emerald-600 text-white text-[10px]">Ativo</Badge>
              </div>
              <div className="p-3 border rounded-md flex items-center justify-between">
                <span>Notificar títulos a receber vencidos no dia</span>
                <Badge className="bg-emerald-600 text-white text-[10px]">Ativo</Badge>
              </div>
              <div className="p-3 border rounded-md flex items-center justify-between">
                <span>Sinalizar títulos sem centro de custo ou plano de contas atribuído</span>
                <Badge className="bg-emerald-600 text-white text-[10px]">Ativo</Badge>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
