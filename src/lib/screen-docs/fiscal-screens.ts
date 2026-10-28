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

  // -------------------------------------------------------------
  // 8. OPERAÇÕES COMERCIAIS & FISCAIS (CGO)
  // -------------------------------------------------------------
  '/admin/fiscal/operacoes': {
    route: '/admin/fiscal/operacoes',
    title: 'Operações Comerciais & Fiscais (CGO)',
    moduleGroup: 'Fiscal',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Implementar a Camada 2 da Arquitetura HURAM de Operações e CFOP: permitir que o vendedor ou operador comercial escolha a operação de negócio UMA ÚNICA VEZ (Venda Normal, Bonificação, Devolução, Transferência, etc.), definindo os efeitos de processo (estoque, financeiro, comissões e contabilização) sem multiplicar opções comerciais para atender exigências fiscais.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Gestão das Operações Comerciais (CGO) com código mnemônico, nome amigável e descrição;\n- Vinculação ao Grupo Gerencial (Camada 1): Vendas, Devoluções, Transferências, Perdas, Remessas e Outros;\n- Configuração explícita de Efeitos Operacionais: estoque (baixa/entrada/reserva/nenhum), financeiro (gera a receber/a pagar/nenhum), pontuação para comissão comercial e contabilização patrimonial;\n- Marcação de "Movimento Comercial Real" para evitar dupla contagem de faturamento e impedir que transferências entre estabelecimentos sejam computadas como vendas;\n- Associação de Finalidade de NF-e (Normal, Complementar, Ajuste, Devolução);\n- Escopo multiempresa (compartilhado ou restrito por empresa/filial).\n- Filtros por grupo gerencial, pesquisa por código/nome e status ativo/inativo.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O vendedor escolhe a operação uma vez. Variações de CFOP NÃO geram novas operações comerciais.\n- Transferência entre estabelecimentos NÃO é venda comercial.\n- Venda e Venda para entrega futura podem pertencer ao mesmo grupo Vendas sem compartilhar o mesmo fluxo operacional.\n- Documentos já emitidos ou antigos NUNCA são recalculados retroativamente por alteração cadastral.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O responsável fiscal cadastra ou ajusta a operação comercial definindo seus efeitos operacionais.\n2. Na emissão de pedido ou NF-e, o usuário seleciona a operação comercial.\n3. O sistema despacha a resolução fiscal para a Matriz de CFOP.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleção PocketBase: `fiscal_operations`.\n- Hooks: `useBrand`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Emissão de NF-e em homologação e produção.\n- Módulo de Pedidos e Comercial.\n- Matriz Fiscal de Determinação de CFOP.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Leitura: todos os usuários comerciais e fiscais.\n- Criação/Edição: perfis FISCAL, ADMIN e SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Componentes: `ScreenOperacoesCgo`.\n- Serviços: `@/lib/fiscal-cfop-service`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de código duplicado e validação de preenchimento dos efeitos operacionais obrigatórios.',
    },
  },

  // -------------------------------------------------------------
  // 9. MATRIZ FISCAL DE CFOP
  // -------------------------------------------------------------
  '/admin/fiscal/matriz-cfop': {
    route: '/admin/fiscal/matriz-cfop',
    title: 'Matriz Fiscal de CFOP',
    moduleGroup: 'Fiscal',
    docVersion: '1.2.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Implementar a Camada 3 da Arquitetura HURAM: motor e matriz de determinação fiscal de CFOP por item, cruzando operação comercial, empresa emitente, procedência da mercadoria nesta empresa, UF de destino, vigência e prioridade, com transparência auditável da regra aplicada, validação automática contínua de consistência e bloqueio estrito de ambiguidades.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Botão superior e Ação "Validar Regras": executa auditoria automática completa de consistência da matriz exclusivamente sobre regras ativas (`ativa=true`), com classificação por gravidade (Erros bloqueantes, Avisos preventivos e Informações);\n- 7 Categorias de Validação Automática implementadas no motor `@/lib/fiscal-cfop-validator` (avaliando exclusivamente regras ativas):\n  1. CFOP inexistente ou malformado contra a tabela oficial de saídas da Receita Federal/SEFAZ (Grupos 5.xxx, 6.xxx e 7.xxx);\n  2. Duplicidade de regras: duas regras ativas no mesmo escopo com mesmo CFOP (redundância cadastral);\n  3. Conflito de prioridade: regras de mesma prioridade no mesmo escopo propondo CFOPs divergentes (bloqueio estrito de ambiguidade);\n  4. Incoerência Origem x CFOP: regra marcada como "produção própria" apontando CFOP de revenda (5.102/6.102) ou vice-versa (risco de autuação SEFAZ);\n  5. Incoerência Destino x CFOP: 1º dígito incompatível com o destino da regra (5=dentro do estado, 6=fora do estado, 7=exterior);\n  6. Vigências sobrepostas no mesmo escopo;\n  7. Regras vencidas ainda ativas;\n- Regras pré-cadastradas desativadas de casos particulares (migração 0298): regras pré-cadastradas com `ativa=false` para Substituição Tributária (5.401, 5.403, 5.405 e pares 6.xxx), Consumidor Final não contribuinte (6.107, 6.108, 5.104, 6.104), Remessas (5.915, 6.915, 5.901, 6.901, 5.949, 6.949), Transferências entre filiais (5.151, 5.152, 6.151, 6.152) e Devoluções de venda (5.201, 5.202, 6.201, 6.202);\n- Distinção visual de regras desativadas: regras com `ativa=false` exibem badge ambar "Aguarda ativação pelo responsável fiscal" com legenda "Decisão do Resp. Fiscal" e linha esmaecida (opacidade reduzida), mantendo separação clara das regras ativas e homologadas;\n- Painel dinâmico de consistência: quando 100% consistente, exibe banner verde "Todas as regras estão consistentes" com timestamp; quando há erros, exibe painel detalhado de achados com fundamentação fiscal e sugestão de correção;\n- Selo "Validada Oficialmente": exibe badge distintivo nas 4 regras-semente principais (5.101, 5.102, 6.101 e 6.102) que foram conferidas contra a Tabela Oficial da Receita Federal/SEFAZ (migração 0297);\n- CRUD completo das regras fiscais da matriz com escopo por empresa/filial, vigência e prioridade;\n- Suporte multiempresa: procedência relativa à emitente (o mesmo produto pode ser fabricação própria na Gran Romano e revenda de terceiros na Dec Eldorado);\n- Histórico de versões das regras (imutabilidade cadastral para documentos antigos);\n- Filtros por operação, procedência, destino e severidade de validação.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Resolução de CFOP estritamente POR ITEM, nunca atributo global fixo do produto.\n- Determinação exclusiva por regras ativas: o motor de determinação de CFOP por item (`evaluateCfopMatrix` e `fiscalCfopService.determineCfop`) considera EXCLUSIVAMENTE regras com `ativa=true`. Regras inativas (como as pré-cadastradas da migração 0298) nunca interferem em nenhum resultado (nem como correspondência, nem como conflito de prioridade ou ambiguidade).\n- Validador fiscal ignora regras inativas: as 7 checagens do validador operam exclusivamente sobre regras com `ativa=true`, impedindo que regras pré-cadastradas desativadas gerem erros, avisos ou ruído cadastral antes de sua ativação formal.\n- Ativação sob responsabilidade exclusiva do responsável fiscal: casos particulares (Substituição Tributária, Consumidor Final, Remessas, Transferências e Devoluções) são disponibilizados desativados para preservar a integridade da operação regular até que o responsável fiscal decida ativá-los e homologá-los conforme a legislação estadual e protocolos aplicáveis.\n- Bloqueio de Ambiguidade: se nenhuma regra corresponder ou houver regras ativas conflitantes de mesma prioridade, a emissão da NF-e é travada até correção da configuração.\n- Distinção estrita mantida: revenda de mercadoria adquirida de terceiros é sempre 5.102/6.102 mesmo quando vendida para cliente industrial (alinhada à tabela da Receita Federal).\n- As 4 regras-semente 5.101/5.102/6.101/6.102 foram conferidas contra a tabela oficial da Receita Federal em 2026-10-27 (migração 0297).\n- Exceções manuais exigem autorização por perfil gestor com justificativa gravada na coleção `fiscal_rule_exceptions`.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O responsável fiscal acessa a tela `/admin/fiscal/matriz-cfop` pelo menu lateral do ERP.\n2. O sistema executa a validação em segundo plano sobre as regras ativas e exibe o status de consistência no topo.\n3. As regras ativas são exibidas normalmente (incluindo o selo "Validada Oficialmente" nas regras-semente da RFB); as regras pré-cadastradas desativadas exibem linha esmaecida e o badge "Aguarda ativação pelo responsável fiscal".\n4. O usuário pode clicar em "Validar Regras" para reprocessar a auditoria sob demanda sobre as regras ativas e inspecionar o relatório por categoria de achado.\n5. O responsável fiscal pode editar qualquer regra desativada para ajustar parâmetros tributários (ex: CST, vigência, prioridade) e marcá-la como ativa quando decidir colocá-la em operação.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `fiscal_cfop_rules`, `fiscal_operations`, `fiscal_rule_exceptions`.\n- Tabela Oficial de CFOPs: `@/lib/fiscal-cfop-table` (Convênio S/Nº 1970 / Ajustes SINIEF / Receita Federal).\n- Hooks: `useBrand`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Motor de Determinação Fiscal (`@/lib/fiscal-cfop-engine`).\n- Validador Automático de CFOP (`@/lib/fiscal-cfop-validator`).\n- Emissão de NF-e em Homologação (`NfeHomologationDialog`).\n- Simulador Fiscal Auditável (`@/components/fiscal/screens/screen-simulador-cfop`).',
    },
    permissions: {
      title: 'Permissões',
      content: '- Exclusivo para perfis FISCAL, ADMIN e SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenMatrizCfop`.\n- Serviços: `@/lib/fiscal-cfop-service`.\n- Bibliotecas: `@/lib/fiscal-cfop-validator`, `@/lib/fiscal-cfop-table`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Destaque visual vermelho de bloqueio de ambiguidade e relatório detalhado com classificação de erros, avisos e fundamentação técnica fiscal.',
    },
  },

  // -------------------------------------------------------------
  // 10. SIMULADOR DE CFOP POR ITEM
  // -------------------------------------------------------------
  '/admin/fiscal/simulador-cfop': {
    route: '/admin/fiscal/simulador-cfop',
    title: 'Simulador de CFOP por Item',
    moduleGroup: 'Fiscal',
    docVersion: '1.0.0',
    lastUpdated: '2026-04-18',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Disponibilizar aos usuários fiscais, comerciais e gerentes ferramenta interativa de simulação em tempo real do motor de determinação de CFOP por item, demonstrando a decisão comercial única gerando CFOPs diferenciados por item conforme a procedência na empresa emitente e o destino da operação, acompanhados da explicação auditável da regra e do apontamento visual de bloqueios.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Seleção da operação comercial CGO, empresa emitente, UF de emitente, UF de destino e data de competência;\n- Grade dinâmica de múltiplos itens com configuração individual de procedência (fabricação própria vs mercadoria de terceiros), quantidade e valor unitário;\n- Exibição do CFOP resultante por item com a explicação exata da regra aplicada e destaque se é exemplo didático a validar;\n- Apontamento visual de travas e ambiguidades (regras inexistentes ou conflitantes);\n- Botão de pré-carregamento com o exemplo didático do documento HURAM (Item 1 Gran Romano fabricação própria 5.101/6.101 e Item 2 Dec Eldorado revenda de terceiros 5.102/6.102).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Simula fielmente as condições de emissão do backend sem persistir rascunhos desnecessários.\n- Permite antecipar o enquadramento fiscal antes da geração e transmissão da nota fiscal.\n- Resolução estrita por item: itens no mesmo documento podem receber CFOPs diferentes baseados na procedência para a empresa emitente.\n- Demonstra que uma mudança fiscal na matriz não requer criação de novas operações para os vendedores.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário seleciona a operação comercial desejada.\n2. Insere os itens e parametriza suas procedências nesta empresa emitente.\n3. Clica em "Simular Resolução de CFOP".\n4. O motor avalia a matriz e exibe os CFOPs resolvidos com a explicação auditável de cada um.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `fiscal_operations`, `fiscal_cfop_rules`.\n- Motor: `evaluateCfopMatrix`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Motor Fiscal da Matriz de CFOP.\n- Módulo de Emissão de NF-e.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso liberado a usuários comerciais, faturamento, fiscal e gerência (`canViewFiscal(role)`).',
    },
    dependencies: {
      title: 'Dependências',
      content: '- Componentes: `ScreenSimuladorCfop`.\n- Serviços: `@/lib/fiscal-cfop-service`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Identificação imediata de operações inativas ou regras desatualizadas com exibição do motivo do bloqueio em painel destacado.',
    },
  },

  '/admin/fiscal/cte': {
    route: '/admin/fiscal/cte',
    title: 'Emissão de Conhecimento de Transporte Eletrônico (CT-e Mod 57)',
    moduleGroup: 'Fiscal',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia Fiscal HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Disponibilizar ao ERP HURAM o ciclo completo de emissão de CT-e multitenant, integrando parceiros cadastrados, cálculo automático de impostos (CST/CSOSN e CFOP via motor fiscal), vinculação com NF-e de saída transportadas e homologação com trilha auditada.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Listagem de CT-e com badges de status, filtros por número/tomador/status e métricas consolidadas (quantidade, homologados, rascunhos, valor total da prestação);\n- Editor completo em abas: Dados Gerais (tipo, modal, percurso origem→destino), Partes (tomador, remetente, destinatário, expedidor, recebedor), Componentes da Prestação (com cálculo total automático), Carga & NF-e (vínculo com notas fiscais de vendas do sistema), e Impostos (CFOP resolvido pelo motor fiscal, memória de cálculo de ICMS com alíquota e redução de BC);\n- Resumo financeiro e de carga fixo no topo do editor;\n- Validação das regras tributárias e do Dígito Verificador Módulo 11 da chave de 44 dígitos;\n- Ações: Salvar Rascunho, Validar e Salvar, Gerar e Baixar XML (modelo 57 em formato texto oficial), Homologar em Ambiente de Testes SEFAZ com justificativa e Cancelar com motivo obrigatório auditado.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Multitenancy rigoroso com isolamento por empresa_id;\n- CT-e com status autorizado é imutável perante a SEFAZ, permitindo exclusivamente evento de cancelamento devidamente justificado;\n- CT-e normal exige definição de tomador, remetente, destinatário, ao menos 1 componente de prestação e ao menos 1 documento transportado vinculado;\n- Chave de acesso obedece estritamente ao layout de 44 dígitos com Dígito Verificador calculado via Módulo 11;\n- Cancelamento exige justificativa com no mínimo 15 caracteres gravada em audit_logs.',
    },
    workflow: {
      title: 'Fluxo Operacional',
      content:
        '1. Operador clica em "Novo CT-e", o sistema consulta o endpoint de sequencial e sugere o próximo número.\n2. Parametriza trecho, partes e componentes de frete.\n3. Vincula a NF-e existente faturada.\n4. O motor fiscal sugere o CFOP e calcula a base e o ICMS.\n5. O operador valida o documento e gera o XML para transmissão externa ou homologa no ambiente de testes.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `cte_documents`, `cte_configs`, `partners`, `sales_invoices`, `audit_logs`.\n- Motor: `cte-mdfe-engine.ts` e `fiscal-cfop-service.ts`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo Comercial/Vendas (`sales_invoices`) para importação de notas transportadas.\n- Cadastro de Clientes e Fornecedores (`partners`).\n- Motor Fiscal HURAM para resolução de CFOP e ICMS de transporte.',
    },
    permissions: {
      title: 'Permissões de Acesso',
      content:
        '- Acesso liberado aos perfis com permissão fiscal (`canViewFiscal(role)`), faturamento, logística e gerência executiva.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componente: `ScreenCteEmissao` em `@/components/fiscal/screens/screen-cte-emissao`.\n- Backend: hooks em `pocketbase/hooks/freight_fiscal_guards.js`.',
    },
    errorHandling: {
      title: 'Tratamento de Exceções',
      content:
        '- Alertas imediatos caso falte o remetente, tomador ou documentos de carga.\n- Bloqueio no backend contra alteração de CT-e autorizado ou cancelado.',
    },
  },

  '/admin/fiscal/mdfe': {
    route: '/admin/fiscal/mdfe',
    title: 'Emissão de Manifesto Eletrônico de Documentos Fiscais (MDF-e Mod 58)',
    moduleGroup: 'Fiscal',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia Fiscal HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Garantir a conformidade do transporte de cargas rodoviárias mediante a emissão do manifesto modelo 58, rastreabilidade dos veículos, controle de condutores e encerramento obrigatório ao término do trajeto.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Painel com listagem de manifestos, filtros e indicadores operacionais (total, trânsito, encerrados, valor total da carga);\n- Editor completo em abas: Dados Gerais (trajeto de carregamento→descarregamento), Veículo & Condutores (placa, RNTRC, reboques, condutores com CPF), Vale-Pedágio, CT-e Vinculados (seleção de CT-e emitidos com totalização automática de peso e valor) e Observações;\n- Resumo fixo dos totais da carga no cabeçalho do editor;\n- Validação das regras do manifesto e cálculo de chave de acesso de 44 dígitos;\n- Ações: Salvar Rascunho, Validar, Baixar XML textual modelo 58, Homologar em testes, Cancelar com motivo e Encerrar viagem indicando município/UF de destino.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Manifesto encerrado ou cancelado é estritamente imutável;\n- O encerramento do MDF-e só pode ser realizado se o documento estiver previamente autorizado perante a SEFAZ ou em trânsito;\n- Exige placa do veículo de tração, RNTRC válido perante a ANTT, ao menos 1 condutor cadastrado com CPF e ao menos 1 CT-e vinculado para a carga;\n- Registro automático de todas as ações de criação, alteração e encerramento em `audit_logs`.',
    },
    workflow: {
      title: 'Fluxo Operacional',
      content:
        '1. Criação do manifesto vinculando os CT-e que compõem o carregamento do veículo.\n2. Indicação da placa do caminhão, do condutor responsável e do trajeto.\n3. Homologação ou exportação do XML modelo 58 para transmissão.\n4. Ao descarregar no destino final, acionamento do botão "Encerrar" registrando a UF e município de encerramento.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções: `mdfe_documents`, `mdfe_configs`, `cte_documents`, `audit_logs`.\n- Motor: `cte-mdfe-engine.ts`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo CT-e (`cte_documents`) para amarração e validação de documentos transportados.\n- Controle de frotas e logística.',
    },
    permissions: {
      title: 'Permissões de Acesso',
      content:
        '- Acesso concedido a operadores fiscais, expedição, logística e administração (`canViewFiscal(role)`).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componente: `ScreenMdfeEmissao` em `@/components/fiscal/screens/screen-mdfe-emissao`.\n- Backend: hooks em `pocketbase/hooks/freight_fiscal_guards.js`.',
    },
    errorHandling: {
      title: 'Tratamento de Exceções',
      content:
        '- Bloqueio caso se tente encerrar manifesto ainda não autorizado.\n- Exigência de motivo com no mínimo 15 caracteres para cancelamento.',
    },
  },

  '/admin/fiscal/cte-mdfe-configuracao': {
    route: '/admin/fiscal/cte-mdfe-configuracao',
    title: 'Configurações de CT-e e MDF-e',
    moduleGroup: 'Fiscal',
    docVersion: '1.0.0',
    lastUpdated: '2025-05-18',
    author: 'Engenharia Fiscal HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar as configurações administrativas dos documentos fiscais de transporte modelo 57 e 58 por empresa, definindo os parâmetros de emissão, CFOPs padrão e esclarecendo os requisitos de certificação digital externa.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Parametrização de CT-e: série ativa, último número sequencial, ambiente de operação, regime tributário (Simples, Lucro Presumido, Real), RNTRC da empresa, CFOP padrão estadual e interestadual e observações padrão;\n- Parametrização de MDF-e: série, último sequencial, ambiente, RNTRC padrão da frota, tipo de emitente (prestador vs carga própria) e tipo de transportador (ETC, TAC, CTC);\n- Painel explicativo permanente detalhando que a transmissão real exige Certificado Digital A1 fora do ambiente web HURAM, garantindo integridade e conformidade jurídica.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- As configurações são associadas ao tenant multitenant da empresa ativa (`empresa_id`);\n- O incremento sequencial automático nos endpoints respeita o valor configurado nestas séries;\n- Produção oficial requer certificado A1 e transmissão via emissor externo contratado.',
    },
    workflow: {
      title: 'Fluxo Operacional',
      content:
        '1. O gestor fiscal acessa a tela e informa a série e último sequencial emitido na SEFAZ.\n2. Define o RNTRC e os regimes padrão.\n3. Salva os parâmetros. Todas as novas emissões de CT-e e MDF-e herdam estas configurações automaticamente.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções PocketBase: `cte_configs`, `mdfe_configs`, `empresas`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulos de emissão de CT-e e MDF-e (`cte_documents`, `mdfe_documents`).\n- Endpoints de sequencial `/backend/v1/cte-numbers/next` e `/backend/v1/mdfe-numbers/next`.',
    },
    permissions: {
      title: 'Permissões de Acesso',
      content:
        '- Acesso restrito a gestores fiscais e administradores do sistema (`canViewFiscal(role)`).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componente: `ScreenCteMdfeConfiguracao` em `@/components/fiscal/screens/screen-cte-mdfe-configuracao`.',
    },
    errorHandling: {
      title: 'Tratamento de Exceções',
      content:
        '- Notificações visuais claras de sucesso ou erro na persistência dos parâmetros no banco.',
    },
  },
}
