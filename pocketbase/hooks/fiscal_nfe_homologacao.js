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
      (empresaRec.getString('code') === 'GRAN-ROMANO' ? 'ES' : 'ES')
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

    // Destinatário
    var destDoc = (destinatario.cnpj || destinatario.cpf || '00000000000191').replace(/\D/g, '')
    var isCnpj = destDoc.length > 11
    var destNome = destinatario.nome || 'CLIENTE PADRAO EM HOMOLOGACAO'
    var destUf = (destinatario.uf || emitUf).toUpperCase()
    var destMun = destinatario.cidade || emitMun
    var destIe = destinatario.ie || 'ISENTO'
    var destIndIe = destinatario.ind_ie || (destIe === 'ISENTO' ? '9' : '1') // 1=Contribuinte, 2=Isento, 9=Nao Contribuinte

    // Buscar configuração Focus NFe da empresa para resolver série/ambiente
    try {
      var focusCfg = $app.findFirstRecordByFilter(
        'fiscal_focus_nfe_config',
        'empresa_id = "' + empresaId + '"',
      )
      if (focusCfg) {
        if (!body.serie && focusCfg.getString('serie')) {
          serie = focusCfg.getString('serie')
        }
        if (!body.ambiente && focusCfg.getString('ambiente')) {
          ambiente = focusCfg.getString('ambiente')
        }
      }
    } catch (_) {}

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

      nfeRecord.set('nfe_number', numeroNota)
      nfeRecord.set('serie', serie)
      nfeRecord.set('chave_acesso', chaveAcesso)
      nfeRecord.set('empresa_id', empresaId)
      nfeRecord.set('company', empresaId)
      nfeRecord.set('client_name', destNome)
      nfeRecord.set('total_value', round2(totalVNF))
      nfeRecord.set('tax_value', round2(totalVICMS + totalVPIS + totalVCOFINS))
      nfeRecord.set('nature_of_operation', naturezaOperacao)
      var statusGerada =
        ambiente === 'producao' ? 'Gerada (Pronta para Transmissão)' : 'Validado Homologação'
      nfeRecord.set('status', statusGerada)
      nfeRecord.set('ambiente', ambiente)
      nfeRecord.set('xml_conteudo', xmlNfe)
      if (documentId) {
        nfeRecord.set('sales_order_id', documentId)
        nfeRecord.set('order_id', documentId)
      }
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

