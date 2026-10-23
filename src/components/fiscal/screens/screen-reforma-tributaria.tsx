import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  TrendingUp,
  Layers,
  Calculator,
  Calendar,
  Sparkles,
  Building2,
  Sliders,
  CheckCircle,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { ReformaDashboard } from '@/components/fiscal/reforma-dashboard'
import { ReformaSimulador } from '@/components/fiscal/reforma-simulador'
import { FiscalGenericScreen } from '@/components/fiscal/fiscal-generic-screen'
import { REFORM_CONFIG_FIELDS, type FiscalScreenConfig } from '@/lib/fiscal-types'

const REFORM_CONFIG_SCREEN: FiscalScreenConfig = {
  collection: 'reform_configs',
  title: 'Configuração CBS/IBS/Seletivo',
  nameLabel: 'Tributo',
  statusField: 'situacao',
  fields: REFORM_CONFIG_FIELDS,
}

const CLASS_SCREEN: FiscalScreenConfig = {
  collection: 'reform_classifications',
  title: 'Classificação Tributária',
  nameLabel: 'Produto/Serviço',
  statusField: 'situacao',
  fields: [
    { name: 'produto_name', label: 'Produto', type: 'text' },
    { name: 'servico_name', label: 'Serviço', type: 'text' },
    { name: 'codigo', label: 'Código', type: 'text' },
    { name: 'ncm', label: 'NCM', type: 'text' },
    { name: 'cest', label: 'CEST', type: 'text' },
    { name: 'classificacao_atual', label: 'Classificação Atual', type: 'text' },
    { name: 'classificacao_reforma', label: 'Classificação Reforma', type: 'text' },
    { name: 'cbs', label: 'CBS (%)', type: 'text' },
    { name: 'ibs', label: 'IBS (%)', type: 'text' },
    { name: 'imposto_seletivo', label: 'Imposto Seletivo (%)', type: 'text' },
    { name: 'regime_aplicavel', label: 'Regime', type: 'text' },
    { name: 'data_vigencia', label: 'Data Vigência', type: 'date' },
    {
      name: 'situacao',
      label: 'Situação',
      type: 'select',
      options: [
        'Nao Classificado',
        'Em Analise',
        'Classificado',
        'Aguardando Aprovacao',
        'Com Pendencia',
        'Inativo',
      ],
    },
  ],
}

const TRANSITION_SCREEN: FiscalScreenConfig = {
  collection: 'reform_transition',
  title: 'Transição Tributária',
  nameLabel: 'Ano/Período',
  fields: [
    { name: 'ano', label: 'Ano', type: 'text', required: true },
    { name: 'periodo', label: 'Período', type: 'text' },
    { name: 'tributos_atuais', label: 'Tributos Atuais', type: 'textarea', span: 2 },
    { name: 'cbs_aplicavel', label: 'CBS Aplicável', type: 'text' },
    { name: 'ibs_aplicavel', label: 'IBS Aplicável', type: 'text' },
    { name: 'imposto_seletivo_aplicavel', label: 'Imposto Seletivo', type: 'text' },
    { name: 'regra_convivencia', label: 'Regra de Convivência', type: 'textarea', span: 2 },
    { name: 'data_inicial', label: 'Data Inicial', type: 'date' },
    { name: 'data_final', label: 'Data Final', type: 'date' },
  ],
}

const RULES_SCREEN: FiscalScreenConfig = {
  collection: 'reform_rules',
  title: 'Regras Tributárias',
  nameLabel: 'Regra',
  statusField: 'situacao',
  fields: [
    {
      name: 'tipo_regra',
      label: 'Tipo',
      type: 'select',
      required: true,
      options: ['produto', 'servico', 'operacao', 'cliente', 'fornecedor'],
    },
    { name: 'ref_name', label: 'Referência', type: 'text' },
    { name: 'operacao', label: 'Operação', type: 'text' },
    { name: 'tributacao_padrao', label: 'Tributação Padrão', type: 'text' },
    { name: 'aliquota', label: 'Alíquota', type: 'text' },
    { name: 'reducao', label: 'Redução', type: 'text' },
    { name: 'credito', label: 'Crédito', type: 'text' },
    { name: 'imposto_seletivo', label: 'Imposto Seletivo', type: 'text' },
    { name: 'vigencia_inicial', label: 'Vigência Inicial', type: 'date' },
    { name: 'vigencia_final', label: 'Vigência Final', type: 'date' },
    { name: 'situacao', label: 'Situação', type: 'select', options: ['Ativa', 'Inativa'] },
  ],
}

