migrate(
  (app) => {
    // 0300_olive_industry_module.js - Módulo Industrial de Azeitonas HURAM
    // Regras de RLS com multitenancy flexível: permite SUP/admin OU empresa coincidente OU vazio
    var ruleMultitenant =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || empresa_id = @request.auth.empresa_id || (empresa_id = '' && @request.auth.empresa_id = ''))"
    var ruleMultitenantWrite =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || empresa_id = @request.auth.empresa_id || empresa_id = '')"
    var SA = "@request.auth.role = 'SUP'"

    // Coleções existentes para relacionamento
    var partnersCol = app.findCollectionByNameOrId('partners')
    var productsCol = app.findCollectionByNameOrId('products')
    var poCol = app.findCollectionByNameOrId('production_orders')
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    // 1. PRODUTORES E PROPRIEDADES AGRÍCOLAS
    app.save(
      new Collection({
        name: 'agricultural_producers',
        type: 'base',
        listRule: ruleMultitenant,
        viewRule: ruleMultitenant,
        createRule: ruleMultitenantWrite,
        updateRule: ruleMultitenantWrite,
        deleteRule: SA,
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'code', type: 'text' },
          { name: 'document_cpf_cnpj', type: 'text' },
          { name: 'property_name', type: 'text', required: true },
          { name: 'property_location', type: 'text' },
          { name: 'cadpro_car', type: 'text' },
          {
            name: 'partner_id',
            type: 'relation',
            collectionId: partnersCol ? partnersCol.id : '',
            maxSelect: 1,
          },
          { name: 'contact_phone', type: 'text' },
          { name: 'contact_email', type: 'text' },
          { name: 'olive_varieties', type: 'json' }, // Ex: ["Arbequina", "Picual", "Koroneiki", "Gordal", "Manzanilla"]
          { name: 'total_hectares', type: 'number' },
          { name: 'active', type: 'bool' },
          { name: 'empresa_id', type: 'text' },
          { name: 'filial_id', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_agri_prod_code ON agricultural_producers (code)',
          'CREATE INDEX idx_agri_prod_empresa ON agricultural_producers (empresa_id)',
          'CREATE INDEX idx_agri_prod_partner ON agricultural_producers (partner_id)',
        ],
      }),
    )

    var agriProdCol = app.findCollectionByNameOrId('agricultural_producers')

    // 2. TICKETS DE PESAGEM E RECEBIMENTO DE SAFRA
    app.save(
      new Collection({
        name: 'olive_harvest_tickets',
        type: 'base',
        listRule: ruleMultitenant,
        viewRule: ruleMultitenant,
        createRule: ruleMultitenantWrite,
        updateRule: ruleMultitenantWrite,
        deleteRule: SA,
        fields: [
          { name: 'ticket_number', type: 'text', required: true },
          { name: 'date_time', type: 'date', required: true },
          {
            name: 'producer_id',
            type: 'relation',
            collectionId: agriProdCol.id,
            maxSelect: 1,
            required: true,
          },
          {
            name: 'raw_material_product_id',
            type: 'relation',
            collectionId: productsCol ? productsCol.id : '',
            maxSelect: 1,
          },
          { name: 'vehicle_plate', type: 'text' },
          { name: 'driver_name', type: 'text' },
          { name: 'variety', type: 'text' }, // Variedade da azeitona (Arbequina, Picual, etc.)
          { name: 'gross_weight_kg', type: 'number', required: true }, // Peso bruto
          { name: 'tare_weight_kg', type: 'number', required: true }, // Tara do caminhão/bins
          { name: 'net_weight_kg', type: 'number', required: true }, // Peso líquido
          // Classificação da Fruta por Grade de Qualidade:
          { name: 'caliber_size', type: 'text' }, // Calibre (Ex: 180-200, 200-240, etc.)
          { name: 'maturation_index', type: 'number' }, // Grau de maturação (0 a 7 ou escala de cor)
          { name: 'maturation_stage', type: 'text' }, // Verde, Véraison, Madura, Preta
          { name: 'defect_percentage', type: 'number' }, // % de defeitos (mosca, granizo, podridão)
          { name: 'dirt_impurity_percentage', type: 'number' }, // % impurezas/folhas
          {
            name: 'quality_grade',
            type: 'select',
            values: ['A', 'B', 'C', 'DESCARTE'],
            maxSelect: 1,
          },
          { name: 'price_per_ton', type: 'number', required: true }, // Preço por tonelada conforme grade
          { name: 'deductions_amount', type: 'number' }, // Deduções (impurezas, desvios)
          { name: 'final_payable_amount', type: 'number', required: true }, // Valor a pagar ao produtor
          {
            name: 'payment_status',
            type: 'select',
            values: ['pendente', 'titulo_gerado', 'pago', 'cancelado'],
            maxSelect: 1,
          },
          { name: 'financial_payable_id', type: 'text' }, // Vínculo com financial_payables para unicidade
          { name: 'stock_lot_number', type: 'text' }, // Lote de estoque gerado
          { name: 'stock_movement_id', type: 'text' }, // Movimentação de estoque de entrada
          {
            name: 'status',
            type: 'select',
            values: ['em_pesagem', 'classificado', 'fechado', 'cancelado'],
            maxSelect: 1,
          },
          {
            name: 'inspector_id',
            type: 'relation',
            collectionId: usersCol ? usersCol.id : '',
            maxSelect: 1,
          },
          { name: 'notes', type: 'text' },
          { name: 'empresa_id', type: 'text' },
          { name: 'filial_id', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_harvest_ticket_number ON olive_harvest_tickets (ticket_number)',
          'CREATE INDEX idx_harvest_ticket_producer ON olive_harvest_tickets (producer_id)',
          'CREATE INDEX idx_harvest_ticket_status ON olive_harvest_tickets (status)',
          'CREATE INDEX idx_harvest_ticket_lot ON olive_harvest_tickets (stock_lot_number)',
          'CREATE INDEX idx_harvest_ticket_empresa ON olive_harvest_tickets (empresa_id)',
        ],
      }),
    )

    var harvestCol = app.findCollectionByNameOrId('olive_harvest_tickets')

    // 3. TANQUES DE CURA (CADASTRO FÍSICO DO PARQUE DE TANQUES)
    app.save(
      new Collection({
        name: 'curing_tanks',
        type: 'base',
        listRule: ruleMultitenant,
        viewRule: ruleMultitenant,
        createRule: ruleMultitenantWrite,
        updateRule: ruleMultitenantWrite,
        deleteRule: SA,
        fields: [
          { name: 'code', type: 'text', required: true }, // Ex: TQ-01, TQ-02
          { name: 'name', type: 'text', required: true },
          { name: 'capacity_kg', type: 'number', required: true }, // Capacidade em kg de azeitona
          { name: 'capacity_liters', type: 'number' }, // Volume total em litros
          {
            name: 'tank_type',
            type: 'select',
            values: ['fibra', 'inox', 'polietileno', 'alvenaria_epoxi'],
            maxSelect: 1,
          },
          { name: 'location_sector', type: 'text' }, // Pátio A, Galpão B, etc.
          {
            name: 'current_status',
            type: 'select',
            values: [
              'vazio',
              'em_cura',
              'pronto_para_processamento',
              'em_processamento',
              'manutencao',
              'higienizacao',
            ],
            maxSelect: 1,
          },
          { name: 'current_batch_id', type: 'text' }, // Vínculo com o lote ativo em cura
          { name: 'active', type: 'bool' },
          { name: 'notes', type: 'text' },
          { name: 'empresa_id', type: 'text' },
          { name: 'filial_id', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_curing_tank_code ON curing_tanks (code)',
          'CREATE INDEX idx_curing_tank_status ON curing_tanks (current_status)',
          'CREATE INDEX idx_curing_tank_empresa ON curing_tanks (empresa_id)',
        ],
      }),
    )

    var tanksCol = app.findCollectionByNameOrId('curing_tanks')

    // 4. LOTES DE CURA EM TANQUE
    app.save(
      new Collection({
        name: 'curing_batches',
        type: 'base',
        listRule: ruleMultitenant,
        viewRule: ruleMultitenant,
        createRule: ruleMultitenantWrite,
        updateRule: ruleMultitenantWrite,
        deleteRule: SA,
        fields: [
          { name: 'batch_code', type: 'text', required: true }, // Ex: LCURA-2026-001
          {
            name: 'tank_id',
            type: 'relation',
            collectionId: tanksCol.id,
            maxSelect: 1,
            required: true,
          },
          {
            name: 'harvest_ticket_id',
            type: 'relation',
            collectionId: harvestCol.id,
            maxSelect: 1,
          },
          {
            name: 'raw_material_product_id',
            type: 'relation',
            collectionId: productsCol ? productsCol.id : '',
            maxSelect: 1,
          },
          { name: 'entry_date', type: 'date', required: true },
          { name: 'initial_weight_kg', type: 'number', required: true },
          { name: 'current_weight_kg', type: 'number' },
          {
            name: 'brine_type',
            type: 'select',
            values: [
              'salmoura_natural',
              'estilo_sevilhano_soda',
              'estilo_californiano',
              'cura_seca_sal',
            ],
            maxSelect: 1,
          },
          { name: 'initial_salt_concentration_percent', type: 'number' }, // % Sal inicial (ex: 8.5% a 10%)
          { name: 'initial_ph', type: 'number' }, // pH inicial (ex: 4.2 a 4.5)
          { name: 'target_curing_days', type: 'number' }, // Dias previstos de fermentação/cura (ex: 90 a 180)
          { name: 'expected_completion_date', type: 'date' },
          { name: 'actual_completion_date', type: 'date' },
          { name: 'fermentation_loss_percentage', type: 'number' }, // Perda acumulada por fermentação/drenagem
          { name: 'fermentation_loss_kg', type: 'number' },
          {
            name: 'status',
            type: 'select',
            values: ['em_cura', 'pronto_para_processamento', 'processado', 'descartado'],
            maxSelect: 1,
          },
          {
            name: 'destination_production_order_id',
            type: 'relation',
            collectionId: poCol ? poCol.id : '',
            maxSelect: 1,
          },
          { name: 'responsible_technician', type: 'text' },
          { name: 'notes', type: 'text' },
          { name: 'empresa_id', type: 'text' },
          { name: 'filial_id', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_curing_batch_code ON curing_batches (batch_code)',
          'CREATE INDEX idx_curing_batch_tank ON curing_batches (tank_id)',
          'CREATE INDEX idx_curing_batch_status ON curing_batches (status)',
          'CREATE INDEX idx_curing_batch_ticket ON curing_batches (harvest_ticket_id)',
          'CREATE INDEX idx_curing_batch_empresa ON curing_batches (empresa_id)',
        ],
      }),
    )

    var batchesCol = app.findCollectionByNameOrId('curing_batches')

    // 5. MEDIÇÕES PERIÓDICAS DO TANQUE DE CURA
    app.save(
      new Collection({
        name: 'curing_measurements',
        type: 'base',
        listRule: ruleMultitenant,
        viewRule: ruleMultitenant,
        createRule: ruleMultitenantWrite,
        updateRule: ruleMultitenantWrite,
        deleteRule: SA,
        fields: [
          {
            name: 'batch_id',
            type: 'relation',
            collectionId: batchesCol.id,
            maxSelect: 1,
            required: true,
          },
          {
            name: 'tank_id',
            type: 'relation',
            collectionId: tanksCol.id,
            maxSelect: 1,
            required: true,
          },
          { name: 'measurement_date', type: 'date', required: true },
          { name: 'salt_concentration_percent', type: 'number', required: true }, // % Sal
          { name: 'ph', type: 'number', required: true }, // pH
          { name: 'temperature_celsius', type: 'number', required: true }, // Temperatura °C
          { name: 'acidity_free_percentage', type: 'number' }, // Acidez livre expressa em ácido lático %
          { name: 'observed_loss_kg', type: 'number' }, // Perda observada na amostragem
          { name: 'corrective_action', type: 'text' }, // Ação corretiva (ajuste de salmoura, reposição de sal)
          { name: 'alert_raised', type: 'bool' }, // Flag se pH ou sal saiu da faixa plausível
          { name: 'alert_reason', type: 'text' },
          { name: 'analyst_name', type: 'text' },
          { name: 'empresa_id', type: 'text' },
          { name: 'filial_id', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_curing_meas_batch ON curing_measurements (batch_id)',
          'CREATE INDEX idx_curing_meas_date ON curing_measurements (measurement_date)',
          'CREATE INDEX idx_curing_meas_empresa ON curing_measurements (empresa_id)',
        ],
      }),
    )

    // 6. PERDAS NA LINHA DE PRODUÇÃO (POR ORDEM E POR FASE)
    app.save(
      new Collection({
        name: 'production_line_losses',
        type: 'base',
        listRule: ruleMultitenant,
        viewRule: ruleMultitenant,
        createRule: ruleMultitenantWrite,
        updateRule: ruleMultitenantWrite,
        deleteRule: SA,
        fields: [
          {
            name: 'production_order_id',
            type: 'relation',
            collectionId: poCol ? poCol.id : '',
            maxSelect: 1,
            required: true,
          },
          { name: 'phase_name', type: 'text', required: true }, // Descaroçamento, Fatiamento, Salmoura, Envase, Recravação, Rotulagem
          {
            name: 'loss_type',
            type: 'select',
            values: [
              'refugo',
              'descarte',
              'fora_de_padrao',
              'avaria_embalagem',
              'vazamento_salmoura',
              'polpa_machucada',
            ],
            maxSelect: 1,
            required: true,
          },
          { name: 'quantity', type: 'number', required: true },
          { name: 'unit', type: 'text', required: true }, // kg, un, litros, caixas
          { name: 'reason', type: 'text', required: true }, // Motivo detalhado
          { name: 'responsible_name', type: 'text', required: true },
          { name: 'unit_cost_estimated', type: 'number' }, // Custo unitário estimado
          { name: 'total_cost_impact', type: 'number' }, // Impacto total no custo da ordem
          { name: 'loss_date', type: 'date', required: true },
          {
            name: 'destination',
            type: 'select',
            values: ['compostagem', 'descarte_sanitario', 'coproduto_oleo', 'retrabalho'],
            maxSelect: 1,
          },
          { name: 'notes', type: 'text' },
          { name: 'empresa_id', type: 'text' },
          { name: 'filial_id', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_line_loss_order ON production_line_losses (production_order_id)',
          'CREATE INDEX idx_line_loss_phase ON production_line_losses (phase_name)',
          'CREATE INDEX idx_line_loss_type ON production_line_losses (loss_type)',
          'CREATE INDEX idx_line_loss_empresa ON production_line_losses (empresa_id)',
        ],
      }),
    )

    // 7. PLANOS DE ANÁLISE LABORATORIAL (PARÂMETROS FÍSICO-QUÍMICOS E MICROBIOLÓGICOS COM LIMITES)
    app.save(
      new Collection({
        name: 'laboratory_analysis_plans',
        type: 'base',
        listRule: ruleMultitenant,
        viewRule: ruleMultitenant,
        createRule: ruleMultitenantWrite,
        updateRule: ruleMultitenantWrite,
        deleteRule: SA,
        fields: [
          { name: 'code', type: 'text', required: true },
          { name: 'title', type: 'text', required: true },
          {
            name: 'target_type',
            type: 'select',
            values: [
              'fruta_in_natura',
              'tanque_cura',
              'produto_acabado',
              'salmoura_cobertura',
              'agua_processo',
            ],
            maxSelect: 1,
            required: true,
          },
          { name: 'parameters', type: 'json' }, // Array de parâmetros: [{ name, unit, min_limit, max_limit, mandatory, method }]
          { name: 'mapa_normative_reference', type: 'text' }, // Ex: MAPA IN 61/2006, RDC 727/2022
          { name: 'active', type: 'bool' },
          { name: 'notes', type: 'text' },
          { name: 'empresa_id', type: 'text' },
          { name: 'filial_id', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_lab_plan_code ON laboratory_analysis_plans (code)',
          'CREATE INDEX idx_lab_plan_target ON laboratory_analysis_plans (target_type)',
          'CREATE INDEX idx_lab_plan_empresa ON laboratory_analysis_plans (empresa_id)',
        ],
      }),
    )

    var labPlansCol = app.findCollectionByNameOrId('laboratory_analysis_plans')

    // 8. ANÁLISES LABORATORIAIS POR LOTE OU TANQUE
    app.save(
      new Collection({
        name: 'laboratory_analyses',
        type: 'base',
        listRule: ruleMultitenant,
        viewRule: ruleMultitenant,
        createRule: ruleMultitenantWrite,
        updateRule: ruleMultitenantWrite,
        deleteRule: SA,
        fields: [
          { name: 'analysis_number', type: 'text', required: true },
          { name: 'plan_id', type: 'relation', collectionId: labPlansCol.id, maxSelect: 1 },
          {
            name: 'sample_type',
            type: 'select',
            values: ['tanque_cura', 'lote_acabado', 'recebimento_safra', 'salmoura'],
            maxSelect: 1,
            required: true,
          },
          { name: 'tank_id', type: 'relation', collectionId: tanksCol.id, maxSelect: 1 },
          { name: 'curing_batch_id', type: 'relation', collectionId: batchesCol.id, maxSelect: 1 },
          {
            name: 'production_order_id',
            type: 'relation',
            collectionId: poCol ? poCol.id : '',
            maxSelect: 1,
          },
          { name: 'lot_number', type: 'text', required: true },
          { name: 'collection_date', type: 'date', required: true },
          { name: 'analysis_date', type: 'date', required: true },
          { name: 'analyst_name', type: 'text', required: true },
          { name: 'results_data', type: 'json' }, // [{ parameter, result_value, min_limit, max_limit, compliant: true/false }]
          {
            name: 'overall_compliance',
            type: 'select',
            values: ['conforme', 'nao_conforme', 'em_analise', 'aprovado_com_restricao'],
            maxSelect: 1,
            required: true,
          },
          { name: 'non_conformity_reason', type: 'text' },
          { name: 'batch_release_authorized', type: 'bool' }, // Flag se o lote está liberado para faturamento
          { name: 'authorized_by', type: 'text' },
          { name: 'notes', type: 'text' },
          { name: 'empresa_id', type: 'text' },
          { name: 'filial_id', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_lab_analysis_num ON laboratory_analyses (analysis_number)',
          'CREATE INDEX idx_lab_analysis_lot ON laboratory_analyses (lot_number)',
          'CREATE INDEX idx_lab_analysis_tank ON laboratory_analyses (tank_id)',
          'CREATE INDEX idx_lab_analysis_order ON laboratory_analyses (production_order_id)',
          'CREATE INDEX idx_lab_analysis_empresa ON laboratory_analyses (empresa_id)',
        ],
      }),
    )

    var labAnalysesCol = app.findCollectionByNameOrId('laboratory_analyses')

    // 9. LAUDOS TÉCNICOS POR EMBALAGEM / LOTE (MAPA E RDC ROTULAGEM)
    app.save(
      new Collection({
        name: 'laboratory_laudos',
        type: 'base',
        listRule: ruleMultitenant,
        viewRule: ruleMultitenant,
        createRule: ruleMultitenantWrite,
        updateRule: ruleMultitenantWrite,
        deleteRule: SA,
        fields: [
          { name: 'laudo_number', type: 'text', required: true }, // Ex: LAU-2026-0001
          { name: 'analysis_id', type: 'relation', collectionId: labAnalysesCol.id, maxSelect: 1 },
          { name: 'lot_number', type: 'text', required: true },
          {
            name: 'product_id',
            type: 'relation',
            collectionId: productsCol ? productsCol.id : '',
            maxSelect: 1,
          },
          {
            name: 'production_order_id',
            type: 'relation',
            collectionId: poCol ? poCol.id : '',
            maxSelect: 1,
          },
          { name: 'package_type', type: 'text' }, // Pote de Vidro 500g, Sachê 2kg, Balde 5kg, Tambor 200L
          { name: 'manufacturing_date', type: 'date' },
          { name: 'expiry_date', type: 'date' },
          { name: 'drained_weight_target_g', type: 'number' }, // Peso drenado nominal
          { name: 'drained_weight_measured_g', type: 'number' }, // Peso drenado aferido
          { name: 'net_weight_target_g', type: 'number' }, // Peso líquido nominal
          { name: 'net_weight_measured_g', type: 'number' }, // Peso líquido aferido
          { name: 'mapa_registration_number', type: 'text' }, // Registro MAPA
          { name: 'rdc_label_compliance', type: 'bool' }, // Conformidade rotulagem RDC 727/2022
          { name: 'technical_responsible_crq', type: 'text' }, // Nome e CRQ/CRF do Responsável Técnico
          {
            name: 'verdict',
            type: 'select',
            values: ['liberado', 'retido_quarentena', 'reprovado_descarte'],
            maxSelect: 1,
            required: true,
          },
          { name: 'emission_date', type: 'date', required: true },
          { name: 'digital_signature_hash', type: 'text' },
          { name: 'pdf_notes', type: 'text' },
          { name: 'empresa_id', type: 'text' },
          { name: 'filial_id', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_lab_laudo_num ON laboratory_laudos (laudo_number)',
          'CREATE INDEX idx_lab_laudo_lot ON laboratory_laudos (lot_number)',
          'CREATE INDEX idx_lab_laudo_order ON laboratory_laudos (production_order_id)',
          'CREATE INDEX idx_lab_laudo_empresa ON laboratory_laudos (empresa_id)',
        ],
      }),
    )

    // 10. CAMPOS ADITIVOS DE ELO AGRÍCOLA EM industrial_traceability
    var traceCol = app.findCollectionByNameOrId('industrial_traceability')
    if (traceCol) {
      try {
        traceCol.fields.add(new TextField({ name: 'producer_id' }))
      } catch (_) {}
      try {
        traceCol.fields.add(new TextField({ name: 'harvest_ticket_id' }))
      } catch (_) {}
      try {
        traceCol.fields.add(new TextField({ name: 'curing_tank_id' }))
      } catch (_) {}
      try {
        traceCol.fields.add(new TextField({ name: 'curing_batch_id' }))
      } catch (_) {}
      try {
        traceCol.fields.add(new TextField({ name: 'laudo_id' }))
      } catch (_) {}
      try {
        traceCol.fields.add(new TextField({ name: 'empresa_id' }))
      } catch (_) {}
      app.save(traceCol)
    }

    // 11. CAMPOS ADITIVOS DE CURA EM production_orders
    if (poCol) {
      try {
        poCol.fields.add(new TextField({ name: 'curing_batch_id' }))
      } catch (_) {}
      try {
        poCol.fields.add(new TextField({ name: 'curing_tank_id' }))
      } catch (_) {}
      try {
        poCol.fields.add(new TextField({ name: 'harvest_ticket_id' }))
      } catch (_) {}
      try {
        poCol.fields.add(new TextField({ name: 'laudo_liberacao_id' }))
      } catch (_) {}
      try {
        poCol.fields.add(new NumberField({ name: 'line_losses_total_cost' }))
      } catch (_) {}
      app.save(poCol)
    }
  },
  (app) => {
    // Reversão limpa
    var cols = [
      'laboratory_laudos',
      'laboratory_analyses',
      'laboratory_analysis_plans',
      'production_line_losses',
      'curing_measurements',
      'curing_batches',
      'curing_tanks',
      'olive_harvest_tickets',
      'agricultural_producers',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
