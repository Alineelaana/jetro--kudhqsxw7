onRecordCreateRequest((e) => {
  var body = e.requestInfo().body || {}
  if (body.tipo_solicitacao && String(body.tipo_solicitacao).indexOf('Negociação') !== -1) {
    if (!e.auth) {
      return e.unauthorizedError('Autenticação necessária')
    }
    var role = e.auth.getString('role')
    var allowed = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL']
    if (allowed.indexOf(role) === -1) {
      return e.forbiddenError('Sem permissão para solicitar negociação com desconto')
    }
  }
  e.next()
}, 'financial_approvals')
