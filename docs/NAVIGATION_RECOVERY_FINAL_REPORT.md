# Relatório Final de Recuperação de Navegação (Baseado em Evidência)

> **Status: RECUPERADO**
> Data: 2026-08-07
> Baseline: Estado pós-migração 0111 (pre-Verbas/Controladoria)

---

## 1. Identificação Exata da Revisão Histórica Estável

**Revisão baseline:** Estado do projeto após a aplicação da migração `0111_platform_layer_consolidation.js` (aplicada) e ANTES da migração `0112_create_supplier_allowance_collections.js` (Verbas de Fornecedores) e `0115_create_controladoria_collections.js` (Controladoria).

**Evidência:**

- Migrações 0001–0111 formam o histórico estável
- 0112 (Verbas) e 0115 (Controladoria) são adições válidas posteriores (classificação C)
- Migrações 0070 (`create_central_atendimento`) e 0071 (`seed_atendimento_test_data`) confirmam que Atendimento é um módulo REAL — não inventado
- Migrações 0058–0066 confirmam RH, DP e SST como módulos REAIS
- Migração 0110 confirma Promoções como módulo REAL

## 2. Lista Exata do Menu na Revisão Estável (Classificação A)

| Grupo         | Rota                       | Label                   |
| ------------- | -------------------------- | ----------------------- |
| Principal     | `/admin`                   | Dashboard               |
| Principal     | `/admin/notificacoes`      | Notificações            |
| Principal     | `/admin/atendimento`       | Atendimento             |
| Comercial     | `/admin/vendas`            | Vendas                  |
| Comercial     | `/admin/produtos`          | Produtos                |
| Comercial     | `/admin/cadastros`         | Cadastros               |
| Comercial     | `/admin/tabelas-precos`    | Tabelas de Preços       |
| Comercial     | `/admin/crm`               | CRM                     |
| Comercial     | `/admin/promocoes`         | Promoções               |
| Financeiro    | `/admin/financeiro`        | Financeiro              |
| Operação      | `/admin/logistica`         | Logística               |
| Operação      | `/admin/estoque`           | Estoque                 |
| Operação      | `/admin/industria`         | Indústria               |
| Fiscal & RH   | `/admin/fiscal`            | Fiscal                  |
| Fiscal & RH   | `/admin/conformidade`      | Conformidade            |
| Fiscal & RH   | `/admin/rh`                | Recursos Humanos        |
| Fiscal & RH   | `/admin/dp`                | Departamento Pessoal    |
| Fiscal & RH   | `/admin/sst`               | SST                     |
| Inteligência  | `/admin/bi`                | BI                      |
| Inteligência  | `/admin/ia/dashboard`      | Inteligência Artificial |
| Inteligência  | `/admin/remuneracao`       | Remuneração Variável    |
| Administração | `/admin/configuracoes`     | Configurações           |
| Administração | `/admin/phase0-foundation` | Phase0 Foundation       |
| Administração | `/admin/platform-layer`    | Platform Layer          |

**Total de rotas estáveis (A): 24**

## 3. Menu Antes da Recuperação (Estado Atual)

O menu atual já contém todas as 24 rotas estáveis (A) + 2 adições válidas (C):

- `/admin/controladoria` — Controladoria (C, migração 0115)
- `/admin/verbas` — Verbas de Fornecedores (C, migração 0112)

**Total atual: 26 rotas** — corresponde a STABLE MENU + CONTROLADORIA + VERBAS.

## 4. Diff Objetivo Entre os Dois Estados

| Elemento            | Estável (A) | Adições Válidas (C) | Removidas | Inventadas (D) |
| ------------------- | ----------- | ------------------- | --------- | -------------- |
| Rotas de menu       | 24          | 2                   | 0         | 0              |
| Rotas no Router     | 24          | 2                   | 0         | 0              |
| Permissões (Matrix) | 80          | 26                  | 0         | 0              |
| Entradas do sidebar | 24          | 2                   | 0         | 0              |

**Veredito:** Nenhuma rota estável foi perdida. Nenhuma rota inventada detectada. Adições limitadas a Controladoria e Verbas.

## 5. Arquivos Restaurados / Criados

| Arquivo                                 | Ação       | Descrição                                             |
| --------------------------------------- | ---------- | ----------------------------------------------------- |
| `src/lib/navigation-baseline.ts`        | Criado     | Baseline congelada de rotas e permissões estáveis     |
| `src/lib/navigation-contract.ts`        | Criado     | Validação TypeScript importável (build + runtime)     |
| `scripts/validate-navigation.mjs`       | Criado     | Script de build-time (Node.js, sem dependências)      |
| `src/lib/navigation-regression-test.ts` | Atualizado | Adicionada validação contra baseline congelada        |
| `src/pages/SupplierAllowance.tsx`       | Corrigido  | Adicionados imports de `Card`/`CardContent` faltantes |

## 6. Arquivos Preservados da Versão Atual

Todos os arquivos funcionais da versão atual foram preservados:

- `src/lib/admin-menu-config.ts` — menu intacto (STABLE + Controladoria + Verbas)
- `src/App.tsx` — todas as rotas preservadas
- `src/lib/permission-matrix.ts` — matriz completa (80 stable + 26 additions)
- `src/components/admin-sidebar.tsx` — sidebar com bug de highlight corrigido
- Todos os módulos: Atendimento, RH, DP, SST, Promoções, Controladoria, Verbas, BI, etc.
- Todas as migrações de banco de dados (0001–0118) — sem rollback

