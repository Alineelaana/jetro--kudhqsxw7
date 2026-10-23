// pb_hooks/product_cost_protection.js
// Proteção de Custo dos Produtos — ERP HURAM
// Bloqueia edição manual de campos de custo (cost_price, last_cost, cost_origin, cost_locked, cost_type).
// Registra criação com normalização e histórico inicial em product_cost_history.
// Registra violações de segurança em audit_logs.

onRecordUpdateRequest((e) => {
  // Identifica se a operação vem de contexto interno do sistema (ex: hook de estoque ou faturamento)
  var isInternalSystem = false
  try {
    var customCtx = e.customContext ? e.customContext() : null
    if (customCtx && (customCtx.get('cost_system_update') || customCtx.get('internal_call'))) {
      isInternalSystem = true
    }
  } catch (_) {}

  // Identifica chamadas derivadas de rotas não-diretas do produto (movimentações de estoque, importação de NF, ordens de produção)
  try {
    if (e.httpContext) {
      var reqPath = ''
      try {
        reqPath = e.httpContext.request().url.path || ''
      } catch (_) {}
      if (reqPath && reqPath.indexOf('/api/collections/products/records') === -1) {
        isInternalSystem = true
      }
    } else {
      // Sem contexto HTTP direto (execução em background / hooks)
      isInternalSystem = true
    }
  } catch (_) {}

  // Se for chamada interna do sistema, permite prosseguir
  if (isInternalSystem) {
    e.next()
    return
  }

  // Compara o estado original persistido no banco com a tentativa de alteração manual
  var originalRecord = e.record.original()
  if (!originalRecord) {
    e.next()
    return
  }

  var PROTECTED_FIELDS = ['cost_price', 'last_cost', 'cost_origin', 'cost_locked', 'cost_type']
  var changedFields = []

  for (var i = 0; i < PROTECTED_FIELDS.length; i++) {
    var field = PROTECTED_FIELDS[i]
    var oldVal = originalRecord.get(field)
    var newVal = e.record.get(field)

    // Normalização para comparação robusta (strings vazias vs null vs undefined)
    var oldStr = oldVal === null || oldVal === undefined ? '' : String(oldVal).trim()
    var newStr = newVal === null || newVal === undefined ? '' : String(newVal).trim()

    // Para booleanos
    if (field === 'cost_locked') {
      var oldBool = Boolean(oldVal)
      var newBool = Boolean(newVal)
      if (oldBool !== newBool) {
        changedFields.push({ field: field, old: oldBool, new: newBool })
      }
      continue
    }

    if (oldStr !== newStr) {
      changedFields.push({ field: field, old: oldStr, new: newStr })
    }
  }

  // Se nenhum campo protegido foi alterado, permite o update normalmente
  if (changedFields.length === 0) {
    e.next()
    return
  }

  // TENTATIVA DE ALTERAÇÃO MANUAL DETECTADA
  // Registra em audit_logs o evento de segurança
  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    var authUser = e.auth
    var userId = authUser ? authUser.id : ''
    var userName = authUser
      ? authUser.getString('name') || authUser.email || ''
      : 'Não identificado'
    var userRole = authUser ? authUser.getString('role') : ''

    log.set('user_id', userId)
    log.set('user_name', userName)
    log.set('user_role', userRole)
    log.set('action', 'security_cost_update_blocked')
    log.set('module', 'produtos')
    log.set('target_collection', 'products')
    log.set('target_id', e.record.id)
    log.set(
      'target_summary',
      e.record.getString('name') || e.record.getString('code') || e.record.id,
    )
    log.set(
      'new_value',
      JSON.stringify({
        tentativa: 'Edição manual de campos de custo bloqueada',
        campos_alterados: changedFields,
        origem_bloqueio: 'product_cost_protection.js',
      }),
    )
    log.set('criticidade', 'Alta')
    log.set('origem', 'Proteção de Custos')
    log.set(
      'justification',
      'Tentativa de alteração manual de custos de produtos rejeitada pela governança de custos.',
    )
    log.set('is_suspicious', true)
    $app.save(log)
  } catch (err) {
    $app.logger().error('Falha ao registrar audit_log de bloqueio de custo', 'error', String(err))
  }

  var fieldNames = changedFields
    .map(function (item) {
      return item.field
    })
    .join(', ')
  return e.forbiddenError(
    'A alteração manual dos custos (' +
      fieldNames +
      ') é bloqueada pelas políticas de governança do ERP HURAM (HTTP 403). Os custos são calculados exclusivamente por documentos fiscais de entrada (custo médio ponderado) e ordens de produção.',
  )
}, 'products')

onRecordCreateRequest((e) => {
  // Neutraliza/normaliza campos de custo enviados pelo formulário
  var tipoFinalidade = e.record.getString('tipo_finalidade') || ''
  var isRevenda =
    tipoFinalidade === 'revenda' || tipoFinalidade === '' || tipoFinalidade === 'mercadoria_revenda'

  // Define cost_origin como initial
  e.record.set('cost_origin', 'initial')

  // Define cost_type conforme a finalidade do produto
  if (!e.record.getString('cost_type')) {
    e.record.set('cost_type', isRevenda ? 'revenda' : 'fabricado')
  }

  // Trava para revenda por padrão
  if (e.record.get('cost_locked') === null || e.record.get('cost_locked') === undefined) {
    e.record.set('cost_locked', isRevenda)
  }

  e.next()
}, 'products')

onRecordAfterCreateSuccess((e) => {
  try {
    // Após criar o produto, registra o custo inicial no product_cost_history
    var costPriceRaw = e.record.getString('cost_price') || ''
    var costNum = parseFloat(costPriceRaw.replace(',', '.')) || 0

    var historyCol = $app.findCollectionByNameOrId('product_cost_history')
    var hist = new Record(historyCol)
    hist.set('product', e.record.id)
    hist.set('data_hora', new Date().toISOString())
    hist.set('origem', 'initial')
    hist.set('documento_referencia', 'CADASTRO_INICIAL')
    hist.set('metodo', 'last_entry')
    hist.set('custo_anterior', 0)
    hist.set('custo_novo', costNum)
    hist.set('composicao', {
      motivo: 'Custo inicial definido na criação do produto',
      cost_price_informado: costPriceRaw,
      tipo_finalidade: e.record.getString('tipo_finalidade'),
    })
    hist.set('quantidade_entrada', 0)
    hist.set('saldo_apos', e.record.getInt('stock') || 0)
    if (e.auth) {
      hist.set('usuario', e.auth.id)
    }
    $app.save(hist)
  } catch (err) {
    $app.logger().error('Falha ao gravar product_cost_history no create', 'error', String(err))
  } finally {
    e.next()
  }
}, 'products')
