migrate(
  (app) => {
    const settingsCol = app.findCollectionByNameOrId('settings')
    try {
      app.findFirstRecordByData('settings', 'key', 'whatsapp_number')
    } catch (_) {
      const record = new Record(settingsCol)
      record.set('key', 'whatsapp_number')
      record.set('value', '5531991297619')
      app.save(record)
    }

    const fieldsCol = app.findCollectionByNameOrId('budget_form_fields')

    var serviceOptions = [
      'Transporte Rodoviario de Cargas',
      'Distribuicao e Last Mile',
      'Armazenagem de Produtos em Estoque',
      'Cross Docking',
      'Logistica Portuaria',
      'Gestao de Frota',
      'Logistica Integrada',
    ]
    var operationOptions = [
      'Transporte',
      'Distribuicao',
      'Armazenagem',
      'Cross Docking',
      'Logistica Portuaria',
      'Gestao de Frota',
      'Operacao Completa',
    ]
    var periodicityOptions = ['Operacao Unica', 'Recorrente', 'Urgente']

    var fields = [
      {
        name: 'nome_completo',
        label: 'Nome Completo',
        type: 'text',
        required: true,
        order: 1,
        options: null,
      },
      { name: 'empresa', label: 'Empresa', type: 'text', required: false, order: 2, options: null },
      { name: 'email', label: 'E-mail', type: 'email', required: true, order: 3, options: null },
      {
        name: 'telefone',
        label: 'Telefone / WhatsApp',
        type: 'tel',
        required: true,
        order: 4,
        options: null,
      },
      {
        name: 'servico_interesse',
        label: 'Servico de Interesse',
        type: 'select',
        required: true,
        order: 5,
        options: serviceOptions,
      },
      {
        name: 'tipo_operacao',
        label: 'Tipo de Operacao',
        type: 'select',
        required: false,
        order: 6,
        options: operationOptions,
      },
      {
        name: 'cidade_origem',
        label: 'Cidade de Origem',
        type: 'text',
        required: true,
        order: 7,
        options: null,
      },
      {
        name: 'cidade_destino',
        label: 'Cidade de Destino',
        type: 'text',
        required: false,
        order: 8,
        options: null,
      },
      {
        name: 'tipo_mercadoria',
        label: 'Tipo de Mercadoria / Produto',
        type: 'text',
        required: false,
        order: 9,
        options: null,
      },
      {
        name: 'volume_estimado',
        label: 'Volume Estimado',
        type: 'text',
        required: false,
        order: 10,
        options: null,
      },
      {
        name: 'periodicidade',
        label: 'Periodicidade',
        type: 'select',
        required: false,
        order: 11,
        options: periodicityOptions,
      },
      {
        name: 'mensagem',
        label: 'Mensagem / Observacoes',
        type: 'textarea',
        required: false,
        order: 12,
        options: null,
      },
    ]

    for (var i = 0; i < fields.length; i++) {
      var f = fields[i]
      try {
        app.findFirstRecordByData('budget_form_fields', 'name', f.name)
      } catch (_) {
        var record = new Record(fieldsCol)
        record.set('name', f.name)
        record.set('label', f.label)
        record.set('type', f.type)
        if (f.options) {
          record.set('options', f.options)
        }
        record.set('required', f.required)
        record.set('order', f.order)
        record.set('active', true)
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      var record = app.findFirstRecordByData('settings', 'key', 'whatsapp_number')
      app.delete(record)
    } catch (_) {}

    try {
      var col = app.findCollectionByNameOrId('budget_form_fields')
      app.truncateCollection(col)
    } catch (_) {}
  },
)
