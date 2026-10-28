import type { ScreenDocEntry } from './types'

/**
 * DOCUMENTAÇÃO TÉCNICA E FUNCIONAL DAS 7 TELAS OFICIAIS DO MÓDULO INDÚSTRIA E PRODUÇÃO
 * Lida diretamente do código real implementado em src/components/industry/screens/:
 * 1. Central Industrial (screen-central-industrial.tsx) - /admin/industria
 * 2. Planejamento e Ordens (screen-planejamento-ordens.tsx) - /admin/industria/planejamento
 * 3. Ordem de Produção (screen-ordem-producao.tsx) - /admin/industria/ordem-producao
 * 4. Fichas Técnicas (screen-fichas-tecnicas.tsx) - /admin/industria/fichas-tecnicas
 * 5. Qualidade e Rastreabilidade (screen-qualidade-rastreabilidade.tsx) - /admin/industria/qualidade
 * 6. Custos e Eficiência (screen-custos-eficiencia.tsx) - /admin/industria/custos
 * 7. Manutenção e Recursos (screen-manutencao-recursos.tsx) - /admin/industria/manutencao
 */
export const INDUSTRY_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  // -------------------------------------------------------------
  // 1. CENTRAL INDUSTRIAL (COCKPIT EXECUTIVO)
  // -------------------------------------------------------------
  '/admin/industria': {
    route: '/admin/industria',
    title: 'Central Industrial',
    moduleGroup: 'Indústria',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Atuar como o cockpit executivo e centro de comando consolidado da fábrica e PCP, apresentando em tempo real indicadores de OEE (Overall Equipment Effectiveness), ritmo produtivo, volume produzido no mês, ordens em andamento e atrasadas, taxa de refugo, capacidade de linhas de envase e processamento, alertas críticos e atalhos rápidos para as telas operacionais.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 4 Cards de Métricas Principais no Topo: OEE Geral consolidado (com breakdown em Disponibilidade, Performance e Qualidade), Produção do Mês em unidades e peso, Ordens de Produção Ativas (com destaque para OPs em atraso) e Refugo/Perdas com custo financeiro apurado.\n- Status Operacional em Tempo Real das Linhas Fabris: monitoramento de status (Em Operação, Setup, Parada Não Programada, Aguardando Insumos, Manutenção), operador líder, produto em envase/fabricação, OP ativa e barra de progresso da meta do turno.\n- Painel de Alertas Operacionais Críticos: sinalização de desvios de processo, paradas prolongadas sem justificativa, parâmetros de envase fora do padrão e falta iminente de matéria-prima crítica.\n- Gráfico Comparativo Programado × Realizado: visualização do desempenho da fábrica por turno e por dia.\n- Grade de Atalhos Rápidos para as 6 telas operacionais do módulo (Planejamento, OP, Fichas Técnicas, Qualidade, Custos, Manutenção).\n- Exportação de dados consolidados e botão de atualização em tempo real (Refresh).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- OEE é calculado como o produto das três grandezas: OEE = Disponibilidade × Performance × Qualidade. Disponibilidade considera (Tempo em Produção / Tempo Programado); Performance considera (Unidades Produzidas / Meta Nominal do Período); Qualidade considera ((Produzido - Refugo) / Produzido).\n- Ordens atrasadas são identificadas comparando a data_prevista_fim com a data corrente para OPs que ainda não foram concluídas ou canceladas.\n- Linhas paradas por mais de 30 minutos sem justificativa cadastrada geram alerta de prioridade máxima no cockpit.\n- Respeito irrestrito ao multitenancy por empresa (filtro de tenant nas consultas das coleções).',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gerente industrial ou coordenador de PCP acessa `/admin/industria`.\n2. O painel carrega paralelamente os dados de `production_orders`, `production_resources` e inspeções da qualidade.\n3. O sistema calcula os KPIs consolidados, atualiza o status das linhas e gera os alertas operacionais.\n4. O usuário clica em qualquer card, atalho ou linha para navegar até a tela operacional correspondente.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `production_orders`, `production_resources`, `quality_inspections`, `production_downtimes`.\n- Hooks: `useAuth` para identificação de perfil e tenant.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Estoque/WMS para verificação de insumos e matérias-primas disponíveis.\n- Módulo de Manutenção para sincronização de paradas de máquinas corretivas e preventivas.\n- Módulo BI Industrial para cruzamento analítico de desempenho histórico e capacidade.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: controlada por `canViewIndustry(role)` (perfis SUP, ADMIN, INDUSTRIAL, PCP e DIRETORIA).\n- Atualização sob demanda via botão recarregar.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenCentralIndustrial`, `Card`, `Badge`, `Button`, `ExportActions`.\n- Serviços e utilitários de permissões industriais (`@/lib/industrial-permissions`).',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Falhas no carregamento de coleções são interceptadas com dados de fallback seguros sem interromper a navegação.\n- Feedback ao usuário via toast sonner em caso de erro de conexão.',
    },
  },

  // -------------------------------------------------------------
  // 2. PLANEJAMENTO E ORDENS (MRP, MPS E CAPACIDADE)
  // -------------------------------------------------------------
  '/admin/industria/planejamento': {
    route: '/admin/industria/planejamento',
    title: 'Planejamento e Ordens',
    moduleGroup: 'Indústria',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Prover a governança e inteligência do Planejamento e Controle da Produção (PCP), unificando em tela única a gestão de Ordens de Produção (MPS), cálculo de necessidades de materiais (MRP) com explosão multinível de BOM, programação fina de capacidade de linhas e postos de trabalho (APS), e disparo de sugestões de compras e ordens industriais.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 4 Abas Internas estruturadas:\n  1. "Plano Mestre (MPS)": listagem de pedidos de venda faturáveis, previsão de demanda, ordens sugeridas pelo plano mestre, indicadores de demanda atendida e geração em lote de OPs;\n  2. "Necessidades (MRP)": motor de explosão de componentes de estrutura de produto (BOM), cruzamento de estoque disponível versus necessidade líquida, status de saldo (Suficiente, Comprar, Crítico) e exportação via `ExportActions`;\n  3. "Capacidade (APS)": visão gráfica da ocupação de linhas e equipamentos por semana/dia, percentual de carga vs capacidade nominal, identificação de sobrecarga (>100%) e gargalos operacionais;\n  4. "Ordens Geradas": grade consolidada de ordens abertas a partir do planejamento com filtro por status, datas e busca por produto.\n- Botão de abertura de Nova Ordem de Produção via diálogo com seleção de produto, quantidade, data de entrega e linha.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Cálculo do MRP: Necessidade Líquida = (Quantidade da OP × Coeficiente da BOM × (1 + % Perda Prevista)) - Saldo Físico Disponível em Estoque.\n- Carga de Linha: Horas Necessárias = (Quantidade Programada / Cadência Nominal por Hora) + Tempo de Setup. Caso Horas Necessárias excedam a jornada disponível da linha, o APS sinaliza sobrecarga em vermelho.\n- A liberação de OP no MPS só é recomendada caso o status dos insumos críticos no MRP esteja em "Suficiente" ou com solicitação de compras vinculada.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O planejador acessa `/admin/industria/planejamento` e revisa o Plano Mestre gerado a partir dos pedidos comerciais.\n2. Na aba MRP, roda a explosão de materiais para validar disponibilidade de embalagens e matérias-primas.\n3. Na aba APS, verifica a capacidade dos postos de trabalho e ajusta a data programada para evitar gargalos.\n4. Confirma e gera as OPs que passam para o status "Planejada/Liberada", prontas para execução fabril.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `production_orders`, `bom_structures`, `bom_components`, `products`, `sales_orders`, `production_resources`.\n- Dados cruzados com saldos de estoque do WMS (`inventory_items`).',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com Comercial (Pedidos de Venda) para levantamento de demanda firme.\n- Integração com Suprimentos/Compras para geração de solicitações automáticas de compra de matéria-prima faltante.\n- Integração com WMS para consulta de saldos e lotes disponíveis.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Consulta e Planejamento: autorizada para planejadores e engenharia via `canViewIndustry(role)`.\n- Criação e aprovação de ordens: restrita a coordenadores de PCP e gestores industriais.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenPlanejamentoOrdens`, `Tabs`, `Table`, `Dialog`, `ExportActions`, `Badge`.\n- Serviços PocketBase de ordens de produção e produtos.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de quantidade zero ou negativa na abertura de OP.\n- Alerta preventivo ao tentar programar ordem em linha que já atingiu 100% de ocupação no período selecionado.',
    },
  },

  // -------------------------------------------------------------
  // 3. ORDEM DE PRODUÇÃO (EXECUÇÃO E CHÃO DE FÁBRICA)
  // -------------------------------------------------------------
  '/admin/industria/ordem-producao': {
    route: '/admin/industria/ordem-producao',
    title: 'Ordem de Produção',
    moduleGroup: 'Indústria',
    docVersion: '2.1.0',
    lastUpdated: '2026-04-06',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar o ciclo de vida operacional completo da Ordem de Produção (OP), desde a programação, requisição e conferência de insumos, apontamentos de fases de chão de fábrica, pesagem líquida/drenada em envase, rastreabilidade de lotes gerados (com vínculo aditivo ao tanque de cura e ticket de safra de origem), registro de perdas/refugos alimentando o custo efetivo, validação de qualidade até a apropriação dos custos industriais.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Seletor e Navegador de Ordens de Produção no topo: busca rápida por número da OP, status, produto, lote e datas.\n- 7 Abas Internas estruturadas:\n  1. "Planejamento": dados cadastrais da OP, produto pai, quantidade programada, linha de envase/processamento, data início/fim, operador responsável e ficha técnica vinculada;\n  2. "Consumo": lista técnica de insumos empenhados da BOM, quantidade teórica versus real apontada, unidade de medida, perda prevista e exportação via `ExportActions`;\n  3. "Execução": apontamento de fases produtivas (Preparação, Mistura, Envase, Rotulagem, Paletização), início/fim de etapa, parada de máquina com motivo e operador logado;\n  4. "Lotes": geração automática de lote do produto acabado, data de fabricação, data de validade (conforme shelf-life cadastrado na ficha técnica), quantidade de caixas/pallets e impressão de etiqueta;\n  5. "Perdas": registro discriminado de refugo e perdas (matéria-prima avariada, desvio de peso, embalagem amassada, sobra de linha) com motivo e destinação (descarte/retrabalho);\n  6. "Qualidade": checklist de liberação de processo, laudo de análise físico-química e microbiológica, ensaios de peso líquido e peso drenado para conservas/envasados e parecer de conformidade (Aprovado/Reprovado/Quarentena);\n  7. "Custos": apropriação do custo da OP (Matéria-prima consumida + Embalagens + Mão de obra direta MOD + Custos indiretos de fabricação CIF), custo unitário previsto × realizado e desvio percentual.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Rendimento da OP: Calculado dinamicamente: Rendimento (%) = (Quantidade Efetivamente Produzida / Quantidade Programada) × 100.\n- Consumo Real × Teórico: O consumo real é abatido do estoque WMS ao confirmar o encerramento da fase de consumo. Desvios acima da tolerância cadastrada na BOM emitem aviso de justificativa.\n- Peso Líquido e Drenado: Para produtos em conserva ou envase com líquido de cobertura, o sistema valida peso bruto, tara da embalagem e peso drenado contra as tolerâncias da portaria metrológica INMETRO cadastradas na ficha técnica.\n- Trava de Qualidade: O lote gerado permanece no status "Quarentena" até que o checklist da aba Qualidade seja 100% concluído e assinado pelo responsável técnico, impedindo liberação para venda.\n- O fechamento da OP altera seu status para "Concluída", dá entrada no produto acabado no estoque e encerra a apropriação de custos.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O operador seleciona a OP na listagem ou acessa via parâmetro de URL (`/admin/industria/ordem-producao/:id`).\n2. Na aba "Consumo", confere as matérias-primas e embalagens separadas pelo almoxarifado.\n3. Na aba "Execução", aponta o início e fim de cada fase fabril no terminal do chão de fábrica.\n4. Na aba "Lotes", gera o lote de produto acabado e confere peso líquido/drenado.\n5. O controle de qualidade inspeciona a amostra na aba "Qualidade" e emite o parecer.\n6. Apuram-se as perdas e o custo na aba "Custos", finalizando a ordem.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `production_orders`, `production_order_items`, `bom_structures`, `bom_components`, `lots`, `inventory_items`, `quality_inspections`, `production_downtimes`.\n- Hooks: `useAuth` para auditoria do apontador.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- WMS / Estoque: baixa de matérias-primas e entrada automática do lote de produto acabado.\n- Qualidade e Rastreabilidade: alimentação do histórico de laudos e vínculos de genealogia de lotes.\n- Custos Industriais e Controladoria: envio do custo real apurado para formação do CPV.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Apontamento de chão de fábrica: operadores industriais autorizados por `canViewIndustry(role)`.\n- Liberação de Qualidade e Fechamento de Custos: inspetores de qualidade e analistas de custos.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenOrdemProducao`, `Tabs`, `Table`, `Dialog`, `ExportActions`, `Badge`, `Progress`.\n- Serviços PocketBase de ordens industriais.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de finalização de OP caso existam fases obrigatórias pendentes de apontamento.\n- Alerta impeditivo de liberação de lote reprovado pela inspeção da qualidade.',
    },
  },

  // -------------------------------------------------------------
  // 4. FICHAS TÉCNICAS (ENGENHARIA E BOM)
  // -------------------------------------------------------------
  '/admin/industria/fichas-tecnicas': {
    route: '/admin/industria/fichas-tecnicas',
    title: 'Fichas Técnicas',
    moduleGroup: 'Indústria',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar o repositório central de engenharia de produtos e formulações do ERP, integrando Estruturas de Materiais multinível (BOM), formulações químicas e de alimentos, roteiros e etapas de fabricação, especificações metrológicas (peso líquido, drenado, tara), conversões de unidades de medida e versionamento com histórico de alterações.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Catálogo e Busca de Fichas Técnicas: busca por nome do produto, código interno, versão e status (Ativa, Em Revisão, Obsoleta).\n- 5 Abas Internas estruturadas:\n  1. "Dados Gerais": código do item, descrição, linha de produção recomendada, versão atual, data de homologação, shelf-life (validade em dias) e responsável técnico;\n  2. "Estrutura (BOM)": lista hierárquica de matérias-primas e materiais de embalagem com coeficiente de consumo por unidade, unidade de medida, percentual de perda técnica tolerada e custo estimado;\n  3. "Roteiro de Produção": sequência ordenada de operações (ex.: Triagem, Lavagem, Cozimento, Envase, Pasteurização, Rotulagem) com tempo padrão de setup e tempo de máquina por lote;\n  4. "Especificações Técnicas": parâmetros metrológicos e de conformidade, incluindo Peso Líquido Nominal, Peso Drenado Mínimo, Tolerância INMETRO, Temperatura de envase e requisitos de embalagem;\n  5. "Histórico de Versões": log de modificações da engenharia com data, autor e justificativa da revisão de fórmula.\n- Diálogo de criação e edição de nova ficha técnica com validação em tempo real.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Apenas uma versão de Ficha Técnica pode estar no status "Ativa" simultaneamente por produto; a ativação de uma nova versão arquiva automaticamente a versão anterior como "Obsoleta".\n- Fichas com status "Em Revisão" não podem ser vinculadas a novas Ordens de Produção no PCP.\n- Soma dos percentuais de ingredientes da formulação base deve atingir 100% nas fichas de formulação proporcional.\n- Para produtos com líquido de cobertura, a especificação de peso drenado é campo mandatório.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O engenheiro de alimentos ou de processos acessa `/admin/industria/fichas-tecnicas`.\n2. Seleciona um produto cadastrado ou cria uma nova Ficha Técnica.\n3. Insere a lista técnica de insumos na aba BOM e cadastra o tempo das operações na aba Roteiro.\n4. Informa as tolerâncias metrológicas e ambientais na aba Especificações.\n5. Submete para homologação e ativa a versão para uso imediato pelo PCP na geração de OPs.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `bom_structures`, `bom_components`, `products`, `production_routes`, `product_specifications`.\n- Persistência e consultas diretas no PocketBase.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo Comercial / Cadastro de Produtos para sincronização do catálogo de itens acabados e matérias-primas.\n- PCP e Planejamento de Ordens para explosão de componentes no cálculo de MRP.\n- Módulo de Precificação e Custos para cálculo do custo padrão (standard cost).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: operadores e supervisores autorizados por `canViewIndustry(role)`.\n- Criação, Edição e Homologação de Versões: restrita a Engenheiros de Produto, P&D e Gerentes Industriais.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenFichasTecnicas`, `Tabs`, `Table`, `Dialog`, `Input`, `Badge`, `Select`.\n- Serviços e tipos de BOM e produtos.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de gravação de ficha sem ao menos um componente na BOM.\n- Alerta impeditivo ao tentar excluir ficha técnica vinculada a ordens de produção históricas ativas.',
    },
  },

  // -------------------------------------------------------------
  // 5. QUALIDADE E RASTREABILIDADE
  // -------------------------------------------------------------
  '/admin/industria/qualidade': {
    route: '/admin/industria/qualidade',
    title: 'Qualidade e Rastreabilidade',
    moduleGroup: 'Indústria',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Garantir o controle de qualidade fabril e a rastreabilidade total (genealogia de ponta a ponta) na cadeia produtiva, provendo inspeções de recebimento de matérias-primas, inspeções em processo, laudos de liberação de produtos acabados, rastreabilidade bidirecional (da matéria-prima ao cliente e do cliente à matéria-prima) e simulador de recall sanitário/regulatório.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 5 Abas Internas estruturadas:\n  1. "Inspeções": lista de ordens de inspeção com status (Pendente, Aprovado, Reprovado, Quarentena), tipo (Recebimento, Processo, Produto Acabado), número da OP ou NF de entrada e formulário de novo ensaio;\n  2. "Checklists": modelos dinâmicos de checklist de qualidade (parâmetros organolépticos, pH, brix, acidez, temperatura, vedação, integridade de rotulagem);\n  3. "Não Conformidades": registro de RNC (Relatório de Não Conformidade) com causa raiz (5 Porquês, Ishikawa), ação corretiva imediata e ação preventiva;\n  4. "Rastreabilidade": árvore de genealogia bidirecional informando lote de matéria-prima aplicada, lote do fornecedor, número da OP, tanques/linhas utilizadas, lote do produto acabado e notas fiscais de venda aos clientes finais;\n  5. "Simulador de Recall": ferramenta de auditoria que rastreia em segundos o destino de 100% das unidades de um lote contaminado ou suspeito, listando clientes atingidos, transportadoras e cidades para bloqueio cautelar imediato.\n- Ação de emissão e exportação de Laudo Técnico / Certificado de Análise (CoA).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Lotes em Quarentena: Lotes fabricados ou recebidos com laudo pendente recebem flag de bloqueio físico no WMS, impedindo expedição ou faturamento comercial.\n- Critério de Liberação: Para liberação definitiva de produto acabado, todos os parâmetros mandatórios do checklist de qualidade devem estar dentro das faixas mínima e máxima aceitáveis.\n- Não Conformidade Crítica: Qualquer desvio com risco microbiológico ou químico suspende automaticamente a linha de envase até a validação do responsável técnico.\n- Rastreabilidade Legal: A genealogia do lote é mantida de forma imutável com preservação de histórico conforme normas da ANVISA e MAPA.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O analista de garantia da qualidade acessa `/admin/industria/qualidade`.\n2. Na chegada de matéria-prima ou conclusão de lote na fábrica, abre uma nova inspeção.\n3. Coleta amostras, realiza ensaios laboratoriais e registra os valores medidos no checklist.\n4. Caso conforme, comuta o status para "Aprovado", liberando o lote no WMS para venda.\n5. Em caso de auditoria ou notificação de cliente, utiliza a aba Rastreabilidade ou Recall para identificar todos os pedidos e insumos associados em segundos.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `quality_inspections`, `quality_checklists`, `quality_non_conformances`, `lots`, `production_orders`, `sales_orders`, `partners`.\n- Consultas cruzadas de genealogia.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- WMS / Estoque para bloqueio e desbloqueio automático de lotes aprovados ou em quarentena.\n- Módulo Comercial (Vendas) para localização dos clientes receptores do lote em caso de recall.\n- Módulo de Suprimentos para qualificação e avaliação de desempenho de fornecedores com base em RNCs.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: operadores industriais autorizados por `canViewIndustry(role)`.\n- Aprovação de Laudos e Emissão de RNC: analistas e responsáveis técnicos de qualidade (CRQ/CRF/Engenharia).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenQualidadeRastreabilidade`, `Tabs`, `Table`, `Dialog`, `ExportActions`, `Badge`.\n- Serviços e tipos de qualidade e rastreabilidade.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de aprovação de laudo com parâmetros mandatórios não preenchidos.\n- Alerta crítico sonner ao detectar tentativa de movimentação de lote com laudo reprovado.',
    },
  },

  // -------------------------------------------------------------
  // 6. CUSTOS E EFICIÊNCIA INDUSTRIAL
  // -------------------------------------------------------------
  '/admin/industria/custos': {
    route: '/admin/industria/custos',
    title: 'Custos e Eficiência',
    moduleGroup: 'Indústria',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Apurar e controlar a eficiência financeira e operacional da indústria, unificando a análise de Custos Industriais (Previsto × Realizado), Custo dos Produtos Vendidos (CPV), absorção de custos indiretos de fabricação (CIF), perdas fabris valorizadas, indicadores de OEE detalhados por linha e taxa de refugo com metas de rentabilidade.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 4 Cards de Indicadores Financeiros no Topo: Custo Total de Produção do Mês (R$), Custo Médio Unitário Ponderado, Desvio de Custo Previsto × Realizado (%) e Valor Total de Perdas e Refugos (R$).\n- 4 Abas Internas estruturadas:\n  1. "Custos Previsto × Realizado": grade analítica comparando custo padrão da ficha técnica contra custo efetivo apurado por OP (Matéria-prima, Insumos, Mão de Obra e Despesas Indiretas);\n  2. "Eficiência e OEE": métricas aprofundadas de OEE por linha fabril com gráficos de evolução de disponibilidade, eficiência de velocidade e perdas de rendimento;\n  3. "Análise de Perdas": detalhamento monetário das perdas por motivo (vazamento, arranque de máquina, quebra de vidro/lata, fora de especificação), identificando os maiores ofensores do resultado;\n  4. "Rateios CIF": parametrização e visualização dos critérios de absorção de despesas operacionais da fábrica (energia elétrica, depreciação de máquinas, manutenção) nas OPs encerradas.\n- Botão de exportação de dados analíticos via `ExportActions` para relatórios executivos.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Custo Real da OP: Soma de: (Consumo Real de Insumos × Custo Médio de Aquisição do Estoque) + (Horas de Mão de Obra Direta Apontadas × Custo Hora Homem) + Rateio de CIF.\n- Desvio de Custo (%): ((Custo Real - Custo Previsto) / Custo Previsto) × 100. Desvios superiores a +5% acendem sinalização de atenção; desvios acima de +10% demandam justificativa formal.\n- Custeio por Absorção: O total de despesas indiretas da planta apurado na competência é rateado proporcionalmente às horas-máquina ou volume produzido por cada ordem.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. A controladoria industrial ou gerência financeira acessa `/admin/industria/custos`.\n2. Seleciona o período de fechamento ou filtra por linha de produção.\n3. Analisa as variações entre os custos standard projetados nas fichas técnicas e o custo real das ordens concluídas.\n4. Avalia as perdas financeiras na aba "Análise de Perdas" para priorização de planos de ação Kaizen e manutenção.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `production_orders`, `production_order_costs`, `bom_structures`, `financial_payables`, `production_resources`.\n- Dados cruzados com despesas fabris da Controladoria.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Controladoria e DRE para composição do CPV (Custo dos Produtos Vendidos).\n- Módulo de Fichas Técnicas para alimentação do custo standard dos produtos.\n- Módulo de Precificação Comercial para margem de contribuição mínima.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso: restrito a usuários com permissão `canViewIndustry(role)` e perfil de gestão (SUP, ADMIN, CONTROLLER, DIRETORIA, GERENTE_INDUSTRIAL).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenCustosEficiencia`, `Tabs`, `Table`, `Card`, `ExportActions`, `Badge`.\n- Serviços financeiros e industriais.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Tratamento seguro de divisão por zero em casos de fichas sem custo previsto ou volume nulo.\n- Aviso ao usuário quando não há fechamento de competência de rateios CIF para o mês em análise.',
    },
  },

  // -------------------------------------------------------------
  // 8. RECEBIMENTO DE SAFRA (BALANÇA E CLASSIFICAÇÃO)
  // -------------------------------------------------------------
  '/admin/industria/recebimento-safra': {
    route: '/admin/industria/recebimento-safra',
    title: 'Recebimento de Safra',
    moduleGroup: 'Indústria',
    docVersion: '2.1.0',
    lastUpdated: '2026-04-06',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Controlar o recebimento físico e a classificação por grade da fruta in natura (azeitonas) na balança rodoviária, apurando peso bruto, tara e líquido, gerando o pagamento ao produtor agrícola em contas a pagar (sem duplicar com a NF-e) e criando a entrada de estoque de matéria-prima com custo real pela trilha imutável.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Emissão e gestão de Tickets de Pesagem com numeração automática sequencial anual.\n- Vínculo com cadastro de Produtor Agrícola e Propriedade (com CADPRO/CAR e variedades cultivadas).\n- Pesagem rodoviária oficial: registro de peso bruto, tara e cálculo automático do peso líquido em kg.\n- Classificação por Grade de Qualidade: Grade A (Premium), Grade B (Padrão), Grade C (Industrial) e Descarte, com calibre, estágio de maturação (0 a 7) e % de impurezas/defeitos.\n- Formação automática do valor a pagar ao produtor: Fórmula (peso líquido ÷ 1.000) × preço da grade − deduções.\n- Ação de "Fechar Ticket", validação backend que impede fechamento sem classificação.\n- Ação "Gerar Estoque MP": cria movimentação de entrada e alimenta a trilha imutável product_cost_history pelo custo da grade.\n- Ação "Gerar Título (Pagar)": cria título único no módulo financeiro (financial_payables) com unicidade garantida.\n- KPIs de safra: Total recebido em toneladas, Valor total aos produtores, Percentual de fruta Grade A e Produtores ativos.\n- Exportação de dados consolidados em Excel/CSV.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Ticket sem classificação por grade de qualidade não pode ser fechado (validado em pb_hooks).\n- O pagamento ao produtor só pode ser gerado uma única vez por ticket após o status "fechado".\n- A entrada de matéria-prima gera lote no formato SAFRA-TK-{ANO}-{NUM} e registra o custo por kg na trilha imutável sem alterar custo médio à mão.\n- O descarte zera o valor a pagar ao produtor e impede entrada como matéria-prima comercial.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O caminhão/carreta com bins de azeitona chega à fábrica e passa na balança.\n2. O conferente abre novo Ticket de Pesagem informando produtor, placa, variedade e peso bruto.\n3. O técnico agrícola coleta amostragem, afere o calibre, defeitos e maturação, classificando a grade.\n4. O caminhão vazio passa na balança para tara, apurando o líquido e o valor a pagar ao produtor.\n5. O operador fecha o ticket, gera a entrada de estoque da matéria-prima e dispara o título no contas a pagar.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `olive_harvest_tickets`, `agricultural_producers`, `products`, `financial_payables`, `stock_movements`, `product_cost_history`.\n- Hooks server-side: `olive_industry_guards.js`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo Financeiro (Contas a Pagar): integração oficial gerando títulos pendentes.\n- Módulo de Estoque: geração de lotes de matéria-prima e movimentações de entrada.\n- Módulo de Rastreabilidade: primeiro elo da cadeia produtiva (origem agrícola).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso liberado para perfis autorizados pelo `canViewIndustry(role)`.\n- Fechamento e pagamento restritos a operadores da balança e gestores industriais.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenRecebimentoSafra`, `Card`, `Badge`, `Button`, `Dialog`, `Table`, `ExportActions`.\n- Serviços: `@/services/olive-industry-service`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Backend bloqueia fechamento com peso líquido negativo ou zero.\n- Bloqueio de duplicidade na geração de título a pagar.',
    },
  },

  // -------------------------------------------------------------
  // 9. TANQUES DE CURA & SALMOURA
  // -------------------------------------------------------------
  '/admin/industria/tanques-cura': {
    route: '/admin/industria/tanques-cura',
    title: 'Tanques de Cura',
    moduleGroup: 'Indústria',
    docVersion: '2.1.0',
    lastUpdated: '2026-04-06',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar o parque fermentativo e os tanques físicos de cura de azeitonas, monitorando diariamente a concentração de sal, pH, temperatura e acidez livre da salmoura, controlando as perdas de fermentação e transferindo os lotes concluídos para consumo direto pelas Ordens de Produção (OPs).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Mapa visual interativo do parque de tanques físicos com status colorido: Em Cura, Pronto para Processamento, Livre/Vazio ou Higienização.\n- Alocação de novos lotes de cura vinculados aos tickets de safra de origem.\n- Histórico completo de medições periódicas de salmoura (sal %, pH, temperatura °C, acidez livre % e perda drenagem em kg).\n- Alerta automático em backend e frontend para medições com pH ou concentração de sal fora da faixa plausível.\n- Ação "Concluir Cura (Liberar Tanque)": valida medição recente com pH adequado (2.5 a 5.0) e altera o status para pronto para processamento.\n- Ação "Consumir em Ordem de Produção (OP)": transfere o lote do tanque para a OP selecionada e coloca o tanque físico em ciclo de higienização.\n- Registro contínuo de perdas acumuladas de fermentação e drenagem.\n- Exportação de dados consolidados dos lotes e medições.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Medições com pH > 5.0 ou < 2.5 e sal < 4% ou > 25% disparam alerta mandatório de correção.\n- Um lote só pode ser processado se o status estiver em "pronto_para_processamento" (validado em pb_hooks).\n- A conclusão do lote exige ao menos uma medição analítica registrada com pH dentro do limite.\n- Ao ser consumido por uma OP, o tanque físico é liberado e marcado como "higienizacao".',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O operador aloca a azeitona recebida da safra em um tanque livre, definindo o tipo de salmoura (natural, estilo sevilhano, estilo californiano ou cura seca).\n2. Diariamente o laboratório registra as medições de sal, pH e temperatura na tabela de histórico.\n3. Concluído o período de cura (90 a 180 dias) e estabilizado o pH, o supervisor clica em "Concluir Cura".\n4. O PCP vincula o lote pronto a uma Ordem de Produção aberta, que consome a matéria-prima curada.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `curing_tanks`, `curing_batches`, `curing_measurements`, `olive_harvest_tickets`, `production_orders`.\n- Hooks: `olive_industry_guards.js`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com Recebimento de Safra para herança do peso e variedade.\n- Integração com Ordens de Produção para consumo do lote curado.\n- Integração com Rastreabilidade Industrial (elo intermediário da cadeia).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso liberado para supervisores industriais e operadores fabris autorizados por `canViewIndustry(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenTanquesCura`, `Card`, `Badge`, `Button`, `Dialog`, `Table`, `ExportActions`.\n- Serviços: `@/services/olive-industry-service`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de processamento prematuro de lote em fermentação.\n- Alerta contra inserção de medições com valores químicos incongruentes.',
    },
  },

  // -------------------------------------------------------------
  // 10. CONTROLE DE PERDAS NA LINHA
  // -------------------------------------------------------------
  '/admin/industria/perdas-linha': {
    route: '/admin/industria/perdas-linha',
    title: 'Perdas na Linha',
    moduleGroup: 'Indústria',
    docVersion: '2.1.0',
    lastUpdated: '2026-04-06',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Registrar e analisar as perdas, refugos e descartes ocorridos durante o processamento fabril das azeitonas por fase (descaroçamento, fatiamento, envase, salmoura, rotulagem) e apropriar o impacto financeiro no custo efetivo da Ordem de Produção.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Apontamento detalhado de perdas com vínculo à Ordem de Produção e identificação da fase fabril.\n- Tipificação da perda: refugo, descarte, fora de padrão, avaria de embalagem, vazamento de salmoura ou polpa machucada.\n- Cálculo do impacto no custo da OP: Quantidade perdida × Custo unitário estimado.\n- Destinação controlada do refugo: coproduto/óleo, compostagem agrícola, descarte sanitário ou retrabalho.\n- KPIs de perdas: Massa total perdida em kg, Impacto financeiro acumulado em R$, Contagem de refugos e descartes sanitários.\n- Filtro por fase fabril e busca textual por OP, motivo ou responsável.\n- Exportação de dados para análise de Pareto e Kaizen.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- As perdas registradas compõem o custo efetivo da ordem e abatem do rendimento fabril.\n- Refugos destinados a coproduto são encaminhados para extração secundária de óleo de oliva.\n- Todo apontamento de refugo exige motivo claro e identificação do operador responsável.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Durante o turno, ao ocorrer avaria ou refugo em máquina (ex: descaroçador), o operador pesa a perda.\n2. Acessa `/admin/industria/perdas-linha` e clica em "Registrar Perda / Refugo".\n3. Seleciona a OP em andamento, informa a fase, tipo, peso, custo unitário e motivo.\n4. O sistema grava a perda na coleção `production_line_losses` e atualiza os custos da OP.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `production_line_losses`, `production_orders`.\n- Persistência e consultas em `@/services/olive-industry-service`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Ordens de Produção (alimenta os custos da OP e o OEE de qualidade).\n- Módulo de Custos e Eficiência Industrial.\n- Módulo de Rastreabilidade Completa.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso liberado para operadores e gestores com permissão `canViewIndustry(role)`.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenPerdasLinha`, `Card`, `Badge`, `Button`, `Dialog`, `Table`, `ExportActions`.\n- Serviços: `@/services/olive-industry-service`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de quantidade obrigatória positiva.\n- Confirmação antes de excluir registros de perda.',
    },
  },

  // -------------------------------------------------------------
  // 11. LABORATÓRIO E LAUDOS
  // -------------------------------------------------------------
  '/admin/industria/laboratorio-laudos': {
    route: '/admin/industria/laboratorio-laudos',
    title: 'Laboratório e Laudos',
    moduleGroup: 'Indústria',
    docVersion: '2.1.0',
    lastUpdated: '2026-04-06',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Prover a gestão do laboratório de controle de qualidade e a emissão de laudos técnicos conformes às exigências do MAPA e RDC 727/2022, comparando resultados analíticos contra planos de limites e bloqueando a liberação de lotes para faturamento em caso de não conformidade.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Planos de Análise configuráveis para fruta in natura, tanque de cura, produto acabado e salmoura com limites mínimos/máximos e métodos de ensaio.\n- Registro de análises laboratoriais com veredito automático (conforme / não conforme) baseado na checagem dos parâmetros.\n- Trava de liberação de lote: lotes não conformes têm liberação terminantemente bloqueada tanto na interface quanto via regras em `olive_industry_guards.js`.\n- Emissão de Laudo Técnico oficial com verificação de peso drenado nominal vs aferido, peso líquido, registro MAPA e rotulagem RDC 727/2022.\n- Botão de Impressão de Laudo em layout limpo com assinatura técnica, tabela de parâmetros e veredito.\n- KPIs laboratoriais: Total de análises conformes, Não conformidades detectadas, Lotes liberados ao faturamento e Laudos ativos.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Análise com resultado fora da especificação bloqueia obrigatoriamente a liberação do lote no backend.\n- Um lote só pode ser liberado para expedição/faturamento comercial após emissão de laudo técnico CONFORME.\n- Laudos exigem aferição metrológica de peso drenado e peso líquido contra as tolerâncias legais.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O analista de laboratório coleta amostras do tanque de cura ou da linha de envase.\n2. Acessa `/admin/industria/laboratorio-laudos` e registra uma Nova Análise selecionando o plano.\n3. Digita os resultados aferidos; o sistema calcula o veredito instantâneo comparando com os limites.\n4. Caso conforme, emite o Laudo Técnico oficial (PDF imprimível) e libera o lote para faturamento.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `laboratory_analysis_plans`, `laboratory_analyses`, `laboratory_laudos`, `production_orders`, `curing_tanks`.\n- Guardas: `olive_industry_guards.js`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo Comercial/Faturamento: bloqueio de notas fiscais para lotes sem liberação laboratorial.\n- Módulo de Qualidade e Rastreabilidade.\n- Módulo de Tanques de Cura.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização geral para supervisores industriais; registro e assinatura restritos a responsáveis técnicos (CRQ/CRF/Engenharia).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenLaboratorioLaudos`, `Card`, `Badge`, `Button`, `Dialog`, `Table`, `ExportActions`.\n- Serviços: `@/services/olive-industry-service`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio em pb_hooks ao tentar gravar laudo de liberação para análise reprovada.\n- Feedback imediato via toast descritivo em caso de parâmetros fora de especificação.',
    },
  },

  // -------------------------------------------------------------
  // 12. RASTREABILIDADE COMPLETA (CAMPO → TANQUE → LOTE → EMBALAGEM)
  // -------------------------------------------------------------
  '/admin/industria/rastreabilidade-completa': {
    route: '/admin/industria/rastreabilidade-completa',
    title: 'Rastreabilidade Completa',
    moduleGroup: 'Indústria',
    docVersion: '2.1.0',
    lastUpdated: '2026-04-06',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Prover a consulta bidirecional da genealogia industrial e agrícola completa da fábrica de azeitonas, permitindo o rastreamento reverso (do lote da embalagem/cliente até o tanque e produtor rural para recall) e o rastreamento adiante (do ticket de safra até as ordens e lotes comerciais expedidos).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Barra de pesquisa universal que aceita número de ticket de safra, lote de cura, lote de acabamento, laudo técnico ou número de OP.\n- Linha do tempo visual da cadeia produtiva cobrindo todos os elos: 1. Origem Agrícola (Produtor/Propriedade/CAR) → 2. Recebimento de Safra (Ticket/Pesagem/Grade) → 3. Tanque de Cura (Salmoura/Fermentação) → 4. Ordem de Produção (Envase) → 5. Análise Laboratorial → 6. Laudo Técnico (MAPA/RDC) → 7. Embalagem Final.\n- Detalhamento de perdas e refugos registrados na ordem associada.\n- Indicadores de conformidade: Lote liberado pelo laboratório, Rotulagem RDC conforme e status sanitário.\n- Exportação da cadeia completa para auditorias sanitárias (MAPA/ANVISA/clientes B2B).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Rastreabilidade bidirecional instantânea (tempo de resposta < 1 segundo) para suporte a recalls normativos.\n- Preservação imutável dos vínculos entre o elo agrícola (produtores e tickets) e os elos fabris existentes em `industrial_traceability`.\n- Identificação imediata de todos os tanques e lotes derivados a partir de uma remessa de campo.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O auditor ou responsável pela qualidade acessa `/admin/industria/rastreabilidade-completa`.\n2. Digita o lote do pote de azeitona ou o número do ticket da safra na busca.\n3. O sistema reconstitui instantaneamente a linha do tempo com produtor, tanque de cura, OP, medições de pH e laudo.\n4. O usuário exporta o relatório técnico de rastreabilidade para auditoria externa.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `industrial_traceability`, `agricultural_producers`, `olive_harvest_tickets`, `curing_batches`, `curing_tanks`, `production_orders`, `laboratory_analyses`, `laboratory_laudos`, `production_line_losses`.\n- Serviços: `traceCompleteChain` em `@/services/olive-industry-service`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com todo o ecossistema industrial Huram: Safra, Cura, OPs, Perdas, Laboratório e WMS.\n- Base oficial de conformidade para auditorias ISO 22000, FSSC 22000 e MAPA.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso liberado para perfis autorizados pelo `canViewIndustry(role)` (auditores, diretores, qualidade e PCP).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenRastreabilidadeCompleta`, `Card`, `Badge`, `Button`, `Input`, `ExportActions`.\n- Serviços: `@/services/olive-industry-service`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Feedback visual claro quando um código não for localizado na base.\n- Busca resiliente e tolerante a espaços em branco e variações de caixa.',
    },
  },

  // -------------------------------------------------------------
  // 7. MANUTENÇÃO E RECURSOS (MÁQUINAS, LINHAS E CALIBRAÇÃO)
  // -------------------------------------------------------------
  '/admin/industria/manutencao': {
    route: '/admin/industria/manutencao',
    title: 'Manutenção e Recursos',
    moduleGroup: 'Indústria',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar integralmente o parque fabril, máquinas, postos de trabalho, linhas de produção, ordens de serviço de manutenção (preventiva, corretiva e preditiva), histórico de calibração metrológica de instrumentos e cálculo de indicadores de confiabilidade (MTBF e MTTR).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- 4 Cards de Indicadores de Confiabilidade no Topo: Total de Recursos/Máquinas Ativas, Ordens de Serviço (OS) Abertas, MTBF (Tempo Médio Entre Falhas em Horas) e MTTR (Tempo Médio Para Reparo em Horas).\n- 5 Abas Internas estruturadas:\n  1. "Parque de Máquinas": catálogo completo de equipamentos com tag patrimonial, fabricante, modelo, linha instalada, status (Operacional, Em Manutenção, Em Calibração, Inativa) e criticidade (A, B, C);\n  2. "Ordens de Manutenção": abertura e acompanhamento de OS preventiva e corretiva com prioridade (Baixa, Média, Alta, Crítica/Parada de Linha), técnico atribuído, tempo de intervenção e peças substituídas;\n  3. "Plano Preventivo": cronograma de revisões periódicas por horímetro ou calendário (lubrificação, troca de filtros, checagem elétrica);\n  4. "Calibração Metrológica": controle de instrumentos de medição (balanças de precisão, manômetros, termômetros, refratômetros, torquímetros), número do certificado RBC, tolerância máxima admissível e data do próximo vencimento;\n  5. "Histórico de Paradas": registro detalhado de todas as indisponibilidades de máquinas com motivo e impacto gerado no plano de produção.\n- Diálogo de abertura de nova Ordem de Manutenção com disparo de notificação.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Máquina Crítica em Parada: A abertura de OS corretiva com criticidade "Crítica/Parada de Linha" altera imediatamente o status do recurso para "Em Manutenção", sinalizando indisponibilidade no APS de planejamento e no cockpit industrial.\n- Instrumentos Vencidos: Instrumentos metrológicos com data de calibração vencida entram em status "Bloqueado", impedindo seu uso nas rotinas de inspeção da garantia de qualidade.\n- Cálculo de Indicadores: MTBF = (Tempo Total Operacional / Número de Falhas); MTTR = (Tempo Total de Reparo / Número de Falhas).\n- Ordens preventivas são geradas automaticamente com 7 dias de antecedência do prazo programado no calendário.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. A equipe de manutenção ou operadores acessa `/admin/industria/manutencao`.\n2. Ao notar anomalia em máquina, abre OS corretiva vinculando o equipamento.\n3. O técnico executa o reparo, aponta as peças utilizadas do estoque e encerra a OS com parecer técnico.\n4. O encarregado de calibração anexa os certificados de calibração emitidos por laboratórios acreditados e renova a validade do instrumento.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `production_resources`, `maintenance_orders`, `maintenance_plans`, `calibration_records`, `production_downtimes`.\n- Persistência e consultas diretas no PocketBase.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo de Planejamento e Ordens (APS) para evitar agendamento de OPs em recursos parados.\n- Módulo de Qualidade para conformidade de instrumentos de medição utilizados em laudos.\n- Módulo de Almoxarifado/Estoque para requisição de peças de reposição e consumíveis.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso: controlado por `canViewIndustry(role)`.\n- Abertura de OS: todos os operadores e líderes industriais.\n- Encerramento de OS e Calibração: equipe de manutenção mecânica/elétrica e metrologia.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `ScreenManutencaoRecursos`, `Tabs`, `Table`, `Dialog`, `ExportActions`, `Badge`.\n- Serviços industriais de recursos e manutenção.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Validação de campos obrigatórios (equipamento, motivo e prioridade) na abertura de OS.\n- Alerta impeditivo de encerramento sem descrição do serviço executado.',
    },
  },
}
