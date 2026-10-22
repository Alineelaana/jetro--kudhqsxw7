import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { SstTrainingMatrix } from '@/components/sst/sst-training-matrix'
import { SST_SCREEN_CONFIGS } from '@/lib/sst-types'
import { HardHat, ShieldCheck, Award, GraduationCap } from 'lucide-react'

export function SstEpisTreinamentosScreen() {
  // EPIs (NR-6, inclui Uniformes e EPIs transferidos do DP)
  const episCfg = SST_SCREEN_CONFIGS['epis'] || {
    collection: 'sst_epis',
    title: 'EPIs, Uniformes e Equipamentos de Proteção Individual (NR-6)',
    fields: [
      { name: 'nome_epi', label: 'Nome do EPI / Uniforme', type: 'text', required: true },
      { name: 'ca_numero', label: 'Certificado de Aprovação (CA)', type: 'text', required: true },
      { name: 'validade_ca', label: 'Validade do CA', type: 'date' },
      {
        name: 'tipo_protecao',
        label: 'Tipo (Cabeça, Olhos/Face, Auditiva, Respiratória, Tronco/Uniforme, Membros)',
        type: 'text',
        required: true,
      },
      { name: 'fabricante', label: 'Fabricante', type: 'text' },
      { name: 'durabilidade_dias', label: 'Vida Útil Estimada (dias)', type: 'number' },
      { name: 'estoque_minimo', label: 'Estoque Mínimo Recomendado', type: 'number' },
    ],
    statusField: 'situacao',
    statusOptions: ['Ativo', 'CA Vencido', 'Em Homologação', 'Descontinuado'],
  }

  const epcsCfg = SST_SCREEN_CONFIGS['epcs'] || {
    collection: 'sst_epcs',
    title: 'EPCs — Equipamentos de Proteção Coletiva',
    fields: [
      {
        name: 'nome_epc',
        label: 'Nome do EPC (Exaustor, Guarda-corpo, Linha de Vida)',
        type: 'text',
        required: true,
      },
      {
        name: 'setor_instalado',
        label: 'Setor / Área de Instalação',
        type: 'text',
        required: true,
      },
      { name: 'data_instalacao', label: 'Data Instalação', type: 'date' },
      { name: 'data_ultima_inspecao', label: 'Última Inspeção / Manutenção', type: 'date' },
      { name: 'proxima_inspecao', label: 'Próxima Inspeção Prevista', type: 'date' },
      { name: 'capacidade_especificacao', label: 'Capacidade / ART de Projeto', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Operacional', 'Em Manutenção', 'Interditado'],
  }

  const certificadosCfg = SST_SCREEN_CONFIGS['certificates'] || {
    collection: 'sst_certificates',
    title: 'Certificados e Evidências de Treinamento',
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      {
        name: 'curso_nome',
        label: 'Norma / Curso (ex: NR-10, NR-35, CIPA)',
        type: 'text',
        required: true,
      },
      { name: 'data_emissao', label: 'Data Conclusão', type: 'date', required: true },
      {
        name: 'data_validade',
        label: 'Data de Vencimento / Reciclagem',
        type: 'date',
        required: true,
      },
      { name: 'entidade_formadora', label: 'Entidade / Instrutor Credenciado', type: 'text' },
      { name: 'carga_horaria', label: 'Carga Horária (h)', type: 'number' },
    ],
    statusField: 'situacao',
    statusOptions: ['Válido', 'Vencendo em 30d', 'Vencido', 'Pendente Assinatura'],
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="epis" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="epis"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <HardHat className="w-3.5 h-3.5 mr-1.5" /> EPIs e Uniformes (NR-6)
          </TabsTrigger>
          <TabsTrigger
            value="epcs"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> EPCs (Proteção Coletiva)
          </TabsTrigger>
          <TabsTrigger
            value="certificados"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Award className="w-3.5 h-3.5 mr-1.5" /> Certificados
          </TabsTrigger>
          <TabsTrigger
            value="matriz"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <GraduationCap className="w-3.5 h-3.5 mr-1.5" /> Matriz de Treinamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="epis" className="mt-4">
          <RhGenericScreen config={episCfg} />
        </TabsContent>

        <TabsContent value="epcs" className="mt-4">
          <RhGenericScreen config={epcsCfg} />
        </TabsContent>

        <TabsContent value="certificados" className="mt-4">
          <RhGenericScreen config={certificadosCfg} />
        </TabsContent>

        <TabsContent value="matriz" className="mt-4">
          <SstTrainingMatrix />
        </TabsContent>
      </Tabs>
    </div>
  )
}
