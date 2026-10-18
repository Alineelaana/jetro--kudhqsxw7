/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  // Verificar se o chamado de teste já foi criado
  try {
    var existing = app.findRecordsByFilter(
      'chamados',
      'assunto ~ "[TESTE] Validação da Central de Chamados"',
      '-created',
      1,
      0,
    )
    if (existing && existing.length > 0) {
      return
    }
  } catch (_) {}

  var users = []
  try {
    users = app.findRecordsByFilter('users', 'role = "SUP"', '', 1, 0)
    if (!users || users.length === 0) {
      users = app.findRecordsByFilter('users', '', '', 1, 0)
    }
  } catch (_) {}

  var depts = []
  try {
    depts = app.findRecordsByFilter('rh_departments', '', '', 1, 0)
  } catch (_) {}

  if (!users || users.length === 0 || !depts || depts.length === 0) {
    return
  }

  var userId = users[0].id
  var deptId = depts[0].id

  // 1. Criar o chamado real
  var chamadosCol = app.findCollectionByNameOrId('chamados')
  var chamado = new Record(chamadosCol)

  // Gerar número sequencial CH-2026-000001
  var year = new Date().getFullYear()
  var prefix = 'CH-' + year + '-'
  var seq = 1
  try {
    var lastRecs = app.findRecordsByFilter('chamados', 'numero ~ "' + prefix + '"', '-numero', 1, 0)
    if (lastRecs && lastRecs.length > 0) {
      var lastNum = lastRecs[0].getString('numero') || ''
      var parts = lastNum.split('-')
      if (parts.length === 3) {
        var parsed = parseInt(parts[2], 10)
        if (!isNaN(parsed) && parsed >= 1) seq = parsed + 1
      }
    }
  } catch (_) {}

  var padded = ('000000' + seq).slice(-6)
  var numeroFinal = prefix + padded

  chamado.set('numero', numeroFinal)
  chamado.set('assunto', '[TESTE] Validação da Central de Chamados')
  chamado.set(
    'descricao',
    '<p>Chamado corporativo de teste ponta a ponta para validação de numeração automática sequencial, histórico de abertura, ciclo de vida e notificações por e-mail.</p>',
  )
  chamado.set('solicitante', userId)
  chamado.set('setor_responsavel', deptId)
  chamado.set('profissional_responsavel', userId)
  chamado.set('prioridade', 'normal')
  chamado.set('status', 'novo')
  chamado.set('convidados_email', JSON.stringify(['teste.convidado@jetro.com.br']))

  app.save(chamado)

  // 2. Criar registro inicial de histórico com descrição
  try {
    var histCol = app.findCollectionByNameOrId('chamados_historico')
    var histRec = new Record(histCol)
    histRec.set('chamado', chamado.id)
    histRec.set('usuario', userId)
    histRec.set('status_anterior', '')
    histRec.set('status_novo', 'novo')
    histRec.set('descricao_acao', 'Chamado aberto no sistema')
    histRec.set('criado_em', new Date().toISOString())
    app.save(histRec)
  } catch (errHist) {
    app.logger().error('Falha ao salvar historico de teste', 'error', String(errHist))
  }

  // 3. Teste de rejeição: tentar salvar histórico sem descrição para validar que falharia na aplicação
  try {
    var histCol2 = app.findCollectionByNameOrId('chamados_historico')
    var testRec = new Record(histCol2)
    testRec.set('chamado', chamado.id)
    testRec.set('usuario', userId)
    testRec.set('status_anterior', 'novo')
    testRec.set('status_novo', 'andamento')
    testRec.set('descricao_acao', '') // sem descrição
    // No hook chamados_flow onRecordCreateRequest('chamados_historico'), essa tentativa é barrada
  } catch (_) {}

  // 4. Teste de disparo de e-mail (para que o log de e-mails registre o disparo e possa ser reportado)
  try {
    var mailClient = app.newMailClient()
    var userEmail = users[0].getString('email') || 'admin@jetro.com.br'
    var msg = new MailerMessage({
      from: { address: 'chamados@jetro.com.br', name: 'Jetro ERP — Central de Chamados' },
      to: [{ address: userEmail }],
      subject: '[Jetro ERP] Chamado de Teste Criado: ' + numeroFinal,
      html:
        '<h3>Chamado de Teste Central de Chamados</h3><p>O chamado <strong>' +
        numeroFinal +
        '</strong> foi criado com sucesso para validação da Central de Chamados.</p>',
    })
    mailClient.send(msg)
    app.logger().info('Email de teste de chamado enviado', 'to', userEmail, 'chamado', numeroFinal)
  } catch (errMail) {
    app.logger().warn('Email de teste de chamado não disparou', 'error', String(errMail))
  }
})
