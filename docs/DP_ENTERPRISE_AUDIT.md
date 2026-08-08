# DP Enterprise — Auditoria Obrigatória

## Classificação do Domínio DP Existente

| Item                      | Coleção/Componente                     | Status         | Ação                                                                              |
| ------------------------- | -------------------------------------- | -------------- | --------------------------------------------------------------------------------- |
| Cadastro de Colaboradores | `rh_employees`                         | Existe correto | Reaproveitar + Estender (categoria, CBO, sindicato, tipo_vinculo, local_trabalho) |
| Admissões                 | `dp_admissions`                        | Existe parcial | Estender (workflow, integração SST/eSocial/Financeiro)                            |
| Contratos de Trabalho     | `dp_work_contracts`                    | Existe parcial | Estender (modalidade, experiência, histórico)                                     |
| Alterações Contratuais    | `rh_employee_history`                  | Existe parcial | Estender + Criar `dp_contract_changes` (vigência, before/after, eSocial)          |
| Jornadas e Escalas        | `rh_scales`                            | Existe parcial | Estender (5x2, 6x1, 12x36, compensação, horário flexível)                         |
| Controle de Ponto         | `rh_time_records`                      | Existe correto | Reaproveitar + Integrar (REP-C/A/P, espelho, fechamento)                          |
| Banco de Horas            | —                                      | Não existe     | Criar `dp_bank_hours_ledger` (ledger, créditos, débitos, saldo)                   |
| Folha de Pagamento        | `rh_payroll` + `rh_payroll_events`     | Existe correto | Reaproveitar + Estender (processamento, snapshot, complementar)                   |
| Rubricas                  | `rh_payroll_events`                    | Existe parcial | Estender (incidências, fórmula, vigência, integração contábil/eSocial)            |
| Processamento da Folha    | `rh_payroll`                           | Existe correto | Reaproveitar + Integrar (críticas, simulação, snapshot imutável)                  |
| Folha Complementar        | `rh_payroll`                           | Existe parcial | Estender (diferença, retroativo, dissídio, rescisão complementar)                 |
| Férias                    | `rh_vacations`                         | Existe correto | Reaproveitar + Integrar (Agenda, RH, antecipação 13º)                             |
| 13º Salário               | `dp_13th_salary`                       | Existe correto | Reaproveitar + Estender (proporcional, médias, afastamentos)                      |
| Afastamentos              | `dp_leaves` / `dp_licenses`            | Existe correto | Reaproveitar + Integrar (SST, eSocial, LGPD)                                      |
| Benefícios                | `rh_benefits` / `rh_employee_benefits` | Existe correto | Reaproveitar + Integrar (folha, financeiro)                                       |
| Rescisão                  | `rh_dismissals`                        | Existe parcial | Estender (cálculo prévio, verbas, FGTS, eSocial, offboarding)                     |
| Reintegração              | —                                      | Não existe     | Criar `dp_reinstatements` (histórico, reflexos, eSocial)                          |
| eSocial                   | `dp_esocial_events`                    | Existe parcial | Estender (S-1.3, recibo, protocolo, retificação) + Criar `dp_esocial_layouts`     |
| Monitor eSocial           | —                                      | Não existe     | Criar componente (painel com drill-down)                                          |
| FGTS Digital              | —                                      | Não existe     | Criar `dp_fgts_digital` (bases, débitos, guias, divergências)                     |
| INSS/IRRF/Encargos        | `system_parameters`                    | Existe parcial | Criar `dp_tax_tables_versioned` (tabelas versionáveis por vigência)               |
| Consignados               | —                                      | Não existe     | Criar `dp_consignments` (empréstimos, pensões, convênios)                         |
| Sindicatos                | —                                      | Não existe     | Criar `dp_unions` + `dp_collective_agreements`                                    |
| Dissídio                  | —                                      | Não existe     | Criar `dp_wage_adjustments` (reajuste, retroativo, reflexos)                      |
| Provisões                 | —                                      | Não existe     | Criar `dp_provisions` (férias, 13º, encargos, benefícios)                         |
| Snapshots de Folha        | —                                      | Não existe     | Criar `dp_payroll_snapshots` (imutável, hash)                                     |
| Integração Financeira     | `financial_payables`                   | Existe correto | Reaproveitar (hook `on_payroll_closed.js` já gera payables)                       |
| Integração Contábil       | `contabil_integration_rules`           | Existe correto | Reaproveitar + Estender (Rubrica → Conta → Centro de Custo)                       |
| Documentos                | Corporate Document Engine              | Existe correto | Reaproveitar (`rh-dp-pdf-export.ts`)                                              |
| BI / People Analytics     | BI Enterprise 360                      | Existe correto | Reaproveitar (não criar BI paralelo)                                              |
| ADAPTA DP                 | —                                      | Não existe     | Criar agente `adapta-dp` (integração ADAPTA governance)                           |
| Alertas                   | `notifications`                        | Existe correto | Reaproveitar Notification Center                                                  |
| Workflow                  | `platform_workflows`                   | Existe correto | Reaproveitar Workflow Engine                                                      |
| Permissões                | `rh-permissions.ts`                    | Existe parcial | Estender (granular: salário, folha, descontos, dados bancários)                   |
| Auditoria                 | `audit_logs`                           | Existe correto | Reaproveitar Audit Engine                                                         |
| Menu/Navegação            | `/admin/dp`                            | Existe correto | Estender (adicionar children, não criar segundo item)                             |

## Resumo

- **Reaproveitar:** 16 itens
- **Estender:** 12 itens
- **Integrar:** 8 itens
- **Criar:** 12 novas coleções + 1 agente + 5 componentes
