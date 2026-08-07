# Inventário das Regras de Negócio

> **Artifact ID:** IRN-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 6

---

## 1. Regras Financeiras

| ID     | Regra                          | Descrição                                              | Validação                                                   | Status |
| ------ | ------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------- | ------ |
| FIN-01 | Fluxo de Caixa                 | Consolidar contas a pagar/receber em projeção 30/60/90 | Input: títulos com valores e vencimentos → Output: projeção | ✅     |
| FIN-02 | DRE                            | Gerar Demonstração Resultado do Exercício gerencial    | Input: receitas, custos, despesas → Output: DRE estruturado | ✅     |
| FIN-03 | CMV                            | Calcular Custo da Mercadoria Vendida                   | Input: custo aquisição + fretes + impostos → Output: CMV    | ✅     |
| FIN-04 | Margem                         | Calcular margem de lucro                               | (receita - custo) / receita × 100                           | ✅     |
| FIN-05 | Markup                         | Calcular markup                                        | custo × (1 + markup/100)                                    | ✅     |
| FIN-06 | Rentabilidade                  | Calcular rentabilidade por pedido/cliente              | Input: receita, custo, despesas alocadas                    | ✅     |
| FIN-07 | Comissões                      | Calcular comissão por vendedor                         | Input: vendas, tabela comissão, metas                       | ✅     |
| FIN-08 | Verbas                         | Calcular e aplicar verbas comerciais                   | Input: contrato de verba, volume vendido                    | ✅     |
| FIN-09 | Custos                         | Apropriar custos diretos e indiretos                   | Input: custos por centro de custo                           | ✅     |
| FIN-10 | Cobrança                       | Gerar títulos de cobrança                              | Input: pedido faturado, condição pagamento                  | ✅     |
| FIN-11 | Inadimplência                  | Calcular e classificar inadimplência                   | Input: títulos vencidos → Output: valor e %                 | ✅     |
| FIN-12 | Cascade pagamento              | Efeitos em cascata ao pagar título                     | Hook: on_payable_paid_cascade                               | ✅     |
| FIN-13 | Cascade recebimento            | Efeitos em cascata ao receber título                   | Hook: on_receivable_paid_cascade                            | ✅     |
| FIN-14 | Criação de recebível           | Gerar recebível ao faturar                             | Hook: on_invoice_create_receivable                          | ✅     |
| FIN-15 | Lançamento contábil automático | Gerar lançamento a partir de evento                    | Hook: contabil_auto_generate                                | ✅     |

## 2. Regras Fiscais

| ID     | Regra                        | Descrição                             | Validação                           | Status |
| ------ | ---------------------------- | ------------------------------------- | ----------------------------------- | ------ |
| FIS-01 | ICMS                         | Calcular ICMS por operação            | Input: valor, alíquota, CST, CFOP   | ✅     |
| FIS-02 | IPI                          | Calcular IPI                          | Input: valor, alíquota              | ✅     |
| FIS-03 | PIS/COFINS                   | Calcular PIS e COFINS                 | Input: valor, regime, alíquotas     | ✅     |
| FIS-04 | CFOP                         | Classificar operação com CFOP correto | Input: tipo operação → Output: CFOP | ✅     |
| FIS-05 | Substituição Tributária      | Calcular ICMS-ST                      | Input: valor, MVA, alíquota         | ✅     |
| FIS-06 | Reforma Tributária (CBS/IBS) | Calcular CBS e IBS                    | Input: valor, alíquotas, crédito    | ✅     |
| FIS-07 | Apuração                     | Apurar impostos por período           | Input: operações do período         | ✅     |
| FIS-08 | Carta de correção            | Emitir CC-e                           | Input: dados da correção            | ✅     |
| FIS-09 | Manifestação destinatário    | Registrar manifestação                | Input: tipo, chave                  | ✅     |

## 3. Regras Comerciais

| ID     | Regra                 | Descrição                          | Validação                                           | Status |
| ------ | --------------------- | ---------------------------------- | --------------------------------------------------- | ------ |
| COM-01 | Pedidos de Venda      | Criar pedido com validações        | Input: cliente, itens, condição pagamento           | ✅     |
| COM-02 | Separação             | Reservar estoque para pedido       | Input: pedido com itens → Output: estoque reservado | ✅     |
| COM-03 | Faturamento           | Gerar fatura e nota fiscal         | Input: pedido faturável → Output: NF, título        | ✅     |
| COM-04 | Cancelamento          | Cancelar pedido e reverter estoque | Input: pedido cancelado                             | ✅     |
| COM-05 | Devoluções            | Processar devolução                | Input: nota de devolução → crédito gerado           | ✅     |
| COM-06 | Campanhas e Promoções | Aplicar desconto promocional       | Input: produto, campanha ativa                      | ✅     |
| COM-07 | Combos                | Aplicar preço de combo             | Input: itens do combo                               | ✅     |
| COM-08 | Bonificações          | Adicionar item bonificado          | Input: regra de bonificação                         | ✅     |
| COM-09 | Numeração automática  | Gerar número de pedido             | Hook: sales_numbers_next                            | ✅     |

