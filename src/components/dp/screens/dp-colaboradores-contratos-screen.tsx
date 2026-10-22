import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RhEmployees } from '@/components/rh/rh-employees'
import { DpGenericScreen } from '@/components/dp/dp-generic-screen'
import { DpDismissalFlow } from '@/components/dp/dp-dismissal-flow'
import { DpReinstatementFlow } from '@/components/dp/dp-reinstatement-flow'
import { DP_SCREEN_CONFIGS } from '@/lib/dp-types'
import { DP_ENTERPRISE_CONFIGS } from '@/lib/dp-enterprise-types'
import { Users, UserPlus, FileEdit, UserX, UserCheck, FolderGit2 } from 'lucide-react'

export function DpColaboradoresContratosScreen() {
  const adMissoesCfg = DP_ENTERPRISE_CONFIGS['admissoes'] || {
    collection: 'dp_admissoes',
    title: 'Processos de Admissão',
    fields: [
      { name: 'candidato_nome', label: 'Candidato', type: 'text', required: true },
      { name: 'cargo_pretendido', label: 'Cargo', type: 'text' },
      { name: 'departamento', label: 'Departamento', type: 'text' },
      { name: 'data_prevista_inicio', label: 'Data Prevista', type: 'date' },
      { name: 'salario_proposto', label: 'Salário Proposto', type: 'text' },
      { name: 'etapa', label: 'Etapa / Checklist', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Documentação', 'Exame Admissional', 'Contrato Assinado', 'Concluído'],
  }

  const altContratuaisCfg = DP_SCREEN_CONFIGS['contract_changes'] || {
    collection: 'dp_contract_changes',
    title: 'Alterações Contratuais',
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      { name: 'tipo_alteracao', label: 'Tipo Alteração', type: 'text' },
      { name: 'motivo', label: 'Motivo', type: 'text' },
      { name: 'data_vigencia', label: 'Data Vigência', type: 'date' },
      { name: 'detalhes', label: 'Detalhes', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Pendente', 'Aprovado', 'Efetivado', 'Cancelado'],
  }

  const docsCfg = DP_ENTERPRISE_CONFIGS['documentos_obrigatorios'] || {
    collection: 'dp_documents',
    title: 'Documentos dos Colaboradores',
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      { name: 'tipo_documento', label: 'Tipo Documento', type: 'text', required: true },
      { name: 'numero', label: 'Número / Registro', type: 'text' },
      { name: 'data_emissao', label: 'Emissão', type: 'date' },
      { name: 'data_validade', label: 'Validade', type: 'date' },
      { name: 'observacoes', label: 'Observações', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Válido', 'Vencido', 'Pendente de Envio', 'Em Análise'],
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="cadastro" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="cadastro"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Users className="w-3.5 h-3.5 mr-1.5" /> Cadastro
          </TabsTrigger>
          <TabsTrigger
            value="admissoes"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Admissões
          </TabsTrigger>
          <TabsTrigger
            value="alteracoes"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <FileEdit className="w-3.5 h-3.5 mr-1.5" /> Alterações Contratuais
          </TabsTrigger>
          <TabsTrigger
            value="desligamentos"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <UserX className="w-3.5 h-3.5 mr-1.5" /> Desligamentos/Rescisões
          </TabsTrigger>
          <TabsTrigger
            value="reintegracao"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Reintegração
          </TabsTrigger>
          <TabsTrigger
            value="documentos"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <FolderGit2 className="w-3.5 h-3.5 mr-1.5" /> Documentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cadastro" className="mt-4">
          <RhEmployees />
        </TabsContent>

        <TabsContent value="admissoes" className="mt-4">
          <DpGenericScreen config={adMissoesCfg} />
        </TabsContent>

        <TabsContent value="alteracoes" className="mt-4">
          <DpGenericScreen config={altContratuaisCfg} />
        </TabsContent>

        <TabsContent value="desligamentos" className="mt-4">
          <DpDismissalFlow />
        </TabsContent>

        <TabsContent value="reintegracao" className="mt-4">
          <DpReinstatementFlow />
        </TabsContent>

        <TabsContent value="documentos" className="mt-4">
          <DpGenericScreen config={docsCfg} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
