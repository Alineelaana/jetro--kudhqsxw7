# Plano Evolutivo — Domínio 06

> **Framework:** FCP-MODULAR v1.0

---

## Quick Wins

### EV-01: Importação em Lote de Cadastros

| Benefício | Produtividade no onboarding |
| Esforço | Médio (1 semana) |
| Ação | Criar dialog de importação CSV para cadastros mestres |

## Curto Prazo

### EV-02: Validação Automática de CNPJ via Hook

| Benefício | Dados de cadastro validados |
| Esforço | Baixo (2 dias) |
| Ação | Hook que valida CNPJ via `cnpj_lookup` ao criar transportadora/empresa |

### EV-03: Histórico de Alterações em Cadastros

| Benefício | Rastreabilidade de mudanças |
| Esforço | Médio (1 semana) |
| Ação | Registrar alterações de cadastros em `audit_logs` com diff
