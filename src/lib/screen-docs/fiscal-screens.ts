import type { ScreenDocEntry } from './types'

/**
 * DOCUMENTAÇÃO TÉCNICA E FUNCIONAL DAS 7 TELAS OFICIAIS DO MÓDULO FISCAL
 * Consolidando as ~23 telas fiscais anteriores e unificando a emissão de NF-e
 * Lida diretamente do código real implementado em src/components/fiscal/screens/:
 * 1. Central Fiscal (screen-central-fiscal.tsx) - /admin/fiscal
 * 2. Documentos Fiscais (screen-documentos-fiscais.tsx) - /admin/fiscal/documentos
 * 3. Escrituração e Obrigações (screen-escrituracao-obrigacoes.tsx) - /admin/fiscal/escrituracao
 * 4. Reforma Tributária (screen-reforma-tributaria.tsx) - /admin/fiscal/reforma
 * 5. Certificados e Configurações (screen-certificados-configuracoes.tsx) - /admin/fiscal/certificados-configuracoes
 * 6. Compras e Entradas (screen-compras-entradas.tsx) - /admin/fiscal/compras-entradas
 * 7. Relatórios Fiscais (screen-relatorios-fiscais.tsx) - /admin/fiscal/relatorios
 */
export const FISCAL_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  // -------------------------------------------------------------
  // 1. CENTRAL FISCAL
  // -------------------------------------------------------------
  '/admin/fiscal': {
    route: '/admin/fiscal',
    title: 'Central Fiscal',
    moduleGroup: 'Fiscal',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Atuar como a torre de controle fiscal e tributária unificada do ERP HURAM, consolidando indicadores em tempo real com navegação clicável para as telas especializadas, monitoramento de pendências SEFAZ, apurações tributárias e governança multiempresa (Dec Eldorado e Gran Romano).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 6 Indicadores clicáveis interativos no topo (redirecionam diretamente para as telas do módulo):\n  1. "NF-e Emitidas" -> Documentos Fiscais (/admin/fiscal/documentos);\n  2. "Notas de Entrada" -> Compras e Entradas (/admin/fiscal/compras-entradas);\n  3. "Pendências SEFAZ" -> Documentos Fiscais (/admin/fiscal/documentos);\n  4. "Certificados A1" -> Certificados e Configurações (/admin/fiscal/certificados-configuracoes);\n  5. "Apurações" -> Escrituração e Obrigações (/admin/fiscal/escrituracao);\n  6. "Divergências" -> Reforma Tributária (/admin/fiscal/reforma).\n- 2 Abas Internas estruturadas:\n  1. "Painel Consolidado": dashboard fiscal executivo com visão geral de faturamento fiscal, apurações e alertas tributários;\n  2. "Pendências & Auditoria": monitoramento de transmissão SEFAZ em homologação e auditoria de idempotência de entradas via XML (chave de 44 dígitos).\n- Suporte a multitenancy por empresa ativa via hook `useBrand` e atualização em tempo real via `useRealtime`.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Indicadores são apurados com base na empresa ativa selecionada no contexto do `useBrand`.\n- Documentos fiscais em status temporários ou com inconsistências são segregados em contadores de pendências.\n- Alerta preventivo de validade do Certificado Digital A1 é disparado quando a expiração estiver dentro da janela de 30 dias.\n- Navegação respeita a regra inviolável do Jetro (navegação externa exclusivamente pelo menu lateral e interna por abas da tela).',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O controller ou analista fiscal acessa `/admin/fiscal`.\n2. O painel carrega as estatísticas consolidadas de notas emitidas, entradas XML, pendências e certificados.\n3. O usuário audita os indicadores clicáveis no topo para navegar de forma direcionada ao detalhe correspondente.\n4. Na aba "Pendências & Auditoria", verifica a integridade de chaves de acesso e status de homologação SEFAZ.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `nfe_records`, `purchase_invoices`, `fiscal_certificates`, `fiscal_apuracoes`, `reform_validations`, `fiscal_manifestations`.\n- Hooks: `useBrand` para tenant ativo e `useRealtime` para atualizações automáticas.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Vendas (recepção de pedidos faturados para geração de documentos fiscais).\n- Módulo de Compras (recepção de NF-e de entrada de fornecedores via XML).\n- SEFAZ Estadual (ambiente de homologação ativo).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: controlada por `canViewFiscal(role)` (perfis SUP, ADMIN, FISCAL, CONTABIL e DIRETORIA).\n- Atualização sob demanda via botão "Atualizar".',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenCentralFiscal`, `FiscalDashboard`.\n- Serviços: `@/services/fiscal`, `@/services/sales`, `@/services/purchasing`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Consultas assíncronas encapsuladas com fallbacks defensivos e tratamento de exceção em caso de indisponibilidade de rede.',
    },
  },

  // -------------------------------------------------------------
  // 2. DOCUMENTOS FISCAIS
  // -------------------------------------------------------------
  '/admin/fiscal/documentos': {
    route: '/admin/fiscal/documentos',
    title: 'Documentos Fiscais',
    moduleGroup: 'Fiscal',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar e unificar a gestão de emissão, autorização, cancelamento, correção e manifestação de todos os modelos de documentos fiscais eletrônicos da empresa (NF-e mod. 55, entrada XML, NFC-e mod. 65, NFS-e, CT-e mod. 57, MDF-e mod. 58, CC-e e Inutilização). Absorve a emissão de NF-e antes duplicada em Vendas, estabelecendo origem única.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 7 Abas Internas estruturadas:\n  1. "NF-e Emitidas": painel completo de NF-e modelo 55 layout 4.00, geração de DANFE, simulação de tributos e transmissão em homologação;\n  2. "NF-e Entrada / XML": painel de notas de compra recebidas e importação com verificação de integridade;\n  3. "NFC-e": emissão e histórico de notas fiscais ao consumidor eletrônicas;\n  4. "NFS-e": controle de notas fiscais de serviços tomados e prestados;\n  5. "CT-e / MDF-e": conhecimentos de transporte e manifestos de documentos fiscais integrados;\n  6. "Carta de Correção": emissão e consulta de eventos de CC-e vinculados a NF-e autorizadas;\n  7. "Inutilização & Manifestação": inutilização de faixas de numeração não utilizadas e manifestação do destinatário (ciência da operação, confirmação, desconhecimento ou operação não realizada).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Geração de NF-e modelo 55 layout 4.00 opera em Ambiente de Homologação com pendência externa formalmente declarada de Certificado A1 e credenciamento SEFAZ para transmissão em produção.\n- Não é permitida a emissão de Carta de Correção para campos proibidos por legislação (valores, alíquotas, dados cadastrais de remetente/destinatário ou data de emissão).\n- Inutilização de numeração exige justificativa obrigatória com no mínimo 15 caracteres.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário seleciona o modelo de documento fiscal na aba correspondente.\n2. Para NF-e, visualiza a lista com status de transmissão e botões para emissão ou simulação fiscal.\n3. Aciona o diálogo de emissão ou importação XML para processamento.\n4. Visualiza os protocolos e DANFE em caso de autorização.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `nfe_records`, `purchase_invoices`, `sales_nfce`, `nfse_records`, `cte_records`, `mdfe_records`, `fiscal_corrections`, `fiscal_inutilizations`, `fiscal_manifestations`.\n- Hooks: `useBrand` e `useRealtime`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Vendas (redirecionamento de rotas de NF-e para esta tela).\n- Módulo de Estoque (baixa automática de itens vinculados a NF-e autorizadas).\n- SEFAZ Estadual.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização e Emissão: `canViewFiscal(role)` e perfis autorizados de faturamento/fiscal.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenDocumentosFiscais`, `NfePanel`, `NfcePanel`, `NfsePanel`, `CtePanel`, `MdfePanel`, `CartaCorrecao`, `ManifestacaoDestinatario`, `FiscalGenericScreen`, `PurchaseInvoicesPanel`.\n- Serviços: `@/services/fiscal` e `@/services/sales`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de esquema XML antes do envio e mapeamento de códigos de retorno da SEFAZ.',
    },
  },

  // -------------------------------------------------------------
  // 3. ESCRITURAÇÃO E OBRIGAÇÕES
  // -------------------------------------------------------------
  '/admin/fiscal/escrituracao': {
    route: '/admin/fiscal/escrituracao',
    title: 'Escrituração e Obrigações',
    moduleGroup: 'Fiscal',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Consolidar a geração de obrigações acessórias (SPED Fiscal EFD ICMS/IPI e Contribuições), controle e fechamento dos livros fiscais de entradas/saídas/serviços e apuração periódica de impostos.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 3 Abas Internas estruturadas:\n  1. "SPED": controle e geração de arquivos do SPED Fiscal (EFD ICMS/IPI), SPED Contribuições, ECD, ECF e Reinf com registro de protocolo de transmissão;\n  2. "Livros Fiscais": registro e conferência de livros de entradas, saídas, apuração de ICMS/IPI, serviços prestados/tomados e novos tributos (IBS/CBS);\n  3. "Apuração de Impostos": apuração periódica com totalização de débitos, créditos, saldos devedores/credores e integração com memória de cálculo.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Arquivos de escrituração são gerados por competência mensal fechada e por CNPJ da empresa/filial ativa.\n- O fechamento da apuração congela os lançamentos fiscais do período para evitar divergências com declarações transmitidas.\n- Apuração de ICMS e IPI segue as regras vigentes do regime tributário cadastrado.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O fiscal seleciona a competência desejada.\n2. Na aba "Livros Fiscais", confere se todas as notas do período foram escrituradas.\n3. Na aba "Apuração de Impostos", executa o cálculo de débitos e créditos fiscais.\n4. Na aba "SPED", gera e valida o arquivo digital para envio ao PVA da Receita Federal.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `sped_records`, `fiscal_books`, `fiscal_apuracoes`.\n- Hooks: `useBrand` e `useRealtime`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo Contábil (integração de lançamentos de provisão e pagamento de guias tributárias).\n- Módulo Financeiro (geração de títulos de contas a pagar para guias DAE/DARF).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização e Fechamento: `canViewFiscal(role)` (perfis CONTABIL, FISCAL e ADMIN).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenEscrituracaoObrigacoes`, `FiscalGenericScreen`, `ApuracaoPanel`.\n- Serviços: `@/services/fiscal`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de geração de arquivos SPED para períodos sem lançamentos ou com inconsistências estruturais de NCM/CST.',
    },
  },

  // -------------------------------------------------------------
  // 4. REFORMA TRIBUTÁRIA
  // -------------------------------------------------------------
  '/admin/fiscal/reforma': {
    route: '/admin/fiscal/reforma',
    title: 'Reforma Tributária',
    moduleGroup: 'Fiscal',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Unificar as 8 telas avulsas anteriores da Reforma Tributária (Emenda Constitucional 132/2023) em uma única tela de inteligência e governança: visão geral, alíquotas de IBS/CBS e Imposto Seletivo, cClassTrib, cronograma de transição e simulação auditável de impactos nos preços e margens.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 5 Abas Internas estruturadas:\n  1. "Visão Geral": painel executivo com cronograma da reforma (2026 a 2033), cenários de carga tributária e status das classificações;\n  2. "IBS / CBS": parametrização de alíquotas de referência, splits de recolhimento e gestão de débitos e créditos apurados;\n  3. "cClassTrib & Regras": catálogo de classificação tributária de produtos/serviços (cClassTrib) e motor de regras tributárias com vigência;\n  4. "Transição": matriz de convivência entre o regime atual (PIS/COFINS/ICMS/ISS/IPI) e o novo modelo durante a fase de transição;\n  5. "Impactos & Simulador": simulador interativo com memória de cálculo detalhada para comparação de preços, margens e carga tributária.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Parâmetros e alíquotas da Reforma respeitam a vigência programada conforme legislação federal.\n- Produtos sem cClassTrib definido são sinalizados para classificação obrigatória antes do início do período de testes do IBS/CBS.\n- O simulador não altera dados reais do catálogo até homologação manual.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gestor acessa a aba "Visão Geral" para checar o status de prontidão da empresa.\n2. Na aba "cClassTrib & Regras", associa os novos códigos da Reforma aos itens do cadastro de produtos.\n3. Na aba "Transição", confere as alíquotas proporcionais de cada ano do cronograma.\n4. Na aba "Impactos & Simulador", roda simulações de impacto de custos e preços de venda.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `reform_configs`, `reform_classifications`, `reform_transition`, `reform_rules`, `reform_credits`, `reform_validations`.\n- Hooks: `useBrand` e `useRealtime`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Cadastro de Produtos (vinculação com NCM/CEST e cClassTrib).\n- Simulador Fiscal do Backend (`fiscal-audit-simulator`).\n- Módulo Comercial e Formação de Preço.',
    },
    permissions: {
      title: 'Permissões',
      content: '- Visualização: `canViewFiscal(role)` e diretoria executiva.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenReformaTributaria`, `ReformaDashboard`, `ReformaSimulador`, `FiscalGenericScreen`.\n- Serviços: `@/services/fiscal`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de alíquotas dentro das faixas limites e consistência de datas de vigência.',
    },
  },

  // -------------------------------------------------------------
  // 5. CERTIFICADOS E CONFIGURAÇÕES
  // -------------------------------------------------------------
  '/admin/fiscal/certificados-configuracoes': {
    route: '/admin/fiscal/certificados-configuracoes',
    title: 'Certificados e Configurações',
    moduleGroup: 'Fiscal',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Prover a governança e segurança fiscal da empresa: gestão do Certificado Digital padrão ICP-Brasil (A1), parametrização fiscal por empresa/filial (regime, CRT, inscrições, ambiente) e controle de séries e numeração de documentos fiscais eletrônicos.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Box de Declaração Explícita de Pendências Externas: destaca de forma transparente que a geração de XML modelo 55 layout 4.00 opera em Homologação e depende da instalação de Certificado A1 válido e credenciamento na SEFAZ Estadual para produção.\n- 3 Abas Internas estruturadas:\n  1. "Certificado Digital A1": upload, monitoramento de validade e titularidade de certificados ICP-Brasil;\n  2. "Parâmetros por Empresa": regime tributário (Simples Nacional, Lucro Presumido, Lucro Real), CRT, Inscrição Estadual/Municipal e ambiente SEFAZ;\n  3. "Séries e Numeração": controle rigoroso e sequencial dos últimos números emitidos por série para evitar quebra de sequência ou duplicidade.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Nunca declarar transmissão SEFAZ em produção como pronta até que as pendências externas (Certificado A1 e credenciamento) estejam resolvidas.\n- Não é permitida a regressão ou reutilização de numeração fiscal já autorizada.\n- Certificados com vencimento inferior a 30 dias geram alerta persistente na Central Fiscal.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O administrador configura a empresa e parâmetros fiscais na aba correspondente.\n2. Faz o upload e validação do Certificado Digital A1.\n3. Define a numeração inicial e série para emissão de NF-e e NFC-e.\n4. O sistema valida as credenciais para habilitação dos fluxos de emissão.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `fiscal_certificates`, `fiscal_configurations`, `system_configurations`.\n- Hooks: `useBrand` e `useRealtime`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Motor de Assinatura XML e WebServices da SEFAZ Estadual.\n- Módulo de Cadastros de Empresas (matriz e filiais).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso restrito a perfis com permissão de gestão de segurança fiscal (SUP, ADMIN e FISCAL).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenCertificadosConfiguracoes`, `FiscalGenericScreen`.\n- Serviços: `@/services/fiscal`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação da cadeia de certificados ICP-Brasil e aviso imediato de formato de arquivo inválido ou senha incorreta.',
    },
  },

  // -------------------------------------------------------------
  // 6. COMPRAS E ENTRADAS
  // -------------------------------------------------------------
  '/admin/fiscal/compras-entradas': {
    route: '/admin/fiscal/compras-entradas',
    title: 'Compras e Entradas',
    moduleGroup: 'Fiscal',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar a recepção física e fiscal de mercadorias via importação de XML de NF-e com idempotência garantida por chave de 44 dígitos, confronto físico × fiscal e conciliação estrita de de-para de produtos com fornecedores sem inventar dados.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Botão superior de "Importar XML da NF-e" com dry run de validação antes da efetivação;\n- 3 Abas Internas estruturadas:\n  1. "Notas de Compra": lista de notas fiscais de compra recebidas, status de processamento, fornecedor e valores;\n  2. "Confronto / Conferência": confronto detalhado entre as quantidades/valores contidos no XML e o recebimento físico registrado em doca;\n  3. "Pendências de Vinculação": regras estritas de de-para de produto (`supplier_product_refs`) e bloqueio preventivo de itens não vinculados (zero invenção de itens no cadastro mestre).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Idempotência estrita: tentativa de importação de XML com chave de acesso de 44 dígitos já existente na base é identificada e bloqueada contra duplicidade.\n- Mercadorias sem de-para prévio ou GTIN/código correspondente são bloqueadas como pendência de vinculação; o sistema NUNCA inventa produtos.\n- O estoque e o financeiro (contas a pagar) só são movimentados após a validação do confronto.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O setor de compras/recebimento faz o upload do arquivo XML da NF-e.\n2. O parser extrai a chave de 44 dígitos, emitente, itens e tributos, executando o dry run.\n3. Se houver itens novos do fornecedor, o usuário é direcionado para a aba "Pendências de Vinculação" para estabelecer o vínculo com o produto mestre.\n4. Na aba "Confronto", a equipe confere fisicamente a entrega e confirma o lançamento fiscal.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `purchase_invoices`, `supplier_product_refs`, `products`, `stock_items`.\n- Hooks: `useBrand` e `useRealtime`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Estoque e WMS (geração de ordens de recebimento e alimentação de lotes).\n- Módulo Financeiro (geração de títulos de contas a pagar baseados nas duplicatas do XML).\n- Módulo de Cadastros (cadastro fiscal de produtos v2 e tabela de-para de fornecedores).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewFiscal(role)` e perfis de Almoxarifado, Compras e Recepção.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenComprasEntradas`, `PurchaseInvoicesPanel`, `XmlImportDialog`.\n- Serviços: `@/services/purchasing`, `@/services/products`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Rejeição imediata de arquivos XML corrompidos ou com chaves de acesso mal formatadas com mensagem explicativa em toast.',
    },
  },

  // -------------------------------------------------------------
  // 7. RELATÓRIOS FISCAIS
  // -------------------------------------------------------------
  '/admin/fiscal/relatorios': {
    route: '/admin/fiscal/relatorios',
    title: 'Relatórios Fiscais',
    moduleGroup: 'Fiscal',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Prover a emissão de relatórios fiscais consolidados, comparativos tributários multitenant por empresa (Dec Eldorado × Gran Romano) e exportação de demonstrativos em formatos padronizados (PDF, Excel e SPED).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 3 Abas Internas estruturadas:\n  1. "Livros e Registros": emissão e visualização de relatórios de apuração de tributos, resumo de entradas/saídas por CFOP e CST;\n  2. "Comparativos por Empresa": análise tributária comparativa entre Dec Eldorado (ES) e Gran Romano (SP/ES), avaliando créditos e regimes tributários;\n  3. "Exportações": central de download de arquivos fiscais, XMLs autorizados em lote e demonstrativos contábeis/fiscais.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Relatórios comparativos respeitam as particularidades fiscais de cada estado (ES e SP).\n- Exportações de XMLs e demonstrativos só consideram notas fiscais em status definitivo (Autorizada ou Cancelada).\n- Aplicação de filtros por período e empresa respeitando o perfil de acesso do usuário.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O auditor ou controller acessa `/admin/fiscal/relatorios`.\n2. Na aba "Livros e Registros", seleciona o período e o modelo de relatório desejado.\n3. Na aba "Comparativos por Empresa", analisa a distribuição da carga tributária entre os negócios do grupo.\n4. Na aba "Exportações", realiza o download dos arquivos em formato PDF ou planilha.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `nfe_records`, `purchase_invoices`, `fiscal_apuracoes`, `fiscal_books`.\n- Hooks: `useBrand` e `useRealtime`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo BI Corporativo e Controladoria.\n- Escritórios de contabilidade e auditoria externa.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso permitido a perfis de gestão fiscal, contábil e diretoria (`canViewFiscal(role)`).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenRelatoriosFiscais`, `RelatoriosFiscais`, `DocumentosFiscais`.\n- Serviços: `@/services/fiscal`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Alerta visual quando o período selecionado não possui dados consolidados para exibição.',
    },
  },
}
