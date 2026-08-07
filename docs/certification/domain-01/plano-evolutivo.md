# Plano Evolutivo — Domínio 01

> **Domínio:** 01 — Arquitetura e Plataforma Core
> **Data:** 2026-08-07
> **Framework:** FCP-MODULAR v1.0

---

## Critério de Inclusão

Apenas melhorias que agregam valor real ao negócio, baseadas em evidência e análise técnica. Entradas artificiais não são incluídas.

---

## Quick Wins (≤ 1 semana)

### EV-01: Cache de Permissões no Frontend

| Atributo      | Valor                                                                           |
| ------------- | ------------------------------------------------------------------------------- |
| **Benefício** | Reduz chamadas de API e melhora tempo de renderização                           |
| **Esforço**   | Baixo (2-3 dias)                                                                |
| **Impacto**   | Performance de carregamento de telas                                            |
| **Evidência** | `useAuth()` é chamado em cada componente; permissões recalculadas a cada render |

**Ação:** Criar hook `usePermissions()` com memoização das funções de permissão por role.

---

### EV-02: Validação Automática de Schema

| Atributo      | Valor                                                                             |
| ------------- | --------------------------------------------------------------------------------- |
| **Benefício** | Detectar gaps de schema antes de produção                                         |
| **Esforço**   | Baixo (2 dias)                                                                    |
| **Impacto**   | Qualidade e prevenção de bugs                                                     |
| **Evidência** | NC-CRIT-001 e NC-CRIT-003 poderiam ter sido detectados com validação automatizada |

**Ação:** Criar hook de boot que verifica: (1) todas as collections base têm autodate, (2) todas as collections têm 5 regras RLS, (3) não há gaps de migration.

---

### EV-03: Documentação de Collections no Schema

| Atributo      | Valor                                                       |
| ------------- | ----------------------------------------------------------- |
| **Benefício** | Facilita onboarding e auditoria                             |
| **Esforço**   | Baixo (1 dia)                                               |
| **Impacto**   | Mantabilidade                                               |
| **Evidência** | 120+ collections sem documentação centralizada de propósito |

**Ação:** Gerar documento automático listando todas as collections, campos, tipos e regras a partir do schema vivo.

---

## Curto Prazo (1-3 meses)

### EV-04: Feature Flags Globais

| Atributo      | Valor                                                                |
| ------------- | -------------------------------------------------------------------- |
| **Benefício** | Controle granular de funcionalidades por cliente/plano               |
| **Esforço**   | Médio (1-2 semanas)                                                  |
| **Impacto**   | Flexibilidade comercial e operacional                                |
| **Evidência** | ADR-004 define modularidade com feature flags; implementação parcial |

**Ação:** Criar collection `feature_flags` (key, enabled, scope: global/client/user). Hook no frontend para ler flags e controlar renderização.

---

### EV-05: Dashboard de Saúde da Plataforma

| Atributo      | Valor                                                        |
| ------------- | ------------------------------------------------------------ |
| **Benefício** | Visibilidade proativa de performance, erros e saúde          |
| **Esforço**   | Médio (1-2 semanas)                                          |
| **Impacto**   | Observabilidade e redução de MTTR                            |
| **Evidência** | ADR-009 define observabilidade; não há dashboard consolidado |

**Ação:** Criar dashboard com: uptime, latência p95, taxa de erro, collections sem RLS, migrations pendentes, backups status.

---

### EV-06: Centralização de Validação de Permissões

| Atributo      | Valor                                                         |
| ------------- | ------------------------------------------------------------- |
| **Benefício** | Consistência e manutenibilidade                               |
| **Esforço**   | Médio (1 semana)                                              |
| **Impacto**   | Redução de bugs de permissão                                  |
| **Evidência** | 6 arquivos de permissões separados com padrões inconsistentes |

**Ação:** Consolidar funções de permissão em um único módulo com interface padronizada. Manter compatibilidade com imports existentes.

---

## Médio Prazo (3-6 meses)

