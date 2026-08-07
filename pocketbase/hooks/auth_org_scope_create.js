onRecordCreateRequest(
  (e) => {
    var authUser = e.auth
    if (!authUser) {
      e.next()
      return
    }

    var role = authUser.getString('role')
    if (role === 'SUP') {
      e.next()
      return
    }

    var empresaId = authUser.getString('empresa_id')
    var filialId = authUser.getString('filial_id')

    if (!empresaId && !filialId) {
      e.next()
      return
    }

    var recordCompany = ''
    var recordBranch = ''
    try {
      recordCompany = e.record.getString('company') || e.record.getString('empresa') || ''
    } catch (_) {}
    try {
      recordBranch = e.record.getString('branch') || e.record.getString('filial') || ''
    } catch (_) {}

    if (empresaId && recordCompany && recordCompany !== empresaId) {
      return e.badRequestError('Sem permissão para criar registros fora de sua empresa.')
    }
    if (filialId && recordBranch && recordBranch !== filialId) {
      return e.badRequestError('Sem permissão para criar registros fora de sua filial.')
    }

    if (empresaId && !recordCompany) {
      try {
        if (e.record.get('company') !== undefined) {
          e.record.set('company', empresaId)
        } else if (e.record.get('empresa') !== undefined) {
          e.record.set('empresa', empresaId)
        }
      } catch (_) {}
    }
    if (filialId && !recordBranch) {
      try {
        if (e.record.get('branch') !== undefined) {
          e.record.set('branch', filialId)
        } else if (e.record.get('filial') !== undefined) {
          e.record.set('filial', filialId)
        }
      } catch (_) {}
    }

    e.next()
  },
  'sales_orders',
  'purchase_orders',
  'purchase_requests',
  'pricing_config',
  'system_parameters',
  'integrations',
  'api_credentials',
  'price_tables',
  'nfe_records',
  'nfce_records',
  'sales_invoices',
  'purchase_invoices',
)
