import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DpPayroll } from '@/components/dp/dp-payroll'
import { DpGenericScreen } from '@/components/dp/dp-generic-screen'
import { DP_SCREEN_CONFIGS } from '@/lib/dp-types'
import { DP_ENTERPRISE_CONFIGS } from '@/lib/dp-enterprise-types'
import { FileSpreadsheet, Tag, Percent, PieChart, Gift, Landmark } from 'lucide-react'

export function DpFolhaBeneficiosScreen() {
  const rubricasCfg = DP_SCREEN_CONFIGS['rubricas'] || {
    collection: 'dp_rubricas',
    title: 'Rubricas da Folha',
    fields: [
      { name: 'codigo', label: 'Código Rubrica', type: 'text', required: true },
      { name: 'descricao', label: 'Descrição / Nome', type: 'text', required: true },
      {
        name: 'tipo',
        label: 'Tipo (Vencimento / Desconto / Informativa)',
        type: 'text',
        required: true,
      },
      { name: 'incide_inss', label: 'Incide INSS (Sim/Não)', type: 'text' },
      { name: 'incide_fgts', label: 'Incide FGTS (Sim/Não)', type: 'text' },
      { name: 'incide_irrf', label: 'Incide IRRF (Sim/Não)', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Ativa', 'Inativa'],
  }

  const encargosCfg = DP_ENTERPRISE_CONFIGS['encargos'] || {
    collection: 'dp_encargos',
    title: 'Encargos e Contribuições Previdenciárias',
    fields: [
      { name: 'competencia', label: 'Competência (AAAA-MM)', type: 'text', required: true },
      { name: 'inss_patronal', label: 'INSS Patronal', type: 'text' },
      { name: 'rat_fap', label: 'RAT / FAP', type: 'text' },
      { name: 'terceiros_outras_entidades', label: 'Outras Entidades (Sistema S)', type: 'text' },
      { name: 'total_encargos', label: 'Total Geral Devido', type: 'text' },
      { name: 'guia_recolhimento', label: 'Nº Guia DARF Previdenciário', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Calculado', 'Guia Emitida', 'Pago', 'Divergente'],
  }

  const provisoesCfg = DP_SCREEN_CONFIGS['provisoes'] || {
    collection: 'dp_provisoes',
    title: 'Provisões (Férias e 13º Salário)',
    fields: [
      { name: 'competencia', label: 'Competência', type: 'text', required: true },
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      { name: 'provisao_ferias', label: 'Provisão Férias + 1/3', type: 'text' },
      { name: 'provisao_decimo_terceiro', label: 'Provisão 13º Salário', type: 'text' },
      { name: 'encargos_provisao', label: 'Encargos sobre Provisão', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Calculada', 'Contabilizada', 'Auditada'],
  }

  const beneficiosCfg = DP_SCREEN_CONFIGS['benefits'] || {
    collection: 'rh_benefits',
    title: 'Benefícios Corporativos',
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      {
        name: 'tipo_beneficio',
        label: 'Tipo (VR, VA, VT, Saúde, Odonto, Seguro)',
        type: 'text',
        required: true,
      },
      { name: 'valor_beneficio', label: 'Valor Mensal', type: 'text' },
      { name: 'desconto_colaborador', label: 'Desconto em Folha', type: 'text' },
      { name: 'fornecedor', label: 'Operadora / Fornecedor', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Ativo', 'Cancelado', 'Suspenso'],
  }

  const consignadosCfg = DP_ENTERPRISE_CONFIGS['consignados'] || {
    collection: 'dp_consignados',
    title: 'Empréstimos Consignados e Descontos Autorizados',
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      {
        name: 'instituicao',
        label: 'Instituição Financeira / Convênio',
        type: 'text',
        required: true,
      },
      { name: 'valor_parcela', label: 'Valor Parcela Mensal', type: 'text', required: true },
      { name: 'parcelas_totais', label: 'Total Parcelas', type: 'number' },
      { name: 'parcelas_pagas', label: 'Parcelas Descontadas', type: 'number' },
      { name: 'saldo_devedor', label: 'Saldo Devedor', type: 'text' },
      { name: 'contrato_numero', label: 'Nº Contrato', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Em Desconto', 'Liquidado', 'Suspenso'],
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="folha" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="folha"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Folha
          </TabsTrigger>
          <TabsTrigger
            value="rubricas"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Tag className="w-3.5 h-3.5 mr-1.5" /> Rubricas
          </TabsTrigger>
          <TabsTrigger
            value="encargos"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Percent className="w-3.5 h-3.5 mr-1.5" /> Encargos
          </TabsTrigger>
          <TabsTrigger
            value="provisoes"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <PieChart className="w-3.5 h-3.5 mr-1.5" /> Provisões
          </TabsTrigger>
          <TabsTrigger
            value="beneficios"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Gift className="w-3.5 h-3.5 mr-1.5" /> Benefícios
          </TabsTrigger>
          <TabsTrigger
            value="consignados"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Landmark className="w-3.5 h-3.5 mr-1.5" /> Consignados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="folha" className="mt-4">
          <DpPayroll />
        </TabsContent>

        <TabsContent value="rubricas" className="mt-4">
          <DpGenericScreen config={rubricasCfg} />
        </TabsContent>

        <TabsContent value="encargos" className="mt-4">
          <DpGenericScreen config={encargosCfg} />
        </TabsContent>

        <TabsContent value="provisoes" className="mt-4">
          <DpGenericScreen config={provisoesCfg} />
        </TabsContent>

        <TabsContent value="beneficios" className="mt-4">
          <DpGenericScreen config={beneficiosCfg} />
        </TabsContent>

        <TabsContent value="consignados" className="mt-4">
          <DpGenericScreen config={consignadosCfg} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
