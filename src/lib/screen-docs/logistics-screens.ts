import type { ScreenDocEntry } from './types'

/**
 * DOCUMENTAÇÃO TÉCNICA E FUNCIONAL DAS 7 TELAS OFICIAIS DO MÓDULO LOGÍSTICA E TRANSPORTE
 * Lida diretamente do código real implementado em src/components/logistics/screens/:
 * 1. Central Logística (screen-central-logistica.tsx) - /admin/logistica
 * 2. Transporte e Frota (screen-transporte-frota.tsx) - /admin/logistica/transporte-frota
 * 3. Distribuição e Entregas (screen-distribuicao-entregas.tsx) - /admin/logistica/distribuicao-entregas
 * 4. Rotas e Roteirização (screen-rotas-roteirizacao.tsx) - /admin/logistica/rotas-roteirizacao
 * 5. Frete e Tabelas (screen-frete-tabelas.tsx) - /admin/logistica/frete-tabelas
 * 6. Ocorrências e Rastreabilidade (screen-ocorrencias-rastreabilidade.tsx) - /admin/logistica/ocorrencias-rastreabilidade
 * 7. Custos e Indicadores Logísticos (screen-custos-indicadores.tsx) - /admin/logistica/custos-indicadores
 */
export const LOGISTICS_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  // -------------------------------------------------------------
  // 1. CENTRAL LOGÍSTICA
  // -------------------------------------------------------------
  '/admin/logistica': {
    route: '/admin/logistica',
    title: 'Central Logística',
    moduleGroup: 'Logística e Transporte',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Atuar como o cockpit executivo e torre de controle central da logística e transporte (TMS/WMS), unificando indicadores em tempo real, painel de orquestração de cargas, planejamento de pedidos e central de exceções logísticas com atalhos interativos.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 6 Indicadores clicáveis interativos no topo (redirecionam diretamente para as telas operacionais especializadas):\n  1. "Em Trânsito" -> Distribuição e Entregas;\n  2. "Veículos em Rota" -> Transporte e Frota;\n  3. "Ocorrências" -> Ocorrências e Rastreabilidade;\n  4. "Rotas Ativas" -> Rotas e Roteirização;\n  5. "Fretes Totais" -> Frete e Tabelas;\n  6. "Viagens Ativas" -> Custos e Indicadores.\n- 4 Abas Internas estruturadas:\n  1. "Cockpit Logístico": orquestração visual de cargas, monitoramento de status e métricas integradas;\n  2. "Painel Operacional": visão analítica de volumes, entregas por modalidade e status da frota;\n  3. "Fila de Planejamento": consolidação de pedidos prontos para embarque e expedição;\n  4. "Central de Exceções": triagem de alertas e sinistros operacionais.\n- Suporte a multitenancy por empresa ativa via hook `useBrand` e atualização em tempo real via `useRealtime`.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Indicadores são calculados considerando exclusivamente o tenant ativo (Dec Eldorado, Gran Romano ou visão consolidada para SUP).\n- Pedidos faturados com status pendente de expedição alimentam automaticamente a fila de planejamento.\n- Exceções críticas (atraso superior ao SLA acordado ou sinistro) disparam sinalização visual de alerta imediato.\n- Navegação respeita a regra inviolável do Jetro (navegação externa exclusivamente pelo menu lateral e interna por abas da tela).',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gestor logístico acessa `/admin/logistica`.\n2. O cockpit carrega simultaneamente as coleções de entregas, veículos, ocorrências, rotas e fretes.\n3. O usuário monitora os alertas da torre de controle ou clica em um indicador para aprofundar na respectiva tela operacional.\n4. Na aba "Fila de Planejamento", analisa ordens prontas para agrupar em novos romaneios.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `logistics_deliveries`, `logistics_vehicles`, `logistics_occurrences`, `logistics_routes`, `logistics_freights`, `transport_journeys`.\n- Hooks: `useBrand` para tenant ativo e `useRealtime` para atualizações automáticas de status.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Faturamento e Vendas (pedidos faturados geram solicitações de entrega).\n- Módulo de Estoque e WMS (conferência e expedição de doca).\n- Módulo Fiscal para validação de Danfes, CT-e e MDF-e associados aos manifestos.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: controlada por `canViewLogistics(role)` (perfis SUP, ADMIN, LOGISTICA, OPERADOR e DIRETORIA).\n- Atualização sob demanda via botão "Atualizar".',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenCentralLogistica`, `LogisticsOrchestrationDashboard`, `LogisticsDashboard`, `LogisticsPlanning`, `LogisticsExceptions`.\n- Serviços: `@/services/logistics` e `@/services/transport-journeys`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Consultas assíncronas com tratamento de exceção seguro via Promise.all e fallback de valores zerados.\n- Mensagens de feedback ao usuário via toast.',
    },
  },

  // -------------------------------------------------------------
  // 2. TRANSPORTE E FROTA
  // -------------------------------------------------------------
  '/admin/logistica/transporte-frota': {
    route: '/admin/logistica/transporte-frota',
    title: 'Transporte e Frota',
    moduleGroup: 'Logística e Transporte',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar integralmente os ativos de transporte (veículos próprios, agregados e terceirizados), condutores/motoristas (habilitação, pontuação e escala) e o plano de manutenção preventiva e corretiva de frota.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 4 Cards de Resumo no Topo: Total de Veículos na Frota (com contagem de disponíveis), Motoristas Cadastrados (com em rota), Ordens de Manutenção Ativas e Revisões Agendadas.\n- 3 Abas Internas estruturadas:\n  1. "Veículos e Implementos": catálogo de caminhões, carretas e utilitários com placa, capacidade em peso/cubagem, ano, renavam e status;\n  2. "Motoristas e Condutores": prontuário de motoristas com CNH, validade do exame toxicológico, vínculo contratual e histórico;\n  3. "Manutenção de Frota": ordens de manutenção preventiva, corretiva e de pneus com custo estimado, oficina e prazos.\n- Tabela JetroTable com busca rápida, exportação e diálogo de Nova Ordem de Manutenção.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Veículos em manutenção ativa não podem ser alocados em romaneios ou viagens abertas.\n- Bloqueio de alocação de motoristas com CNH vencida ou exame toxicológico pendente.\n- Preservação da correlação de multitenancy por empresa em todos os registros da frota.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gestor de frotas acessa `/admin/logistica/transporte-frota`.\n2. Cadastra novos veículos e motoristas nas abas correspondentes.\n3. Abre ordens de serviço preventivas (troca de óleo, rodízio de pneus) ou corretivas na aba "Manutenção de Frota".\n4. Monitora a disponibilidade operacional dos ativos para alimentar a roteirização.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `logistics_vehicles`, `logistics_drivers`, registros de manutenção preventiva/corretiva.\n- Hooks: `useBrand` e `useRealtime`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de RH/DP para conferência de prontuários, escalas e jornada de motoristas.\n- Módulo Financeiro para apropriação dos custos de manutenção e abastecimento.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso: `canViewLogistics(role)` e `canViewTransporte(role)`.\n- Cadastro e edição: analistas de transporte e gestores de frota.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenTransporteFrota`, `LogisticsVehicles`, `LogisticsDrivers`, `JetroTable`, `Dialog`.\n- Serviços: `@/services/logistics`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de preenchimento obrigatório de placa e tipo na abertura de ordens de manutenção.\n- Tratamento seguro de dados nulos nas tabelas.',
    },
  },

  // -------------------------------------------------------------
  // 3. DISTRIBUIÇÃO E ENTREGAS
  // -------------------------------------------------------------
  '/admin/logistica/distribuicao-entregas': {
    route: '/admin/logistica/distribuicao-entregas',
    title: 'Distribuição e Entregas',
    moduleGroup: 'Logística e Transporte',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Controlar todo o fluxo de expedição física: emissão e fechamento de romaneios de carga, monitoramento de entregas a clientes, ordens de coleta, transferências entre filiais, logística reversa (devoluções/trocas) e interface do aplicativo móvel do motorista.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 6 Abas Internas estruturadas:\n  1. "Romaneios": manifesto de carga WMS, conferência de volumes, lacres de segurança e impressão de romaneio de expedição;\n  2. "Entregas": acompanhamento da carteira de entregas ativas por cliente, nota fiscal e previsão;\n  3. "Coletas": gestão de ordens de coleta em fornecedores e devoluções em clientes;\n  4. "Transferências": remessas entre depósitos e plantas da organização;\n  5. "Logística Reversa": triagem, conferência e reintegração ao estoque de materiais recusados ou avariados;\n  6. "App do Motorista": simulador/painel operacional das ações de campo do motorista (check-in, baixa com foto e canhoto digital).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Todo romaneio fechado requer a vinculação de ao menos uma nota fiscal ou pedido faturado válido.\n- Entregas baixadas como "Não Entregue" geram automaticamente solicitação na central de ocorrências e ordem de devolução na logística reversa.\n- Respeito irrestrito ao multitenancy da empresa emissora do romaneio.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. A expedição monta o romaneio na aba "Romaneios" agrupando os pedidos faturados.\n2. Libera o carregamento do caminhão e gera o manifesto de entrega.\n3. O motorista recebe a rota no App do Motorista e realiza as baixas nos clientes.\n4. Entregas concluídas atualizam a carteira e baixas parciais/recusadas seguem para a aba de Logística Reversa.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `wms_romaneios`, `logistics_deliveries`, `logistics_collections`, `logistics_transfers`, `logistics_reverse_logistics`.\n- Integração com pedidos de venda faturados.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo WMS e Estoque (baixa de saldo físico e reposição por devolução).\n- Módulo Fiscal (emissão de MDF-e sobre os romaneios).\n- Módulo de Vendas (atualização de status de entrega do pedido para os vendedores).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso: `canViewLogistics(role)`.\n- Criação e encerramento de romaneios: equipe de expedição e logística.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenDistribuicaoEntregas`, `WmsRomaneios`, `LogisticsDeliveries`, `LogisticsCollections`, `LogisticsTransfers`, `LogisticsReverseOrchestration`, `LogisticsDriverApp`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de limites de carga do veículo no romaneio.\n- Interceptação de falhas de comunicação no aplicativo móvel com gravação de fila.',
    },
  },

  // -------------------------------------------------------------
  // 4. ROTAS E ROTEIRIZAÇÃO
  // -------------------------------------------------------------
  '/admin/logistica/rotas-roteirizacao': {
    route: '/admin/logistica/rotas-roteirizacao',
    title: 'Rotas e Roteirização',
    moduleGroup: 'Logística e Transporte',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Prover o planejamento geográfico inteligente do transporte: cadastro de rotas padrão, roteirização geográfica otimizada (menor distância/tempo), formação e cubagem de cargas, controle de viagens e jornadas de viagem.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 5 Abas Internas estruturadas:\n  1. "Rotas Cadastradas": catálogo de rotas logísticas com origem, destino, quilometragem média, tempo estimado e praças atendidas;\n  2. "Roteirização Otimizada": sequenciamento geográfico inteligente de pontos de entrega para economia de combustível e redução de emissões;\n  3. "Formação de Cargas": consolidação de pedidos com cálculo de cubagem, ocupação volumétrica e distribuição por eixos;\n  4. "Viagens e Jornadas": acompanhamento de partidas, trânsito interestadual/intermunicipal e paradas de jornada;\n  5. "Sequenciamento": grade de planejamento fino por dia e janela de entrega.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Não é permitida a sobrecarga de peso além do PBT (Peso Bruto Total) homologado para o veículo.\n- Janelas de entrega dos clientes são respeitadas no algoritmo de sequenciamento de paradas.\n- Controle da Lei do Motorista nas jornadas de viagens de longa distância.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O analista de roteirização acessa `/admin/logistica/rotas-roteirizacao`.\n2. Na aba "Formação de Cargas", agrupa as entregas verificando volume e peso.\n3. Na aba "Roteirização Otimizada", calcula a melhor sequência de paradas.\n4. Vincula à rota e inicia a viagem gerando o diário de bordo na aba "Viagens e Jornadas".',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `logistics_routes`, `transport_loads`, `transport_journeys`, `logistics_deliveries`.\n- Dados georreferenciados de CEPs dos clientes.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo Comercial (endereços de entrega e restrições de recebimento dos clientes).\n- Central de Fretes para cálculo do valor do frete com base na quilometragem da rota.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso: `canViewLogistics(role)` e `canViewTransporte(role)`.\n- Criação e aprovação de rotas: planejamento logístico e coordenadores de transporte.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenRotasRoteirizacao`, `LogisticsRoutes`, `TransporteRouting`, `TransporteLoadBuilding`, `TransporteJourneys`, `LogisticsRoutePlanning`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Alerta visual quando a carga ultrapassa 100% da capacidade volumétrica ou peso do caminhão.\n- Tratamento de CEPs incompletos com sinalização de aviso.',
    },
  },

  // -------------------------------------------------------------
  // 5. FRETE E TABELAS
  // -------------------------------------------------------------
  '/admin/logistica/frete-tabelas': {
    route: '/admin/logistica/frete-tabelas',
    title: 'Frete e Tabelas',
    moduleGroup: 'Logística e Transporte',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar a governança comercial e financeira do frete: conciliação de fretes contratados por transportadora, aprovações de pagamento, parametrização de tabelas de frete (faixas de peso, percentual Ad Valorem, pedágio e GRIS) e simulação de custos.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 2 Abas Internas estruturadas:\n  1. "Fretes e Pagamentos": lançamento de cotações, cálculo de frete por documento fiscal, conciliação de faturas de transportadoras (CT-e) e fluxo de aprovação de liberação para o Contas a Pagar;\n  2. "Tabelas de Frete": parametrização completa de tabelas de transporte por transportadora, região atendida, faixas de peso, taxas de coleta/entrega, pedágio e adicionais.\n- Diálogo de nova tabela e simulação rápida de frete com base no peso e destino.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Fretes com valor superior ao cotado na tabela de frete homologada exigem justificativa de divergência e aprovação gerencial.\n- O valor aprovado de frete integra diretamente o Contas a Pagar do Módulo Financeiro.\n- Validação das alíquotas de ICMS de transporte de acordo com a UF de origem e destino.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O analista comercial de transportes acessa `/admin/logistica/frete-tabelas`.\n2. Cadastra ou revisa os acordos tarifários na aba "Tabelas de Frete".\n3. Na aba "Fretes e Pagamentos", concilia as notas de frete recebidas contra as tabelas cadastradas.\n4. Autoriza os pagamentos encaminhando os títulos ao financeiro.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `logistics_freights`, `logistics_freight_tables`, `partners` (transportadoras homologadas).\n- Dados do contas a pagar financeiro.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo Financeiro (Contas a Pagar para liquidação dos fretes).\n- Módulo Fiscal (conferência do XML do CT-e emitido pela transportadora).\n- Módulo Comercial para cotação de frete no pedido de venda.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewLogistics(role)`.\n- Aprovação de divergência e edição de tabelas: gestores de compras e logística.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenFreteTabelas`, `LogisticsFreights`, `LogisticsFreightTables`, `Card`, `Button`, `Dialog`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de duplicidade de frete para o mesmo número de conhecimento ou nota fiscal.\n- Validação de faixas de peso para evitar sobreposições de faixas tarifárias.',
    },
  },

  // -------------------------------------------------------------
  // 6. OCORRÊNCIAS E RASTREABILIDADE
  // -------------------------------------------------------------
  '/admin/logistica/ocorrencias-rastreabilidade': {
    route: '/admin/logistica/ocorrencias-rastreabilidade',
    title: 'Ocorrências e Rastreabilidade',
    moduleGroup: 'Logística e Transporte',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Auditar a execução do transporte e atendimento aos clientes: abertura e tratativa de ocorrências de transporte (avarias, extravios, recusas, acidentes), rastreamento de cargas em tempo real e repositório digital de canhotos e comprovantes de entrega (POD).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 3 Abas Internas estruturadas:\n  1. "Ocorrências em Trânsito": lista de sinistros e incidentes com gravidade (Baixa, Média, Alta, Crítica), status (Aberta, Em Análise, Concluída), responsável e plano de ação;\n  2. "Rastreamento em Tempo Real": linha do tempo detalhada da carga, última posição reportada, status de trânsito e estimativa de chegada (ETA);\n  3. "Comprovantes de Entrega (POD)": repositório de canhotos digitalizados com foto do documento assinado, geolocalização e data/hora do recebimento.\n- Modal de abertura de ocorrência com upload de evidências e exportação de relatórios.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Ocorrências com recusa total de mercadoria geram alerta simultâneo para o atendimento e logística reversa.\n- Canhotos anexados têm validação de assinatura e dados do recebedor (nome e documento).\n- Histórico de ocorrências por transportadora alimenta a qualificação de fornecedores.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O analista de SAC/logística acessa `/admin/logistica/ocorrencias-rastreabilidade`.\n2. Ao receber aviso de motorista ou cliente, registra a ocorrência com fotos e detalhes.\n3. Acompanha a resolução do incidente em tempo real.\n4. Na aba de comprovantes, valida e arquiva os canhotos das entregas finalizadas para fins fiscais e de cobrança.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `logistics_occurrences`, `logistics_deliveries`, `logistics_proofs`.\n- Imagens e documentos anexados armazenados no storage.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Atendimento ao Cliente para esclarecimento de dúvidas e status de entrega.\n- Módulo Financeiro / Cobrança (comprovante de entrega como garantia para liquidação de boletos).\n- Módulo de Qualidade para apuração de avarias de produto.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewLogistics(role)`.\n- Encerramento de ocorrências: supervisores de distribuição e logística.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenOcorrenciasRastreabilidade`, `LogisticsOccurrences`, `LogisticsTracking`, `LogisticsProofDelivery`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Alerta para ocorrências graves sem plano de ação registrado em até 4 horas.\n- Validação de integridade de anexos e fotos de canhotos.',
    },
  },

  // -------------------------------------------------------------
  // 7. CUSTOS E INDICADORES LOGÍSTICOS
  // -------------------------------------------------------------
  '/admin/logistica/custos-indicadores': {
    route: '/admin/logistica/custos-indicadores',
    title: 'Custos e Indicadores Logísticos',
    moduleGroup: 'Logística e Transporte',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Consolidar a inteligência analítica e performance financeira da cadeia de distribuição: rateio e controle de custos logísticos (combustível, manutenção, fretes e diárias), indicadores de nível de serviço (OTIF, On-Time, In-Full, Lead Time) e emissão de relatórios gerenciais.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 3 Abas Internas estruturadas:\n  1. "Custos Logísticos": detalhamento de despesas por centro de custo, modalidade de transporte, veículo e rota;\n  2. "Indicadores & OTIF": cálculo automatizado das métricas OTIF (On-Time In-Full), índice de pontualidade, taxa de devoluções e tempo médio de ciclo do pedido;\n  3. "Relatórios Gerenciais": relatórios analíticos para download com filtros por período, transportadora, filial e cliente.\n- Gráficos comparativos de custo por quilo transportado (R$/kg) e custo percentual sobre o faturamento faturado.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- OTIF é calculado como a intersecção de entregas realizadas no prazo acordado (On-Time) E sem avarias/recusas (In-Full).\n- Custos de frete são confrontados com as provisões registradas nos pedidos de venda para apuração da rentabilidade líquida da operação.\n- Isolamento estrito de dados por empresa ativa via `useBrand`.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. A diretoria ou coordenação de logística acessa `/admin/logistica/custos-indicadores`.\n2. Filtra o período de análise (mensal, trimestral ou anual).\n3. Analisa o desvio de custo logístico vs orçamento na aba de Custos.\n4. Avalia a qualidade do atendimento na aba de Indicadores & OTIF e exporta relatórios executivos para reuniões de resultados.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `logistics_costs`, `logistics_deliveries`, `logistics_freights`, `logistics_occurrences`.\n- Dados consolidados de faturamento e despesas.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo BI Corporativo para cruzamento com faturamento da empresa.\n- Módulo de Controladoria para inclusão das despesas de distribuição no DRE.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso: `canViewLogistics(role)` e perfis de gestão (SUP, ADMIN, LOGISTICA, DIRETORIA).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenCustosIndicadores`, `LogisticsCosts`, `LogisticsIndicators`, `LogisticsReports`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Tratamento seguro para divisões onde não há entregas finalizadas no período selecionado (evitando NaN/Infinity).\n- Alerta visual caso o OTIF fique abaixo da meta corporativa mínima (95%).',
    },
  },
}
