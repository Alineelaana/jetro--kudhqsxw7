# BACKLOG.md — Backlog Priorizado

> **Documento vivo — Referência oficial da plataforma**
> Última atualização: 2026-08-06
> Status: Oficial
> Responsável: Product Owner

---

## 1. Convenções

- **ID:** Formato `BLK-[VERSION]-[NUMBER]`
- **Prioridade:** P0 (Crítica), P1 (Alta), P2 (Média), P3 (Baixa)
- **PRD Ref:** Referência ao requisito no PRD.md
- **Arch Ref:** Referência à decisão arquitetural em ARCHITECTURE.md
- **Critérios de Aceitação:** Mensuráveis e testáveis

### Aceite Baseado em Evidências — Validação em Cinco Níveis

> **Regra permanente de engenharia — referência: PLATFORM_PRINCIPLES §4.10, ARCHITECTURE ADR-022**

Todo item de backlog só recebe o status **✅ Implementado** quando todos os cinco níveis de validação aplicáveis forem comprovados por evidência técnica:

1. **Existência Estrutural** — a estrutura existe fisicamente.
2. **Persistência** — a estrutura está presente e operacional no schema vivo do banco (não basta a migração estar "applied").
3. **Implementação Funcional** — a funcionalidade opera conforme especificado.
4. **Integração** — integra-se com hooks, regras de acesso, relações e demais módulos.
5. **Conformidade Arquitetural** — alinhada com princípios e ADRs da plataforma.

**Quatro status oficiais:** ✅ Implementado · 🟡 Parcialmente Implementado · ❌ Não Implementado · ⚪ Não Evidenciado

**Regra de ouro:** "Concluído" é um estado comprovado por evidências, e não uma declaração de desenvolvimento.

**Exceção "Não Aplicável":** Um nível que não se aplica ao requisito deve ser marcado explicitamente como **Não Aplicável** com justificativa, e não prejudica o cálculo de aderência.

**Cálculo de aderência:** `Aderência = (níveis ✅ Implementado) / (níveis aplicáveis) × 100`. Item com 100% recebe status global **Implementado**; aderência < 100% impede esse status.

---

## 2. MVP — Backlog

### BLK-MVP-001: Multi-tenancy e Multi-empresa

- **Prioridade:** P0
- **PRD Ref:** §3.8
- **Arch Ref:** ADR-001
- **Descrição:** Suportar múltiplas empresas com múltiplas filiais, isolamento por Tenant ID
- **Critérios de Aceitação:**
  1. Cada empresa tem seus dados isolados
  2. Usuário pode pertencer a múltiplas empresas/filiais
  3. Troca de empresa/filial não requer relogin
  4. Dados nunca vazam entre tenants

### BLK-MVP-002: Gestão Comercial Core

- **Prioridade:** P0
- **PRD Ref:** §3.1
- **Arch Ref:** ADR-002, ADR-004
- **Descrição:** Pedidos de venda, faturamento, NF-e/NFC-e/NFS-e, contratos, devoluções
- **Critérios de Aceitação:**
  1. Pedido criado com cliente, itens, condição de pagamento
  2. Faturamento gera documento fiscal automaticamente
  3. Contratos com recorrência geram faturas automáticas
  4. Devoluções criam crédito ou estorno

### BLK-MVP-003: Gestão Financeira Core

- **Prioridade:** P0
- **PRD Ref:** §3.3
- **Arch Ref:** ADR-002, ADR-004
- **Descrição:** Contas a receber/pagar, fluxo de caixa, conciliação, tesouraria, caixa, boletos/PIX
- **Critérios de Aceitação:**
  1. Título criado com vencimento, valor, contrapartida
  2. Baixa de título concilia com extrato bancário
  3. Fluxo de caixa projetado 30/60/90 dias
  4. Aprovação de pagamento acima do limite

### BLK-MVP-004: Gestão de Estoque e WMS

- **Prioridade:** P0
- **PRD Ref:** §3.4
- **Arch Ref:** ADR-002, ADR-004
- **Descrição:** Produtos, movimentações, lotes/validade, inventário, WMS (recebimento, separação, expedição)
- **Critérios de Aceitação:**
  1. Saldo de estoque preciso após cada movimentação
  2. Lotes com controle FIFO/FEFO
  3. Inventário cíclico com acuracidade > 95%
  4. WMS completo: recebimento → endereçamento → separação → expedição

### BLK-MVP-005: Gestão de Compras

- **Prioridade:** P0
- **PRD Ref:** §3.2
- **Arch Ref:** ADR-002, ADR-004
- **Descrição:** Requisições, cotações, pedidos, recebimento, divergências, devoluções
- **Critérios de Aceitação:**
  1. Requisição com fluxo de aprovação
  2. Cotação com múltiplos fornecedores e comparação
  3. Recebimento com conferência e registro de divergência
  4. Devolução com crédito

