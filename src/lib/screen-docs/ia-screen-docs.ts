import type { ScreenDocEntry } from './types'

export const IA_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  // 1. Assistente de IA (/admin/ia e /admin/ia/assistente)
  '/admin/ia': {
    route: '/admin/ia',
    title: 'Assistente de IA',
    moduleGroup: 'Inteligência Artificial',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo da Tela',
      content:
        'Prover aos usuários do ERP HURAM um copiloto conversacional corporativo com capacidade de responder perguntas sobre vendas, finanças, estoque e processos operacionais, além de exibir métricas de uso e precisão.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Chat conversacional com sugestões rápidas de perguntas pré-configuradas (vendas do mês, produtos em estoque crítico, resumo financeiro).\n- Dashboard executivo com métricas de interações diárias, tempo médio de resposta, agentes ativos e taxa de precisão.\n- Atalhos para ações operacionais e limpeza de conversa ativa.\n- Isolamento e contexto operacional por empresa ativa (multitenancy).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Apenas usuários com permissão no módulo IA visualizam o assistente.\n- As consultas respeitam os dados da empresa ativa selecionada no cabeçalho ou contexto multitenant.\n- As interações são auditadas e registradas para histórico e melhoria contínua.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário digita a pergunta no campo de prompt ou clica em uma das sugestões rápidas.\n2. O assistente processa a consulta via serviços de IA integrados.\n3. A resposta contextualizada com dados reais do ERP é retornada em tempo real.\n4. O usuário pode avaliar a resposta ou continuar o diálogo.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `ai_interactions`, `ai_agents`, `ai_settings`.\n- Contexto operacional multitenant: `empresas`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Serviço de IA do ERP HURAM, agentes cadastrados e contexto de multitenancy.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewAiModule(role)` ou perfil SUP irrestrito.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `AiAssistant`, `AiDashboard` em `src/components/ai-module/`.\n- Hook: `useBrand`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        'Feedback via toast em falhas de comunicação e fallback explicativo para indisponibilidade de serviço.',
    },
  },

  '/admin/ia/assistente': {
    route: '/admin/ia/assistente',
    title: 'Assistente de IA',
    moduleGroup: 'Inteligência Artificial',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo da Tela',
      content:
        'Prover aos usuários do ERP HURAM um copiloto conversacional corporativo com capacidade de responder perguntas sobre vendas, finanças, estoque e processos operacionais, além de exibir métricas de uso e precisão.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Chat conversacional com sugestões rápidas de perguntas pré-configuradas (vendas do mês, produtos em estoque crítico, resumo financeiro).\n- Dashboard executivo com métricas de interações diárias, tempo médio de resposta, agentes ativos e taxa de precisão.\n- Atalhos para ações operacionais e limpeza de conversa ativa.\n- Isolamento e contexto operacional por empresa ativa (multitenancy).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Apenas usuários com permissão no módulo IA visualizam o assistente.\n- As consultas respeitam os dados da empresa ativa selecionada no cabeçalho ou contexto multitenant.\n- As interações são auditadas e registradas para histórico e melhoria contínua.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário digita a pergunta no campo de prompt ou clica em uma das sugestões rápidas.\n2. O assistente processa a consulta via serviços de IA integrados.\n3. A resposta contextualizada com dados reais do ERP é retornada em tempo real.\n4. O usuário pode avaliar a resposta ou continuar o diálogo.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `ai_interactions`, `ai_agents`, `ai_settings`.\n- Contexto operacional multitenant: `empresas`.',
    },
    integrations: {
      title: 'Integrações',
      content: 'Serviço de IA do ERP HURAM, agentes cadastrados e contexto de multitenancy.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controlada por `canViewAiModule(role)` ou perfil SUP irrestrito.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `AiAssistant`, `AiDashboard` em `src/components/ai-module/`.\n- Hook: `useBrand`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        'Feedback via toast em falhas de comunicação e fallback explicativo para indisponibilidade de serviço.',
    },
  },

  // 2. Agentes e Automações (/admin/ia/agentes-automacoes)
  '/admin/ia/agentes-automacoes': {
    route: '/admin/ia/agentes-automacoes',
    title: 'Agentes e Automações',
    moduleGroup: 'Inteligência Artificial',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo da Tela',
      content:
        'Centralizar a administração de agentes de IA configuráveis (vendas, cobrança, estoque), gatilhos automatizados por eventos do sistema e orquestração de fluxos em múltiplas etapas.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Sub-aba Agentes: catálogo de agentes ativos e inativos, descrição de papéis, modelos e canais de atuação.\n- Sub-aba Automações: rotinas baseadas em gatilhos (triggers) como novos pedidos, boletos vencidos ou estoque mínimo atingido.\n- Sub-aba Fluxos Inteligentes: visualização e criação de etapas sequenciais automatizadas para tratamento de processos de ponta a ponta.\n- Ativação e desativação rápida de agentes e rotinas sem necessidade de novos deploys.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Agentes desativados não processam mensagens nem consomem limites de infraestrutura.\n- Automações exigem gatilho e ação válidos antes de serem habilitadas.\n- Fluxos com falhas consecutivas disparam notificações para a esteira de suporte/administração.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O administrador acessa a aba desejada (Agentes, Automações ou Fluxos).\n2. Seleciona o item para edição ou cria uma nova definição parametrizada.\n3. Define parâmetros de execução, gatilhos e modelos.\n4. Salva e ativa o registro com validação imediata em banco.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções PocketBase: `ai_agents`, `ai_automations`, `ai_smart_flows`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        'Mecanismo de gatilhos do ERP, agendador de tarefas e serviços de orquestração de IA.',
    },
    permissions: {
      title: 'Permissões',
      content:
        'Controlada por `canViewAiModule(role)` para visualização e perfil administrativo para edição de regras.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `AiAgents`, `AiAutomations`, `AiSmartFlows` em `src/components/ai-module/`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        'Alertas de validação de formulários para campos obrigatórios de gatilhos e mensagens explicativas em falhas de requisição.',
    },
  },

  // 3. Base de Conhecimento (/admin/ia/base-conhecimento)
  '/admin/ia/base-conhecimento': {
    route: '/admin/ia/base-conhecimento',
    title: 'Base de Conhecimento e Treinamento',
    moduleGroup: 'Inteligência Artificial',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo da Tela',
      content:
        'Gerenciar o repositório de documentos institucionais, políticas e normas que alimentam o contexto do assistente (RAG), além de fornecer painel para treino e ajuste fino de respostas supervisionadas.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Sub-aba Base de Conhecimento: listagem de documentos indexados, status de indexação, categorias e contagem de itens de referência.\n- Upload e cadastro de políticas, manuais de produtos, diretrizes comerciais e FAQs.\n- Sub-aba Treinamento da IA: pares de pergunta/resposta supervisionados para refinamento contínuo.\n- Estatísticas de acurácia, histórico de treinamentos aplicados e modelos calibrados.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Documentos novos passam por processo de indexação antes de se tornarem disponíveis para consulta pelo assistente.\n- O treinamento supervisionado exige aprovação de usuário com perfil gestor ou superior.\n- Permissão restrita aos perfis com autorização de treinamento (`canManageAiTraining`).',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gestor adiciona novo documento ou define novo exemplo de pergunta/resposta na aba correspondente.\n2. O documento é processado e indexado na base vetorial/textual.\n3. O exemplo supervisionado é submetido ao pipeline de validação.\n4. Uma vez homologado, o conhecimento fica imediatamente acessível para as consultas do assistente.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `ai_knowledge_base`, `ai_training_examples`, `ai_training_sessions`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        'Mecanismo de indexação documental e pipeline de calibragem de modelos de linguagem.',
    },
    permissions: {
      title: 'Permissões',
      content:
        'Controlada por `canViewAiModule(role)` para leitura e `canManageAiTraining(role)` para ingestão e treinamento.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `AiKnowledgeBase`, `AiTrainingV2Panel` em `src/components/ai-module/`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        'Sinalização de documentos com erro de parsing/indexação com opção de reprocessamento manual.',
    },
  },

  // 4. Histórico e Aprovações (/admin/ia/historico-aprovacoes)
  '/admin/ia/historico-aprovacoes': {
    route: '/admin/ia/historico-aprovacoes',
    title: 'Histórico, Aprovações e Configurações',
    moduleGroup: 'Inteligência Artificial',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo da Tela',
      content:
        'Garantir rastreabilidade integral de todas as decisões e respostas geradas pela IA, prover mecanismo humano na esteira para validação de ações automatizadas críticas e gerenciar configurações técnicas do módulo.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Sub-aba Histórico de Interações: log completo de consultas com data, usuário, prompt, resposta e tempo de execução.\n- Filtros por período, usuário, canal e nível de satisfação do feedback.\n- Sub-aba Aprovações Humanas: fila de ações sugeridas pela IA com pendência de aprovação manual (Human-in-the-loop).\n- Sub-aba Configurações: parâmetros de modelo padrão, limiares de segurança, temperatura, timeouts e integração de provedores.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Ações com limiar crítico (ex.: cancelamentos, descontos elevados) exigem aprovação humana explícita antes de serem persistidas.\n- Histórico de auditoria é imutável para preservação de conformidade.\n- Apenas administradores podem alterar chaves de modelos e parâmetros de governança.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. A IA identifica oportunidade ou necessidade de ação sensível e enfileira na aba Aprovações.\n2. O gestor competente visualiza os detalhes, justificativa e impacto da ação.\n3. O gestor aprova, rejeita ou solicita ajuste manual.\n4. Em caso de aprovação, a ação é executada e registrada com carimbo de aprovação.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções PocketBase: `ai_interactions`, `ai_approvals`, `ai_settings`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        'Trilha de auditoria geral, esteira de aprovações transacionais e infraestrutura de IA.',
    },
    permissions: {
      title: 'Permissões',
      content:
        'Controlada por `canViewAiModule(role)` para consulta de histórico, perfil gestor para aprovações e `canChangeAiSettings(role)` para configurações.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `AiInteractionHistory`, `AiApprovals`, `AiSettingsPanel` em `src/components/ai-module/`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        'Validação de parâmetros numéricos nas configurações e proteção contra aprovação duplicada de ações concorrentes.',
    },
  },
}
