/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    try {
      const records = app.findRecordsByFilter(
        'users',
        'inactivity_timeout_minutes = null || inactivity_timeout_minutes <= 5',
        '',
        0,
        0,
      )
      for (let i = 0; i < records.length; i++) {
        const u = records[i]
        u.set('inactivity_timeout_minutes', 480)
        app.save(u)
      }
      console.log(
        'Migração 0261: Timeouts de inatividade de usuários regularizados para 480 minutos.',
      )
    } catch (e) {
      console.log('Migração 0261 (no-op ou banco vazio):', e)
    }
  },
  () => {},
)
