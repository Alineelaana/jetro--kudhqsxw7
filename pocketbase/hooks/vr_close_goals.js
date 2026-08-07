routerAdd(
  'POST',
  '/backend/v1/vr/close-goals',
  (e) => {
    const body = e.requestInfo().body || {}
    const competencia = body.competencia || ''

    if (!competencia) {
      return e.badRequestError('competencia is required')
    }

    try {
      const goals = $app.findRecordsByFilter('sales_goals', "status = 'ativa'", '-created', 0, 0)
      let closed = 0

      for (const goal of goals) {
        const target = parseFloat(goal.getString('target_value') || '0')
        const realized = parseFloat(goal.getString('realized_value') || '0')
        const pct = target > 0 ? (realized / target) * 100 : 0

        $app
          .db()
          .newQuery("UPDATE sales_goals SET status = 'concluida' WHERE id = {:id}")
          .bind({ id: goal.id })
          .execute()

        const awards = $app.findRecordsByFilter(
          'goal_awards',
          'goal_id = {:gid}',
          '-created',
          0,
          0,
          goal.id,
        )
        for (const award of awards) {
          if (pct >= 90) {
            $app
              .db()
              .newQuery(
                "UPDATE goal_awards SET conquistado = previsto, status = 'ativa' WHERE id = {:id}",
              )
              .bind({ id: award.id })
              .execute()
          }
        }

        closed++
      }

      return e.json(200, { closed: closed, competencia: competencia })
    } catch (err) {
      return e.json(500, { error: 'Close failed', detail: String(err) })
    }
  },
  $apis.requireAuth(),
)