### BLK-MVP-006: Gestão de Logística

- **Prioridade:** P0
- **PRD Ref:** §3.5
- **Arch Ref:** ADR-002, ADR-004
- **Descrição:** Rotas, entregas, rastreamento, frota, motoristas, romaneios, fretes, comprovantes, app do motorista
- **Critérios de Aceitação:**
  1. Rota criada com múltiplas entregas
  2. Rastreamento em tempo real
  3. Comprovante de entrega com foto/geolocalização
  4. App do motorista funcional offline

### BLK-MVP-007: Configuration Center

- **Prioridade:** P0
- **PRD Ref:** §7
- **Arch Ref:** ADR-004
- **Descrição:** Parâmetros, permissões, numerações, templates, fluxos de aprovação
- **Critérios de Aceitação:**
  1. Parâmetros configuráveis sem código
  2. Matriz de permissões por função/módulo/ação
  3. Numeração automática configurável
  4. Templates de e-mail e documento editáveis

### BLK-MVP-008: Auditoria e Logs

- **Prioridade:** P0
- **PRD Ref:** §3.8
- **Arch Ref:** ADR-005
- **Descrição:** Registro de todas as ações relevantes com contexto completo
- **Critérios de Aceitação:**
  1. Toda ação CRUD registrada
  2. Log contém: quem, o quê, quando, IP, dispositivo, estado anterior/posterior
  3. Logs são imutáveis (append-only)
  4. Timeline cronológica por registro

### BLK-MVP-009: CMS e Site

- **Prioridade:** P0
- **PRD Ref:** §3.6
- **Arch Ref:** ADR-002
- **Descrição:** Gestão de conteúdo do site, vitrine, banners, formulário de orçamento
- **Critérios de Aceitação:**
  1. Conteúdo editável sem código
  2. Vitrine com banners e chamadas
  3. Formulário de orçamento envia para WhatsApp
  4. SEO configurável por página

### BLK-MVP-010: Chat de Atendimento

- **Prioridade:** P0
- **PRD Ref:** §3.9
- **Arch Ref:** ADR-002
- **Descrição:** Chat no site com atendentes e IA
- **Critérios de Aceitação:**
  1. Cliente inicia conversa sem login
  2. Atendente responde em tempo real
  3. IA responde quando atendente ausente
  4. Avaliação da conversa pelo cliente

### BLK-MVP-011: Assistente de IA (Consultar)

- **Prioridade:** P1
- **PRD Ref:** §4, §8
- **Arch Ref:** ADR-003
- **Descrição:** Chat com IA que responde perguntas sobre os dados da empresa
- **Critérios de Aceitação:**
  1. Usuário faz pergunta em linguagem natural
  2. IA responde com dados reais do tenant
  3. Resposta inclui fonte dos dados
  4. IA não executa ações (apenas consulta)

### BLK-MVP-012: Portal do Cliente

- **Prioridade:** P1
- **PRD Ref:** §10.6
- **Arch Ref:** ADR-002
- **Descrição:** Self-service para clientes: pedidos, rastreamento, documentos
- **Critérios de Aceitação:**
  1. Cliente faz login com CPF/CNPJ e senha
  2. Visualiza pedidos e entregas
  3. Solicita segunda via
  4. Acompanha rastreamento

### BLK-MVP-013: Fiscal Básico

- **Prioridade:** P0
- **PRD Ref:** §3.1
- **Arch Ref:** ADR-002
- **Descrição:** Emissão de NF-e, NFC-e, NFS-e, manifestação, carta de correção
- **Critérios de Aceitação:**
  1. NF-e emitida e autorizada na SEFAZ
  2. NFC-e para consumo
  3. NFS-e para serviços
  4. Carta de correção e manifestação do destinatário

### BLK-MVP-014: RH Básico

- **Prioridade:** P1
- **PRD Ref:** §3.7
- **Arch Ref:** ADR-002
- **Descrição:** Colaboradores, cargos, departamentos, ponto, férias, folha, benefícios
- **Critérios de Aceitação:**
  1. Cadastro completo de colaboradores
  2. Controle de ponto com cálculo de horas
  3. Folha de pagamento calculada
  4. Férias com fluxo de aprovação

### BLK-MVP-015: Backups e Restore

- **Prioridade:** P0
- **PRD Ref:** §3.8
- **Arch Ref:** ADR-005
- **Descrição:** Backup automático, manual, restore, comparação
- **Critérios de Aceitação:**
  1. Backup automático diário
  2. Backup manual sob demanda
  3. Restore testado e funcional
  4. Retenção configurável