const CREDITS_SCREEN: FiscalScreenConfig = {
  collection: 'reform_credits',
  title: 'Créditos e Débitos',
  nameLabel: 'Documento',
  statusField: 'situacao',
  fields: [
    { name: 'documento', label: 'Documento', type: 'text', required: true },
    { name: 'cliente_fornecedor', label: 'Cliente/Fornecedor', type: 'text' },
    { name: 'tipo_operacao', label: 'Tipo Operação', type: 'text' },
    { name: 'cbs', label: 'CBS', type: 'text' },
    { name: 'ibs', label: 'IBS', type: 'text' },
    { name: 'imposto_seletivo', label: 'Imposto Seletivo', type: 'text' },
    { name: 'credito_permitido', label: 'Crédito Permitido', type: 'text' },
    { name: 'credito_utilizado', label: 'Crédito Utilizado', type: 'text' },
    { name: 'debito_gerado', label: 'Débito Gerado', type: 'text' },
    { name: 'saldo', label: 'Saldo', type: 'text' },
    {
      name: 'situacao',
      label: 'Situação',
      type: 'select',
      options: ['Disponivel', 'Utilizado', 'Bloqueado', 'Compensado'],
    },
  ],
}

export function ScreenReformaTributaria() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('visao_geral')

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
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Reforma Tributária
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Emenda Constitucional 132/2023
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Consolidação completa da Reforma Tributária: visão geral, alíquotas de IBS/CBS e
              Seletivo, cClassTrib, cronograma de transição e simulação de impactos.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS INTERNAS CONFORME ESPECIFICAÇÃO */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-5 max-w-4xl h-auto gap-1">
          <TabsTrigger
            value="visao_geral"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Visão Geral</span>
          </TabsTrigger>

          <TabsTrigger value="ibs_cbs" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>IBS / CBS</span>
          </TabsTrigger>

          <TabsTrigger
            value="cclasstrib"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span>cClassTrib & Regras</span>
          </TabsTrigger>

          <TabsTrigger
            value="transicao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Transição</span>
          </TabsTrigger>

          <TabsTrigger
            value="impactos"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5 text-purple-600" />
            <span>Impactos & Simulador</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: VISÃO GERAL */}
        <TabsContent value="visao_geral" className="space-y-4">
          <ReformaDashboard />
        </TabsContent>

        {/* ABA 2: IBS / CBS E SELETIVO */}
        <TabsContent value="ibs_cbs" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground">
              Configuração de Alíquotas e Tributos
            </h2>
            <FiscalGenericScreen config={REFORM_CONFIG_SCREEN} />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-base font-bold text-foreground">Créditos e Débitos Apurados</h2>
            <FiscalGenericScreen config={CREDITS_SCREEN} />
          </div>
        </TabsContent>

        {/* ABA 3: CCLASSTRIB E REGRAS */}
        <TabsContent value="cclasstrib" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground">
              Classificação Tributária por Produto (cClassTrib)
            </h2>
            <FiscalGenericScreen config={CLASS_SCREEN} />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-base font-bold text-foreground">Regras Tributárias da Reforma</h2>
            <FiscalGenericScreen config={RULES_SCREEN} />
          </div>
        </TabsContent>

        {/* ABA 4: TRANSIÇÃO */}
        <TabsContent value="transicao" className="space-y-4">
          <FiscalGenericScreen config={TRANSITION_SCREEN} />
        </TabsContent>

        {/* ABA 5: IMPACTOS E SIMULADOR */}
        <TabsContent value="impactos" className="space-y-4">
          <ReformaSimulador />
        </TabsContent>
      </Tabs>
    </div>
  )
}