### EV-07: Implementar Observabilidade Completa

| Atributo      | Valor                                                                  |
| ------------- | ---------------------------------------------------------------------- |
| **Benefício** | Diagnóstico proativo e decisão baseada em dados                        |
| **Esforço**   | Alto (3-4 semanas)                                                     |
| **Impacto**   | APM, tracing, métricas                                                 |
| **Evidência** | ADR-009 define 5 dimensões de observabilidade; não há APM implementado |

**Ação:** Integrar APM (performance por endpoint), error tracking, tracing distribuído, health checks automatizados.

---

### EV-08: Rota/Hook de Verificação de Integridade do Schema

| Atributo      | Valor                                                                  |
| ------------- | ---------------------------------------------------------------------- |
| **Benefício** | Detectar drift entre migrations e schema vivo                          |
| **Esforço**   | Médio (1-2 semanas)                                                    |
| **Impacto**   | Prevenção de inconsistências                                           |
| **Evidência** | NC-CRIT-003 demonstra que gaps de migration podem passar despercebidos |

**Ação:** Criar rota `/backend/v1/schema/verify` que compara schema esperado (migrations) com schema vivo (PocketBase) e retorna divergências.

---

### EV-09: Separação de Canais Digitais (Preparação)

| Atributo      | Valor                                                                         |
| ------------- | ----------------------------------------------------------------------------- |
| **Benefício** | Habilitar múltiplos canais sem redesenho                                      |
| **Esforço**   | Alto (4-6 semanas)                                                            |
| **Impacto**   | Estratégico — V2+                                                             |
| **Evidência** | ADR-020 define arquitetura multi-canais; implementação atual em projeto único |

**Ação:** Preparar separação conceitual: identificar código compartilhado, criar interfaces de canal, documentar contrato de API entre canal e plataforma.

---

## Longo Prazo (6-12 meses)

### EV-10: Migração para Multi-tenant com Schema Isolado

| Atributo      | Valor                                          |
| ------------- | ---------------------------------------------- |
| **Benefício** | Isolamento superior para clientes Enterprise   |
| **Esforço**   | Muito alto (2-3 meses)                         |
| **Impacto**   | Escalabilidade e segurança                     |
| **Evidência** | ADR-001 prevê migração para instância dedicada |

**Ação:** Implementar camada de abstração de dados que permite trocar entre banco compartilhado e schema dedicado por configuração.

---

### EV-11: Marketplace e APIs Públicas

| Atributo      | Valor                                  |
| ------------- | -------------------------------------- |
| **Benefício** | Ecossistema de extensões               |
| **Esforço**   | Muito alto (3+ meses)                  |
| **Impacto**   | Estratégico — V2+                      |
| **Evidência** | ADR-008 define marketplace com sandbox |

**Ação:** Definir API pública OpenAPI, criar sandbox de plugins, implementar review pipeline.

---

## Análise de Valor de Negócio

| Melhoria               | Produtividade |   Valor    | Redução Manual |  UX   | Financeiro | Comercial  | Risco |
| ---------------------- | :-----------: | :--------: | :------------: | :---: | :--------: | :--------: | :---: |
| EV-01 Cache permissões |     Alto      |   Médio    |     Baixo      | Alto  |   Baixo    |   Baixo    | Baixo |
| EV-02 Validação schema |     Médio     |    Alto    |      Alto      | Baixo |   Médio    |   Baixo    | Alto  |
| EV-04 Feature flags    |     Médio     |    Alto    |     Médio      | Baixo |    Alto    |    Alto    | Médio |
| EV-05 Dashboard saúde  |     Médio     |    Alto    |      Alto      | Médio |   Médio    |   Baixo    | Alto  |
| EV-07 Observabilidade  |     Alto      |    Alto    |      Alto      | Baixo |   Médio    |   Baixo    | Alto  |
| EV-09 Separação canais |     Baixo     | Muito Alto |     Baixo      | Baixo |    Alto    | Muito Alto | Alto  |
