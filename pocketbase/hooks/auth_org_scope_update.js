onRecordUpdateRequest(
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

    var original = e.record.original()
    var originalCompany = ''
    var originalBranch = ''
    if (original) {
      try {
        originalCompany = original.getString('company') || original.getString('empresa') || ''
      } catch (_) {}
      try {
        originalBranch = original.getString('branch') || original.getString('filial') || ''
      } catch (_) {}
    }

    if (empresaId && originalCompany && originalCompany !== empresaId) {
      return e.forbiddenError('Sem permissão para alterar registros de outra empresa.')
    }
    if (filialId && originalBranch && originalBranch !== filialId) {
      return e.forbiddenError('Sem permissão para alterar registros de outra filial.')
    }

    if (empresaId && recordCompany && recordCompany !== empresaId) {
      return e.badRequestError('Sem permissão para transferir registros para outra empresa.')
    }
    if (filialId && recordBranch && recordBranch !== filialId) {
      return e.badRequestError('Sem permissão para transferir registros para outra filial.')
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
