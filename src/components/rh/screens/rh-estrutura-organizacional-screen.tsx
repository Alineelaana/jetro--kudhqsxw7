import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RhOrganograma } from '@/components/rh/rh-organograma'
import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { RH_SCREEN_CONFIGS } from '@/lib/rh-types'
import { RH_ENTERPRISE_CONFIGS } from '@/lib/rh-enterprise-types'
import { Network, Briefcase, UserCheck2, Building2 } from 'lucide-react'

export function RhEstruturaOrganizacionalScreen() {
  const cargosCfg = RH_SCREEN_CONFIGS['positions'] || {
    collection: 'rh_positions',
    title: 'Cargos e Funções',
    fields: [
      { name: 'nome_cargo', label: 'Nome do Cargo', type: 'text', required: true },
      { name: 'cbo', label: 'Código CBO', type: 'text' },
      { name: 'departamento', label: 'Departamento Padrão', type: 'text' },
      {
        name: 'nivel',
        label: 'Nível (Júnior, Pleno, Sênior, Especialista, Coordenação)',
        type: 'text',
      },
      { name: 'piso_salarial', label: 'Faixa Salarial Inicial', type: 'text' },
      { name: 'teto_salarial', label: 'Faixa Salarial Final', type: 'text' },
      {
        name: 'descricao_sumaria',
        label: 'Descrição Sumária / Atribuições',
        type: 'textarea',
        span: 2,
      },
    ],
    statusField: 'situacao',
    statusOptions: ['Ativo', 'Em Revisão', 'Inativo'],
  }

  const posicoesCfg = RH_ENTERPRISE_CONFIGS['posicoes'] || {
    collection: 'rh_posicoes',
    title: 'Posições e Lotação de Vagas',
    fields: [
      {
        name: 'codigo_posicao',
        label: 'Código da Posição / Headcount',
        type: 'text',
        required: true,
      },
      { name: 'cargo', label: 'Cargo Relacionado', type: 'text', required: true },
      {
        name: 'departamento',
        label: 'Departamento / Centro de Custo',
        type: 'text',
        required: true,
      },
      { name: 'ocupante_atual', label: 'Ocupante Atual', type: 'text' },
      { name: 'gestor_imediato', label: 'Gestor Imediato', type: 'text' },
      { name: 'tipo_vaga', label: 'Tipo (Orçada, Temporária, Adicional)', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Ocupada', 'Vaga Aberta', 'Congelada', 'Em Processo'],
  }

  const deptosCfg = RH_SCREEN_CONFIGS['departments'] || {
    collection: 'rh_departments',
    title: 'Departamentos e Centros de Custo',
    fields: [
      { name: 'nome_departamento', label: 'Nome do Departamento', type: 'text', required: true },
      { name: 'sigla', label: 'Sigla', type: 'text' },
      { name: 'centro_custo', label: 'Código Centro de Custo', type: 'text' },
      { name: 'responsavel', label: 'Responsável / Head', type: 'text' },
      { name: 'departamento_pai', label: 'Departamento Superior', type: 'text' },
      { name: 'descricao', label: 'Finalidade / Escopo', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Ativo', 'Inativo'],
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="organograma" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="organograma"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Network className="w-3.5 h-3.5 mr-1.5" /> Organograma
          </TabsTrigger>
          <TabsTrigger
            value="cargos"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Briefcase className="w-3.5 h-3.5 mr-1.5" /> Cargos
          </TabsTrigger>
          <TabsTrigger
            value="posicoes"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <UserCheck2 className="w-3.5 h-3.5 mr-1.5" /> Posições
          </TabsTrigger>
          <TabsTrigger
            value="departamentos"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5" /> Departamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organograma" className="mt-4">
          <RhOrganograma />
        </TabsContent>

        <TabsContent value="cargos" className="mt-4">
          <RhGenericScreen config={cargosCfg} />
        </TabsContent>

        <TabsContent value="posicoes" className="mt-4">
          <RhGenericScreen config={posicoesCfg} />
        </TabsContent>

        <TabsContent value="departamentos" className="mt-4">
          <RhGenericScreen config={deptosCfg} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
