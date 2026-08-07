# Plano de Correções — Domínio 06

> **Framework:** FCP-MODULAR v1.0

---

## Correções

### COR-01: Adicionar Unique Index em CNPJ/CPF

| NC | NC-LOW-002 |
| Prioridade | P2 |
| Esforço | Baixo (1 dia) |
| Ação | Criar migration com unique index em campos `cnpj`/`cpf` das collections de cadastro |
| Encerramento | Não é possível criar registro com CNPJ/CPF duplicado |

### COR-02: Converter category_name para Relation

| NC | NC-LOW-003 |
| Prioridade | P3 |
| Esforço | Médio (1 semana) |
| Ação | Migrar `subcategorias.category_name` para `relation→categorias` |
| Encerramento | Integridade referencial entre categorias e subcategorias |

## Resumo

| #      | Correção                        | Prioridade | Esforço | Status   |
| ------ | ------------------------------- | ---------- | ------- | -------- |
| COR-01 | Unique index CNPJ/CPF           | P2         | Baixo   | Pendente |
| COR-02 | Relation categoria→subcategoria | P3         | Médio   | Pendente |
