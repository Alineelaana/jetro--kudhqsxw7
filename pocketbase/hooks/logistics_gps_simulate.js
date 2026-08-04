routerAdd(
  'POST',
  '/backend/v1/logistics/gps-simulate',
  (e) => {
    const body = e.requestInfo().body || {}
    const trackingId = body.tracking_id || ''

    if (!trackingId) return e.badRequestError('tracking_id is required')

    try {
      var tracking = $app.findRecordById('logistics_tracking', trackingId)
      var lat = parseFloat(tracking.getString('latitude'))
      var lng = parseFloat(tracking.getString('longitude'))

      if (isNaN(lat)) lat = -20.3155
      if (isNaN(lng)) lng = -40.3128

      lat += (Math.random() - 0.45) * 0.008
      lng += (Math.random() - 0.45) * 0.008

      tracking.set('latitude', String(lat))
      tracking.set('longitude', String(lng))
      tracking.set('ultima_localizacao', 'Simulado: ' + lat.toFixed(6) + ', ' + lng.toFixed(6))
      tracking.set('data_hora_atualizacao', new Date().toISOString())

      var timeline = tracking.get('linha_tempo') || []
      if (typeof timeline === 'string') {
        try {
          timeline = JSON.parse(timeline)
        } catch (_) {
          timeline = []
        }
      }
      timeline.push({
        evento: 'Posicao simulada',
        data: new Date().toISOString(),
      })
      tracking.set('linha_tempo', timeline)

      $app.save(tracking)

      return e.json(200, {
        success: true,
        latitude: lat,
        longitude: lng,
        tracking_id: trackingId,
      })
    } catch (err) {
      return e.json(400, { error: 'Erro ao simular GPS: ' + String(err) })
    }
  },
  $apis.requireAuth(),
)
