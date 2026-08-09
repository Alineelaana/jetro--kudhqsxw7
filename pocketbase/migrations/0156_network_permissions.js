migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('system_parameters')

    var permissions = [
      {
        module: 'networks',
        key: 'network_view_networks',
        label: 'Visualizar Rede',
        roles: ['SUP', 'FINANCEIRO', 'COMERCIAL', 'PADRAO'],
      },
      {
        module: 'networks',
        key: 'network_create_network',
        label: 'Criar Rede',
        roles: ['SUP', 'FINANCEIRO', 'COMERCIAL'],
      },
      {
        module: 'networks',
        key: 'network_link_client',
        label: 'Vincular Cliente a Rede',
        roles: ['SUP', 'FINANCEIRO', 'COMERCIAL'],
      },
      {
        module: 'networks',
        key: 'network_unlink_client',
        label: 'Desvincular Cliente de Rede',
        roles: ['SUP', 'FINANCEIRO', 'COMERCIAL'],
      },
      {
        module: 'networks',
        key: 'network_edit_network',
        label: 'Alterar Rede',
        roles: ['SUP', 'FINANCEIRO', 'COMERCIAL'],
      },
      {
        module: 'networks',
        key: 'network_manage_credit_policy',
        label: 'Administrar Politica de Credito da Rede',
        roles: ['SUP', 'FINANCEIRO'],
      },
    ]

    for (var i = 0; i < permissions.length; i++) {
      var perm = permissions[i]
      try {
        app.findFirstRecordByData('system_parameters', 'key', perm.key)
      } catch (_) {
        var record = new Record(col)
        record.set('module', perm.module)
        record.set('key', perm.key)
        record.set('label', perm.label)
        record.set('value', JSON.stringify({ roles: perm.roles }))
        record.set('value_type', 'json')
        record.set('active', true)
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      var records = app.findRecordsByFilter('system_parameters', 'module = "networks"', '', 100, 0)
      for (var i = 0; i < records.length; i++) {
        app.delete(records[i])
      }
    } catch (_) {}
  },
)
