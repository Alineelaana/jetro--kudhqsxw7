// Hook de segurança e integridade para depoimentos do site institucional
// Garante:
// 1. Status inicial forçado para "Pendente de Aprovação" (ninguém publica diretamente)
// 2. Anti-spam via honeypot (se preenchido, aborta)
// 3. Normalização e validação de instagram (remove @, espaços, extrai username de link)
// 4. Registro de data/hora de autorização, versão do termo e hash LGPD
// 5. Sanitização de textos
// 6. Notificação interna para usuários SUP / ADMIN do ERP Jetro

onRecordCreateRequest((e) => {
  // Verificação de Honeypot contra robôs de spam
  try {
    if (e.httpContext) {
      var reqBody = e.httpContext.get('body') || {}
      if (reqBody.website_trap || reqBody.hp_check) {
        throw new BadRequestError('Spam detectado. Envio rejeitado.')
      }
    }
  } catch (err) {
    if (String(err).indexOf('Spam detectado') !== -1) {
      throw err
    }
  }

  // Sanitização básica de strings
  var nomeAutor = (e.record.getString('nome_autor') || '').trim()
  var empresa = (e.record.getString('empresa') || '').trim()
  var email = (e.record.getString('email') || '').trim().toLowerCase()
  var rawInsta = (e.record.getString('instagram') || '').trim()
  var depoimento = (e.record.getString('depoimento') || '').trim()

  if (!nomeAutor) throw new BadRequestError('O nome completo é obrigatório.')
  if (!empresa) throw new BadRequestError('O nome da empresa é obrigatório.')
  if (!email || email.indexOf('@') === -1) throw new BadRequestError('E-mail válido é obrigatório.')
  if (!rawInsta) throw new BadRequestError('O Instagram da empresa é obrigatório.')
  if (!depoimento || depoimento.length < 10)
    throw new BadRequestError('O depoimento deve conter pelo menos 10 caracteres.')

  // Normalização do Instagram (remove @, espaços, extrai de URLs instagram.com/...)
  var cleanInsta = rawInsta.replace(/^@+/, '')
  cleanInsta = cleanInsta.replace(/https?:\/\/(www\.)?instagram\.com\//i, '')
  cleanInsta = cleanInsta
    .split('/')[0]
    .split('?')[0]
    .replace(/[^a-zA-Z0-9._]/g, '')
    .trim()

  if (!cleanInsta) {
    throw new BadRequestError('Identificador do Instagram inválido.')
  }

  // Forçar campos protegidos
  e.record.set('nome_autor', nomeAutor)
  e.record.set('empresa', empresa)
  e.record.set('email', email)
  e.record.set('instagram', cleanInsta)
  e.record.set('depoimento', depoimento)

  // Status inicial sempre 'Pendente de Aprovação'
  e.record.set('status', 'Pendente de Aprovação')
  e.record.set('verificado', false)
  e.record.set('aprovado_por', '')
  e.record.set('aprovado_em', '')
  e.record.set('reprovado_por', '')
  e.record.set('reprovado_em', '')
  e.record.set('reprovado_motivo', '')
  e.record.set('despublicado_por', '')
  e.record.set('despublicado_em', '')

  // Registro da autorização e versão
  if (!e.record.getBool('autorizacao_confirmada')) {
    throw new BadRequestError('A autorização de publicação é obrigatória para envio do depoimento.')
  }

  var nowIso = new Date().toISOString()
  if (!e.record.getString('autorizacao_data')) {
    e.record.set('autorizacao_data', nowIso)
  }
  if (!e.record.getString('autorizacao_versao')) {
    e.record.set('autorizacao_versao', 'v1.0-2026')
  }
  var termoTexto =
    'Autorizo a publicação do meu depoimento, nome, empresa, foto enviada e perfil de Instagram no site institucional do Jetro, conforme a Política de Privacidade e os termos de autorização apresentados.'
  e.record.set('autorizacao_hash', $security.sha256(termoTexto + '|' + email + '|' + nowIso))

  // Captura de IP e User-Agent se disponível
  try {
    if (e.httpContext) {
      var req = e.httpContext.request()
      var ip = req.remoteIp || req.header.get('x-forwarded-for') || ''
      var ua = req.header.get('user-agent') || ''
      e.record.set('ip_origem', ip)
      e.record.set('user_agent', ua)
    }
  } catch (_) {}

  return e.next()
}, 'site_testimonials')

// Notificação administrativa após a criação do depoimento
onRecordAfterCreateSuccess((e) => {
  try {
    var nomeAutor = e.record.getString('nome_autor') || 'Autor não informado'
    var empresa = e.record.getString('empresa') || 'Empresa'
    var email = e.record.getString('email') || ''

    // 1. Notificação interna na central de notificações do ERP para usuários SUP / ADMIN
    var users = $app.findRecordsByFilter('users', 'active != false', '', 0, 0)
    var adminRoles = ['SUP', 'ADMIN']
    var notifCol = $app.findCollectionByNameOrId('notifications')

    for (var i = 0; i < users.length; i++) {
      var u = users[i]
      var r = u.getString('role')
      if (adminRoles.indexOf(r) === -1) continue

      try {
        var notif = new Record(notifCol)
        notif.set('title', 'Novo depoimento recebido para moderação')
        notif.set(
          'message',
          'Depoimento de ' +
            nomeAutor +
            ' (' +
            empresa +
            ') aguardando análise na Administração de Depoimentos.',
        )
        notif.set('type', 'approval_pending')
        notif.set('recipient', u.id)
        notif.set('read', false)
        notif.set('link', '/admin/site-depoimentos')
        $app.saveNoValidate(notif)
      } catch (errN) {
        $app
          .logger()
          .error('Falha ao emitir notificacao interna de depoimento', 'error', String(errN))
      }
    }

    // 2. Disparo de e-mail de notificação para a administração (se houver remetente configurado)
    try {
      var mailClient = $app.newMailClient()
      var subject = '[Jetro ERP] Novo Depoimento do Site Institucional para Aprovação'
      var html =
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">' +
        '<div style="background: #01361D; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">' +
        '<h2 style="color: #E4C46A; margin: 0;">JETRO Gestão Empresarial</h2>' +
        '<p style="color: #ffffff; font-size: 13px; margin: 6px 0 0;">Novo depoimento recebido via site institucional</p>' +
        '</div>' +
        '<div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; background: #ffffff; border-radius: 0 0 8px 8px;">' +
        '<p style="font-size: 15px;">Um novo cliente enviou um depoimento sobre o Jetro e aguarda moderação administrativa antes da publicação.</p>' +
        '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">' +
        '<tr><td style="padding: 8px; font-weight: bold; width: 140px; background: #f8fafc;">Autor:</td><td style="padding: 8px; background: #f8fafc;">' +
        nomeAutor +
        '</td></tr>' +
        '<tr><td style="padding: 8px; font-weight: bold;">Empresa:</td><td style="padding: 8px;">' +
        empresa +
        '</td></tr>' +
        '<tr><td style="padding: 8px; font-weight: bold; background: #f8fafc;">E-mail do autor:</td><td style="padding: 8px; background: #f8fafc;">' +
        email +
        ' (não público)</td></tr>' +
        '<tr><td style="padding: 8px; font-weight: bold;">Status:</td><td style="padding: 8px; color: #b45309; font-weight: bold;">Pendente de Aprovação</td></tr>' +
        '</table>' +
        '<p style="font-size: 13px; color: #64748b; line-height: 1.5;">O depoimento <strong>não</strong> é publicado automaticamente. Acesse a Central Administrativa do Jetro ERP para visualizar o texto na íntegra, a autorização e aprovar ou reprovar.</p>' +
        '<div style="text-align: center; margin: 24px 0 10px;">' +
        '<a href="https://logistica-premium-es-2cc14.shrd03.internal.goskip.dev/admin/site-depoimentos" style="background: #005B2E; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Analisar Depoimento no ERP</a>' +
        '</div>' +
        '</div>' +
        '</div>'

      var adminDest = 'administracao@jetro.com.br'
      var msg = new MailerMessage({
        from: {
          address: 'sistema@jetro.com.br',
          name: 'Jetro ERP - Notificações',
        },
        to: [{ address: adminDest }],
        subject: subject,
        html: html,
      })
      mailClient.send(msg)
    } catch (mailErr) {
      $app
        .logger()
        .warn('Notificacao por e-mail de novo depoimento falhou', 'error', String(mailErr))
    }
  } catch (outerErr) {
    $app.logger().error('Erro geral no hook de depoimento', 'error', String(outerErr))
  }
  return e.next()
}, 'site_testimonials')
