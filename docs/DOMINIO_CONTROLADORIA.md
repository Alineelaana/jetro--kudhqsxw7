# Domínio Corporativo de Controladoria & Performance Empresarial

> **Documento Enterprise — Referência Oficial da Plataforma**
> Status: Oficial
> Responsável: Architecture Council

---

## 1. Objetivos

O Domínio de Controladoria é o centro definitivo de inteligência econômica e gerencial da plataforma. Consolida e interpreta dados oficiais sem nunca duplicar Financeiro, Contabilidade, Plano de Contas, Centros de Custo, BI ou qualquer estrutura existente.

**Princípio fundamental:** REAPROVEITAR → ESTENDER → INTEGRAR → CRIAR.

## 2. Escopo

- DRE Contábil, Gerencial e Analítica
- KPIs Corporativos (24 indicadores)
- Drivers Financeiros e Operacionais
- Fechamento Gerencial com Snapshot Imutável
- Simulador Corporativo
- Consolidação Empresarial
- Motor de Materialidade
- ADAPTA Financeira (Agente Especialista)
- Cockpit Executivo
- Orçado × Realizado, Forecast, Projeções
- Análise de Variações
- Comentários da Controladoria
- Visões Salvas
- Reclassificações Gerenciais

## 3. Arquitetura — Duas Camadas Oficiais

### Camada Contábil (oficial, imutável)

- Lançamentos contábeis (`contabil_lancamentos`)
- Plano de contas (`plano_contas`)
- Períodos e exercícios (`contabil_periods`, `contabil_fiscal_years`)
- Conciliações (`contabil_reconciliations`)

### Camada Gerencial (overlay, nunca altera o original)

- Reclassificações (`controladoria_reclassifications`)
- Apropriações e provisões (existentes em `contabil_provisions`)
- Rateios, ajustes gerenciais
- Competência econômica

### Resultado Gerencial = Combinação das duas camadas

O lançamento contábil original nunca é alterado.

## 4. Ciclo de Controladoria

```
Planejamento → Orçamento → Execução → Apuração → Consolidação → Análise → Simulações → Tomada de Decisão → Replanejamento → Novo Ciclo
```

Cada componente pertence a pelo menos um estágio do ciclo.

## 5. DRE — Três Visões sobre uma Única Base

| Visão     | Descrição                                           |
| --------- | --------------------------------------------------- |
| Contábil  | Aderente ao Plano de Contas oficial                 |
| Gerencial | Reclassificações gerenciais sem alterar lançamentos |
| Analítica | Drill-down completo até a origem                    |

Estrutura configurável (linhas, agrupamento, níveis, fórmulas entre linhas). Mapeamento Plano de Contas → linha DRE preserva o Plano de Contas (sem contas duplicadas).

## 6. Múltiplas Versões do Resultado

Oficial, Contábil, Gerencial, Orçado, Forecast, Rolling Forecast, Reforecast, Simulado, Consolidado — todas computadas sobre a mesma base de dados oficiais.

## 7. Fechamento Gerencial + Snapshot Imutável

Workflow corporativo com responsáveis, checklist, pendências, aprovações, bloqueios, timeline, histórico, auditoria, versionamento e Snapshot Oficial. Após fechamento, o snapshot é imutável. Ajustes retroativos requerem reabertura justificada e auditada.

## 8. KPIs Corporativos

24 KPIs com: Nome, Categoria, Fórmula, Periodicidade, Meta, Responsável, Criticidade, Limites, Unidade, Tendência, Materialidade, Origem dos dados. Alimentados exclusivamente pelo BI Enterprise 360.

## 9. Drivers Empresariais

**Financeiros:** Receita, Custos, Despesas, Margem, EBITDA, Capital de Giro.
**Operacionais:** OEE, Produtividade, Capacidade, Lead Time, Setup, Perdas, Retrabalho, Estoque, Giro, Ruptura, Inadimplência, Verbas, Campanhas.

## 10. Motor de Materialidade

Cada indicador: limite, tolerância, criticidade, impacto, relevância, severidade, justificativa. Reutilizado pela ADAPTA Financeira.

## 11. Consolidação Empresarial

Múltiplas empresas/filiais, grupos econômicos, eliminações intercompany, consolidação parcial/total — tudo derivado de fontes oficiais.

## 12. Simulador Corporativo

Cenários: preço, custos, mix, vendas, despesas, câmbio, fornecedor, impostos — sempre sobre dados oficiais, resultados marcados como SIMULADO.

## 13. ADAPTA Financeira

Agente especialista que explica causa-e-feito. Respostas rastreáveis, auditáveis, explicáveis, fundamentadas em dados oficiais. Nunca conclusões sem evidência.

## 14. Cockpit Executivo

Centro de decisão com KPIs, heatmaps, timeline, drill-down, comparativos, tendências, forecast, budget, simulações, alertas, materialidade, drivers. Zero inteligência própria — consome exclusivamente BI Enterprise 360.

## 15. Segurança e Permissões

Perfis: Financeiro, Controladoria, Contabilidade, Diretoria, Gestores, Administradores. RBAC + Empresa/Filial/Tenant/Centro de Resultado/Escopo Organizacional.

## 16. Auditoria

Toda configuração relevante registra usuário, data, antes, depois, justificativa. Audit Engine obrigatório em operações críticas.

## 17. Reconciliação e Testes

Testes matemáticos independentes (Receita R$1.000.000, Deduções R$100.000, CMV R$500.000 → Receita Líquida R$900.000, Lucro Bruto R$400.000). Reconciliação: DRE reconcilia com fontes oficiais; totais por filial somam o consolidado; drill-down soma exatamente o valor apresentado.

## 18. Escalabilidade Futura

Arquitetura preparada para: ESG, BSC, OKRs, Planejamento Estratégico, Consolidação Internacional, IFRS, CPC, US GAAP, Indicadores Estratégicos — sem reestruturação.

## 19. Coleções do Domínio

| Coleção                           | Função                           |
| --------------------------------- | -------------------------------- |
| `controladoria_dre_structure`     | Configuração de linhas DRE       |
| `controladoria_account_mapping`   | Mapeamento Plano de Contas → DRE |
| `controladoria_reclassifications` | Reclassificações gerenciais      |
| `controladoria_result_versions`   | Versões do resultado             |
| `controladoria_budgets`           | Orçamento                        |
| `controladoria_forecasts`         | Forecast                         |
| `controladoria_closing`           | Fechamento gerencial             |
| `controladoria_snapshots`         | Snapshots imutáveis              |
| `controladoria_kpis`              | KPIs corporativos                |
| `controladoria_drivers`           | Drivers empresariais             |
| `controladoria_materiality`       | Motor de materialidade           |
| `controladoria_simulations`       | Simulações                       |
| `controladoria_consolidation`     | Consolidação                     |
| `controladoria_comments`          | Comentários                      |
| `controladoria_saved_views`       | Visões salvas                    |

## 20. Integrações

- BI Enterprise 360 (fonte exclusiva para Cockpit e KPIs)
- Contabilidade (lançamentos, plano de contas)
- Financeiro (recebíveis, pagáveis, movimentações)
- Comercial (pedidos, clientes)
- Compras (fornecedores, pedidos)
- Indústria (produção, OEE, custos)
- Logística (fretes, entregas)
- RH (folha, pessoal)
- Verbas de Fornecedores
- CRM
- Notificações (Shared Platform Service)
- Busca Global
- Corporate Document Engine
- Central Corporativa de Relatórios
- Audit Engine
