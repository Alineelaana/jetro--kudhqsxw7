/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // 1. Atualiza a coleção report_schedules adicionando recipients_bcc (caso ainda não exista)
    try {
      const schedCol = app.findCollectionByNameOrId('report_schedules')
      if (schedCol) {
        const existingField = schedCol.fields.getByName('recipients_bcc')
        if (!existingField) {
          schedCol.fields.add(
            new TextField({
              name: 'recipients_bcc',
              required: false,
            }),
          )
          app.save(schedCol)
        }
      }
    } catch (e1) {
      console.log('Aviso ao adicionar campo recipients_bcc em report_schedules:', e1)
    }

    // 2. Atualiza a coleção report_schedule_executions adicionando recipients_bcc
    try {
      const execCol = app.findCollectionByNameOrId('report_schedule_executions')
      if (execCol) {
        const existingField = execCol.fields.getByName('recipients_bcc')
        if (!existingField) {
          execCol.fields.add(
            new TextField({
              name: 'recipients_bcc',
              required: false,
            }),
          )
          app.save(execCol)
        }
      }
    } catch (e2) {
      console.log('Aviso ao adicionar campo recipients_bcc em report_schedule_executions:', e2)
    }
  },
  (app) => {
    try {
      const schedCol = app.findCollectionByNameOrId('report_schedules')
      if (schedCol) {
        const f = schedCol.fields.getByName('recipients_bcc')
        if (f) {
          schedCol.fields.removeByName('recipients_bcc')
          app.save(schedCol)
        }
      }
    } catch (_) {}

    try {
      const execCol = app.findCollectionByNameOrId('report_schedule_executions')
      if (execCol) {
        const f = execCol.fields.getByName('recipients_bcc')
        if (f) {
          execCol.fields.removeByName('recipients_bcc')
          app.save(execCol)
        }
      }
    } catch (_) {}
  },
)
