# Relatório de Auditoria e Cobertura dos Tours Guiados — ERP Jetro

Este documento consolida o levantamento de todas as telas e submenus atualmente implementados no Jetro ERP e o status de cobertura dos Tours Guiados Interativos, integrados diretamente ao botão "Tour" do chat flutuante do Jetro On-line e à Central de Configurações Administrativa.

## 1. Resumo Executivo

- **Motor de Tours**: `src/components/jetro-tours/tour-overlay.tsx` (Overlay escurecido suave, recorte SVG circular/retangular em volta do elemento alvo, borda pulsante em dourado `#C9A227`, popover explicativo responsivo, indicador de etapas "Etapa X de Y", bolinhas clicáveis, navegação por teclado [Esc, Setas], auto-scroll suave e tratamento gracioso caso o elemento esteja recolhido).
- **Integração Chat On-line**: O botão **Tour** (no cabeçalho de ajudas disponíveis do `floating-chat.tsx`) detecta automaticamente o roteiro da tela ativa (`/admin/...`). Quando sugerido nas conversas do assistente com IA, exibe o botão direto "Iniciar Tour Guiado desta Tela".
- **Identificadores Estáveis**: Implementados via atributos `data-tour-id="..."`, prevenindo que pequenas alterações de layout quebrem os tutoriais.
- **Persistência e Histórico de Utilização**: Coleção PocketBase `jetro_tour_executions` (migração `0243_create_jetro_tour_executions.js`) registrando usuário, tela, tempo decorrido, taxa de conclusão e etapa onde houve interrupção.
- **Gestão sem Programação**: Submenu `Administração > Jetro On-line > Tours Guiados` permite criar novos roteiros, alterar a sequência das etapas, editar textos, testar em tempo real e auditar seletores inconsistentes.

---

## 2. Matriz de Cobertura por Módulo e Tela