// Endpoint de Transmissão — delega ao cliente Focus NFe (focus_nfe_api.js).
// O XML já foi gerado e validado em nfe-generate; aqui a NF-e é enviada de
// verdade à SEFAZ via Focus NFe (token apenas no backend). Mantemos o contrato
// de resposta (success / status / error / chave_acesso) que o frontend já
// consome, gravando status/protocolo/motivo no artefato fiscal.
routerAdd(
  'POST',
  '/backend/v1/huram/fiscal/nfe-transmit',
  function (e) {
    var body = e.requestInfo().body || {}
    var chaveAcesso = body.chave_acesso || ''
    var ambienteSolicitado = body.ambiente || 'homologacao'

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

    // Ambiente NUNCA cruza: usa o configurado para a empresa (tpAmb do XML),
    // ignorando o que vier do cliente quando houver configuração persistida.
    var cfg = null
    try {
      cfg = $app.findFirstRecordByFilter(
        'fiscal_focus_nfe_config',
        'empresa_id = "' + artifact.getString('empresa_id') + '"',
      )
    } catch (_) {}
    var ambiente = cfg ? cfg.getString('ambiente') || ambienteSolicitado : ambienteSolicitado

    var focusBase = {
      homologacao: 'https://homologacao.focusnfe.com.br',
      producao: 'https://api.focusnfe.com.br',
    }

    function b64encode(str) {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      var out = ''
      var i
      for (i = 0; i < str.length; i += 3) {
        var b1 = str.charCodeAt(i) & 0xff
        var b2 = i + 1 < str.length ? str.charCodeAt(i + 1) & 0xff : NaN
        var b3 = i + 2 < str.length ? str.charCodeAt(i + 2) & 0xff : NaN
        var e1 = b1 >> 2
        var e2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4)
        var e3 = isNaN(b2) ? 61 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6)
        var e4 = isNaN(b3) ? 61 : b3 & 63
        out += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4)
      }
      return out
    }

    function focusToken(amb) {
      var prod = ''
      var hom = ''
      try {
        prod = $os.getenv('FOCUS_NFE_TOKEN') || ''
      } catch (_) {}
      try {
        hom = $os.getenv('FOCUS_NFE_TOKEN_HOMOLOG') || ''
      } catch (_) {}
      if (amb === 'producao') return prod || hom
      return hom || prod
    }

    function focusAuthHeader(tokenVal, mode) {
      if (mode === 'raw') return 'Basic ' + tokenVal
      if (tokenVal.indexOf(':') !== -1) return 'Basic ' + b64encode(tokenVal)
      return 'Basic ' + b64encode(tokenVal + ':')
    }

    function focusRequest(amb, method, path, reqBody, mode, timeoutSec) {
      var t = focusToken(amb)
      if (!t) return { sem_credencial: true }
      try {
        var resp = $http.send({
          url: focusBase[amb] + path,
          method: method,
          headers: {
            Authorization: focusAuthHeader(t, mode),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: reqBody ? JSON.stringify(reqBody) : '',
          timeout: timeoutSec || 45,
        })
        return { statusCode: resp.statusCode, json: resp.json || null, body: resp.body || '' }
      } catch (err) {
        return { statusCode: 0, json: null, body: '', transport_error: String(err) }
      }
    }

    function focusProbe(amb) {
      var modes = ['b64', 'raw']
      var last = null
      for (var i = 0; i < modes.length; i++) {
        var r = focusRequest(amb, 'GET', '/v2/nfe/__probe_huram__', null, modes[i], 20)
        if (r.sem_credencial) return { sem_credencial: true }
        if (r.statusCode === 404) return { ok: true, mode: modes[i], statusCode: r.statusCode }
        if (r.statusCode && r.statusCode !== 401 && r.statusCode !== 403)
          return { ok: true, mode: modes[i], statusCode: r.statusCode }
        last = r
      }
      return { ok: false, statusCode: last ? last.statusCode : 0, body: last ? last.body : '' }
    }

    function focusCredMensagem(amb) {
      return (
        'Credencial não configurada. Defina a variável ' +
        (amb === 'producao' ? 'FOCUS_NFE_TOKEN' : 'FOCUS_NFE_TOKEN_HOMOLOG') +
        ' nas variáveis de ambiente do backend (Skip Cloud).'
      )
    }

    function normalizeStatus(rawStatus, codigoStatus) {
      var s = (rawStatus || '').toLowerCase()
      var c = String(codigoStatus || '')
      if (s.indexOf('autorizado') !== -1 || c === '100' || c === '150') return 'autorizado'
      if (s.indexOf('denegado') !== -1 || c === '110' || c === '205' || c === '206')
        return 'denegado'
      if (s.indexOf('cancelado') !== -1 || c === '101' || c === '151' || c === '135' || c === '155')
        return 'cancelado'
      if (s.indexOf('erro') !== -1 || (c && c.charAt(0) === '2' && c !== '204')) return 'rejeitado'
      return 'processando'
    }

    function mapFocusResult(json) {
      json = json || {}
      var codigo = json.codigo_status || json.cStatus || json.codigo_status_sefaz || ''
      var out = {
        status_raw: json.status || json.status_nfe || '',
        codigo_status: String(codigo),
        motivo: json.motivo_status || json.motivo || json.xMotivo || json.mensagem_sefaz || '',
        protocolo: json.numero_protocolo || json.protocolo || json.nProt || '',
        data_hora: json.data_autorizacao || json.data_protocolo || json.dhRecbto || '',
        url_pdf: json.url_pdf || json.url_danfe || '',
        erro: json.erro || json.error || json.error_description || '',
      }
      out.status = normalizeStatus(out.status_raw, out.codigo_status)
      return out
    }

    function saveStatusOnArtifact(art, mappedData) {
      art.set('focus_nfe_status_sefaz', mappedData.status)
      art.set('focus_nfe_codigo_status', mappedData.codigo_status)
      art.set('focus_nfe_motivo', mappedData.motivo || mappedData.erro || '')
      art.set('focus_nfe_protocolo', mappedData.protocolo)
      art.set('focus_nfe_data_hora', mappedData.data_hora)
      $app.saveNoValidate(art)

      // Sincroniza em nfe_records para visibilidade imediata no ERP/Faturamento
      try {
        var chv = art.getString('chave_acesso')
        var docId = art.getString('document_id')
        var nfeRec = null
        if (chv) {
          try {
            nfeRec = $app.findFirstRecordByFilter('nfe_records', 'chave_acesso = "' + chv + '"')
          } catch (_) {}
        }
        if (!nfeRec && docId) {
          try {
            nfeRec = $app.findRecordById('nfe_records', docId)
          } catch (_) {}
          if (!nfeRec) {
            try {
              nfeRec = $app.findFirstRecordByFilter(
                'nfe_records',
                'sales_order_id = "' + docId + '" || order_id = "' + docId + '"',
              )
            } catch (_) {}
          }
        }
        if (nfeRec) {
          nfeRec.set('focus_nfe_status_sefaz', mappedData.status)
          nfeRec.set('focus_nfe_codigo_status', mappedData.codigo_status)
          nfeRec.set('focus_nfe_motivo', mappedData.motivo || mappedData.erro || '')
          nfeRec.set('focus_nfe_protocolo', mappedData.protocolo)
          nfeRec.set('focus_nfe_data_hora', mappedData.data_hora)
          if (art.getString('focus_nfe_ref')) {
            nfeRec.set('focus_nfe_ref', art.getString('focus_nfe_ref'))
          }
          if (art.getString('focus_nfe_ambiente')) {
            nfeRec.set('focus_nfe_ambiente', art.getString('focus_nfe_ambiente'))
            nfeRec.set('ambiente', art.getString('focus_nfe_ambiente'))
          }
          if (mappedData.protocolo) {
            nfeRec.set('authorization_protocol', mappedData.protocolo)
            nfeRec.set('protocolo', mappedData.protocolo)
          }
          if (mappedData.motivo || mappedData.erro) {
            nfeRec.set('motivo', mappedData.motivo || mappedData.erro)
            if (mappedData.status === 'rejeitado' || mappedData.status === 'denegado') {
              nfeRec.set('rejection_reason', mappedData.motivo || mappedData.erro)
            }
          }
          if (mappedData.url_pdf) {
            nfeRec.set('danfe_url', mappedData.url_pdf)
          }
          if (mappedData.status === 'autorizado') {
            nfeRec.set('status', 'Autorizada')
          } else if (mappedData.status === 'rejeitado') {
            nfeRec.set('status', 'Rejeitada')
          } else if (mappedData.status === 'denegado') {
            nfeRec.set('status', 'Denegada')
          } else if (mappedData.status === 'cancelado') {
            nfeRec.set('status', 'Cancelada')
          } else if (mappedData.status === 'processando') {
            nfeRec.set('status', 'Processando SEFAZ')
          }
          $app.saveNoValidate(nfeRec)
        }
      } catch (errSync) {
        $app.logger().error('failed to sync status to nfe_records', 'error', String(errSync))
      }
    }

    function writeAudit(authRecord, action, targetId, summary, newValue) {
      try {
        var col = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(col)
        log.set('user_id', authRecord ? authRecord.id : '')
        log.set(
          'user_name',
          authRecord ? authRecord.getString('name') || authRecord.getString('email') || '' : '',
        )
        log.set('user_role', authRecord ? authRecord.getString('role') : '')
        log.set('action', action)
        log.set('module', 'fiscal')
        log.set('target_collection', 'fiscal_document_artifacts')
        log.set('target_id', targetId || '')
        log.set('target_summary', summary || '')
        log.set('previous_value', null)
        log.set('new_value', newValue || {})
        $app.saveNoValidate(log)
      } catch (err) {
        $app.logger().error('fiscal_nfe audit log failed', 'error', String(err))
      }
    }

    var token = focusToken(ambiente)
    if (!token) {
      return e.json(422, {
        success: false,
        chave_acesso: chaveAcesso,
        status: 'Credencial não configurada',
        error_code: 'FOCUS_NFE_TOKEN_MISSING',
        error: focusCredMensagem(ambiente),
        xml_disponivel_download: true,
      })
    }

    var probe = focusProbe(ambiente)
    if (!probe.ok) {
      return e.json(502, {
        success: false,
        chave_acesso: chaveAcesso,
        error_code: 'FOCUS_NFE_CREDENCIAL_RECUSADA',
        error:
          'Credencial Focus NFe recusada no ambiente de ' +
          ambiente +
          ' (HTTP ' +
          probe.statusCode +
          '). Verifique o token configurado.',
      })
    }

    // Idempotência: NF-e já autorizada nunca é retransmitida
    if (artifact.getString('focus_nfe_status_sefaz') === 'autorizado') {
      return e.json(200, {
        success: true,
        already_authorized: true,
        chave_acesso: chaveAcesso,
        status: 'autorizado',
        protocolo: artifact.getString('focus_nfe_protocolo'),
        message: 'NF-e já autorizada pela SEFAZ. Não é necessário retransmitir.',
      })
    }

    var xml = artifact.getString('xml_conteudo') || ''
    if (!xml) {
      return e.json(422, { error: 'XML da NF-e não encontrado no artefato fiscal' })
    }

    var ref = chaveAcesso
    var payload = { xml: xml, xml_assinado: xml }
    if (cfg && cfg.getString('emitente_ref')) payload.ref = cfg.getString('emitente_ref')

    var res = focusRequest(
      ambiente,
      'POST',
      '/v2/nfe?ref=' + encodeURIComponent(ref),
      payload,
      probe.mode,
      60,
    )
    if (res.sem_credencial) {
      return e.json(422, {
        success: false,
        error_code: 'FOCUS_NFE_TOKEN_MISSING',
        error: focusCredMensagem(ambiente),
      })
    }
    if (res.statusCode >= 400) {
      // ref já existente no Focus NFe: recuperar o estado real do documento
      var raw = JSON.stringify(res.json || {})
      var dup = res.statusCode === 422 && raw.indexOf('ref') !== -1 && raw.indexOf('xisting') !== -1
      if (dup) {
        var rec = focusRequest(
          ambiente,
          'GET',
          '/v2/nfe/' + encodeURIComponent(ref),
          null,
          probe.mode,
          30,
        )
        if (rec.statusCode === 200 && rec.json) {
          var mr = mapFocusResult(rec.json)
          artifact.set('focus_nfe_ref', ref)
          artifact.set('focus_nfe_ambiente', ambiente)
          saveStatusOnArtifact(artifact, mr)
          writeAudit(e.auth, 'nfe_consulta', artifact.id, 'NF-e ' + chaveAcesso, mr)
          return e.json(200, {
            success: true,
            recovered: true,
            chave_acesso: chaveAcesso,
            status: mr.status,
            protocolo: mr.protocolo,
            motivo: mr.motivo,
            message: 'NF-e já registrada no Focus NFe — estado recuperado da SEFAZ.',
          })
        }
      }
      var msg = 'Falha na transmissão via Focus NFe (HTTP ' + res.statusCode + ').'
      if (res.json && res.json.erro) msg = String(res.json.erro)
      else if (res.json && res.json.error_description) msg = String(res.json.error_description)
      return e.json(502, { success: false, chave_acesso: chaveAcesso, error: msg })
    }

    var mapped = mapFocusResult(res.json || {})
    artifact.set('focus_nfe_ref', ref)
    artifact.set('focus_nfe_ambiente', ambiente)
    saveStatusOnArtifact(artifact, mapped)
    writeAudit(
      e.auth,
      'nfe_transmit',
      artifact.id,
      'NF-e ' + chaveAcesso + ' → ' + ambiente,
      mapped,
    )

    return e.json(200, {
      success: true,
      chave_acesso: chaveAcesso,
      status: mapped.status,
      status_raw: mapped.status_raw,
      codigo_status: mapped.codigo_status,
      motivo: mapped.motivo,
      protocolo: mapped.protocolo,
      message:
        mapped.status === 'autorizado'
          ? 'NF-e autorizada pela SEFAZ.'
          : 'NF-e enviada ao Focus NFe. Use "Consultar recibo" para acompanhar o processamento.',
      registro: mapped,
      ambiente: ambiente,
    })
  },
  $apis.requireAuth(),
)
