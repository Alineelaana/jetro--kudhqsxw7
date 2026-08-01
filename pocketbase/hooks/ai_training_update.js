routerAdd(
  'PATCH',
  '/backend/v1/ai-training/{id}',
  (e) => {
    try {
      var id = e.request.pathValue('id')
      var body = e.requestInfo().body || {}
      var auth = e.auth
      if (!auth) return e.unauthorizedError('auth required')
      if (auth.getString('role') !== 'SUP') {
        return e.forbiddenError('Apenas gestores (SUP) podem gerenciar treinamentos')
      }

      var title = (body.title || '').trim()
      var content = (body.content || '').trim()
      var type = body.type || 'instruction'

      var errors = {}
      if (!title) errors.title = 'O título é obrigatório.'
      if (!content) errors.content = 'O conteúdo é obrigatório.'
      if (Object.keys(errors).length > 0) {
        throw new BadRequestError('Dados inválidos', errors)
      }

      var record = $app.findRecordById('ai_training', id)
      record.set('title', title)
      record.set('content', content)
      record.set('type', type)
      $app.save(record)

      return e.json(200, { success: true })
    } catch (err) {
      if (err instanceof BadRequestError) throw err
      return e.json(500, { error: 'Erro ao atualizar treinamento' })
    }
  },
  $apis.requireAuth(),
)
