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

---

## 7. Gestão deste Documento

- **Tipo:** Documento vivo
- **Frequência de revisão:** A cada sprint ou mudança de prioridade
- **Responsável:** Product Owner
- **Aprovação:** Architecture Council
- **Rastreabilidade:** Cada item referencia PRD e ARCHITECTURE

---

_O backlog é a ponte entre a visão (PRD) e a execução. Cada item existe porque resolve um problema real do cliente. Se não resolve, não está no backlog._
