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

Uma oportunidade de melhoria só é registrada neste backlog quando atende **pelo menos um** dos dez critérios oficiais:

| #   | Critério                               | Descrição                                                                    |
| --- | -------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | **Aumento de segurança**               | Reduz risco de acesso não autorizado, vazamento de dados ou não conformidade |
| 2   | **Aumento de escalabilidade**          | Permite que a plataforma cresça sem degradação                               |
| 3   | **Redução de complexidade**            | Simplifica arquitetura, código ou processos                                  |
| 4   | **Redução de débito técnico**          | Paga dívida técnica identificada                                             |
| 5   | **Melhoria de performance**            | Reduz latência, melhora throughput ou tempo de resposta                      |
| 6   | **Melhoria da experiência do usuário** | Simplifica fluxos, reduz cliques, melhora feedback                           |
| 7   | **Automação relevante**                | Elimina trabalho manual repetitivo                                           |
| 8   | **Aumento de produtividade**           | Permite que usuários façam mais em menos tempo                               |
| 9   | **Vantagem competitiva**               | Diferencia a plataforma de concorrentes                                      |
| 10  | **Simplificação operacional**          | Reduz overhead operacional de manutenção                                     |

### 2.2 Regra de Rejeição

Melhorias cosméticas ou de baixo impacto que não atendem nenhum critério acima são **rejeitadas**. Exemplos de rejeição:

- Mudança de cor de botão sem impacto em UX mensurável
- Refatoração sem redução de complexidade ou débito técnico
- Documentação interna sem impacto operacional

### 2.3 Campos Obrigatórios

Cada item do backlog deve conter:

| Campo                   | Descrição                                                |
| ----------------------- | -------------------------------------------------------- |
| **ID**                  | Formato `BEP-NNN` (Backlog Estratégico da Plataforma)    |
| **Título**              | Nome curto e descritivo                                  |
| **Descrição objetiva**  | O que deve ser feito, sem solução prescrita              |
| **Motivo**              | Por que deve ser feito (evidência da certificação)       |
| **Benefício esperado**  | Resultado mensurável esperado                            |
| **Impacto no negócio**  | Área(s) afetada(s)                                       |
| **Prioridade**          | P0 (Crítica), P1 (Alta), P2 (Média), P3 (Baixa)          |
| **Dependências**        | Outros itens ou condições necessárias (quando existirem) |
| **Domínio relacionado** | Domínio certificado que originou a oportunidade          |
| **Critério de valor**   | Qual dos 10 critérios justifica o registro               |
| **Origem**              | NC ou oportunidade da certificação                       |

---

## 3. Itens Registrados

### BEP-001: Completar Regras RLS em Todas as Collections

| Campo                   | Valor                                                                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Título**              | Definir 5 regras RLS em toda collection                                                                                                                                          |
| **Descrição objetiva**  | Auditar todas as collections no schema vivo e definir listRule, viewRule, createRule, updateRule, deleteRule. Collections públicas (CMS, vitrine) devem ter list/view como `""`. |
| **Motivo**              | NC-CRIT-002: Collections com regras `null` bloqueiam acesso de usuários não-superuser                                                                                            |
| **Benefício esperado**  | Usuários autenticados conseguem acessar dados via SDK sem bloqueio                                                                                                               |
| **Impacto no negócio**  | Segurança, Operação                                                                                                                                                              |
| **Prioridade**          | P0                                                                                                                                                                               |
| **Dependências**        | Nenhuma                                                                                                                                                                          |
| **Domínio relacionado** | 01 — Arquitetura e Plataforma Core / 03 — Segurança                                                                                                                              |
| **Critério de valor**   | Aumento de segurança                                                                                                                                                             |
| **Origem**              | NC-CRIT-002 (Domínio 01)                                                                                                                                                         |

---

### BEP-002: Adicionar Campos Autodate em Collections Base

| Campo                   | Valor                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| **Título**              | Garantir autodate (created/updated) em toda collection base                                       |
| **Descrição objetiva**  | Auditar todas as collections base e adicionar campos `created` e `updated` autodate onde ausentes |
| **Motivo**              | NC-CRIT-001: Queries SDK com `sort: '-created'` falham com HTTP 400 em collections sem autodate   |
| **Benefício esperado**  | Sort e filter por created/updated funcionam em todas as collections                               |
| **Impacto no negócio**  | Desenvolvimento, Operação                                                                         |
| **Prioridade**          | P0                                                                                                |
| **Dependências**        | Nenhuma                                                                                           |
| **Domínio relacionado** | 02 — Banco de Dados                                                                               |
| **Critério de valor**   | Redução de débito técnico                                                                         |
| **Origem**              | NC-CRIT-001 (Domínio 02)                                                                          |

