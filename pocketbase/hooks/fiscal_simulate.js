routerAdd(
  'POST',
  '/backend/v1/huram/fiscal/simulate',
  (e) => {
    var authRecord = e.auth
    var userId = authRecord ? authRecord.id : ''
    var userName = authRecord
      ? authRecord.getString('name') || authRecord.getString('email')
      : 'Operador'
    var userRole = authRecord ? authRecord.getString('role') : ''

    var body = e.requestInfo().body || {}
    var empresaId = body.empresa_id || ''
    var productId = body.product_id || ''
    var operacao = body.operacao || 'venda_interna' // 'venda_interna', 'venda_interestadual', 'entrada_compra', 'devolucao'
    var quantidadeStr = String(body.quantidade || '1')
    var valorUnitarioStr = String(body.valor_unitario || '0')
    var descontoStr = String(body.desconto || '0')
    var freteDespesasStr = String(body.despesas_frete || '0')
    var ufOrigem = (body.uf_origem || 'ES').toUpperCase().trim()
    var ufDestino = (body.uf_destino || (operacao === 'venda_interna' ? ufOrigem : 'SP'))
      .toUpperCase()
      .trim()
    var consumidorFinal = !!body.consumidor_final
    var contribuinteIcms = body.contribuinte_icms !== false // default true

    if (!empresaId) {
      return e.json(400, { error: 'Empresa e obrigatoria para a simulacao fiscal' })
    }
    if (!productId) {
      return e.json(400, { error: 'Produto e obrigatorio para a simulacao fiscal' })
    }

    // Multitenancy guard: Usuários não SUP devem ter acesso à empresa informada
    if (userRole !== 'SUP') {
      var userEmpresa = authRecord ? authRecord.getString('empresa_id') : ''
      var userEmpresasIds = authRecord ? authRecord.get('empresas_ids') : []
      var hasAccess = false
      if (userEmpresa === empresaId) hasAccess = true
      if (Array.isArray(userEmpresasIds) && userEmpresasIds.indexOf(empresaId) !== -1)
        hasAccess = true
      if (!hasAccess && userEmpresa) {
        return e.json(403, { error: 'Acesso negado: simulacao restrita a sua empresa autorizada' })
      }
    }

    // Buscar empresa
    var empresaRec = null
    try {
      empresaRec = $app.findRecordById('empresas', empresaId)
    } catch (errEmp) {
      return e.json(404, { error: 'Empresa informada nao encontrada' })
    }
    var empresaNome =
      empresaRec.getString('nome_fantasia') || empresaRec.getString('name') || 'Empresa'
    var empresaCnpj = empresaRec.getString('cnpj') || ''
    var empresaUf = (
      empresaRec.getString('state') ||
      (empresaRec.getString('code') === 'GRAN-ROMANO' ? 'SP' : 'ES')
    ).toUpperCase()
    if (!body.uf_origem) {
      ufOrigem = empresaUf
      if (operacao === 'venda_interna') ufDestino = empresaUf
    }

    // Buscar produto
    var productRec = null
    try {
      productRec = $app.findRecordById('products', productId)
    } catch (errProd) {
      return e.json(404, { error: 'Produto informado nao encontrado' })
    }

    var productCode = productRec.getString('code') || ''
    var productName = productRec.getString('name') || ''
    var productUnit = body.unidade || productRec.getString('unit') || 'UN'
    var baseNcm = productRec.getString('ncm') || ''
    var baseOrigin = productRec.getString('origin') || '0'
    var tipoFinalidade = productRec.getString('tipo_finalidade') || 'revenda'

    // Buscar configuração fiscal específica daquela empresa (product_company_fiscal)
    var pcfRec = null
    try {
      pcfRec = $app.findFirstRecordByFilter(
        'product_company_fiscal',
        'product_id = "' + productId + '" && empresa_id = "' + empresaId + '"',
      )
    } catch (_) {}

    var rulesApplied = []
    var warnings = []
    var memory = []

    // 1. Definição de NCM, Origem e Finalidade
    var ncm =
      pcfRec && pcfRec.getString('ncm_override') ? pcfRec.getString('ncm_override') : baseNcm
    var origem =
      pcfRec && pcfRec.getString('origem_override')
        ? pcfRec.getString('origem_override')
        : baseOrigin
    var cest =
      pcfRec && pcfRec.getString('cest')
        ? pcfRec.getString('cest')
        : productRec.getString('cest') || ''
    var cClassTrib = pcfRec && pcfRec.getString('cClassTrib') ? pcfRec.getString('cClassTrib') : ''

    if (!ncm) {
      warnings.push('NCM nao configurado no produto nem no perfil da empresa')
    }

    // 2. CFOP Determination
    var isInterestadual = ufOrigem !== ufDestino || operacao === 'venda_interestadual'
    var cfop = ''
    var tipoOperacaoFiscal =
      pcfRec && pcfRec.getString('tipo_operacao_fiscal')
        ? pcfRec.getString('tipo_operacao_fiscal')
        : tipoFinalidade

    if (operacao === 'entrada_compra') {
      if (tipoOperacaoFiscal === 'industrializacao' || tipoFinalidade === 'materia_prima') {
        cfop = isInterestadual ? '2101' : '1101'
        rulesApplied.push(
          'CFOP ' +
            cfop +
            ': Compra para industrializacao (' +
            (isInterestadual ? 'Interestadual' : 'Interna') +
            ')',
        )
      } else {
        cfop = isInterestadual ? '2102' : '1102'
        rulesApplied.push(
          'CFOP ' +
            cfop +
            ': Compra para comercializacao (' +
            (isInterestadual ? 'Interestadual' : 'Interna') +
            ')',
        )
      }
    } else if (operacao === 'devolucao') {
      if (tipoOperacaoFiscal === 'fabricacao_propria') {
        cfop = isInterestadual ? '6201' : '5201'
      } else {
        cfop = isInterestadual ? '6202' : '5202'
      }
      rulesApplied.push('CFOP ' + cfop + ': Devolucao de mercadoria')
    } else if (operacao === 'bonificacao') {
      cfop = isInterestadual ? '6910' : '5910'
      rulesApplied.push('CFOP ' + cfop + ': Remessa em bonificacao/doacao')
    } else if (operacao === 'transferencia') {
      cfop = isInterestadual ? '6152' : '5152'
      rulesApplied.push('CFOP ' + cfop + ': Transferencia de mercadorias')
    } else {
      // Venda normal
      if (isInterestadual) {
        if (pcfRec && pcfRec.getString('cfop_padrao_interestadual')) {
          cfop = pcfRec.getString('cfop_padrao_interestadual')
          rulesApplied.push('CFOP ' + cfop + ' via configuracao interestadual da empresa')
        } else if (tipoOperacaoFiscal === 'fabricacao_propria') {
          cfop = '6101'
          rulesApplied.push('CFOP 6101: Venda de producao do estabelecimento (Interestadual)')
        } else {
          cfop = '6102'
          rulesApplied.push('CFOP 6102: Venda de mercadoria adquirida de terceiros (Interestadual)')
        }
      } else {
        if (pcfRec && pcfRec.getString('cfop_padrao_interno')) {
          cfop = pcfRec.getString('cfop_padrao_interno')
          rulesApplied.push('CFOP ' + cfop + ' via configuracao interna da empresa')
        } else if (tipoOperacaoFiscal === 'fabricacao_propria') {
          cfop = '5101'
          rulesApplied.push('CFOP 5101: Venda de producao do estabelecimento (Interna)')
        } else {
          cfop = '5102'
          rulesApplied.push('CFOP 5102: Venda de mercadoria adquirida de terceiros (Interna)')
        }
      }
    }

    // 3. CST / CSOSN
    var cstCsosn =
      pcfRec && pcfRec.getString('cst_csosn')
        ? pcfRec.getString('cst_csosn')
        : productRec.getString('cst_csosn') || '00'
    rulesApplied.push('CST/CSOSN aplicado: ' + cstCsosn)

    // 4. Cálculos Matemáticos com precisão decimal exata
    var parseDec = function (s) {
      if (!s) return 0
      var clean = String(s).replace(/\s/g, '').replace('R$', '').replace(',', '.')
      var num = parseFloat(clean)
      return isNaN(num) ? 0 : num
    }
    var round2 = function (n) {
      return (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2)
    }

    var qtd = parseDec(quantidadeStr)
    var vUnit = parseDec(valorUnitarioStr)
    var vDesc = parseDec(descontoStr)
    var vFrete = parseDec(freteDespesasStr)

    var vProd = qtd * vUnit
    var vTotal = vProd - vDesc + vFrete
    if (vTotal < 0) vTotal = 0

    memory.push('Valor dos Produtos = ' + qtd + ' x R$ ' + round2(vUnit) + ' = R$ ' + round2(vProd))
    if (vDesc > 0) memory.push('Desconto = - R$ ' + round2(vDesc))
    if (vFrete > 0) memory.push('Frete / Despesas Acessorias = + R$ ' + round2(vFrete))
    memory.push('Valor Base da Operacao = R$ ' + round2(vTotal))

    // 5. ICMS Próprio
    var icmsAliq = 0
    if (pcfRec && pcfRec.getString('icms_aliquota')) {
      icmsAliq = parseDec(pcfRec.getString('icms_aliquota'))
      rulesApplied.push('Aliquota ICMS ' + icmsAliq + '% configurada no perfil da empresa')
    } else if (isInterestadual) {
      // Regra padrão interestadual Brasil: 12% ou 7% (Sul/Sudeste para Norte/Nordeste/CO/ES) ou 4% importados (origem 1, 2, 3, 8)
      if (['1', '2', '3', '8'].indexOf(origem) !== -1) {
        icmsAliq = 4.0
        rulesApplied.push(
          'Aliquota ICMS 4.0% interestadual (Mercadoria com conteudo de importacao / Res. 13/2012)',
        )
      } else if (
        ['ES', 'MG', 'PR', 'RJ', 'RS', 'SC', 'SP'].indexOf(ufOrigem) !== -1 &&
        [
          'AC',
          'AL',
          'AP',
          'AM',
          'BA',
          'CE',
          'DF',
          'ES',
          'GO',
          'MA',
          'MT',
          'MS',
          'PA',
          'PB',
          'PE',
          'PI',
          'RN',
          'RO',
          'RR',
          'SE',
          'TO',
        ].indexOf(ufDestino) !== -1 &&
        ufOrigem !== 'ES'
      ) {
        icmsAliq = 7.0
        rulesApplied.push(
          'Aliquota ICMS 7.0% interestadual origem ' + ufOrigem + ' para destino ' + ufDestino,
        )
      } else {
        icmsAliq = 12.0
        rulesApplied.push('Aliquota ICMS 12.0% interestadual padrao')
      }
    } else {
      // Operação Interna: ES=17% (ou 12% cesta), SP=18%
      icmsAliq = ufOrigem === 'SP' ? 18.0 : 17.0
      rulesApplied.push('Aliquota ICMS ' + icmsAliq + '% interna estado de ' + ufOrigem)
    }

    var icmsBaseRed =
      pcfRec && pcfRec.getString('icms_base_reduzida')
        ? parseDec(pcfRec.getString('icms_base_reduzida'))
        : 0
    var baseIcms = vTotal
    if (icmsBaseRed > 0 && icmsBaseRed < 100) {
      baseIcms = vTotal * (1 - icmsBaseRed / 100)
      memory.push(
        'Reducao de base ICMS de ' + icmsBaseRed + '% aplicada -> Base: R$ ' + round2(baseIcms),
      )
    }

    var icmsValor = 0
    // Isento ou ST anterior não tributa ICMS integral
    if (['40', '41', '60', '102', '500'].indexOf(cstCsosn) !== -1) {
      baseIcms = 0
      icmsValor = 0
      memory.push('CST ' + cstCsosn + ' isenta ou dispensa destaque de ICMS proprio')
    } else {
      icmsValor = baseIcms * (icmsAliq / 100)
      memory.push(
        'ICMS Proprio = R$ ' + round2(baseIcms) + ' x ' + icmsAliq + '% = R$ ' + round2(icmsValor),
      )
    }

    // 6. ICMS-ST (Substituição Tributária)
    var mva =
      pcfRec && pcfRec.getString('icms_st_mva') ? parseDec(pcfRec.getString('icms_st_mva')) : 0
    var stAliq =
      pcfRec && pcfRec.getString('icms_st_aliquota')
        ? parseDec(pcfRec.getString('icms_st_aliquota'))
        : ufDestino === 'SP'
          ? 18
          : 17
    var baseSt = 0
    var icmsStValor = 0

    if (mva > 0 || cstCsosn === '10' || cstCsosn === '70' || cstCsosn === '201') {
      baseSt = vTotal * (1 + mva / 100)
      var icmsStBruto = baseSt * (stAliq / 100)
      icmsStValor = icmsStBruto - icmsValor
      if (icmsStValor < 0) icmsStValor = 0
      memory.push(
        'ICMS-ST MVA ' +
          mva +
          '%: Base ST = R$ ' +
          round2(baseSt) +
          ' -> ST Devido = R$ ' +
          round2(icmsStValor),
      )
      rulesApplied.push('Substituicao Tributaria calculada com MVA de ' + mva + '%')
    } else {
      memory.push('Operacao sem incidencia de ICMS-ST (MVA nao configurada ou CST sem ST)')
    }

    // 7. FCP (Fundo de Combate à Pobreza)
    var fcpAliq =
      pcfRec && pcfRec.getString('fcp_aliquota') ? parseDec(pcfRec.getString('fcp_aliquota')) : 0
    var fcpValor = 0
    if (fcpAliq > 0) {
      fcpValor = baseIcms * (fcpAliq / 100)
      memory.push('FCP ' + fcpAliq + '% = R$ ' + round2(fcpValor))
      rulesApplied.push('Fundo de Combate a Pobreza (FCP) de ' + fcpAliq + '%')
    }

    // 8. DIFAL (Diferencial de Alíquota Não Contribuinte / Consumidor Final Interestadual)
    var difalValor = 0
    if (isInterestadual && consumidorFinal && !contribuinteIcms) {
      var aliqInternaDestino = ufDestino === 'SP' ? 18.0 : 17.0
      var difalPercent = aliqInternaDestino - icmsAliq
      if (difalPercent > 0) {
        difalValor = vTotal * (difalPercent / 100)
        memory.push(
          'DIFAL Partilha (Emenda 87/15) Destinatario Consumidor Final: (' +
            aliqInternaDestino +
            '% - ' +
            icmsAliq +
            '%) = ' +
            difalPercent +
            '% -> R$ ' +
            round2(difalValor),
        )
        rulesApplied.push('DIFAL apurado para consumidor final nao contribuinte interestadual')
      }
    }

    // 9. PIS e COFINS
    var pisCst = pcfRec && pcfRec.getString('pis_cst') ? pcfRec.getString('pis_cst') : '01'
    var pisAliq =
      pcfRec && pcfRec.getString('pis_aliquota') ? parseDec(pcfRec.getString('pis_aliquota')) : 1.65
    var cofinsCst = pcfRec && pcfRec.getString('cofins_cst') ? pcfRec.getString('cofins_cst') : '01'
    var cofinsAliq =
      pcfRec && pcfRec.getString('cofins_aliquota')
        ? parseDec(pcfRec.getString('cofins_aliquota'))
        : 7.6

    var basePis = vTotal
    var baseCofins = vTotal
    var pisValor = 0
    var cofinsValor = 0

    if (['04', '06', '07', '08', '09'].indexOf(pisCst) !== -1) {
      basePis = 0
      pisValor = 0
      memory.push('PIS CST ' + pisCst + ' com aliquota zero / isento')
    } else {
      pisValor = basePis * (pisAliq / 100)
      memory.push('PIS (' + pisCst + ') ' + pisAliq + '% = R$ ' + round2(pisValor))
    }

    if (['04', '06', '07', '08', '09'].indexOf(cofinsCst) !== -1) {
      baseCofins = 0
      cofinsValor = 0
      memory.push('COFINS CST ' + cofinsCst + ' com aliquota zero / isento')
    } else {
      cofinsValor = baseCofins * (cofinsAliq / 100)
      memory.push('COFINS (' + cofinsCst + ') ' + cofinsAliq + '% = R$ ' + round2(cofinsValor))
    }

    // 10. Reforma Tributária (IBS e CBS)
    var ibsAliq =
      pcfRec && pcfRec.getString('ibs_aliquota') ? parseDec(pcfRec.getString('ibs_aliquota')) : 0.1
    var cbsAliq =
      pcfRec && pcfRec.getString('cbs_aliquota') ? parseDec(pcfRec.getString('cbs_aliquota')) : 0.9
    var ibsValor = vTotal * (ibsAliq / 100)
    var cbsValor = vTotal * (cbsAliq / 100)
    memory.push(
      'Reforma Tributaria: IBS ' +
        ibsAliq +
        '% = R$ ' +
        round2(ibsValor) +
        ' | CBS ' +
        cbsAliq +
        '% = R$ ' +
        round2(cbsValor) +
        (cClassTrib ? ' (cClassTrib: ' + cClassTrib + ')' : ''),
    )

    var totalTributos =
      icmsValor + icmsStValor + fcpValor + difalValor + pisValor + cofinsValor + ibsValor + cbsValor

    var resultPayload = {
      empresa_id: empresaId,
      empresa_nome: empresaNome,
      empresa_cnpj: empresaCnpj,
      product_id: productId,
      product_code: productCode,
      product_name: productName,
      operacao: operacao,
      uf_origem: ufOrigem,
      uf_destino: ufDestino,
      consumidor_final: consumidorFinal,
      contribuinte_icms: contribuinteIcms,
      quantidade: round2(qtd),
      unidade: productUnit,
      valor_unitario: round2(vUnit),
      valor_total: round2(vTotal),
      desconto: round2(vDesc),
      despesas_frete: round2(vFrete),
      cfop_resultado: cfop,
      cst_csosn_resultado: cstCsosn,
      ncm_resultado: ncm,
      cest_resultado: cest,
      origem_resultado: origem,
      cClassTrib_resultado: cClassTrib,
      icms_base: round2(baseIcms),
      icms_aliquota: String(icmsAliq),
      icms_valor: round2(icmsValor),
      icms_st_base: round2(baseSt),
      icms_st_mva: String(mva),
      icms_st_aliquota: String(stAliq),
      icms_st_valor: round2(icmsStValor),
      fcp_base: round2(baseIcms),
      fcp_aliquota: String(fcpAliq),
      fcp_valor: round2(fcpValor),
      difal_valor: round2(difalValor),
      pis_cst: pisCst,
      pis_base: round2(basePis),
      pis_aliquota: String(pisAliq),
      pis_valor: round2(pisValor),
      cofins_cst: cofinsCst,
      cofins_base: round2(baseCofins),
      cofins_aliquota: String(cofinsAliq),
      cofins_valor: round2(cofinsValor),
      ibs_base: round2(vTotal),
      ibs_aliquota: String(ibsAliq),
      ibs_valor: round2(ibsValor),
      cbs_base: round2(vTotal),
      cbs_aliquota: String(cbsAliq),
      cbs_valor: round2(cbsValor),
      total_tributos: round2(totalTributos),
      calculation_memory: memory,
      rules_applied: rulesApplied,
      warnings: warnings,
      user_id: userId,
      user_name: userName,
    }

    // REGISTRO AUDITÁVEL na coleção fiscal_simulations
    var simRecordId = ''
    try {
      var simCol = $app.findCollectionByNameOrId('fiscal_simulations')
      var simRec = new Record(simCol)
      for (var k in resultPayload) {
        if (Object.prototype.hasOwnProperty.call(resultPayload, k)) {
          simRec.set(k, resultPayload[k])
        }
      }
      $app.save(simRec)
      simRecordId = simRec.id
      resultPayload.simulation_id = simRecordId
    } catch (saveErr) {
      $app.logger().error('failed to save audit simulation', 'error', String(saveErr))
    }

    return e.json(200, {
      success: true,
      data: resultPayload,
    })
  },
  $apis.requireAuth(),
)