### BLK-MVP-016: Dashboard de Decisão por Módulo

- **Prioridade:** P1
- **PRD Ref:** §8
- **Arch Ref:** ADR-009
- **Descrição:** Cada módulo abre com dashboard que responde as 4 perguntas
- **Critérios de Aceitação:**
  1. Dashboard mostra situação atual
  2. Drill-down para análise de causa
  3. Alertas contextuais
  4. KPIs configuráveis

### BLK-MVP-018: Módulo Indústria — Compras Internacionais e Multi-moeda

- **Prioridade:** P0
- **PRD Ref:** §3.11
- **Arch Ref:** ADR-011, ADR-016
- **Descrição:** Estender `purchase_orders` para compras internacionais com multi-moeda (moeda original, valor em moeda estrangeira, câmbio, data/referência, valor BRL, diferença cambial, landing cost). Estruturas `currencies` e `exchange_rates` como Shared Platform Services.
- **Critérios de Aceitação:**
  1. Pedido de compra criado em moeda estrangeira com conversão automática para BRL
  2. Taxa de câmbio registrada com data/referência
  3. Diferença cambial calculada quando aplicável
  4. Landing cost composto em moeda de origem e base

### BLK-MVP-019: Módulo Indústria — Importação e Landing Cost

- **Prioridade:** P0
- **PRD Ref:** §3.11
- **Arch Ref:** ADR-011
- **Descrição:** Gestão de processos de importação via `import_processes` (Shared Platform Service) com tracking de status e vinculação ao pedido de compra. Composição de custos via `import_costs`.
- **Critérios de Aceitação:**
  1. Processo de importação criado e vinculado ao pedido de compra internacional
  2. Status rastreado (em trânsito, desembaraçado, entregue)
  3. Landing cost composto (frete internacional, seguro, impostos, despesas aduaneiras)
  4. Rateio de custos por item/produto

### BLK-MVP-020: Módulo Indústria — Recebimento, Quarentena e Qualidade

- **Prioridade:** P0
- **PRD Ref:** §3.11
- **Arch Ref:** ADR-016, ADR-018
- **Descrição:** Extensão de `wms_receipts`/`stock_checkings` para recebimento de matéria-prima. Quarentena via `stock_batches.situacao` + localizações tipo quarentena. Qualidade via `quality_inspections`/`quality_parameters` com `modulo_origem`.
- **Critérios de Aceitação:**
  1. Recebimento de matéria-prima integrado ao WMS (sem recibos paralelos)
  2. Lote em quarentena tem disponibilidade bloqueada
  3. Quality Inspection decide condição (Aprovado, Reprovado, Aprovado com restrição, Necessita nova análise)
  4. Inspeção altera disponibilidade do lote via estruturas centrais de Stock/WMS
  5. Campo `modulo_origem` identifica contexto da inspeção

### BLK-MVP-021: Módulo Indústria — BOM Versionada e MRP Básico

- **Prioridade:** P0
- **PRD Ref:** §3.11
- **Arch Ref:** ADR-014, ADR-017
- **Descrição:** BOM versionada e imutável. MRP básico como rota/hook calculado (não coleção persistente) cruzando BOM × demanda × estoque × POs em aberto × importações em trânsito.
- **Critérios de Aceitação:**
  1. BOM criada como versão imutável
  2. MRP calcula necessidade líquida de compra sem persistência
  3. Cálculo considera BOM, demanda, estoque, POs em aberto e importações em trânsito
  4. Resultado do MRP é sempre atual (não há dados desatualizados)

### BLK-MVP-022: Módulo Indústria — PCP, Ordem de Produção e Apontamento

- **Prioridade:** P0
- **PRD Ref:** §3.11
- **Arch Ref:** ADR-017
- **Descrição:** Planejamento de produção com `production_resources` (campo `tipo`). Ordem de Produção com `bom_id` + `bom_version`. Apontamento real de consumo de matéria-prima por lote.
- **Critérios de Aceitação:**
  1. Ordem de produção criada com BOM versionada específica (`bom_id` + `bom_version`)
  2. Consumo real de matéria-prima registrado por lote
  3. Mesmo se a BOM for alterada depois, a ordem preserva a versão usada
  4. Recursos de produção alocados com campo `tipo`

### BLK-MVP-023: Módulo Indústria — Rastreabilidade e Genealogia Completa

- **Prioridade:** P0
- **PRD Ref:** §3.11
- **Arch Ref:** ADR-015
- **Descrição:** Rastreabilidade construída a partir de relações operacionais reais (Fornecedor → Importação → Recebimento → Lote MP → Inspeção → Movimentação → OP → Consumo → Lote PA → Expedição → Pedido/NF → Cliente).
- **Critérios de Aceitação:**
  1. Consulta identifica lote problemático → produtos acabados impactados → estoque existente → pedidos/NFs → clientes
  2. Funciona sem depender do módulo Recall (deferido para V1)
  3. Qualquer índice pré-computado é regenerável a partir das relações reais
  4. Não há segunda fonte de verdade

