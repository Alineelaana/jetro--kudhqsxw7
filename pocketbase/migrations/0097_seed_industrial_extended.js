migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var resCol = app.findCollectionByNameOrId('production_resources')
    var resources = []
    try {
      resources = app.findRecordsByFilter('production_resources', '', 'name', 10, 0)
    } catch (_) {}

    var calCol = app.findCollectionByNameOrId('industrial_calendars')
    try {
      app.findFirstRecordByData('industrial_calendars', 'name', 'Calendario Padrao 2026')
    } catch (_) {
      var cal = new Record(calCol)
      cal.set('name', 'Calendario Padrao 2026')
      cal.set('work_days', JSON.stringify(['seg', 'ter', 'qua', 'qui', 'sex']))
      cal.set('active', true)
      cal.set('responsible', 'Admin')
      if (resources.length > 0) cal.set('resource_id', resources[0].id)
      app.save(cal)
    }

    var shiftCol = app.findCollectionByNameOrId('industrial_shifts')
    try {
      app.findFirstRecordByData('industrial_shifts', 'name', 'Turno Manha')
    } catch (_) {
      var calRec = app.findFirstRecordByData(
        'industrial_calendars',
        'name',
        'Calendario Padrao 2026',
      )
      var s1 = new Record(shiftCol)
      s1.set('calendar_id', calRec.id)
      s1.set('name', 'Turno Manha')
      s1.set('start_time', '06:00')
      s1.set('end_time', '14:00')
      s1.set('break_start', '10:00')
      s1.set('break_end', '10:30')
      s1.set('capacity_hours', 7.5)
      s1.set('active', true)
      app.save(s1)

      var s2 = new Record(shiftCol)
      s2.set('calendar_id', calRec.id)
      s2.set('name', 'Turno Tarde')
      s2.set('start_time', '14:00')
      s2.set('end_time', '22:00')
      s2.set('break_start', '18:00')
      s2.set('break_end', '18:30')
      s2.set('capacity_hours', 7.5)
      s2.set('active', true)
      app.save(s2)
    }

    var maintCol = app.findCollectionByNameOrId('maintenance_schedules')
    if (resources.length > 0) {
      try {
        app.findFirstRecordByData(
          'maintenance_schedules',
          'title',
          'Manutencao Preventiva Trimestral',
        )
      } catch (_) {
        var m = new Record(maintCol)
        m.set('resource_id', resources[0].id)
        m.set('type', 'preventiva')
        m.set('title', 'Manutencao Preventiva Trimestral')
        m.set('description', 'Revisao completa de componentes e lubrificacao')
        m.set('frequency_days', 90)
        m.set('status', 'agendada')
        m.set('impact_on_production', 'medio')
        m.set('estimated_downtime_hours', 4)
        m.set('responsible', 'Manutencao')
        m.set('next_maintenance', '2026-09-01')
        app.save(m)
      }
    }

    var ncCol = app.findCollectionByNameOrId('quality_non_conformities')
    try {
      app.findFirstRecordByData(
        'quality_non_conformities',
        'description',
        'Dimensoes fora de tolerancia - lote piloto',
      )
    } catch (_) {
      var nc = new Record(ncCol)
      nc.set('description', 'Dimensoes fora de tolerancia - lote piloto')
      nc.set('severity', 'media')
      nc.set('status', 'em_analise')
      nc.set('quantity_affected', 15)
      nc.set('root_cause', 'Desgaste de ferramenta')
      nc.set('corrective_action', 'Troca de ferramenta e nova calibracao')
      nc.set('responsible', 'Qualidade')
      app.save(nc)
    }

    var kpiCol = app.findCollectionByNameOrId('industrial_kpis')
    try {
      app.findFirstRecordByData('industrial_kpis', 'period', '2026-08')
    } catch (_) {
      var kpi = new Record(kpiCol)
      kpi.set('period', '2026-08')
      kpi.set('oee', 78.5)
      kpi.set('availability', 85.2)
      kpi.set('performance', 92.1)
      kpi.set('quality_rate', 99.8)
      kpi.set('efficiency', 87.3)
      kpi.set('productivity', 82.0)
      kpi.set('lead_time_minutes', 240)
      kpi.set('setup_time_minutes', 35)
      kpi.set('planned_quantity', 5000)
      kpi.set('produced_quantity', 4620)
      kpi.set('rejected_quantity', 12)
      kpi.set('cost_per_unit', '12.50')
      kpi.set('responsible', 'PCP')
      if (resources.length > 0) kpi.set('resource_id', resources[0].id)
      app.save(kpi)
    }

    console.log('0097: industrial extended seed data created')
  },
  (app) => {},
)
