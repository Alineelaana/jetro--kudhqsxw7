routerAdd(
  'POST',
  '/backend/v1/logistics/route-calc',
  (e) => {
    const body = e.requestInfo().body || {}
    const origin = body.origin || ''
    const destination = body.destination || ''
    const waypoints = body.waypoints || []

    if (!origin || !destination) {
      return e.badRequestError('origin e destination sao obrigatorios')
    }

    var apiKey = ''
    try {
      var param = $app.findFirstRecordByData('system_parameters', 'key', 'map_api_key')
      apiKey = param.getString('value') || ''
    } catch (_) {}

    if (apiKey) {
      try {
        var allDest = destination
        if (waypoints.length > 0) {
          allDest = destination + '|' + waypoints.join('|')
        }
        var url =
          'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' +
          encodeURIComponent(origin) +
          '&destinations=' +
          encodeURIComponent(allDest) +
          '&key=' +
          apiKey
        var res = $http.send({ url: url, method: 'GET', timeout: 15 })
        if (res.statusCode === 200 && res.json) {
          var data = res.json
          if (data.rows && data.rows[0] && data.rows[0].elements && data.rows[0].elements[0]) {
            var elem = data.rows[0].elements[0]
            if (elem.status === 'OK') {
              return e.json(200, {
                distance: elem.distance.value / 1000,
                duration: Math.round(elem.duration.value / 60),
                distanceText: elem.distance.text,
                durationText: elem.duration.text,
              })
            }
          }
        }
      } catch (err) {
        $app.logger().error('Google Maps route calc failed', 'error', String(err))
      }
    }

    try {
      var geoOrigin = $http.send({
        url:
          'https://nominatim.openstreetmap.org/search?q=' +
          encodeURIComponent(origin) +
          '&format=json&limit=1',
        method: 'GET',
        headers: { 'User-Agent': 'Jetro/1.0' },
        timeout: 10,
      })
      var geoDest = $http.send({
        url:
          'https://nominatim.openstreetmap.org/search?q=' +
          encodeURIComponent(destination) +
          '&format=json&limit=1',
        method: 'GET',
        headers: { 'User-Agent': 'Jetro/1.0' },
        timeout: 10,
      })

      var origData = geoOrigin.statusCode === 200 && geoOrigin.json ? geoOrigin.json : []
      var destData = geoDest.statusCode === 200 && geoDest.json ? geoDest.json : []

      if (origData.length > 0 && destData.length > 0) {
        var lat1 = parseFloat(origData[0].lat)
        var lon1 = parseFloat(origData[0].lon)
        var lat2 = parseFloat(destData[0].lat)
        var lon2 = parseFloat(destData[0].lon)

        var R = 6371
        var dLat = ((lat2 - lat1) * Math.PI) / 180
        var dLon = ((lon2 - lon1) * Math.PI) / 180
        var a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)
        var dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        var roadFactor = 1.3
        var adjDist = dist * roadFactor
        var avgSpeed = 50
        var duration = Math.round((adjDist / avgSpeed) * 60)

        return e.json(200, {
          distance: Math.round(adjDist * 10) / 10,
          duration: duration,
          distanceText: adjDist.toFixed(1) + ' km',
          durationText:
            duration < 60
              ? duration + ' min'
              : Math.floor(duration / 60) + 'h ' + (duration % 60) + 'min',
        })
      }
    } catch (err) {
      $app.logger().error('Nominatim route calc failed', 'error', String(err))
    }

    return e.json(200, {
      distance: 0,
      duration: 0,
      distanceText: '—',
      durationText: '—',
      note: 'Configure a chave da API de mapas para calculo automatico',
    })
  },
  $apis.requireAuth(),
)