### BLK-MVP-024: Módulo Indústria — Custos, Indicadores e Auditoria

- **Prioridade:** P1
- **PRD Ref:** §3.11
- **Arch Ref:** ADR-005
- **Descrição:** Custos previstos × realizados com análise de variâncias. Indicadores essenciais (OTIF produção, eficiência, qualidade, ciclo, lead time importação, custo unitário). Auditoria completa com timeline.
- **Critérios de Aceitação:**
  1. Comparação de custo previsto × realizado com variâncias
  2. Indicadores calculados e exibidos em dashboard
  3. Toda ação do módulo Indústria registrada na auditoria central
  4. Timeline cronológica por registro (pedido, importação, recebimento, inspeção, OP, lote)

### BLK-MVP-025: Módulo Indústria — Fase 0: Engenharia & Produtos

- **Prioridade:** P0
- **PRD Ref:** §3.11
- **Arch Ref:** ADR-021
- **Descrição:** Estabelecimento da Single Source of Truth para a definição técnica de itens (Catálogo de Itens via `products` estendido), especificações técnicas configuráveis e versionadas, conversões de unidade (global e por Item com vigência), BOM/estruturas e formulações versionadas, recursos produtivos (separados do Item), roteiros e operações de produção versionados, integração com qualidade (Especificação × Inspeção), estrutura de custos industriais (padrão × realizado) e rastreabilidade histórica completa. Forma a fundação estrutural exigida antes de MRP, PCP, Compras/Importação, Estoque, Produção, Qualidade, Custos e Rastreabilidade.
- **Critérios de Aceitação:**
  1. `products` estendido com `item_type` (default "Não Classificado") e `is_industrial` (default false); sem `industrial_data` JSON; sem catálogo paralelo
  2. `spec_groups`, `spec_attributes`, `spec_values` existem com versionamento, vigência, status e responsável
  3. `unit_conversions` suporta conversões globais e por Item com vigência
  4. `bom_versions` e `bom_components` existem; versões ativadas são imutáveis; componentes referenciam o Item canônico
  5. Formulações implementadas como BOM com `type = "formulacao"`; campos de formulação explícitos e pesquisáveis
  6. `production_resources` separado do Item; tipos: linha, máquina, equipamento, célula, estação, centro produtivo
  7. `production_routes` e `production_route_operations` versionados desde o MVP
  8. `quality_inspections` referenciam a versão da especificação em vigor; Especificação ≠ Inspeção
  9. `industrial_costs` diferencia Custo Padrão (snapshot imutável) de Custo Realizado; análise de variâncias por componente
  10. Rastreabilidade: cadeia especificação → BOM → roteiro → lote → inspeção → OP → consumo → lote acabado é reproduzível sem depender do estado atual dos registros
  11. Seeds idempotentes para piloto Gran Romano (azeitona, salmoura, pote, tampa, rótulo, caixa, produto acabado, BOM completa, roteiro real)
  12. Ordem de implementação: (1) Catálogo de Itens; (2) Especificações; (3) Conversões; (4) BOM; (5) Formulações; (6) Recursos Produtivos; (7) Roteiros; (8) Qualidade; (9) Custos; (10) Integração e Rastreabilidade
- **Ordem de Implementação MVP Indústria:** Fase 0 (BLK-MVP-025) → Fase A: Suprimentos (BLK-MVP-018, BLK-MVP-019) → Fase B: Recebimento & Qualidade (BLK-MVP-020) → Fase C: Planejamento & Produção (BLK-MVP-021, BLK-MVP-022) → Fase D: Gestão (BLK-MVP-023, BLK-MVP-024)

### BLK-MVP-017: Sistema de Notificações

- **Prioridade:** P1
- **PRD Ref:** §3.8
- **Arch Ref:** ADR-002
- **Descrição:** Notificações in-app, e-mail e push para eventos configuráveis
- **Critérios de Aceitação:**
  1. Eventos geram notificações automaticamente
  2. Usuário marca como lida
  3. Notificações por canal configurável
  4. Badge de não lidas no menu

---

## 3. V1 — Backlog

### BLK-V1-001: Agentes Especializados por Domínio

- **Prioridade:** P1
- **PRD Ref:** §4
- **Arch Ref:** ADR-003
- **Descrição:** Agentes de IA para cada domínio (Vendas, Estoque, Financeiro, etc.)
- **Critérios de Aceitação:**
  1. Cada agente tem personalidade e base de conhecimento própria
  2. Agente sugere ações dentro do seu domínio
  3. Agentes colaboram em tarefas multi-domínio
  4. Autonomia configurável por agente