---

### BEP-003: Investigar e Documentar Gap de Migration 0037

| Campo                   | Valor                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Título**              | Resolver gap de migration 0037                                                                                      |
| **Descrição objetiva**  | Verificar se collections de 0037 existem no schema vivo, documentar o gap e criar migration corretiva se necessário |
| **Motivo**              | NC-CRIT-003: Migration 0037 não aplicada; salto de 0036 para 0038                                                   |
| **Benefício esperado**  | Histórico de migrações consistente e sem gaps                                                                       |
| **Impacto no negócio**  | Desenvolvimento, Manutenção                                                                                         |
| **Prioridade**          | P1                                                                                                                  |
| **Dependências**        | Nenhuma                                                                                                             |
| **Domínio relacionado** | 02 — Banco de Dados                                                                                                 |
| **Critério de valor**   | Redução de débito técnico                                                                                           |
| **Origem**              | NC-CRIT-003 (Domínio 02)                                                                                            |

---

### BEP-004: Adicionar Índices em Campos de Filter/Sort

| Campo                   | Valor                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Título**              | Criar índices em campos críticos de filter/sort                                                                                      |
| **Descrição objetiva**  | Identificar campos mais filtrados/ordenados (status, created, client_name, product_id, request_number) e criar índices via migration |
| **Motivo**              | NC-HIGH-001: Muitas collections não têm índices, degradando performance                                                              |
| **Benefício esperado**  | Queries com filter/sort retornam em < 100ms                                                                                          |
| **Impacto no negócio**  | Performance, UX                                                                                                                      |
| **Prioridade**          | P1                                                                                                                                   |
| **Dependências**        | BEP-002 (autodate deve existir antes de indexar)                                                                                     |
| **Domínio relacionado** | 02 — Banco de Dados                                                                                                                  |
| **Critério de valor**   | Melhoria de performance                                                                                                              |
| **Origem**              | NC-HIGH-001 (Domínio 02)                                                                                                             |

---

### BEP-005: Implementar MFA para Administradores

| Campo                   | Valor                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| **Título**              | MFA (TOTP) obrigatório para role SUP                                                       |
| **Descrição objetiva**  | Implementar TOTP no backend, tela de setup MFA no frontend e verificação no fluxo de login |
| **Motivo**              | NC-MED-001: Arquitetura define MFA obrigatório para admin; não há implementação            |
| **Benefício esperado**  | Acesso admin requer segunda camada de verificação                                          |
| **Impacto no negócio**  | Segurança                                                                                  |
| **Prioridade**          | P1                                                                                         |
| **Dependências**        | Nenhuma                                                                                    |
| **Domínio relacionado** | 01 — Arquitetura e Plataforma Core / 03 — Segurança                                        |
| **Critério de valor**   | Aumento de segurança                                                                       |
| **Origem**              | NC-MED-001 (Domínio 01)                                                                    |

---

### BEP-006: Implementar Criptografia Campo-a-Campo para Dados LGPD

| Campo                   | Valor                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Título**              | Criptografar CPF, CNPJ e dados bancários em repouso                                                            |
| **Descrição objetiva**  | Auditar campos sensíveis e implementar criptografia via hooks (encrypt on create/update, decrypt on list/view) |
| **Motivo**              | NC-MED-002: ADR-010 define criptografia campo-a-campo; não há implementação                                    |
| **Benefício esperado**  | Dados sensíveis criptografados em repouso                                                                      |
| **Impacto no negócio**  | Segurança, Conformidade LGPD                                                                                   |
| **Prioridade**          | P2                                                                                                             |
| **Dependências**        | Nenhuma                                                                                                        |
| **Domínio relacionado** | 01 — Arquitetura e Plataforma Core / 03 — Segurança                                                            |
| **Critério de valor**   | Aumento de segurança                                                                                           |
| **Origem**              | NC-MED-002 (Domínio 01)                                                                                        |

---

### BEP-007: Implementar Testes de Migração em CI/CD

