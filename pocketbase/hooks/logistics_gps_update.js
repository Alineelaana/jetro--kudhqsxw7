routerAdd(
  'POST',
  '/backend/v1/logistics/gps-update',
  (e) => {
    const body = e.requestInfo().body || {}
    const trackingId = body.tracking_id || ''
    const deliveryId = body.delivery_id || ''
    const lat = parseFloat(body.latitude)
    const lng = parseFloat(body.longitude)
    const status = body.status || ''

    if (isNaN(lat) || isNaN(lng)) {
      return e.badRequestError('latitude e longitude sao obrigatorios')
    }

    var tracking = null
    try {
      if (trackingId) {
        tracking = $app.findRecordById('logistics_tracking', trackingId)
      } else if (deliveryId) {
        tracking = $app.findFirstRecordByFilter(
          'logistics_tracking',
          'entrega = "' + deliveryId + '"',
        )
      }
    } catch (_) {}

    if (!tracking) {
      try {
        var col = $app.findCollectionByNameOrId('logistics_tracking')
        tracking = new Record(col)
        tracking.set('entrega', deliveryId || '')
        tracking.set('status', status || 'Em Transito')
        tracking.set('veiculo', body.veiculo || '')
        tracking.set('motorista', body.motorista || '')
        tracking.set('cliente', body.cliente || '')
      } catch (err) {
        return e.json(500, { error: 'Failed to create tracking record' })
      }
    }

    tracking.set('latitude', String(lat))
    tracking.set('longitude', String(lng))
    tracking.set('ultima_localizacao', lat.toFixed(6) + ', ' + lng.toFixed(6))
    tracking.set('data_hora_atualizacao', new Date().toISOString())
    if (status) tracking.set('status', status)

    var timeline = tracking.get('linha_tempo') || []
    if (typeof timeline === 'string') {
      try {
        timeline = JSON.parse(timeline)
      } catch (_) {
        timeline = []
      }
    }
    timeline.push({
      evento: status ? 'Posicao atualizada: ' + status : 'Posicao atualizada',
      data: new Date().toISOString(),
    })
    tracking.set('linha_tempo', timeline)

    $app.save(tracking)

    return e.json(200, { success: true, latitude: lat, longitude: lng, tracking_id: tracking.id })
  },
  $apis.requireAuth(),
)