### BLK-V1-002: Automações Inteligentes

- **Prioridade:** P1
- **PRD Ref:** §3.9, §7
- **Arch Ref:** ADR-003, ADR-004
- **Descrição:** Gatilho → condição → ação com decisão de IA
- **Critérios de Aceitação:**
  1. Automação configurável sem código
  2. Condição pode envolver análise de IA
  3. Ação pode ser executada automaticamente ou com aprovação
  4. Log de execução completo

### BLK-V1-003: Smart Flows

- **Prioridade:** P1
- **PRD Ref:** §3.9
- **Arch Ref:** ADR-003
- **Descrição:** Fluxos visuais com estágios que incluem decisão de IA
- **Critérios de Aceitação:**
  1. Fluxo construído visualmente
  2. Estágios incluem consulta de IA, análise, decisão
  3. Transferência para humano quando necessário
  4. Versão e histórico de execuções

### BLK-V1-004: Base de Conhecimento (RAG)

- **Prioridade:** P1
- **PRD Ref:** §3.9
- **Arch Ref:** ADR-003
- **Descrição:** Documentos da empresa indexados para IA consultar
- **Critérios de Aceitação:**
  1. Upload de documentos (PDF, Word, texto)
  2. IA consulta base antes de responder
  3. Citação de fonte na resposta
  4. Versionamento de conteúdo

### BLK-V1-005: Dashboards Executivos

- **Prioridade:** P1
- **PRD Ref:** §6.2
- **Arch Ref:** ADR-009
- **Descrição:** Dashboard da Diretoria e da Presidência com KPIs estratégicos
- **Critérios de Aceitação:**
  1. Visão consolidada de todas as áreas
  2. Health score por área
  3. Comparações com metas e período anterior
  4. Previsões de IA integradas

### BLK-V1-006: Inteligência Preditiva

- **Prioridade:** P1
- **PRD Ref:** §9.1
- **Arch Ref:** ADR-003
- **Descrição:** Previsões de vendas, estoque, caixa, inadimplência, demanda
- **Critérios de Aceitação:**
  1. Previsão de vendas com 80%+ de acerto
  2. Previsão de ruptura com 7 dias de antecedência
  3. Previsão de fluxo de caixa 30/60/90 dias
  4. Nível de confiança em cada previsão

### BLK-V1-007: Inteligência Prescritiva

- **Prioridade:** P1
- **PRD Ref:** §9.2
- **Arch Ref:** ADR-003
- **Descrição:** Sugestões de ação com justificativa e nível de confiança
- **Critérios de Aceitação:**
  1. Sugestão inclui ação, justificativa, confiança, impacto, alternativa
  2. Usuário pode aprovar, rejeitar ou ajustar
  3. Resultado da ação alimenta o modelo
  4. Sugestões priorizadas por impacto

### BLK-V1-008: Aprovações de IA

- **Prioridade:** P1
- **PRD Ref:** §3.9
- **Arch Ref:** ADR-003
- **Descrição:** Fluxo de aprovação para ações propostas pela IA
- **Critérios de Aceitação:**
  1. IA prepara ação e envia para aprovação
  2. Aprovador vê contexto completo
  3. Ação executada após aprovação
  4. Rejeição com justificativa alimenta o modelo

### BLK-V1-009: Centro de Atendimento (SAC)

- **Prioridade:** P1
- **PRD Ref:** §3.9
- **Arch Ref:** ADR-002, ADR-003
- **Descrição:** SAC completo com SLA, classificação por IA, setores, motivos
- **Critérios de Aceitação:**
  1. Ticket criado e classificado por IA
  2. SLA monitorado com alertas
  3. Roteamento por setor/motivo
  4. Indicadores de atendimento

### BLK-V1-011: Módulo Indústria — Recall Completo

- **Prioridade:** P1
- **PRD Ref:** §3.11
- **Arch Ref:** ADR-015
- **Descrição:** Workflow completo de recall com notificação automática a clientes, bloqueio de estoque e gestão de devoluções.
- **Critérios de Aceitação:**
  1. Recall iniciado a partir de lote problemático
  2. Clientes que receberam o lote são notificados automaticamente
  3. Estoque existente do lote é bloqueado
  4. Devoluções gerenciadas via fluxo de logística reversa

### BLK-V1-012: Módulo Indústria — MRP Avançado com Forecasting

- **Prioridade:** P1
- **PRD Ref:** §3.11
- **Arch Ref:** ADR-014
- **Descrição:** MRP com forecasting de demanda baseado em histórico, sazonalidade e tendências. IA preditiva para otimização de produção.
- **Critérios de Aceitação:**
  1. Previsão de demanda com 80%+ de acerto
  2. MRP considera previsão além de pedidos confirmados
  3. Sugestões de produção otimizadas por IA
  4. Nível de confiança em cada previsão

