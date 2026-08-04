routerAdd(
  'POST',
  '/backend/v1/wms/expedition/validate',
  (e) => {
    const body = e.requestInfo().body || {}
    const expeditionId = body.expedition_id || body.expeditionId || ''

    if (!expeditionId) {
      return e.badRequestError('expedition_id is required')
    }

    let expedition
    try {
      expedition = $app.findRecordById('wms_expeditions', expeditionId)
    } catch (err) {
      return e.notFoundError('expedition not found')
    }

    const status = expedition.getString('status')
    if (status === 'validated' || status === 'shipped') {
      return e.json(200, {
        valid: false,
        message: 'Expedition already validated or shipped',
        expedition_id: expeditionId,
      })
    }

    const items = expedition.get('items') || []
    if (!items || items.length === 0) {
      return e.json(200, {
        valid: false,
        message: 'Expedition has no items',
        expedition_id: expeditionId,
      })
    }

    try {
      const collection = $app.findCollectionByNameOrId('wms_expeditions')
      const record = $app.findRecordById('wms_expeditions', expeditionId)
      record.set('status', 'validated')
      $app.save(record)
    } catch (err) {
      return e.json(500, { error: 'Failed to validate expedition' })
    }

    return e.json(200, {
      valid: true,
      message: 'Expedition validated successfully',
      expedition_id: expeditionId,
      items_count: items.length,
    })
  },
  $apis.requireAuth(),
)
