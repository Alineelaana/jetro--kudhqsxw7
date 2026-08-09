# Guia de Versionamento Local de Migrações (Alternativa ao GitHub)

## Status

Ativo — Alternativa temporária até a ativação da conexão GitHub (premium)

## Objetivo

Este documento orienta a equipe sobre como versionar localmente as migrações do PocketBase e os hooks, garantindo rastreabilidade e controle de alterações enquanto a integração com GitHub não está disponível.

---

## 1. Estrutura de Diretórios

```
pocketbase/
├── migrations/          # Migrações do banco de dados (schema + seeds)
│   ├── 0001_create_collections.js
│   ├── 0002_seed_data.js
│   ├── ...
│   └── 0159_seed_operational_flow_e2e.js
└── hooks/               # Hooks server-side (rotas, lifecycle, cron)
    ├── audit_create.js
    ├── network_link_guard.js
    ├── ...
    └── wms_wave_release.js
```

## 2. Convenções de Nomenclatura

### Migrações

- **Formato:** `NNNN_description.js` — 4 dígitos sequenciais, começando em `0001`
- **Próxima migração disponível:** `0160`
- **Regra:** Nunca reutilizar numeração existente
- **Regra:** Migrações marcadas como `(applied)` são imutáveis — nunca modificar
- **Regra:** Migrações marcadas como `(failed)` devem ser corrigidas no mesmo arquivo

### Hooks

- **Formato:** `nome_descritivo.js` — letras, dígitos, hífens e underscores
- **Regra:** Um `routerAdd` ou hook por arquivo
- **Regra:** Nome do arquivo = slug de deploy

## 3. Princípios de Versionamento Local

### 3.1 Idempotência

Toda migração de seed deve ser idempotente:

```javascript
try {
  app.findFirstRecordByData('collection', 'unique_field', value)
  return // já existe — pular
} catch (_) {
  // não existe — criar
}
```

### 3.2 Reversibilidade

Toda migração deve ter função `down` que reverte `up`:

```javascript
migrate(
  (app) => {
    /* up — aplicar */
  },
  (app) => {
    /* down — reverter */
  },
)
```

### 3.3 Rastreabilidade

Cada migração deve incluir:

- Numeração sequencial única
- Descrição clara no nome do arquivo
- Função `up` e `down` completas
- Dados de seed realistas (não "teste" ou "lorem")

## 4. Checklist para Nova Migração

1. [ ] Verificar o último número de migração aplicada
2. [ ] Criar arquivo com próximo número sequencial
3. [ ] Implementar função `up` com lógica de criação/modificação
4. [ ] Implementar função `down` com lógica de reversão
5. [ ] Garantir idempotência (verificar antes de inserir)
6. [ ] Testar localmente antes de publicar
7. [ ] Documentar o propósito da migração
8. [ ] Não modificar migrações já aplicadas

## 5. Checklist para Novo Hook

1. [ ] Nomear arquivo seguindo convenção (letras, dígitos, hífens, underscores)
2. [ ] Um route/hook por arquivo
3. [ ] Toda lógica inline dentro do callback (sem top-level helpers)
4. [ ] Prefixo `/backend/v1/` para rotas customizadas
5. [ ] Tratamento de erros com `$app.logger()`
6. [ ] Não usar `await` (JSVM é síncrono)

## 6. Migrações Atuais (Resumo)

| Intervalo | Descrição                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------ |
| 0001–0027 | Collections base, seeds iniciais, chat, partners                                                       |
| 0028–0036 | Produtos, compras, pricing, cadastros, vendas                                                          |
| 0037–0047 | Estoque, WMS, governance, configurações                                                                |
| 0048–0054 | WMS collections, logistics, mapa, notificações                                                         |
| 0055–0066 | Financeiro, RH, DP, SST, seeds piloto                                                                  |
| 0067–0074 | Fiscal, contábil, AI, atendimento, CRM                                                                 |
| 0075–0088 | Indústria (specs, BOM, rotas, qualidade, seeds)                                                        |
| 0089–0106 | Certificação, RLS, MFA, industrial extended, intelligence                                              |
| 0107–0127 | BI, promotions, supplier allowance, controladoria, RH/DP/SST enterprise                                |
| 0128–0139 | Trade marketing, MK, verbas, corporate docs, business days                                             |
| 0140–0149 | Commission rules, performance, validity alerts                                                         |
| 0150–0159 | Financial extended, collection center, client networks, transport journeys, logistics agents, E2E seed |

## 7. Quando o GitHub Estiver Disponível

1. Conectar o repositório via Skip Cloud Settings
2. As migrações e hooks já versionados localmente serão sincronizados
3. Novas migrações devem seguir o mesmo padrão de nomenclatura
4. O histórico local é preservado — apenas novas alterações passam a ter PR/review

---

**Velora Log — Gestão Empresarial Inteligente**
