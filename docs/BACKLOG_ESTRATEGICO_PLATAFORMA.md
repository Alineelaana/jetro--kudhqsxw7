# Backlog Estratégico da Plataforma

> **Documento Oficial — Fonte Única de Verdade para Implementações Futuras**
> **Status:** Ativo
> **Data de criação:** 2026-08-07
> **Framework:** FCP-MODULAR v1.0
> **Responsável:** Architecture Council
> **Classificação:** Permanente — Alimentado pela certificação de domínios

---

## 1. Propósito

Este documento é o **repositório persistente e oficial** onde a equipe de certificação registra todas as oportunidades de melhoria identificadas durante a auditoria dos domínios da plataforma. Após a conclusão da certificação, este backlog torna-se a **única fonte oficial de verdade** para futuras implementações.

**Regra de ouro:** Nenhuma implementação deve ser iniciada sem um item correspondente neste backlog. Se não está aqui, não deve ser feito.

---

## 2. Política de Registro Baseada em Valor

### 2.1 Critérios de Aceitação

Uma oportunidade só é registrada quando atende **pelo menos um** dos critérios:

1. **Aumento de segurança** 2. **Aumento de escalabilidade** 3. **Redução de complexidade** 4. **Redução de débito técnico** 5. **Melhoria de performance** 6. **Melhoria da UX** 7. **Automação relevante** 8. **Aumento de produtividade** 9. **Vantagem competitiva** 10. **Simplificação operacional**

---

## 3. Itens Registrados

### BEP-001: Completar Regras RLS em Todas as Collections

| Campo          | Valor                                                              |
| -------------- | ------------------------------------------------------------------ |
| **Título**     | Definir 5 regras RLS em toda collection                            |
| **Descrição**  | Auditar collections e definir list/view/create/update/delete rules |
| **Motivo**     | NC-CRIT-002: Collections com regras `null` bloqueiam acesso        |
| **Benefício**  | Usuários autenticados acessam dados via SDK                        |
| **Impacto**    | Segurança, Operação                                                |
| **Prioridade** | P0                                                                 |
| **Domínio**    | 03 — Segurança                                                     |
| **Critério**   | Aumento de segurança                                               |

### BEP-002: Adicionar Campos Autodate em Collections Base ✅ Implementado

| Campo          | Valor                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| **Título**     | Garantir autodate em toda collection base                              |
| **Descrição**  | Adicionar `created`/`updated` autodate onde ausentes                   |
| **Motivo**     | NC-CRIT-001: Queries com sort/filter falham                            |
| **Benefício**  | Sort e filter funcionam em todas as collections                        |
| **Impacto**    | Desenvolvimento, Operação                                              |
| **Prioridade** | P0                                                                     |
| **Domínio**    | 02 — Banco de Dados                                                    |
| **Critério**   | Redução de débito técnico                                              |
| **Status**     | ✅ Implementado — Migration 0092 aplicada                              |
| **Evidência**  | Migration `0092_add_autodate_fields.js`; hook `autodate_verify.js`     |
| **Validação**  | 5 níveis: estrutural, persistência, funcional, integração, arquitetura |

### BEP-003: Investigar Gap de Migration 0037

| Campo          | Valor                                                        |
| -------------- | ------------------------------------------------------------ |
| **Título**     | Resolver gap de migration 0037                               |
| **Descrição**  | Verificar collections de 0037 no schema vivo, documentar gap |
| **Motivo**     | NC-CRIT-003: Migration não aplicada                          |
| **Benefício**  | Histórico de migrações consistente                           |
| **Impacto**    | Desenvolvimento, Manutenção                                  |
| **Prioridade** | P1                                                           |
| **Domínio**    | 02 — Banco de Dados                                          |
| **Critério**   | Redução de débito técnico                                    |

### BEP-004: Adicionar Índices em Campos de Filter/Sort

| Campo            | Valor                                                    |
| ---------------- | -------------------------------------------------------- |
| **Título**       | Criar índices em campos críticos                         |
| **Descrição**    | Indexar campos: status, created, client_name, product_id |
| **Motivo**       | NC-HIGH-001: Sem índices, performance degradada          |
| **Benefício**    | Queries < 100ms                                          |
| **Impacto**      | Performance, UX                                          |
| **Prioridade**   | P1                                                       |
| **Dependências** | BEP-002                                                  |
| **Domínio**      | 02 — Banco de Dados                                      |
| **Critério**     | Melhoria de performance                                  |

