// Migração 0316 — Correção de UF da Gran Romano (ES - Código 32) e regeneração do XML da NF 1546
migrate(
  (app) => {
    // 1. Atualizar a empresa Gran Romano com state = 'ES' e city = 'Serra'
    var gran = null
    try {
      var found = app.findRecordsByFilter(
        'empresas',
        'cnpj ~ "23890124000145" || cnpj ~ "23.890.124/0001-45" || code = "GRAN-ROMANO"',
        '',
        1,
        0,
      )
      if (found && found.length > 0) gran = found[0]
    } catch (_) {}

    if (gran) {
      gran.set('state', 'ES')
      if (!gran.getString('city')) gran.set('city', 'Serra')
      if (!gran.getString('cep')) gran.set('cep', '29160-000')
      if (!gran.getString('address')) gran.set('address', 'Distrito Industrial')
      app.saveNoValidate(gran)
    }

    // 2. Corrigir o artefato e o registro da NF 1546 se estiver com cUF 35 (SP) em vez de 32 (ES)
    try {
      var art = app.findFirstRecordByFilter(
        'fiscal_document_artifacts',
        'document_number = "1546" || chave_acesso ~ "1546"',
      )
      if (art) {
        var oldChave = art.getString('chave_acesso')
        // Se a chave antiga começa com 35 (SP), recalcula para 32 (ES)
        if (oldChave && oldChave.startsWith('35')) {
          var emitCnpj = '23890124000145'
          var aamm = oldChave.substring(2, 6) || '2611'
          var mod = '55'
          var serie = ('000' + (art.getString('serie') || '2')).slice(-3)
          var nNf = ('000000000' + (art.getString('document_number') || '1546')).slice(-9)
          var tpEmis = '1'
          var cNF = oldChave.substring(35, 43) || '17401464'
          var chave43 = '32' + aamm + emitCnpj + mod + serie + nNf + tpEmis + cNF

          // Dígito verificador mod 11
          var pesos = [2, 3, 4, 5, 6, 7, 8, 9]
          var soma = 0
          var pesoIdx = 0
          for (var i = chave43.length - 1; i >= 0; i--) {
            soma += parseInt(chave43.charAt(i), 10) * pesos[pesoIdx]
            pesoIdx = (pesoIdx + 1) % pesos.length
          }
          var resto = soma % 11
          var cDV = resto === 0 || resto === 1 ? 0 : 11 - resto
          var newChave = chave43 + String(cDV)

          var oldXml = art.getString('xml_conteudo') || ''
          var newXml = oldXml
            .replace(new RegExp(oldChave, 'g'), newChave)
            .replace('<cUF>35</cUF>', '<cUF>32</cUF>')
            .replace('<cMunFG>3550308</cMunFG>', '<cMunFG>3205002</cMunFG>')
            .replace('<cMun>3550308</cMun>', '<cMun>3205002</cMun>')
            .replace('<xMun>SAO PAULO</xMun>', '<xMun>SERRA</xMun>')
            .replace('<UF>SP</UF>', '<UF>ES</UF>')
            .replace('<cDV>' + oldChave.charAt(43) + '</cDV>', '<cDV>' + cDV + '</cDV>')

          art.set('chave_acesso', newChave)
          art.set('xml_conteudo', newXml)
          art.set('external_idempotency_key', newChave + '_' + art.getString('ambiente'))
          app.saveNoValidate(art)

          // Atualizar nfe_records correspondente
          try {
            var nfe = app.findFirstRecordByFilter(
              'nfe_records',
              'nfe_number = "1546" || chave_acesso = "' + oldChave + '"',
            )
            if (nfe) {
              nfe.set('chave_acesso', newChave)
              nfe.set('xml_conteudo', newXml)
              nfe.set('status', 'Gerada (Pronta para Transmissão)')
              app.saveNoValidate(nfe)
            }
          } catch (_) {}

          // Atualizar sales_orders se vinculado
          try {
            var order = app.findFirstRecordByFilter(
              'sales_orders',
              'nfe_numero = "1546" || nfe_chave_acesso = "' + oldChave + '"',
            )
            if (order) {
              order.set('nfe_chave_acesso', newChave)
              app.saveNoValidate(order)
            }
          } catch (_) {}
        }
      }
    } catch (artErr) {
      console.log('Migration 0316 error updating NF 1546:', artErr)
    }
  },
  (app) => {
    // Reversão no-op
  },
)
