routerAdd(
  'POST',
  '/backend/v1/huram/fiscal/xml-entry',
  (e) => {
    var authRecord = e.auth
    var userId = authRecord ? authRecord.id : ''
    var userName = authRecord
      ? authRecord.getString('name') || authRecord.getString('email')
      : 'Operador'
    var userRole = authRecord ? authRecord.getString('role') : ''

    var body = e.requestInfo().body || {}
    var xmlContent = (body.xml_content || '').trim()
    var empresaId = body.empresa_id || ''
    var dryRun = !!body.dry_run // se true, apenas analisa sem salvar

    if (!xmlContent) {
      return e.json(400, { error: 'Conteudo XML nao informado' })
    }
    if (!empresaId) {
      return e.json(400, { error: 'Empresa destinataria e obrigatoria' })
    }

    // Multitenancy guard
    if (userRole !== 'SUP') {
      var userEmpresa = authRecord ? authRecord.getString('empresa_id') : ''
      var userEmpresasIds = authRecord ? authRecord.get('empresas_ids') : []
      var hasAccess = false
      if (userEmpresa === empresaId) hasAccess = true
      if (Array.isArray(userEmpresasIds) && userEmpresasIds.indexOf(empresaId) !== -1)
        hasAccess = true
      if (!hasAccess && userEmpresa) {
        return e.json(403, { error: 'Acesso negado: importacao restrita a sua empresa autorizada' })
      }
    }

    // Buscar empresa
    var empresaRec = null
    try {
      empresaRec = $app.findRecordById('empresas', empresaId)
    } catch (_) {
      return e.json(404, { error: 'Empresa destinataria nao encontrada' })
    }
    var empresaNome = empresaRec.getString('nome_fantasia') || empresaRec.getString('name') || ''
    var empresaCnpj = (empresaRec.getString('cnpj') || '').replace(/\D/g, '')

    // Funções auxiliares para extração de tags XML simples
    var extractTag = function (xml, tag) {
      var m = xml.match(
        new RegExp(
          '<(?:[a-zA-Z0-9_]+:)?' + tag + '[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_]+:)?' + tag + '>',
          'i',
        ),
      )
      return m ? m[1].trim() : ''
    }

    var extractAttr = function (xml, tag, attr) {
      var m = xml.match(
        new RegExp('<(?:[a-zA-Z0-9_]+:)?' + tag + '[^>]*\\b' + attr + '=["\']([^"\']+)["\']', 'i'),
      )
      return m ? m[1].trim() : ''
    }

    // 1. Extração da Chave de Acesso (Idempotência Estrita)
    var chNFe = extractTag(xmlContent, 'chNFe')
    if (!chNFe) {
      var infNFeId = extractAttr(xmlContent, 'infNFe', 'Id') || ''
      chNFe = infNFeId.replace(/\D/g, '')
    }
    if (!chNFe || chNFe.length !== 44) {
      return e.json(400, {
        error: 'XML invalido ou sem chave de acesso NF-e de 44 digitos (chNFe / infNFe Id)',
      })
    }

    // Checagem de Idempotência: verificar se este XML já foi importado no sistema
    var existingArtifact = null
    try {
      existingArtifact = $app.findFirstRecordByFilter(
        'fiscal_document_artifacts',
        'chave_acesso = "' + chNFe + '"',
      )
    } catch (_) {}

    var existingInvoice = null
    try {
      existingInvoice = $app.findFirstRecordByFilter(
        'purchase_invoices',
        'chave_acesso = "' + chNFe + '" || invoice_doc_number = "' + chNFe + '"',
      )
    } catch (_) {}

    if (existingArtifact || existingInvoice) {
      return e.json(200, {
        success: true,
        is_duplicate: true,
        message: 'Nota Fiscal ja importada anteriormente no sistema (Idempotencia garantida)',
        chave_acesso: chNFe,
        existing_document_id: existingInvoice
          ? existingInvoice.id
          : existingArtifact
            ? existingArtifact.getString('document_id')
            : '',
        existing_invoice_number: existingInvoice ? existingInvoice.getString('invoice_number') : '',
        data_importacao: existingArtifact
          ? existingArtifact.getString('created')
          : existingInvoice
            ? existingInvoice.getString('created')
            : '',
      })
    }

    // 2. Extração dos Dados do Cabeçalho da NF-e
    var nNF = extractTag(xmlContent, 'nNF') || ''
    var serie = extractTag(xmlContent, 'serie') || '1'
    var dhEmi = extractTag(xmlContent, 'dhEmi') || extractTag(xmlContent, 'dEmi') || ''
    var dataEmissao = dhEmi ? dhEmi.substring(0, 10) : new Date().toISOString().substring(0, 10)

    // Emitente (Fornecedor)
    var emitMatch = xmlContent.match(/<emit[\s\S]*?<\/emit>/i)
    var emitXml = emitMatch ? emitMatch[0] : ''
    var emitCnpj = (extractTag(emitXml, 'CNPJ') || extractTag(emitXml, 'CPF')).replace(/\D/g, '')
    var emitNome = extractTag(emitXml, 'xNome') || 'Fornecedor XML'
    var emitFantasia = extractTag(emitXml, 'xFant') || emitNome
    var emitUf = extractTag(emitXml, 'UF') || ''
    var emitIe = extractTag(emitXml, 'IE') || ''

    // Destinatário
    var destMatch = xmlContent.match(/<dest[\s\S]*?<\/dest>/i)
    var destXml = destMatch ? destMatch[0] : ''
    var destCnpj = (extractTag(destXml, 'CNPJ') || extractTag(destXml, 'CPF')).replace(/\D/g, '')

    var warnings = []
    if (empresaCnpj && destCnpj && empresaCnpj !== destCnpj) {
      warnings.push(
        'Aviso: O CNPJ destinatario da NF-e (' +
          destCnpj +
          ') diverge do CNPJ da empresa selecionada (' +
          empresaCnpj +
          ')',
      )
    }

    // Totais do XML
    var totalMatch = xmlContent.match(/<ICMSTot[\s\S]*?<\/ICMSTot>/i)
    var totalXml = totalMatch ? totalMatch[0] : ''
    var vProd = extractTag(totalXml, 'vProd') || '0.00'
    var vNF = extractTag(totalXml, 'vNF') || '0.00'
    var vFrete = extractTag(totalXml, 'vFrete') || '0.00'
    var vSeg = extractTag(totalXml, 'vSeg') || '0.00'
    var vDesc = extractTag(totalXml, 'vDesc') || '0.00'
    var vOutro = extractTag(totalXml, 'vOutro') || '0.00'
    var vICMS = extractTag(totalXml, 'vICMS') || '0.00'
    var vST = extractTag(totalXml, 'vST') || '0.00'
    var vIPI = extractTag(totalXml, 'vIPI') || '0.00'
    var vPIS = extractTag(totalXml, 'vPIS') || '0.00'
    var vCOFINS = extractTag(totalXml, 'vCOFINS') || '0.00'

    // 3. Extração e Matching de Itens (<det>)
    var detRegex = /<det\b[\s\S]*?<\/det>/gi
    var detMatches = xmlContent.match(detRegex) || []

    var parsedItems = []
    var pendingRefs = []
    var hasPendingMatching = false

    for (var i = 0; i < detMatches.length; i++) {
      var detXml = detMatches[i]
      var nItem = extractAttr(detXml, 'det', 'nItem') || String(i + 1)
      var prodMatch = detXml.match(/<prod[\s\S]*?<\/prod>/i)
      var pXml = prodMatch ? prodMatch[0] : ''

      var cProd = extractTag(pXml, 'cProd') || ''
      var cEAN = extractTag(pXml, 'cEAN') || ''
      var xProd = extractTag(pXml, 'xProd') || ''
      var ncm = extractTag(pXml, 'NCM') || ''
      var cest = extractTag(pXml, 'CEST') || ''
      var cfop = extractTag(pXml, 'CFOP') || ''
      var uCom = extractTag(pXml, 'uCom') || 'UN'
      var qComStr = extractTag(pXml, 'qCom') || '1'
      var vUnComStr = extractTag(pXml, 'vUnCom') || '0'
      var vProdStr = extractTag(pXml, 'vProd') || '0'

      // Matching com supplier_product_refs
      // Critério: supplier_cnpj = emitCnpj && supplier_product_code = cProd
      var matchedProduct = null
      var conversionFactor = 1.0
      var targetUnit = uCom

      try {
        if (emitCnpj && cProd) {
          var refRec = $app.findFirstRecordByFilter(
            'supplier_product_refs',
            'supplier_cnpj = "' + emitCnpj + '" && supplier_product_code = "' + cProd + '"',
          )
          if (refRec) {
            var pId = refRec.getString('product_id')
            matchedProduct = $app.findRecordById('products', pId)
            var cf = refRec.getFloat('conversion_factor')
            if (cf > 0) conversionFactor = cf
            var tu = refRec.getString('target_unit')
            if (tu) targetUnit = tu
          }
        }
      } catch (_) {}

      // Fallback matching por código GTIN / EAN se não encontrou pela ref
      if (!matchedProduct && cEAN && cEAN !== 'SEM GTIN') {
        try {
          matchedProduct = $app.findFirstRecordByFilter(
            'products',
            'barcode = "' + cEAN + '" || gtin = "' + cEAN + '"',
          )
        } catch (_) {}
      }

      // Fallback matching por código interno idêntico
      if (!matchedProduct && cProd) {
        try {
          matchedProduct = $app.findFirstRecordByFilter('products', 'code = "' + cProd + '"')
        } catch (_) {}
      }

      var qCom = parseFloat(qComStr) || 1
      var internalQty = qCom * conversionFactor

      var itemData = {
        item_index: parseInt(nItem, 10),
        supplier_code: cProd,
        supplier_barcode: cEAN,
        description: xProd,
        ncm: ncm,
        cest: cest,
        cfop: cfop,
        unit: uCom,
        quantity: qCom,
        unit_price: vUnComStr,
        total_price: vProdStr,
        matched: !!matchedProduct,
        matched_product_id: matchedProduct ? matchedProduct.id : '',
        matched_product_name: matchedProduct ? matchedProduct.getString('name') : '',
        matched_product_code: matchedProduct ? matchedProduct.getString('code') : '',
        conversion_factor: conversionFactor,
        internal_quantity: internalQty,
        internal_unit: targetUnit,
      }

      parsedItems.push(itemData)

      if (!matchedProduct) {
        hasPendingMatching = true
        pendingRefs.push({
          supplier_cnpj: emitCnpj,
          supplier_name: emitNome,
          supplier_product_code: cProd,
          supplier_product_desc: xProd,
          supplier_unit: uCom,
          supplier_barcode: cEAN,
          ncm: ncm,
          item_index: nItem,
        })
      }
    }

    if (dryRun) {
      return e.json(200, {
        success: true,
        dry_run: true,
        chave_acesso: chNFe,
        numero_nota: nNF,
        serie: serie,
        data_emissao: dataEmissao,
        fornecedor: {
          cnpj: emitCnpj,
          nome: emitNome,
          uf: emitUf,
          ie: emitIe,
        },
        totais: {
          valor_produtos: vProd,
          valor_total: vNF,
          frete: vFrete,
          seguro: vSeg,
          desconto: vDesc,
          icms: vICMS,
          icms_st: vST,
          ipi: vIPI,
          pis: vPIS,
          cofins: vCOFINS,
        },
        items: parsedItems,
        pending_items_count: pendingRefs.length,
        warnings: warnings,
      })
    }

    // 4. Salvar Lançamento em purchase_invoices (com campos fiscais e itens)
    var invoiceCol = $app.findCollectionByNameOrId('purchase_invoices')
    var invRec = new Record(invoiceCol)

    invRec.set('invoice_number', nNF ? 'NF-' + nNF : 'XML-' + chNFe.substring(25, 34))
    invRec.set('invoice_doc_number', chNFe)
    invRec.set('supplier_name', emitNome)
    invRec.set('supplier_cnpj', emitCnpj)
    invRec.set('issue_date', dataEmissao)
    invRec.set('due_date', dataEmissao)
    invRec.set('total_amount', parseFloat(vNF) || 0)
    invRec.set('total_value', vNF)
    invRec.set('status', hasPendingMatching ? 'Pendente De-Para' : 'Recebida')
    invRec.set('empresa_id', empresaId)
    invRec.set('company', empresaNome)
    invRec.set('branch', 'Matriz')
    invRec.set('chave_acesso', chNFe)
    invRec.set('data_emissao', dataEmissao)
    invRec.set('valor_produtos', vProd)
    invRec.set('valor_frete', vFrete)
    invRec.set('valor_seguro', vSeg)
    invRec.set('valor_desconto', vDesc)
    invRec.set('valor_outras_despesas', vOutro)
    invRec.set('valor_icms', vICMS)
    invRec.set('valor_icms_st', vST)
    invRec.set('valor_ipi', vIPI)
    invRec.set('valor_pis', vPIS)
    invRec.set('valor_cofins', vCOFINS)
    invRec.set('import_source', 'xml_nfe_upload')
    invRec.set('import_pending_refs', pendingRefs)

    // Formatar itens para a estrutura padrão do purchase_invoices
    var formattedItems = parsedItems.map(function (it) {
      return {
        product: it.matched ? it.matched_product_name : it.description,
        code: it.matched ? it.matched_product_code : it.supplier_code,
        quantity: it.quantity,
        unit: it.unit,
        unit_price: it.unit_price,
        total: it.total_price,
        cfop: it.cfop,
        ncm: it.ncm,
        matched: it.matched,
        matched_product_id: it.matched_product_id,
        internal_quantity: it.internal_quantity,
        internal_unit: it.internal_unit,
      }
    })
    invRec.set('items', formattedItems)

    $app.save(invRec)
    var invoiceId = invRec.id

    // 5. Salvar Artefato Fiscal Completo (fiscal_document_artifacts) para Auditoria e Idempotência
    try {
      var artCol = $app.findCollectionByNameOrId('fiscal_document_artifacts')
      var artRec = new Record(artCol)
      artRec.set('tipo_documento', 'nfe_entrada')
      artRec.set('empresa_id', empresaId)
      artRec.set('document_id', invoiceId)
      artRec.set('document_number', nNF)
      artRec.set('serie', serie)
      artRec.set('chave_acesso', chNFe)
      artRec.set('ambiente', 'producao')
      artRec.set('status_sefaz', '100 - Importado com Sucesso')
      artRec.set('codigo_status', '100')
      artRec.set('motivo_status', 'XML de Entrada importado com sucesso')
      artRec.set('xml_conteudo', xmlContent)
      artRec.set('external_idempotency_key', chNFe)
      artRec.set('pendencias_de_para', pendingRefs)
      artRec.set('divergencias_importacao', warnings)
      artRec.set('created_by_user', userName)
      $app.save(artRec)
    } catch (saveArtErr) {
      $app
        .logger()
        .error('failed to save fiscal artifact for xml entry', 'error', String(saveArtErr))
    }

    return e.json(200, {
      success: true,
      is_duplicate: false,
      message: hasPendingMatching
        ? 'Nota importada com pendencias de De-Para de produtos'
        : 'Nota Fiscal de Entrada importada e estoque integrado com sucesso',
      invoice_id: invoiceId,
      invoice_number: nNF,
      chave_acesso: chNFe,
      has_pending_matching: hasPendingMatching,
      pending_items_count: pendingRefs.length,
      items: parsedItems,
      warnings: warnings,
    })
  },
  $apis.requireAuth(),
)