### BEP-005: Implementar MFA para Administradores ✅ Implementado

| Campo          | Valor                                                                                                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Título**     | MFA (TOTP) obrigatório para role SUP                                                                                                                                                                                         |
| **Descrição**  | Implementar TOTP, tela de setup, verificação no login                                                                                                                                                                        |
| **Motivo**     | NC-HIGH-003: Sem MFA para admin                                                                                                                                                                                              |
| **Benefício**  | Acesso admin requer segunda camada                                                                                                                                                                                           |
| **Impacto**    | Segurança                                                                                                                                                                                                                    |
| **Prioridade** | P0                                                                                                                                                                                                                           |
| **Domínio**    | 03 — Segurança                                                                                                                                                                                                               |
| **Critério**   | Aumento de segurança                                                                                                                                                                                                         |
| **Status**     | ✅ Implementado — Sprint Técnica 1                                                                                                                                                                                           |
| **Evidência**  | Migration `0093_bep005_mfa_fields.js`; hooks `mfa_setup.js`, `mfa_verify.js`, `mfa_disable.js`, `mfa_status.js`; frontend `mfa-enrollment-dialog.tsx`, `mfa-verify-screen.tsx`; `security_config.mfa_required_for_admins`    |
| **Validação**  | 5 níveis: estrutural (migrations + hooks), persistência (campos no schema vivo), funcional (fluxo de setup e login MFA), integração (audit logs, RLS preservada), arquitetural (reutiliza users collection, security_config) |

### BEP-006: Criptografia Campo-a-Campo para Dados LGPD

| Campo          | Valor                                                                |
| -------------- | -------------------------------------------------------------------- |
| **Título**     | Criptografar CPF, CNPJ e dados bancários                             |
| **Descrição**  | Hooks encrypt/decrypt usando `$security.encrypt`/`$security.decrypt` |
| **Motivo**     | NC-HIGH-004: Sem criptografia em repouso                             |
| **Benefício**  | Dados sensíveis protegidos                                           |
| **Impacto**    | Segurança, LGPD                                                      |
| **Prioridade** | P1                                                                   |
| **Domínio**    | 03 — Segurança                                                       |
| **Critério**   | Aumento de segurança                                                 |

### BEP-007: Implementar Testes de Migração em CI/CD

| Campo          | Valor                                                        |
| -------------- | ------------------------------------------------------------ |
| **Título**     | Pipeline de validação de migrações                           |
| **Descrição**  | CI/CD que aplica migrações em banco de teste e valida schema |
| **Motivo**     | NC-HIGH-002: Sem testes automatizados                        |
| **Benefício**  | Migrações validadas antes do deploy                          |
| **Impacto**    | Qualidade, Desenvolvimento                                   |
| **Prioridade** | P1                                                           |
| **Domínio**    | 02 — Banco de Dados                                          |
| **Critério**   | Redução de débito técnico                                    |

### BEP-008: Auditar e Corrigir Bool Fields com required: true

| Campo          | Valor                                                     |
| -------------- | --------------------------------------------------------- |
| **Título**     | Remover `required` de campos bool                         |
| **Descrição**  | Auditar migrations por bool required e remover constraint |
| **Motivo**     | PocketBase trata false como empty; required rejeita false |
| **Benefício**  | Registros com bool=false criados com sucesso              |
| **Impacto**    | Desenvolvimento                                           |
| **Prioridade** | P2                                                        |
| **Domínio**    | 02 — Banco de Dados                                       |
| **Critério**   | Redução de débito técnico                                 |

### BEP-009: Cache de Permissões no Frontend

| Campo          | Valor                                                         |
| -------------- | ------------------------------------------------------------- |
| **Título**     | Hook usePermissions com memoização                            |
| **Descrição**  | Memoizar funções de permissão por role                        |
| **Motivo**     | useAuth() chamado em cada componente; permissões recalculadas |
| **Benefício**  | Reduz recálculos e melhora renderização                       |
| **Impacto**    | Performance, UX                                               |
| **Prioridade** | P2                                                            |
| **Domínio**    | 01 — Arquitetura                                              |
| **Critério**   | Melhoria de performance                                       |

