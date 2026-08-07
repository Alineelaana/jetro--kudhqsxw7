routerAdd(
  'POST',
  '/backend/v1/vr/send-parcial',
  (e) => {
    const body = e.requestInfo().body || {}
    const targetScope = body.target_scope || 'todos'
    const competencia = body.competencia || ''
    const userId = e.auth ? e.auth.id : ''

    if (!competencia) {
      return e.badRequestError('competencia is required')
    }

    try {
      const vendedores = $app.findRecordsByFilter('vendedores', 'active = true', 'name', 0, 0)
      let sent = 0

      for (const v of vendedores) {
        const vendedorName = v.getString('name') || ''
        const email = v.getString('email') || ''
        if (!email) continue

        const goals = $app.findRecordsByFilter(
          'sales_goals',
          'rca = {:name} || vendedor_interno = {:name}',
          '-created',
          0,
          0,
          vendedorName,
          vendedorName,
        )

        let content = 'PARCIAL DE METAS\n\n'
        content += 'Vendedor: ' + vendedorName + '\n'
        content += 'Competencia: ' + competencia + '\n\n'

        for (const g of goals) {
          content +=
            g.getString('name') +
            ': Meta R$ ' +
            g.getString('target_value') +
            ' | Realizado R$ ' +
            g.getString('realized_value') +
            '\n'
        }

        const col = $app.findCollectionByNameOrId('goal_communications')
        const record = new Record(col)
        record.set('sent_by', e.auth ? e.auth.getString('name') : '')
        record.set('sent_to', email)
        record.set('vendedor_name', vendedorName)
        record.set('email', email)
        record.set('competencia', competencia)
        record.set('content', content)
        record.set('send_status', 'enviado')
        record.set('target_scope', targetScope)
        $app.save(record)

        sent++
      }

      return e.json(200, { sent: sent, competencia: competencia })
    } catch (err) {
      return e.json(500, { error: 'Send failed', detail: String(err) })
    }
  },
  $apis.requireAuth(),
)
