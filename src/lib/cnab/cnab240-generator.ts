/**
 * Gerador de Arquivo de Remessa CNAB 240 (Padrão FEBRABAN)
 * Estrutura:
 * - Header de Arquivo (Registro 0)
 * - Header de Lote (Registro 1)
 * - Detalhe Segmento P (Registro 3 - Dados do Título)
 * - Detalhe Segmento Q (Registro 3 - Dados do Pagador/Sacado)
 * - Detalhe Segmento R (Registro 3 - Multa, Juros e Descontos)
 * - Trailer de Lote (Registro 5)
 * - Trailer de Arquivo (Registro 9)
 * Todas as linhas possuem exatamente 240 caracteres.
 */

import type { CnabConfig, CnabTituloRemessa } from './types'
import { padLeftZeros, padRightSpaces, formatCnabDate, formatCnabCurrency } from './formatters'

export function generateCnab240Remessa(
  config: CnabConfig,
  titulos: CnabTituloRemessa[],
  sequencialArquivo: number,
): { content: string; filename: string; totalValor: number; countTitulos: number } {
  const lines: string[] = []
  const banco = padLeftZeros(config.banco_codigo, 3)
  const dataHoje = formatCnabDate()
  const horaHoje = new Date().toTimeString().slice(0, 8).replace(/:/g, '').slice(0, 6)

  // 1. HEADER DE ARQUIVO (Registro 0)
  let hArq = ''
  hArq += banco // 001 a 003: Código do Banco
  hArq += '0000' // 004 a 007: Lote de serviço
  hArq += '0' // 008: Tipo de registro (0 = Header de Arquivo)
  hArq += padRightSpaces('', 9) // 009 a 017: Reservado CNAB
  const tipoInscr = (config.cedente_cnpj_cpf || '').replace(/\D/g, '').length > 11 ? '2' : '1'
  hArq += tipoInscr // 018: Tipo de inscrição (1 CPF, 2 CNPJ)
  hArq += padLeftZeros(config.cedente_cnpj_cpf || '', 14) // 019 a 032: Número de Inscrição da Empresa
  hArq += padRightSpaces(config.convenio || '', 20) // 033 a 052: Código do Convênio no Banco
  hArq += padLeftZeros(config.agencia || '', 5) // 053 a 057: Agência Mantenedora
  hArq += padRightSpaces(config.agencia_digito || '', 1) // 058: Dígito Verificador Agência
  hArq += padLeftZeros(config.conta || '', 12) // 059 a 070: Número da Conta Corrente
  hArq += padRightSpaces(config.conta_digito || '', 1) // 071: Dígito Verificador da Conta
  hArq += ' ' // 072: Dígito Verificador Ag/Conta
  hArq += padRightSpaces(config.cedente_nome || 'EMPRESA CEDENTE', 30) // 073 a 102: Nome da Empresa
  hArq += padRightSpaces(config.banco_nome || 'BANCO', 30) // 103 a 132: Nome do Banco
  hArq += padRightSpaces('', 10) // 133 a 142: Reservado FEBRABAN
  hArq += '1' // 143: Código Remessa (1 = Remessa)
  hArq += dataHoje // 144 a 151: Data de Geração do Arquivo (DDMMAAAA)
  hArq += horaHoje // 152 a 157: Hora de Geração do Arquivo (HHMMSS)
  hArq += padLeftZeros(sequencialArquivo, 6) // 158 a 163: Sequencial do Arquivo
  hArq += '103' // 164 a 166: Versão do Layout (103)
  hArq += padLeftZeros(0, 5) // 167 a 171: Densidade de gravação
  hArq += padRightSpaces('', 20) // 172 a 191: Reservado Banco
  hArq += padRightSpaces('', 20) // 192 a 211: Reservado Empresa
  hArq += padRightSpaces('', 29) // 212 a 240: Reservado FEBRABAN
  lines.push(hArq.padEnd(240, ' ').slice(0, 240))

  // 2. HEADER DE LOTE (Registro 1)
  let hLote = ''
  hLote += banco // 001 a 003: Código do Banco
  hLote += '0001' // 004 a 007: Lote de Serviço
  hLote += '1' // 008: Tipo de Registro (1 = Header de Lote)
  hLote += 'R' // 009: Tipo de Operação (R = Arquivo Remessa)
  hLote += '01' // 010 a 011: Tipo de Serviço (01 = Cobrança Registrada)
  hLote += '  ' // 012 a 013: Forma de Lançamento
  hLote += '060' // 014 a 016: Versão do Layout do Lote (060)
  hLote += ' ' // 017: Reservado FEBRABAN
  hLote += tipoInscr // 018: Tipo Inscrição Empresa
  hLote += padLeftZeros(config.cedente_cnpj_cpf || '', 15) // 019 a 033: Número Inscrição Empresa
  hLote += padRightSpaces(config.convenio || '', 20) // 034 a 053: Convênio
  hLote += padLeftZeros(config.agencia || '', 5) // 054 a 058: Agência
  hLote += padRightSpaces(config.agencia_digito || '', 1) // 059: Dígito Agência
  hLote += padLeftZeros(config.conta || '', 12) // 060 a 071: Conta
  hLote += padRightSpaces(config.conta_digito || '', 1) // 072: Dígito Conta
  hLote += ' ' // 073: Dígito Ag/Conta
  hLote += padRightSpaces(config.cedente_nome || 'EMPRESA CEDENTE', 30) // 074 a 103: Nome Empresa
  hLote += padRightSpaces(config.instrucoes_cobranca_1 || '', 40) // 104 a 143: Mensagem 1
  hLote += padRightSpaces(config.instrucoes_cobranca_2 || '', 40) // 144 a 183: Mensagem 2
  hLote += padLeftZeros(sequencialArquivo, 8) // 184 a 191: Número Remessa/Retorno
  hLote += dataHoje // 192 a 199: Data Gravação Remessa/Retorno
  hLote += padLeftZeros(0, 8) // 200 a 207: Data do Crédito
  hLote += padRightSpaces('', 33) // 208 a 240: Reservado FEBRABAN
  lines.push(hLote.padEnd(240, ' ').slice(0, 240))

  let numSequencialLote = 1
  let totalValor = 0

  // 3. DETALHES POR TÍTULO (Segmentos P, Q, R)
  for (let idx = 0; idx < titulos.length; idx++) {
    const t = titulos[idx]
    const valorNum = parseFloat(t.valor_original || '0')
    totalValor += valorNum
    const nossoNumero = t.nosso_numero || padLeftZeros(idx + 1, 11)

    // --- SEGMENTO P ---
    let segP = ''
    segP += banco // 001 a 003: Banco
    segP += '0001' // 004 a 007: Lote
    segP += '3' // 008: Tipo de Registro (3 = Detalhe)
    segP += padLeftZeros(numSequencialLote++, 5) // 009 a 013: Sequencial do Registro no Lote
    segP += 'P' // 014: Segmento P
    segP += ' ' // 015: Reservado FEBRABAN
    segP += '01' // 016 a 017: Código Movimento Remessa (01 = Entrada de Títulos)
    segP += padLeftZeros(config.agencia || '', 5) // 018 a 022: Agência
    segP += padRightSpaces(config.agencia_digito || '', 1) // 023: Dígito Agência
    segP += padLeftZeros(config.conta || '', 12) // 024 a 035: Conta Corrente
    segP += padRightSpaces(config.conta_digito || '', 1) // 036: Dígito Conta
    segP += ' ' // 037: Dígito Ag/Conta
    segP += padRightSpaces(nossoNumero, 20) // 038 a 057: Nosso Número
    segP += padLeftZeros(config.carteira || '1', 1) // 058: Código da Carteira
    segP += '1' // 059: Forma de Cadastramento (1 = Com Cadastramento / Cobrança Registrada)
    segP += '1' // 060: Tipo de Documento (1 = Tradicional)
    segP += '2' // 061: Emissão do Boleto (2 = Beneficiário Emite)
    segP += '2' // 062: Distribuição do Boleto (2 = Beneficiário Distribui)
    segP += padRightSpaces(t.numero_titulo || t.numero_documento || '', 15) // 063 a 077: Nº do Documento de Cobrança
    segP += formatCnabDate(t.data_vencimento) // 078 a 085: Data de Vencimento (DDMMAAAA)
    segP += formatCnabCurrency(valorNum, 15) // 086 a 100: Valor Nominal do Título
    segP += padLeftZeros(0, 5) // 101 a 105: Agência Cobradora
    segP += ' ' // 106: Dígito Agência Cobradora
    segP += '02' // 107 a 108: Espécie do Título (02 = Duplicata Mercantil)
    segP += 'N' // 109: Aceite (N = Não Aceite)
    segP += formatCnabDate(t.data_emissao) // 110 a 117: Data da Emissão do Título
    // Código de juros de mora: 1 = Valor por dia, 2 = Taxa mensal
    const temJuros = parseFloat(config.juros_mora_mensal || '0') > 0
    segP += temJuros ? '2' : '3' // 118: Código de Juros de Mora (3 = Isento)
    segP += formatCnabDate(t.data_vencimento) // 119 a 126: Data de Juros de Mora
    segP += formatCnabCurrency(config.juros_mora_mensal || '0', 15) // 127 a 141: Juros de Mora
    segP += '0' // 142: Código do Desconto 1 (0 = Sem Desconto)
    segP += padLeftZeros(0, 8) // 143 a 150: Data do Desconto 1
    segP += formatCnabCurrency(0, 15) // 151 a 165: Valor/Percentual Desconto 1
    segP += formatCnabCurrency(0, 15) // 166 a 180: Valor IOF
    segP += formatCnabCurrency(0, 15) // 181 a 195: Valor Abatimento
    segP += padRightSpaces(t.numero_titulo || '', 25) // 196 a 220: Uso da Empresa
    const diasProtesto = config.dias_protesto && config.dias_protesto > 0 ? config.dias_protesto : 0
    segP += diasProtesto > 0 ? '1' : '3' // 221: Código para Protesto (1 = Protestar, 3 = Não Protestar)
    segP += padLeftZeros(diasProtesto, 2) // 222 a 223: Número de Dias para Protesto
    const diasBaixa = config.dias_baixa_devolucao || 29
    segP += '1' // 224: Código para Baixa/Devolução (1 = Baixar/Devolver)
    segP += padLeftZeros(diasBaixa, 3) // 225 a 227: Número de Dias para Baixa/Devolução
    segP += '09' // 228 a 229: Código da Moeda (09 = Real)
    segP += padLeftZeros(0, 10) // 230 a 239: Nº do Contrato da Operação de Crédito
    segP += ' ' // 240: Reservado FEBRABAN
    lines.push(segP.padEnd(240, ' ').slice(0, 240))

    // --- SEGMENTO Q (Dados do Sacado/Pagador) ---
    let segQ = ''
    segQ += banco // 001 a 003: Banco
    segQ += '0001' // 004 a 007: Lote
    segQ += '3' // 008: Tipo de Registro
    segQ += padLeftZeros(numSequencialLote++, 5) // 009 a 013: Sequencial no Lote
    segQ += 'Q' // 014: Segmento Q
    segQ += ' ' // 015: Reservado FEBRABAN
    segQ += '01' // 016 a 017: Código Movimento (01 = Entrada de Título)
    const sacadoDoc = (t.cpf_cnpj || '').replace(/\D/g, '')
    const sacadoTipo = sacadoDoc.length > 11 ? '2' : '1'
    segQ += sacadoTipo // 018: Tipo Inscrição Pagador
    segQ += padLeftZeros(sacadoDoc, 15) // 019 a 033: Número Inscrição Pagador
    segQ += padRightSpaces(t.cliente || 'CLIENTE SACADO', 40) // 034 a 073: Nome do Pagador
    segQ += padRightSpaces(t.endereco || 'ENDERECO DO CLIENTE', 40) // 074 a 113: Endereço
    segQ += padRightSpaces(t.cidade || '', 15) // 114 a 128: Bairro
    const cepClean = (t.cep || '').replace(/\D/g, '')
    segQ += padLeftZeros(cepClean.slice(0, 5), 5) // 129 a 133: CEP
    segQ += padLeftZeros(cepClean.slice(5, 8), 3) // 134 a 136: Sufixo CEP
    segQ += padRightSpaces(t.cidade || 'CIDADE', 15) // 137 a 151: Cidade
    segQ += padRightSpaces(t.uf || 'SP', 2) // 152 a 153: UF
    segQ += '0' // 154: Tipo Inscrição Sacador/Avalista (0 = Isento)
    segQ += padLeftZeros(0, 15) // 155 a 169: Número Inscrição Sacador/Avalista
    segQ += padRightSpaces('', 40) // 170 a 209: Nome Sacador/Avalista
    segQ += padLeftZeros(0, 3) // 210 a 212: Cód. Banco Correspondente
    segQ += padRightSpaces('', 20) // 213 a 232: Nosso Nº no Banco Correspondente
    segQ += padRightSpaces('', 8) // 233 a 240: Reservado FEBRABAN
    lines.push(segQ.padEnd(240, ' ').slice(0, 240))

    // --- SEGMENTO R (Multa, Descontos e Opcionais) ---
    let segR = ''
    segR += banco // 001 a 003: Banco
    segR += '0001' // 004 a 007: Lote
    segR += '3' // 008: Tipo de Registro
    segR += padLeftZeros(numSequencialLote++, 5) // 009 a 013: Sequencial no Lote
    segR += 'R' // 014: Segmento R
    segR += ' ' // 015: Reservado FEBRABAN
    segR += '01' // 016 a 017: Código Movimento (01 = Entrada de Título)
    segR += '0' // 018: Código Desconto 2
    segR += padLeftZeros(0, 8) // 019 a 026: Data Desconto 2
    segR += formatCnabCurrency(0, 15) // 027 a 041: Valor Desconto 2
    segR += '0' // 042: Código Desconto 3
    segR += padLeftZeros(0, 8) // 043 a 050: Data Desconto 3
    segR += formatCnabCurrency(0, 15) // 051 a 065: Valor Desconto 3
    const temMulta = parseFloat(config.multa_percentual || '0') > 0
    segR += temMulta ? '2' : '0' // 066: Código da Multa (2 = Percentual, 0 = Isento)
    segR += formatCnabDate(t.data_vencimento) // 067 a 074: Data da Multa
    segR += formatCnabCurrency(config.multa_percentual || '0', 15) // 075 a 089: Valor/Percentual da Multa
    segR += padRightSpaces('', 10) // 090 a 099: Informação ao Pagador
    segR += padRightSpaces(config.instrucoes_cobranca_1 || '', 40) // 100 a 139: Mensagem 3
    segR += padRightSpaces(config.instrucoes_cobranca_2 || '', 40) // 140 a 179: Mensagem 4
    segR += padRightSpaces('', 20) // 180 a 199: Reservado FEBRABAN
    segR += padLeftZeros(0, 8) // 200 a 207: Cód. Ocorrência do Pagador
    segR += padLeftZeros(0, 3) // 208 a 210: Cód. Banco Conta Débito
    segR += padLeftZeros(0, 5) // 211 a 215: Agência Conta Débito
    segR += ' ' // 216: Dígito Agência Débito
    segR += padLeftZeros(0, 12) // 217 a 228: Conta Débito
    segR += ' ' // 229: Dígito Conta Débito
    segR += ' ' // 230: Dígito Ag/Conta Débito
    segR += '0' // 231: Aviso para Débito Automático
    segR += padRightSpaces('', 9) // 232 a 240: Reservado FEBRABAN
    lines.push(segR.padEnd(240, ' ').slice(0, 240))
  }

  // 4. TRAILER DE LOTE (Registro 5)
  // Total de registros no lote = Header de Lote (1) + Detalhes (P, Q, R = 3 * N) + Trailer de Lote (1)
  const totalRegistrosLote = 1 + titulos.length * 3 + 1
  let tLote = ''
  tLote += banco // 001 a 003: Banco
  tLote += '0001' // 004 a 007: Lote de Serviço
  tLote += '5' // 008: Tipo de Registro (5 = Trailer de Lote)
  tLote += padRightSpaces('', 9) // 009 a 017: Reservado FEBRABAN
  tLote += padLeftZeros(totalRegistrosLote, 6) // 018 a 023: Quantidade de Registros no Lote
  tLote += padLeftZeros(titulos.length, 6) // 024 a 029: Quantidade de Títulos em Cobrança
  tLote += formatCnabCurrency(totalValor, 17) // 030 a 046: Valor Total dos Títulos no Lote
  tLote += padLeftZeros(0, 6) // 047 a 052: Quantidade de Cobrança Vinculada
  tLote += formatCnabCurrency(0, 17) // 053 a 069: Valor Total de Cobrança Vinculada
  tLote += padLeftZeros(0, 6) // 070 a 075: Quantidade de Cobrança Caucionada
  tLote += formatCnabCurrency(0, 17) // 076 a 092: Valor Total de Cobrança Caucionada
  tLote += padLeftZeros(0, 6) // 093 a 098: Quantidade de Cobrança Descontada
  tLote += formatCnabCurrency(0, 17) // 099 a 115: Valor Total de Cobrança Descontada
  tLote += padRightSpaces('', 8) // 116 a 123: Número do Aviso de Lançamento
  tLote += padRightSpaces('', 117) // 124 a 240: Reservado FEBRABAN
  lines.push(tLote.padEnd(240, ' ').slice(0, 240))

  // 5. TRAILER DE ARQUIVO (Registro 9)
  // Total de registros no arquivo = Header Arq (1) + Header Lote (1) + Detalhes + Trailer Lote (1) + Trailer Arq (1)
  const totalLinhasArquivo = lines.length + 1
  let tArq = ''
  tArq += banco // 001 a 003: Banco
  tArq += '9999' // 004 a 007: Lote
  tArq += '9' // 008: Tipo de Registro (9 = Trailer de Arquivo)
  tArq += padRightSpaces('', 9) // 009 a 017: Reservado FEBRABAN
  tArq += padLeftZeros(1, 6) // 018 a 023: Quantidade de Lotes do Arquivo
  tArq += padLeftZeros(totalLinhasArquivo, 6) // 024 a 029: Quantidade de Registros do Arquivo
  tArq += padLeftZeros(0, 6) // 030 a 035: Quantidade de Contas para Conciliação
  tArq += padRightSpaces('', 205) // 036 a 240: Reservado FEBRABAN
  lines.push(tArq.padEnd(240, ' ').slice(0, 240))

  const filename = `CB${padLeftZeros(config.banco_codigo, 3)}_${formatCnabDate()}_${padLeftZeros(sequencialArquivo, 4)}.REM`
  return {
    content: lines.join('\r\n') + '\r\n',
    filename,
    totalValor,
    countTitulos: titulos.length,
  }
}