| Campo                   | Valor                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| **Título**              | Pipeline de validação de migrações                                                                       |
| **Descrição objetiva**  | Criar pipeline CI/CD que aplica migrações em banco de teste, valida schema resultante e roda smoke tests |
| **Motivo**              | NC-HIGH-002: Sem testes automatizados de migração; regressão em toda mudança                             |
| **Benefício esperado**  | Migrações validadas antes do deploy                                                                      |
| **Impacto no negócio**  | Qualidade, Desenvolvimento                                                                               |
| **Prioridade**          | P1                                                                                                       |
| **Dependências**        | Nenhuma                                                                                                  |
| **Domínio relacionado** | 02 — Banco de Dados                                                                                      |
| **Critério de valor**   | Redução de débito técnico                                                                                |
| **Origem**              | NC-HIGH-002 (Domínio 02)                                                                                 |

---

### BEP-008: Auditar e Corrigir Bool Fields com `required: true`

| Campo                   | Valor                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------- |
| **Título**              | Remover `required` de campos bool                                                     |
| **Descrição objetiva**  | Auditar migrações em busca de bool fields com `required: true` e remover a constraint |
| **Motivo**              | NC-MED-001: PocketBase trata `false` como empty; `required` rejeita false             |
| **Benefício esperado**  | Registros com bool=false são criados com sucesso                                      |
| **Impacto no negócio**  | Desenvolvimento                                                                       |
| **Prioridade**          | P2                                                                                    |
| **Dependências**        | Nenhuma                                                                               |
| **Domínio relacionado** | 02 — Banco de Dados                                                                   |
| **Critério de valor**   | Redução de débito técnico                                                             |
| **Origem**              | NC-MED-001 (Domínio 02)                                                               |

---

### BEP-009: Cache de Permissões no Frontend

| Campo                   | Valor                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------ |
| **Título**              | Hook usePermissions com memoização por role                                          |
| **Descrição objetiva**  | Criar hook que memoiza funções de permissão por role, reduzindo recálculos           |
| **Motivo**              | EV-01: useAuth() é chamado em cada componente; permissões recalculadas a cada render |
| **Benefício esperado**  | Reduz chamadas de API e melhora tempo de renderização                                |
| **Impacto no negócio**  | Performance, UX                                                                      |
| **Prioridade**          | P2                                                                                   |
| **Dependências**        | Nenhuma                                                                              |
| **Domínio relacionado** | 01 — Arquitetura e Plataforma Core                                                   |
| **Critério de valor**   | Melhoria de performance                                                              |
| **Origem**              | EV-01 (Domínio 01)                                                                   |

---

### BEP-010: Validação Automática de Schema

| Campo                   | Valor                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Título**              | Hook de boot que verifica integridade do schema                                                                                 |
| **Descrição objetiva**  | Criar validação que verifica: (1) collections base têm autodate, (2) collections têm 5 regras RLS, (3) não há gaps de migration |
| **Motivo**              | EV-02: NC-CRIT-001 e NC-CRIT-003 poderiam ter sido detectados com validação automatizada                                        |
| **Benefício esperado**  | Detectar gaps de schema antes de produção                                                                                       |
| **Impacto no negócio**  | Qualidade, Manutenção                                                                                                           |
| **Prioridade**          | P1                                                                                                                              |
| **Dependências**        | BEP-002, BEP-003                                                                                                                |
| **Domínio relacionado** | 01 — Arquitetura e Plataforma Core / 02 — Banco de Dados                                                                        |
| **Critério de valor**   | Aumento de segurança                                                                                                            |
| **Origem**              | EV-02 (Domínio 01) / EV-04 (Domínio 02)                                                                                         |

---

### BEP-011: Feature Flags Globais

| Campo                   | Valor                                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Título**              | Collection feature_flags + hook de controle                                                                       |
| **Descrição objetiva**  | Criar collection `feature_flags` (key, enabled, scope) e hook no frontend para ler flags e controlar renderização |
| **Motivo**              | EV-04: ADR-004 define modularidade com feature flags; implementação parcial                                       |
| **Benefício esperado**  | Controle granular de funcionalidades por cliente/plano                                                            |
| **Impacto no negócio**  | Comercial, Operação                                                                                               |
| **Prioridade**          | P2                                                                                                                |
| **Dependências**        | Nenhuma                                                                                                           |
| **Domínio relacionado** | 01 — Arquitetura e Plataforma Core                                                                                |
| **Critério de valor**   | Aumento de escalabilidade                                                                                         |
| **Origem**              | EV-04 (Domínio 01)                                                                                                |

