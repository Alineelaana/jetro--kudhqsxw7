import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { RH_SCREEN_CONFIGS } from '@/lib/rh-types'
import { RH_ENTERPRISE_CONFIGS } from '@/lib/rh-enterprise-types'
import { UserPlus, UserMinus } from 'lucide-react'

export function RhJornadaColaboradorScreen() {
  const onboardingCfg = RH_ENTERPRISE_CONFIGS['onboarding'] || {
    collection: 'rh_onboarding',
    title: 'Processos de Onboarding (Integração de Novos Talentos)',
    fields: [
      { name: 'employee_name', label: 'Novo Colaborador', type: 'text', required: true },
      { name: 'cargo', label: 'Cargo', type: 'text' },
      { name: 'departamento', label: 'Departamento', type: 'text' },
      { name: 'buddy_tutor', label: 'Buddy / Mentor de Recepção', type: 'text' },
      { name: 'data_inicio', label: 'Primeiro Dia', type: 'date' },
      { name: 'kit_boas_vindas', label: 'Kit Boas-Vindas Entregue (Sim/Não)', type: 'text' },
      { name: 'treinamentos_iniciais', label: 'Treinamentos Iniciais e NRs', type: 'text' },
      { name: 'checklist_progresso', label: '% Conclusão Checklist', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Em Preparação', 'Primeira Semana', 'Em Acompanhamento (30d)', 'Concluído'],
  }

  const offboardingCfg = RH_ENTERPRISE_CONFIGS['offboarding'] || {
    collection: 'rh_offboarding',
    title: 'Processos de Offboarding (Desligamento e Entrevista de Saída)',
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      { name: 'departamento', label: 'Departamento', type: 'text' },
      { name: 'data_desligamento', label: 'Último Dia', type: 'date', required: true },
      {
        name: 'entrevista_realizada',
        label: 'Entrevista de Desligamento Realizada (Sim/Não)',
        type: 'text',
      },
      {
        name: 'devolucao_equipamentos',
        label: 'Devolução de Ativos / TI OK (Sim/Não)',
        type: 'text',
      },
      { name: 'revogacao_acessos', label: 'Revogação de Acessos OK (Sim/Não)', type: 'text' },
      { name: 'motivo_declarado', label: 'Motivo Declarado de Saída', type: 'textarea', span: 2 },
      {
        name: 'feedbacks_empresa',
        label: 'Pontos Positivos / Críticas à Empresa',
        type: 'textarea',
        span: 2,
      },
    ],
    statusField: 'situacao',
    statusOptions: ['Iniciado', 'Entrevista Agendada', 'Checklist em Andamento', 'Finalizado'],
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="onboarding" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="onboarding"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Onboarding (Integração)
          </TabsTrigger>
          <TabsTrigger
            value="offboarding"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <UserMinus className="w-3.5 h-3.5 mr-1.5" /> Offboarding (Desligamento)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="onboarding" className="mt-4">
          <RhGenericScreen config={onboardingCfg} />
        </TabsContent>

        <TabsContent value="offboarding" className="mt-4">
          <RhGenericScreen config={offboardingCfg} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
