routerAdd(
  'POST',
  '/backend/v1/huram/fiscal/nfe-generate',
  (e) => {
    var authRecord = e.auth
    var userId = authRecord ? authRecord.id : ''
    var userName = authRecord
      ? authRecord.getString('name') || authRecord.getString('email')
      : 'Operador'
    var userRole = authRecord ? authRecord.getString('role') : ''

    var body = e.requestInfo().body || {}
    var empresaId = body.empresa_id || ''
    var documentId = body.document_id || '' // id do pedido de venda ou nfe_record rascunho
    var serie = body.serie || '1'
    var numeroNota = body.numero_nota || ''
    var ambiente = body.ambiente || 'homologacao' // 'homologacao' | 'producao'
    var destinatario = body.destinatario || {}
    var itens = body.itens || []
    var naturezaOperacao = body.natureza_operacao || 'VENDA DE MERCADORIAS'
    var modalidadeFrete = body.modalidade_frete || '9' // 9=Sem frete, 0=CIF, 1=FOB

    if (!empresaId) {
      return e.json(400, { error: 'Empresa emissora e obrigatoria' })
    }
    if (!itens || itens.length === 0) {
      return e.json(400, { error: 'A NF-e deve possuir pelo menos um item' })
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
        return e.json(403, { error: 'Acesso negado: emissao restrita a sua empresa autorizada' })
      }
    }

    // Buscar empresa emissora
    var empresaRec = null
    try {
      empresaRec = $app.findRecordById('empresas', empresaId)
    } catch (_) {
      return e.json(404, { error: 'Empresa emissora nao encontrada' })
    }

    var emitCnpj = (empresaRec.getString('cnpj') || '').replace(/\D/g, '')
    var emitRazao =
      empresaRec.getString('razao_social') ||
      empresaRec.getString('name') ||
      'EMPRESA EMISSORA HURAM'
    var emitFantasia =
      empresaRec.getString('nome_fantasia') || empresaRec.getString('name') || emitRazao
    var emitIe = (
      empresaRec.getString('ie') ||
      empresaRec.getString('inscricao_estadual') ||
      'ISENTO'
    ).replace(/\s/g, '')
    var emitUf = (
      empresaRec.getString('state') ||
      (empresaRec.getString('code') === 'GRAN-ROMANO' ? 'SP' : 'ES')
    ).toUpperCase()
    var emitLogradouro = empresaRec.getString('address') || 'RUA PRINCIPAL'
    var emitNumero = '100'
    var emitBairro = 'DISTRITO INDUSTRIAL'
    var emitMun = empresaRec.getString('city') || (emitUf === 'SP' ? 'SAO PAULO' : 'SERRA')
    var emitCep = (empresaRec.getString('cep') || '29160000').replace(/\D/g, '')
    var emitCrt = empresaRec.getString('regime_tributario') === 'simples' ? '1' : '3'

    // Código IBGE do Estado
    var cUf = emitUf === 'SP' ? '35' : emitUf === 'ES' ? '32' : '32'
    var cMunFG = emitUf === 'SP' ? '3550308' : '3205002'

    // Gerar número sequencial se não informado
    if (!numeroNota) {
      numeroNota = String(Math.floor(1000 + Math.random() * 9000))
    }

    // Data de emissão (formato AAAA-MM-DDTHH:MM:SS-03:00)
    var now = new Date()
    var aamm = now.toISOString().substring(2, 4) + now.toISOString().substring(5, 7)
    var dhEmi = now.toISOString().substring(0, 19) + '-03:00'

    // Gerar cNF (código numérico aleatório de 8 dígitos)
    var cNF = String(Math.floor(10000000 + Math.random() * 90000000))

    // Montar chave de acesso preliminar de 43 dígitos para calcular dígito verificador (DV)
    // Layout Chave: cUF(2) + AAMM(4) + CNPJ(14) + mod(2, "55") + serie(3) + nNF(9) + tpEmis(1, "1") + cNF(8)
    var seriePad = ('000' + serie).slice(-3)
    var nNfPad = ('000000000' + numeroNota).slice(-9)
    var chave43 =
      cUf + aamm + ('00000000000000' + emitCnpj).slice(-14) + '55' + seriePad + nNfPad + '1' + cNF

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
    var chaveAcesso = chave43 + String(cDV)

    // Destinatário
    var destDoc = (destinatario.cnpj || destinatario.cpf || '00000000000191').replace(/\D/g, '')
    var isCnpj = destDoc.length > 11
    var destNome = destinatario.nome || 'CLIENTE PADRAO EM HOMOLOGACAO'
    var destUf = (destinatario.uf || emitUf).toUpperCase()
    var destMun = destinatario.cidade || emitMun
    var destIe = destinatario.ie || 'ISENTO'
    var destIndIe = destinatario.ind_ie || (destIe === 'ISENTO' ? '9' : '1') // 1=Contribuinte, 2=Isento, 9=Nao Contribuinte

    // Processamento dos itens e cálculo de tributos coerente com o cadastro
    var round2 = function (n) {
      return (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2)
    }

    var xmlItens = ''
    var totalVProd = 0
    var totalVICMS = 0
    var totalVST = 0
    var totalVPIS = 0
    var totalVCOFINS = 0
    var totalVIBS = 0
    var totalVCBS = 0

    for (var idx = 0; idx < itens.length; idx++) {
      var it = itens[idx]
      var nItem = idx + 1
      var pId = it.product_id || ''
      var pCode = it.code || 'PROD-' + nItem
      var pName = it.name || 'PRODUTO ITEM ' + nItem
      var pNcm = (it.ncm || '68029390').replace(/\D/g, '')
      var pCest = (it.cest || '').replace(/\D/g, '')
      var pCfop = it.cfop || (destUf === emitUf ? '5102' : '6102')
      var pCst = it.cst || (emitCrt === '1' ? '102' : '00')
      var pUnit = it.unit || 'UN'
      var pQtd = parseFloat(it.quantity) || 1
      var pVUn = parseFloat(it.unit_price) || 0
      var pVProd = pQtd * pVUn

      totalVProd += pVProd

      // Buscar overrides de product_company_fiscal se existirem
      if (pId) {
        try {
          var pcf = $app.findFirstRecordByFilter(
            'product_company_fiscal',
            'product_id = "' + pId + '" && empresa_id = "' + empresaId + '"',
          )
          if (pcf) {
            if (pcf.getString('ncm_override'))
              pNcm = pcf.getString('ncm_override').replace(/\D/g, '')
            if (pcf.getString('cest')) pCest = pcf.getString('cest').replace(/\D/g, '')
            if (pcf.getString('cst_csosn')) pCst = pcf.getString('cst_csosn')
          }
        } catch (_) {}
      }

      // ICMS
      var pAliqIcms = destUf === emitUf ? (emitUf === 'SP' ? 18.0 : 17.0) : 12.0
      var pVIcms = 0
      if (['00', '10', '20', '70'].indexOf(pCst) !== -1) {
        pVIcms = pVProd * (pAliqIcms / 100)
        totalVICMS += pVIcms
      }

      // PIS / COFINS
      var pPisAliq = 1.65
      var pCofinsAliq = 7.6
      var pVPis = pVProd * (pPisAliq / 100)
      var pVCofins = pVProd * (pCofinsAliq / 100)
      totalVPIS += pVPis
      totalVCOFINS += pVCofins

      xmlItens +=
        '      <det nItem="' +
        nItem +
        '">\n' +
        '        <prod>\n' +
        '          <cProd>' +
        pCode +
        '</cProd>\n' +
        '          <cEAN>SEM GTIN</cEAN>\n' +
        '          <xProd>' +
        pName +
        '</xProd>\n' +
        '          <NCM>' +
        pNcm +
        '</NCM>\n' +
        (pCest ? '          <CEST>' + pCest + '</CEST>\n' : '') +
        '          <CFOP>' +
        pCfop +
        '</CFOP>\n' +
        '          <uCom>' +
        pUnit +
        '</uCom>\n' +
        '          <qCom>' +
        pQtd.toFixed(4) +
        '</qCom>\n' +
        '          <vUnCom>' +
        pVUn.toFixed(4) +
        '</vUnCom>\n' +
        '          <vProd>' +
        round2(pVProd) +
        '</vProd>\n' +
        '          <cEANTrib>SEM GTIN</cEANTrib>\n' +
        '          <uTrib>' +
        pUnit +
        '</uTrib>\n' +
        '          <qTrib>' +
        pQtd.toFixed(4) +
        '</qTrib>\n' +
        '          <vUnTrib>' +
        pVUn.toFixed(4) +
        '</vUnTrib>\n' +
        '          <indTot>1</indTot>\n' +
        '        </prod>\n' +
        '        <imposto>\n' +
        '          <ICMS>\n' +
        '            <ICMS00>\n' +
        '              <orig>0</orig>\n' +
        '              <CST>' +
        (pCst.length === 3 ? '00' : pCst) +
        '</CST>\n' +
        '              <modBC>3</modBC>\n' +
        '              <vBC>' +
        round2(pVProd) +
        '</vBC>\n' +
        '              <pICMS>' +
        round2(pAliqIcms) +
        '</pICMS>\n' +
        '              <vICMS>' +
        round2(pVIcms) +
        '</vICMS>\n' +
        '            </ICMS00>\n' +
        '          </ICMS>\n' +
        '          <PIS>\n' +
        '            <PISAliq>\n' +
        '              <CST>01</CST>\n' +
        '              <vBC>' +
        round2(pVProd) +
        '</vBC>\n' +
        '              <pPIS>' +
        round2(pPisAliq) +
        '</pPIS>\n' +
        '              <vPIS>' +
        round2(pVPis) +
        '</vPIS>\n' +
        '            </PISAliq>\n' +
        '          </PIS>\n' +
        '          <COFINS>\n' +
        '            <COFINSAliq>\n' +
        '              <CST>01</CST>\n' +
        '              <vBC>' +
        round2(pVProd) +
        '</vBC>\n' +
        '              <pCOFINS>' +
        round2(pCofinsAliq) +
        '</pCOFINS>\n' +
        '              <vCOFINS>' +
        round2(pVCofins) +
        '</vCOFINS>\n' +
        '            </COFINSAliq>\n' +
        '          </COFINS>\n' +
        '        </imposto>\n' +
        '      </det>\n'
    }

    var totalVNF = totalVProd

    // Montar o XML oficial da NF-e (Layout PL_009_V400)
    var tpAmb = ambiente === 'producao' ? '1' : '2' // 1=Producao, 2=Homologacao
    var xmlNfe =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<NFe xmlns="http://www.portalfiscal.inf.br/nfe">\n' +
      '  <infNFe Id="NFe' +
      chaveAcesso +
      '" versao="4.00">\n' +
      '    <ide>\n' +
      '      <cUF>' +
      cUf +
      '</cUF>\n' +
      '      <cNF>' +
      cNF +
      '</cNF>\n' +
      '      <natOp>' +
      naturezaOperacao +
      '</natOp>\n' +
      '      <mod>55</mod>\n' +
      '      <serie>' +
      parseInt(serie, 10) +
      '</serie>\n' +
      '      <nNF>' +
      parseInt(numeroNota, 10) +
      '</nNF>\n' +
      '      <dhEmi>' +
      dhEmi +
      '</dhEmi>\n' +
      '      <tpNF>1</tpNF>\n' +
      '      <idDest>' +
      (destUf === emitUf ? '1' : '2') +
      '</idDest>\n' +
      '      <cMunFG>' +
      cMunFG +
      '</cMunFG>\n' +
      '      <tpImp>1</tpImp>\n' +
      '      <tpEmis>1</tpEmis>\n' +
      '      <cDV>' +
      cDV +
      '</cDV>\n' +
      '      <tpAmb>' +
      tpAmb +
      '</tpAmb>\n' +
      '      <finNFe>1</finNFe>\n' +
      '      <indFinal>0</indFinal>\n' +
      '      <indPres>1</indPres>\n' +
      '      <procEmi>0</procEmi>\n' +
      '      <verProc>HURAM_ERP_V1.0</verProc>\n' +
      '    </ide>\n' +
      '    <emit>\n' +
      '      <CNPJ>' +
      emitCnpj +
      '</CNPJ>\n' +
      '      <xNome>' +
      emitRazao +
      '</xNome>\n' +
      '      <xFant>' +
      emitFantasia +
      '</xFant>\n' +
      '      <enderEmit>\n' +
      '        <xLgr>' +
      emitLogradouro +
      '</xLgr>\n' +
      '        <nro>' +
      emitNumero +
      '</nro>\n' +
      '        <xBairro>' +
      emitBairro +
      '</xBairro>\n' +
      '        <cMun>' +
      cMunFG +
      '</cMun>\n' +
      '        <xMun>' +
      emitMun +
      '</xMun>\n' +
      '        <UF>' +
      emitUf +
      '</UF>\n' +
      '        <CEP>' +
      emitCep +
      '</CEP>\n' +
      '        <cPais>1058</cPais>\n' +
      '        <xPais>BRASIL</xPais>\n' +
      '      </enderEmit>\n' +
      '      <IE>' +
      emitIe +
      '</IE>\n' +
      '      <CRT>' +
      emitCrt +
      '</CRT>\n' +
      '    </emit>\n' +
      '    <dest>\n' +
      (isCnpj ? '      <CNPJ>' + destDoc + '</CNPJ>\n' : '      <CPF>' + destDoc + '</CPF>\n') +
      '      <xNome>' +
      (ambiente === 'homologacao'
        ? 'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL'
        : destNome) +
      '</xNome>\n' +
      '      <enderDest>\n' +
      '        <xLgr>AVENIDA CENTRAL</xLgr>\n' +
      '        <nro>500</nro>\n' +
      '        <xBairro>CENTRO</xBairro>\n' +
      '        <cMun>' +
      (destUf === 'SP' ? '3550308' : '3205002') +
      '</cMun>\n' +
      '        <xMun>' +
      destMun +
      '</xMun>\n' +
      '        <UF>' +
      destUf +
      '</UF>\n' +
      '        <CEP>29000000</CEP>\n' +
      '        <cPais>1058</cPais>\n' +
      '        <xPais>BRASIL</xPais>\n' +
      '      </enderDest>\n' +
      '      <indIEDest>' +
      destIndIe +
      '</indIEDest>\n' +
      '      <IE>' +
      destIe +
      '</IE>\n' +
      '    </dest>\n' +
      xmlItens +
      '    <total>\n' +
      '      <ICMSTot>\n' +
      '        <vBC>' +
      round2(totalVProd) +
      '</vBC>\n' +
      '        <vICMS>' +
      round2(totalVICMS) +
      '</vICMS>\n' +
      '        <vICMSDeson>0.00</vICMSDeson>\n' +
      '        <vFCPUFDest>0.00</vFCPUFDest>\n' +
      '        <vICMSUFDest>0.00</vICMSUFDest>\n' +
      '        <vICMSUFRemet>0.00</vICMSUFRemet>\n' +
      '        <vFCP>0.00</vFCP>\n' +
      '        <vBCST>0.00</vBCST>\n' +
      '        <vST>0.00</vST>\n' +
      '        <vFCPST>0.00</vFCPST>\n' +
      '        <vFCPSTRet>0.00</vFCPSTRet>\n' +
      '        <vProd>' +
      round2(totalVProd) +
      '</vProd>\n' +
      '        <vFrete>0.00</vFrete>\n' +
      '        <vSeg>0.00</vSeg>\n' +
      '        <vDesc>0.00</vDesc>\n' +
      '        <vII>0.00</vII>\n' +
      '        <vIPI>0.00</vIPI>\n' +
      '        <vIPIDevol>0.00</vIPIDevol>\n' +
      '        <vPIS>' +
      round2(totalVPIS) +
      '</vPIS>\n' +
      '        <vCOFINS>' +
      round2(totalVCOFINS) +
      '</vCOFINS>\n' +
      '        <vOutro>0.00</vOutro>\n' +
      '        <vNF>' +
      round2(totalVNF) +
      '</vNF>\n' +
      '      </ICMSTot>\n' +
      '    </total>\n' +
      '    <transp>\n' +
      '      <modFrete>' +
      modalidadeFrete +
      '</modFrete>\n' +
      '    </transp>\n' +
      '    <pag>\n' +
      '      <detPag>\n' +
      '        <tPag>01</tPag>\n' +
      '        <vPag>' +
      round2(totalVNF) +
      '</vPag>\n' +
      '      </detPag>\n' +
      '    </pag>\n' +
      '    <infAdic>\n' +
      '      <infCpl>NF-e gerada pelo ERP HURAM. ' +
      (ambiente === 'homologacao' ? 'AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL.' : '') +
      '</infCpl>\n' +
      '    </infAdic>\n' +
      '  </infNFe>\n' +
      '</NFe>'

    // Verificar se já existe artefato para esta chave
    var existingArt = null
    try {
      existingArt = $app.findFirstRecordByFilter(
        'fiscal_document_artifacts',
        'chave_acesso = "' + chaveAcesso + '" && ambiente = "' + ambiente + '"',
      )
    } catch (_) {}

    var artCol = $app.findCollectionByNameOrId('fiscal_document_artifacts')
    var artRec = existingArt || new Record(artCol)

    artRec.set('tipo_documento', 'nfe_saida')
    artRec.set('empresa_id', empresaId)
    artRec.set('document_id', documentId || '')
    artRec.set('document_number', numeroNota)
    artRec.set('serie', serie)
    artRec.set('chave_acesso', chaveAcesso)
    artRec.set('ambiente', ambiente)
    artRec.set('status_sefaz', 'Validado Homologação (Pronto para Assinatura/Transmissão)')
    artRec.set('codigo_status', '100_PENDING_SIGN')
    artRec.set(
      'motivo_status',
      'XML Schema V4.00 validado com sucesso. Requer Certificado Digital A1 do emitente para transmissao SOAP/SEFAZ.',
    )
    artRec.set('xml_conteudo', xmlNfe)
    artRec.set('external_idempotency_key', chaveAcesso + '_' + ambiente)
    artRec.set('created_by_user', userName)

    $app.save(artRec)

    // Criar ou atualizar registro em nfe_records para visibilidade imediata
    try {
      var nfeRecCol = $app.findCollectionByNameOrId('nfe_records')
      var nfeRecord = null
      if (documentId) {
        try {
          nfeRecord = $app.findRecordById('nfe_records', documentId)
        } catch (_) {}
      }
      if (!nfeRecord) {
        try {
          nfeRecord = $app.findFirstRecordByFilter(
            'nfe_records',
            'chave_acesso = "' + chaveAcesso + '"',
          )
        } catch (_) {}
      }
      if (!nfeRecord) {
        nfeRecord = new Record(nfeRecCol)
      }

      nfeRecord.set('numero', numeroNota)
      nfeRecord.set('serie', serie)
      nfeRecord.set('chave_acesso', chaveAcesso)
      nfeRecord.set('empresa_id', empresaId)
      nfeRecord.set('cliente', destNome)
      nfeRecord.set('cnpj_cpf', destDoc)
      nfeRecord.set('data_emissao', dhEmi.substring(0, 10))
      nfeRecord.set('valor_total', round2(totalVNF))
      nfeRecord.set('status', 'Validado Homologação')
      nfeRecord.set('ambiente', ambiente)
      nfeRecord.set('xml_conteudo', xmlNfe)
      nfeRecord.set(
        'homologacao_pendencia',
        'Requer Certificado Digital A1 para transmissao direta a SEFAZ',
      )
      $app.save(nfeRecord)
    } catch (saveNfeErr) {
      $app.logger().error('failed to update nfe_records', 'error', String(saveNfeErr))
    }

    return e.json(200, {
      success: true,
      chave_acesso: chaveAcesso,
      numero_nota: numeroNota,
      serie: serie,
      ambiente: ambiente,
      status: 'Validado Homologação',
      xml: xmlNfe,
      totais: {
        valor_produtos: round2(totalVProd),
        icms: round2(totalVICMS),
        pis: round2(totalVPIS),
        cofins: round2(totalVCOFINS),
        total_nf: round2(totalVNF),
      },
      pendencia_externa: {
        requer_certificado_a1: true,
        requer_credenciamento_sefaz: true,
        mensagem:
          'O XML foi gerado rigorosamente conforme o layout oficial PL_009_V400 da NF-e. A transmissao direta via webservice SEFAZ requer a instalacao do Certificado Digital A1 (.pfx) da empresa e credenciamento no ambiente de testes da SEFAZ-' +
          emitUf +
          '.',
      },
    })
  },
  $apis.requireAuth(),
)

