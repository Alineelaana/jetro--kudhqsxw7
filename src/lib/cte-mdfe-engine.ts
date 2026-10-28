/**
 * Motor Fiscal de CT-e (Conhecimento de Transporte - Mod 57) e MDF-e (Manifesto Eletrônico - Mod 58)
 * ERP HURAM - Cálculos de ICMS de frete, geração de Chave de Acesso com Módulo 11 e estrutura de XML textual
 */

export interface CteComponentePrestacao {
  id?: string
  nome: string // Frete Peso, Frete Valor, Pedágio, GRIS, Outros, Taxa de Despacho
  valor: number
}

export interface CteDocumentoVinculado {
  id?: string
  tipo_documento: 'nfe' | 'outros'
  chave_acesso?: string
  numero: string
  serie?: string
  data_emissao?: string
  valor_carga: number
  peso_bruto_kg: number
}

export interface CteCalculoImpostoInput {
  valorPrestacao: number
  regimeTributario?: 'simples_nacional' | 'lucro_presumido' | 'lucro_real'
  cstCsosn: string
  aliquotaIcms?: number
  percentualReducaoBc?: number
  ufInicio: string
  ufFim: string
}

export interface CteCalculoImpostoOutput {
  baseCalculo: number
  aliquota: number
  valorIcms: number
  cstCsosn: string
  isIsentoOuNaoTributado: boolean
  detalhes: string
}

export interface MdfeCondutor {
  nome: string
  cpf: string
}

export interface MdfeReboque {
  placa: string
  uf?: string
  tipo_carroceria?: string
  capacidade_kg?: number
}

export interface MdfeValePedagio {
  empresa_fornecedora?: string
  cnpj_fornecedora?: string
  numero_comprovante?: string
  valor?: number
}

export interface MdfeCteVinculado {
  cte_id?: string
  chave_acesso: string
  numero: string
  uf_descarregamento: string
  municipio_descarregamento: string
  valor_carga: number
  peso_bruto_kg: number
}

/**
 * Mapeamento dos códigos de UF da Tabela do IBGE para montagem da chave de 44 dígitos
 */
export const UF_IBGE_CODES: Record<string, string> = {
  RO: '11',
  AC: '12',
  AM: '13',
  RR: '14',
  PA: '15',
  AP: '16',
  TO: '17',
  MA: '21',
  PI: '22',
  CE: '23',
  RN: '24',
  PB: '25',
  PE: '26',
  AL: '27',
  SE: '28',
  BA: '29',
  MG: '31',
  ES: '32',
  RJ: '33',
  SP: '35',
  PR: '41',
  SC: '42',
  RS: '43',
  MS: '50',
  MT: '51',
  GO: '52',
  DF: '53',
}

/**
 * Cálculo do Dígito Verificador Módulo 11 para Chave de Acesso Fiscal (43 dígitos base)
 * Pesos de 2 a 9 da direita para a esquerda. Resto: dv = 11 - (soma % 11). Se dv >= 10 => 0.
 */
export function calcularDvModulo11(chave43: string): number {
  if (!chave43 || chave43.length !== 43) return 0
  let peso = 2
  let soma = 0
  for (let i = chave43.length - 1; i >= 0; i--) {
    const n = parseInt(chave43.charAt(i), 10)
    if (isNaN(n)) return 0
    soma += n * peso
    peso++
    if (peso > 9) peso = 2
  }
  const resto = soma % 11
  const dv = 11 - resto
  return dv >= 10 ? 0 : dv
}

/**
 * Validação da Chave de Acesso de 44 dígitos
 */
export function validarChaveAcesso(chave: string): boolean {
  if (!chave) return false
  const limpa = chave.replace(/\D/g, '')
  if (limpa.length !== 44) return false
  const base43 = limpa.substring(0, 43)
  const dvEsperado = calcularDvModulo11(base43)
  const dvReal = parseInt(limpa.charAt(43), 10)
  return dvEsperado === dvReal
}

/**
 * Gera uma chave de acesso fiscal completa de 44 dígitos
 * modelo: 57 para CT-e, 58 para MDF-e, 55 para NF-e
 */
