routerAdd(
  'POST',
  '/backend/v1/wms/romaneio/generate',
  (e) => {
    var body = e.requestInfo().body || {}
    var expeditionIds = body.expedition_ids || []
    if (!expeditionIds.length) return e.badRequestError('expedition_ids is required')

    try {
      var romCol = $app.findCollectionByNameOrId('wms_romaneios')
      var pedidos = []
      var clientes = []
      var notasFiscais = []
      var totalVolumes = 0
      var transportadora = ''
      var motorista = ''
      var veiculo = ''
      var rota = ''

      for (var i = 0; i < expeditionIds.length; i++) {
        try {
          var ship = $app.findRecordById('wms_shippings', expeditionIds[i])
          if (ship.getString('status') !== 'Entregue' && ship.getString('status') !== 'Liberada') {
            return e.badRequestError('Expedicao ' + expeditionIds[i] + ' nao esta liberada')
          }
          if (ship.getString('pedido')) pedidos.push(ship.getString('pedido'))
          if (ship.getString('cliente')) clientes.push(ship.getString('cliente'))
          if (ship.getString('nota_fiscal')) notasFiscais.push(ship.getString('nota_fiscal'))
          totalVolumes += ship.getInt('quantidade_volumes') || 0
          if (!transportadora) transportadora = ship.getString('transportadora') || ''
          if (!motorista) motorista = ship.getString('motorista') || ''
          if (!veiculo) veiculo = ship.getString('veiculo') || ''
          if (!rota) rota = ship.getString('rota') || ''
        } catch (_) {}
      }

      var rom = new Record(romCol)
      rom.set('numero_romaneio', 'ROM-' + Date.now().toString(36).toUpperCase().slice(-6))
      rom.set('data', new Date().toISOString().split('T')[0])
      rom.set('rota', rota)
      rom.set('transportadora', transportadora)
      rom.set('motorista', motorista)
      rom.set('veiculo', veiculo)
      rom.set('pedidos', pedidos)
      rom.set('clientes', clientes)
      rom.set('notas_fiscais', notasFiscais)
      rom.set('quantidade_volumes', totalVolumes)
      rom.set('peso_total', '0')
      rom.set('observacoes', 'Romaneio gerado de ' + expeditionIds.length + ' expedicoes')
      rom.set('status', 'Liberada')
      rom.set('responsavel', (e.auth && e.auth.getString('name')) || 'Sistema')
      $app.save(rom)

      return e.json(200, { id: rom.id, numero_romaneio: rom.getString('numero_romaneio') })
    } catch (err) {
      return e.json(500, { error: 'Falha ao gerar romaneio: ' + String(err) })
    }
  },
  $apis.requireAuth(),
)