## 4. Regras de Estoque

| ID     | Regra                   | Descrição                       | Validação                                  | Status |
| ------ | ----------------------- | ------------------------------- | ------------------------------------------ | ------ |
| EST-01 | Saldo de Estoque        | Manter saldo preciso            | Input: movimentações → Output: saldo final | ✅     |
| EST-02 | FIFO/FEFO               | Sugerir separação por FIFO/FEFO | Hook: stock_fifo_fefo_suggest              | ✅     |
| EST-03 | Estoque Mínimo          | Alertar quando abaixo do mínimo | Hook: on_product_create_alerts             | ✅     |
| EST-04 | Transferência           | Transferir entre filiais        | Input: origem, destino, quantidade         | ✅     |
| EST-05 | Bloqueio por validade   | Impedir saída de lote vencido   | Hook: stock_expiry_block                   | ✅     |
| EST-06 | Auditoria de estoque    | Registrar movimentações         | Hook: stock_audit                          | ✅     |
| EST-07 | Atualização de custo    | Atualizar custo ao receber nota | Hook: stock_cost_update                    | ✅     |
| EST-08 | Recebimento de nota     | Atualizar estoque ao receber    | Hook: stock_on_purchase_invoice            | ✅     |
| EST-09 | Saída por venda         | Baixar estoque ao faturar       | Hook: stock_on_sales_update                | ✅     |
| EST-10 | Transferência completa  | Confirmar transferência         | Hook: stock_transfer_complete              | ✅     |
| EST-11 | Rescan de alertas       | Reescanear alertas de preço     | Hook: stock_price_alert_rescan             | ✅     |
| EST-12 | Aprovação de inventário | Aprovar contagem                | Hook: stock_inventory_approve              | ✅     |

## 5. Regras de Precificação

| ID      | Regra                  | Descrição                                  | Validação                       | Status |
| ------- | ---------------------- | ------------------------------------------ | ------------------------------- | ------ |
| PREC-01 | Cálculo de custo final | Custos + impostos + despesas → custo final | pricing_config                  | ✅     |
| PREC-02 | Margem mínima          | Garantir margem mínima                     | Input: custo, margem mínima     | ✅     |
| PREC-03 | Preço ideal            | Calcular preço ideal                       | Input: custo, markup, margem    | ✅     |
| PREC-04 | Aprovação de preço     | Fluxo de aprovação                         | pricing_approvals               | ✅     |
| PREC-05 | Cofre de preços        | Versionamento imutável                     | price_vault                     | ✅     |
| PREC-06 | Monitor de risco       | Score de risco de mudança                  | Hook: pricing_risk_score        | ✅     |
| PREC-07 | Análise por IA         | Sugestão de preço por IA                   | Hook: pricing_ai_analyze        | ✅     |
| PREC-08 | Tabelas de preço       | Multi-tabela por canal                     | price_tables                    | ✅     |
| PREC-09 | Expiração de tabela    | Alerta de expiração                        | Hook: price_table_expiry_alert  | ✅     |
| PREC-10 | Scan de aprovação      | Verificar aprovações pendentes             | Hook: price_table_approval_scan | ✅     |

## 6. Regras de Compras

| ID      | Regra                | Descrição                         | Validação                        | Status |
| ------- | -------------------- | --------------------------------- | -------------------------------- | ------ |
| COMP-01 | Requisição de compra | Criar requisição com validações   | Input: itens, justificativa      | ✅     |
| COMP-02 | Cotação              | Comparar cotações de fornecedores | Input: cotações → Output: melhor | ✅     |
| COMP-03 | Pedido de compra     | Emitir pedido ao fornecedor       | Input: cotação vencedora         | ✅     |
| COMP-04 | Recebimento de nota  | Conferir nota fiscal de entrada   | Input: nota, itens conferidos    | ✅     |
| COMP-05 | Devolução de compra  | Devolver mercadoria               | Input: nota de devolução         | ✅     |
| COMP-06 | Numeração automática | Gerar número de compra            | Hook: purchase_numbers_next      | ✅     |

## 7. Regras de Logística

