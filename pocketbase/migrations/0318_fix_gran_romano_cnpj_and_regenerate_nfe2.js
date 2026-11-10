// Migração 0318 — Correção do CNPJ da Gran Romano (33.516.806/0001-96) e regeneração do XML da NF 2 (Série 2, Produção)
migrate(
  (app) => {
    var oldCnpjClean = '23890124000145'
    var oldCnpjFmt = '23.890.124/0001-45'
    var newCnpjClean = '33516806000196'
    var newCnpjFmt = '33.516.806/0001-96'

    // =========================================================================
    // 1. Atualizar registro da empresa Gran Romano em "empresas"
    // =========================================================================
    var gran = null
    try {
      var found = app.findRecordsByFilter(
        'empresas',
        'code = "GRAN-ROMANO" || cnpj ~ "' + oldCnpjClean + '" || cnpj ~ "' + newCnpjClean + '"',
        '',
        1,
        0,
      )
      if (found && found.length > 0) gran = found[0]
    } catch (_) {}

    if (gran) {
      gran.set('cnpj', newCnpjFmt)
      app.saveNoValidate(gran)
    }

    var granId = gran ? gran.id : 't4wx2m5n5jucy9z'

    // =========================================================================
    // 2. Atualizar fiscal_focus_nfe_config (cnpj_emitente)
    // =========================================================================
    try {
      var cfg = app.findFirstRecordByFilter(
        'fiscal_focus_nfe_config',
        'empresa_id = "' + granId + '"',
      )
      if (cfg) {
        cfg.set('cnpj_emitente', newCnpjClean)
        app.saveNoValidate(cfg)
      }
    } catch (_) {}

    // =========================================================================
    // 3. Regenerar XML e Chave de Acesso da NF 2 (Série 2, Produção)
    //    IMPORTANTE: Não alterar a NF 1546 nem tocar em outras notas.
    // =========================================================================
    try {
      var art2 = app.findFirstRecordByFilter(
        'fiscal_document_artifacts',
        '(document_number = "2" || document_number = 2) && serie = "2" && ambiente = "producao"',
      )

      if (art2) {
        var oldChave = art2.getString('chave_acesso') || ''
        var oldXml = art2.getString('xml_conteudo') || ''

        // Se a chave antiga continha o CNPJ antigo ou precisa de recálculo:
        // Layout Chave: cUF(2) + AAMM(4) + CNPJ(14) + mod(2, "55") + serie(3) + nNF(9) + tpEmis(1, "1") + cNF(8) + cDV(1)
        var cUf = oldChave.substring(0, 2) || '32'
        var aamm = oldChave.substring(2, 6) || '2611'
        var emitCnpj = newCnpjClean // 33516806000196
        var mod = '55'
        var serie = ('000' + (art2.getString('serie') || '2')).slice(-3)
        var nNf = ('000000000' + (art2.getString('document_number') || '2')).slice(-9)
        var tpEmis = '1'
        // Preservar exatamente o mesmo cNF gerado originalmente
        var cNF = oldChave.length === 44 ? oldChave.substring(35, 43) : '47610575'

        var chave43 = cUf + aamm + emitCnpj + mod + serie + nNf + tpEmis + cNF

        // Cálculo do dígito verificador módulo 11
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

        // Atualizar XML substituindo CNPJ antigo pelo novo, chave antiga pela nova e cDV
        var newXml = oldXml
        if (oldChave && oldChave !== newChave) {
          newXml = newXml.replace(new RegExp(oldChave, 'g'), newChave)
        }
        newXml = newXml.replace(
          new RegExp('<CNPJ>' + oldCnpjClean + '</CNPJ>', 'g'),
          '<CNPJ>' + newCnpjClean + '</CNPJ>',
        )
        if (oldChave.length === 44) {
          newXml = newXml.replace(
            '<cDV>' + oldChave.charAt(43) + '</cDV>',
            '<cDV>' + cDV + '</cDV>',
          )
        }

        art2.set('chave_acesso', newChave)
        art2.set('xml_conteudo', newXml)
        art2.set('external_idempotency_key', newChave + '_' + art2.getString('ambiente'))
        app.saveNoValidate(art2)

        // Atualizar nfe_records correspondente (NF 2, série 2, produção)
        try {
          var nfe2 = app.findFirstRecordByFilter(
            'nfe_records',
            '(nfe_number = "2" || nfe_number = 2) && serie = "2"',
          )
          if (nfe2) {
            nfe2.set('chave_acesso', newChave)
            nfe2.set('xml_conteudo', newXml)
            nfe2.set('status', 'Gerada (Pronta para Transmissão)')
            app.saveNoValidate(nfe2)
          }
        } catch (_) {}

        // Atualizar sales_orders vinculado se existir (PV-000005)
        try {
          var order5 = app.findFirstRecordByFilter('sales_orders', 'order_number = "PV-000005"')
          if (order5) {
            order5.set('nfe_chave_acesso', newChave)
            app.saveNoValidate(order5)
          }
        } catch (_) {}
      }
    } catch (errArt) {
      console.log('Migration 0318 error updating NF 2:', errArt)
    }
  },
  (app) => {
    // Reversão no-op
  },
)
