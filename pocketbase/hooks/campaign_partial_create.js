routerAdd(
  'POST',
  '/backend/v1/campaigns/partial',
  (e) => {
    const body = e.requestInfo().body || {}
    const campaignId = body.campaign_id || ''
    if (!campaignId) return e.badRequestError('campaign_id is required')

    var existing = []
    try {
      existing = $app.findRecordsByFilter(
        'campaign_partials',
        'campaign_id = {:cid}',
        '-partial_number',
        1,
        0,
        campaignId,
      )
    } catch (_) {}

    var nextNumber = 1
    if (existing.length > 0 && existing[0].get('partial_number')) {
      nextNumber = existing[0].get('partial_number') + 1
    }

    var goals = []
    try {
      goals = $app.findRecordsByFilter('sales_goals', "status = 'ativa'", '-created', 0, 0)
    } catch (_) {}

    var orders = []
    try {
      orders = $app.findRecordsByFilter('sales_orders', '', '-created', 0, 0)
    } catch (_) {}

    var spMap = {}
    for (var i = 0; i < orders.length; i++) {
      var name = orders[i].getString('salesperson_name') || 'N/A'
      if (!spMap[name]) spMap[name] = 0
      spMap[name] += parseFloat(orders[i].getString('total_value') || '0')
    }

    var participants = []
    for (var j = 0; j < goals.length; j++) {
      var g = goals[j]
      var vendedor = g.getString('rca') || g.getString('vendedor_interno') || ''
      if (!vendedor) continue
      var target = parseFloat(g.getString('target_value') || '0')
      var realized = spMap[vendedor] || 0
      var pct = target > 0 ? (realized / target) * 100 : 0
      participants.push({
        participant: vendedor,
        goal: target,
        realized: realized,
        percentage: Math.round(pct * 100) / 100,
        position: 0,
        projection: realized,
        remaining: Math.max(0, target - realized),
        remaining_days: 0,
      })
    }

    participants.sort(function (a, b) {
      return b.realized - a.realized
    })
    for (var k = 0; k < participants.length; k++) {
      participants[k].position = k + 1
    }

    var col = $app.findCollectionByNameOrId('campaign_partials')
    var record = new Record(col)
    record.set('campaign_id', campaignId)
    record.set('campaign_name', body.campaign_name || '')
    record.set('partial_number', nextNumber)
    record.set('snapshot_date', new Date().toISOString())
    record.set('participants', participants)
    record.set('is_closing_snapshot', body.is_closing || false)
    record.set('competencia', body.competencia || '')
    record.set('created_by', body.user_id || '')
    record.set('created_by_name', body.user_name || '')
    $app.save(record)

    return e.json(200, {
      id: record.id,
      partial_number: nextNumber,
      participants: participants.length,
    })
  },
  $apis.requireAuth(),
)
