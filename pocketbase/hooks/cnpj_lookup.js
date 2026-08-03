routerAdd(
  'GET',
  '/backend/v1/cnpj/{cnpj}',
  (e) => {
    var cnpj = e.request.pathValue('cnpj')
    var clean = (cnpj || '').replace(/\D/g, '')
    if (clean.length !== 14) {
      return e.badRequestError('CNPJ deve conter 14 digitos')
    }

    var res = $http.send({
      url: 'https://receitaws.com.br/v1/cnpj/' + clean,
      method: 'GET',
      headers: { Accept: 'application/json' },
      timeout: 15,
    })

    if (res.statusCode !== 200) {
      return e.json(502, {
        error: 'Nao foi possivel consultar o CNPJ na Receita Federal',
      })
    }

    var data = res.json
    if (!data || data.status === 'ERROR' || data.error) {
      return e.json(400, {
        error: data && data.message ? data.message : 'CNPJ nao encontrado',
      })
    }

    return e.json(200, data)
  },
  $apis.requireAuth(),
)