---

### BEP-012: Dashboard de Saúde da Plataforma

| Campo                   | Valor                                                               |
| ----------------------- | ------------------------------------------------------------------- |
| **Título**              | Dashboard com uptime, latência, erros, collections sem RLS          |
| **Descrição objetiva**  | Criar dashboard consolidado com indicadores de saúde da plataforma  |
| **Motivo**              | EV-05: ADR-009 define observabilidade; não há dashboard consolidado |
| **Benefício esperado**  | Visibilidade proativa de performance e erros                        |
| **Impacto no negócio**  | Operação, Manutenção                                                |
| **Prioridade**          | P2                                                                  |
| **Dependências**        | BEP-010                                                             |
| **Domínio relacionado** | 01 — Arquitetura e Plataforma Core                                  |
| **Critério de valor**   | Simplificação operacional                                           |
| **Origem**              | EV-05 (Domínio 01)                                                  |

---

### BEP-013: Rota de Verificação de Integridade de Schema

| Campo                   | Valor                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| **Título**              | Endpoint /backend/v1/schema/verify                                                         |
| **Descrição objetiva**  | Criar rota que compara schema esperado (migrations) com schema vivo e retorna divergências |
| **Motivo**              | EV-04: NC-CRIT-003 demonstra que gaps podem passar despercebidos                           |
| **Benefício esperado**  | Detectar drift entre migrations e schema vivo                                              |
| **Impacto no negócio**  | Qualidade, Manutenção                                                                      |
| **Prioridade**          | P2                                                                                         |
| **Dependências**        | Nenhuma                                                                                    |
| **Domínio relacionado** | 02 — Banco de Dados                                                                        |
| **Critério de valor**   | Simplificação operacional                                                                  |
| **Origem**              | EV-04 (Domínio 02)                                                                         |

---

### BEP-014: Schema Versioning Automático

| Campo                   | Valor                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| **Título**              | Exportação versionada do schema vivo                                                       |
| **Descrição objetiva**  | Criar hook de boot que exporta o schema vivo para JSON versionado a cada mudança detectada |
| **Motivo**              | EV-01: Não há snapshot versionado do schema além dos arquivos de migração                  |
| **Benefício esperado**  | Rastrear mudanças de schema entre versões                                                  |
| **Impacto no negócio**  | Manutenção, Auditoria                                                                      |
| **Prioridade**          | P3                                                                                         |
| **Dependências**        | Nenhuma                                                                                    |
| **Domínio relacionado** | 02 — Banco de Dados                                                                        |
| **Critério de valor**   | Redução de complexidade                                                                    |
| **Origem**              | EV-01 (Domínio 02)                                                                         |

---

### BEP-015: Data Retention Policy Automatizada

| Campo                   | Valor                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Título**              | Política de retenção por collection com purge automático                                                   |
| **Descrição objetiva**  | Definir retenção por collection (audit_logs=5 anos, api_request_logs=90 dias) e implementar purge via cron |
| **Motivo**              | EV-07: Collections como audit_logs, api_request_logs crescem indefinidamente                               |
| **Benefício esperado**  | Controlar crescimento do banco                                                                             |
| **Impacto no negócio**  | Performance, Custo                                                                                         |
| **Prioridade**          | P2                                                                                                         |
| **Dependências**        | Nenhuma                                                                                                    |
| **Domínio relacionado** | 02 — Banco de Dados                                                                                        |
| **Critério de valor**   | Melhoria de performance                                                                                    |
| **Origem**              | EV-07 (Domínio 02)                                                                                         |

---

### BEP-016: Centralização de Validação de Permissões

| Campo                   | Valor                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| **Título**              | Consolidar funções de permissão em módulo único                                               |
| **Descrição objetiva**  | Unificar 6 arquivos de permissões separados em interface padronizada mantendo compatibilidade |
| **Motivo**              | EV-06: 6 arquivos de permissões com padrões inconsistentes                                    |
| **Benefício esperado**  | Consistência e manutenibilidade                                                               |
| **Impacto no negócio**  | Desenvolvimento                                                                               |
| **Prioridade**          | P3                                                                                            |
| **Dependências**        | Nenhuma                                                                                       |
| **Domínio relacionado** | 01 — Arquitetura e Plataforma Core                                                            |
| **Critério de valor**   | Redução de complexidade                                                                       |
| **Origem**              | EV-06 (Domínio 01)                                                                            |