| Módulo                    | Tela Funcional            | Rota do ERP                                           | Tour Criado | Quantidade de Etapas |                                Status da Validação                                 |
| :------------------------ | :------------------------ | :---------------------------------------------------- | :---------: | :------------------: | :--------------------------------------------------------------------------------: |
| **Comercial**             | Consulta de Pedidos       | `/admin/vendas/consulta-pedidos`                      |   **Sim**   |          5           | **Validado** (Filtros, Consultar, Ordenar Colunas, Personalizar Colunas, Detalhes) |
| **Principal**             | Tela Inicial / Cockpit    | `/admin`                                              |   **Sim**   |          4           |    **Validado** (Header, Sidebar de Módulos, Cards de Indicadores, Assistente)     |
| **Cadastros**             | Carteira de Clientes      | `/admin/cadastros/clientes`                           |   **Sim**   |          4           |      **Validado** (Header, Busca/Filtros, Novo Cadastro, Tabela de Clientes)       |
| **Comercial**             | Tabelas de Preços         | `/admin/tabelas-precos`                               |   **Sim**   |          4           |    **Validado** (Central de Preços, Filtros por Canal, Nova Tabela, Vigências)     |
| **Comercial**             | CRM & Funil de Vendas     | `/admin/crm`                                          |   **Sim**   |          3           |          **Validado** (Dashboard CRM, Etapas do Funil Kanban, Novo Lead)           |
| **Financeiro**            | Contas a Pagar            | `/admin/financeiro/contas-pagar`                      |   **Sim**   |          4           |      **Validado** (Gestão, Filtros de Vencimento, Inclusão de Título, Baixas)      |
| **Financeiro**            | Contas a Receber          | `/admin/financeiro/contas-receber`                    |   **Sim**   |          3           |           **Validado** (Entradas, Busca por CNPJ/NF, Histórico e Régua)            |
| **Financeiro**            | Fluxo de Caixa            | `/admin/financeiro/fluxo-caixa`                       |   **Sim**   |          3           |      **Validado** (Painel de Liquidez, Período Projetado, Gráfico de Saldos)       |
| **Fiscal**                | NF-e / Documentos Fiscais | `/admin/fiscal/nfe`                                   |   **Sim**   |          3           |       **Validado** (Central de Notas, Status SEFAZ, Ações Fiscais XML/DANFE)       |
| **Fiscal**                | Reforma Tributária        | `/admin/fiscal/reforma-dashboard`                     |   **Sim**   |          3           |     **Validado** (Cronograma IBS/CBS, Simulações de Carga, Classificação NCM)      |
| **DP & RH**               | Admissões e Colaboradores | `/admin/dp/admissions`                                |   **Sim**   |          3           |         **Validado** (Admissões CLT, Nova Admissão, Status eSocial S-2200)         |
| **DP & RH**               | Banco de Horas            | `/admin/dp/banco-horas`                               |   **Sim**   |          3           |      **Validado** (Apuração de Ponto, Filtro por Período, Extrato Analítico)       |
| **Inteligência**          | BI Executivo              | `/admin/bi`                                           |   **Sim**   |          3           |   **Validado** (Cockpit de Indicadores, Filtros Globais, Visões Especializadas)    |
| **Inteligência**          | Controladoria & DRE       | `/admin/controladoria`                                |   **Sim**   |          3           |        **Validado** (Cockpit Gerencial, DRE Orçado × Realizado, Simulador)         |
| **Operação**              | WMS & Estoque             | `/admin/estoque`                                      |   **Sim**   |          3           |     **Validado** (Armazém WMS, Alertas de Ruptura e Lotes, Picking/Expedição)      |
| **Operação**              | Transporte & Logística    | `/admin/transporte`                                   |   **Sim**   |          3           |    **Validado** (Gestão de Frotas, Formação de Cargas/Romaneios, Comprovantes)     |
| **Operação**              | Indústria & PCP           | `/admin/industria`                                    |   **Sim**   |          3           |     **Validado** (Cockpit Industrial, Ordens de Produção OP, Rastreabilidade)      |
| **Planilhas Convertidas** | Comparativo Margens GR    | `/admin/planilhas/convertidas/comparativo-margens-gr` |   **Sim**   |          3           |      **Validado** (Motor de Planilhas, Filtros de Spread, Memória de Cálculo)      |
| **Verbas**                | Verbas de Fornecedores    | `/admin/verbas`                                       |   **Sim**   |          3           |      **Validado** (Acordos Comerciais, Conta Corrente Fornecedor, Apurações)       |
| **Marketing Enterprise**  | Cockpit & Aprovações      | `/admin/marketing`                                    |   **Sim**   |          3           |       **Validado** (Cockpit de Mídia, Novo Briefing, Aprovação de Criativos)       |
| **Atendimento**           | Central de Chamados       | `/admin/atendimento`                                  |   **Sim**   |          3           |          **Validado** (Fila de Tickets, Novo Chamado, Cronômetro de SLA)           |
| **Administração**         | Auditoria e Segurança     | `/admin/auditoria`                                    |   **Sim**   |          3           |    **Validado** (Trilha Indelével, Filtro por Usuário/Data, Diff de Alterações)    |
| **Administração**         | Gestão de Tours Guiados   | `/admin/configuracoes/jetro-online/tours`             |   **Sim**   |          4           |      **Validado** (Gestão de Roteiros, Métricas de Adoção, Novo Tour, Teste)       |

---

## 3. Diretrizes de Segurança e Não Modificação de Dados

- Conforme especificação restrita do ERP Jetro: **nenhum tour executa mutações reais** (não salva, não exclui, não cancela NF-e, não baixa títulos bancários e não fatura pedidos).
- Os tours destacam os botões e áreas pertinentes, fornecem instruções de preenchimento e dicas contextuais (`dicaInterativa`), permitindo aprendizado imersivo e 100% seguro.
- Para telas com restrição de acesso por perfil, os tours respeitam o campo `permissao_necessaria` e as regras de autorização do usuário logado.
