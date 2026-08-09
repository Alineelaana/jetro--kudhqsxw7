onRecordAfterUpdateSuccess((e) => {
  var oldNetworkId = e.record.original().getString('network_id') || ''
  var newNetworkId = e.record.getString('network_id') || ''
  if (oldNetworkId === newNetworkId) return e.next()

  var partnerName = e.record.getString('full_name') || e.record.getString('company_name') || ''
  var partnerId = e.record.id

  if (oldNetworkId) {
    try {
      var oldNetwork = $app.findRecordById('client_networks', oldNetworkId)
      var oldMembers = oldNetwork.get('member_ids') || []
      var newMembers = Array.isArray(oldMembers)
        ? oldMembers.filter(function (id) {
            return id !== partnerId
          })
        : []
      var oldHistory = oldNetwork.get('member_history') || []
      var histEntry = {
        id: $security.randomString(16),
        partner_id: partnerId,
        partner_name: partnerName,
        action: 'removed',
        user: 'Sistema',
        date: new Date().toISOString(),
        justification: 'Removido via edição de parceiro',
      }
      oldNetwork.set('member_ids', newMembers)
      oldNetwork.set(
        'member_history',
        Array.isArray(oldHistory) ? oldHistory.concat([histEntry]) : [histEntry],
      )
      $app.saveNoValidate(oldNetwork)
    } catch (_) {}
  }

  if (newNetworkId) {
    try {
      var newNetwork = $app.findRecordById('client_networks', newNetworkId)
      var existingMembers = newNetwork.get('member_ids') || []
      var members = Array.isArray(existingMembers) ? existingMembers : []
      var found = false
      for (var i = 0; i < members.length; i++) {
        if (members[i] === partnerId) {
          found = true
          break
        }
      }
      if (!found) {
        members.push(partnerId)
      }
      var existingHistory = newNetwork.get('member_history') || []
      var newHistEntry = {
        id: $security.randomString(16),
        partner_id: partnerId,
        partner_name: partnerName,
        action: 'added',
        user: 'Sistema',
        date: new Date().toISOString(),
        justification: 'Vinculado via edição de parceiro',
      }
      newNetwork.set('member_ids', members)
      newNetwork.set(
        'member_history',
        Array.isArray(existingHistory) ? existingHistory.concat([newHistEntry]) : [newHistEntry],
      )
      $app.saveNoValidate(newNetwork)
    } catch (_) {}
  }

  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    log.set('action', 'network_member_change')
    log.set('module', 'Cadastros')
    log.set('target_collection', 'partners')
    log.set('target_id', partnerId)
    log.set('target_summary', partnerName)
    log.set('new_value', JSON.stringify({ old_network: oldNetworkId, new_network: newNetworkId }))
    log.set('criticidade', 'Media')
    log.set('origem', 'Area da Empresa')
    $app.save(log)
  } catch (_) {}

  return e.next()
}, 'partners')
