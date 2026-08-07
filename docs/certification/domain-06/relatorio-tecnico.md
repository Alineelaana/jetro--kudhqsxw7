# Relatório Técnico do Domínio 06 — Cadastros Mestres

> **Domínio:** 06 — Cadastros Mastros
> **Framework:** FCP-MODULAR v1.0

---

## 1. Visão Geral

Cobra cadastros: transportadoras, categorias, subcategorias, marcas, unidades de medida, plano de contas, centros de custo, bancos, contas bancárias, formas e condições de pagamento, vendedores, representantes, empresas, filiais.

**Tipo:** Fato Comprovado — verificado via schema vivo e `src/services/cadastros.ts`.

---

## 2. Funcionalidades

### 2.1 Collections de Cadastro

15+ collections de cadastro mestre no schema vivo: `empresas`, `filiais`, `transportadoras`, `categorias`, `subcategorias`, `marcas`, `unidades_medida`, `centros_custo`, `plano_contas`, `bancos`, `contas_bancarias`, `formas_pagamento`, `condicoes_pagamento`, `vendedores`, `representantes`.
**Tipo:** Fato Comprovado

### 2.2 Serviços e Componentes

`src/services/cadastros.ts` com CRUD genérico. `src/components/cadastros/` com `CadastrosPanel`, `CadastroFormDialog`, `CadastroStandardScreen`.
**Tipo:** Fato Comprovado

### 2.3 Configuração

`src/lib/cadastros-config.ts` e `src/lib/cadastros-types.ts` definem configuração e tipos para cada cadastro.
**Tipo:** Fato Comprovado

---

## 3. Não Conformidades

### NC-LOW-002: Sem Validação de CNPJ/CPF Duplicado

**Severidade:** Baixa | **Evidência:** Não há unique index em campos `cnpj`/`cpf` em collections de cadastro | **Impacto:** Possível duplicação de registros

### NC-LOW-003: Sem Relacionamento Categoria→Subcategoria

**Severidade:** Baixa | **Evidência:** `subcategorias` tem campo `category_name` (text) em vez de relation | **Impacto:** Integridade referencial fraca

---

## 4. Conclusão

Cadastros mestres completos e funcionais com padrão consistente de CRUD. NCs são de baixa severidade.

**Tipo:** Fato Comprovado
