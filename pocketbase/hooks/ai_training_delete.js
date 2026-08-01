routerAdd(
  'DELETE',
  '/backend/v1/ai-training/{id}',
  (e) => {
    try {
      var id = e.request.pathValue('id')
      var auth = e.auth
      if (!auth) return e.unauthorizedError('auth required')
      if (auth.getString('role') !== 'SUP') {
        return e.forbiddenError('Apenas gestores (SUP) podem gerenciar treinamentos')
      }

      var record = $app.findRecordById('ai_training', id)
      $app.delete(record)

      return e.json(200, { success: true })
    } catch (err) {
      return e.json(500, { error: 'Erro ao excluir treinamento' })
    }
  },
  $apis.requireAuth(),
)
