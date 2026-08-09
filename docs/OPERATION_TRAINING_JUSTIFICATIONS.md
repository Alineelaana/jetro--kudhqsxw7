# Treinamento Operacional: Registro de Justificativas

## Objetivo

Este documento orienta a operação sobre como registrar justificativas consistentes nos fluxos de **Vínculo/Desvínculo de CNPJ da Rede** e **Restrição/Liberação de Crédito** (incluindo aprovação excepcional).

> **Regra de ouro:** Toda ação sobre Redes/Grupos Econômicos e restrições financeiras DEVE ter uma justificativa registrada. O sistema exige a justificativa no servidor (backend) — nunca apenas na interface.

---

## 1. Vínculo/Desvínculo de Cliente a uma Rede/Grupo Econômico

### Quando é obrigatório

Sempre que um cliente (parceiro) for **vinculado**, **desvinculado** ou **trocado** de Rede/Grupo Econômico, o sistema exige:

1. **Permissão adequada** — Apenas perfis `SUP`, `FINANCEIRO` e `COMERCIAL` podem vincular/desvincular.
2. **Justificativa obrigatória** — O campo `justification` não pode estar vazio.

### Como registrar uma justificativa adequada

| Situação                           | Exemplo de Justificativa                                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Vínculo por mesma propriedade      | "Cliente pertence ao mesmo grupo econômico controlado por João Silva (CPF xxx), conforme contrato social." |
| Vínculo por fusão/aquisição        | "Empresa adquirida pelo Grupo Alfa em 01/08/2026, conforme documento de fusão arquivado."                  |
| Vínculo por endereço compartilhado | "Endereço fiscal e logístico idêntico ao CNPJ principal da rede, confirmado via consulta."                 |
| Desvínculo por saída do grupo      | "Cliente encerrou relação comercial com a rede, conforme comunicado oficial em 10/08/2026."                |
| Desvínculo por erro de cadastro    | "Vínculo realizado incorretamente em cadastro anterior. Cliente não pertence ao grupo econômico."          |
| Troca de rede                      | "Cliente migrou do Grupo Alfa para o Grupo Beta após reestruturação societária."                           |

### Regras

- **Nunca** use justificativas genéricas como "Ajuste", "Correção" ou "Teste".
- Inclua **data**, **motivo** e, quando aplicável, **documento de referência**.
- A justificativa é **imutável** após o registro — fica gravada no log de auditoria permanentemente.

---

## 2. Restrição/Liberação de Crédito

### 2.1 Aplicação de Restrição Financeira

Quando um cliente tem inadimplência ou outra razão financeira justifica a restrição:

| Situação                      | Exemplo de Justificativa                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Inadimplência própria         | "Cliente possui R$ 12.500,00 em títulos vencidos há mais de 30 dias. Títulos: TR-2026-0001, TR-2026-0002." |
| Restrição por grupo econômico | "Restrição propagada do membro originador 'Distribuidora Alfa' — R$ 45.000,00 vencidos há 45 dias."        |
| Suspensão judicial            | "Decisão judicial determinou bloqueio de crédito, processo nº 0001234-56.2026."                            |
| Política comercial            | "Cliente em regime especial de pagamento antecipado conforme acordo comercial 2026-08."                    |

### 2.2 Liberação de Restrição

| Situação                        | Exemplo de Justificativa                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| Regularização de dívida         | "Cliente regularizou todos os títulos vencidos em 10/08/2026. Baixa confirmada pelo financeiro." |
| Liberação parcial               | "Liberação parcial mediante acordo de parcelamento — 50% pago, saldo em 3x."                     |
| Liberação por decisão comercial | "Liberação autorizada pelo diretor comercial (Sr. Carlos) mediante garantia de imóvel."          |
| Liberação automática (sistema)  | "Dívida responsável regularizada — reavaliação automática da Rede executada pelo sistema."       |

### 2.3 Aprovação Excepcional

Quando a decisão de crédito requer aprovação (política `require_approval`):

| Situação                             | Exemplo de Justificativa                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Aprovação de crédito acima do limite | "Aprovação excepcional para pedido de R$ 80.000,00 — limite da rede R$ 75.000,00. Autorizado pelo Diretor Financeiro." |
| Liberação com condição               | "Aprovado mediante apresentação de garantia bancária equivalente a 120% do valor do pedido."                           |
| Reprovação                           | "Reprovado — cliente já possui 2 restrições ativas no grupo econômico, totalizando R$ 95.000,00 em atraso."            |

---

## 3. Auditoria — O Que é Registrado

Toda ação sobre Redes e Restrições gera um registro de auditoria (`audit_logs`) contendo:

| Campo               | Descrição                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| `user_id`           | ID do usuário que executou a ação                                                                   |
| `user_name`         | Nome do usuário                                                                                     |
| `user_role`         | Perfil do usuário (SUP, FINANCEIRO, COMERCIAL, etc.)                                                |
| `action`            | Tipo da ação (ex: `network_created`, `network_restriction_applied`, `network_restriction_released`) |
| `module`            | Módulo de origem (Cadastros, Financeiro)                                                            |
| `target_collection` | Collection afetada (`client_networks`, `partners`)                                                  |
| `target_id`         | ID do registro afetado                                                                              |
| `target_summary`    | Nome/resumo do registro                                                                             |
| `new_value`         | Dados da alteração (JSON)                                                                           |
| `criticidade`       | Baixa, Média, Alta ou Crítica                                                                       |
| `origem`            | Área da Empresa, Automação, Inteligência Artificial, etc.                                           |
| `justification`     | Justificativa fornecida pelo usuário                                                                |
| `is_suspicious`     | true se a ação foi bloqueada por falta de permissão                                                 |
| `created`           | Data e hora do registro                                                                             |

### Origem da Ação

O campo `origem` identifica de onde veio a ação:

- **Área da Empresa** — Ação manual de um usuário autenticado
- **Automação** — Executada automaticamente pelo sistema (ex: liberação automática após regularização)
- **Inteligência Artificial** — Ação sugerida ou executada por IA

---

## 4. Checklist de Boas Práticas

1. [ ] Sempre preencha a justificativa antes de confirmar a ação
2. [ ] Inclua valores, datas e números de documento na justificativa
3. [ ] Nunca use justificativas genéricas ("Ajuste", "Teste", "Correção")
4. [ ] Verifique se a justificativa fica clara para um auditor externo
5. [ ] Para ações automáticas do sistema, a justificativa é preenchida automaticamente — confira se o texto está correto
6. [ ] Em caso de dúvida sobre a permissão, consulte a matriz de permissões antes de agir

---

## 5. Contato

Em caso de dúvidas sobre este documento ou sobre os fluxos de Rede/Grupo Econômico e Restrição de Crédito, contate a equipe de Cadastros ou Financeiro.

**Velora Log — Gestão Empresarial Inteligente**
