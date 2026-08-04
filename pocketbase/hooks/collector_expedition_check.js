routerAdd(
  'POST',
  '/backend/v1/collector/expedition-check',
  (e) => {
    var body = e.requestInfo().body || {}
    var checkId = body.check_id || ''
    var qtdConferida = parseInt(body.quantidade_conferida) || 0
    var codigoBarras = body.codigo_barras || ''

    if (!checkId) return e.badRequestError('check_id is required')
    if (qtdConferida < 0) return e.badRequestError('quantidade_conferida must be >= 0')

    try {
      var check = $app.findRecordById('wms_expedition_checks', checkId)
      if (
        check.getString('status') !== 'Aguardando Conferência' &&
        check.getString('status') !== 'Em Conferência'
      ) {
        return e.badRequestError('Conferencia nao disponivel')
      }

      var qtdSeparada = check.getInt('quantidade_separada') || 0
      var userName = (e.auth && e.auth.getString('name')) || 'Coletor'

      check.set('quantidade_conferida', qtdConferida)
      check.set('diferenca', qtdConferida - qtdSeparada)
      check.set('responsavel', userName)
      check.set('status', qtdConferida === qtdSeparada ? 'Conferido' : 'Com Divergencia')
      $app.save(check)

      return e.json(200, { id: check.id, status: check.getString('status') })
    } catch (err) {
      return e.json(400, { error: 'Erro na conferencia: ' + String(err) })
    }
  },
  $apis.requireAuth(),
)
