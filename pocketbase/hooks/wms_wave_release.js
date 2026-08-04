routerAdd(
  'POST',
  '/backend/v1/wms/waves/{waveId}/release',
  (e) => {
    try {
      const waveId = e.request.pathValue('waveId')
      if (!waveId) return e.badRequestError('waveId is required')

      let wave
      try {
        wave = $app.findRecordById('wms_waves', waveId)
      } catch (err) {
        return e.notFoundError('Wave not found')
      }

      const currentStatus = wave.getString('status')
      if (currentStatus !== 'pending' && currentStatus !== 'draft') {
        return e.badRequestError('Wave cannot be released from status: ' + currentStatus)
      }

      wave.set('status', 'released')

      try {
        const releasedBy = e.auth?.id || ''
        if (releasedBy) {
          wave.set('released_by', releasedBy)
        }
      } catch (_) {}

      try {
        const now = new Date().toISOString()
        wave.set('released_at', now)
      } catch (_) {}

      $app.save(wave)

      let items = []
      try {
        items = $app.findRecordsByFilter('wms_wave_items', 'wave = {:waveId}', 'created', 500, 0, {
          waveId: waveId,
        })
      } catch (_) {}

      for (const item of items) {
        try {
          if (item.getString('status') === 'pending' || item.getString('status') === '') {
            item.set('status', 'released')
            $app.save(item)
          }
        } catch (_) {}
      }

      return e.json(200, {
        success: true,
        waveId: waveId,
        status: 'released',
        itemsUpdated: items.length,
      })
    } catch (err) {
      $app.logger().error('wms_wave_release failed', 'error', String(err))
      return e.json(500, { error: 'Failed to release wave' })
    }
  },
  $apis.requireAuth(),
)
