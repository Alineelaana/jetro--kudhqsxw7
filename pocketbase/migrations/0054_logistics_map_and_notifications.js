migrate(
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('logistics_deliveries')
      if (!col.fields.getByName('client_id')) {
        col.fields.add(new TextField({ name: 'client_id' }))
        app.save(col)
      }
    } catch (_) {}

    var paramsCol = app.findCollectionByNameOrId('system_parameters')
    var seedParams = [
      {
        module: 'logistics',
        key: 'map_provider',
        label: 'Provedor de Mapas',
        value: 'osm',
        value_type: 'select',
      },
      {
        module: 'logistics',
        key: 'map_api_key',
        label: 'Chave da API de Mapas',
        value: '',
        value_type: 'text',
      },
      {
        module: 'logistics',
        key: 'map_default_lat',
        label: 'Latitude Padrão',
        value: '-20.3155',
        value_type: 'text',
      },
      {
        module: 'logistics',
        key: 'map_default_lng',
        label: 'Longitude Padrão',
        value: '-40.3128',
        value_type: 'text',
      },
      {
        module: 'logistics',
        key: 'map_default_zoom',
        label: 'Zoom Padrão',
        value: '13',
        value_type: 'text',
      },
      {
        module: 'logistics',
        key: 'notify_email_enabled',
        label: 'Notif. E-mail Ativadas',
        value: 'false',
        value_type: 'boolean',
      },
      {
        module: 'logistics',
        key: 'notify_whatsapp_enabled',
        label: 'Notif. WhatsApp Ativadas',
        value: 'true',
        value_type: 'boolean',
      },
    ]

    for (var i = 0; i < seedParams.length; i++) {
      var p = seedParams[i]
      try {
        app.findFirstRecordByData('system_parameters', 'key', p.key)
      } catch (_) {
        var rec = new Record(paramsCol)
        rec.set('module', p.module)
        rec.set('key', p.key)
        rec.set('label', p.label)
        rec.set('value', p.value)
        rec.set('value_type', p.value_type)
        rec.set('active', true)
        app.save(rec)
      }
    }

    try {
      app.findFirstRecordByData('email_templates', 'name', 'Notificação de Entrega')
    } catch (_) {
      try {
        var tplCol = app.findCollectionByNameOrId('email_templates')
        var tpl = new Record(tplCol)
        tpl.set('name', 'Notificação de Entrega')
        tpl.set('category', 'entrega')
        tpl.set('subject', 'Atualização de Entrega - Velora Log')
        tpl.set('sender', 'noreply@veloralog.com.br')
        tpl.set(
          'body',
          '<p>Prezado(a) Cliente,</p><p>Sua entrega <strong>{{numero_entrega}}</strong> teve o status atualizado para: <strong>{{status}}</strong>.</p><ul><li>Cliente: {{cliente}}</li><li>Endereço: {{endereco}}</li><li>Data prevista: {{data_prevista}}</li></ul><p>Acompanhe no Portal do Cliente.</p><p>Velora Log</p>',
        )
        tpl.set('active', true)
        app.save(tpl)
      } catch (_) {}
    }
  },
  (app) => {
    var keys = [
      'map_provider',
      'map_api_key',
      'map_default_lat',
      'map_default_lng',
      'map_default_zoom',
      'notify_email_enabled',
      'notify_whatsapp_enabled',
    ]
    for (var i = 0; i < keys.length; i++) {
      try {
        var rec = app.findFirstRecordByData('system_parameters', 'key', keys[i])
        app.delete(rec)
      } catch (_) {}
    }
    try {
      var tpl = app.findFirstRecordByData('email_templates', 'name', 'Notificação de Entrega')
      app.delete(tpl)
    } catch (_) {}
  },
)