### BEP-010: Validação Automática de Schema

| Campo            | Valor                                            |
| ---------------- | ------------------------------------------------ |
| **Título**       | Hook de boot que verifica integridade do schema  |
| **Descrição**    | Verifica autodate, RLS, e gaps de migration      |
| **Motivo**       | NCs poderiam ter sido detectadas automaticamente |
| **Benefício**    | Detectar gaps antes de produção                  |
| **Impacto**      | Qualidade, Manutenção                            |
| **Prioridade**   | P1                                               |
| **Dependências** | BEP-002, BEP-003                                 |
| **Domínio**      | 01/02 — Arquitetura/BD                           |
| **Critério**     | Aumento de segurança                             |

### BEP-011: Feature Flags Globais

| Campo          | Valor                                                                |
| -------------- | -------------------------------------------------------------------- |
| **Título**     | Collection feature_flags + hook de controle                          |
| **Descrição**  | Collection `feature_flags` (key, enabled, scope) + hook frontend     |
| **Motivo**     | ADR-004 define modularidade com feature flags; implementação parcial |
| **Benefício**  | Controle granular por cliente/plano                                  |
| **Impacto**    | Comercial, Operação                                                  |
| **Prioridade** | P2                                                                   |
| **Domínio**    | 01 — Arquitetura                                                     |
| **Critério**   | Aumento de escalabilidade                                            |

### BEP-012: Dashboard de Saúde da Plataforma

| Campo            | Valor                                         |
| ---------------- | --------------------------------------------- |
| **Título**       | Dashboard com uptime, latência, erros         |
| **Descrição**    | Dashboard consolidado de saúde                |
| **Motivo**       | ADR-009 define observabilidade; sem dashboard |
| **Benefício**    | Visibilidade proativa                         |
| **Impacto**      | Operação, Manutenção                          |
| **Prioridade**   | P2                                            |
| **Dependências** | BEP-010                                       |
| **Domínio**      | 15 — TI/Infra                                 |
| **Critério**     | Simplificação operacional                     |

### BEP-013: Rota de Verificação de Integridade de Schema

| Campo          | Valor                                    |
| -------------- | ---------------------------------------- |
| **Título**     | Endpoint /backend/v1/schema/verify       |
| **Descrição**  | Compara schema esperado com schema vivo  |
| **Motivo**     | Gaps podem passar despercebidos          |
| **Benefício**  | Detectar drift entre migrations e schema |
| **Impacto**    | Qualidade, Manutenção                    |
| **Prioridade** | P2                                       |
| **Domínio**    | 02 — Banco de Dados                      |
| **Critério**   | Simplificação operacional                |

### BEP-014: Schema Versioning Automático

| Campo          | Valor                                        |
| -------------- | -------------------------------------------- |
| **Título**     | Exportação versionada do schema vivo         |
| **Descrição**  | Hook que exporta schema para JSON versionado |
| **Motivo**     | Sem snapshot versionado além de migrations   |
| **Benefício**  | Rastrear mudanças entre versões              |
| **Impacto**    | Manutenção, Auditoria                        |
| **Prioridade** | P3                                           |
| **Domínio**    | 02 — Banco de Dados                          |
| **Critério**   | Redução de complexidade                      |

### BEP-015: Data Retention Policy Automatizada

| Campo          | Valor                                                                 |
| -------------- | --------------------------------------------------------------------- |
| **Título**     | Política de retenção com purge automático                             |
| **Descrição**  | Retenção por collection (audit_logs=5 anos, api_request_logs=90 dias) |
| **Motivo**     | Collections crescem indefinidamente                                   |
| **Benefício**  | Controlar crescimento do banco                                        |
| **Impacto**    | Performance, Custo                                                    |
| **Prioridade** | P2                                                                    |
| **Domínio**    | 02 — Banco de Dados                                                   |
| **Critério**   | Melhoria de performance                                               |

