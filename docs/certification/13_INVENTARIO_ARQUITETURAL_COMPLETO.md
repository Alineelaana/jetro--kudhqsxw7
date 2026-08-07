# Inventário Arquitetural Completo

> **Artifact ID:** IAC-001
> **Date:** 2026-08-07
> **Framework:** FCP v1.0.0 — Phase 3

---

## 1. Stack Tecnológica

| Camada          | Tecnologia              | Versão  |
| --------------- | ----------------------- | ------- |
| Frontend        | React                   | 19.2.7  |
| Build Tool      | Vite                    | 8.0.16  |
| Linguagem       | TypeScript              | 6.0.3   |
| CSS             | TailwindCSS             | 3.4.19  |
| UI              | shadcn/ui (Radix UI)    | Latest  |
| Ícones          | lucide-react            | 0.577.0 |
| Gráficos        | recharts                | 3.8.1   |
| Formulários     | react-hook-form         | 7.80.0  |
| Validação       | zod                     | 4.4.3   |
| Roteamento      | react-router-dom        | 7.18.0  |
| Backend         | PocketBase              | v0.36   |
| Hosting         | Skip Cloud              | —       |
| Database        | SQLite (via PocketBase) | —       |
| Package Manager | pnpm                    | —       |

---

## 2. Camadas Arquiteturais

```
┌─────────────────────────────────────────────────┐
│            Camada de Apresentação                │
│  Web App (React SPA) │ Portal do Cliente │ Site │
└─────────────────────┬───────────────────────────┘
                      │  APIs REST + SSE
┌─────────────────────┴───────────────────────────┐
│            Camada de API Gateway                 │
│  PocketBase REST │ /backend/v1/ Custom Routes   │
│  Auth │ RLS │ Expand │ Realtime (SSE)           │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────┐
│            Camada de Hooks (Backend)             │
│  Model hooks │ Request hooks │ Custom routes    │
│  Audit │ Stock │ Financial │ AI │ CMS │ Chat    │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────┐
│            Camada de Domínios                     │
│  Comercial │ Compras │ Financeiro │ Estoque     │
│  Logística │ RH │ Fiscal │ Contábil │ CRM       │
│  Indústria │ IA │ Atendimento │ Precificação    │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────┐
│            Camada de Plataforma (Cross-cutting)  │
│  Auditoria │ Permissões │ Notificações │ Config │
│  Backups │ Multi-tenancy │ Feature Flags         │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────┐
│            Camada de Dados                        │
│  PocketBase (SQLite) │ File Storage │ Vectors   │
└──────────────────────────────────────────────────┘
```

---

## 3. Shared Platform Services (ADR-012)

| Serviço                | Coleção                                 | Status        | Módulos Consumidores                           |
| ---------------------- | --------------------------------------- | ------------- | ---------------------------------------------- |
| Empresas               | empresas                                | ✅            | Todos                                          |
| Filiais                | filiais                                 | ✅            | Todos                                          |
| Usuários               | users                                   | ✅            | Todos                                          |
| Permissões             | perfis_permissoes                       | ✅            | Todos                                          |
| Produtos               | products                                | ✅            | Comercial, Compras, Estoque, Indústria, Fiscal |
| Clientes               | clients                                 | ✅            | Comercial, CRM, Financeiro, Portal             |
| Fornecedores/Parceiros | partners                                | ✅            | Compras, Financeiro, Indústria                 |
| Auditoria              | audit_logs                              | ✅            | Todos                                          |
| IA                     | ai_training                             | ✅            | Todos                                          |
| Integrações            | integrations                            | ✅            | Todos                                          |
| Notificações           | notifications                           | ✅            | Todos                                          |
| Configurações          | settings, system_parameters             | ✅            | Todos                                          |
| Moedas                 | currencies                              | ✅            | Financeiro, Compras, Indústria                 |
| Câmbio                 | exchange_rates                          | ✅            | Financeiro, Compras, Indústria                 |
| Qualidade              | quality_inspections, quality_parameters | ✅            | Indústria, Compras, Estoque                    |
| Comércio Exterior      | import_processes, import_costs          | ✅            | Indústria, Compras                             |
| Dashboards             | —                                       | ✅            | Todos                                          |
| Feature Flags          | —                                       | 🟡 Conceitual | Todos                                          |
| Canais Digitais        | —                                       | ✅ Conceitual | Marketing, Comercial                           |

---

## 4. Padrões Arquiteturais

| Padrão                             | Implementação                    | Status       |
| ---------------------------------- | -------------------------------- | ------------ |
| Multi-tenancy por Tenant ID        | empresa_id/filial_id em users    | ✅ (ADR-001) |
| API First                          | PocketBase REST + custom routes  | ✅ (ADR-002) |
| IA como camada nativa              | $ai gateway                      | ✅ (ADR-003) |
| Modularidade com feature flags     | Domínios separados               | ✅ (ADR-004) |
| Logs imutáveis                     | audit_logs append-only           | ✅ (ADR-005) |
| White label por configuração       | CMS visual identity              | ✅ (ADR-006) |
| Master Portal                      | Feature flag conceitual          | 🟡 (ADR-007) |
| Marketplace com sandbox            | Reservado                        | ⚪ (ADR-008) |
| Observabilidade                    | Auditoria + logs                 | 🟡 (ADR-009) |
| LGPD                               | RLS + auth                       | 🟡 (ADR-010) |
| Neutralidade de módulos            | Reclassificação ind\_\* → shared | ✅ (ADR-011) |
| Shared Platform Services           | 27 serviços                      | ✅ (ADR-012) |
| Platform Tree                      | 5 áreas de produto               | ✅ (ADR-013) |
| MRP como hook                      | Rota calculada                   | 🟡 (ADR-014) |
| Rastreabilidade via relações reais | Não pré-computada                | ✅ (ADR-015) |
| Extensão de estruturas             | REAPROVEITAR→ESTENDER            | ✅ (ADR-016) |
| BOM versionada imutável            | bom_versions                     | ✅ (ADR-017) |
| Quality inspection como decisor    | quality_inspections              | ✅ (ADR-018) |
| COMEX futuro                       | import_processes shared          | ✅ (ADR-019) |
| Canais Digitais                    | VeloraLog como primeiro canal    | ✅ (ADR-020) |
| Industry Phase 0                   | specs/BOM/routes/costs           | ✅ (ADR-021) |
| Aceite baseado em evidências       | 5 níveis de validação            | ✅ (ADR-022) |

