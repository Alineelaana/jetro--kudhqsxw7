/// <reference path="../pb_data/types.d.ts" />
///
/// Migração 0370 — Módulo FLEX (Saldo FLEX do RCA)
/// Cria as coleções do saldo comercial do representante:
///   - flex_accounts: conta do representante (1 por empresa+filial+RCA) com
///     saldo efetivado e saldo reservado — fonte oficial do saldo no Huram.
///   - flex_movements: extrato (ledger) de todos os movimentos:
///     credito_gerado, credito_liberado, reserva, flex_gasto,
///     liberacao_reserva, estorno, ajuste.
/// Idempotente: try/catch no findCollectionByNameOrId (find lança quando a
/// coleção não existe) + new Collection({...}) LITERAL inline no app.save
/// (spec em variável falha na validação). Sem seed de dados.
///
migrate(
  (app) => {
    // ---------- 1. Conta do representante (empresa+filial+RCA única) ----------
    try {
      app.findCollectionByNameOrId('flex_accounts')
      console.log('0370 skip flex_accounts (já existe)')
    } catch (err) {
      app.save(
        new Collection({
          name: 'flex_accounts',
          type: 'base',
          listRule: '',
          viewRule: '',
          createRule: '',
          updateRule: '',
          deleteRule: '',
          fields: [
            { name: 'empresa_id', type: 'text' },
            { name: 'filial_id', type: 'text' },
            { name: 'rca_id', type: 'text' },
            { name: 'rca_name', type: 'text' },
            { name: 'gerente_id', type: 'text' },
            { name: 'gerente_name', type: 'text' },
            { name: 'equipe_id', type: 'text' },
            { name: 'equipe_name', type: 'text' },
            { name: 'balance', type: 'number' },
            { name: 'reserved', type: 'number' },
          ],
          indexes: [
            'CREATE UNIQUE INDEX idx_flex_accounts_scope ON flex_accounts (empresa_id, filial_id, rca_id)',
          ],
        }),
      )
      console.log('0370 created flex_accounts')
    }

    // ---------- 2. Ledger de movimentos (append-only) ----------
    try {
      app.findCollectionByNameOrId('flex_movements')
      console.log('0370 skip flex_movements (já existe)')
    } catch (err) {
      app.save(
        new Collection({
          name: 'flex_movements',
          type: 'base',
          listRule: '',
          viewRule: '',
          createRule: '',
          updateRule: '',
          deleteRule: '',
          fields: [
            {
              name: 'type',
              type: 'select',
              values: [
                'credito_gerado',
                'credito_liberado',
                'reserva',
                'flex_gasto',
                'liberacao_reserva',
                'estorno',
                'ajuste',
              ],
              maxSelect: 1,
            },
            {
              name: 'status',
              type: 'select',
              values: ['efetivado', 'reservado', 'cancelado', 'estornado'],
              maxSelect: 1,
            },
            // Identificador único do movimento (pedido+item) vindo do Avatar FV —
            // reenvios com o mesmo external_id NÃO duplicam (idempotência).
            { name: 'external_id', type: 'text' },
            { name: 'empresa_id', type: 'text' },
            { name: 'filial_id', type: 'text' },
            { name: 'rca_id', type: 'text' },
            { name: 'rca_name', type: 'text' },
            { name: 'gerente_id', type: 'text' },
            { name: 'gerente_name', type: 'text' },
            { name: 'equipe_id', type: 'text' },
            { name: 'equipe_name', type: 'text' },
            { name: 'cliente_id', type: 'text' },
            { name: 'cliente_name', type: 'text' },
            { name: 'produto_id', type: 'text' },
            { name: 'produto_descricao', type: 'text' },
            { name: 'quantidade', type: 'number' },
            { name: 'preco_base', type: 'number' },
            { name: 'preco_negociado', type: 'number' },
            { name: 'valor_flex', type: 'number' },
            { name: 'charged_value', type: 'number' },
            { name: 'pedido_fv', type: 'text' },
            { name: 'pedido_huram', type: 'text' },
            { name: 'nf', type: 'text' },
            { name: 'integration_status', type: 'text' }, // pendente | concluida | falha
            { name: 'link_type', type: 'text' }, // reserva_debito / estorno_original
            { name: 'link_id', type: 'text' },
            { name: 'link_cliente_id', type: 'text' },
            { name: 'link_cliente_name', type: 'text' },
            { name: 'reason', type: 'text' },
            { name: 'balance_before', type: 'number' },
            { name: 'balance_after', type: 'number' },
            { name: 'reserved_before', type: 'number' },
            { name: 'reserved_after', type: 'number' },
            { name: 'created_by', type: 'text' },
          ],
          indexes: [
            'CREATE UNIQUE INDEX idx_flex_mov_external ON flex_movements (external_id) WHERE external_id != ""',
            'CREATE INDEX idx_flex_mov_scope ON flex_movements (empresa_id, filial_id, rca_id)',
          ],
        }),
      )
      console.log('0370 created flex_movements')
    }
  },
  (app) => {
    // rollback: remove as coleções se existirem
    try {
      const mv = app.findCollectionByNameOrId('flex_movements')
      if (mv) app.delete(mv)
    } catch (err) {}
    try {
      const acc = app.findCollectionByNameOrId('flex_accounts')
      if (acc) app.delete(acc)
    } catch (err) {}
  },
)
