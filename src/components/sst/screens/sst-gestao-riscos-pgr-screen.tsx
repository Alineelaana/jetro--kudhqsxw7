import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { SST_SCREEN_CONFIGS } from '@/lib/sst-types'
import { SST_ENTERPRISE_SCREEN_CONFIGS } from '@/lib/sst-enterprise-types'
import { Card, CardContent } from '@/components/ui/card'
import {
  ShieldAlert,
  Grid,
  Building,
  Users2,
  Wind,
  Brain,
  ListTodo,
  FileCheck2,
  RefreshCw,
  Info,
} from 'lucide-react'

export function SstGestaoRiscosPgrScreen() {
  const inventarioCfg = SST_SCREEN_CONFIGS['risk_inventory'] || {
    collection: 'sst_risk_inventory',
    title: 'Inventário Geral de Riscos (GRO/PGR)',
    fields: [
      { name: 'codigo_perigo', label: 'Código Perigo', type: 'text', required: true },
      {
        name: 'descricao_perigo',
        label: 'Descrição do Perigo / Fator de Risco',
        type: 'text',
        required: true,
      },
      {
        name: 'categoria_risco',
        label: 'Categoria (Físico, Químico, Biológico, Ergonômico, Acidentes, Psicossocial)',
        type: 'text',
        required: true,
      },
      { name: 'fonte_geradora', label: 'Fonte Geradora', type: 'text' },
      { name: 'possiveis_danos', label: 'Possíveis Lesões / Danos', type: 'text' },
      { name: 'grau_risco', label: 'Nível de Risco (Probabilidade x Severidade)', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Identificado', 'Avaliado', 'Controlado', 'Residual'],
  }

  const matrizCfg = SST_ENTERPRISE_SCREEN_CONFIGS['risk_matrix_config'] || {
    collection: 'sst_risk_matrix_config',
    title: 'Matriz de Risco (Probabilidade x Severidade)',
    fields: [
      { name: 'nivel', label: 'Nível / Classificação', type: 'text', required: true },
      { name: 'probabilidade', label: 'Probabilidade (1 a 5)', type: 'text', required: true },
      { name: 'severidade', label: 'Severidade (1 a 5)', type: 'text', required: true },
      { name: 'score', label: 'Score Calculado', type: 'number' },
      { name: 'prazo_acao_dias', label: 'Prazo Limite Ação (dias)', type: 'number' },
    ],
    statusField: 'situacao',
    statusOptions: ['Trivial', 'Tolerável', 'Moderado', 'Substancial', 'Intolerável'],
  }

  const ambientesCfg = SST_ENTERPRISE_SCREEN_CONFIGS['work_environments'] || {
    collection: 'sst_work_environments',
    title: 'Ambientes de Trabalho (S-2240)',
    fields: [
      { name: 'codigo_ambiente', label: 'Código Ambiente', type: 'text', required: true },
      { name: 'nome_ambiente', label: 'Nome do Ambiente / Setor', type: 'text', required: true },
      { name: 'local_instalacao', label: 'Local (Próprio / Terceiros)', type: 'text' },
      { name: 'tipo_edificacao', label: 'Tipo Edificação', type: 'text' },
      { name: 'descricao', label: 'Descrição Detalhada do Ambiente', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Ativo', 'Em Reforma', 'Desativado'],
  }

  const gheCfg = SST_ENTERPRISE_SCREEN_CONFIGS['exposure_groups'] || {
    collection: 'sst_exposure_groups',
    title: 'GHE — Grupos Homogêneos de Exposição',
    fields: [
      { name: 'codigo_ghe', label: 'Código GHE', type: 'text', required: true },
      { name: 'nome_ghe', label: 'Nome do GHE', type: 'text', required: true },
      { name: 'setor', label: 'Setor / Departamento', type: 'text' },
      { name: 'cargos_abrangidos', label: 'Cargos Vinculados', type: 'text' },
      {
        name: 'descricao_atividades',
        label: 'Descrição das Atividades Homogêneas',
        type: 'textarea',
        span: 2,
      },
    ],
    statusField: 'situacao',
    statusOptions: ['Ativo', 'Em Revisão', 'Inativo'],
  }

  const avalAmbientaisCfg = SST_ENTERPRISE_SCREEN_CONFIGS['environmental_assessments'] || {
    collection: 'sst_environmental_assessments',
    title: 'Avaliações Ambientais (Ruído, Calor, Químicos, Poeira)',
    fields: [
      { name: 'ghe_nome', label: 'GHE / Setor Avaliado', type: 'text', required: true },
      { name: 'agente_medido', label: 'Agente Ambiental Medido', type: 'text', required: true },
      { name: 'valor_medido', label: 'Valor Medido', type: 'text', required: true },
      { name: 'unidade_medida', label: 'Unidade (dB(A), ppm, mg/m³, IBUTG)', type: 'text' },
      { name: 'limite_tolerancia', label: 'Limite Tolerância / Nível Ação', type: 'text' },
      { name: 'metodologia_nho', label: 'Metodologia / NHO / NR-15', type: 'text' },
      { name: 'data_medicao', label: 'Data da Medição', type: 'date' },
    ],
    statusField: 'situacao',
    statusOptions: [
      'Abaixo do Nível de Ação',
      'Acima do Nível de Ação',
      'Acima do Limite de Tolerância',
    ],
  }

  // ABA DEDICADA: RISCOS PSICOSSOCIAIS NR-1 NOVA REDAÇÃO VIGENTE DESDE 26/05/2026
  const riscosPsicossociaisCfg = SST_SCREEN_CONFIGS['psychosocial_management'] || {
    collection: 'sst_psychosocial_management',
    title: 'Fatores de Risco Psicossociais no Trabalho (NR-1)',
    fields: [
      { name: 'setor_ghe', label: 'Setor / GHE Avaliado', type: 'text', required: true },
      {
        name: 'fator_psicossocial',
        label: 'Fator Psicossocial Identificado',
        type: 'text',
        required: true,
      },
      {
        name: 'dimensao',
        label:
          'Dimensão (Sobrecarga de Trabalho, Ritmo Excessivo, Assédio, Monotonia, Clima Organizacional)',
        type: 'text',
        required: true,
      },
      {
        name: 'nivel_exposicao',
        label: 'Nível de Exposição Coletivo (Baixo, Médio, Alto)',
        type: 'text',
        required: true,
      },
      {
        name: 'medida_prevencao_coletiva',
        label: 'Medida Preventiva Organizacional / Coletiva',
        type: 'textarea',
        span: 2,
      },
      { name: 'responsavel_monitoramento', label: 'Responsável pelo Monitoramento', type: 'text' },
      { name: 'data_revisao', label: 'Data de Revisão Periódica', type: 'date' },
    ],
    statusField: 'situacao',
    statusOptions: ['Identificado no GRO', 'Plano em Execução', 'Controlado', 'Em Monitoramento'],
  }

  const planoAcaoCfg = SST_SCREEN_CONFIGS['action_plans'] || {
    collection: 'sst_action_plans',
    title: 'Plano de Ação do PGR (5W2H)',
    fields: [
      {
        name: 'titulo_acao',
        label: 'O Quê (Ação / Medida Preventiva)',
        type: 'text',
        required: true,
      },
      { name: 'motivo_risco', label: 'Por Quê (Risco Relacionado)', type: 'text', required: true },
      { name: 'responsavel', label: 'Quem (Responsável)', type: 'text', required: true },
      { name: 'prazo_limite', label: 'Quando (Prazo Limite)', type: 'date' },
      { name: 'onde_setor', label: 'Onde (Setor / GHE)', type: 'text' },
      { name: 'como_implementar', label: 'Como (Método de Controle)', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Não Iniciada', 'Em Andamento', 'Concluída', 'Eficácia Verificada'],
  }

  const aprCfg = SST_SCREEN_CONFIGS['apr'] || {
    collection: 'sst_apr',
    title: 'APR — Análise Preliminar de Risco',
    fields: [
      {
        name: 'atividade_analisada',
        label: 'Atividade / Operação Crítica',
        type: 'text',
        required: true,
      },
      { name: 'local_execucao', label: 'Local da Execução', type: 'text', required: true },
      { name: 'elaborador', label: 'Técnico / Engenheiro Elaborador', type: 'text' },
      { name: 'data_elaboracao', label: 'Data Elaboração', type: 'date' },
      { name: 'epis_epcs_obrigatorios', label: 'EPIs e EPCs Obrigatórios', type: 'text' },
      { name: 'etapas_bloqueios', label: 'Passo a Passo e Bloqueios', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Aprovada', 'Pendente de Validação', 'Vencida', 'Cancelada'],
  }

  const gestaoMudancaCfg = SST_ENTERPRISE_SCREEN_CONFIGS['management_of_change'] || {
    collection: 'sst_management_of_change',
    title: 'Gestão de Mudança (MOC — Processos, Layout, Equipamentos)',
    fields: [
      { name: 'titulo_mudanca', label: 'Título da Mudança', type: 'text', required: true },
      {
        name: 'tipo_mudanca',
        label: 'Tipo (Layout, Máquina Nova, Procedimento, Substância Química)',
        type: 'text',
        required: true,
      },
      {
        name: 'impacto_previsto_sst',
        label: 'Impacto Previsto na Segurança e Saúde',
        type: 'textarea',
        span: 2,
      },
      { name: 'aprovador_sesmt', label: 'Parecer SESMT / Engenharia', type: 'text' },
      { name: 'data_implantacao', label: 'Data Prevista de Implantação', type: 'date' },
    ],
    statusField: 'situacao',
    statusOptions: ['Proposta', 'Em Análise de Risco', 'Aprovada com Restrições', 'Concluída'],
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="inventario" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="inventario"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> Inventário de Riscos
          </TabsTrigger>
          <TabsTrigger
            value="matriz"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Grid className="w-3.5 h-3.5 mr-1.5" /> Matriz de Risco
          </TabsTrigger>
          <TabsTrigger
            value="ambientes"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Building className="w-3.5 h-3.5 mr-1.5" /> Ambientes
          </TabsTrigger>
          <TabsTrigger
            value="ghe"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Users2 className="w-3.5 h-3.5 mr-1.5" /> Grupos de Exposição (GHE)
          </TabsTrigger>
          <TabsTrigger
            value="avaliacoes"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Wind className="w-3.5 h-3.5 mr-1.5" /> Avaliações Ambientais
          </TabsTrigger>
          <TabsTrigger
            value="psicossociais"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Brain className="w-3.5 h-3.5 mr-1.5" /> Riscos Psicossociais (NR-1)
          </TabsTrigger>
          <TabsTrigger
            value="plano_acao"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <ListTodo className="w-3.5 h-3.5 mr-1.5" /> Plano de Ação
          </TabsTrigger>
          <TabsTrigger
            value="apr"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <FileCheck2 className="w-3.5 h-3.5 mr-1.5" /> APR
          </TabsTrigger>
          <TabsTrigger
            value="mudanca"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Gestão de Mudança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventario" className="mt-4">
          <RhGenericScreen config={inventarioCfg} />
        </TabsContent>

        <TabsContent value="matriz" className="mt-4">
          <RhGenericScreen config={matrizCfg} />
        </TabsContent>

        <TabsContent value="ambientes" className="mt-4">
          <RhGenericScreen config={ambientesCfg} />
        </TabsContent>

        <TabsContent value="ghe" className="mt-4">
          <RhGenericScreen config={gheCfg} />
        </TabsContent>

        <TabsContent value="avaliacoes" className="mt-4">
          <RhGenericScreen config={avalAmbientaisCfg} />
        </TabsContent>

        <TabsContent value="psicossociais" className="mt-4 space-y-4">
          <Card className="border-2 border-emerald-600/30 bg-emerald-50/40">
            <CardContent className="p-4 flex items-start gap-3 text-xs">
              <Info className="w-5 h-5 text-[#005B2E] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#005B2E] text-sm">
                  Conformidade NR-1 — Gestão de Riscos Psicossociais no Trabalho (Redação Vigente
                  desde 26/05/2026)
                </p>
                <p className="text-muted-foreground mt-1 leading-relaxed">
                  Esta aba atende expressamente à exigência da NR-1 que inclui fatores psicossociais
                  no Gerenciamento de Riscos Ocupacionais (GRO/PGR). Trata-se da identificação de
                  fatores organizacionais de risco coletivo (sobrecarga, jornadas abusivas, assédio,
                  pressão excessiva) e planos de prevenção do trabalho —{' '}
                  <strong>
                    NÃO é diagnóstico clínico individual de transtornos mentais nem pesquisa de
                    clima/satisfação
                  </strong>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
          <RhGenericScreen config={riscosPsicossociaisCfg} />
        </TabsContent>

        <TabsContent value="plano_acao" className="mt-4">
          <RhGenericScreen config={planoAcaoCfg} />
        </TabsContent>

        <TabsContent value="apr" className="mt-4">
          <RhGenericScreen config={aprCfg} />
        </TabsContent>

        <TabsContent value="mudanca" className="mt-4">
          <RhGenericScreen config={gestaoMudancaCfg} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
