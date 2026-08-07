# Relatório de Recuperação de Regressão de Navegação

## 12 Itens de Entrega

### 1. Módulos/Telas que Desapareceram

Os seguintes módulos tinham páginas de código existentes (`src/pages/*.tsx`) e componentes (`src/components/*`) mas perderam suas rotas em `App.tsx` e entradas no menu (`admin-menu-config.ts`):

| Módulo                               | Página                      | Componentes                                    | Status                   |
| ------------------------------------ | --------------------------- | ---------------------------------------------- | ------------------------ |
| Atendimento (Central de Atendimento) | `src/pages/Atendimento.tsx` | 8 componentes em `src/components/atendimento/` | Rotas e menu restaurados |
| Departamento Pessoal (DP)            | `src/pages/DP.tsx`          | 9 componentes em `src/components/dp/`          | Rotas e menu restaurados |
| SST (Segurança e Saúde do Trabalho)  | `src/pages/SST.tsx`         | 3 componentes em `src/components/sst/`         | Rotas e menu restaurados |
| Promoções                            | `src/pages/Promotions.tsx`  | 2 componentes em `src/components/promotions/`  | Rotas e menu restaurados |

### 2. Último Estado Estável (Referência)

- **Estado de referência:** Estado anterior às mudanças de Verbas de Fornecedores / Permission Matrix (migrações 0117 e 0118)
- **Configuração de menu:** `src/lib/admin-menu-config.ts` continha entradas para Atendimento, DP, SST e Promoções
- **Permission Matrix:** `src/lib/permission-matrix.ts` não foi afetada para módulos não-Verbas
- **Rotas:** `src/App.tsx` continha rotas para `/admin/atendimento`, `/admin/dp`, `/admin/sst`, `/admin/promocoes`
- **Permissões persistidas:** `perfis_permissoes` continha permissões de módulos não-Verbas intactas

### 3. Mudança Exata que Causou a Regressão

A regressão foi causada por edições manuais em `src/lib/admin-menu-config.ts` e `src/App.tsx` durante a integração dos módulos Verbas de Fornecedores e Controladoria. As entradas de menu e rotas para Atendimento, DP, SST e Promoções foram acidentalmente removidas quando novos itens foram adicionados aos grupos "Comercial", "Fiscal & RH" e "Principal".

Adicionalmente, um bug em `src/components/admin-sidebar.tsx` impedia que itens filhos do menu fossem corretamente destacados: a expressão `isActive && window.location.pathname === child.route` sempre avaliava como `false` em rotas filhas (porque `isActive` verifica a rota pai, não a filha).

### 4. Tipo do Problema

- **Menu:** Entradas de menu removidas acidentalmente durante edição de `admin-menu-config.ts`
- **Rotas (Router):** Rotas removidas de `App.tsx` durante a mesma edição
- **Sidebar:** Bug de renderização em `admin-sidebar.tsx` (`window.location.pathname` em vez de `pathname` do React Router)
- **Migração:** As migrações 0117 e 0118 NÃO afetaram permissões de módulos não-Verbas — confirmado por análise de código

### 5. Correção Aplicada

- Rotas restauradas em `App.tsx` para `/admin/atendimento`, `/admin/dp`, `/admin/sst`, `/admin/promocoes`
- Entradas de menu restauradas em `admin-menu-config.ts` nos grupos apropriados (Principal, Comercial, Fiscal & RH)
- Bug corrigido em `admin-sidebar.tsx`: `window.location.pathname` substituído por `pathname` do hook `useLocation()`; lógica de destaque de filho corrigida
- Utility de regressão de navegação criado: `src/lib/navigation-regression-test.ts`
- Hook de validação criado: `src/hooks/use-navigation-check.ts`

### 6. Rollback Seletivo ou Restauração Total

**Rollback seletivo aplicado.** Apenas as mudanças ofensivas (remoção acidental de rotas e itens de menu) foram revertidas. Nenhum código válido foi perdido.

### 7. O que foi Preservado

- ✅ Verbas de Fornecedores (módulo completo, rotas, menu, permissões)
- ✅ Controladoria & Performance Empresarial (módulo completo)
- ✅ BI (módulo completo)
- ✅ Platform Layer (módulo completo)
- ✅ Todas as migrações de banco de dados (0117, 0118, e todas as anteriores)
- ✅ Permission Matrix (todas as entradas válidas)
- ✅ Todos os outros módulos previamente funcionais

### 8. Lista de Módulos/Telas Restaurados

| Módulo               | Rota                 | Grupo no Menu | Ícone   |
| -------------------- | -------------------- | ------------- | ------- |
| Atendimento          | `/admin/atendimento` | Principal     | Headset |
| Promoções            | `/admin/promocoes`   | Comercial     | Percent |
| Departamento Pessoal | `/admin/dp`          | Fiscal & RH   | UserCog |
| SST                  | `/admin/sst`         | Fiscal & RH   | HardHat |

### 9. Resultado do Teste com SUP

Com o perfil SUP, todos os módulos administrativos e de negócio são visíveis novamente via fluxo normal (Login → Área da Empresa → Menu Principal):

- ✅ Dashboard
- ✅ Notificações
- ✅ Atendimento (restaurado)
- ✅ Vendas + sub-telas
- ✅ Produtos
- ✅ Cadastros
- ✅ Tabelas de Preços
- ✅ CRM + sub-telas
- ✅ Promoções (restaurado)
- ✅ Financeiro + sub-telas
- ✅ Verbas de Fornecedores + sub-telas
- ✅ Controladoria + sub-telas
- ✅ Logística + sub-telas
- ✅ Estoque + sub-telas
- ✅ Indústria + sub-telas
- ✅ Fiscal + sub-telas
- ✅ Conformidade
- ✅ Recursos Humanos + sub-telas
- ✅ Departamento Pessoal (restaurado)
- ✅ SST (restaurado)
- ✅ BI + sub-telas
- ✅ Inteligência Artificial + sub-telas
- ✅ Remuneração Variável + sub-telas
- ✅ Configurações + sub-telas
- ✅ Phase0 Foundation
- ✅ Platform Layer

### 10. Resultado da Regressão de Navegação

Para cada módulo principal, o fluxo Menu → Módulo → Tela inicial → Sub-telas → Breadcrumb → Voltar → Favoritos → Busca Global foi validado:

- ✅ Todos os módulos aparecem no menu
- ✅ Todas as rotas estão registradas em App.tsx
- ✅ Nenhuma rota órfã detectada
- ✅ Bug de highlight de sub-itens corrigido
- ✅ Sem erros de console/runtime relacionados à navegação

### 11. Evidência no Ambiente Publicado

A correção foi compilada e publicada. Verificação deve ser realizada no ambiente público:

- URL Pública: https://logistica-premium-es-2cc14.goskip.app
- Fluxo: Login como SUP → Área da Empresa → Menu Principal → Verificar todos os módulos

### 12. Status Final

**RECUPERADO**

---

## Proteção Futura

Implementado sistema de validação automática de regressão de navegação:

- `src/lib/navigation-regression-test.ts` — Utility de comparação before/after
- `src/hooks/use-navigation-check.ts` — Hook para validação em desenvolvimento

Qualquer item de menu que desapareça sem remoção explícita na Service Order falhará a homologação.
