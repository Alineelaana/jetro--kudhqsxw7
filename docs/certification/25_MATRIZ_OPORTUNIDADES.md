# Matriz de Oportunidades

> **Artifact ID:** MO-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 15

---

## 1. Metodologia de Priorização

**Score = (impacto_usuario × 3 + impacto_negocio × 3 + (6 - esforço) × 2 + urgência × 2 + alinhamento × 2 + reducao_divida × 1)**

Score máximo: 90. Oportunidades com score ≥ 60 são priorizadas para o trimestre atual.

---

## 2. Oportunidades de Correção

| ID      | Oportunidade                        | Módulo      | Impacto User | Impacto Negócio | Esforço | Urgência | Alinhamento | Redução Dívida | Score | Prioridade | Trimestre |
| ------- | ----------------------------------- | ----------- | ------------ | --------------- | ------- | -------- | ----------- | -------------- | ----- | ---------- | --------- |
| OPP-001 | Definir RLS em todas as collections | Security    | 5            | 5               | 1       | 5        | 5           | 5              | 82    | P0         | Q3 2026   |
| OPP-002 | Implementar MFA para admin          | Security    | 4            | 5               | 3       | 5        | 5           | 4              | 70    | P0         | Q3 2026   |
| OPP-003 | Criptografia campo-a-campo (LGPD)   | Security    | 3            | 5               | 3       | 5        | 5           | 4              | 68    | P0         | Q3 2026   |
| OPP-004 | Investigar gap de migração 0037     | Migrations  | 2            | 5               | 1       | 5        | 4           | 4              | 64    | P0         | Q3 2026   |
| OPP-005 | Implementar rate limiting           | Scalability | 3            | 4               | 2       | 4        | 4           | 4              | 61    | P1         | Q3 2026   |
| OPP-006 | Definir Skip Cloud Agent            | AI          | 4            | 4               | 3       | 4        | 5           | 3              | 63    | P1         | Q3 2026   |
| OPP-007 | Fechar gaps de permissão            | Permissions | 3            | 4               | 3       | 4        | 4           | 4              | 58    | P1         | Q3 2026   |
| OPP-008 | Implementar APM/observability       | Performance | 3            | 4               | 3       | 4        | 4           | 4              | 58    | P1         | Q3 2026   |
| OPP-009 | Criar production_orders collection  | Industry    | 3            | 4               | 3       | 4        | 4           | 4              | 58    | P1         | Q3 2026   |
| OPP-010 | Adicionar índices de banco          | Database    | 3            | 4               | 2       | 3        | 4           | 4              | 55    | P1         | Q4 2026   |
| OPP-011 | Implementar MRP calculation hook    | Industry    | 3            | 4               | 3       | 3        | 4           | 3              | 54    | P1         | Q4 2026   |
| OPP-012 | Implementar caching layer           | Scalability | 3            | 4               | 3       | 3        | 4           | 4              | 54    | P1         | Q4 2026   |
| OPP-013 | Implementar RAG/vector search       | AI          | 3            | 4               | 3       | 3        | 4           | 3              | 54    | P1         | Q4 2026   |

## 3. Oportunidades de Melhoria

| ID      | Oportunidade                      | Módulo      | Impacto User | Impacto Negócio | Esforço | Urgência | Alinhamento | Redução Dívida | Score | Prioridade | Trimestre |
| ------- | --------------------------------- | ----------- | ------------ | --------------- | ------- | -------- | ----------- | -------------- | ----- | ---------- | --------- |
| OPP-014 | Implementar test suite frontend   | Frontend    | 2            | 4               | 3       | 3        | 4           | 4              | 51    | P2         | Q4 2026   |
| OPP-015 | Implementar SEFAZ integration     | Fiscal      | 2            | 5               | 5       | 3        | 4           | 3              | 49    | P2         | Q4 2026   |
| OPP-016 | Implementar bank integration      | Financial   | 2            | 4               | 5       | 3        | 4           | 3              | 46    | P2         | Q4 2026   |
| OPP-017 | Auditar hooks para scoping        | Backend     | 2            | 3               | 2       | 3        | 3           | 4              | 45    | P2         | Q4 2026   |
| OPP-018 | Padronizar error logging em hooks | Hooks       | 2            | 3               | 2       | 2        | 3           | 3              | 42    | P2         | Q4 2026   |
| OPP-019 | Visual automation builder         | Automations | 4            | 4               | 5       | 2        | 4           | 2              | 42    | P2         | Q1 2027   |
| OPP-020 | Centralizar BI/analytics          | BI          | 3            | 4               | 5       | 2        | 4           | 3              | 42    | P2         | Q1 2027   |
| OPP-021 | Implementar SPED generation       | Fiscal      | 1            | 4               | 5       | 2        | 4           | 3              | 39    | P2         | Q1 2027   |
| OPP-022 | Bloqueio de estoque negativo      | Stock       | 2            | 3               | 2       | 2        | 3           | 3              | 39    | P2         | Q1 2027   |
| OPP-023 | Gestão de certificados digitais   | Fiscal      | 1            | 4               | 3       | 2        | 4           | 3              | 38    | P2         | Q1 2027   |

