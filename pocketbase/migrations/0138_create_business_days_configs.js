migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'business_days_configs',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule:
          "@request.auth.role = 'SUP' || @request.auth.role = 'FINANCEIRO' || @request.auth.role = 'COMERCIAL'",
        updateRule:
          "@request.auth.role = 'SUP' || @request.auth.role = 'FINANCEIRO' || @request.auth.role = 'COMERCIAL'",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'empresa', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'mes', type: 'number', required: true, min: 1, max: 12, onlyInt: true },
          { name: 'ano', type: 'number', required: true, min: 2020, max: 2100, onlyInt: true },
          {
            name: 'total_business_days',
            type: 'number',
            required: true,
            min: 1,
            max: 31,
            onlyInt: true,
          },
          { name: 'responsible_user', type: 'text' },
          { name: 'responsible_user_name', type: 'text' },
          { name: 'config_date', type: 'text' },
          { name: 'last_change_date', type: 'text' },
          { name: 'last_changed_by', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_bdc_emp_fil_mes_ano ON business_days_configs (empresa, filial, mes, ano)',
        ],
      }),
    )

    var col = app.findCollectionByNameOrId('business_days_configs')
    var now = new Date()
    var mes = now.getMonth() + 1
    var ano = now.getFullYear()
    try {
      app.findFirstRecordByData('business_days_configs', 'total_business_days', 22)
    } catch (_) {
      var r = new Record(col)
      r.set('empresa', '')
      r.set('filial', '')
      r.set('mes', mes)
      r.set('ano', ano)
      r.set('total_business_days', 22)
      r.set('responsible_user', '')
      r.set('responsible_user_name', 'Sistema')
      r.set('config_date', now.toISOString())
      r.set('last_change_date', now.toISOString())
      r.set('last_changed_by', 'Sistema')
      app.save(r)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('business_days_configs'))
    } catch (_) {}
  },
)