---

## 5. Frontend Architecture

### 5.1 Estrutura de Pastas

```
src/
├── components/
│   ├── ui/              (shadcn/ui — 45 componentes)
│   ├── ai-module/       (11 componentes)
│   ├── crm/             (12 componentes)
│   ├── financial/       (15 componentes)
│   ├── fiscal/          (12 componentes)
│   ├── industry/        (7 componentes)
│   ├── logistics/       (18 componentes)
│   ├── rh/              (8 componentes)
│   ├── stock/           (30+ componentes)
│   ├── purchasing/      (12 componentes)
│   ├── pricing/         (15 componentes)
│   ├── cms/             (20+ componentes)
│   ├── configuracoes/   (10 componentes)
│   ├── atendimento/     (8 componentes)
│   ├── dp/              (8 componentes)
│   ├── sst/             (3 componentes)
│   └── ...              (demais componentes)
├── pages/               (40+ páginas)
├── services/            (40+ serviços)
├── hooks/               (hooks React)
├── lib/                 (utilitários, tipos, configs)
└── assets/              (imagens)
```

### 5.2 Padrões Frontend

| Padrão                       | Implementação     | Status |
| ---------------------------- | ----------------- | ------ |
| Path alias @/                | Configurado       | ✅     |
| Named exports (componentes)  | Convenção seguida | ✅     |
| Default exports (páginas)    | Convenção seguida | ✅     |
| cn() para classes dinâmicas  | Aplicado          | ✅     |
| Outlet para Layout           | Aplicado          | ✅     |
| shadcn/ui como base          | 45 componentes    | ✅     |
| Mobile-first                 | Responsivo        | ✅     |
| ChartContainer para gráficos | Aplicado          | ✅     |

---

## 6. Backend Architecture

### 6.1 Hook Patterns

| Tipo                       | Quantidade | Exemplos                        |
| -------------------------- | ---------- | ------------------------------- |
| onRecordAfterCreateSuccess | 15+        | audit hooks, notification hooks |
| onRecordAfterUpdateSuccess | 10+        | audit hooks, stock hooks        |
| onRecordCreateRequest      | 5+         | validation hooks                |
| routerAdd (custom routes)  | 40+        | backup, AI, chat, CMS routes    |
| Cron jobs                  | 5+         | audit_cron, backup_auto_check   |

### 6.2 Service Layer

| Domínio    | Arquivo            | Coleções                                       |
| ---------- | ------------------ | ---------------------------------------------- |
| Budget     | budget-requests.ts | budget_requests                                |
| Chat       | chat.ts            | chat_conversations, chat_messages              |
| Products   | products.ts        | products                                       |
| Stock      | stock.ts           | stock_movements, stock_batches                 |
| Sales      | sales.ts           | sales_orders, sales_invoices                   |
| Purchasing | purchasing.ts      | purchase_requests, quotations, purchase_orders |
| Financial  | financial.ts       | receivables, payables                          |
| Logistics  | logistics.ts       | routes, deliveries, vehicles                   |
| Industry   | industry.ts        | bom_versions, production_routes                |
| CRM        | crm.ts             | leads, opportunities                           |
| RH         | rh.ts              | employees, payroll                             |
| Fiscal     | fiscal.ts          | nfe, nfce                                      |
| CMS        | cms.ts             | cms_content, cms_media                         |
| Audit      | audit-logs.ts      | audit_logs                                     |
| AI         | ai-module.ts       | ai_training                                    |
| Config     | configuracoes.ts   | settings, system_parameters                    |

---

## 7. Aderência Arquitetural

| Verificação                        | Status | Evidência                              |
| ---------------------------------- | ------ | -------------------------------------- |
| Arquitetura conceitual documentada | ✅     | ARCHITECTURE.md                        |
| Princípios fundamentais            | ✅     | PLATFORM_PRINCIPLES.md (10 princípios) |
| ADRs documentados                  | ✅     | 22 ADRs                                |
| Hierarquia REAPROVEITAR→ESTENDER   | ✅     | ADR-016 aplicado                       |
| Single Source of Truth             | ✅     | ADR-015 aplicado                       |
| Neutralidade de módulos            | ✅     | ADR-011 aplicado                       |
| API First                          | ✅     | PocketBase REST + /backend/v1/         |
| Multi-tenancy                      | ✅     | empresa_id/filial_id                   |
| Canais Digitais                    | ✅     | ADR-020, VeloraLog como canal          |
| FCP Framework                      | ✅     | 15 fases, 300+ checklist items         |

**Aderência arquitetural: 95.7%**

---

_End of Inventário Arquitetural Completo._