### BLK-V1-010: Conformidade (LGPD, Trabalhista, SST)

- **Prioridade:** P1
- **PRD Ref:** §3.7, §3.8
- **Arch Ref:** ADR-010
- **Descrição:** Monitoramento de conformidade em RH, segurança e dados
- **Critérios de Aceitação:**
  1. Checklist de conformidade por área
  2. Alertas de não conformidade
  3. Documentos trabalhistas com validade monitorada
  4. Relatório de conformidade

---

## 4. V2 — Backlog

### BLK-V2-001: APIs Públicas

- **Prioridade:** P2
- **PRD Ref:** §10.5
- **Arch Ref:** ADR-002
- **Descrição:** APIs públicas documentadas (OpenAPI), SDKs, webhooks, sandbox
- **Critérios de Aceitação:**
  1. Documentação OpenAPI completa
  2. SDK JavaScript e Python
  3. Webhooks para eventos principais
  4. Sandbox para desenvolvimento

### BLK-V2-002: Marketplace

- **Prioridade:** P2
- **PRD Ref:** §10.4
- **Arch Ref:** ADR-008
- **Descrição:** Plataforma de plugins e extensões de terceiros
- **Critérios de Aceitação:**
  1. Plugin submetido, revisado e publicado
  2. Plugin executa em sandbox
  3. Revenue share configurável
  4. Avaliação e reviews

### BLK-V2-003: Mobile App

- **Prioridade:** P2
- **PRD Ref:** §3.8
- **Arch Ref:** ADR-002
- **Descrição:** App nativo iOS/Android para gestão móvel
- **Critérios de Aceitação:**
  1. Dashboards e KPIs no mobile
  2. Aprovações pendentes no mobile
  3. Notificações push
  4. Funcionalidade offline básica

### BLK-V2-004: White Label Completo

- **Prioridade:** P2
- **PRD Ref:** §11
- **Arch Ref:** ADR-006
- **Descrição:** Branding, domínio, templates customizáveis por parceiro
- **Critérios de Aceitação:**
  1. Logo, cores e nome customizáveis
  2. Domínio próprio (CNAME)
  3. Templates com marca do parceiro
  4. Dashboard do parceiro

### BLK-V2-005: Master Portal Completo

- **Prioridade:** P2
- **PRD Ref:** §12
- **Arch Ref:** ADR-007
- **Descrição:** Painel completo de gestão da plataforma
- **Critérios de Aceitação:**
  1. Gestão de clientes, planos, consumo
  2. Saúde da plataforma em tempo real
  3. Feature flags por cliente/plano/global
  4. Custos e receita por cliente

### BLK-V2-006: Inteligência Auto-Analítica

- **Prioridade:** P2
- **PRD Ref:** §8, PLATFORM §8.3
- **Arch Ref:** ADR-009
- **Descrição:** Plataforma analisa próprio uso e sugere melhorias
- **Critérios de Aceitação:**
  1. Identifica módulos não utilizados
  2. Sugere automações para processos repetitivos
  3. Detecta gargalos de performance
  4. Recomenda configurações baseadas em clientes similares

### BLK-V2-008: Módulo Indústria — Manutenção e OEE

- **Prioridade:** P2
- **PRD Ref:** §3.11
- **Arch Ref:** ADR-011
- **Descrição:** Gestão de manutenção de equipamentos, OEE (Overall Equipment Effectiveness), IA preditiva para falhas.
- **Critérios de Aceitação:**
  1. Manutenção preventiva e corretiva gerenciada
  2. OEE calculado (disponibilidade × performance × qualidade)
  3. IA preditiva alerta falhas iminentes
  4. Integração com `production_resources`

### BLK-V2-009: Módulo Indústria — Regras Aduaneiras Configuráveis

- **Prioridade:** P2
- **PRD Ref:** §3.11
- **Arch Ref:** ADR-019
- **Descrição:** Regras aduaneiras configuráveis sem código para diferentes países e regimes.
- **Critérios de Aceitação:**
  1. Regras de importação configuráveis por país
  2. Alíquotas e tributos configuráveis
  3. Regimes aduaneiros suportados
  4. Sem necessidade de código para novas regras

### BLK-V2-010: COMEX — Comércio Exterior Corporativo

