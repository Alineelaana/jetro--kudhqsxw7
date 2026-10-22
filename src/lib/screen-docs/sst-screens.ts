import type { ScreenDocEntry } from './types'

/**
 * DOCUMENTAÇÃO TÉCNICA E FUNCIONAL DAS 8 TELAS UNIFICADAS DE SEGURANÇA E SAÚDE NO TRABALHO (SST)
 * Versão pós-reestruturação: arquitetura com abas internas, riscos psicossociais,
 * sigilo médico estrito no ASO/prontuário, NR-1 a NR-35, eSocial SST (S-2210/2220/2240)
 * e relatórios analíticos integrados.
 */
export const SST_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  // -------------------------------------------------------------
  // SST 1. PAINEL SST (DASHBOARD OPERACIONAL E ESTRATÉGICO)
  // -------------------------------------------------------------
  '/admin/sst': {
    route: '/admin/sst',
    title: 'Painel Geral de Saúde e Segurança do Trabalho (SST)',
    moduleGroup: 'Saúde e Segurança do Trabalho (SST)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Fornecer a visão panorâmica e os indicadores críticos de SST da empresa: dias sem acidentes de trabalho, controle de exames ASO vencidos/a vencer, índice de conformidade com Normas Regulamentadoras, estoque de EPIs críticos e alertas de eventos do eSocial SST.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Placar de Segurança: contagem em tempo real de dias consecutivos sem acidentes com e sem afastamento (estatística oficial da CIPA/SESMT).\n- Cards de Indicadores: ASOs a vencer nos próximos 30 dias, CATs emitidas no ano, EPIs abaixo do estoque mínimo de reposição e Treinamentos obrigatórios com reciclagem pendente.\n- Monitor de transmissão dos eventos SST do eSocial (S-2210, S-2220 e S-2240) com alertas visuais de pendências de envio.\n- Atalhos rápidos de navegação para: Gestão de Riscos e PGR, Saúde Ocupacional, Segurança e Prevenção, EPIs e Treinamentos, Central de Conformidade, Documentos e Obrigações e Relatórios SST.\n- Gráficos de incidentes por setor da empresa e tipos de lesão mais frequentes.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O registro de qualquer acidente com afastamento zera compulsoriamente o placar de dias sem acidentes a partir da data da ocorrência.\n- Colaboradores com ASO vencido acionam bandeira vermelha no painel e devem ser sinalizados para não exercer atividades operacionais em áreas de risco.\n- Os dados refletem a unidade/filial selecionada respeitando o isolamento multi-inquilino.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O engenheiro ou técnico de segurança acessa a rota `/admin/sst`.\n2. O dashboard compila dados em tempo real das coleções `sst_accidents`, `sst_aso`, `sst_epis` e `sst_esocial_sst_events`.\n3. O profissional identifica anomalias (como vencimentos de ASO ou EPI em falta) e navega diretamente para o módulo correspondente através dos botões de ação rápida.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sst_accidents`, `sst_aso`, `sst_epis`, `sst_certificates`, `sst_esocial_sst_events`, `dp_collaborators`.\n- Hooks: `useRealtime` para atualização contínua.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com o módulo de Departamento Pessoal para recebimento de afastamentos acidentários.\n- Sincronização com o painel corporativo do eSocial para conferência de recibos governamentais.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização geral: perfis SUP, SST_ENGENHEIRO, SST_TECNICO, MEDICO_TRABALHO, RH e ADMIN.\n- Dados clínicos e diagnósticos médicos: ocultados do painel geral para preservar o sigilo médico ético.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `SstPainelScreen`, `StatCard`, `Card`, `Badge`, `Button`.\n- Serviços: `src/services/sst.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Falhas no carregamento de coleções secundárias não afetam o placar de dias sem acidentes nem os cards principais.\n- Exibição de estado vazio amigável quando nenhum acidente tiver sido registrado na base.',
    },
  },

  // -------------------------------------------------------------
  // SST 2. GESTÃO DE RISCOS E PGR (INCLUINDO RISCOS PSICOSSOCIAIS)
  // -------------------------------------------------------------
  '/admin/sst/gestao-riscos-pgr': {
    route: '/admin/sst/gestao-riscos-pgr',
    title: 'Gestão de Riscos Ocupacionais e PGR (NR-1)',
    moduleGroup: 'Saúde e Segurança do Trabalho (SST)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Estruturar o Programa de Gerenciamento de Riscos (PGR) e Gerenciamento de Riscos Ocupacionais (GRO) em estrita conformidade com a Norma Regulamentadora NR-1, abrangendo o inventário de perigos (físicos, químicos, biológicos, ergonômicos e mecânicos/acidentes), matriz de riscos com probabilidade × severidade, planos de ação preventiva e a aba específica de Riscos Psicossociais.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Inventário de Riscos": catalogação de perigos e fatores de risco ocupacional identificados por função, setor e GHE (Grupo Homogêneo de Exposição), com medidas de controle já implantadas (EPC e EPI) e medições quantitativas/qualitativas.\n- Aba "Matriz de Riscos": classificação do nível de risco baseada no cruzamento de Probabilidade (1 a 5) × Severidade (1 a 5), gerando a classificação (Trivial, Tolerável, Moderado, Substancial e Intolerável).\n- Aba "Planos de Ação PGR": cronograma de medidas de intervenção, controle na fonte, medidas administrativas e prazos de implementação com responsáveis e status de execução.\n- Aba "Riscos Psicossociais": gestão dedicada e preventiva de fatores estressores no trabalho, sobrecarga quantitativa/qualitativa de demandas, assédio moral/sexual, burnout, conflitos interpessoais e ritmo excessivo, com indicadores de percepção de estresse e planos de ação de saúde mental corporativa.\n- Aba "GHE (Grupos Homogêneos)": agrupamento de trabalhadores submetidos a condições e ambientes operacionais idênticos para fins de monitoramento ambiental e laudos.\n- Botão de Anexo de Documentos (`GenericAttachments`): upload de relatórios técnicos de medição ambiental (dosimetria de ruído, luximetria, termômetro de globo, amostragem de poeiras) e laudos de peritos.\n- Exportação (`ExportActions`): exportação do Inventário Geral de Riscos e do Plano de Ação em PDF e XLSX formatados conforme exigências de auditoria do Ministério do Trabalho.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Riscos classificados como "Intolerável" ou "Substancial" bloqueiam a aprovação do PGR até que medidas emergenciais de controle sejam registradas no plano de ação.\n- O inventário de riscos deve ser revisto a cada 2 anos ou imediatamente após modificações em processos de trabalho, introdução de novas máquinas ou ocorrência de acidente grave/fatal (NR-1.5.4.4.6).\n- A aba de Riscos Psicossociais deve tratar dados com rigorosa confidencialidade, não expondo relatos individuais no inventário consolidado.\n- Fatores de risco identificados alimentam automaticamente o mapeamento de condições ambientais do evento S-2240 do eSocial.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O profissional de segurança cadastra os GHEs por setor e função.\n2. Na aba "Inventário de Riscos", mapeia as fontes geradoras e agentes nocivos.\n3. Na aba "Matriz de Riscos", avalia probabilidade e gravidade, determinando a urgência da intervenção.\n4. Para fatores ergonômicos e organizacionais, utiliza a aba "Riscos Psicossociais" para registrar ações preventivas de saúde mental.\n5. Vincula as medições ambientais em `GenericAttachments` e consolida o documento oficial do PGR através de `ExportActions`.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sst_risks`, `sst_risk_inventory`, `sst_pgr_action_plans`, `sst_ghes`, `sst_psychosocial_risks`, `generic_attachments`.\n- Associação com setores e cargos de `rh_departments` e `rh_job_roles`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração direta com a elaboração do LTCAT e emissão do evento S-2240 (Condições Ambientais do Trabalho) do eSocial.\n- Integração com a aba de Riscos Ocupacionais da Central de Conformidade SST.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Edição do inventário e matriz de riscos: Engenheiro de Segurança do Trabalho (CREA ativo), Médico do Trabalho ou Técnico de Segurança.\n- Visualização de relatórios do PGR: Diretoria, CIPA e auditores.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `SstGestaoRiscosPgrScreen`, `GenericAttachments`, `ExportActions`.\n- Serviços: `src/services/sst.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de salvamento de risco sem a seleção do tipo de agente (Físico, Químico, Biológico, Ergonômico, Acidente ou Psicossocial).\n- Alerta impeditivo para planos de ação sem data prevista de conclusão.',
    },
  },

  // -------------------------------------------------------------
  // SST 3. SAÚDE OCUPACIONAL (SIGILO MÉDICO ESTRITO)
  // -------------------------------------------------------------
  '/admin/sst/saude-ocupacional': {
    route: '/admin/sst/saude-ocupacional',
    title: 'Saúde Ocupacional e PCMSO (NR-7)',
    moduleGroup: 'Saúde e Segurança do Trabalho (SST)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar o Programa de Controle Médico de Saúde Ocupacional (PCMSO) conforme a NR-7, controle de Atestados de Saúde Ocupacional (ASO), agendamento e resultados de exames complementares, prontuário clínico e histórico de afastamentos médicos, aplicando estrito SIGILO MÉDICO para proteção de dados sensíveis de saúde conforme o Código de Ética Médica (CFM) e LGPD.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "ASO (Atestados de Saúde Ocupacional)": emissão e acompanhamento dos 5 tipos de ASO previstos na NR-7 (Admissional, Periódico, Retorno ao Trabalho, Mudança de Riscos Ocupacionais e Demissional), com registro de data de emissão, validade, parecer (Apto ou Inapto), médico examinador e CRM.\n- Aba "Exames Complementares": agendamento e controle de audiometrias, espirometrias, radiografias de tórax (padrão OIT), eletrocardiograma (ECG), eletroencefalograma (EEG), exames laboratoriais e toxicológicos.\n- Aba "Prontuário Médico Ocupacional" (COM SIGILO MÉDICO): prontuário clínico individual contendo diagnósticos, queixas clínicas, histórico de saúde ocupacional pregressa e dados biométricos detalhados.\n- Aba "Controle de Atestados Médicos": registro de atestados de ausência, CID (Classificação Internacional de Doenças) quando consentido pelo trabalhador, dias de afastamento e encaminhamentos ao INSS.\n- Aba "Cronograma do PCMSO": planejamento anual de ações de promoção da saúde, campanhas de vacinação e exames clínicos periódicos por grupo funcional.\n- REGRA CRÍTICA DE SIGILO MÉDICO: dados de saúde sensíveis (CID, pareceres diagnósticos detalhados, resultados brutos de exames complementares e prontuário médico) são EXCLUSIVAMENTE VISÍVEIS para perfis autorizados (Médico do Trabalho / SESMT com CRM/permissão de saúde). Usuários comuns de RH, DP ou outros módulos visualizam apenas a aptidão ocupacional administrativa ("Apto" ou "Inapto") e a data de validade do ASO, sendo vedado o acesso ao diagnóstico clínico (Art. 73 do Código de Ética Médica e Art. 5º, II da LGPD).\n- Botão de Anexo de Documentos (`GenericAttachments`): upload restrito de ASO digitalizado com assinatura digital do médico e do trabalhador.\n- Exportação (`ExportActions`): exportação do relatório anual consolidado do PCMSO e relação de validades de ASO para o RH (sem exposição de CIDs ou dados clínicos).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O exame demissional deve ser realizado obrigatoriamente em até 10 dias corridos contados do término do contrato (dispensado caso o último exame periódico tenha ocorrido há menos de 135 ou 90 dias, conforme o grau de risco da empresa).\n- É vedado ao empregador exigir a declaração do CID nos atestados médicos de justificativa de falta, salvo autorização expressa e por escrito do empregado.\n- O ASO é emitido obrigatoriamente em no mínimo 2 vias: a 1ª via permanece arquivada no local de trabalho à disposição da fiscalização, e a 2ª via é obrigatoriamente entregue ao colaborador.\n- O evento S-2220 do eSocial deve conter o CPF do trabalhador, CRM do médico emissor/coordenador, data do exame e conclusão de aptidão.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O setor de DP ou RH solicita exame (admissional, periódico, demissional) ao agendar na aba "Exames Complementares".\n2. O colaborador comparece à clínica ou ambulatório da empresa.\n3. O médico examinador acessa com credencial autorizada, preenche o prontuário na aba protegida e gera o ASO com o parecer (Apto/Inapto).\n4. O sistema disponibiliza o status de aptidão para o DP (sem divulgar dados clínicos confidenciais).\n5. O evento S-2220 é automaticamente enfileirado para transmissão ao eSocial.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sst_aso`, `sst_exams`, `sst_medical_records`, `sst_medical_certificates`, `generic_attachments`.\n- Vínculo com dados funcionais em `dp_collaborators`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com Departamento Pessoal para validação de admissões e homologação de demissões.\n- Conexão com o eSocial para geração do evento S-2220 (Monitoramento da Saúde do Trabalhador).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização de aptidão e validade de ASO: RH, DP, SUP e Administradores.\n- Acesso a Prontuário, CIDs e laudos clínicos: RESTRITO a usuários com flag de autorização médica (`MEDICO_TRABALHO`, `SESMT_SAUDE` ou SUP com credencial específica). Em caso de perfil não autorizado, os dados médicos são mascarados ou ocultados pela governança do componente.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `SstSaudeOcupacionalScreen`, `GenericAttachments`, `ExportActions`.\n- Serviços: `src/services/sst.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Tentativa de acesso não autorizado a dados médicos clínicos retorna bloqueio com mensagem de advertência ética.\n- Alerta impeditivo de emissão de ASO sem o preenchimento obrigatório do CRM do médico examinador e UF.',
    },
  },

  // -------------------------------------------------------------
  // SST 4. SEGURANÇA E PREVENÇÃO
  // -------------------------------------------------------------
  '/admin/sst/seguranca-prevencao': {
    route: '/admin/sst/seguranca-prevencao',
    title: 'Segurança e Prevenção de Acidentes',
    moduleGroup: 'Saúde e Segurança do Trabalho (SST)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Coordenar os procedimentos operacionais de segurança do trabalho: investigação e registro de acidentes, emissão de CAT (Comunicação de Acidente de Trabalho), relato e tratamento de quase acidentes (near miss / incidentes), inspeções periódicas de segurança e gestão da CIPA (Comissão Interna de Prevenção de Acidentes e Assédio - NR-5).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Acidentes de Trabalho": registro completo de sinistros com ou sem afastamento, tipo de acidente (típico, trajeto, doença do trabalho), data/hora, local exato, parte do corpo atingida, agente causador e dias perdidos de trabalho.\n- Aba "Emissão de CAT": assistente completo de emissão da Comunicação de Acidente de Trabalho, gerando o protocolo oficial e preparação do evento S-2210 do eSocial.\n- Aba "Incidentes e Quase Acidentes (Near Miss)": canal para relato ágil de situações de perigo e desvios comportamentais antes que gerem lesões, com classificação de gravidade potencial e causa raiz.\n- Aba "Inspeções e Auditorias de Segurança": checklists de vistoria técnica em setores fabris e administrativos, com contagem de itens conformes e não conformes.\n- Aba "CIPA e SIPAT (NR-5)": gestão do processo eleitoral da CIPA, mandatos de cipeiros (eleitos e designados pelo empregador), calendário de reuniões mensais ordinárias com ata e organização da Semana Interna de Prevenção de Acidentes do Trabalho (SIPAT).\n- Aba "Ordens de Serviço (NR-1)": emissão e controle de assinaturas das Ordens de Serviço de Segurança obrigatórias por função.\n- Botão de Anexo de Documentos (`GenericAttachments`): upload de fotos do local do acidente, laudos periciais, atas da CIPA assinadas e boletins de ocorrência.\n- Exportação (`ExportActions`): extração de relatórios estatísticos de frequência e gravidade (taxas de frequência e gravidade da NBR 14280) em PDF e Excel.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- A emissão da CAT deve ser realizada obrigatoriamente até o primeiro dia útil seguinte ao da ocorrência e, em caso de morte, de imediato à autoridade competente (Lei 8.213/1991, Art. 22).\n- A investigação de acidente deve utilizar metodologia formal de análise de causa raiz (ex: Diagrama de Ishikawa, 5 Porquês ou Árvore de Causas).\n- Reuniões da CIPA são obrigatórias mensalmente durante o expediente normal de trabalho e com ata lavrada e assinada por todos os presentes.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Ao ocorrer um sinistro ou desvio, o técnico registra na aba "Acidentes" ou "Incidentes".\n2. Para acidentes com lesão, emite imediatamente a CAT na aba "Emissão de CAT".\n3. O evento S-2210 é despachado automaticamente para a fila de transmissão do eSocial.\n4. A equipe do SESMT e a CIPA iniciam a investigação, anexam fotos em `GenericAttachments` e geram o plano de ação corretivo.\n5. O relatório de investigação é exportado via `ExportActions` para arquivamento e auditoria.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sst_accidents`, `sst_cat`, `sst_incidents`, `sst_inspections`, `sst_cipa`, `sst_ordens_servico`, `generic_attachments`.\n- Integração com dados de `dp_collaborators`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração direta com Departamento Pessoal para abertura de afastamento previdenciário (auxílio-doença acidentário B91).\n- Conexão com o eSocial para emissão do evento S-2210 (Comunicação de Acidente de Trabalho).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Registro e emissão de CAT: Engenheiro de Segurança, Técnico de Segurança, Médico do Trabalho e SUP.\n- Relato de incidentes / near miss: liberado para todos os colaboradores e gestores.\n- Gestão da CIPA: presidente e secretário da CIPA e equipe do SESMT.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `SstSegurancaPrevencaoScreen`, `GenericAttachments`, `ExportActions`.\n- Serviços: `src/services/sst.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Alerta crítico caso a data do acidente ultrapasse o prazo regulamentar de 24 horas para emissão da CAT.\n- Validação obrigatória da descrição minuciosa do acidente e parte do corpo lesionada.',
    },
  },

  // -------------------------------------------------------------
  // SST 5. EPIS E TREINAMENTOS
  // -------------------------------------------------------------
  '/admin/sst/epis-treinamentos': {
    route: '/admin/sst/epis-treinamentos',
    title: 'EPIs e Treinamentos Obrigatórios',
    moduleGroup: 'Saúde e Segurança do Trabalho (SST)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar o ciclo de vida dos Equipamentos de Proteção Individual (EPIs) conforme a NR-6 (cadastro, Certificado de Aprovação - CA, controle de estoque e termo de entrega/recibo) e a programação e certificação de treinamentos obrigatórios de segurança conforme as Normas Regulamentadoras (NR-1, NR-5, NR-10, NR-12, NR-33, NR-35).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Catálogo de EPIs (NR-6)": cadastro de equipamentos de proteção individual e uniformes, fabricante, tipo de proteção, número do Certificado de Aprovação (CA), validade do CA e periodicidade recomendada de substituição.\n- Aba "Ficha de Entrega de EPI": controle de entrega individual com termo de responsabilidade do trabalhador, data de entrega, motivo da substituição (desgaste, perda, higienização) e assinatura do recebedor.\n- Aba "Estoque de EPIs": controle do saldo físico de equipamentos por almoxarifado, estoque mínimo de segurança e alertas automáticos de necessidade de reposição.\n- Aba "Treinamentos Obrigatórios de NRs": catálogo de capacitações normativas (Trabalho em Altura NR-35, Espaço Confinado NR-33, Eletricidade NR-10, Segurança em Máquinas NR-12, Operador de Empilhadeira NR-11), com carga horária e conteúdo programático.\n- Aba "Certificados e Reciclagens": controle de turmas, emissão de certificados com assinatura do instrutor responsável técnico e cálculo automático da data de vencimento da reciclagem periódica.\n- Botão de Anexo de Documentos (`GenericAttachments`): upload das fichas de entrega de EPI assinadas, cópias de certificados emitidos e lista de presença física com assinaturas.\n- Exportação (`ExportActions`): emissão da Ficha de EPI padronizada em PDF e matriz de treinamentos por colaborador em planilha Excel.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- É terminantemente proibido o fornecimento de EPI com Certificado de Aprovação (CA) vencido na data da aquisição ou cancelado pelo Ministério do Trabalho (NR-6).\n- A entrega de EPI deve ser documentada mediante recibo assinado em meio físico ou eletrônico com comprovação de autoria e integridade.\n- Colaboradores sem treinamento vigente de NR-35 ou NR-33 são bloqueados para emissão de Permissão de Trabalho (PT).\n- O treinamento deve ser ministrado sem custo para o trabalhador e dentro da jornada normal de trabalho.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O almoxarife ou técnico cadastra o EPI na aba "Catálogo de EPIs" informando o CA válido.\n2. Na aba "Ficha de Entrega", realiza a entrega ao colaborador gerando o termo de cautela.\n3. O termo assinado é digitalizado e anexado em `GenericAttachments`.\n4. Para cursos normativos, turmas são criadas e concluídas na aba "Treinamentos Obrigatórios".\n5. Os certificados válidos são emitidos via `ExportActions` e alimentam o dossiê do colaborador.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sst_epis`, `sst_epi_deliveries`, `sst_epi_stock`, `sst_trainings`, `sst_certificates`, `generic_attachments`.\n- Vinculação com colaboradores de `dp_collaborators`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com o Módulo de Compras e Estoque para solicitação automática de compra de EPIs no ponto de pedido.\n- Integração com eSocial para informação de uso eficaz de EPI/EPC no evento S-2240.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Gestão de estoque e entrega: Técnicos de Segurança e Almoxarifado credenciado.\n- Certificação de treinamentos: Instrutores habilitados, Engenheiro de Segurança e SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `SstEpisTreinamentosScreen`, `GenericAttachments`, `ExportActions`.\n- Serviços: `src/services/sst.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de entrega de EPI com quantidade superior ao saldo em estoque disponível.\n- Notificação visual caso o CA do equipamento esteja com menos de 30 dias de expiração.',
    },
  },

  // -------------------------------------------------------------
  // SST 6. CENTRAL DE CONFORMIDADE SST
  // -------------------------------------------------------------
  '/admin/sst/central-conformidade': {
    route: '/admin/sst/central-conformidade',
    title: 'Central de Conformidade Legal e Normas Regulamentadoras',
    moduleGroup: 'Saúde e Segurança do Trabalho (SST)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar a auditoria de conformidade legal de SST em relação às 38 Normas Regulamentadoras (NRs) do Ministério do Trabalho, gerenciar planos de atendimento a exigências legais, acompanhar autos de infração e fiscalizações do trabalho, e tratar não conformidades com planos de ação corretiva.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Diagnóstico das NRs": matriz de avaliação da aderência legal da empresa a cada Norma Regulamentadora aplicável (NR-1 a NR-38), com status de conformidade (Conforme, Parcialmente Conforme, Não Conforme e Não Aplicável) e percentual global de conformidade.\n- Aba "Tratamento de Não Conformidades": registro e gestão de desvios e não conformidades apontadas em auditorias internas ou inspeções de segurança, com causa raiz, responsável e prazo.\n- Aba "Fiscalizações e Notificações": repositório de fiscalizações da Inspeção do Trabalho (SIT), termos de notificação, notificações do Ministério Público do Trabalho (MPT) e cumprimento de prazos de defesa.\n- Aba "Matriz de Requisitos Legais (Legislação SST)": acompanhamento contínuo de decretos, portarias ministeriais, convenções coletivas e normas técnicas da ABNT aplicáveis à atividade econômica da empresa.\n- Aba "Planos de Ação Corretiva e Preventiva (CAPA)": esteira de execução de melhorias estruturais com prazos, orçamentos aprovados e evidências de saneamento.\n- Botão de Anexo de Documentos (`GenericAttachments`): arquivamento de notificações fiscais, autos de infração, laudos periciais e comprovantes de cumprimento de exigências.\n- Exportação (`ExportActions`): geração de relatórios de auditoria de conformidade legal para apresentação à diretoria e conselhos de administração.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Não conformidades classificadas como "Crítica" ou decorrentes de notificação da fiscalização trabalhista têm prazo de plano de ação limitado a 15 dias corridos.\n- Nenhuma não conformidade pode ser encerrada no sistema sem a inclusão de evidência objetiva de saneamento em `GenericAttachments`.\n- O cálculo do índice de conformidade global exclui as NRs marcadas como "Não Aplicável" à tipologia da empresa.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. A equipe de segurança realiza a auditoria interna periódica e atualiza a aba "Diagnóstico das NRs".\n2. Para cada desvio identificado, gera uma ocorrência na aba "Não Conformidades".\n3. Na aba "Planos de Ação Corretiva", define medidas de contenção com os gestores das áreas fabris.\n4. Uma vez sanada a irregularidade, anexa a evidência em `GenericAttachments` e encerra a ocorrência.\n5. Emite o relatório de conformidade em PDF via `ExportActions`.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sst_nr_compliance`, `sst_non_conformities`, `sst_inspections`, `sst_legal_requirements`, `sst_corrective_actions`, `generic_attachments`.\n- Dados cruzados com PGR e laudos técnicos.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com o módulo de Governança e Compliance Corporativo do ERP.\n- Alertas integrados ao cronograma de manutenção predial e industrial.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Gestão da matriz e baixa de não conformidades: Engenheiro de Segurança do Trabalho e Administradores de SST.\n- Abertura de desvios: todos os auditores e líderes de setor.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `SstCentralConformidadeScreen`, `GenericAttachments`, `ExportActions`.\n- Serviços: `src/services/sst.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de finalização de não conformidade sem texto explicativo da resolução e sem anexo de evidência.\n- Alerta preventivo para prazos de exigências legais a expirar em menos de 5 dias úteis.',
    },
  },

  // -------------------------------------------------------------
  // SST 7. DOCUMENTOS E OBRIGAÇÕES (PPP, LTCAT, MONITOR ESOCIAL)
  // -------------------------------------------------------------
  '/admin/sst/documentos-obrigacoes': {
    route: '/admin/sst/documentos-obrigacoes',
    title: 'Documentos Ocupacionais e eSocial SST',
    moduleGroup: 'Saúde e Segurança do Trabalho (SST)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Administrar a emissão e guarda dos laudos técnicos periciais (LTCAT, Laudo de Insalubridade NR-15, Laudo de Periculosidade NR-16), geração do Perfil Profissiográfico Previdenciário (PPP Eletrônico) e monitoramento especializado da transmissão dos três eventos de SST do eSocial (S-2210, S-2220 e S-2240).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Monitor de Eventos eSocial SST": painel de mensageria em tempo real para os eventos obrigatórios de segurança e saúde:\n  • S-2210: Comunicação de Acidente de Trabalho;\n  • S-2220: Monitoramento da Saúde do Trabalhador (ASO e exames complementares);\n  • S-2240: Condições Ambientais do Trabalho - Fatores de Risco (agentes nocivos para aposentadoria especial do INSS).\n- Aba "PPP Eletrônico (Perfil Profissiográfico Previdenciário)": emissão individual do PPP para aposentadoria especial contendo descrição das atividades, fatores de risco, EPIs/EPCs utilizados e responsáveis pelos registros ambientais e monitoração biológica.\n- Aba "LTCAT e Laudos Técnicos": repositório e elaboração do Laudo Técnico das Condições Ambientais do Trabalho (LTCAT), laudos de insalubridade e periculosidade com assinatura de engenheiro/médico.\n- Aba "Laudo Ergonômico (AEP / AET - NR-17)": controle das Avaliações Ergonômicas Preliminares (AEP) e Análises Ergonômicas do Trabalho (AET) por posto de operação.\n- Aba "Histórico e Protocolos": rastreabilidade completa de lotes transmitidos, números de protocolo de envio e recibos de entrega expedidos pelo ambiente nacional do eSocial.\n- Botão de Anexo de Documentos (`GenericAttachments`): arquivamento de laudos em PDF assinados com certificado digital ICP-Brasil, ARTs (Anotação de Responsabilidade Técnica) do CREA e recibos XML do governo.\n- Exportação (`ExportActions`): exportação do formulário oficial do PPP em PDF e relatórios de conformidade eSocial em planilha Excel.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O evento S-2240 deve ser enviado até o dia 15 do mês seguinte ao início da obrigatoriedade ou da admissão/mudança de risco do trabalhador.\n- O PPP é obrigatório para todos os empregados expostos a agentes nocivos químicos, físicos, biológicos ou associação de agentes prejudiciais à saúde.\n- O LTCAT deve ser obrigatoriamente assinado por Engenheiro de Segurança do Trabalho (com ART no CREA) ou Médico do Trabalho (com CRM).\n- A ausência ou inconsistência no envio dos eventos de SST gera multas automáticas aplicadas pela Receita Federal e Ministério do Trabalho.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O engenheiro cadastra os laudos e medições na aba "LTCAT e Laudos".\n2. Na admissão ou alteração de função, o sistema gera a minuta do S-2240 com base nos riscos mapeados do GHE.\n3. O operador confere as pendências na aba "Monitor de Eventos eSocial SST" e aciona a transmissão.\n4. O governo processa e retorna o número de recibo, que fica registrado na aba "Histórico e Protocolos".\n5. Quando solicitado pelo colaborador ou em rescisões, emite o PPP em PDF via `ExportActions`.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sst_esocial_sst_events`, `sst_ppp_records`, `sst_ltcat`, `sst_laudos`, `sst_aet`, `generic_attachments`.\n- Cruzamento com `dp_collaborators`, `sst_risks` e `sst_aso`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Webservice eSocial do Governo Federal via certificado digital.\n- Integração com o módulo de Obrigações e eSocial do DP para conciliação dos fechamentos mensais.\n- Conexão com o cadastro de colaboradores para geração instantânea do PPP.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Transmissão de eventos ao eSocial: operadores de SST autorizados com certificado digital e perfil SUP.\n- Emissão de PPP e leitura de laudos: SST, DP e Diretoria.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `SstDocumentosObrigacoesScreen`, `GenericAttachments`, `ExportActions`.\n- Serviços: `src/services/sst.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Exibição detalhada de erros retornados pela validação do eSocial (ex: código do agente nocivo inválido na tabela 24 ou CRM do responsável inexistente).\n- Alerta impeditivo de transmissão caso o colaborador esteja sem CPF ou com matrícula divergente da cadastrada no S-2200.',
    },
  },

  // -------------------------------------------------------------
  // SST 8. RELATÓRIOS SST (CENTRAL ANALÍTICA)
  // -------------------------------------------------------------
  '/admin/sst/relatorios': {
    route: '/admin/sst/relatorios',
    title: 'Central de Relatórios SST',
    moduleGroup: 'Saúde e Segurança do Trabalho (SST)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Consolidar a extração analítica de relatórios gerenciais, estatísticos e fiscalizatórios de SST em interface única com múltiplos tipos de relatórios, filtros por situação, busca em tempo real e exportação profissional em PDF A4 e planilha Excel (XLSX).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Seletor de 10 Categorias Analíticas de Relatórios:\n  1. Acidentes de Trabalho (CAT / Afastamentos) — coleção `sst_accidents`;\n  2. Comunicações de Acidente de Trabalho (CAT) — coleção `sst_cat`;\n  3. Incidentes e Quase Acidentes (Near Miss) — coleção `sst_incidents`;\n  4. Atestados de Saúde Ocupacional (ASO / NR-7) — coleção `sst_aso`;\n  5. Exames Médicos Ocupacionais Complementares — coleção `sst_exams`;\n  6. EPIs e Uniformes (NR-6) — coleção `sst_epis`;\n  7. Certificados e Treinamentos Obrigatórios — coleção `sst_certificates`;\n  8. Inspeções e Auditorias Periódicas — coleção `sst_inspections`;\n  9. Não Conformidades e Desvios de Segurança — coleção `sst_non_conformities`;\n  10. Eventos Transmitidos eSocial SST (S-2210 / S-2220 / S-2240) — coleção `sst_esocial_sst_events`.\n- Filtro avançado por "Situação / Status" dinâmico alimentado conforme os registros existentes na base.\n- Barra de busca textual rápida pesquisando simultaneamente em todos os campos das tabelas.\n- Cards estatísticos no topo: Total no Banco, Filtrados na Tela, Situações Distintas e Formato de Saída.\n- Exportação Integrada (`ExportActions`): geração imediata de PDF e planilha Excel (XLSX) formatados com cabeçalho oficial, totalizadores e timestamp de emissão.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- A extração reflete estritamente os filtros de busca e situação aplicados pelo usuário em tela.\n- Emissões de relatórios com categorias médicas respeitam as diretrizes de privacidade, não exibindo diagnósticos clínicos detalhados para perfis que não possuem credencial médica.\n- A ordenação padrão dos registros é decrescente por data da ocorrência ou data de cadastro.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário acessa a rota `/admin/sst/relatorios`.\n2. No seletor "Tipo de Relatório", escolhe a categoria desejada entre as 10 disponíveis.\n3. O sistema carrega os dados em tempo real da respectiva coleção do PocketBase.\n4. O operador filtra por status e digita termos de pesquisa para restringir a amostragem.\n5. Clica no botão de exportação (`ExportActions`) para baixar o relatório oficial em PDF ou planilha Excel.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase parametrizadas: `sst_accidents`, `sst_cat`, `sst_incidents`, `sst_aso`, `sst_exams`, `sst_epis`, `sst_certificates`, `sst_inspections`, `sst_non_conformities`, `sst_esocial_sst_events`.\n- Hooks: `useRealtime` para atualização automática.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Exportadores: `xlsx` (SheetJS) e gerador de documentos em PDF de alta resolução.\n- Sincronização direta com todas as tabelas operacionais do ecossistema SST.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso liberado para perfis autorizados de SST, RH, DP, Diretoria e auditores internos credenciados.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `SstRelatoriosScreen`, `ExportActions`, `SstTable`, `SstLoading`, `SstStatusBadge`.\n- Serviços: `src/services/sst.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Em caso de falha de carregamento da coleção selecionada, exibe mensagem amigável de lista vazia sem interromper a seleção de outras categorias.\n- Busca sem resultados apresenta card com orientações de ajuste de filtros.',
    },
  },
}
