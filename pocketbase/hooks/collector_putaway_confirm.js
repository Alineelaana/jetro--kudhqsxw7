routerAdd(
  'POST',
  '/backend/v1/collector/putaway-confirm',
  (e) => {
    var body = e.requestInfo().body || {}
    var taskId = body.task_id || ''
    var localizacaoDestino = body.localizacao_destino || ''
    var codigoBarras = body.codigo_barras || ''
    var quantidade = parseInt(body.quantidade) || 0

    if (!taskId) return e.badRequestError('task_id is required')
    if (!localizacaoDestino) return e.badRequestError('localizacao_destino is required')

    try {
      var task = $app.findRecordById('wms_putaway_tasks', taskId)
      if (task.getString('status') !== 'Em Andamento' && task.getString('status') !== 'Pendente') {
        return e.badRequestError('Task nao esta disponivel para confirmacao')
      }

      if (quantidade > 0 && quantidade !== task.getInt('quantidade')) {
        return e.badRequestError('Quantidade divergente. Esperada: ' + task.getInt('quantidade'))
      }

      var userName = (e.auth && e.auth.getString('name')) || 'Coletor'
      task.set('localizacao_destino', localizacaoDestino)
      task.set('status', 'Concluido')
      task.set('operador', userName)
      $app.save(task)

      var prodId = task.getString('produto_id') || ''
      if (prodId) {
        try {
          var prod = $app.findRecordById('products', prodId)
          var movCol = $app.findCollectionByNameOrId('stock_movements')
          var mov = new Record(movCol)
          mov.set('produto_id', prodId)
          mov.set('produto_nome', task.getString('produto_nome') || '')
          mov.set('produto_codigo', task.getString('produto_codigo') || '')
          mov.set('tipo_movimentacao', 'Transferência')
          mov.set('documento_origem', task.getString('numero_task'))
          mov.set('documento_tipo', 'Endereçamento WMS')
          mov.set('quantidade', task.getInt('quantidade') || 0)
          mov.set('localizacao_destino', localizacaoDestino)
          mov.set('motivo', 'Enderecamento confirmado via coletor')
          mov.set('responsavel', userName)
          $app.save(mov)
        } catch (_) {}
      }

      return e.json(200, { id: task.id, status: 'Concluido' })
    } catch (err) {
      return e.json(400, { error: 'Erro no enderecamento: ' + String(err) })
    }
  },
  $apis.requireAuth(),
)
