import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RhNineBox } from '@/components/rh/rh-nine-box'
import { RhTalentReview } from '@/components/rh/rh-talent-review'
import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { RH_SCREEN_CONFIGS } from '@/lib/rh-types'
import { RH_ENTERPRISE_CONFIGS } from '@/lib/rh-enterprise-types'
import { Award, Sliders, MessageSquare, Compass, Grid3X3, Search, GitMerge } from 'lucide-react'

export function RhGestaoTalentosScreen() {
  const avaliacaoCfg = RH_SCREEN_CONFIGS['avaliacao_competencias'] || {
    collection: 'rh_competency_evaluations',
    title: 'Avaliação de Competências',
    fields: [
      { name: 'ciclo', label: 'Ciclo de Avaliação', type: 'text', required: true },
      { name: 'employee_name', label: 'Colaborador Avaliado', type: 'text', required: true },
      { name: 'avaliador', label: 'Avaliador', type: 'text' },
      { name: 'tipo', label: 'Tipo (Autoavaliação, 180º, 360º)', type: 'text' },
      { name: 'nota_geral', label: 'Nota / Score', type: 'text' },
      { name: 'data_conclusao', label: 'Data Conclusão', type: 'date' },
    ],
    statusField: 'situacao',
    statusOptions: ['Pendente', 'Em Andamento', 'Concluída', 'Calibrada'],
  }

  const calibracaoCfg = RH_ENTERPRISE_CONFIGS['calibracao'] || {
    collection: 'rh_calibration_sessions',
    title: 'Comitê de Calibração',
    fields: [
      { name: 'comite_nome', label: 'Nome do Comitê', type: 'text', required: true },
      { name: 'departamento', label: 'Departamento / Diretoria', type: 'text' },
      { name: 'data_sessao', label: 'Data da Sessão', type: 'date' },
      { name: 'mediador', label: 'Mediador / RH', type: 'text' },
      { name: 'total_avaliados', label: 'Qtd Avaliados', type: 'number' },
      { name: 'ata_resumo', label: 'Ata e Deliberações', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Agendada', 'Em Sessão', 'Finalizada', 'Homologada'],
  }

  const feedbackCfg = RH_ENTERPRISE_CONFIGS['feedback'] || {
    collection: 'rh_feedbacks',
    title: 'Feedback Contínuo',
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      { name: 'autor_nome', label: 'Autor do Feedback', type: 'text', required: true },
      {
        name: 'tipo',
        label: 'Tipo (Elogio, Ponto a Desenvolver, Alinhamento 1:1)',
        type: 'text',
        required: true,
      },
      { name: 'data_registro', label: 'Data', type: 'date' },
      { name: 'visibilidade', label: 'Visibilidade (Público, Gestor, Privado)', type: 'text' },
      { name: 'conteudo', label: 'Conteúdo do Feedback', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Registrado', 'Lido', 'Plano Vinculado'],
  }

  const pdiCfg = RH_ENTERPRISE_CONFIGS['pdi'] || {
    collection: 'rh_pdi',
    title: 'PDI — Plano de Desenvolvimento Individual',
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      { name: 'competencia_alvo', label: 'Competência Alvo', type: 'text', required: true },
      {
        name: 'acao_desenvolvimento',
        label: 'Ação / Treinamento / Prática (70-20-10)',
        type: 'textarea',
        span: 2,
      },
      { name: 'prazo_conclusao', label: 'Prazo', type: 'date' },
      { name: 'mentor_responsavel', label: 'Mentor / Gestor', type: 'text' },
      { name: 'evidencia_conclusao', label: 'Evidência / Resultado', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Não Iniciado', 'Em Andamento', 'Concluído', 'Adiado'],
  }

  const sucessaoCfg = RH_ENTERPRISE_CONFIGS['sucessao'] || {
    collection: 'rh_succession_plans',
    title: 'Plano de Sucessão e Mapa de Prontidão',
    fields: [
      { name: 'cargo_critico', label: 'Cargo Crítico', type: 'text', required: true },
      { name: 'titular_atual', label: 'Titular Atual', type: 'text' },
      { name: 'sucessor_indicado', label: 'Sucessor Potencial', type: 'text', required: true },
      { name: 'tempo_prontidao', label: 'Prontidão (Imediato, 1 ano, 2-3 anos)', type: 'text' },
      { name: 'risco_perda', label: 'Risco de Saída do Titular', type: 'text' },
      { name: 'impacto_vaga', label: 'Impacto do Cargo', type: 'text' },
      { name: 'plano_preparacao', label: 'Plano de Aceleração', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Mapeado', 'Em Aceleração', 'Pronto', 'Vago'],
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="competencias" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="competencias"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Award className="w-3.5 h-3.5 mr-1.5" /> Avaliação de Competências
          </TabsTrigger>
          <TabsTrigger
            value="calibracao"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Sliders className="w-3.5 h-3.5 mr-1.5" /> Calibração
          </TabsTrigger>
          <TabsTrigger
            value="feedback"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Feedback
          </TabsTrigger>
          <TabsTrigger
            value="pdi"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Compass className="w-3.5 h-3.5 mr-1.5" /> PDI
          </TabsTrigger>
          <TabsTrigger
            value="nine_box"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Grid3X3 className="w-3.5 h-3.5 mr-1.5" /> 9 Box
          </TabsTrigger>
          <TabsTrigger
            value="talent_review"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Search className="w-3.5 h-3.5 mr-1.5" /> Talent Review
          </TabsTrigger>
          <TabsTrigger
            value="sucessao"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <GitMerge className="w-3.5 h-3.5 mr-1.5" /> Sucessão
          </TabsTrigger>
        </TabsList>

        <TabsContent value="competencias" className="mt-4">
          <RhGenericScreen config={avaliacaoCfg} />
        </TabsContent>

        <TabsContent value="calibracao" className="mt-4">
          <RhGenericScreen config={calibracaoCfg} />
        </TabsContent>

        <TabsContent value="feedback" className="mt-4">
          <RhGenericScreen config={feedbackCfg} />
        </TabsContent>

        <TabsContent value="pdi" className="mt-4">
          <RhGenericScreen config={pdiCfg} />
        </TabsContent>

        <TabsContent value="nine_box" className="mt-4">
          <RhNineBox />
        </TabsContent>

        <TabsContent value="talent_review" className="mt-4">
          <RhTalentReview />
        </TabsContent>

        <TabsContent value="sucessao" className="mt-4">
          <RhGenericScreen config={sucessaoCfg} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
