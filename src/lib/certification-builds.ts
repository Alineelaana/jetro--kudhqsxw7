import type { BuildDef, BuildFieldDef } from './certification-types'

const f = (key: string, label: string, multiline = false): BuildFieldDef =>
  multiline ? { key, label, multiline } : { key, label }

const SC = [
  'Todas as seções possuem evidências técnicas verificáveis?',
  'Não há campos com placeholders ou textos genéricos?',
  'As conclusões são baseadas em evidências documentadas?',
  'A revisão interna foi executada e validada?',
]

export const BUILDS: BuildDef[] = [
  {
    number: 1,
    name: 'Inventário Funcional',
    description:
      'Inventário funcional completo cobrindo módulos, features, telas, regras de negócio, relatórios e automações.',
    itemFields: [
      f('name', 'Nome'),
      f('area', 'Área/Módulo'),
      f('description', 'Descrição', true),
      f('users', 'Usuários Envolvidos'),
      f('flow', 'Trigger/Fluxo', true),
      f('evidence', 'Evidência', true),
    ],
    reviewChecklist: [
      ...SC,
      'As regras de negócio foram inventariadas?',
      'Relatórios e automações foram incluídos?',
    ],
  },
  {
    number: 2,
    name: 'Inventário Técnico',
    description:
      'Inventário técnico cobrindo frontend, backend, runtime, env vars, persistência e componentes de suporte.',
    itemFields: [
      f('name', 'Nome'),
      f('category', 'Categoria'),
      f('purpose', 'Propósito'),
      f('details', 'Detalhes Técnicos', true),
      f('evidence', 'Evidência', true),
    ],
    reviewChecklist: [
      ...SC,
      'Dependências técnicas foram identificadas?',
      'Pontos de configuração e restrições foram documentados?',
    ],
  },
  {
    number: 3,
    name: 'Inventário Arquitetural',
    description:
      'Inventário arquitetural cobrindo camadas, módulos, fronteiras, fluxos de comunicação, padrões e decisões.',
    itemFields: [
      f('name', 'Nome'),
      f('responsibility', 'Responsabilidade'),
      f('relationships', 'Relacionamentos', true),
      f('pattern', 'Padrão Observado'),
      f('evidence', 'Evidência', true),
    ],
    reviewChecklist: [
      ...SC,
      'Decisões arquiteturais foram registradas no RODA?',
      'Fronteiras entre módulos estão claras?',
    ],
  },
  {
    number: 4,
    name: 'Inventário das APIs',
    description:
      'Catálogo completo de APIs incluindo endpoints públicos e rotas internas do backend.',
    itemFields: [
      f('endpoint', 'Endpoint'),
      f('method', 'Método HTTP'),
      f('purpose', 'Propósito', true),
      f('permissions', 'Permissões'),
      f('request', 'Comportamento Request', true),
      f('response', 'Comportamento Response', true),
      f('dependencies', 'Dependências'),
      f('errors', 'Tratamento de Erros', true),
      f('source', 'Rota/Service de Origem'),
    ],
    reviewChecklist: [
      ...SC,
      'Todas as rotas customizadas foram catalogadas?',
      'Cada API referencia o arquivo fonte?',
    ],
  },
  {
    number: 5,
    name: 'Inventário das Collections',
    description: 'Inventário completo de collections/baseado na estrutura viva do banco de dados.',
    itemFields: [
      f('name', 'Collection'),
      f('purpose', 'Propósito', true),
      f('fields', 'Campos Principais', true),
      f('relations', 'Relacionamentos', true),
      f('indexes', 'Índices', true),
      f('rules', 'Regras de Acesso', true),
      f('evidence', 'Evidência do Schema', true),
    ],
    reviewChecklist: [
      ...SC,
      'O inventário reflete o schema vivo do banco?',
      'Cada collection tem regras de acesso documentadas?',
    ],
  },
  {
    number: 6,
    name: 'Inventário dos Hooks',
    description:
      'Inventário completo de hooks, rotas customizadas, tarefas agendadas e automações do backend.',
    itemFields: [
      f('name', 'Hook/Rota'),
      f('trigger', 'Tipo de Trigger'),
      f('purpose', 'Propósito', true),
      f('effects', 'Side Effects', true),
      f('dependencies', 'Dependências'),
      f('errorHandling', 'Tratamento de Erros', true),
      f('source', 'Arquivo Fonte'),
    ],
    reviewChecklist: [
      ...SC,
      'Todos os hooks event-driven foram catalogados?',
      'Tarefas agendadas (cron) foram incluídas?',
    ],
  },
  {
    number: 7,
    name: 'Inventário dos Componentes',
    description:
      'Inventário de componentes UI identificando reutilizáveis, duplicados e específicos de página.',
    itemFields: [
      f('name', 'Componente'),
      f('type', 'Tipo (Reutilizável/Duplicado/Específico)'),
      f('usage', 'Local de Uso', true),
      f('responsibility', 'Responsabilidade', true),
      f('props', 'Props/Contrato', true),
      f('reuse', 'Oportunidades de Reuso', true),
      f('evidence', 'Evidência', true),
    ],
    reviewChecklist: [
      ...SC,
      'Componentes duplicados foram identificados?',
      'Oportunidades de reuso foram documentadas?',
    ],
  },
  {
    number: 8,
    name: 'Inventário dos Serviços',
    description:
      'Inventário de serviços frontend, backend, helpers e camadas de lógica de negócio.',
    itemFields: [
      f('name', 'Serviço'),
      f('responsibility', 'Responsabilidade', true),
      f('dependencies', 'Dependências', true),
      f('consumers', 'Consumidores', true),
      f('findings', 'Findings/Sobreposição', true),
    ],
    reviewChecklist: [
      ...SC,
      'Responsabilidades sobrepostas foram documentadas?',
      'Todos os serviços frontend e backend foram cobertos?',
    ],
  },
  {
    number: 9,
    name: 'Inventário das Integrações',
    description:
      'Inventário de integrações com sistemas conectados, protocolos, ambiente e status de sincronização.',
    itemFields: [
      f('name', 'Integração'),
      f('type', 'Tipo'),
      f('systems', 'Sistemas Conectados', true),
      f('protocols', 'Protocolos'),
      f('environment', 'Ambiente'),
      f('syncStatus', 'Status de Sync'),
      f('failures', 'Modos de Falha', true),
      f('logs', 'Logs Associados', true),
      f('evidence', 'Evidência', true),
    ],
    reviewChecklist: [
      ...SC,
      'Modos de falha foram identificados?',
      'Status atual de cada integração foi verificado?',
    ],
  },
  {
    number: 10,
    name: 'Inventário das Telas',
    description:
      'Inventário de todas as telas/rotas da aplicação, incluindo home page e módulos funcionais.',
    itemFields: [
      f('name', 'Tela'),
      f('route', 'Rota/URL'),
      f('purpose', 'Propósito', true),
      f('features', 'Principais Features', true),
      f('components', 'Componentes Relacionados', true),
      f('services', 'Serviços Relacionados', true),
      f('apis', 'APIs Relacionadas', true),
      f('evidence', 'Evidência', true),
    ],
    reviewChecklist: [
      ...SC,
      'Todas as rotas do App.tsx foram cobertas?',
      'Cada tela referencia componentes e serviços?',
    ],
  },
  {
    number: 11,
    name: 'Matriz de Riscos',
    description:
      'Matriz de riscos com probabilidade, impacto, severidade, mitigação e status, derivada das evidências.',
    itemFields: [
      f('risk', 'Risco', true),
      f('category', 'Categoria'),
      f('probability', 'Probabilidade'),
      f('impact', 'Impacto'),
      f('severity', 'Severidade'),
      f('evidence', 'Evidência', true),
      f('mitigation', 'Mitigação', true),
      f('responsible', 'Área Responsável'),
      f('status', 'Status Atual'),
    ],
    reviewChecklist: [
      ...SC,
      'Cada risco possui justificativa técnica?',
      'Os riscos foram derivados das evidências dos inventários?',
    ],
  },
  {
    number: 12,
    name: 'Matriz de Débito Técnico',
    description:
      'Matriz de débito técnico com causa raiz, impacto, esforço de correção, prioridade e remediação.',
    itemFields: [
      f('item', 'Item', true),
      f('area', 'Área'),
      f('description', 'Descrição', true),
      f('rootCause', 'Causa Raiz', true),
      f('impact', 'Impacto', true),
      f('effort', 'Esforço de Correção'),
      f('priority', 'Prioridade'),
      f('remediation', 'Remediação', true),
      f('source', 'Evidence/Inventário de Origem'),
    ],
    reviewChecklist: [
      ...SC,
      'Cada item referencia o inventário que o identificou?',
      'A priorização foi justificada tecnicamente?',
    ],
  },
  {
    number: 13,
    name: 'Plano de Correções',
    description:
      'Plano de correções vinculado a riscos e débito técnico, com sequência de execução e critérios de aceite.',
    itemFields: [
      f('item', 'Item', true),
      f('source', 'Finding de Origem'),
      f('action', 'Ação Corretiva', true),
      f('priority', 'Prioridade'),
      f('sequence', 'Sequência de Execução'),
      f('team', 'Equipe Responsável'),
      f('acceptance', 'Critérios de Aceite', true),
      f('linked', 'Risco/Débito Vinculado'),
    ],
    reviewChecklist: [
      ...SC,
      'Cada correção está vinculada a um risco ou débito?',
      'Os critérios de aceite são verificáveis?',
    ],
  },
  {
    number: 14,
    name: 'Plano de Melhorias',
    description:
      'Plano de melhorias com benefício esperado, esforço, impacto e recomendação, vinculado a evidências.',
    itemFields: [
      f('opportunity', 'Oportunidade', true),
      f('benefit', 'Benefício Esperado', true),
      f('effort', 'Esforço'),
      f('impact', 'Impacto'),
      f('priority', 'Prioridade'),
      f('recommendation', 'Recomendação', true),
      f('linked', 'Evidence/Finding Vinculado'),
    ],
    reviewChecklist: [
      ...SC,
      'Cada melhoria está justificada com evidência?',
      'O impacto foi avaliado tecnicamente?',
    ],
  },
  {
    number: 15,
    name: 'Roadmap',
    description:
      'Roadmap evolutivo com fases, entregáveis, dependências, marcos e alinhamento com planos de correção e melhoria.',
    itemFields: [
      f('phase', 'Fase'),
      f('deliverables', 'Entregáveis', true),
      f('dependencies', 'Dependências', true),
      f('milestones', 'Marcos', true),
      f('alignCorrections', 'Alinhamento c/ Correções', true),
      f('alignImprovements', 'Alinhamento c/ Melhorias', true),
    ],
    reviewChecklist: [
      ...SC,
      'A sequência evolutiva está clara?',
      'As dependências foram mapeadas?',
    ],
  },
  {
    number: 16,
    name: 'Relatório Final do Domínio',
    description:
      'Relatório consolidado oficial do Domínio 01 com situação geral, maturidade, classificação, parecer técnico, artifacts institucionais e certificação oficial.',
    itemFields: [
      f('artifact', 'Artifact Obrigatório'),
      f('status', 'Status'),
      f('evidence', 'Evidência', true),
    ],
    reviewChecklist: [
      ...SC,
      'Todos os artifacts obrigatórios não-cobertos por builds foram incluídos?',
      'O parecer técnico conclusivo foi emitido?',
      'A certificação oficial foi definida (Certificado / Com Reservas / Não Certificado)?',
      'RODA, COP, COA, Base de Conhecimento, Lições Aprendidas e Melhoria Contínua foram atualizados?',
    ],
    institutionalSections: [
      { id: 'overall_situation', title: 'Situação Geral', description: 'Visão geral do domínio.' },
      {
        id: 'maturity_level',
        title: 'Nível de Maturidade (1-5)',
        description: 'Nível com justificativa.',
      },
      {
        id: 'classification',
        title: 'Classificação (A, B, C)',
        description: 'Classificação do domínio.',
      },
      { id: 'technical_note', title: 'Nota Técnica', description: 'Avaliação técnica final.' },
      { id: 'risk_summary', title: 'Resumo de Riscos', description: 'Consolidação de riscos.' },
      {
        id: 'debt_summary',
        title: 'Resumo de Débito Técnico',
        description: 'Consolidação de débito técnico.',
      },
      {
        id: 'opportunities',
        title: 'Oportunidades',
        description: 'Consolidação de oportunidades.',
      },
      {
        id: 'dependency_matrix',
        title: 'Matriz de Dependências',
        description: 'Dependências entre módulos.',
      },
      {
        id: 'improvement_plan',
        title: 'Plano de Melhorias Consolidado',
        description: 'Plano unificado.',
      },
      {
        id: 'final_opinion',
        title: 'Parecer Final do Architecture Council',
        description: 'Parecer técnico conclusivo.',
      },
      {
        id: 'certification_status',
        title: 'Certificação Oficial do Domínio',
        description: '✅ Certificado / 🟡 Com Reservas / ❌ Não Certificado',
      },
      {
        id: 'roda',
        title: 'RODA — Registro de Decisões Arquiteturais',
        description: 'Decisões identificadas na auditoria.',
      },
      {
        id: 'cop',
        title: 'COP — Catálogo de Oportunidades',
        description: 'Oportunidades de plataforma.',
      },
      {
        id: 'coa',
        title: 'COA — Catálogo de Ocorrências de Arquitetura',
        description: 'Ocorrências arquiteturais.',
      },
      {
        id: 'knowledge_base',
        title: 'Base Oficial de Conhecimento',
        description: 'Base atualizada com achados.',
      },
      {
        id: 'lessons_learned',
        title: 'Registro de Lições Aprendidas',
        description: 'Lições do processo.',
      },
      {
        id: 'continuous_improvement',
        title: 'Melhoria Contínua',
        description: 'Ações derivadas da auditoria.',
      },
    ],
  },
]

export const BUILD_16_DEFAULT_ITEMS = [
  'Inventário das Regras de Negócio',
  'Inventário dos Relatórios',
  'Inventário das Automações',
  'Matriz de Dependências',
  'Matriz de Oportunidades',
  'Classificação',
  'Nota Técnica',
  'Nível de Maturidade',
  'Certificação Oficial do Domínio',
].map((name) => ({ artifact: name, status: '', evidence: '' }))
