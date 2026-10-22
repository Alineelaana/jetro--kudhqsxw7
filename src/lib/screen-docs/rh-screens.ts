import type { ScreenDocEntry } from './types'

/**
 * DOCUMENTAÇÃO TÉCNICA E FUNCIONAL DAS 7 TELAS UNIFICADAS DE RECURSOS HUMANOS (RH)
 * Versão pós-reestruturação: arquitetura com abas internas, avaliação de competências,
 * Nine-Box, Talent Review, Clima e Engajamento, Organograma e Central de Aprovações.
 */
export const RH_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  // -------------------------------------------------------------
  // RH 1. PAINEL RH (DASHBOARD ESTRATÉGICO)
  // -------------------------------------------------------------
  '/admin/rh': {
    route: '/admin/rh',
    title: 'Painel Estratégico de Recursos Humanos',
    moduleGroup: 'Recursos Humanos (RH)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Apresentar o cockpit executivo e analítico do RH Estratégico, fornecendo indicadores consolidados de headcount, turnover (rotatividade), absenteísmo, eNPS de clima, distribuição de talentos e atalhos diretos para os subsistemas de gestão de pessoas.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cards com indicadores-chave em tempo real: Total de Colaboradores, Taxa de Turnover Acumulada, Índice de Absenteísmo do Mês, eNPS (Clima Organizacional) e Vagas Abertas.\n- Gráficos executivos de distribuição de headcount por diretoria/departamento e tempo médio de casa (tenure).\n- Painel de status dos ciclos ativos de Avaliação de Competências e Pesquisas de Clima.\n- Atalhos rápidos de navegação para: Gestão de Talentos, Carreira e Desenvolvimento, Clima e Engajamento, Estrutura Organizacional, Jornada do Colaborador e Aprovações RH.\n- Lista de ações prioritárias do RH (aprovações pendentes, feedbacks não respondidos, planos de ação vencidos).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O cálculo de Turnover utiliza a fórmula padrão: ((Admissões + Demissões) / 2) / Headcount Médio do período, multiplicado por 100.\n- O cálculo de Absenteísmo considera: (Horas de Falta e Atrasos Não Justificados / Horas Totais Trabalháveis) * 100.\n- Indicadores respeitam o escopo da filial ativa ou visão multiempresa conforme perfil do usuário.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gestor de RH ou executivo acessa a rota `/admin/rh`.\n2. O painel carrega dados agregados das coleções `rh_employees`, `rh_competency_evaluations`, `rh_climate_surveys` e `rh_approval_requests`.\n3. O usuário monitora tendências de rotatividade e clima e clica nos atalhos para intervir nas telas analíticas correspondentes.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `rh_employees`, `rh_competency_evaluations`, `rh_climate_surveys`, `rh_approval_requests`, `dp_collaborators`.\n- Hooks: `useRealtime` para atualização instantânea dos indicadores.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Conexão com Departamento Pessoal para contagem de admissões e desligamentos.\n- Alimentação das pesquisas de clima e ciclos de desempenho para consolidação de índices.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: controlada por `canViewRH(role)` (SUP, ADMIN, RH, DIRETORIA e GERENTES autorizados).\n- Edição de metas e parâmetros: restrita a gestores de RH e Administradores.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `RhPainelScreen`, `Card`, `Badge`, `Button`.\n- Serviços: `src/services/rh.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Ausência de dados de avaliações ou pesquisas resulta em cards informativos sugerindo a inicialização do primeiro ciclo.\n- Falhas de carregamento em cards individuais não interrompem os demais widgets.',
    },
  },

  // -------------------------------------------------------------
  // RH 2. GESTÃO DE TALENTOS
  // -------------------------------------------------------------
  '/admin/rh/gestao-talentos': {
    route: '/admin/rh/gestao-talentos',
    title: 'Gestão de Talentos e Desempenho',
    moduleGroup: 'Recursos Humanos (RH)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar os processos de avaliação de desempenho e competências, matriz 9-Box, comitê de calibração, feedback contínuo, PDI (Plano de Desenvolvimento Individual), planos de sucessão e Talent Review corporativo.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Avaliação de Competências": gestão de ciclos avaliativos (autoavaliação, avaliação do gestor, 180º e 360º), notas por competências comportamentais e técnicas, com status (Pendente, Em Andamento, Concluída, Calibrada).\n- Aba "Calibração": sessões de comitê de calibração para ajuste colegiado de notas com ata e deliberações registradas.\n- Aba "Feedback": canal de feedback contínuo (elogios, pontos a desenvolver, reuniões 1:1) com visibilidade pública, gestor ou privada.\n- Aba "PDI": acompanhamento estruturado do Plano de Desenvolvimento Individual na metodologia 70-20-10, com competência alvo, ações, prazos, mentores e evidências.\n- Aba "9 Box" (`RhNineBox`): matriz bidimensional visual (Potencial × Desempenho) com 9 quadrantes e classificação dos colaboradores.\n- Aba "Talent Review" (`RhTalentReview`): painel analítico com filtros avançados por departamento, cargo e quadrante para identificação de top talents e riscos de retenção.\n- Aba "Sucessão": mapeamento de cargos críticos, titulares atuais, sucessores potenciais, régua de prontidão (imediato, 1 ano, 2-3 anos) e planos de aceleração.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Avaliações de competências fechadas não podem ser alteradas sem reabertura formal pelo administrador do ciclo.\n- A movimentação de quadrante no 9-Box durante o comitê de calibração exige justificativa e registro na ata da sessão.\n- Planos de sucessão são confidenciais e restritos a gestores de nível executivo e RH estratégico.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O RH abre um ciclo na aba "Avaliação de Competências".\n2. Colaboradores e líderes respondem os questionários avaliativos.\n3. O comitê se reúne na aba "Calibração" para nivelar notas e posicionar talentos na aba "9 Box".\n4. Na aba "Talent Review", são identificadas as pessoas-chave e definidos os planos de sucessão na aba "Sucessão".\n5. Gestores e colaboradores estabelecem os PDIs na aba "PDI" e trocam alinhamentos na aba "Feedback".',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `rh_competency_evaluations`, `rh_calibration_sessions`, `rh_feedbacks`, `rh_pdi`, `rh_nine_box`, `rh_talent_review`, `rh_succession_plans`.\n- Dados dos colaboradores integrados de `rh_employees` e `dp_collaborators`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com Carreira e Desenvolvimento para vincular necessidades de treinamento originadas do PDI.\n- Conexão com a Central de Aprovações RH para homologação de promoções resultantes do 9-Box.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso completo: SUP e RH Estratégico.\n- Gestores: visualização e preenchimento de liderados diretos e indiretos.\n- Colaboradores: autoavaliação, visualização do próprio PDI e feedbacks autorizados.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `RhGestaoTalentosScreen`, `RhNineBox`, `RhTalentReview`, `RhGenericScreen`.\n- Configurações: `RH_SCREEN_CONFIGS`, `RH_ENTERPRISE_CONFIGS`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de submissão com notas ou campos obrigatórios faltantes.\n- Alerta visual em caso de sessões de calibração sem ata salva.',
    },
  },

  // -------------------------------------------------------------
  // RH 3. CARREIRA E DESENVOLVIMENTO
  // -------------------------------------------------------------
  '/admin/rh/carreira-desenvolvimento': {
    route: '/admin/rh/carreira-desenvolvimento',
    title: 'Carreira e Desenvolvimento',
    moduleGroup: 'Recursos Humanos (RH)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar as trilhas de capacitação corporativa, catálogo de treinamentos internos e externos, catálogo formal de competências, mapeamento de planos de carreira (carreira em Y, W e linear) e programas de liderança.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Treinamentos": controle de cursos corporativos, turmas abertas, carga horária, modalidade (EAD/presencial), custos e controle de presença/conclusão.\n- Aba "Matriz de Competências": catálogo padronizado de competências organizacionais e específicas com descrição detalhada e níveis de proficiência (Básico a Especialista).\n- Aba "Trilhas de Aprendizagem": sequenciamento de cursos e conteúdos obrigatórios/opcionais por cargo ou família funcional.\n- Aba "Planos de Carreira": estruturação de trajetórias profissionais, requisitos de promoção entre níveis (Júnior, Pleno, Sênior, Especialista/Gestão) e faixas de remuneração associadas.\n- Aba "Certificações e Validades": acompanhamento de certificados técnicos e profissionais com datas de expiração e reciclagem programada.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Promoções automáticas em planos de carreira exigem conclusão de 100% dos treinamentos obrigatórios da trilha correspondente.\n- Treinamentos com custos rateados atualizam o centro de custo do departamento demandante.\n- A emissão de certificado exige frequência mínima de 75% e nota de aproveitamento mínima de 7.0 em avaliações de reação/aprendizagem.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O analista de T&D cadastra o curso na aba "Treinamentos" e o insere nas "Trilhas de Aprendizagem".\n2. Colaboradores são matriculados e participam das capacitações.\n3. Após a conclusão, os certificados são computados no histórico do profissional.\n4. O comitê de pessoas consulta os pré-requisitos na aba "Planos de Carreira" para embasar movimentações verticais e horizontais.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `rh_trainings`, `rh_competencies`, `rh_learning_tracks`, `rh_career_plans`, `rh_training_enrollments`.\n- Associação com `rh_employees`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Conexão com PDI para recomendação de treinamentos direcionados.\n- Integração com SST para treinamentos com exigência de Norma Regulamentadora (NR-10, NR-35, CIPA).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Gestão do catálogo e criação de turmas: restrita a RH (T&D) e Administradores.\n- Matrícula e consulta de trilhas: gestores e colaboradores conforme visibilidade configurada.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `RhCarreiraDesenvolvimentoScreen`, `RhGenericScreen`.\n- Tipos e configurações em `src/lib/rh-types.ts` e `src/lib/rh-enterprise-types.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de matrícula de colaborador em treinamentos com turmas esgotadas.\n- Validação de datas de realização anteriores à data de cadastro.',
    },
  },

  // -------------------------------------------------------------
  // RH 4. CLIMA E ENGAJAMENTO
  // -------------------------------------------------------------
  '/admin/rh/clima-engajamento': {
    route: '/admin/rh/clima-engajamento',
    title: 'Clima e Engajamento',
    moduleGroup: 'Recursos Humanos (RH)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Conduzir pesquisas periódicas de clima organizacional, pesquisas de pulso contínuas, apuração do eNPS (Employee Net Promoter Score), programas de reconhecimento entre pares e monitoramento de planos de ação de melhoria de ambiente.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Pesquisas de Clima": criação e disparo de pesquisas institucionais com dimensões de liderança, remuneração, ambiente, comunicação e segurança psicológica.\n- Aba "Pesquisas de Pulso": questionários rápidos (micro-surveys) de 2 a 5 perguntas para aferição contínua da satisfação semanal/quinzenal.\n- Aba "eNPS e Indicadores": painel analítico com cálculo automático de promotores, neutros e detratores com pontuação de -100 a +100.\n- Aba "Reconhecimento Corporativo": mural de incentivo e elogios públicos entre colegas com badges culturais e pontos de valor.\n- Aba "Planos de Ação": acompanhamento de planos de melhoria pós-pesquisa (metodologia 5W2H) com responsáveis, status e prazos.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Respostas de pesquisas de clima e eNPS são rigorosamente ANÔNIMAS para garantir a integridade das respostas e conformidade com a LGPD.\n- Departamentos com menos de 5 respondentes têm seus dados consolidados na diretoria geral para evitar a identificação indireta de indivíduos.\n- eNPS apurado pela fórmula: % Promotores (notas 9 e 10) - % Detratores (notas 0 a 6).',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O time de RH parametriza a pesquisa e dispara para os colaboradores.\n2. Os colaboradores respondem de forma confidencial.\n3. O sistema calcula automaticamente o eNPS e consolida gráficos por dimensão.\n4. Gestores e RH analisam os pontos fracos e criam planos de ação na aba "Planos de Ação".\n5. Paralelamente, o time incentiva o mural na aba "Reconhecimento Corporativo".',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `rh_climate_surveys`, `rh_pulse_surveys`, `rh_enps_responses`, `rh_recognitions`, `rh_action_plans`.\n- Dados agregados sem identificação nominal nas respostas das pesquisas.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com a Tela Inicial Inteligente para exibição de lembretes de pesquisas ativas.\n- Integração com Gestão de Riscos SST (aba Riscos Psicossociais) para cruzar percepções de estresse e sobrecarga.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Criação de pesquisas e planos de ação: RH e Administradores.\n- Visualização de relatórios consolidados: Gestores (com mínimo de respondentes) e RH.\n- Painel de reconhecimentos: todos os colaboradores autenticados.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `RhClimaEngajamentoScreen`, `RhGenericScreen`.\n- Configurações em `src/lib/rh-enterprise-types.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Anonimização forçada no backend: requisições com dados nominais anexados em pesquisas anônimas são limpas antes da persistência.\n- Alerta informativo caso a amostragem seja inferior ao quórum estatístico mínimo.',
    },
  },

  // -------------------------------------------------------------
  // RH 5. ESTRUTURA ORGANIZACIONAL
  // -------------------------------------------------------------
  '/admin/rh/estrutura-organizacional': {
    route: '/admin/rh/estrutura-organizacional',
    title: 'Estrutura Organizacional',
    moduleGroup: 'Recursos Humanos (RH)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Mapear e gerenciar a hierarquia formal da empresa: organograma dinâmico, cadastro de departamentos/setores, descrição e catálogo de cargos, posições de trabalho e centros de custo vinculados.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Organograma": visualização em árvore hierárquica e interativa de diretorias, gerências, coordenações e equipes operacionais com fotos dos gestores e contagem de liderados.\n- Aba "Departamentos": CRUD de áreas funcionais com sigla, centro de custo, gestor responsável e filial pertencente.\n- Aba "Cargos": cadastro mestre de cargos e funções com requisitos de formação, experiência necessária, CBO oficial (Classificação Brasileira de Ocupações) e descrição das atribuições sumárias.\n- Aba "Posições e Vagas": controle do quadro de lotação previsto versus realizado, vagas em aberto e posições orçadas por setor.\n- Exportação (`ExportActions`): exportação do organograma visual e tabela analítica de cargos e departamentos em PDF e Excel.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- A exclusão de um departamento é bloqueada caso existam cargos, colaboradores ou posições ativas vinculadas a ele.\n- Cada cargo deve possuir código CBO válido compatível com as tabelas do eSocial.\n- O organograma não permite referências circulares de subordinação hierárquica (ex: setor A subordinado a setor B, e B a A).',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O analista cadastra os departamentos e cargos com suas respectivas descrições e CBOs.\n2. Vincula a hierarquia de liderança direta.\n3. O sistema projeta o organograma interativo na aba "Organograma".\n4. Mudanças organizacionais ou fusões de áreas são refletidas automaticamente no cadastro dos colaboradores vinculados.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `rh_departments`, `rh_positions`, `rh_job_roles`, `rh_organogram_nodes`.\n- Associação direta com `dp_collaborators` e `rh_employees`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com DP para preenchimento de campos de cargo e departamento na admissão de colaboradores.\n- Integração com eSocial para evento S-1030 (Tabela de Cargos) e S-1040 (Funções).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Edição da estrutura: restrita a perfis de alta gestão e RH Corporativo (SUP, ADMIN, RH_GESTOR).\n- Visualização do organograma: disponível para toda a organização para transparência de papéis.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `RhEstruturaOrganizacionalScreen`, `RhGenericScreen`, `ExportActions`.\n- Serviços: `src/services/rh.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Detecção e bloqueio automático de loops hierárquicos ao salvar nós de subordinação.\n- Notificação clara ao tentar excluir departamentos com colaboradores alocados.',
    },
  },

  // -------------------------------------------------------------
  // RH 6. JORNADA DO COLABORADOR
  // -------------------------------------------------------------
  '/admin/rh/jornada-colaborador': {
    route: '/admin/rh/jornada-colaborador',
    title: 'Jornada do Colaborador (Lifecycle)',
    moduleGroup: 'Recursos Humanos (RH)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Coordenar todos os momentos do ciclo de vida do profissional na empresa: processo de Onboarding (integração de novos colaboradores), acompanhamento do período de experiência, gestão documental do RH e fluxo humanizado de Offboarding (entrevista de desligamento).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Onboarding": checklist de integração do recém-contratado (preparação de equipamentos pelo TI, boas-vindas, entrega de kit, apresentação à equipe, treinamentos institucionais) com prazos de 1º dia, 1ª semana e 1º mês.\n- Aba "Avaliação de Experiência": formulários de acompanhamento aos 45 e 90 dias com parecer mútuo de continuidade contratual entre gestor e empregado.\n- Aba "Dossiê Documental": repositório de documentos do RH (termos de confidencialidade, código de conduta assinado, políticas de segurança e certificados).\n- Aba "Offboarding": checklist de desligamento (devolução de ativos/notebooks, revogação de acessos sistêmicos, exame demissional e entrevista de desligamento estruturada para mapeamento de motivos de saída).\n- Exportação (`ExportActions`): relatórios consolidados de turnover qualitativo (motivos de saída) e relatórios de progresso de onboarding.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- A avaliação de experiência aos 45 e 90 dias deve ser preenchida antes do vencimento legal para evitar que o contrato por prazo determinado se converta compulsoriamente em indeterminado sem parecer do gestor.\n- O checklist de offboarding é pré-requisito formal para emissão do termo de liberação de ativos pelo setor de TI e patrimônio.\n- As entrevistas de desligamento alimentam a matriz de inteligência de retenção sem identificação depreciativa.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Após admissão no DP, o colaborador é inserido na aba "Onboarding" com checklist automático disparado aos setores responsáveis.\n2. O RH monitora o cumprimento das etapas e aplica as avaliações de experiência aos 45 e 90 dias.\n3. Durante toda a vigência do contrato, o RH mantém o dossiê na aba "Dossiê Documental".\n4. Em caso de rescisão, o fluxo de "Offboarding" é acionado para conduzir a entrevista de desligamento e recolhimento de materiais.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `rh_onboarding_checklists`, `rh_experience_reviews`, `rh_employee_documents`, `rh_offboarding_interviews`.\n- Dados cruzados com `dp_collaborators`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Departamento Pessoal para acionamento simultâneo do desligamento contratual.\n- Módulo de TI e Ativos para revogação de acessos e bloqueio de credenciais no encerramento da jornada.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Controle dos checklists de Onboarding/Offboarding: RH e gestores diretos.\n- Entrevistas de desligamento: visibilidade confidencial exclusiva de RH e Direção.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `RhJornadaColaboradorScreen`, `RhGenericScreen`, `ExportActions`.\n- Configurações em `src/lib/rh-types.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Alertas visuais e sonoros para tarefas de integração em atraso.\n- Validação de preenchimento obrigatório dos motivos de saída em entrevistas de desligamento.',
    },
  },

  // -------------------------------------------------------------
  // RH 7. APROVAÇÕES RH
  // -------------------------------------------------------------
  '/admin/rh/aprovacoes': {
    route: '/admin/rh/aprovacoes',
    title: 'Central de Aprovações de RH',
    moduleGroup: 'Recursos Humanos (RH)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar em interface única e auditável todas as requisições de pessoal que demandam alçada de aprovação gerencial e executiva: promoções de cargo, reajustes salariais fora de dissídio, transferências de filial/setor, solicitações de abertura de vagas e alterações de carga horária.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Solicitações Pendentes": fila unificada de pedidos aguardando deliberação com dados detalhados da proposta (de/para de salário, de/para de cargo, justificativa e impacto no orçamento).\n- Aba "Histórico de Aprovações": registro histórico de todas as solicitações já deliberadas (aprovadas, rejeitadas ou canceladas) com parecer do aprovador e carimbo de data/hora.\n- Aba "Configuração de Alçadas": definição de matriz de aprovação por níveis hierárquicos e limites de impacto financeiro (ex: gestor imediato -> gerente da área -> diretor -> RH corporativo).\n- Botões de Ação Rápida: Aprovar, Rejeitar (com justificativa obrigatória) e Devolver para Ajustes em um único clique.\n- Exportação (`ExportActions`): extração de relatórios de auditoria de movimentações de pessoal em PDF e XLSX.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Nenhuma alteração salarial ou promoção é aplicada no cadastro do DP sem que todas as etapas da cadeia de aprovação estejam homologadas.\n- Rejeições de solicitação exigem obrigatoriamente a digitação de parecer justificativo com no mínimo 10 caracteres.\n- O solicitante não pode aprovar a própria requisição (segregação de funções).\n- Requisições que ultrapassem o orçamento previsto do setor acionam automaticamente alçada da Diretoria Financeira.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Um gestor solicita uma promoção ou reajuste salarial para um membro da equipe.\n2. A requisição entra na fila da aba "Solicitações Pendentes" para os usuários autorizados da alçada.\n3. O aprovador analisa o comparativo de/para, custos e impacto orçamentário.\n4. Ao clicar em "Aprovar", a solicitação avança para o próximo nível ou é consolidada.\n5. Quando aprovada integralmente, os dados são sincronizados no cadastro mestre do colaborador no DP e o registro é arquivado no "Histórico de Aprovações".',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `rh_approval_requests`, `rh_approval_history`, `rh_approval_tiers`, `dp_salary_history`.\n- Relacionamentos com `rh_employees` e `users`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração direta com Departamento Pessoal (Histórico Salarial e Contratos) para aplicação automática dos reajustes homologados.\n- Notificação via e-mail e sininho interno para os participantes da esteira de aprovação.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização da central: gestores de pessoas, gerentes, diretores e analistas de RH.\n- Poder de aprovação: condicionado ao nível de alçada cadastrado na matriz de governança (`canApproveRH(role)`).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `RhAprovacoesScreen`, `ExportActions`.\n- Serviços: `src/services/rh.ts` e serviços de governança de aprovações.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de ação com mensagem de erro caso o usuário tente aprovar requisição fora de sua alçada.\n- Reversão atômica de transações caso a atualização no cadastro do colaborador falhe durante a efetivação da aprovação.',
    },
  },
}
