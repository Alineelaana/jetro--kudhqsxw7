routerAdd(
  'POST',
  '/backend/v1/logistics/validate-map-key',
  (e) => {
    const body = e.requestInfo().body || {}
    const provider = body.provider || 'google'
    const apiKey = body.api_key || ''

    if (!apiKey) return e.json(400, { valid: false, message: 'API key e obrigatoria' })

    if (provider === 'google') {
      try {
        var res = $http.send({
          url:
            'https://maps.googleapis.com/maps/api/geocode/json?address=Vitoria,ES,Brazil&key=' +
            apiKey,
          method: 'GET',
          timeout: 10,
        })
        if (res.statusCode === 200 && res.json) {
          var status = res.json.status || ''
          if (status === 'OK')
            return e.json(200, { valid: true, message: 'Chave validada com sucesso' })
          if (status === 'REQUEST_DENIED')
            return e.json(200, {
              valid: false,
              message: 'Chave invalida ou sem permissao para a API Geocoding',
            })
          if (status === 'OVER_QUERY_LIMIT')
            return e.json(200, { valid: false, message: 'Limite de consultas excedido' })
          return e.json(200, { valid: false, message: 'Status: ' + status })
        }
      } catch (err) {
        return e.json(200, { valid: false, message: 'Erro ao validar: ' + String(err) })
      }
    }

    if (provider === 'mapbox') {
      try {
        var res = $http.send({
          url:
            'https://api.mapbox.com/geocoding/v5/mapbox.places/Vitoria.json?limit=1&access_token=' +
            apiKey,
          method: 'GET',
          timeout: 10,
        })
        if (res.statusCode === 200 && res.json) {
          if (res.json.features && res.json.features.length > 0) {
            return e.json(200, { valid: true, message: 'Chave validada com sucesso' })
          }
        }
        if (res.statusCode === 401) return e.json(200, { valid: false, message: 'Token invalido' })
        return e.json(200, { valid: false, message: 'Nao foi possivel validar a chave' })
      } catch (err) {
        return e.json(200, { valid: false, message: 'Erro ao validar: ' + String(err) })
      }
    }

    return e.json(400, { valid: false, message: 'Provider nao suportado: ' + provider })
  },
  $apis.requireAuth(),
)