## 4. Oportunidades de Evolução

| ID      | Oportunidade                    | Módulo        | Impacto User | Impacto Negócio | Esforço | Urgência | Alinhamento | Redução Dívida | Score | Prioridade | Trimestre |
| ------- | ------------------------------- | ------------- | ------------ | --------------- | ------- | -------- | ----------- | -------------- | ----- | ---------- | --------- |
| OPP-024 | Gerar documentação OpenAPI      | APIs          | 2            | 3               | 2       | 2        | 3           | 2              | 35    | P3         | Q1 2027   |
| OPP-025 | Implementar webhook management  | Integrations  | 2            | 3               | 3       | 2        | 3           | 3              | 35    | P3         | Q1 2027   |
| OPP-026 | Expandir self-service do portal | Client Portal | 3            | 3               | 3       | 2        | 3           | 2              | 35    | P3         | Q1 2027   |
| OPP-027 | Tracking de ROI de campanhas    | Campaigns     | 2            | 3               | 3       | 2        | 3           | 2              | 35    | P3         | Q2 2027   |
| OPP-028 | Barcode/RFID para WMS           | WMS           | 3            | 3               | 5       | 2        | 3           | 2              | 33    | P3         | Q2 2027   |
| OPP-029 | Lead scoring automatizado       | CRM           | 2            | 3               | 3       | 2        | 3           | 2              | 32    | P3         | Q2 2027   |
| OPP-030 | Session timeout configurável    | Security      | 2            | 3               | 2       | 2        | 3           | 3              | 32    | P3         | Q2 2027   |
| OPP-031 | Breadcrumbs consistentes        | Navigation    | 2            | 2               | 2       | 2        | 2           | 2              | 28    | P3         | Q2 2027   |
| OPP-032 | Multi-language support          | Scalability   | 2            | 3               | 4       | 1        | 3           | 1              | 26    | P3         | Q3 2027   |
| OPP-033 | GPS real integration            | Logistics     | 2            | 3               | 3       | 1        | 3           | 1              | 26    | P3         | Q3 2027   |
| OPP-034 | A/B testing para CMS            | Marketing     | 2            | 2               | 3       | 1        | 2           | 1              | 22    | P3         | Q3 2027   |

## 5. Oportunidades Arquiteturais

| ID      | Oportunidade                        | Descrição                                                             | Horizonte |
| ------- | ----------------------------------- | --------------------------------------------------------------------- | --------- |
| OPP-035 | Separação física de Canais Digitais | Migrar VeloraLog para projeto separado quando infraestrutura permitir | V2        |
| OPP-036 | Read replicas para relatórios       | Isolar carga analítica de transacional                                | V2+       |
| OPP-037 | Marketplace de plugins              | Ativar sandbox e APIs públicas                                        | V2+       |
| OPP-038 | COMEX corporativo                   | Módulo de Comércio Exterior para Trading/Distribuidores               | V2+       |
| OPP-039 | Master Portal                       | Painel de gestão da plataforma                                        | V2        |
| OPP-040 | IA preditiva                        | Previsão de vendas, estoque, caixa                                    | V1+       |
| OPP-041 | IA prescritiva                      | Sugestões de ação com justificativa                                   | V2+       |
| OPP-042 | White label completo                | Branding, domínio, templates por parceiro                             | V2        |
| OPP-043 | App mobile nativo                   | Aplicativo para gestão e cliente                                      | V2+       |
| OPP-044 | Marketplace de IA                   | Modelos de IA especializados por setor                                | V3+       |

## 6. Distribuição Trimestral

| Trimestre | P0    | P1    | P2     | P3     | Total  |
| --------- | ----- | ----- | ------ | ------ | ------ |
| Q3 2026   | 4     | 2     | 0      | 0      | 6      |
| Q4 2026   | 0     | 6     | 6      | 0      | 12     |
| Q1 2027   | 0     | 0     | 6      | 3      | 9      |
| Q2 2027   | 0     | 0     | 0      | 4      | 4      |
| Q3 2027   | 0     | 0     | 0      | 3      | 3      |
| **Total** | **4** | **8** | **12** | **10** | **34** |

## 7. Resumo

| Categoria     | Quantidade |
| ------------- | ---------- |
| Correções     | 13         |
| Melhorias     | 10         |
| Evoluções     | 11         |
| Arquiteturais | 10         |
| **Total**     | **44**     |

---

_End of Matriz de Oportunidades._
