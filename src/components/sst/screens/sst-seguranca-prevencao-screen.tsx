import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { SstInvestigations } from '@/components/sst/sst-investigations'
import { SST_SCREEN_CONFIGS } from '@/lib/sst-types'
import { SST_ENTERPRISE_SCREEN_CONFIGS } from '@/lib/sst-enterprise-types'
import {
  AlertOctagon,
  FileSpreadsheet,
  AlertTriangle,
  Search,
  ClipboardCheck,
  XCircle,
  Megaphone,
  FileCheck,
  Lock,
  Flame,
  Shield,
  Users,
} from 'lucide-react'

export function SstSegurancaPrevencaoScreen() {
  const acidentesCfg = SST_SCREEN_CONFIGS['accidents'] || {
    collection: 'sst_accidents',
    title: 'Registro de Acidentes de Trabalho',
    fields: [
      { name: 'employee_name', label: 'Colaborador Acidentado', type: 'text', required: true },
      { name: 'data_acidente', label: 'Data e Hora', type: 'date', required: true },
      {
        name: 'tipo_acidente',
        label: 'Tipo (Típico, Trajeto, Doença Ocupacional)',
        type: 'text',
        required: true,
      },
      { name: 'local_exato', label: 'Local Exato da Ocorrência', type: 'text' },
      { name: 'parte_corpo_atingida', label: 'Parte do Corpo Atingida', type: 'text' },
      { name: 'houve_afastamento', label: 'Houve Afastamento (Sim/Não)', type: 'text' },
      { name: 'dias_afastamento', label: 'Dias Perdidos', type: 'number' },
      { name: 'descricao_detalhada', label: 'Descrição da Ocorrência', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Registrado', 'Em Investigação', 'CAT Emitida', 'Concluído'],
  }

  const catCfg = SST_SCREEN_CONFIGS['cat'] || {
    collection: 'sst_cat',
    title: 'CAT — Comunicação de Acidente de Trabalho (eSocial S-2210)',
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      { name: 'numero_cat', label: 'Número CAT / Protocolo eSocial', type: 'text' },
      {
        name: 'tipo_cat',
        label: 'Tipo CAT (Inicial, Reabertura, Óbito)',
        type: 'text',
        required: true,
      },
      { name: 'data_acidente', label: 'Data do Acidente', type: 'date', required: true },
      { name: 'data_emissao', label: 'Data de Emissão (até 1º dia útil)', type: 'date' },
      { name: 'atestado_cid', label: 'CID / Código da Lesão', type: 'text' },
      { name: 'crm_medico', label: 'Médico Assistente / CRM', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Pendente Envio', 'Transmitida eSocial', 'Rejeitada', 'Retificada'],
  }

  const incidentesCfg = SST_SCREEN_CONFIGS['incidents'] || {
    collection: 'sst_incidents',
    title: 'Incidentes e Quase Acidentes (Near Miss)',
    fields: [
      { name: 'titulo', label: 'Título da Ocorrência', type: 'text', required: true },
      { name: 'relator_nome', label: 'Relatado por', type: 'text' },
      { name: 'setor', label: 'Setor / Local', type: 'text', required: true },
      { name: 'data_ocorrencia', label: 'Data da Ocorrência', type: 'date' },
      {
        name: 'potencial_gravidade',
        label: 'Potencial de Gravidade (Baixo, Médio, Crítico)',
        type: 'text',
      },
      {
        name: 'descricao_condicao',
        label: 'Descrição da Condição Insegura / Quase Acidente',
        type: 'textarea',
        span: 2,
      },
    ],
    statusField: 'situacao',
    statusOptions: ['Registrado', 'Em Análise', 'Bloqueio Realizado', 'Encerrado'],
  }

  const inspecoesCfg = SST_SCREEN_CONFIGS['inspections'] || {
    collection: 'sst_inspections',
    title: 'Inspeções de Segurança e Rotas Periódicas',
    fields: [
      { name: 'setor_inspecionado', label: 'Setor Inspecionado', type: 'text', required: true },
      { name: 'inspetor_nome', label: 'Inspetor / Técnico SST', type: 'text', required: true },
      { name: 'data_inspecao', label: 'Data Inspeção', type: 'date', required: true },
      {
        name: 'tipo_inspecao',
        label: 'Tipo (Rotina, Equipamentos, Extintores, NR-12)',
        type: 'text',
      },
      { name: 'itens_conformes', label: 'Qtd Itens Conformes', type: 'number' },
      { name: 'itens_nao_conformes', label: 'Qtd Itens Não Conformes', type: 'number' },
      { name: 'apontamentos', label: 'Apontamentos Gerais', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Realizada', 'Com Pendências Críticas', 'Regular'],
  }

  const ncfCfg = SST_SCREEN_CONFIGS['non_conformities'] || {
    collection: 'sst_non_conformities',
    title: 'Não Conformidades e Desvios de Segurança',
    fields: [
      {
        name: 'origem',
        label: 'Origem (Inspeção, Auditoria, Denúncia, Incidente)',
        type: 'text',
        required: true,
      },
      { name: 'setor', label: 'Setor / Máquina', type: 'text', required: true },
      {
        name: 'descricao_desvio',
        label: 'Descrição da Não Conformidade',
        type: 'textarea',
        span: 2,
      },
      { name: 'acao_imediata', label: 'Ação de Contenção Imediata', type: 'text' },
      { name: 'responsavel_correcao', label: 'Responsável Correção', type: 'text' },
      { name: 'prazo_resolucao', label: 'Prazo Limite', type: 'date' },
    ],
    statusField: 'situacao',
    statusOptions: ['Aberta', 'Em Tratativa', 'Resolvida', 'Eficaz'],
  }

  const ddsCfg = SST_SCREEN_CONFIGS['dds'] || {
    collection: 'sst_dds',
    title: 'DDS — Diálogo Diário de Segurança',
    fields: [
      { name: 'tema_abordado', label: 'Tema Abordado', type: 'text', required: true },
      { name: 'ministrante', label: 'Ministrante / Líder', type: 'text', required: true },
      { name: 'data_realizacao', label: 'Data Realização', type: 'date', required: true },
      { name: 'setor', label: 'Setor / Turma', type: 'text' },
      { name: 'numero_participantes', label: 'Qtd Participantes', type: 'number' },
      { name: 'resumo_orientacoes', label: 'Orientações Passadas', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Realizado com Lista', 'Agendado', 'Pendente Assinaturas'],
  }

  const ptCfg = SST_SCREEN_CONFIGS['work_permits'] || {
    collection: 'sst_work_permits',
    title: 'PT — Permissão de Trabalho Especial',
    fields: [
      {
        name: 'tipo_trabalho',
        label: 'Tipo (Altura NR-35, Espaço Confinado NR-33, Quente/Solda, Eletricidade NR-10)',
        type: 'text',
        required: true,
      },
      { name: 'local_trabalho', label: 'Local Específico', type: 'text', required: true },
      { name: 'empresa_executante', label: 'Executante (Próprio ou Terceiro)', type: 'text' },
      { name: 'autorizador_sst', label: 'Emissor / Autorizador SST', type: 'text', required: true },
      { name: 'validade_inicio', label: 'Início da Validade', type: 'date' },
      { name: 'validade_fim', label: 'Término da Validade', type: 'date' },
    ],
    statusField: 'situacao',
    statusOptions: ['Emitida', 'Trabalho em Execução', 'Encerrada', 'Cancelada'],
  }

  const lotoCfg = SST_ENTERPRISE_SCREEN_CONFIGS['lockout'] || {
    collection: 'sst_lockout',
    title: 'LOTO — Bloqueio e Etiquetagem de Energias Perigosas',
    fields: [
      {
        name: 'equipamento_maquina',
        label: 'Equipamento / TAG Máquina',
        type: 'text',
        required: true,
      },
      {
        name: 'tipo_energia',
        label: 'Energia Bloqueada (Elétrica, Pneumática, Hidráulica, Térmica)',
        type: 'text',
        required: true,
      },
      {
        name: 'responsavel_bloqueio',
        label: 'Profissional Autorizado LOTO',
        type: 'text',
        required: true,
      },
      { name: 'data_bloqueio', label: 'Data e Hora Bloqueio', type: 'date' },
      { name: 'data_desbloqueio', label: 'Data Desbloqueio', type: 'date' },
      {
        name: 'etapas_teste_zero',
        label: 'Teste de Energia Zero Realizado (Sim/Não)',
        type: 'text',
      },
    ],
    statusField: 'situacao',
    statusOptions: ['Bloqueado', 'Em Manutenção', 'Desbloqueado e Testado'],
  }

  const emergenciasCfg = SST_ENTERPRISE_SCREEN_CONFIGS['emergencies'] || {
    collection: 'sst_emergencies',
    title: 'PAE — Plano de Ação de Emergências e Simulados',
    fields: [
      {
        name: 'tipo_emergencia',
        label: 'Cenário (Incêndio, Vazamento Químico, Resgate em Altura, Evacuação)',
        type: 'text',
        required: true,
      },
      { name: 'data_simulado', label: 'Data do Simulado', type: 'date' },
      { name: 'tempo_evacuacao_minutos', label: 'Tempo Evacuação (min)', type: 'number' },
      {
        name: 'pontos_atencao',
        label: 'Falhas e Oportunidades Identificadas',
        type: 'textarea',
        span: 2,
      },
    ],
    statusField: 'situacao',
    statusOptions: ['Planejado', 'Executado com Sucesso', 'Reprovado / Reagendar'],
  }

  const brigadaCfg = SST_ENTERPRISE_SCREEN_CONFIGS['brigade'] || {
    collection: 'sst_brigade',
    title: 'Brigada de Incêndio e Primeiros Socorros',
    fields: [
      { name: 'employee_name', label: 'Brigadista (Colaborador)', type: 'text', required: true },
      { name: 'turno_setor', label: 'Turno / Setor de Atuação', type: 'text' },
      { name: 'data_formacao', label: 'Data Formação / Reciclagem', type: 'date' },
      { name: 'data_validade', label: 'Validade do Certificado', type: 'date' },
      { name: 'funcao_brigada', label: 'Função (Líder, Socorrista, Combate)', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Ativo', 'Reciclagem Pendente', 'Desligado'],
  }

  const cipaCfg = SST_ENTERPRISE_SCREEN_CONFIGS['cipa'] || {
    collection: 'sst_cipa',
    title: 'CIPA — Comissão Interna de Prevenção de Acidentes (NR-5)',
    fields: [
      { name: 'gestao_ano', label: 'Gestão / Mandato', type: 'text', required: true },
      {
        name: 'representante',
        label: 'Representante (Eleito / Indicado Empregador)',
        type: 'text',
        required: true,
      },
      {
        name: 'cargo_cipa',
        label: 'Cargo (Presidente, Vice, Secretário, Titular, Suplente)',
        type: 'text',
        required: true,
      },
      { name: 'data_eleicao', label: 'Data Eleição / Posse', type: 'date' },
      { name: 'estabilidade_ate', label: 'Data Limite Estabilidade Provisória', type: 'date' },
    ],
    statusField: 'situacao',
    statusOptions: ['Mandato Vigente', 'Processo Eleitoral', 'Mandato Encerrado'],
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="acidentes" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="acidentes"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <AlertOctagon className="w-3.5 h-3.5 mr-1.5" /> Acidentes
          </TabsTrigger>
          <TabsTrigger
            value="cat"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> CAT (S-2210)
          </TabsTrigger>
          <TabsTrigger
            value="incidentes"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Incidentes
          </TabsTrigger>
          <TabsTrigger
            value="investigacoes"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Search className="w-3.5 h-3.5 mr-1.5" /> Investigações
          </TabsTrigger>
          <TabsTrigger
            value="inspecoes"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" /> Inspeções
          </TabsTrigger>
          <TabsTrigger
            value="ncf"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Não Conformidades
          </TabsTrigger>
          <TabsTrigger
            value="dds"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Megaphone className="w-3.5 h-3.5 mr-1.5" /> DDS
          </TabsTrigger>
          <TabsTrigger
            value="pt"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <FileCheck className="w-3.5 h-3.5 mr-1.5" /> Permissão (PT)
          </TabsTrigger>
          <TabsTrigger
            value="loto"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Lock className="w-3.5 h-3.5 mr-1.5" /> Bloqueio (LOTO)
          </TabsTrigger>
          <TabsTrigger
            value="emergencias"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Flame className="w-3.5 h-3.5 mr-1.5" /> Emergências
          </TabsTrigger>
          <TabsTrigger
            value="brigada"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Shield className="w-3.5 h-3.5 mr-1.5" /> Brigada
          </TabsTrigger>
          <TabsTrigger
            value="cipa"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Users className="w-3.5 h-3.5 mr-1.5" /> CIPA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="acidentes" className="mt-4">
          <RhGenericScreen config={acidentesCfg} />
        </TabsContent>

        <TabsContent value="cat" className="mt-4">
          <RhGenericScreen config={catCfg} />
        </TabsContent>

        <TabsContent value="incidentes" className="mt-4">
          <RhGenericScreen config={incidentesCfg} />
        </TabsContent>

        <TabsContent value="investigacoes" className="mt-4">
          <SstInvestigations />
        </TabsContent>

        <TabsContent value="inspecoes" className="mt-4">
          <RhGenericScreen config={inspecoesCfg} />
        </TabsContent>

        <TabsContent value="ncf" className="mt-4">
          <RhGenericScreen config={ncfCfg} />
        </TabsContent>

        <TabsContent value="dds" className="mt-4">
          <RhGenericScreen config={ddsCfg} />
        </TabsContent>

        <TabsContent value="pt" className="mt-4">
          <RhGenericScreen config={ptCfg} />
        </TabsContent>

        <TabsContent value="loto" className="mt-4">
          <RhGenericScreen config={lotoCfg} />
        </TabsContent>

        <TabsContent value="emergencias" className="mt-4">
          <RhGenericScreen config={emergenciasCfg} />
        </TabsContent>

        <TabsContent value="brigada" className="mt-4">
          <RhGenericScreen config={brigadaCfg} />
        </TabsContent>

        <TabsContent value="cipa" className="mt-4">
          <RhGenericScreen config={cipaCfg} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