export function gerarChaveAcessoFiscal(params: {
  uf: string
  dataEmissao: Date | string
  cnpjEmitente: string
  modelo: '57' | '58' | '55'
  serie: string | number
  numero: string | number
  tipoEmissao?: '1' // 1-Normal
  codigoNumerico?: string
}): string {
  const ufCode = UF_IBGE_CODES[params.uf.toUpperCase()] || '35'
  const date =
    typeof params.dataEmissao === 'string' ? new Date(params.dataEmissao) : params.dataEmissao
  const ano = String(date.getFullYear()).slice(-2)
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const aamm = `${ano}${mes}`

  const cnpj = params.cnpjEmitente.replace(/\D/g, '').padStart(14, '0')
  const modelo = params.modelo
  const serie = String(params.serie).replace(/\D/g, '').padStart(3, '0')
  const numero = String(params.numero).replace(/\D/g, '').padStart(9, '0')
  const tpEmis = params.tipoEmissao || '1'

  // Código numérico aleatório de 8 dígitos se não informado
  let cNF = params.codigoNumerico ? params.codigoNumerico.replace(/\D/g, '').slice(0, 8) : ''
  if (!cNF || cNF.length < 8) {
    const seed = Math.floor(10000000 + Math.random() * 90000000)
    cNF = String(seed).padStart(8, '0')
  }

  const base43 = `${ufCode}${aamm}${cnpj}${modelo}${serie}${numero}${tpEmis}${cNF}`
  const dv = calcularDvModulo11(base43)
  return `${base43}${dv}`
}

/**
 * Cálculo dos impostos ICMS do transporte rodoviário de cargas
 */
export function calcularImpostoTransporte(input: CteCalculoImpostoInput): CteCalculoImpostoOutput {
  const {
    valorPrestacao,
    cstCsosn,
    aliquotaIcms = 0,
    percentualReducaoBc = 0,
    regimeTributario = 'lucro_presumido',
  } = input

  // Simples Nacional (CSOSN)
  if (
    regimeTributario === 'simples_nacional' ||
    cstCsosn.startsWith('1') ||
    cstCsosn.startsWith('9')
  ) {
    if (cstCsosn === '101' || cstCsosn === '102' || cstCsosn === '900') {
      return {
        baseCalculo: 0,
        aliquota: 0,
        valorIcms: 0,
        cstCsosn,
        isIsentoOuNaoTributado: true,
        detalhes: 'Simples Nacional: ICMS recolhido via DAS conforme Anexo III.',
      }
    }
  }

  // CST 00 - Tributação Integral
  if (cstCsosn === '00') {
    const aliq = aliquotaIcms > 0 ? aliquotaIcms : 12 // 12% padrão estadual/interestadual Sudeste-Sul
    const base = valorPrestacao
    const valor = Number(((base * aliq) / 100).toFixed(2))
    return {
      baseCalculo: base,
      aliquota: aliq,
      valorIcms: valor,
      cstCsosn: '00',
      isIsentoOuNaoTributado: false,
      detalhes: `ICMS tributado integralmente (${aliq}% sobre R$ ${base.toFixed(2)})`,
    }
  }

  // CST 20 - Tributação com Redução de Base de Cálculo
  if (cstCsosn === '20') {
    const aliq = aliquotaIcms > 0 ? aliquotaIcms : 12
    const reducao = percentualReducaoBc > 0 ? percentualReducaoBc : 20
    const fator = (100 - reducao) / 100
    const base = Number((valorPrestacao * fator).toFixed(2))
    const valor = Number(((base * aliq) / 100).toFixed(2))
    return {
      baseCalculo: base,
      aliquota: aliq,
      valorIcms: valor,
      cstCsosn: '20',
      isIsentoOuNaoTributado: false,
      detalhes: `ICMS com redução de BC de ${reducao}%: base reduzida de R$ ${base.toFixed(2)} (${aliq}%)`,
    }
  }

  // CST 40 / 41 - Isenta / Não tributada
  if (cstCsosn === '40' || cstCsosn === '41') {
    return {
      baseCalculo: 0,
      aliquota: 0,
      valorIcms: 0,
      cstCsosn,
      isIsentoOuNaoTributado: true,
      detalhes: 'Prestação de transporte com isenção ou não tributada pelo ICMS.',
    }
  }

  // CST 90 - Outras
  const aliq = aliquotaIcms > 0 ? aliquotaIcms : 0
  const base = aliq > 0 ? valorPrestacao : 0
  const valor = Number(((base * aliq) / 100).toFixed(2))
  return {
    baseCalculo: base,
    aliquota: aliq,
    valorIcms: valor,
    cstCsosn: '90',
    isIsentoOuNaoTributado: aliq === 0,
    detalhes:
      aliq > 0
        ? `CST 90 (Outras) com alíquota de ${aliq}%`
        : 'CST 90 (Outras) sem incidência direta.',
  }
}

