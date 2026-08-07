# Plano Evolutivo — Domínio 03

> **Domínio:** 03 — Segurança, Autenticação, Permissões, Auditoria e LGPD
> **Framework:** FCP-MODULAR v1.0

---

## Quick Wins

### EV-01: Detecção Automática de RLS null

| Benefício | Detectar collections sem RLS antes de produção |
| Esforço | Baixo (2 dias) |
| **Ação** | Criar rota `/backend/v1/schema/verify` que lista collections com regras null |

### EV-02: Log de Acesso Negado

| Benefício | Visibilidade de tentativas de acesso negado |
| Esforço | Baixo (1-2 dias) |
| **Ação** | Hook que registra tentativas de acesso negado em `audit_logs` |

## Curto Prazo

### EV-03: Políticas de Senha Configuráveis

| Benefício | Reforço de senhas por role |
| Esforço | Médio (1 semana) |
| **Ação** | Configurar minLength, complexidade, rotação por role |

### EV-04: Consentimento LGPD Explícito

| Benefício | Conformidade LGPD aprimorada |
| Esforço | Baixo (2-3 dias) |
| **Ação** | Tela de consentimento explícito com log em `audit_logs` |

## Médio Prazo

### EV-05: Auditoria com IA Preditiva

| Benefício | Detecção proativa de anomalias de acesso |
| Esforço | Alto (3-4 semanas) |
| **Ação** | Usar `$ai.chat` para analisar padrões de acesso em `audit_logs` e gerar alertas |

### EV-06: Rota de Direito ao Esquecimento (LGPD)

| Benefício | Conformidade LGPD Art. 18 |
| Esforço | Médio (2 semanas) |
| **Ação** | Endpoint que anonimiza dados pessoais de um usuário mediante solicitação |