### BEP-016: Centralização de Validação de Permissões

| Campo          | Valor                                                      |
| -------------- | ---------------------------------------------------------- |
| **Título**     | Consolidar funções de permissão                            |
| **Descrição**  | Unificar 6 arquivos de permissões em interface padronizada |
| **Motivo**     | 6 arquivos com padrões inconsistentes                      |
| **Benefício**  | Consistência e manutenibilidade                            |
| **Impacto**    | Desenvolvimento                                            |
| **Prioridade** | P3                                                         |
| **Domínio**    | 01 — Arquitetura                                           |
| **Critério**   | Redução de complexidade                                    |

### BEP-017: Documentação Automática de Collections

| Campo          | Valor                                                         |
| -------------- | ------------------------------------------------------------- |
| **Título**     | Gerar doc Markdown de collections                             |
| **Descrição**  | Script que lista collections, campos, tipos, índices e regras |
| **Motivo**     | 120+ collections sem documentação centralizada                |
| **Benefício**  | Facilitar onboarding e auditoria                              |
| **Impacto**    | Manutenção                                                    |
| **Prioridade** | P3                                                            |
| **Domínio**    | 02 — Banco de Dados                                           |
| **Critério**   | Aumento de produtividade                                      |

### BEP-018: Implementar Integração SEFAZ

| Campo          | Valor                                                           |
| -------------- | --------------------------------------------------------------- |
| **Título**     | Hooks para emissão de NF-e/NFC-e/NFS-e via SEFAZ                |
| **Descrição**  | Criar hooks para emissão, consulta, cancelamento e inutilização |
| **Motivo**     | NC-HIGH-006/011: NF-e é mock                                    |
| **Benefício**  | Documentos fiscais autorizados oficialmente                     |
| **Impacto**    | Fiscal, Comercial                                               |
| **Prioridade** | P1                                                              |
| **Domínio**    | 04 — Backend / 10 — Fiscal                                      |
| **Critério**   | Vantagem competitiva                                            |

### BEP-019: Implementar Integração Bancária

| Campo          | Valor                                                            |
| -------------- | ---------------------------------------------------------------- |
| **Título**     | Hooks para API bancária (boleto, PIX, conciliação)               |
| **Descrição**  | Criar hooks para geração de boleto, PIX e conciliação automática |
| **Motivo**     | NC-HIGH-007/009: Sem integração bancária                         |
| **Benefício**  | Cobrança e conciliação automatizadas                             |
| **Impacto**    | Financeiro                                                       |
| **Prioridade** | P1                                                               |
| **Domínio**    | 04 — Backend / 09 — Financeiro                                   |
| **Critério**   | Automação relevante                                              |

### BEP-020: Definir Skip Cloud Agent

| Campo          | Valor                                                 |
| -------------- | ----------------------------------------------------- |
| **Título**     | Migration definindo agente de suporte com RAG         |
| **Descrição**  | Usar `$ai.agents.define` para criar agente de suporte |
| **Motivo**     | NC-HIGH-010: Nenhum agente definido                   |
| **Benefício**  | Assistência IA funcional                              |
| **Impacto**    | IA, Atendimento                                       |
| **Prioridade** | P1                                                    |
| **Domínio**    | 15 — TI/IA                                            |
| **Critério**   | Vantagem competitiva                                  |

### BEP-021: Implementar Rate Limiting

| Campo          | Valor                                             |
| -------------- | ------------------------------------------------- |
| **Título**     | Middleware de rate limiting em rotas customizadas |
| **Descrição**  | Limitar requisições por IP/usuário                |
| **Motivo**     | NC-HIGH-014: Sem rate limiting                    |
| **Benefício**  | Proteção contra abuso de API                      |
| **Impacto**    | Segurança, Escalabilidade                         |
| **Prioridade** | P1                                                |
| **Domínio**    | 15 — TI/Infra                                     |
| **Critério**   | Aumento de escalabilidade                         |

### BEP-022: Integrar APM/Observabilidade

