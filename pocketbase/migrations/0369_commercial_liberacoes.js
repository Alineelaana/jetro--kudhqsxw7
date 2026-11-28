/// <reference path="../pb_data/types.d.ts" />
// 0369 — Liberações Comerciais (Rotinas): fila de análise de pedidos com
// divergências comerciais (ex.: desconto acima do limite permitido).
// Migração ADITIVA e idempotente: cria cada coleção apenas se ela não existir.
// Sem seed de dados: a fila nasce vazia até existirem pedidos com divergência.

migrate(
  (app) => {
    var authed = "@request.auth.id != ''"

    // ---------- 1. Solicitações (uma por pedido) ----------
    try {
      app.findCollectionByNameOrId('commercial_release_requests')
      console.log('0369 skip commercial_release_requests (já existe)')
    } catch (err) {
      app.save(
        new Collection({
          name: 'commercial_release_requests',
          type: 'base',
          listRule: authed,
          viewRule: authed,
          createRule: authed,
          updateRule: authed,
          deleteRule: null,
          fields: [
            { name: 'empresa_id', type: 'text' },
            { name: 'filial_id', type: 'text' },
            { name: 'order_id', type: 'text' },
            { name: 'order_number', type: 'text' },
            { name: 'client_id', type: 'text' },
            { name: 'client_name', type: 'text' },
            { name: 'rca_id', type: 'text' },
            { name: 'rca_name', type: 'text' },
            { name: 'requester_id', type: 'text' },
            { name: 'requester_name', type: 'text' },
            { name: 'responsavel_id', type: 'text' },
            { name: 'responsavel_name', type: 'text' },
            {
              name: 'status',
              type: 'select',
              maxSelect: 1,
              values: ['pendente', 'aprovada', 'recusada', 'cancelada'],
            },
            { name: 'negotiation_type', type: 'text' },
            { name: 'operation', type: 'text' },
            { name: 'freight_type', type: 'text' },
            { name: 'order_value', type: 'number' },
            { name: 'order_date', type: 'date' },
            { name: 'divergences_count', type: 'number' },
            { name: 'resolved_count', type: 'number' },
            { name: 'source', type: 'text' },
            { name: 'notes', type: 'text' },
            { name: 'created', type: 'autodate', onCreate: true },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
          indexes: [
            'CREATE INDEX idx_crr_order ON commercial_release_requests (order_id)',
            'CREATE INDEX idx_crr_status ON commercial_release_requests (status)',
            'CREATE INDEX idx_crr_empresa ON commercial_release_requests (empresa_id)',
          ],
        }),
      )
      console.log('0369 created commercial_release_requests')
    }

    // ---------- 2. Divergências (uma linha por regra violada) ----------
    try {
      app.findCollectionByNameOrId('commercial_release_divergences')
      console.log('0369 skip commercial_release_divergences (já existe)')
    } catch (err) {
      app.save(
        new Collection({
          name: 'commercial_release_divergences',
          type: 'base',
          listRule: authed,
          viewRule: authed,
          createRule: authed,
          updateRule: authed,
          deleteRule: null,
          fields: [
            { name: 'request_id', type: 'text' },
            { name: 'order_id', type: 'text' },
            { name: 'order_item_id', type: 'text' },
            { name: 'product_code', type: 'text' },
            { name: 'product_description', type: 'text' },
            { name: 'quantity', type: 'number' },
            { name: 'table_price', type: 'number' },
            { name: 'requested_discount', type: 'number' },
            { name: 'discount_value', type: 'number' },
            { name: 'ipi_value', type: 'number' },
            { name: 'st_value', type: 'number' },
            { name: 'unit_with_taxes', type: 'number' },
            { name: 'rule_description', type: 'text' },
            {
              name: 'rule_type',
              type: 'select',
              maxSelect: 1,
              values: [
                'desconto_produto',
                'desconto_pedido',
                'limite_credito',
                'prazo_pagamento',
                'quantidade_minima',
                'outro',
              ],
            },
            { name: 'limit_value', type: 'number' },
            { name: 'limit_unit', type: 'select', maxSelect: 1, values: ['percent', 'real'] },
            { name: 'requested_value', type: 'number' },
            { name: 'requested_unit', type: 'select', maxSelect: 1, values: ['percent', 'real'] },
            { name: 'vendor_name', type: 'text' },
            {
              name: 'status',
              type: 'select',
              maxSelect: 1,
              values: ['pendente', 'aplicada', 'recusada'],
            },
            { name: 'decided_by', type: 'text' },
            { name: 'decided_at', type: 'date' },
            { name: 'decision_note', type: 'text' },
            { name: 'empresa_id', type: 'text' },
            { name: 'filial_id', type: 'text' },
            { name: 'created', type: 'autodate', onCreate: true },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
          indexes: [
            'CREATE INDEX idx_crd_request ON commercial_release_divergences (request_id)',
            'CREATE INDEX idx_crd_status ON commercial_release_divergences (status)',
          ],
        }),
      )
      console.log('0369 created commercial_release_divergences')
    }

    // ---------- 3. Histórico de decisões (auditoria, append-only) ----------
    try {
      app.findCollectionByNameOrId('commercial_release_decisions')
      console.log('0369 skip commercial_release_decisions (já existe)')
    } catch (err) {
      app.save(
        new Collection({
          name: 'commercial_release_decisions',
          type: 'base',
          listRule: authed,
          viewRule: authed,
          createRule: authed,
          updateRule: null,
          deleteRule: null,
          fields: [
            { name: 'request_id', type: 'text' },
            { name: 'divergence_id', type: 'text' },
            { name: 'order_number', type: 'text' },
            { name: 'client_name', type: 'text' },
            { name: 'rca_name', type: 'text' },
            { name: 'rule_description', type: 'text' },
            { name: 'limit_value', type: 'number' },
            { name: 'requested_value', type: 'number' },
            { name: 'decision', type: 'select', maxSelect: 1, values: ['aplicada', 'recusada'] },
            { name: 'reason', type: 'text' },
            { name: 'decided_by', type: 'text' },
            { name: 'decided_by_id', type: 'text' },
            { name: 'empresa_id', type: 'text' },
            { name: 'filial_id', type: 'text' },
            { name: 'created', type: 'autodate', onCreate: true },
          ],
          indexes: [
            'CREATE INDEX idx_crdc_request ON commercial_release_decisions (request_id)',
            'CREATE INDEX idx_crdc_divergence ON commercial_release_decisions (divergence_id)',
          ],
        }),
      )
      console.log('0369 created commercial_release_decisions')
    }
  },
  (app) => {
    // down: no-op — não destrói dados reais
  },
)