---

### BEP-017: Documentação Automática de Collections

| Campo                   | Valor                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| **Título**              | Gerar doc Markdown de collections a partir do schema vivo                                           |
| **Descrição objetiva**  | Criar script/hook que gera documento listando todas as collections, campos, tipos, índices e regras |
| **Motivo**              | EV-02: 120+ collections sem documentação centralizada de propósito                                  |
| **Benefício esperado**  | Facilitar onboarding e auditoria                                                                    |
| **Impacto no negócio**  | Manutenção                                                                                          |
| **Prioridade**          | P3                                                                                                  |
| **Dependências**        | Nenhuma                                                                                             |
| **Domínio relacionado** | 02 — Banco de Dados                                                                                 |
| **Critério de valor**   | Aumento de produtividade                                                                            |
| **Origem**              | EV-02 (Domínio 02)                                                                                  |

---

## 4. Resumo por Prioridade

| Prioridade | Quantidade | IDs                                                  |
| ---------- | :--------: | ---------------------------------------------------- |
| P0         |     2      | BEP-001, BEP-002                                     |
| P1         |     4      | BEP-003, BEP-005, BEP-007, BEP-010                   |
| P2         |     6      | BEP-004, BEP-006, BEP-008, BEP-011, BEP-012, BEP-015 |
| P3         |     5      | BEP-009, BEP-013, BEP-014, BEP-016, BEP-017          |
| **Total**  |   **17**   |                                                      |

---

## 5. Resumo por Domínio Relacionado

| Domínio                            | Quantidade | IDs                                                                             |
| ---------------------------------- | :--------: | ------------------------------------------------------------------------------- |
| 01 — Arquitetura e Plataforma Core |     8      | BEP-001, BEP-005, BEP-006, BEP-009, BEP-010, BEP-011, BEP-012, BEP-016          |
| 02 — Banco de Dados                |     8      | BEP-002, BEP-003, BEP-004, BEP-007, BEP-008, BEP-013, BEP-014, BEP-015, BEP-017 |
| 03 — Segurança                     |     3      | BEP-001, BEP-005, BEP-006                                                       |
| (Multi-domínio)                    |     2      | BEP-010, BEP-013                                                                |

---

## 6. Resumo por Critério de Valor

| Critério                  | Quantidade |
| ------------------------- | :--------: |
| Aumento de segurança      |     4      |
| Redução de débito técnico |     4      |
| Melhoria de performance   |     3      |
| Simplificação operacional |     2      |
| Aumento de escalabilidade |     1      |
| Redução de complexidade   |     2      |
| Aumento de produtividade  |     1      |

---

## 7. Filtro por Domínio

Para filtrar itens por domínio relacionado, use a coluna "Domínio relacionado" na Seção 3.

- **Domínio 01:** BEP-001, BEP-005, BEP-006, BEP-009, BEP-010, BEP-011, BEP-012, BEP-016
- **Domínio 02:** BEP-002, BEP-003, BEP-004, BEP-007, BEP-008, BEP-013, BEP-014, BEP-015, BEP-017
- **Domínio 03:** BEP-001, BEP-005, BEP-006

---

## 8. Regras de Governança

1. **Registro apenas durante certificação:** Itens são registrados exclusivamente durante a auditoria de domínios.
2. **Sem implementação durante certificação:** A certificação é exclusivamente auditoria. Nenhuma alteração de código é feita.
3. **Fonte única de verdade:** Após a certificação, este backlog é a única fonte oficial para implementações.
4. **Critério de valor obrigatório:** Todo item deve atender pelo menos um dos 10 critérios oficiais.
5. **Priorização:** P0 primeiro, depois P1, P2, P3. Dependências devem ser respeitadas.
6. **Atualização contínua:** Novos itens são adicionados conforme novos domínios são certificados.

---

## 9. Gestão deste Documento

- **Tipo:** Documento vivo (living document)
- **Frequência de atualização:** A cada certificação de domínio
- **Responsável:** Architecture Council
- **Aprovação:** Product Owner
- **Rastreabilidade:** Cada item referencia a NC ou oportunidade da certificação

---

_Este backlog é a ponte entre a certificação (auditoria) e a implementação (execução). Cada item existe porque resolve um problema real identificado por evidência técnica. Se não está aqui, não deve ser implementado._