| Campo          | Valor                                         |
| -------------- | --------------------------------------------- |
| **Título**     | Ferramenta de APM para monitorar performance  |
| **Descrição**  | Integrar APM para latência, erros, throughput |
| **Motivo**     | NC-HIGH-013: Sem APM                          |
| **Benefício**  | Performance mensurável                        |
| **Impacto**    | Operação, Performance                         |
| **Prioridade** | P1                                            |
| **Domínio**    | 15 — TI/Infra                                 |
| **Critério**   | Simplificação operacional                     |

### BEP-023: Implementar Caching (Redis)

| Campo          | Valor                                                    |
| -------------- | -------------------------------------------------------- |
| **Título**     | Camada de caching para dados quentes                     |
| **Descrição**  | Redis ou equivalente para catálogos, configs, dashboards |
| **Motivo**     | NC-HIGH-015: Sem caching                                 |
| **Benefício**  | Escalabilidade e performance                             |
| **Impacto**    | Escalabilidade, Performance                              |
| **Prioridade** | P1                                                       |
| **Domínio**    | 15 — TI/Infra                                            |
| **Critério**   | Aumento de escalabilidade                                |

### BEP-024: Implementar RAG/Vector Search

| Campo          | Valor                                                                |
| -------------- | -------------------------------------------------------------------- |
| **Título**     | Collection com campo vector + hooks $ai.embed + rota $vectors.search |
| **Descrição**  | Criar infraestrutura de busca semântica                              |
| **Motivo**     | NC-MED-018: Sem RAG                                                  |
| **Benefício**  | IA consulta base de conhecimento                                     |
| **Impacto**    | IA                                                                   |
| **Prioridade** | P2                                                                   |
| **Domínio**    | 15 — TI/IA                                                           |
| **Critério**   | Vantagem competitiva                                                 |

### BEP-025: Criar Collection production_orders ✅ Implementado

| Campo          | Valor                                                                                                                                                                                                                                                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Título**     | Collection para ordens de produção com BOM versionada                                                                                                                                                                                                                                                                               |
| **Descrição**  | Criar collection com bom_id, bom_version, status, quantidade                                                                                                                                                                                                                                                                        |
| **Motivo**     | NC-HIGH-007: production_orders ausente                                                                                                                                                                                                                                                                                              |
| **Benefício**  | Execução de produção implementada                                                                                                                                                                                                                                                                                                   |
| **Impacto**    | Indústria                                                                                                                                                                                                                                                                                                                           |
| **Prioridade** | P0                                                                                                                                                                                                                                                                                                                                  |
| **Domínio**    | 12 — Indústria                                                                                                                                                                                                                                                                                                                      |
| **Critério**   | Aumento de produtividade                                                                                                                                                                                                                                                                                                            |
| **Status**     | ✅ Implementado — Sprint Técnica 1                                                                                                                                                                                                                                                                                                  |
| **Evidência**  | Migration `0094_bep025_production_orders.js`; hook `production_order_number_next.js`; service `src/services/production-orders.ts`; panel `src/components/industry/production-orders-panel.tsx`; rota `/admin/industria/ordens-producao`                                                                                             |
| **Validação**  | 5 níveis: estrutural (migration + hook + service + panel), persistência (collection no schema vivo), funcional (CRUD de ordens, transições de status), integração (relações com products, bom_versions, production_routes), arquitetural (reutiliza collections existentes via RelationField, RLS consistente com módulo Indústria) |

### BEP-026: Implementar Hook MRP

| Campo            | Valor                                               |
| ---------------- | --------------------------------------------------- |
| **Título**       | Rota/hook que calcula necessidade líquida de compra |
| **Descrição**    | Cruza BOM × demanda × estoque × POs × importações   |
| **Motivo**       | NC-MED-012: Sem hook MRP                            |
| **Benefício**    | Cálculo automático de necessidade de compra         |
| **Impacto**      | Indústria, Compras                                  |
| **Prioridade**   | P1                                                  |
| **Dependências** | BEP-025                                             |
| **Domínio**      | 12 — Indústria                                      |
| **Critério**     | Automação relevante                                 |

### BEP-027: Implementar Apontamento de Produção

