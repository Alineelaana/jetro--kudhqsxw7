onRecordCreate((e) => {
  var count = 0
  try {
    count = $app.countRecords('service_centers')
  } catch (_) {}
  var protocol = String(new Date().getFullYear()) + String(count + 1).padStart(6, '0')
  e.record.set('protocol', protocol)

  var motivoId = e.record.getString('motivo_id')
  if (motivoId) {
    try {
      var motivo = $app.findRecordById('atendimento_motivos', motivoId)
      if (!e.record.getString('setor_id')) {
        e.record.set('setor_id', motivo.getString('setor_id'))
      }
      var slaHoras = motivo.getInt('sla_horas') || 24
      var limite = new Date(Date.now() + slaHoras * 3600000)
      e.record.set('data_hora_limite', limite.toISOString())
      e.record.set('sla_limite', String(slaHoras))
    } catch (_) {}
  }

  if (!e.record.getString('status')) {
    e.record.set('status', 'Aberto')
  }

  var now = new Date()
  e.record.set('data_abertura', now.toISOString().split('T')[0])
  e.record.set('hora_abertura', now.toTimeString().split(' ')[0])

  e.next()
}, 'service_centers')
