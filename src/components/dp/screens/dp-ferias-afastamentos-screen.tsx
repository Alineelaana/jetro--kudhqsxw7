import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RhVacations } from '@/components/rh/rh-vacations'
import { DpGenericScreen } from '@/components/dp/dp-generic-screen'
import { DP_SCREEN_CONFIGS } from '@/lib/dp-types'
import { Palmtree, UserMinus, ShieldAlert } from 'lucide-react'

export function DpFeriasAfastamentosScreen() {
  const afastamentosCfg = DP_SCREEN_CONFIGS['leaves'] || {
    collection: 'dp_leaves',
    title: 'Afastamentos e Atestados',
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      {
        name: 'tipo_afastamento',
        label: 'Tipo Afastamento (Doença, Acidente, etc)',
        type: 'text',
        required: true,
      },
      { name: 'data_inicio', label: 'Início', type: 'date', required: true },
      { name: 'data_fim', label: 'Término Previsto', type: 'date' },
      { name: 'dias', label: 'Dias', type: 'number' },
      { name: 'cid', label: 'CID (quando aplicável)', type: 'text' },
      { name: 'medico_emissor', label: 'Médico Emissor / CRM', type: 'text' },
      { name: 'observacoes', label: 'Observações', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Pendente', 'Em Andamento', 'Concluído', 'INSS'],
  }

  const licencasCfg = DP_SCREEN_CONFIGS['licencas'] || {
    collection: 'dp_licencas',
    title: 'Licenças Remuneradas e Não Remuneradas',
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      {
        name: 'tipo_licenca',
        label: 'Tipo (Maternidade, Paternidade, Casamento, Luto, Sem Vencimento)',
        type: 'text',
        required: true,
      },
      { name: 'data_inicio', label: 'Início', type: 'date', required: true },
      { name: 'data_termino', label: 'Término', type: 'date' },
      { name: 'remunerada', label: 'Remunerada (Sim/Não)', type: 'text' },
      { name: 'justificativa', label: 'Justificativa', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Aprovada', 'Pendente', 'Recusada', 'Encerrada'],
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="ferias" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="ferias"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Palmtree className="w-3.5 h-3.5 mr-1.5" /> Férias
          </TabsTrigger>
          <TabsTrigger
            value="afastamentos"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <UserMinus className="w-3.5 h-3.5 mr-1.5" /> Afastamentos
          </TabsTrigger>
          <TabsTrigger
            value="licencas"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> Licenças
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ferias" className="mt-4">
          <RhVacations />
        </TabsContent>

        <TabsContent value="afastamentos" className="mt-4">
          <DpGenericScreen config={afastamentosCfg} />
        </TabsContent>

        <TabsContent value="licencas" className="mt-4">
          <DpGenericScreen config={licencasCfg} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
