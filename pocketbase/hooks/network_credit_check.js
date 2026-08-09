routerAdd(
  'POST',
  '/backend/v1/networks/credit-check',
  (e) => {
    var body = e.requestInfo().body || {}
    var partnerId = body.partner_id || ''
    if (!partnerId) return e.badRequestError('partner_id is required')

    var partner = null
    try {
      partner = $app.findRecordById('partners', partnerId)
    } catch (_) {
      return e.notFoundError('Partner not found')
    }

    var partnerName = partner.getString('full_name') || partner.getString('company_name') || ''
    var networkId = partner.getString('network_id') || ''
    var ownRestriction = partner.getBool('financial_restriction')

    var ownOverdue = 0,
      ownMaxDays = 0
    try {
      var recs = $app.findRecordsByFilter(
        'financial_receivables',
        'cliente ~ "' + partnerName + '" && status != "Recebido" && status != "Cancelado"',
        '',
        500,
        0,
      )
      for (var i = 0; i < recs.length; i++) {
        var saldo =
          parseFloat(recs[i].getString('valor_original') || '0') -
          parseFloat(recs[i].getString('valor_recebido') || '0')
        var venc = recs[i].getString('data_vencimento')
        if (venc) {
          var days = Math.floor((Date.now() - new Date(venc).getTime()) / 86400000)
          if (days > 0) {
            ownOverdue += saldo
            if (days > ownMaxDays) ownMaxDays = days
          }
        }
      }
    } catch (_) {}

    var networkName = '',
      networkMembers = [],
      networkOverdue = 0,
      networkMaxDays = 0
    var restrictionPolicy = 'alert',
      networkLimit = 0

    if (networkId) {
      try {
        var network = $app.findRecordById('client_networks', networkId)
        networkName = network.getString('name') || ''
        restrictionPolicy = network.getString('restriction_policy') || 'alert'
        networkLimit = parseFloat(network.getString('credit_limit') || '0')
      } catch (_) {}
      try {
        networkMembers = $app.findRecordsByFilter(
          'partners',
          'network_id = "' + networkId + '" && id != "' + partnerId + '"',
          '',
          500,
          0,
        )
      } catch (_) {}
      for (var mi = 0; mi < networkMembers.length; mi++) {
        var mName =
          networkMembers[mi].getString('full_name') ||
          networkMembers[mi].getString('company_name') ||
          ''
        try {
          var mRecs = $app.findRecordsByFilter(
            'financial_receivables',
            'cliente ~ "' + mName + '" && status != "Recebido" && status != "Cancelado"',
            '',
            500,
            0,
          )
          for (var mri = 0; mri < mRecs.length; mri++) {
            var mSaldo =
              parseFloat(mRecs[mri].getString('valor_original') || '0') -
              parseFloat(mRecs[mri].getString('valor_recebido') || '0')
            var mVenc = mRecs[mri].getString('data_vencimento')
            if (mVenc) {
              var mDays = Math.floor((Date.now() - new Date(mVenc).getTime()) / 86400000)
              if (mDays > 0) {
                networkOverdue += mSaldo
                if (mDays > networkMaxDays) networkMaxDays = mDays
              }
            }
          }
        } catch (_) {}
      }
    }

    var hasOwnDelinquency = ownOverdue > 0
    var hasNetworkDelinquency = networkOverdue > 0
    var decision = 'approved'
    if (
      restrictionPolicy === 'block' &&
      (hasOwnDelinquency || hasNetworkDelinquency || ownRestriction)
    ) {
      decision = 'blocked'
    } else if (
      restrictionPolicy === 'require_approval' &&
      (hasOwnDelinquency || hasNetworkDelinquency || ownRestriction)
    ) {
      decision = 'requires_approval'
    }

    return e.json(200, {
      decision: decision,
      partner_id: partnerId,
      partner_name: partnerName,
      network_id: networkId,
      network_name: networkName,
      own_delinquency: hasOwnDelinquency,
      network_delinquency: hasNetworkDelinquency,
      own_overdue_amount: ownOverdue,
      network_overdue_amount: networkOverdue,
      individual_limit: 0,
      network_limit: networkLimit,
      restriction_policy: restrictionPolicy,
      own_max_days: ownMaxDays,
      network_max_days: networkMaxDays,
      members_count: networkMembers.length + 1,
    })
  },
  $apis.requireAuth(),
)
