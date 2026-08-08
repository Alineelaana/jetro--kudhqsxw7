onRecordAfterCreateSuccess((e) => {
  const channel = e.record.getString('sales_channel')
  const DIGITAL_KEYWORDS = ['b2b', 'b2c', 'portal', 'digital', 'online', 'ecommerce', 'site', 'web']

  if (!channel || channel.length === 0) return e.next()
  const channelLower = channel.toLowerCase()
  const isDigital = DIGITAL_KEYWORDS.some(function (kw) {
    return channelLower.indexOf(kw) !== -1
  })
  if (!isDigital) return e.next()

  const clientId = e.record.getString('client_id')
  if (!clientId || clientId.length === 0) return e.next()

  let partnerId = clientId
  try {
    const client = $app.findRecordById('clients', clientId)
    const pid = client.getString('partner_id')
    if (pid && pid.length > 0) partnerId = pid
  } catch (_) {}

  try {
    const partner = $app.findRecordById('partners', partnerId)
    const digitalResponsibleId = partner.getString('responsavel_comercial_digital_id')
    if (!digitalResponsibleId || digitalResponsibleId.length === 0) return e.next()

    const existingSalesperson = e.record.getString('salesperson_id')
    if (existingSalesperson && existingSalesperson.length > 0) return e.next()

    const record = $app.findRecordById('sales_orders', e.record.id)
    record.set('salesperson_id', digitalResponsibleId)
    try {
      const user = $app.findRecordById('users', digitalResponsibleId)
      record.set('salesperson_name', user.getString('name') || user.getString('email') || '')
    } catch (_) {}
    $app.saveNoValidate(record)

    try {
      const auditCol = $app.findCollectionByNameOrId('audit_logs')
      const audit = new Record(auditCol)
      audit.set('user_name', 'Sistema')
      audit.set('action', 'auto_assign_digital_responsible')
      audit.set('module', 'Vendas')
      audit.set('target_collection', 'sales_orders')
      audit.set('target_id', e.record.id)
      audit.set('target_summary', 'Auto-assign Responsavel Comercial Digital')
      audit.set(
        'new_value',
        JSON.stringify({
          sales_order_id: e.record.id,
          responsible_id: digitalResponsibleId,
          channel: channel,
        }),
      )
      audit.set('criticidade', 'Baixa')
      audit.set('origem', 'Automacao')
      audit.set('is_suspicious', false)
      audit.set('archived', false)
      $app.save(audit)
    } catch (_) {}
  } catch (_) {}

  return e.next()
}, 'sales_orders')