- **Prioridade:** P2
- **PRD Ref:** §3.11
- **Arch Ref:** ADR-019
- **Descrição:** Evolução de `import_processes` para módulo corporativo de Comércio Exterior, utilizável por Indústrias, Distribuidores, Trading Companies e Centros de Distribuição.
- **Critérios de Aceitação:**
  1. Processos de importação utilizáveis por múltiplos perfis de empresa
  2. Suporte a Trading Companies
  3. Multi-empresa e multi-filial para operações de comércio exterior
  4. Integração com módulos existentes (Compras, Financeiro, Fiscal)

### BLK-V2-007: IA com Execução Autorizada

- **Prioridade:** P2
- **PRD Ref:** §4.3
- **Arch Ref:** ADR-003
- **Descrição:** IA executa ações automaticamente dentro de regras pré-aprovadas
- **Critérios de Aceitação:**
  1. Regras de autonomia configuráveis
  2. IA executa e registra ação
  3. Notificação pós-execução
  4. Reversão disponível quando aplicável

---

## 5. V3 — Backlog

### BLK-V3-001: Instância Dedicada Enterprise

- **Prioridade:** P3
- **PRD Ref:** §10.1
- **Arch Ref:** ADR-001
- **Descrição:** Migração transparente para instância dedicada
- **Critérios de Aceitação:**
  1. Provisionamento automático
  2. Migração de dados sem downtime
  3. Código de negócio inalterado
  4. SLA 99.99%

### BLK-V3-002: IA Multimodal

- **Prioridade:** P3
- **PRD Ref:** §4
- **Arch Ref:** ADR-003
- **Descrição:** IA processa texto, imagem, voz e vídeo
- **Critérios de Aceitação:**
  1. Upload de imagem para análise
  2. Comando por voz
  3. Análise de vídeo (ex: conferência de entrega)
  4. Resposta multimodal

### BLK-V3-003: Modelos Locais (On-Premise)

- **Prioridade:** P3
- **PRD Ref:** §4
- **Arch Ref:** ADR-003
- **Descrição:** IA executada localmente para clientes Enterprise
- **Critérios de Aceitação:**
  1. Modelo roda no servidor do cliente
  2. Dados não saem do ambiente
  3. Performance equivalente ao cloud
  4. Atualização de modelo sem downtime

### BLK-V3-004: Colaboração entre Agentes

- **Prioridade:** P3
- **PRD Ref:** §4
- **Arch Ref:** ADR-003
- **Descrição:** Agentes conversam entre si para resolver tarefas complexas
- **Critérios de Aceitação:**
  1. Agente delega tarefa para outro agente
  2. Agentes compartilham contexto
  3. Resolução colaborativa visível ao usuário
  4. Registro completo da colaboração

### BLK-V3-005: IA com Aprendizado Contínuo

- **Prioridade:** P3
- **PRD Ref:** §3.9
- **Arch Ref:** ADR-003
- **Descrição:** IA aprende com feedback e resultados
- **Critérios de Aceitação:**
  1. Feedback do usuário melhora respostas
  2. Resultados de ações alimentam modelo
  3. Aprendizado por domínio
  4. Privacy: aprendizado opt-in

### BLK-V3-007: Módulo Indústria — IA Prescritiva e Otimização Autônoma

- **Prioridade:** P3
- **PRD Ref:** §3.11
- **Arch Ref:** ADR-003, ADR-014
- **Descrição:** IA prescritiva para produção com sugestões de otimização, parameterização multi-indústria e multi-moeda avançada, otimização autônoma de cadeia de suprimentos.
- **Critérios de Aceitação:**
  1. IA sugere otimizações de produção com justificativa e nível de confiança
  2. Parameterização para múltiplos tipos de indústria
  3. Multi-moeda avançada com hedging cambial
  4. Otimização autônoma de cadeia de suprimentos com supervisão humana

### BLK-V3-006: Developer Platform

- **Prioridade:** P3
- **PRD Ref:** §10.5
- **Arch Ref:** ADR-002, ADR-008
- **Descrição:** Plataforma completa para desenvolvedores externos
- **Critérios de Aceitação:**
  1. SDK completo (multi-linguagem)
  2. Documentação interativa
  3. Comunidade e fórum
  4. Certificação de desenvolvedor

---

## 6. Matriz de Rastreabilidade