| Campo            | Valor                                                      |
| ---------------- | ---------------------------------------------------------- |
| **Título**       | Registro de consumo real de MP por lote                    |
| **Descrição**    | Collection/hook para apontamento e geração de lote acabado |
| **Motivo**       | NC-MED-013: Sem apontamento                                |
| **Benefício**    | Consumo real rastreado com genealogia                      |
| **Impacto**      | Indústria, Rastreabilidade                                 |
| **Prioridade**   | P1                                                         |
| **Dependências** | BEP-025                                                    |
| **Domínio**      | 12 — Indústria                                             |
| **Critério**     | Aumento de produtividade                                   |

### BEP-028: Serviço Centralizado de KPI

| Campo          | Valor                                    |
| -------------- | ---------------------------------------- |
| **Título**     | Collection kpi_snapshots + hook cron     |
| **Descrição**  | Persistir KPIs calculados periodicamente |
| **Motivo**     | NC-HIGH-008: Sem BI dedicado             |
| **Benefício**  | KPIs reproduzíveis e versionados         |
| **Impacto**    | BI, Analytics                            |
| **Prioridade** | P1                                       |
| **Domínio**    | 14 — BI                                  |
| **Critério**   | Aumento de produtividade                 |

### BEP-029: Implementar ETL Básico

| Campo          | Valor                                       |
| -------------- | ------------------------------------------- |
| **Título**     | Hook cron que consolida dados multi-domínio |
| **Descrição**  | ETL para cross-domain analytics             |
| **Motivo**     | NC-HIGH-009: Sem ETL                        |
| **Benefício**  | Analytics cross-domain                      |
| **Impacto**    | BI, Analytics                               |
| **Prioridade** | P1                                          |
| **Domínio**    | 14 — BI                                     |
| **Critério**   | Aumento de produtividade                    |

### BEP-030: Unificar Bibliotecas de Exportação

| Campo          | Valor                                         |
| -------------- | --------------------------------------------- |
| **Título**     | Consolidar 12+ bibliotecas em framework único |
| **Descrição**  | Framework configurável de exportação          |
| **Motivo**     | NC-MED-017: Lógica duplicada em 12+ arquivos  |
| **Benefício**  | Manutenção simplificada                       |
| **Impacto**    | Desenvolvimento, BI                           |
| **Prioridade** | P2                                            |
| **Domínio**    | 14 — BI / 05 — Frontend                       |
| **Critério**   | Redução de complexidade                       |

### BEP-031: Padronizar Breadcrumbs

| Campo          | Valor                                                   |
| -------------- | ------------------------------------------------------- |
| **Título**     | Adicionar breadcrumbs em todas as telas administrativas |
| **Descrição**  | Componente Breadcrumb reutilizável                      |
| **Motivo**     | NC-MED-006: Sem breadcrumbs consistentes                |
| **Benefício**  | Navegação melhorada                                     |
| **Impacto**    | UX                                                      |
| **Prioridade** | P2                                                      |
| **Domínio**    | 05 — Frontend                                           |
| **Critério**   | Melhoria de UX                                          |

### BEP-032: Padronizar Logger em Hooks

| Campo          | Valor                                     |
| -------------- | ----------------------------------------- |
| **Título**     | Adicionar $app.logger() em todos os hooks |
| **Descrição**  | Auditar hooks sem logging estruturado     |
| **Motivo**     | NC-MED-004: Hooks sem logger              |
| **Benefício**  | Diagnóstico de falhas                     |
| **Impacto**    | Operação, Manutenção                      |
| **Prioridade** | P1                                        |
| **Domínio**    | 04 — Backend                              |
| **Critério**   | Simplificação operacional                 |

### BEP-033: Implementar SPED

| Campo          | Valor                                              |
| -------------- | -------------------------------------------------- |
| **Título**     | Hook que gera arquivos SPED Fiscal e Contribuições |
| **Descrição**  | Gerar e validar arquivos SPED                      |
| **Motivo**     | NC-HIGH-012: Sem SPED                              |
| **Benefício**  | Conformidade fiscal                                |
| **Impacto**    | Fiscal                                             |
| **Prioridade** | P2                                                 |
| **Domínio**    | 10 — Fiscal                                        |
| **Critério**   | Vantagem competitiva                               |

### BEP-034: Monitorar Custo de IA

