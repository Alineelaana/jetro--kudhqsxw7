import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DpEsocialMonitor } from '@/components/dp/dp-esocial-monitor'
import { DpFgtsDigital } from '@/components/dp/dp-fgts-digital'
import { DpReports } from '@/components/dp/dp-reports'
import { DpGenericScreen } from '@/components/dp/dp-generic-screen'
import { DP_SCREEN_CONFIGS } from '@/lib/dp-types'
import { DP_ENTERPRISE_CONFIGS } from '@/lib/dp-enterprise-types'
import {
  SendHorizontal,
  Activity,
  Calculator,
  FileCheck,
  Building2,
  TrendingUp,
  Table,
  BarChart3,
} from 'lucide-react'

export function DpObrigacoesEsocialScreen() {
  const esocialEventosCfg = DP_SCREEN_CONFIGS['esocial'] || {
    collection: 'dp_esocial_events',
    title: 'Eventos Trabalhistas eSocial',
    fields: [
      {
        name: 'tipo_evento',
        label: 'Evento (S-1000, S-2200, S-1200...)',
        type: 'text',
        required: true,
      },
      { name: 'employee_name', label: 'Colaborador', type: 'text' },
      { name: 'competencia', label: 'Competência', type: 'text' },
      { name: 'protocolo', label: 'Protocolo de Envio', type: 'text' },
      { name: 'recibo', label: 'Recibo Oficial', type: 'text' },
      { name: 'layout_versao', label: 'Versão do Layout', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Pendente', 'Enviado', 'Aceito', 'Rejeitado', 'Processado'],
  }

  const docsObrigatoriosCfg = DP_ENTERPRISE_CONFIGS['documentos_obrigatorios'] || {
    collection: 'dp_documents',
    title: 'Documentos Obrigatórios e Prazos',
    fields: [
      { name: 'employee_name', label: 'Colaborador / Entidade', type: 'text', required: true },
      { name: 'tipo_documento', label: 'Documento Obrigatório', type: 'text', required: true },
      { name: 'orgao_destino', label: 'Órgão de Destino (MTE, RFB, CEF)', type: 'text' },
      { name: 'data_limite', label: 'Prazo Limite', type: 'date' },
      { name: 'protocolo', label: 'Nº Protocolo / Recibo', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Pendente', 'Transmitido', 'Em Atraso', 'Dispensado'],
  }

  const sindicatosCfg = DP_ENTERPRISE_CONFIGS['sindicatos'] || {
    collection: 'dp_sindicatos',
    title: 'Sindicatos e Convenções Coletivas',
    fields: [
      { name: 'nome', label: 'Nome Sindicato / Entidade', type: 'text', required: true },
      { name: 'cnpj', label: 'CNPJ', type: 'text' },
      { name: 'codigo_sindical', label: 'Código Sindical', type: 'text' },
      { name: 'data_base', label: 'Mês Data-Base', type: 'text' },
      { name: 'piso_salarial', label: 'Piso Salarial Vigente', type: 'text' },
      { name: 'vigencia_inicio', label: 'Vigência Início', type: 'date' },
      { name: 'vigencia_fim', label: 'Vigência Fim', type: 'date' },
    ],
    statusField: 'situacao',
    statusOptions: ['Vigente', 'Em Negociação', 'Vencida'],
  }

  const dissidioCfg = DP_ENTERPRISE_CONFIGS['dissidio'] || {
    collection: 'dp_dissidio',
    title: 'Dissídios Coletivos e Acordos',
    fields: [
      { name: 'sindicato_nome', label: 'Sindicato Envolvido', type: 'text', required: true },
      { name: 'ano_exercicio', label: 'Ano de Exercício', type: 'text', required: true },
      { name: 'percentual_reajuste', label: '% Reajuste Aprovado', type: 'text' },
      { name: 'data_homologacao', label: 'Data Homologação', type: 'date' },
      { name: 'retroativo', label: 'Retroativo (Sim/Não)', type: 'text' },
      { name: 'observacoes', label: 'Cláusulas e Observações', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Em Negociação', 'Homologado', 'Aplicado na Folha'],
  }

  const tabelasTribCfg = DP_ENTERPRISE_CONFIGS['tabelas_tributarias'] || {
    collection: 'dp_tax_tables',
    title: 'Tabelas Tributárias (INSS / IRRF / Salário Família)',
    fields: [
      {
        name: 'tabela',
        label: 'Tabela (INSS, IRRF, FGTS, Salário Mínimo)',
        type: 'text',
        required: true,
      },
      { name: 'vigencia_inicio', label: 'Vigência Inicial', type: 'date', required: true },
      { name: 'faixa_inicial', label: 'Faixa Inicial (R$)', type: 'text' },
      { name: 'faixa_final', label: 'Faixa Final (R$)', type: 'text' },
      { name: 'aliquota', label: 'Alíquota (%)', type: 'text' },
      { name: 'parcela_deduzir', label: 'Parcela a Deduzir (R$)', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Vigente', 'Histórica', 'Em Atualização'],
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="esocial" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="esocial"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <SendHorizontal className="w-3.5 h-3.5 mr-1.5" /> eSocial
          </TabsTrigger>
          <TabsTrigger
            value="monitor"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5" /> Monitor
          </TabsTrigger>
          <TabsTrigger
            value="fgts"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Calculator className="w-3.5 h-3.5 mr-1.5" /> FGTS Digital
          </TabsTrigger>
          <TabsTrigger
            value="documentos"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <FileCheck className="w-3.5 h-3.5 mr-1.5" /> Documentos Obrigatórios
          </TabsTrigger>
          <TabsTrigger
            value="sindicatos"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5" /> Sindicatos/Convenções
          </TabsTrigger>
          <TabsTrigger
            value="dissidio"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Dissídio
          </TabsTrigger>
          <TabsTrigger
            value="tabelas"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Table className="w-3.5 h-3.5 mr-1.5" /> Tabelas Tributárias
          </TabsTrigger>
          <TabsTrigger
            value="relatorios"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="esocial" className="mt-4">
          <DpGenericScreen config={esocialEventosCfg} />
        </TabsContent>

        <TabsContent value="monitor" className="mt-4">
          <DpEsocialMonitor />
        </TabsContent>

        <TabsContent value="fgts" className="mt-4">
          <DpFgtsDigital />
        </TabsContent>

        <TabsContent value="documentos" className="mt-4">
          <DpGenericScreen config={docsObrigatoriosCfg} />
        </TabsContent>

        <TabsContent value="sindicatos" className="mt-4">
          <DpGenericScreen config={sindicatosCfg} />
        </TabsContent>

        <TabsContent value="dissidio" className="mt-4">
          <DpGenericScreen config={dissidioCfg} />
        </TabsContent>

        <TabsContent value="tabelas" className="mt-4">
          <DpGenericScreen config={tabelasTribCfg} />
        </TabsContent>

        <TabsContent value="relatorios" className="mt-4">
          <DpReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}
