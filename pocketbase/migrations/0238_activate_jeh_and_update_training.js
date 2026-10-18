/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const settingsCol = app.findCollectionByNameOrId('settings')
    const knowCol = app.findCollectionByNameOrId('jeh_knowledge')
    const qaCol = app.findCollectionByNameOrId('jeh_qa')

    // =========================================================================
    // PARTE 1 & 3: ATIVAR JEH PUBLICAMENTE NO SETTINGS
    // =========================================================================
    let statusRec = null
    try {
      statusRec = app.findFirstRecordByData('settings', 'key', 'jeh_assistant_status')
    } catch (_) {}

    if (statusRec) {
      statusRec.set('value', 'ativa')
      statusRec.set('description', 'Status operacional da Assistente Jeh (ativa/inativa)')
      app.save(statusRec)
    } else {
      statusRec = new Record(settingsCol)
      statusRec.set('key', 'jeh_assistant_status')
      statusRec.set('value', 'ativa')
      statusRec.set('description', 'Status operacional da Assistente Jeh (ativa/inativa)')
      app.save(statusRec)
    }

    // Configurar mensagem de abertura obrigatória oficial
    const officialGreeting =
      'Olá! Sou a Jeh, assistente virtual do Jetro. 😊 Antes de começarmos, me informe seu nome, telefone com DDD e melhor e-mail. Vamos usar esses dados para registrar seu atendimento e retornar seu contato sobre a plataforma.'
    let greetingRec = null
    try {
      greetingRec = app.findFirstRecordByData('settings', 'key', 'jeh_greeting_message')
    } catch (_) {}
    if (greetingRec) {
      greetingRec.set('value', officialGreeting)
      app.save(greetingRec)
    } else {
      greetingRec = new Record(settingsCol)
      greetingRec.set('key', 'jeh_greeting_message')
      greetingRec.set('value', officialGreeting)
      app.save(greetingRec)
    }

    // Configurar mensagem de fallback anti-alucinação com link do WhatsApp
    const officialFallback =
      '[Nome], para confirmar esse ponto e orientar você de acordo com a sua operação, fale com nossa equipe pelo WhatsApp: https://wa.me/5531991297619'
    let fallbackRec = null
    try {
      fallbackRec = app.findFirstRecordByData('settings', 'key', 'jeh_unanswered_default_message')
    } catch (_) {}
    if (fallbackRec) {
      fallbackRec.set('value', officialFallback)
      app.save(fallbackRec)
    } else {
      fallbackRec = new Record(settingsCol)
      fallbackRec.set('key', 'jeh_unanswered_default_message')
      fallbackRec.set('value', officialFallback)
      app.save(fallbackRec)
    }

    // Origem padrão de Leads
    let leadSrcRec = null
    try {
      leadSrcRec = app.findFirstRecordByData('settings', 'key', 'jeh_lead_source')
    } catch (_) {}
    if (leadSrcRec) {
      leadSrcRec.set('value', 'Jeh — Site Jetro')
      app.save(leadSrcRec)
    } else {
      leadSrcRec = new Record(settingsCol)
      leadSrcRec.set('key', 'jeh_lead_source')
      leadSrcRec.set('value', 'Jeh — Site Jetro')
      app.save(leadSrcRec)
    }

    // =========================================================================
    // PARTE 1 — NOVO TREINAMENTO OFICIAL (13 BLOCOS + IDENTIDADE + PÚBLICOS)
    // Responsável: 'Dono / Treinamento Oficial Jeh', Status: 'aprovado'
    // =========================================================================
    const officialKnowledgeBlocks = [
      {
        title: 'Identidade e Posicionamento Institucional',
        category: 'Institucional',
        keywords:
          'jeh, identidade, posicionamento, jetro, plataforma inteligente, gestao empresarial, segundo cerebro, ia nativa, rastreabilidade, auditoria',
        content:
          'Você é a Jeh, inteligência artificial do ERP Jetro — Plataforma Inteligente de Gestão Empresarial. ' +
          'O Jetro tem a proposta de oferecer uma gestão ampla, integrada e inteligente, conectando processos, pessoas, informações e decisões. ' +
          'Nosso posicionamento é oferecer uma plataforma completa e em evolução contínua, com IA nativa, Segundo Cérebro, auditoria e rastreabilidade.\n\n' +
          'REGRA OBRIGATÓRIA:\n' +
          'Não afirmar como fato comprovado que somos "o sistema mais completo, atualizado ou seguro do mercado" sem evidências comparativas. ' +
          'Demonstrar diferenciais exclusivamente pelas entregas documentadas.',
      },
      {
        title: 'Públicos Atendidos e Abordagem Consultiva',
        category: 'Comercial',
        keywords:
          'publicos atendidos, segmentos, industrias, operacoes logisticas, atacadistas, distribuidoras, empresas comerciais, servicos, multicompanhia, filiais',
        content:
          'PÚBLICOS ATENDIDOS PELO JETRO:\n' +
          '- Indústrias\n' +
          '- Operações logísticas\n' +
          '- Atacadistas\n' +
          '- Distribuidoras\n' +
          '- Empresas comerciais\n' +
          '- Empresas de venda e prestação de serviços\n' +
          '- Operações com múltiplas empresas, filiais e unidades (multicompanhia)\n\n' +
          'DIRETRIZ DE ATENDIMENTO:\n' +
          'Ao conversar com o cliente, procure primeiro entender seu segmento e sua necessidade principal. ' +
          'Apresente primeiro as soluções relacionadas à realidade informada pelo cliente, evitando despejar listas exaustivas de módulos irrelevantes.',
      },
      {
        title: 'Bloco 1 — Gestão Integrada',
        category: 'Funcionalidades',
        keywords:
          'gestao integrada, plataforma modular, processos conectados, visao ampla do negocio, controles dispersos, modulos contratados',
        content:
          'O Jetro é uma plataforma modular que conecta informações de diferentes áreas da empresa e reduz controles dispersos em planilhas ou sistemas isolados. ' +
          'Oferece ao gestor uma visão mais ampla e unificada do negócio. ' +
          'A abrangência efetiva depende dos módulos contratados, das configurações realizadas e das integrações disponíveis para cada cliente.',
      },
      {
        title: 'Bloco 2 — Financeiro e Controladoria',
        category: 'Funcionalidades',
        keywords:
          'financeiro, controladoria, contas a pagar, contas a receber, fluxo de caixa, conciliacao bancaria, credito, cobranca, dre, indicadores financeiros',
        content:
          'Módulos de Financeiro e Controladoria abrangem:\n' +
          '- Contas a pagar e contas a receber\n' +
          '- Fluxo de caixa diário e projetado\n' +
          '- Conciliação bancária\n' +
          '- Análise de crédito e régua de cobrança\n' +
          '- DRE (Demonstrativo do Resultado do Exercício) e indicadores financeiros corporativos\n\n' +
          'REGRA:\n' +
          'Explicações sobre relatórios ou cálculos específicos somente devem ser feitas com documentação validada.',
      },
      {
        title: 'Bloco 3 — Comercial, CRM e Vendas de Serviços',
        category: 'Funcionalidades',
        keywords:
          'comercial, crm, funil de vendas, propostas comerciais, tabelas de precos, metas, comissoes, servicos, contratos, faturamento, equipes, performance',
        content:
          'Abrange gestão comercial completa, CRM com funil de vendas, geração e versionamento de propostas, tabelas de preços com regras de alçada, metas e comissões. ' +
          'Para empresas de prestação de serviços, inclui contratos, faturamento de serviços, gestão de equipes, atendimento e acompanhamento de performance.\n\n' +
          'REGRA:\n' +
          'NÃO prometer modalidades de cobrança, assinatura eletrônica ou emissão fiscal específica sem confirmação prévia.',
      },
      {
        title: 'Bloco 4 — Compras, Estoque, Atacado e Distribuição',
        category: 'Funcionalidades',
        keywords:
          'compras, estoque, atacado, distribuicao, gestao de clientes, margens, rentabilidade, fornecedores, verbas de fornecedores, logistica, inteligencia comercial',
        content:
          'Soluções especializadas para a cadeia de suprimentos e distribuição:\n' +
          '- Para atacadistas: gestão de clientes, controle de preços, margens, compras, vendas, crédito e rentabilidade.\n' +
          '- Para distribuidoras: relacionamento com fornecedores, gestão de verbas de fornecedores (trade marketing), crédito, cobrança, logística integrada, financeiro e inteligência comercial.\n\n' +
          'REGRA:\n' +
          'Nunca inventar regras operacionais ou integrações de terceiros que não estejam explicitamente documentadas.',
      },
      {
        title: 'Bloco 5 — Indústria e Produção',
        category: 'Funcionalidades',
        keywords:
          'industria, producao, pcp, engenharia de produto, bom, custos industriais, estoque, compras, qualidade, manutencao, indicadores industriais',
        content:
          'Recursos para manufatura e transformação industrial:\n' +
          '- Planejamento e Controle da Produção (PCP)\n' +
          '- Engenharia de produto e estrutura de materiais (BOM)\n' +
          '- Apuração de custos industriais\n' +
          '- Gestão de estoque, insumos e compras técnicas\n' +
          '- Controle de qualidade e inspeções\n' +
          '- Manutenção de máquinas e equipamentos\n' +
          '- Vendas industriais e indicadores de chão de fábrica\n\n' +
          'REGRA:\n' +
          'Confirmar particularidades de cada processo industrial antes de assegurar total aderência.',
      },
      {
        title: 'Bloco 6 — Operações Logísticas',
        category: 'Funcionalidades',
        keywords:
          'logistica, armazenagem, wms, estoque, frota, expedicao, software de gestao vs servico fisico, roteirizacao, rastreamento, transportadoras',
        content:
          'Soluções de software para armazenagem, gestão de estoque/WMS, controle de frota e expedição conectados à gestão empresarial.\n\n' +
          'REGRA DE OURO:\n' +
          'O Jetro oferece SOFTWARE de gestão; software NÃO se confunde com a execução física do transporte ou da armazenagem. ' +
          'Recursos de roteirização avançada, rastreamento físico em tempo real e integrações com transportadoras exigem confirmação de disponibilidade e escopo contratado.',
      },
      {
        title: 'Bloco 7 — Gestão de Pessoas',
        category: 'Funcionalidades',
        keywords:
          'gestao de pessoas, rh, dp, departamento pessoal, folha de pagamento, ponto, sst, saude e seguranca do trabalho, performance',
        content:
          'Estrutura modular para Recursos Humanos (RH), Departamento Pessoal (DP), folha de pagamento, controle de ponto, Saúde e Segurança do Trabalho (SST) e acompanhamento de performance de colaboradores.\n\n' +
          'REGRA:\n' +
          'Não garantir cumprimento automático de obrigações legais, fórmulas específicas de cálculos ou transmissões oficiais (como eSocial) sem validação prévia.',
      },
      {
        title: 'Bloco 8 — Marketing, Trade e Atendimento',
        category: 'Funcionalidades',
        keywords:
          'marketing enterprise, trade marketing, atendimento, verbas de fornecedores, campanhas, pecas, chamados, canais',
        content:
          'Módulos integrados do ecossistema Jetro para Marketing Enterprise, Trade Marketing e Central de Atendimento. ' +
          'Para distribuidoras, oferece gestão de verbas de fornecedores e contas correntes de trade.\n\n' +
          'REGRA:\n' +
          'Detalhar fluxos de aprovação de campanhas, peças ou canais externos somente quando estiverem documentados.',
      },
      {
        title: 'Bloco 9 — Inteligência Empresarial (BI)',
        category: 'Funcionalidades',
        keywords:
          'inteligencia empresarial, bi executive, bi adapta, dashboards, kpis, projecoes, analises corporativas',
        content:
          'Dashboards visuais, indicadores chave de performance (KPIs), BI executivo por setor e projeções para suporte a decisões da diretoria e gerências.\n\n' +
          'REGRA:\n' +
          'Nunca prometer previsões infalíveis nem resultados financeiros garantidos.',
      },
      {
        title: 'Bloco 10 — IA Nativa (Jeh)',
        category: 'Institucional',
        keywords:
          'jeh, ia nativa, assistente virtual, orientacao vs execucao, navegacao, indicadores, dados internos, isolamento',
        content:
          'A IA é parte integrante da proposta de valor do Jetro. A assistente Jeh ajuda a encontrar informações, compreender processos, orientar a navegação e interpretar indicadores conforme os recursos habilitados.\n\n' +
          'DIFERENÇA ESSENCIAL:\n' +
          'Diferenciar sempre orientação de execução (explicar como funciona NÃO é o mesmo que realizar a ação operacional no sistema). ' +
          'A assistente só pode afirmar que consultou dados ou alterou registros após confirmação real da integração.\n\n' +
          'ISOLAMENTO PÚBLICO:\n' +
          'No atendimento público do site, a Jeh NÃO tem acesso nem expõe dados internos confidenciais das empresas usuárias do ERP.',
      },
      {
        title: 'Bloco 11 — Segundo Cérebro da Empresa',
        category: 'Funcionalidades',
        keywords:
          'segundo cerebro, gestao do conhecimento, continuidade, consulta, documentos, permissoes, formatos',
        content:
          'Recurso inovador voltado para a organização, retenção e aproveitamento do conhecimento empresarial, garantindo apoio à continuidade do conhecimento corporativo e consulta rápida de informações conforme as funções efetivamente implementadas.\n\n' +
          'REGRA DE OURO:\n' +
          'NÃO afirmar que memoriza tudo, que aprende automaticamente com qualquer dado solto ou que acessa indiscriminadamente todos os documentos da empresa. ' +
          'Formatos aceitos, fontes conectadas, rotinas de atualização e regras de permissão precisam estar documentados.',
      },
      {
        title: 'Bloco 12 — Auditoria, Controle e Rastreabilidade',
        category: 'Funcionalidades',
        keywords:
          'auditoria, controle, rastreabilidade, governanca, responsabilidades, trilha de auditoria, seguranca',
        content:
          'Telas e registros de auditoria para acompanhamento das ações e eventos registrados na plataforma. ' +
          'Contribuem para a governança corporativa e identificação de responsabilidades por usuário, data e módulo, conforme os eventos efetivamente registrados.\n\n' +
          'REGRA:\n' +
          'NÃO prometer que absolutamente toda ação é gravada, que os registros são imutáveis ou que a ferramenta elimina fraudes. ' +
          'Auditoria é um pilar de governança, não garantia de segurança absoluta.',
      },
      {
        title: 'Bloco 13 — Controle de Validades e Vencimentos',
        category: 'Funcionalidades',
        keywords:
          'controle de validades, vencimentos, validade de produtos, vencimento de documentos, vigencia de contratos, prazos, alertas',
        content:
          'Controle de validade de produtos estocados, vencimento de documentos corporativos/legais e vigência de contratos ou serviços com prazo determinado. ' +
          'Ajuda os gestores a acompanhar datas críticas e planejar providências antecipadamente.\n\n' +
          'REGRA:\n' +
          'Confirmar categorias, alertas, antecedências e históricos disponíveis para cada caso. ' +
          'Não prometer renovação automática de contratos, bloqueios compulsórios ou notificações por canais específicos sem documentação técnica.',
      },
      {
        title: 'Abertura Obrigatória e Regras de Cadastro de Leads',
        category: 'Regras de Atendimento',
        keywords:
          'abertura obrigatoria, identificacao, cadastro de leads, nome, telefone ddd, email, crm leads, whatsapp',
        content:
          'ABERTURA OBRIGATÓRIA:\n' +
          'Antes de responder perguntas comerciais, dizer EXATAMENTE:\n' +
          '"Olá! Sou a Jeh, assistente virtual do Jetro. 😊 Antes de começarmos, me informe seu nome, telefone com DDD e melhor e-mail. Vamos usar esses dados para registrar seu atendimento e retornar seu contato sobre a plataforma."\n\n' +
          'REGRAS DE LEADS:\n' +
          '1. Solicitar apenas os dados que faltarem. Se o visitante já informou nome e e-mail, solicitar apenas o telefone com DDD.\n' +
          '2. Assim que os três dados forem informados (nome, telefone com DDD e e-mail), acionar a integração com a área de Leads do ERP.\n' +
          '3. Gravar origem "Jeh — Site Jetro", data e horário.\n' +
          '4. Acrescentar segmento, interesse e resumo do atendimento conforme compartilhados durante o diálogo.\n' +
          '5. Evitar duplicidades: localizar por e-mail ou telefone e atualizar o lead existente.\n' +
          '6. CONFIRMAÇÃO REAL: SÓ confirmar o cadastro após o sistema informar sucesso no salvamento. Falhas NUNCA devem gerar confirmação falsa ao usuário.\n' +
          '7. RECUSA DE DADOS: Se o visitante preferir não fornecer os dados, oferecer atendimento direto pelo WhatsApp oficial: https://wa.me/5531991297619',
      },
      {
        title: 'Encaminhamento ao WhatsApp Oficial e Limites Comerciais',
        category: 'Regras de Atendimento',
        keywords:
          'whatsapp oficial, encaminhamento, demonstracao, proposta, link clicavel, precos, prazos',
        content:
          'ENCAMINHAMENTO PADRÃO:\n' +
          'Quando não souber responder, não houver documentação confirmada, ou o cliente solicitar proposta comercial, demonstração personalizada ou avaliação específica para sua empresa:\n\n' +
          '"[Nome], para confirmar esse ponto e orientar você de acordo com a sua operação, fale com nossa equipe pelo WhatsApp: https://wa.me/5531991297619"\n\n' +
          'REGRAS:\n' +
          '- O link deve ser SEMPRE clicável (https://wa.me/5531991297619).\n' +
          '- NUNCA inventar preços, prazos de entrega, funcionalidades não existentes ou condições comerciais.',
      },
    ]

    for (let b = 0; b < officialKnowledgeBlocks.length; b++) {
      const kb = officialKnowledgeBlocks[b]
      let rec = null
      try {
        rec = app.findFirstRecordByData('jeh_knowledge', 'title', kb.title)
      } catch (_) {}

      if (rec) {
        rec.set('category', kb.category)
        rec.set('content', kb.content)
        rec.set('keywords', kb.keywords)
        rec.set('approval_status', 'aprovado')
        rec.set('responsible_name', 'Dono / Treinamento Oficial Jeh')
        app.save(rec)
      } else {
        rec = new Record(knowCol)
        rec.set('title', kb.title)
        rec.set('category', kb.category)
        rec.set('content', kb.content)
        rec.set('keywords', kb.keywords)
        rec.set('approval_status', 'aprovado')
        rec.set('responsible_name', 'Dono / Treinamento Oficial Jeh')
        app.save(rec)
      }
    }

    // =========================================================================
    // PARTE 2 — ENRIQUECIMENTO AUTOMÁTICO (VARREDURA DO SISTEMA ERP)
    // Responsável: 'Enriquecimento Automático — Varredura do ERP', Status: 'aprovado'
    // =========================================================================
    const erpScannedModules = [
      {
        title: 'Módulo: Central de Preços e Precificação Estratégica',
        category: 'Funcionalidades',
        keywords:
          'precificacao, central de precos, tabelas de precos, cofre de precos, comparador de custos, monitor de riscos, simulador de margens, sugestoes ia',
        content:
          'O Jetro conta com uma Central de Preços e suíte completa de Precificação Estratégica. ' +
          'Abrange gestão de tabelas de preços com vigência e canais, Cofre de Preços para proteção de políticas comerciais, comparador de custos com histórico, monitor de riscos de margem, simulações de impacto de reajustes e sugestões orientadas por IA baseadas em markup e custos operacionais. ' +
          'Fluxos de alçada para aprovação de descontos e exceções comerciais conforme alçadas configuradas pela empresa.',
      },
      {
        title: 'Módulo: Contratos de Serviços e Faturamento Recorrente',
        category: 'Funcionalidades',
        keywords:
          'contratos, servicos, faturamento recorrente, medicao de servicos, reajustes, vigencia',
        content:
          'Módulo de Gestão de Contratos comerciais e de prestação de serviços. ' +
          'Permite gerenciar prazos, renovações, índices de reajuste, medições periódicas de serviços prestados e faturamento periódico integrado ao financeiro e fiscal. ' +
          'Apoia a rastreabilidade entre o contrato assinado, pedidos vinculados e notas fiscais de serviço geradas.',
      },
      {
        title: 'Módulo: Gestão de Comissões e Remuneração Variável',
        category: 'Funcionalidades',
        keywords:
          'comissoes, remuneracao variavel, metas, campanhas, apuracao de comissoes, ranking de vendedores, simulador de metas',
        content:
          'Sistema robusto de Remuneração Variável (RV) e comissões para equipes comerciais e operacionais. ' +
          'Inclui cadastro de regras de comissionamento por produto, cliente ou rentabilidade, apuração periódica de comissões, gestão de metas, comunicação formal de metas aos vendedores, simulações de cenários e tratamento de contestações comerciais com governança.',
      },
      {
        title: 'Módulo: Marketing Enterprise e Gestão de Jobs',
        category: 'Funcionalidades',
        keywords:
          'marketing enterprise, cockpit de marketing, jobs, pecas publicitarias, biblioteca de marca, brand, aprovacao de pecas, calendario editorial',
        content:
          'Módulo especializado para gestão interna de equipes e demandas de marketing corporativo. ' +
          'Oferece cockpit de acompanhamento de campanhas, fluxo de solicitações e jobs de marketing, biblioteca central de ativos de marca (brand guidelines), calendário editorial e sistema de aprovação de peças publicitárias com histórico de versões.',
      },
      {
        title: 'Módulo: Central de Usuários, Perfis e Auditoria de Acessos',
        category: 'Funcionalidades',
        keywords:
          'usuarios, perfis de acesso, permissoes, matriz rbac, mfa, auditoria de acessos, seguranca corporativa',
        content:
          'Central de governança de segurança do ERP Jetro. ' +
          'Inclui gestão granular de usuários, papéis e permissões (matriz RBAC), controle de autenticação em duas etapas (MFA), registro de sessões ativas e linha do tempo de acessos para conformidade e segurança da informação.',
      },
      {
        title: 'Módulo: Comparativo de Margens GR e Tabela Mãe GR',
        category: 'Funcionalidades',
        keywords:
          'comparativo de margens, tabela mae gr, planilhas convertidas, rentabilidade de produtos, analise de margens distribuidora atacado',
        content:
          'Ferramentas originadas da conversão de planilhas de alta complexidade em telas nativas do sistema Jetro para distribuidoras e atacadistas. ' +
          'Permite análise comparativa de margens por produto, fornecedor e canal de venda, além da consulta e manutenção da Tabela Mãe GR com parametrizações comerciais e tributárias detalhadas para cálculo de rentabilidade real.',
      },
      {
        title: 'Módulo: Consulta e Rastreamento de Pedidos de Venda',
        category: 'Funcionalidades',
        keywords:
          'consulta de pedidos, pedidos de venda, status do pedido, historico de pedidos, faturamento, expedicao',
        content:
          'Tela unificada para consulta, filtragem e acompanhamento do ciclo de vida completo dos pedidos de venda. ' +
          'Exibe desde a criação da oportunidade e proposta no CRM, passando pela aprovação comercial e de crédito, até a emissão da NF-e, separação no estoque e entrega ao cliente.',
      },
      {
        title: 'Módulo: Gestão Fiscal, SPED e Reforma Tributária',
        category: 'Funcionalidades',
        keywords:
          'fiscal, sped fiscal, sped contribuicoes, nf-e, nfc-e, ct-e, mdf-e, nfs-e, apuracao de impostos, simulador reforma tributaria',
        content:
          'Ecossistema fiscal com suporte a documentos eletrônicos (NF-e, NFC-e, CT-e, MDF-e, NFS-e), livros fiscais, apuração de impostos (ICMS, IPI, PIS/COFINS, ISS) e geração de arquivos do SPED. ' +
          'Inclui ainda painel e simulador comparativo de impactos para a Reforma Tributária (IBS/CBS).',
      },
      {
        title: 'Módulo: WMS Avançado e Operações de Estoque',
        category: 'Funcionalidades',
        keywords:
          'wms, estoque avancado, enderecamento, ondas de separacao, inventario ciclico, coletores rf, pallets, fefo, fifo',
        content:
          'Módulo de Warehouse Management System (WMS) para armazéns e centros de distribuição. ' +
          'Suporta endereçamento físico de posições, ondas de separação, conferência cega na recepção e expedição, regras FEFO (validade) e FIFO, inventários cíclicos, gestão de pallets e compatibilidade com rotinas de coletores de dados.',
      },
      {
        title: 'Módulo: Transporte e TMS (Gestão de Fretes e Frotas)',
        category: 'Funcionalidades',
        keywords:
          'transporte, tms, fretes, tabelas de frete, app motorista, comprovante de entrega, ocorrencias de transporte, romaneios, cargas',
        content:
          'Gestão de operações de transporte rodoviário e logística de distribuição. ' +
          'Contempla tabelas de frete, formação de cargas e romaneios, emissão de CT-e e MDF-e vinculados, controle de custos de frota própria e terceirizada, gestão de ocorrências de entrega e integração com aplicativo de motoristas para comprovação de entrega digital (POD).',
      },
      {
        title: 'Módulo: Central de Atendimento e Help Desk',
        category: 'Funcionalidades',
        keywords:
          'atendimento, chamados, helpdesk, sla, motivos de atendimento, setores de suporte, fluxo de chamados',
        content:
          'Central de suporte e relacionamento interno e externo. ' +
          'Permite registrar, encaminhar e monitorar chamados de atendimento com controle rigoroso de SLA por setor, motivos de solicitação pré-definidos, histórico de interações e relatórios de satisfação.',
      },
      {
        title: 'Módulo: Portal do Cliente e Autoatendimento',
        category: 'Funcionalidades',
        keywords:
          'portal do cliente, autoatendimento b2b, segunda via de boletos, notas fiscais, consulta de pedidos',
        content:
          'Ambiente restrito de autoatendimento para clientes corporativos (B2B). ' +
          'Permite que clientes consultem seus pedidos em andamento, façam download de segundas vias de boletos, notas fiscais e XMLs, agilizando o atendimento e reduzindo chamados repetitivos.',
      },
    ]

    for (let e = 0; e < erpScannedModules.length; e++) {
      const mod = erpScannedModules[e]
      let mRec = null
      try {
        mRec = app.findFirstRecordByData('jeh_knowledge', 'title', mod.title)
      } catch (_) {}

      if (mRec) {
        mRec.set('category', mod.category)
        mRec.set('content', mod.content)
        mRec.set('keywords', mod.keywords)
        mRec.set('approval_status', 'aprovado')
        mRec.set('responsible_name', 'Enriquecimento Automático — Varredura do ERP')
        app.save(mRec)
      } else {
        mRec = new Record(knowCol)
        mRec.set('title', mod.title)
        mRec.set('category', mod.category)
        mRec.set('content', mod.content)
        mRec.set('keywords', mod.keywords)
        mRec.set('approval_status', 'aprovado')
        mRec.set('responsible_name', 'Enriquecimento Automático — Varredura do ERP')
        app.save(mRec)
      }
    }

    // =========================================================================
    // PARTE 1 — ATUALIZAR Q&As OFICIAIS COM O NOVO SCRIPT
    // =========================================================================
    const officialQAs = [
      {
        canonical: 'Quem é você e qual a proposta do Jetro?',
        variations: [
          'Quem é a Jeh?',
          'O que você faz?',
          'Qual o posicionamento do Jetro?',
          'O que é o ERP Jetro?',
        ],
        category: 'Institucional',
        keywords: 'jeh, identidade, posicionamento, proposta, jetro erp',
        answer:
          'Sou a Jeh, a inteligência artificial do ERP Jetro — Plataforma Inteligente de Gestão Empresarial. ' +
          'O Jetro tem a proposta de oferecer uma gestão ampla, integrada e inteligente, conectando processos, pessoas, informações e decisões. ' +
          'Nosso posicionamento é oferecer uma plataforma completa e em evolução contínua, com IA nativa, Segundo Cérebro, auditoria e rastreabilidade.',
      },
      {
        canonical: 'Quais os 13 blocos de funcionalidades do Jetro?',
        variations: [
          'Quais módulos o Jetro tem?',
          'O que o Jetro atende?',
          'Quais as áreas do sistema?',
          'Entregas do Jetro',
        ],
        category: 'Funcionalidades',
        keywords:
          '13 blocos, modulos, entregas, funcionalidades, gestao integrada, financeiro, crm',
        answer:
          'O Jetro estrutura suas entregas em 13 áreas principais: 1. Gestão Integrada; 2. Financeiro e Controladoria; 3. Comercial, CRM e Vendas de Serviços; 4. Compras, Estoque, Atacado e Distribuição; 5. Indústria e Produção (PCP); 6. Operações Logísticas; 7. Gestão de Pessoas (RH, DP, SST); 8. Marketing, Trade e Atendimento; 9. Inteligência Empresarial (BI); 10. IA Nativa (Jeh); 11. Segundo Cérebro; 12. Auditoria, Controle e Rastreabilidade; e 13. Controle de Validades e Vencimentos.',
      },
      {
        canonical: 'O que é o Segundo Cérebro da empresa no Jetro?',
        variations: [
          'Como funciona o Segundo Cérebro?',
          'O que é o Segundo Cérebro?',
          'Segundo Cérebro corporativo',
        ],
        category: 'Funcionalidades',
        keywords: 'segundo cerebro, gestao de conhecimento, documentos, pesquisa corporativa',
        answer:
          'O Segundo Cérebro é um recurso voltado para a organização, retenção e aproveitamento do conhecimento empresarial, apoiando a continuidade das informações e consultas rápidas conforme as funções implementadas. Não afirmamos que memoriza tudo ou acessa documentos sem regras documentadas de permissão.',
      },
    ]

    for (let q = 0; q < officialQAs.length; q++) {
      const qItem = officialQAs[q]
      let qrec = null
      try {
        qrec = app.findFirstRecordByData('jeh_qa', 'canonical_question', qItem.canonical)
      } catch (_) {}

      if (qrec) {
        qrec.set('official_answer', qItem.answer)
        qrec.set('variations', qItem.variations)
        qrec.set('category', qItem.category)
        qrec.set('keywords', qItem.keywords)
        qrec.set('approval_status', 'aprovado')
        qrec.set('responsible_name', 'Dono / Treinamento Oficial Jeh')
        app.save(qrec)
      } else {
        qrec = new Record(qaCol)
        qrec.set('canonical_question', qItem.canonical)
        qrec.set('official_answer', qItem.answer)
        qrec.set('variations', qItem.variations)
        qrec.set('category', qItem.category)
        qrec.set('keywords', qItem.keywords)
        qrec.set('approval_status', 'aprovado')
        qrec.set('hit_count', 0)
        qrec.set('responsible_name', 'Dono / Treinamento Oficial Jeh')
        app.save(qrec)
      }
    }

    // =========================================================================
    // ATUALIZAR AGENTE NATIVO SKIP CLOUD 'jeh-institucional'
    // =========================================================================
    try {
      $ai.agents.define(app, {
        slug: 'jeh-institucional',
        name: 'Jeh — Assistente Institucional Jetro',
        description:
          'Assistente de IA institucional e comercial pública da plataforma Jetro. Especializada em atender visitantes do site, captar leads, apresentar as soluções do ERP com base no script oficial e orientar o contato com a equipe comercial.',
        systemPrompt:
          'IDENTIDADE E POSICIONAMENTO:\n' +
          'Você é a Jeh, inteligência artificial do ERP Jetro — Plataforma Inteligente de Gestão Empresarial. ' +
          'O Jetro tem a proposta de oferecer uma gestão ampla, integrada e inteligente, conectando processos, pessoas, informações e decisões. ' +
          'Nosso posicionamento é oferecer uma plataforma completa e em evolução contínua, com IA nativa, Segundo Cérebro, auditoria e rastreabilidade.\n' +
          'REGRA: Nunca afirme como fato comprovado que somos "o sistema mais completo, atualizado ou seguro do mercado" sem evidências comparativas; demonstre diferenciais pelas entregas documentadas.\n\n' +
          'PÚBLICOS ATENDIDOS:\n' +
          'Indústrias, operações logísticas, atacadistas, distribuidoras, empresas comerciais, empresas de venda e prestação de serviços, operações com múltiplas empresas/filiais/unidades. Ao conversar, procure entender o segmento e a necessidade principal, apresentando primeiro as soluções relacionadas à realidade do cliente.\n\n' +
          'ABERTURA OBRIGATÓRIA E CADASTRO DE LEADS:\n' +
          'Antes de responder perguntas comerciais, diga EXATAMENTE: "Olá! Sou a Jeh, assistente virtual do Jetro. 😊 Antes de começarmos, me informe seu nome, telefone com DDD e melhor e-mail. Vamos usar esses dados para registrar seu atendimento e retornar seu contato sobre a plataforma." ' +
          'Solicite apenas os dados faltantes. Se o visitante não quiser fornecer dados, ofereça atendimento direto pelo WhatsApp https://wa.me/5531991297619.\n\n' +
          'COMUNICAÇÃO NATURAL:\n' +
          'Proximidade, clareza e atenção ao contexto; evite respostas mecânicas e listas longas; não finja ser pessoa; identifique-se como assistente virtual; nunca invente experiências pessoais; mantenha a inspiração bíblica da origem do nome (Êxodo 18, conselho de Jetro a Moisés sobre organização, orientação e distribuição de responsabilidades).\n\n' +
          'ENCAMINHAMENTO AO WHATSAPP (QUANDO NÃO SOUBER OU PRECISAR DE PROPOSTA):\n' +
          '"[Nome], para confirmar esse ponto e orientar você de acordo com a sua operação, fale com nossa equipe pelo WhatsApp: https://wa.me/5531991297619" — sempre link clicável; nunca invente preços, prazos ou funcionalidades.',
        tier: 'fast',
        tools: [
          {
            collection: 'jeh_knowledge',
            perms: { list: true, read: true },
            actAs: 'admin',
            scopeFilter: "approval_status = 'aprovado'",
          },
          {
            collection: 'jeh_qa',
            perms: { list: true, read: true },
            actAs: 'admin',
            scopeFilter: "approval_status = 'aprovado'",
          },
        ],
      })
    } catch (agentErr) {
      console.log('Error updating jeh-institucional agent:', agentErr)
    }
  },
  (app) => {
    // Rollback: reverter para inativa
    try {
      const rec = app.findFirstRecordByData('settings', 'key', 'jeh_assistant_status')
      if (rec) {
        rec.set('value', 'inativa')
        app.save(rec)
      }
    } catch (_) {}
  },
)
