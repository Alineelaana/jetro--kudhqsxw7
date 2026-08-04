migrate(
  (app) => {
    var paramsCol = app.findCollectionByNameOrId('system_parameters')

    var taxData = [
      {
        module: 'Folha',
        key: 'inss_table',
        label: 'Tabela INSS (Progressiva)',
        value: JSON.stringify([
          { min: 0, max: 1412.0, rate: 7.5, deduction: 0 },
          { min: 1412.01, max: 2666.68, rate: 9, deduction: 0 },
          { min: 2666.69, max: 4000.03, rate: 12, deduction: 0 },
          { min: 4000.04, max: 7786.02, rate: 14, deduction: 0 },
        ]),
        value_type: 'json',
      },
      {
        module: 'Folha',
        key: 'inss_teto',
        label: 'Teto INSS',
        value: '908.85',
        value_type: 'text',
      },
      {
        module: 'Folha',
        key: 'irrf_table',
        label: 'Tabela IRRF (Progressiva)',
        value: JSON.stringify([
          { min: 0, max: 2259.2, rate: 0, deduction: 0 },
          { min: 2259.21, max: 2826.65, rate: 7.5, deduction: 169.44 },
          { min: 2826.66, max: 3751.05, rate: 15, deduction: 381.44 },
          { min: 3751.06, max: 4664.68, rate: 22.5, deduction: 662.77 },
          { min: 4664.69, max: 9999999, rate: 27.5, deduction: 896.0 },
        ]),
        value_type: 'json',
      },
      {
        module: 'Folha',
        key: 'irrf_dependent_deduction',
        label: 'Dedução por Dependente IRRF',
        value: '189.59',
        value_type: 'text',
      },
      {
        module: 'Folha',
        key: 'fgts_rate',
        label: 'Alíquota FGTS',
        value: '8',
        value_type: 'text',
      },
      {
        module: 'Folha',
        key: 'folha_dia_pagamento',
        label: 'Dia Pagamento Salário',
        value: '5',
        value_type: 'text',
      },
      {
        module: 'Folha',
        key: 'fgts_vencimento_dia',
        label: 'Dia Vencimento FGTS',
        value: '20',
        value_type: 'text',
      },
      {
        module: 'Folha',
        key: 'inss_vencimento_dia',
        label: 'Dia Vencimento INSS',
        value: '20',
        value_type: 'text',
      },
      {
        module: 'Folha',
        key: 'irrf_vencimento_dia',
        label: 'Dia Vencimento IRRF',
        value: '20',
        value_type: 'text',
      },
    ]

    for (var i = 0; i < taxData.length; i++) {
      var d = taxData[i]
      try {
        app.findFirstRecordByData('system_parameters', 'key', d.key)
      } catch (_) {
        var rec = new Record(paramsCol)
        rec.set('module', d.module)
        rec.set('key', d.key)
        rec.set('label', d.label)
        rec.set('value', d.value)
        rec.set('value_type', d.value_type)
        rec.set('active', true)
        app.save(rec)
      }
    }
  },
  (app) => {
    var keys = [
      'inss_table',
      'inss_teto',
      'irrf_table',
      'irrf_dependent_deduction',
      'fgts_rate',
      'folha_dia_pagamento',
      'fgts_vencimento_dia',
      'inss_vencimento_dia',
      'irrf_vencimento_dia',
    ]
    for (var i = 0; i < keys.length; i++) {
      try {
        app.delete(app.findFirstRecordByData('system_parameters', 'key', keys[i]))
      } catch (_) {}
    }
  },
)
