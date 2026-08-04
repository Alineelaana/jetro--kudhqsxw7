routerAdd(
  'POST',
  '/backend/v1/audit/archive/{id}',
  (e) => {
    if (!e.auth || e.auth.getString('role') !== 'SUP') {
      return e.forbiddenError('Apenas SUP pode arquivar registros de auditoria')
    }
    var id = e.request.pathValue('id')
    try {
      var record = $app.findRecordById('audit_logs', id)
      record.set('archived', true)
      $app.save(record)
      return e.json(200, { success: true, id: id })
    } catch (err) {
      return e.json(404, { error: 'Registro não encontrado' })
    }
  },
  $apis.requireAuth(),
)
