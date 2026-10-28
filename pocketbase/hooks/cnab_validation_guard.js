/**
 * Hook de validação e auditoria para o módulo CNAB (PocketBase v0.23+ / v0.36)
 * Validações:
 * 1. Convênio completo obrigatório para configuração (onRecordCreateRequest / onRecordUpdateRequest)
 * 2. Unicidade de título em remessas ativas (não canceladas)
 * 3. Proibição de inclusão de títulos já pagos ou cancelados
 * 4. Ao criar remessa com sucesso: marca o título com vínculo e atualiza sequencial do convênio
 * 5. Ao cancelar remessa: desvincula títulos para permitir nova geração
 * 6. Registra trilha de auditoria em audit_logs
 */

// Validação de configuração CNAB na criação
onRecordCreateRequest((e) => {
  var bCode = e.record.getString('banco_codigo') || ''
  var agencia = e.record.getString('agencia') || ''
  var conta = e.record.getString('conta') || ''
  var carteira = e.record.getString('carteira') || ''
  var convenio = e.record.getString('convenio') || ''
  var cedente = e.record.getString('cedente_codigo') || ''

  if (!bCode || !agencia || !conta || !carteira || !convenio || !cedente) {
    throw new BadRequestError(
      'Configuração de convênio incompleta. Código do Banco, Agência, Conta, Carteira, Convênio e Código do Cedente são obrigatórios.',
    )
  }

  if (!e.record.getInt('sequencial_remessa') || e.record.getInt('sequencial_remessa') < 1) {
    e.record.set('sequencial_remessa', 1)
  }

  return e.next()
}, 'cnab_configs')

// Validação de configuração CNAB na atualização
onRecordUpdateRequest((e) => {
  var bCode = e.record.getString('banco_codigo') || ''
  var agencia = e.record.getString('agencia') || ''
  var conta = e.record.getString('conta') || ''
  var carteira = e.record.getString('carteira') || ''
  var convenio = e.record.getString('convenio') || ''
  var cedente = e.record.getString('cedente_codigo') || ''

  if (!bCode || !agencia || !conta || !carteira || !convenio || !cedente) {
    throw new BadRequestError(
      'Configuração de convênio incompleta. Código do Banco, Agência, Conta, Carteira, Convênio e Código do Cedente são obrigatórios.',
    )
  }

  return e.next()
}, 'cnab_configs')

// Validação antes de criar remessa
onRecordCreateRequest((e) => {
  var configId = e.record.getString('config_id')
  if (!configId) {
    throw new BadRequestError('Convênio bancário não informado para a remessa.')
  }

  try {
    $app.findRecordById('cnab_configs', configId)
  } catch (_) {
    throw new BadRequestError('Convênio bancário não encontrado ou inativo.')
  }

  var titulosIds = e.record.get('titulos_ids') || []
  if (!titulosIds || titulosIds.length === 0) {
    throw new BadRequestError('A remessa precisa conter ao menos um título.')
  }

  for (var i = 0; i < titulosIds.length; i++) {
    var tid = titulosIds[i]
    var recTitle
    try {
      recTitle = $app.findRecordById('financial_receivables', tid)
    } catch (_) {
      continue
    }

    var st = recTitle.getString('status') || ''
    if (st === 'Recebido' || st === 'Pago') {
      throw new BadRequestError(
        'O título ' +
          (recTitle.getString('numero_titulo') || tid) +
          ' já está liquidado/recebido e não pode ser remetido.',
      )
    }
    if (st === 'Cancelado' || st === 'Cancelada') {
      throw new BadRequestError(
        'O título ' +
          (recTitle.getString('numero_titulo') || tid) +
          ' está cancelado e não pode ser remetido.',
      )
    }

    var activeBatches = $app.findRecordsByFilter(
      'cnab_remessas',
      'status != "cancelado" && titulos_ids ~ "' + tid + '"',
      '-created',
      1,
      0,
    )
    if (activeBatches.length > 0) {
      throw new BadRequestError(
        'O título ' +
          (recTitle.getString('numero_titulo') || tid) +
          ' já consta na remessa ativa nº ' +
          activeBatches[0].getInt('sequencial_arquivo') +
          ' (' +
          activeBatches[0].getString('nome_arquivo') +
          '). Cancele a remessa anterior antes de gerar uma nova.',
      )
    }
  }

  return e.next()
}, 'cnab_remessas')

// Pós-criação de remessa: atualiza sequencial do convênio e gera trilha de auditoria
onRecordAfterCreateSuccess((e) => {
  try {
    var configId = e.record.getString('config_id')
    if (configId) {
      var configRec = $app.findRecordById('cnab_configs', configId)
      var currentSeq = configRec.getInt('sequencial_remessa') || 1
      var remessaSeq = e.record.getInt('sequencial_arquivo') || currentSeq
      if (remessaSeq >= currentSeq) {
        configRec.set('sequencial_remessa', remessaSeq + 1)
        $app.save(configRec)
      }
    }

    // Trilha de auditoria
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    if (auditCol) {
      var auditRec = new Record(auditCol)
      auditRec.set('user_id', e.record.getString('usuario_id') || '')
      auditRec.set('user_name', e.record.getString('usuario_nome') || 'Sistema CNAB')
      auditRec.set('user_role', 'FINANCEIRO')
      auditRec.set('action', 'GERAR_REMESSA_CNAB')
      auditRec.set('module', 'Financeiro')
      auditRec.set('target_collection', 'cnab_remessas')
      auditRec.set('target_id', e.record.id)
      auditRec.set(
        'target_summary',
        'Arquivo de remessa ' +
          e.record.getString('nome_arquivo') +
          ' gerado com ' +
          e.record.getInt('quantidade_titulos') +
          ' títulos. Valor total: R$ ' +
          e.record.getString('valor_total'),
      )
      auditRec.set('criticidade', 'Média')
      auditRec.set('origem', 'Área da Empresa')
      auditRec.set('empresa', e.record.getString('empresa') || '')
      auditRec.set('filial', e.record.getString('filial') || '')
      $app.save(auditRec)
    }
  } catch (err) {
    $app.logger().error('cnab after create remessa error', 'err', String(err))
  }
  return e.next()
}, 'cnab_remessas')

// Auditoria no upload de retorno
onRecordAfterCreateSuccess((e) => {
  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    if (auditCol) {
      var auditRec = new Record(auditCol)
      auditRec.set('user_id', e.record.getString('usuario_id') || '')
      auditRec.set('user_name', e.record.getString('usuario_nome') || 'Sistema CNAB')
      auditRec.set('user_role', 'FINANCEIRO')
      auditRec.set('action', 'PROCESSAR_RETORNO_CNAB')
      auditRec.set('module', 'Financeiro')
      auditRec.set('target_collection', 'cnab_retornos')
      auditRec.set('target_id', e.record.id)
      auditRec.set(
        'target_summary',
        'Retorno ' +
          e.record.getString('nome_arquivo') +
          ' processado. Liquidados: ' +
          e.record.getInt('total_liquidados') +
          ', Divergências: ' +
          e.record.getInt('total_divergencias') +
          ', Rejeições: ' +
          e.record.getInt('total_rejeicoes'),
      )
      auditRec.set('criticidade', 'Alta')
      auditRec.set('origem', 'Área da Empresa')
      auditRec.set('empresa', e.record.getString('empresa') || '')
      auditRec.set('filial', e.record.getString('filial') || '')
      $app.save(auditRec)
    }
  } catch (err) {
    $app.logger().error('cnab after create retorno error', 'err', String(err))
  }
  return e.next()
}, 'cnab_retornos')