| Campo          | Valor                                             |
| -------------- | ------------------------------------------------- |
| **Título**     | Hook que rastreia consumo de $ai.chat e $ai.embed |
| **Descrição**  | Tracking de créditos do Skip AI Gateway           |
| **Motivo**     | NC-MED-019: Sem monitoramento de custo            |
| **Benefício**  | Custos de IA controlados                          |
| **Impacto**    | IA, Financeiro                                    |
| **Prioridade** | P2                                                |
| **Domínio**    | 15 — TI/IA                                        |
| **Critério**   | Simplificação operacional                         |

### BEP-035: Unique Index em CNPJ/CPF

| Campo          | Valor                                                  |
| -------------- | ------------------------------------------------------ |
| **Título**     | Adicionar unique index em campos CNPJ/CPF              |
| **Descrição**  | Migration com unique index nas collections de cadastro |
| **Motivo**     | NC-LOW-002: Sem validação de duplicado                 |
| **Benefício**  | Prevenir duplicação de registros                       |
| **Impacto**    | Cadastros                                              |
| **Prioridade** | P2                                                     |
| **Domínio**    | 06 — Cadastros                                         |
| **Critério**   | Redução de débito técnico                              |

---

## 4. Resumo por Prioridade

| Prioridade | Quantidade | IDs                                                                                                                                            |
| ---------- | :--------: | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| P0         |     4      | BEP-001, BEP-002, BEP-005, BEP-025                                                                                                             |
| P1         |     16     | BEP-003, BEP-004, BEP-006, BEP-007, BEP-010, BEP-018, BEP-019, BEP-020, BEP-021, BEP-022, BEP-023, BEP-026, BEP-027, BEP-028, BEP-029, BEP-032 |
| P2         |     11     | BEP-008, BEP-011, BEP-012, BEP-013, BEP-015, BEP-024, BEP-030, BEP-031, BEP-033, BEP-034, BEP-035                                              |
| P3         |     4      | BEP-009, BEP-014, BEP-016, BEP-017                                                                                                             |
| **Total**  |   **35**   |                                                                                                                                                |

---

## 5. Resumo por Domínio

| Domínio             | Quantidade | IDs                                                                             |
| ------------------- | :--------: | ------------------------------------------------------------------------------- |
| 01 — Arquitetura    |     5      | BEP-005, BEP-009, BEP-010, BEP-011, BEP-016                                     |
| 02 — Banco de Dados |     8      | BEP-002, BEP-003, BEP-004, BEP-007, BEP-008, BEP-013, BEP-014, BEP-015, BEP-017 |
| 03 — Segurança      |     3      | BEP-001, BEP-005, BEP-006                                                       |
| 04 — Backend        |     3      | BEP-018, BEP-019, BEP-032                                                       |
| 05 — Frontend       |     2      | BEP-030, BEP-031                                                                |
| 06 — Cadastros      |     1      | BEP-035                                                                         |
| 09 — Financeiro     |     1      | BEP-019                                                                         |
| 10 — Fiscal         |     2      | BEP-018, BEP-033                                                                |
| 12 — Indústria      |     3      | BEP-025, BEP-026, BEP-027                                                       |
| 14 — BI             |     3      | BEP-028, BEP-029, BEP-030                                                       |
| 15 — TI/IA          |     7      | BEP-012, BEP-020, BEP-021, BEP-022, BEP-023, BEP-024, BEP-034                   |

---

## 6. Regras de Governança

1. **Registro apenas durante certificação:** Itens são registrados exclusivamente durante a auditoria de domínios.
2. **Sem implementação durante certificação:** A certificação é exclusivamente auditoria.
3. **Fonte única de verdade:** Após a certificação, este backlog é a única fonte oficial.
4. **Critério de valor obrigatório:** Todo item deve atender pelo menos um dos 10 critérios.
5. **Priorização:** P0 primeiro, depois P1, P2, P3. Dependências devem ser respeitadas.
6. **Nenhuma implementação sem item correspondente:** Se não está aqui, não deve ser feito.

---

_Este backlog é a ponte entre a certificação (auditoria) e a implementação (execução). Cada item existe porque resolve um problema real identificado por evidência técnica._