| Backlog ID  | PRD Ref    | Arch Ref         | Versão | Prioridade |
| ----------- | ---------- | ---------------- | ------ | ---------- |
| BLK-MVP-001 | §3.8       | ADR-001          | MVP    | P0         |
| BLK-MVP-002 | §3.1       | ADR-002, ADR-004 | MVP    | P0         |
| BLK-MVP-003 | §3.3       | ADR-002, ADR-004 | MVP    | P0         |
| BLK-MVP-004 | §3.4       | ADR-002, ADR-004 | MVP    | P0         |
| BLK-MVP-005 | §3.2       | ADR-002, ADR-004 | MVP    | P0         |
| BLK-MVP-006 | §3.5       | ADR-002, ADR-004 | MVP    | P0         |
| BLK-MVP-007 | §7         | ADR-004          | MVP    | P0         |
| BLK-MVP-008 | §3.8       | ADR-005          | MVP    | P0         |
| BLK-MVP-009 | §3.6       | ADR-002          | MVP    | P0         |
| BLK-MVP-010 | §3.9       | ADR-002          | MVP    | P0         |
| BLK-MVP-011 | §4, §8     | ADR-003          | MVP    | P1         |
| BLK-MVP-012 | §10.6      | ADR-002          | MVP    | P1         |
| BLK-MVP-013 | §3.1       | ADR-002          | MVP    | P0         |
| BLK-MVP-014 | §3.7       | ADR-002          | MVP    | P1         |
| BLK-MVP-015 | §3.8       | ADR-005          | MVP    | P0         |
| BLK-MVP-016 | §8         | ADR-009          | MVP    | P1         |
| BLK-MVP-017 | §3.8       | ADR-002          | MVP    | P1         |
| BLK-V1-001  | §4         | ADR-003          | V1     | P1         |
| BLK-V1-002  | §3.9, §7   | ADR-003, ADR-004 | V1     | P1         |
| BLK-V1-003  | §3.9       | ADR-003          | V1     | P1         |
| BLK-V1-004  | §3.9       | ADR-003          | V1     | P1         |
| BLK-V1-005  | §6.2       | ADR-009          | V1     | P1         |
| BLK-V1-006  | §9.1       | ADR-003          | V1     | P1         |
| BLK-V1-007  | §9.2       | ADR-003          | V1     | P1         |
| BLK-V1-008  | §3.9       | ADR-003          | V1     | P1         |
| BLK-V1-009  | §3.9       | ADR-002, ADR-003 | V1     | P1         |
| BLK-V1-010  | §3.7, §3.8 | ADR-010          | V1     | P1         |
| BLK-V2-001  | §10.5      | ADR-002          | V2     | P2         |
| BLK-V2-002  | §10.4      | ADR-008          | V2     | P2         |
| BLK-V2-003  | §3.8       | ADR-002          | V2     | P2         |
| BLK-V2-004  | §11        | ADR-006          | V2     | P2         |
| BLK-V2-005  | §12        | ADR-007          | V2     | P2         |
| BLK-V2-006  | §8         | ADR-009          | V2     | P2         |
| BLK-V2-007  | §4.3       | ADR-003          | V2     | P2         |
| BLK-V3-001  | §10.1      | ADR-001          | V3     | P3         |
| BLK-V3-002  | §4         | ADR-003          | V3     | P3         |
| BLK-V3-003  | §4         | ADR-003          | V3     | P3         |
| BLK-V3-004  | §4         | ADR-003          | V3     | P3         |
| BLK-V3-005  | §3.9       | ADR-003          | V3     | P3         |
| BLK-V3-006  | §10.5      | ADR-002, ADR-008 | V3     | P3         |
| BLK-V3-007  | §3.11      | ADR-003, ADR-014 | V3     | P3         |
| BLK-MVP-018 | §3.11      | ADR-011, ADR-016 | MVP    | P0         |
| BLK-MVP-019 | §3.11      | ADR-011          | MVP    | P0         |
| BLK-MVP-020 | §3.11      | ADR-016, ADR-018 | MVP    | P0         |
| BLK-MVP-021 | §3.11      | ADR-014, ADR-017 | MVP    | P0         |
| BLK-MVP-022 | §3.11      | ADR-017          | MVP    | P0         |
| BLK-MVP-023 | §3.11      | ADR-015          | MVP    | P0         |
| BLK-MVP-024 | §3.11      | ADR-005          | MVP    | P1         |
| BLK-MVP-025 | §3.11      | ADR-021          | MVP    | P0         |
| BLK-V1-011  | §3.11      | ADR-015          | V1     | P1         |
| BLK-V1-012  | §3.11      | ADR-014          | V1     | P1         |
| BLK-V2-008  | §3.11      | ADR-011          | V2     | P2         |
| BLK-V2-009  | §3.11      | ADR-019          | V2     | P2         |
| BLK-V2-010  | §3.11      | ADR-019          | V2     | P2         |

---

## 7. Gestão deste Documento

- **Tipo:** Documento vivo
- **Frequência de revisão:** A cada sprint ou mudança de prioridade
- **Responsável:** Product Owner
- **Aprovação:** Architecture Council
- **Rastreabilidade:** Cada item referencia PRD e ARCHITECTURE

---

_O backlog é a ponte entre a visão (PRD) e a execução. Cada item existe porque resolve um problema real do cliente. Se não resolve, não está no backlog._
