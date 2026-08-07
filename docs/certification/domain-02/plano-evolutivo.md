# Plano Evolutivo — Domínio 02

> **Domínio:** 02 — Banco de Dados, Collections, Relacionamentos e Migrations
> **Data:** 2026-08-07
> **Framework:** FCP-MODULAR v1.0

---

## Critério de Inclusão

Apenas melhorias que agregam valor real ao negócio, baseadas em evidência e análise técnica.

---

## Quick Wins (≤ 1 semana)

### EV-01: Schema Versioning Automático

| Atributo      | Valor                                                              |
| ------------- | ------------------------------------------------------------------ |
| **Benefício** | Rastrear mudanças de schema entre versões                          |
| **Esforço**   | Baixo (1-2 dias)                                                   |
| **Impacto**   | Mantabilidade e auditoria                                          |
| **Evidência** | Não há snapshot versionado do schema além dos arquivos de migração |

**Ação:** Criar hook de boot que exporta o schema vivo para um arquivo JSON versionado a cada mudança detectada.

---

### EV-02: Documentação Automática de Collections

| Atributo      | Valor                                                       |
| ------------- | ----------------------------------------------------------- |
| **Benefício** | Facilitar onboarding e auditoria                            |
| **Esforço**   | Baixo (1 dia)                                               |
| **Impacto**   | Mantabilidade                                               |
| **Evidência** | 120+ collections sem documentação centralizada de propósito |

**Ação:** Gerar documento Markdown listando todas as collections, campos, tipos, índices e regras a partir do schema vivo.

---

## Curto Prazo (1-3 meses)

### EV-03: Testes de Migração em CI/CD

| Atributo      | Valor                                             |
| ------------- | ------------------------------------------------- |
| **Benefício** | Detectar regressões de schema antes do deploy     |
| **Esforço**   | Médio (1-2 semanas)                               |
| **Impacto**   | Qualidade e prevenção de bugs                     |
| **Evidência** | NC-HIGH-002: sem testes automatizados de migração |

**Ação:** Criar pipeline CI/CD que: (1) aplica migrações em banco de teste, (2) verifica schema resultante, (3) valida regras de acesso, (4) roda queries de smoke test.

---

### EV-04: Rota de Verificação de Integridade de Schema

| Atributo      | Valor                                                     |
| ------------- | --------------------------------------------------------- |
| **Benefício** | Detectar drift entre migrations e schema vivo             |
| **Esforço**   | Médio (1 semana)                                          |
| **Impacto**   | Prevenção de inconsistências                              |
| **Evidência** | NC-CRIT-003 demonstra que gaps podem passar despercebidos |

**Ação:** Criar rota `/backend/v1/schema/verify` que compara schema esperado (migrations) com schema vivo e retorna divergências.

---

### EV-05: Índices Automatizados por Análise de Uso

| Atributo      | Valor                                            |
| ------------- | ------------------------------------------------ |
| **Benefício** | Performance otimizada baseada em uso real        |
| **Esforço**   | Médio (1-2 semanas)                              |
| **Impacto**   | Performance                                      |
| **Evidência** | NC-HIGH-001: índices ausentes em campos críticos |

**Ação:** Implementar análise de query logs para identificar campos mais filtrados e criar índices automaticamente (com aprovação).

---

## Médio Prazo (3-6 meses)

### EV-06: Migração para Read Replicas (Preparação)

| Atributo      | Valor                                                                      |
| ------------- | -------------------------------------------------------------------------- |
| **Benefício** | Isolar carga analítica de transacional                                     |
| **Esforço**   | Alto (3-4 semanas)                                                         |
| **Impacto**   | Performance e escalabilidade                                               |
| **Evidência** | ADR-009 define observabilidade; relatórios pesados competem com transações |

**Ação:** Preparar camada de abstração que permite direcionar queries de relatório para réplica read-only.

---

### EV-07: Data Retention Policy Automatizada

| Atributo      | Valor                                                                                   |
| ------------- | --------------------------------------------------------------------------------------- |
| **Benefício** | Controlar crescimento do banco                                                          |
| **Esforço**   | Médio (2 semanas)                                                                       |
| **Impacto**   | Performance e custo                                                                     |
| **Evidência** | Collections como audit_logs, api_request_logs, integration_logs crescem indefinidamente |

**Ação:** Definir política de retenção por collection (ex: audit_logs = 5 anos, api_request_logs = 90 dias) e implementar purge automático.

---

## Longo Prazo (6-12 meses)

### EV-08: Migração para Banco Dedicado por Tenant

| Atributo      | Valor                                          |
| ------------- | ---------------------------------------------- |
| **Benefício** | Isolamento superior para Enterprise            |
| **Esforço**   | Muito alto (2-3 meses)                         |
| **Impacto**   | Escalabilidade e segurança                     |
| **Evidência** | ADR-001 prevê migração para instância dedicada |

**Ação:** Implementar camada de abstração de dados que permite trocar entre banco compartilhado e dedicado por configuração.

---

## Análise de Valor de Negócio

| Melhoria                    | Produtividade | Valor | Redução Manual |  UX   | Financeiro | Comercial | Risco |
| --------------------------- | :-----------: | :---: | :------------: | :---: | :--------: | :-------: | :---: |
| EV-01 Schema versioning     |     Médio     | Alto  |     Baixo      | Baixo |   Baixo    |   Baixo   | Alto  |
| EV-02 Doc de collections    |     Alto      | Médio |      Alto      | Baixo |   Baixo    |   Baixo   | Médio |
| EV-03 Testes de migração    |     Médio     | Alto  |      Alto      | Baixo |   Médio    |   Baixo   | Alto  |
| EV-04 Verificação de schema |     Médio     | Alto  |      Alto      | Baixo |   Médio    |   Baixo   | Alto  |
| EV-06 Read replicas         |     Baixo     | Alto  |     Baixo      | Médio |    Alto    |   Baixo   | Alto  |
| EV-07 Data retention        |     Baixo     | Médio |      Alto      | Baixo |    Alto    |   Baixo   | Médio |
