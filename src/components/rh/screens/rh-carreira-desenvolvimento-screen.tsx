import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { RH_SCREEN_CONFIGS } from '@/lib/rh-types'
import { RH_ENTERPRISE_CONFIGS } from '@/lib/rh-enterprise-types'
import { RH_EXTENDED_CONFIGS } from '@/lib/rh-extended-configs'
import { TrendingUp, GraduationCap, Trophy } from 'lucide-react'

export function RhCarreiraDesenvolvimentoScreen() {
  const carreiraCfg = RH_EXTENDED_CONFIGS['plano_carreira'] ||
    RH_SCREEN_CONFIGS['carreira'] || {
      collection: 'rh_career_plans',
      title: 'Planos de Carreira (Y / W / Linear)',
      fields: [
        { name: 'cargo_origem', label: 'Cargo Atual / Origem', type: 'text', required: true },
        {
          name: 'trilha',
          label: 'Trilha (Especialista, Gestão, Operacional)',
          type: 'text',
          required: true,
        },
        { name: 'proximo_nivel', label: 'Próximo Nível', type: 'text', required: true },
        { name: 'tempo_medio_meses', label: 'Tempo Médio (meses)', type: 'number' },
        { name: 'requisitos', label: 'Requisitos / Certificações', type: 'textarea', span: 2 },
      ],
      statusField: 'situacao',
      statusOptions: ['Ativo', 'Em Revisão', 'Inativo'],
    }

  const treinamentosCfg = RH_SCREEN_CONFIGS['trainings'] || {
    collection: 'rh_trainings',
    title: 'Catálogo de Treinamentos e Capacitações',
    fields: [
      { name: 'nome_treinamento', label: 'Nome do Treinamento', type: 'text', required: true },
      {
        name: 'categoria',
        label: 'Categoria (Técnico, Soft Skills, Liderança, NRs)',
        type: 'text',
      },
      { name: 'carga_horaria', label: 'Carga Horária (horas)', type: 'number' },
      { name: 'instrutor', label: 'Instrutor / Instituição', type: 'text' },
      { name: 'modalidade', label: 'Modalidade (Presencial / Online / Híbrido)', type: 'text' },
      { name: 'custo_total', label: 'Custo Total (R$)', type: 'text' },
      { name: 'conteudo_programatico', label: 'Conteúdo Programático', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Planejado', 'Em Execução', 'Concluído', 'Cancelado'],
  }

  const reconhecimentoCfg = RH_ENTERPRISE_CONFIGS['reconhecimento'] || {
    collection: 'rh_recognitions',
    title: 'Programas de Reconhecimento e Premiações',
    fields: [
      { name: 'programa_nome', label: 'Programa de Reconhecimento', type: 'text', required: true },
      { name: 'employee_name', label: 'Colaborador Premiado', type: 'text', required: true },
      {
        name: 'categoria_premio',
        label: 'Categoria (Destaque, Inovação, Tempo de Casa, Meta)',
        type: 'text',
      },
      { name: 'data_premiacao', label: 'Data', type: 'date' },
      { name: 'pontos_premio', label: 'Pontuação / Prêmio', type: 'text' },
      { name: 'motivo_elogio', label: 'Motivo / Evidência', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Homologado', 'Entregue', 'Divulgado'],
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="carreira" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="carreira"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Planos de Carreira
          </TabsTrigger>
          <TabsTrigger
            value="treinamentos"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <GraduationCap className="w-3.5 h-3.5 mr-1.5" /> Treinamentos
          </TabsTrigger>
          <TabsTrigger
            value="reconhecimento"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Trophy className="w-3.5 h-3.5 mr-1.5" /> Reconhecimento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="carreira" className="mt-4">
          <RhGenericScreen config={carreiraCfg} />
        </TabsContent>

        <TabsContent value="treinamentos" className="mt-4">
          <RhGenericScreen config={treinamentosCfg} />
        </TabsContent>

        <TabsContent value="reconhecimento" className="mt-4">
          <RhGenericScreen config={reconhecimentoCfg} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