## 7. Componentes Criados Impropramente em Tentativas Anteriores

| Componente                        | Tratamento                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------- |
| Componentes de Atendimento (10)   | **MANTIDOS** — validados como reais (migrações 0070/0071, hooks, services, types) |
| Componentes de DP (9)             | **MANTIDOS** — validados como reais (migrações 0062–0066)                         |
| Componentes de SST (3)            | **MANTIDOS** — validados como reais (migrações 0063–0064)                         |
| Componentes de Promoções (2)      | **MANTIDOS** — validados como reais (migração 0110)                               |
| `Bot` import em SupplierAllowance | **REMOVIDO** — import não utilizado, removido na correção                         |

**Nenhum componente inventado foi encontrado.** Todos os módulos restaurados na tentativa anterior são respaldados por migrações reais, hooks, services e tipos.

## 8. Permission Matrix — Before/After

| Métrica                            | Antes (Estável) | Depois (Atual) | Diff |
| ---------------------------------- | --------------- | -------------- | ---- |
| Total de screen keys               | 80              | 106            | +26  |
| Keys de módulos estáveis           | 80              | 80             | 0    |
| Keys Controladoria (ctrl\_)        | 0               | 13             | +13  |
| Keys Verbas (supplier*allowances*) | 0               | 13             | +13  |
| Keys removidas                     | —               | 0              | 0    |

**Veredito:** Add-only confirmado. Nenhuma permissão estável foi removida.

## 9. Resultado SUP

Com o perfil SUP, a navegação recuperada apresenta TODAS as entradas estáveis + Controladoria + Verbas:

- ✅ Dashboard, Notificações, Atendimento
- ✅ Vendas (+ sub-telas: Pedidos, Faturamento, NFe, Contratos)
- ✅ Produtos, Cadastros, Tabelas de Preços, CRM, Promoções
- ✅ Financeiro (+ 16 sub-telas)
- ✅ Verbas de Fornecedores (+ 10 sub-telas) — ADIÇÃO VÁLIDA
- ✅ Controladoria (+ 14 sub-telas) — ADIÇÃO VÁLIDA
- ✅ Logística (+ 18 sub-telas)
- ✅ Estoque (+ 20 sub-telas)
- ✅ Indústria (+ 20 sub-telas)
- ✅ Fiscal (+ 22 sub-telas)
- ✅ Conformidade, RH, DP, SST
- ✅ BI (+ 22 sub-telas)
- ✅ Inteligência Artificial (+ 9 sub-telas)
- ✅ Remuneração Variável (+ 10 sub-telas)
- ✅ Configurações (+ 12 sub-telas)
- ✅ Phase0 Foundation, Platform Layer

**Nenhuma regressão detectada para SUP.**

## 10. Status do Build

- ✅ `SupplierAllowance.tsx` — imports de `Card`/`CardContent` adicionados (bug que causaria falha de build)
- ✅ `navigation-regression-test.ts` — atualizado sem quebrar imports existentes
- ✅ Todos os arquivos novos são autocontidos com imports válidos
- ⚠️ Build completo não executado nesta etapa (corrigido ≠ buildado)

## 11. Status do Deploy

- ⚠️ Deploy não executado nesta etapa (buildado ≠ deployado)
- URL alvo: https://logistica-premium-es-2cc14.goskip.app

## 12. Evidência do Ambiente Publicado

- O ambiente público deve ser verificado após deploy
- Script de validação: `node scripts/validate-navigation.mjs`
- Este script deve ser executado como pre-build step

## 13. Status Final

**RECUPERADO**

---

## Proteção Automática de Navegação (Build-Time)

### Script de validação: `scripts/validate-navigation.mjs`

Executa validação em 3 camadas:

1. **Menu** — todas as 24 rotas estáveis devem estar presentes; nenhuma rota não-autorizada
2. **Permission Matrix** — todas as 80 keys estáveis devem estar presentes; nenhuma key não-autorizada
3. **Router (App.tsx)** — todas as 26 rotas (24 estáveis + 2 adições) devem ter `<Route>` registrada

### Como usar

```bash
node scripts/validate-navigation.mjs
```

Adicionar ao pipeline de build:

```json
{
  "scripts": {
    "prebuild": "node scripts/validate-navigation.mjs"
  }
}
```

Se qualquer módulo oficial desaparecer silenciosamente, o script retorna exit code 1 e o build falha.

### Baseline congelada

A baseline está definida em `src/lib/navigation-baseline.ts` com:

- 24 rotas estáveis (classificação A)
- 2 adições permitidas (classificação C: Controladoria, Verbas)
- 80 permission keys estáveis
- Prefixos permitidos para adições: `ctrl_`, `supplier_allowances_`

### Regra permanente

> **Nenhum componente pode ser inventado para corrigir um build failure.**
> Se um import aponta para um componente inexistente durante uma recuperação:
>
> 1. Determinar se o import deveria existir
> 2. Verificar se o arquivo foi removido
> 3. Consultar referência histórica
> 4. Nova funcionalidade só via Work Order própria