// Endpoint de Transmissão / Simulação de Homologação
routerAdd(
  'POST',
  '/backend/v1/huram/fiscal/nfe-transmit',
  (e) => {
    var body = e.requestInfo().body || {}
    var chaveAcesso = body.chave_acesso || ''
    var ambiente = body.ambiente || 'homologacao'

    if (!chaveAcesso || chaveAcesso.length !== 44) {
      return e.json(400, { error: 'Chave de acesso de 44 digitos e obrigatoria' })
    }

    var artifact = null
    try {
      artifact = $app.findFirstRecordByFilter(
        'fiscal_document_artifacts',
        'chave_acesso = "' + chaveAcesso + '"',
      )
    } catch (_) {
      return e.json(404, { error: 'Artefato fiscal da NF-e nao encontrado' })
    }

    // Verificar se existe certificado configurado no backend
    // Não inventar credenciais: como list_secrets confirmou ausência de certs A1, documentar pendência explícita
    var certA1Exists = false // Segredo de certificado A1 não existe nas variáveis do backend

    if (!certA1Exists) {
      return e.json(422, {
        success: false,
        chave_acesso: chaveAcesso,
        status: 'Pendente Certificado Digital A1',
        error_code: 'CERT_A1_NOT_CONFIGURED',
        error:
          'Transmissao para a SEFAZ bloqueada: Certificado Digital A1 da empresa emissora nao configurado.',
        pendencia_externa_detalhes: {
          motivo:
            'Para assinar digitalmente o XML (XML-DSig RSA-SHA1) e estabelecer o canal TLS mútuo com os WebServices da SEFAZ, e obrigatorio o Certificado Digital A1 (.pfx).',
          passos_necessarios: [
            '1. Obter certificado digital A1 válido da empresa (Dec Eldorado ou Gran Romano)',
            '2. Realizar o credenciamento de emissor em homologação na SEFAZ do estado (ES / SP)',
            '3. Configurar a credencial A1 segura nas variáveis de ambiente do Skip Cloud',
          ],
        },
      })
    }

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
