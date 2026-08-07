# Plano Evolutivo — Domínio 10

> **Framework:** FCP-MODULAR v1.0

---

## Curto Prazo

### EV-01: Apuração de Impostos Automatizada

| Benefício | Cálculo automático de ICMS, PIS, COFINS |
| Esforço | Médio (2-3 semanas) |
| Ação | Hook cron que consolida impostos por período |

### EV-02: Manifestação do Destinatário Automática

| Benefício | Conformidade fiscal automatizada |
| Esforço | Baixo (1 semana) |
| Ação | Hook que verifica NF-e de entrada e registra manifestação

## Médio Prazo

### EV-03: Simulador de Reforma Tributária com IA

| Benefício | Análise de impacto tributário preditiva |
| Esforço | Alto (3-4 semanas) |
| Ação | Usar `$ai.chat` para analisar impacto da reforma por produto/operacao
