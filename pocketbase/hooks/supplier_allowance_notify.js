onRecordAfterCreateSuccess(
  (e) => {
    try {
      var title = ''
      var message = ''
      var link = '/admin/verbas'

      if (e.record.collectionName === 'supplier_allowance_settlements') {
        title = 'Nova Liquidação de Verba'
        message = 'Liquidação de R$ ' + (e.record.getString('settled_value') || '0') + ' criada'
        link = '/admin/verbas/liquidacoes'
      } else if (e.record.collectionName === 'supplier_allowance_accruals') {
        title = 'Nova Apuração de Verba'
        message =
          'Apuração ' +
          (e.record.getString('competence_period') || '') +
          ' - R$ ' +
          (e.record.getString('earned_value') || '0')
        link = '/admin/verbas/apuracoes'
      } else if (e.record.collectionName === 'supplier_allowance_agreements') {
        title = 'Novo Acordo de Verba'
        message = 'Acordo ' + (e.record.getString('agreement_type') || '') + ' criado'
        link = '/admin/verbas/acordos'
      }

      if (!title) return e.next()

      var notifCol = $app.findCollectionByNameOrId('notifications')
      var notif = new Record(notifCol)
      notif.set('title', title)
      notif.set('message', message)
      notif.set('type', 'other')
      notif.set('read', false)
      notif.set('link', link)
      $app.save(notif)
    } catch (err) {
      $app.logger().error('SA notify failed', 'error', String(err))
    }

    return e.next()
  },
  'supplier_allowance_agreements',
  'supplier_allowance_accruals',
  'supplier_allowance_settlements',
)