| ID     | Regra                  | Descrição                     | Validação                      | Status       |
| ------ | ---------------------- | ----------------------------- | ------------------------------ | ------------ |
| LOG-01 | Planejamento de rota   | Otimizar rota de entrega      | Hook: logistics_route_calc     | ✅           |
| LOG-02 | Rastreamento GPS       | Atualizar posição             | Hook: logistics_gps_update     | 🟡 Simulação |
| LOG-03 | Validação de mapa      | Validar coordenadas           | Hook: logistics_map_validate   | ✅           |
| LOG-04 | Notificação de entrega | Avisar cliente                | Hook: on_delivery_notify       | ✅           |
| LOG-05 | Comprovante de entrega | Registrar POD                 | Input: foto, assinatura        | ✅           |
| LOG-06 | Logística reversa      | Processar devolução logística | Input: ocorrência de devolução | ✅           |

## 8. Regras de Indústria

| ID     | Regra                              | Descrição                         | Validação                        | Status      |
| ------ | ---------------------------------- | --------------------------------- | -------------------------------- | ----------- |
| IND-01 | BOM imutável                       | Versão de BOM é snapshot imutável | ADR-017                          | ✅          |
| IND-02 | Quality inspection como decisor    | Inspeção decide condição do lote  | ADR-018                          | ✅          |
| IND-03 | Rastreabilidade via relações reais | Fonte de verdade nas relações     | ADR-015                          | ✅          |
| IND-04 | MRP como hook calculado            | Cálculo de necessidade de compra  | ADR-014                          | 🟡 Pendente |
| IND-05 | Especificações versionadas         | Specs com vigência                | spec_values                      | ✅          |
| IND-06 | Conversões de unidade              | Global e por item com vigência    | unit_conversions                 | ✅          |
| IND-07 | Custos industriais                 | Padrão (snapshot) × Realizado     | industrial_costs                 | ✅          |
| IND-08 | Validação Phase 0                  | Verificar estrutura               | Hook: phase0_foundation_validate | ✅          |

## 9. Regras de Auditoria

| ID     | Regra                    | Descrição                             | Validação                   | Status |
| ------ | ------------------------ | ------------------------------------- | --------------------------- | ------ |
| AUD-01 | Log de criação           | Registrar criação de registro         | Hook: audit_create          | ✅     |
| AUD-02 | Log de atualização       | Registrar alteração                   | Hook: audit_update          | ✅     |
| AUD-03 | Log de exclusão          | Registrar deleção                     | Hook: audit_delete          | ✅     |
| AUD-04 | Enriquecimento           | Adicionar contexto (IP, device, etc.) | Hook: audit_enrich          | ✅     |
| AUD-05 | Detecção de anomalias    | IA detecta comportamento suspeito     | Hook: audit_alerts_detect   | ✅     |
| AUD-06 | Arquivamento automático  | Retenção por tempo                    | Hook: audit_auto_archive    | ✅     |
| AUD-07 | Notificação de incidente | Alertar sobre incidente               | Hook: audit_incident_notify | ✅     |
| AUD-08 | Logs imutáveis           | Append-only                           | ADR-005                     | ✅     |

## 10. Regras de IA

| ID    | Regra                        | Descrição                  | Validação                     | Status |
| ----- | ---------------------------- | -------------------------- | ----------------------------- | ------ |
| IA-01 | Uso do gateway $ai           | Acesso via gateway oficial | Hook global $ai               | ✅     |
| IA-02 | Transparência                | Ações de IA registradas    | audit_logs                    | ✅     |
| IA-03 | Parsing defensivo            | Respostas validadas        | Hook code review              | ✅     |
| IA-04 | Treinamento gerenciável      | Knowledge base CRUD        | ai_training                   | ✅     |
| IA-05 | Toggle de IA                 | Ativar/desativar           | Hook: ai_settings_toggle      | ✅     |
| IA-06 | Classificação de atendimento | IA classifica ticket       | Hook: atendimento_classify_ai | ✅     |
| IA-07 | Assistente CRM               | IA para CRM                | Hook: crm_ai_assistant        | ✅     |
| IA-08 | Análise de pricing           | IA sugere preço            | Hook: pricing_ai_analyze      | ✅     |

## 11. Resumo de Regras de Negócio

| Domínio      | Regras | Implementadas | Parciais | Pendentes |
| ------------ | ------ | ------------- | -------- | --------- |
| Financeiro   | 15     | 15            | 0        | 0         |
| Fiscal       | 9      | 9             | 0        | 0         |
| Comercial    | 9      | 9             | 0        | 0         |
| Estoque      | 12     | 12            | 0        | 0         |
| Precificação | 10     | 10            | 0        | 0         |
| Compras      | 6      | 6             | 0        | 0         |
| Logística    | 6      | 5             | 1        | 0         |
| Indústria    | 8      | 7             | 0        | 1         |
| Auditoria    | 8      | 8             | 0        | 0         |
| IA           | 8      | 8             | 0        | 0         |
| **Total**    | **91** | **89**        | **1**    | **1**     |

**Cobertura de regras de negócio: 97.8%**

---

_End of Inventário das Regras de Negócio._