/**
 * Determina sugestão de CFOP para transporte rodoviário de cargas
 * 5353 / 6353 - Prestação de serviço de transporte a estabelecimento comercial
 * 5352 / 6352 - Prestação de serviço de transporte a estabelecimento industrial
 * 5357 / 6357 - Prestação de serviço de transporte a não contribuinte
 */
export function sugerirCfopTransporte(
  ufInicio: string,
  ufFim: string,
  tipoTomador: string = 'empresa',
): string {
  const isInterestadual = ufInicio && ufFim && ufInicio.toUpperCase() !== ufFim.toUpperCase()
  if (isInterestadual) {
    return '6353' // Prestação de serviço de transporte a estabelecimento comercial interestadual
  }
  return '5353' // Prestação de serviço de transporte a estabelecimento comercial estadual
}

/**
 * Geração da representação textual do XML do CT-e (Modelo 57)
 * Permite exportação completa para transmissão em emissor externo ou validação contábil
 */
export function gerarXmlCteModelo57(dados: {
  chaveAcesso: string
  numero: string
  serie: string
  dataEmissao: string
  ambiente: 'homologacao' | 'producao'
  tipoCte: string
  cfop: string
  valorPrestacao: number
  valorReceber: number
  componentes: CteComponentePrestacao[]
  impostos: CteCalculoImpostoOutput
  ufInicio: string
  municipioInicio: string
  ufFim: string
  municipioFim: string
  emitente: {
    cnpj: string
    razaoSocial: string
    nomeFantasia?: string
    ie: string
    uf: string
    municipio: string
  }
  tomador: {
    tipo: string
    nome: string
    cnpjCpf: string
    ie?: string
    uf?: string
  }
  remetente: {
    nome: string
    cnpjCpf: string
    ie?: string
    uf?: string
    municipio?: string
  }
  destinatario: {
    nome: string
    cnpjCpf: string
    ie?: string
    uf?: string
    municipio?: string
  }
  documentosVinculados: CteDocumentoVinculado[]
  observacoes?: string
}): string {
  const tpAmb = dados.ambiente === 'producao' ? '1' : '2'
  const cCT = dados.chaveAcesso ? dados.chaveAcesso.substring(35, 43) : '12345678'
  const cDV = dados.chaveAcesso ? dados.chaveAcesso.charAt(43) : '0'

  const componentesXml = dados.componentes
    .map(
      (c) => `          <Comp>
            <xNome>${escapeXml(c.nome)}</xNome>
            <vComp>${c.valor.toFixed(2)}</vComp>
          </Comp>`,
    )
    .join('\n')

  const docsVinculadosXml = dados.documentosVinculados
    .map((d) => {
      if (d.chave_acesso && d.chave_acesso.length === 44) {
        return `          <infNFe>
            <chave>${d.chave_acesso}</chave>
          </infNFe>`
      }
      return `          <infOutros>
            <tpDoc>99</tpDoc>
            <descOutros>Documento de Carga</descOutros>
            <nDoc>${escapeXml(d.numero)}</nDoc>
            <vDocFisc>${(d.valor_carga || 0).toFixed(2)}</vDocFisc>
          </infOutros>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- HURAM ERP - CT-e Modelo 57 (Geração Estrutural Textual para Emissor Externo/Contador) -->
<CTe xmlns="http://www.portalfiscal.inf.br/cte">
  <infCte Id="CTe${dados.chaveAcesso}" versao="4.00">
    <ide>
      <cUF>${UF_IBGE_CODES[dados.emitente.uf] || '35'}</cUF>
      <cCT>${cCT}</cCT>
      <CFOP>${dados.cfop}</CFOP>
      <natOp>PRESTACAO DE SERVICO DE TRANSPORTE</natOp>
      <mod>57</mod>
      <serie>${dados.serie}</serie>
      <nCT>${dados.numero}</nCT>
      <dhEmi>${dados.dataEmissao || new Date().toISOString()}</dhEmi>
      <tpImp>1</tpImp>
      <tpEmis>1</tpEmis>
      <cDV>${cDV}</cDV>
      <tpAmb>${tpAmb}</tpAmb>
      <tpCTe>${dados.tipoCte === 'normal' ? '0' : '1'}</tpCTe>
      <procEmi>0</procEmi>
      <verProc>HURAM-ERP-4.00</verProc>
      <cMunIni>9999999</cMunIni>
      <xMunIni>${escapeXml(dados.municipioInicio)}</xMunIni>
      <UFIni>${dados.ufInicio}</UFIni>
      <cMunFim>9999999</cMunFim>
      <xMunFim>${escapeXml(dados.municipioFim)}</xMunFim>
      <UFFim>${dados.ufFim}</UFFim>
      <retira>1</retira>
      <indIEToma>1</indIEToma>
    </ide>
    <emit>
      <CNPJ>${dados.emitente.cnpj.replace(/\D/g, '')}</CNPJ>
      <IE>${dados.emitente.ie || 'ISENTO'}</IE>
      <xNome>${escapeXml(dados.emitente.razaoSocial)}</xNome>
      <xFant>${escapeXml(dados.emitente.nomeFantasia || dados.emitente.razaoSocial)}</xFant>
      <enderEmit>
        <xLgr>Endereco Emitente</xLgr>
        <nro>SN</nro>
        <xBairro>Centro</xBairro>
        <cMun>9999999</cMun>
        <xMun>${escapeXml(dados.emitente.municipio)}</xMun>
        <UF>${dados.emitente.uf}</UF>
      </enderEmit>
    </emit>
    <rem>
      <CNPJ>${dados.remetente.cnpjCpf.replace(/\D/g, '')}</CNPJ>
      <IE>${dados.remetente.ie || 'ISENTO'}</IE>
      <xNome>${escapeXml(dados.remetente.nome)}</xNome>
      <enderReme>
        <xMun>${escapeXml(dados.remetente.municipio || '')}</xMun>
        <UF>${dados.remetente.uf || ''}</UF>
      </enderReme>
    </rem>
    <dest>
      <CNPJ>${dados.destinatario.cnpjCpf.replace(/\D/g, '')}</CNPJ>
      <IE>${dados.destinatario.ie || 'ISENTO'}</IE>
      <xNome>${escapeXml(dados.destinatario.nome)}</xNome>
      <enderDest>
        <xMun>${escapeXml(dados.destinatario.municipio || '')}</xMun>
        <UF>${dados.destinatario.uf || ''}</UF>
      </enderDest>
    </dest>
    <vPrest>
      <vTPrest>${dados.valorPrestacao.toFixed(2)}</vTPrest>
      <vRec>${dados.valorReceber.toFixed(2)}</vRec>
${componentesXml}
    </vPrest>
    <imp>
      <ICMS>
        <ICMS00>
          <CST>${dados.impostos.cstCsosn}</CST>
          <vBC>${dados.impostos.baseCalculo.toFixed(2)}</vBC>
          <pICMS>${dados.impostos.aliquota.toFixed(2)}</pICMS>
          <vICMS>${dados.impostos.valorIcms.toFixed(2)}</vICMS>
        </ICMS00>
      </ICMS>
    </imp>
    <infCTeNorm>
      <infCarga>
        <vCarga>${dados.documentosVinculados.reduce((acc, d) => acc + (d.valor_carga || 0), 0).toFixed(2)}</vCarga>
        <proPred>CARGA GERAL</proPred>
      </infCarga>
      <infDoc>
${docsVinculadosXml}
      </infDoc>
      <infModal versaoModal="4.00">
        <rodo>
          <RNTRC>00000000</RNTRC>
        </rodo>
      </infModal>
    </infCTeNorm>
    <compl>
      <xObs>${escapeXml(dados.observacoes || 'CT-e gerado pelo sistema ERP HURAM')}</xObs>
    </compl>
  </infCte>
</CTe>`
}

/**
 * Geração da representação textual do XML do MDF-e (Modelo 58)
 */
export function gerarXmlMdfeModelo58(dados: {
  chaveAcesso: string
  numero: string
  serie: string
  dataEmissao: string
  ambiente: 'homologacao' | 'producao'
  ufCarregamento: string
  municipioCarregamento: string
  ufDescarregamento: string
  municipioDescarregamento: string
  placaVeiculo: string
  ufVeiculo: string
  rntrc: string
  condutores: MdfeCondutor[]
  reboques: MdfeReboque[]
  valesPedagio: MdfeValePedagio[]
  ctesVinculados: MdfeCteVinculado[]
  valorTotalCarga: number
  pesoBrutoTotalKg: number
  emitente: {
    cnpj: string
    razaoSocial: string
    uf: string
  }
  observacoes?: string
}): string {
  const tpAmb = dados.ambiente === 'producao' ? '1' : '2'
  const cMDF = dados.chaveAcesso ? dados.chaveAcesso.substring(35, 43) : '87654321'
  const cDV = dados.chaveAcesso ? dados.chaveAcesso.charAt(43) : '0'

  const condutoresXml = dados.condutores
    .map(
      (c) => `            <condutor>
              <xNome>${escapeXml(c.nome)}</xNome>
              <CPF>${c.cpf.replace(/\D/g, '')}</CPF>
            </condutor>`,
    )
    .join('\n')

  const ctesXml = dados.ctesVinculados
    .map(
      (c) => `            <infCTe>
              <chCTe>${c.chave_acesso}</chCTe>
            </infCTe>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- HURAM ERP - MDF-e Modelo 58 (Geração Estrutural Textual para Emissor Externo/Contador) -->
<MDFe xmlns="http://www.portalfiscal.inf.br/mdfe">
  <infMDFe Id="MDFe${dados.chaveAcesso}" versao="3.00">
    <ide>
      <cUF>${UF_IBGE_CODES[dados.emitente.uf] || '35'}</cUF>
      <tpAmb>${tpAmb}</tpAmb>
      <tpEmit>1</tpEmit>
      <tpTransp>1</tpTransp>
      <mod>58</mod>
      <serie>${dados.serie}</serie>
      <nMDF>${dados.numero}</nMDF>
      <cMDF>${cMDF}</cMDF>
      <cDV>${cDV}</cDV>
      <modal>1</modal>
      <dhEmi>${dados.dataEmissao || new Date().toISOString()}</dhEmi>
      <tpEmis>1</tpEmis>
      <procEmi>0</procEmi>
      <verProc>HURAM-ERP-3.00</verProc>
      <UFIni>${dados.ufCarregamento}</UFIni>
      <UFFim>${dados.ufDescarregamento}</UFFim>
      <infMunCarrega>
        <cMunCarrega>9999999</cMunCarrega>
        <xMunCarrega>${escapeXml(dados.municipioCarregamento)}</xMunCarrega>
      </infMunCarrega>
    </ide>
    <emit>
      <CNPJ>${dados.emitente.cnpj.replace(/\D/g, '')}</CNPJ>
      <IE>ISENTO</IE>
      <xNome>${escapeXml(dados.emitente.razaoSocial)}</xNome>
      <enderEmit>
        <xLgr>Endereco Emitente</xLgr>
        <nro>SN</nro>
        <xBairro>Centro</xBairro>
        <cMun>9999999</cMun>
        <xMun>Municipio</xMun>
        <UF>${dados.emitente.uf}</UF>
      </enderEmit>
    </emit>
    <infModal versaoModal="3.00">
      <rodo>
        <infANTT>
          <RNTRC>${dados.rntrc || '00000000'}</RNTRC>
        </infANTT>
        <veicTracao>
          <placa>${dados.placaVeiculo.toUpperCase().replace(/[^A-Z0-9]/g, '')}</placa>
          <UF>${dados.ufVeiculo || dados.emitente.uf}</UF>
${condutoresXml}
        </veicTracao>
      </rodo>
    </infModal>
    <infDoc>
      <infMunDescarga>
        <cMunDescarga>9999999</cMunDescarga>
        <xMunDescarga>${escapeXml(dados.municipioDescarregamento)}</xMunDescarga>
${ctesXml}
      </infMunDescarga>
    </infDoc>
    <tot>
      <qCTe>${dados.ctesVinculados.length}</qCTe>
      <vCarga>${dados.valorTotalCarga.toFixed(2)}</vCarga>
      <cUnid>01</cUnid>
      <qCarga>${dados.pesoBrutoTotalKg.toFixed(4)}</qCarga>
    </tot>
    <infAdic>
      <infCpl>${escapeXml(dados.observacoes || 'MDF-e emitido em contingência/homologação via ERP HURAM')}</infCpl>
    </infAdic>
  </infMDFe>
</MDFe>`
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
