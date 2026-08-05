migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var adminId = ''
    try {
      adminId = app.findAuthRecordByEmail('_pb_users_auth_', 'alineelaana@gmail.com').id
    } catch (_) {}

    var stagesData = [
      [
        'Preço',
        'Prazo',
        'Concorrência',
        'Falta de Interesse',
        'Sem Orçamento',
        'Produto Inadequado',
        'Cliente sem Retorno',
        'Condição Comercial',
        'Localização',
        'Outro',
      ],
    ]
    var lrCol = app.findCollectionByNameOrId('crm_loss_reasons')
    stagesData[0].forEach(function (n) {
      try {
        app.findFirstRecordByData('crm_loss_reasons', 'name', n)
        return
      } catch (_) {}
      var r = new Record(lrCol)
      r.set('name', n)
      r.set('active', true)
      app.save(r)
    })

    var leadsCol = app.findCollectionByNameOrId('crm_leads')
    var oppCol = app.findCollectionByNameOrId('crm_opportunities')
    var actCol = app.findCollectionByNameOrId('crm_activities')
    var propCol = app.findCollectionByNameOrId('crm_proposals')
    var goalCol = app.findCollectionByNameOrId('crm_goals')
    var autoCol = app.findCollectionByNameOrId('crm_automation_rules')

    var stagePropostaId = ''
    var stageNegociacaoId = ''
    var stageFechamentoId = ''
    var stageQualificacaoId = ''
    try {
      stagePropostaId = app.findFirstRecordByData('crm_funnel_stages', 'name', 'Proposta').id
    } catch (_) {}
    try {
      stageNegociacaoId = app.findFirstRecordByData('crm_funnel_stages', 'name', 'Negociação').id
    } catch (_) {}
    try {
      stageFechamentoId = app.findFirstRecordByData('crm_funnel_stages', 'name', 'Fechamento').id
    } catch (_) {}
    try {
      stageQualificacaoId = app.findFirstRecordByData(
        'crm_funnel_stages',
        'name',
        'Qualificação',
      ).id
    } catch (_) {}

    var testLeadId = ''
    try {
      testLeadId = app.findFirstRecordByData('crm_leads', 'lead_number', 'LEAD-00004').id
    } catch (_) {
      var lead4 = new Record(leadsCol)
      lead4.set('lead_number', 'LEAD-00004')
      lead4.set('name', 'TESTE Supermercado Estrela')
      lead4.set('person_type', 'PJ')
      lead4.set('cpf_cnpj', '34.567.890/0001-12')
      lead4.set('phone', '(27) 99999-0003')
      lead4.set('whatsapp', '(27) 99999-0003')
      lead4.set('email', 'teste@supermercadoestrela.com')
      lead4.set('city', 'Vila Velha')
      lead4.set('state', 'ES')
      lead4.set('segment', 'Varejo')
      lead4.set('company_size', 'Pequeno')
      lead4.set('lead_source', 'Indicação')
      lead4.set('product_interest', 'Distribuição Urbana')
      lead4.set('status', 'Qualificado')
      lead4.set('temperature', 'Quente')
      lead4.set('entry_date', new Date().toISOString().split('T')[0])
      if (adminId) lead4.set('responsible_id', adminId)
      lead4.set('responsible_name', 'Admin')
      lead4.set('company', 'Velora Log')
      lead4.set('filial', 'Matriz')
      lead4.set('qualification_score', 75)
      app.save(lead4)
      testLeadId = lead4.id
    }

    var testOppId = ''
    try {
      testOppId = app.findFirstRecordByData(
        'crm_opportunities',
        'opportunity_number',
        'OPP-00003',
      ).id
    } catch (_) {
      var opp3 = new Record(oppCol)
      opp3.set('opportunity_number', 'OPP-00003')
      opp3.set('lead_id', testLeadId)
      opp3.set('client_name', 'TESTE Supermercado Estrela')
      opp3.set('title', 'Contrato Distribuição Urbana')
      opp3.set('product_service', 'Distribuição Urbana')
      opp3.set('estimated_value', '18000')
      opp3.set('status', 'Em Negociação')
      if (stageNegociacaoId) opp3.set('stage_id', stageNegociacaoId)
      opp3.set('probability', 70)
      opp3.set('open_date', new Date().toISOString().split('T')[0])
      opp3.set(
        'expected_close_date',
        new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      )
      if (adminId) opp3.set('responsible_id', adminId)
      opp3.set('responsible_name', 'Admin')
      opp3.set('company', 'Velora Log')
      opp3.set('filial', 'Matriz')
      opp3.set('stage_entered_at', new Date(Date.now() - 3 * 86400000).toISOString())
      app.save(opp3)
      testOppId = opp3.id
    }

    try {
      app.findFirstRecordByData('crm_activities', 'title', 'TESTE-CRM: Visita comercial')
    } catch (_) {
      var act = new Record(actCol)
      act.set('type', 'Visita')
      act.set('title', 'TESTE-CRM: Visita comercial')
      act.set('description', 'Visita para apresentação dos serviços de distribuição urbana')
      act.set('client_name', 'TESTE Supermercado Estrela')
      if (testLeadId) act.set('lead_id', testLeadId)
      if (testOppId) act.set('opportunity_id', testOppId)
      act.set('scheduled_date', new Date(Date.now() + 86400000).toISOString().split('T')[0])
      act.set('scheduled_time', '10:00')
      act.set('duration_minutes', 60)
      act.set('status', 'Agendada')
      act.set('priority', 'Alta')
      if (adminId) act.set('responsible_id', adminId)
      act.set('responsible_name', 'Admin')
      act.set('company', 'Velora Log')
      act.set('filial', 'Matriz')
      app.save(act)
    }

    try {
      app.findFirstRecordByData('crm_proposals', 'proposal_number', 'PROP-00001')
    } catch (_) {
      var prop = new Record(propCol)
      prop.set('proposal_number', 'PROP-00001')
      if (testOppId) prop.set('opportunity_id', testOppId)
      prop.set('client_name', 'TESTE Supermercado Estrela')
      prop.set('title', 'Proposta Distribuição Urbana - Mensal')
      prop.set('responsible_name', 'Admin')
      if (adminId) prop.set('responsible_id', adminId)
      prop.set(
        'items',
        JSON.stringify([
          {
            product_service: 'Distribuição Urbana - Roteiro Diário',
            quantity: '22',
            unit_price: '650',
            discount: '0',
            addition: '0',
            total: '14300',
          },
          {
            product_service: 'Armazenagem CD - 20m²',
            quantity: '1',
            unit_price: '3700',
            discount: '200',
            addition: '0',
            total: '3500',
          },
        ]),
      )
      prop.set('subtotal', '17800')
      prop.set('discount', '200')
      prop.set('total', '17800')
      prop.set('payment_terms', '30 Dias')
      prop.set('delivery_terms', 'Imediato')
      prop.set('validity_date', new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0])
      prop.set('status', 'Enviada')
      prop.set('sent_date', new Date().toISOString().split('T')[0])
      prop.set('company', 'Velora Log')
      prop.set('filial', 'Matriz')
      app.save(prop)
    }

    try {
      app.findFirstRecordByData('crm_goals', 'title', 'TESTE-CRM: Meta de Vendas Q3')
    } catch (_) {
      var goal = new Record(goalCol)
      goal.set('title', 'TESTE-CRM: Meta de Vendas Q3')
      goal.set('type', 'Vendas')
      goal.set('target_value', '500000')
      goal.set('realized_value', '18000')
      goal.set('period', '2026-Q3')
      goal.set('responsible_name', 'Admin')
      if (adminId) goal.set('responsible_id', adminId)
      goal.set('company', 'Velora Log')
      goal.set('filial', 'Matriz')
      goal.set('active', true)
      app.save(goal)
    }

    try {
      app.findFirstRecordByData('crm_automation_rules', 'name', 'TESTE-CRM: Distribuir leads')
    } catch (_) {
      var auto = new Record(autoCol)
      auto.set('name', 'TESTE-CRM: Distribuir leads entre vendedores')
      auto.set('trigger', 'Lead Criado')
      auto.set('conditions', JSON.stringify({ round_robin: true }))
      auto.set('actions', JSON.stringify({ assign_to: 'next_vendedor' }))
      auto.set('active', true)
      app.save(auto)
    }
  },
  (app) => {
    function safeDelete(colName, filter) {
      try {
        var records = app.findRecordsByFilter(colName, filter, '-created', 50, 0)
        for (var i = 0; i < records.length; i++) {
          try {
            app.delete(records[i])
          } catch (_) {}
        }
      } catch (_) {}
    }
    safeDelete('crm_proposals', 'proposal_number = "PROP-00001"')
    safeDelete('crm_activities', 'title ~ "TESTE-CRM"')
    safeDelete('crm_goals', 'title ~ "TESTE-CRM"')
    safeDelete('crm_automation_rules', 'name ~ "TESTE-CRM"')
    safeDelete('crm_opportunities', 'opportunity_number = "OPP-00003"')
    safeDelete('crm_leads', 'lead_number = "LEAD-00004"')
  },
)
