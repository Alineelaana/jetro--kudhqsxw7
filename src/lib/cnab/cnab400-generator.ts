/**
 * Gerador de Arquivo de Remessa CNAB 400 (Padrão Bancos Legados: Bradesco, Itaú, BB, Santander, etc.)
 * Estrutura:
 * - Registro 0: Header de Arquivo (400 posições)
 * - Registro 1: Detalhe do Título (400 posições por título)
 * - Registro 7: Detalhe Multa/Instruções Adicionais (opcional)
 * - Registro 9: Trailer de Arquivo (400 posições)
 * Todas as linhas possuem exatamente 400 caracteres.
 */

import type { CnabConfig, CnabTituloRemessa } from './types'
import { padLeftZeros, padRightSpaces, formatCnabDate6, formatCnabCurrency } from './formatters'

export function generateCnab400Remessa(
  config: CnabConfig,
  titulos: CnabTituloRemessa[],
  sequencialArquivo: number,
): { content: string; filename: string; totalValor: number; countTitulos: number } {
  const lines: string[] = []
  const banco = padLeftZeros(config.banco_codigo, 3)
  const dataHoje6 = formatCnabDate6()

  // 1. HEADER (Registro 0)
  let h = ''
  h += '0' // 001: Identificação do Registro (0 = Header)
  h += '1' // 002: Identificação do Arquivo Remessa (1 = Remessa)
  h += 'REMESSA' // 003 a 009: Literal Remessa
  h += '01' // 010 a 011: Código do Serviço (01 = Cobrança)
  h += padRightSpaces('COBRANCA', 15) // 012 a 026: Literal Serviço
  h += padLeftZeros(config.agencia || '', 4) // 027 a 030: Agência
  h += padLeftZeros(config.conta || '', 7) // 031 a 037: Conta Corrente
  h += padRightSpaces(config.conta_digito || '', 1) // 038: Dígito Conta
  h += padRightSpaces(config.convenio || '', 8) // 039 a 046: Código da Empresa/Convênio
  h += padRightSpaces(config.cedente_nome || 'EMPRESA CEDENTE', 30) // 047 a 076: Nome da Empresa
  h += banco // 077 a 079: Número do Banco na Câmara de Compensação
  h += padRightSpaces(config.banco_nome || 'BANCO', 15) // 080 a 094: Nome do Banco
  h += dataHoje6 // 095 a 100: Data de Gravação do Arquivo (DDMMAA)
  h += padRightSpaces('', 8) // 101 a 108: Densidade
  h += padLeftZeros(0, 7) // 109 a 115: Nº Aviso Bancário
  h += padRightSpaces('', 279) // 116 a 394: Complemento do Registro
  h += padLeftZeros(1, 6) // 395 a 400: Sequencial do Registro (000001)
  lines.push(h.padEnd(400, ' ').slice(0, 400))

  let seqRegistro = 2
  let totalValor = 0

  // 2. DETALHE DOS TÍTULOS (Registro 1)
  for (let idx = 0; idx < titulos.length; idx++) {
    const t = titulos[idx]
    const valorNum = parseFloat(t.valor_original || '0')
    totalValor += valorNum
    const nossoNumero = t.nosso_numero || padLeftZeros(idx + 1, 11)

    let d = ''
    d += '1' // 001: Identificação do Registro (1 = Detalhe)
    d += padLeftZeros(config.agencia || '', 5) // 002 a 006: Agência de Débito
    d += padRightSpaces(config.agencia_digito || '', 1) // 007: Dígito Agência Débito
    d += padLeftZeros(config.conta || '', 12) // 008 a 019: Razão da Conta Corrente
    d += padRightSpaces(config.conta_digito || '', 1) // 020: Dígito da Conta Corrente
    d += '0' // 021: Zero
    d += padLeftZeros(config.carteira || '1', 3) // 022 a 024: Carteira
    d += padLeftZeros(config.agencia || '', 5) // 025 a 029: Agência Cedente
    d += padLeftZeros(config.conta || '', 7) // 030 a 036: Conta Corrente Cedente
    d += padRightSpaces(config.conta_digito || '', 1) // 037: Dígito Conta
    d += padRightSpaces(t.numero_titulo || '', 25) // 038 a 062: Identificação do Título na Empresa
    d += padLeftZeros(0, 3) // 063 a 065: Código do Banco a ser Debitado
    const temMulta = parseFloat(config.multa_percentual || '0') > 0
    d += temMulta ? '2' : '0' // 066: Campo de Multa (2 = Percentual)
    d += formatCnabCurrency(config.multa_percentual || '0', 4) // 067 a 070: Percentual de Multa
    d += padLeftZeros(nossoNumero, 11) // 071 a 081: Identificação do Título no Banco (Nosso Número)
    d += '0' // 082: Dígito de Auto Conferência do Nosso Número
    d += padLeftZeros(0, 10) // 083 a 092: Desconto Bonificação por Dia
    d += '2' // 093: Condição para Emissão da Papeleta (2 = Cliente Emite)
    d += 'N' // 094: Ident. se Emite Boleto para Débito Automático
    d += padRightSpaces('', 10) // 095 a 104: Identificação da Operação do Banco
    d += ' ' // 105: Indicador de Rateio de Crédito
    d += '2' // 106: Endereçamento para Aviso do Débito
    d += '  ' // 107 a 108: Quantidade de Pagamentos
    d += '01' // 109 a 110: Identificação da Ocorrência (01 = Remessa)
    d += padRightSpaces(t.numero_titulo || t.numero_documento || '', 10) // 111 a 120: Nº do Documento
    d += formatCnabDate6(t.data_vencimento) // 121 a 126: Data de Vencimento do Título (DDMMAA)
    d += formatCnabCurrency(valorNum, 13) // 127 a 139: Valor Nominal do Título
    d += padLeftZeros(0, 3) // 140 a 142: Banco Encarregado da Cobrança
    d += padLeftZeros(0, 5) // 143 a 147: Agência Depositária
    d += '01' // 148 a 149: Espécie de Título (01 = Duplicata)
    d += 'N' // 150: Identificação de Aceite (N = Não)
    d += formatCnabDate6(t.data_emissao) // 151 a 156: Data de Emissão do Título
    d += '00' // 157 a 158: 1ª Instrução de Cobrança
    d += '00' // 159 a 160: 2ª Instrução de Cobrança
    const jurosMora = config.juros_mora_mensal || '0'
    d += formatCnabCurrency(jurosMora, 13) // 161 a 173: Valor de Mora por Dia de Atraso
    d += padLeftZeros(0, 6) // 174 a 179: Data Limite para Concessão de Desconto
    d += formatCnabCurrency(0, 13) // 180 a 192: Valor do Desconto
    d += formatCnabCurrency(0, 13) // 193 a 205: Valor do IOF
    d += formatCnabCurrency(0, 13) // 206 a 218: Valor do Abatimento Concedido
    const sacadoDoc = (t.cpf_cnpj || '').replace(/\D/g, '')
    const tipoSacado = sacadoDoc.length > 11 ? '02' : '01'
    d += tipoSacado // 219 a 220: Identificação do Tipo de Inscrição/Pagador (01 CPF, 02 CNPJ)
    d += padLeftZeros(sacadoDoc, 14) // 221 a 234: Nº de Inscrição do Pagador
    d += padRightSpaces(t.cliente || 'CLIENTE SACADO', 40) // 235 a 274: Nome do Pagador
    d += padRightSpaces(t.endereco || 'ENDERECO DO CLIENTE', 40) // 275 a 314: Endereço Completo
    d += padRightSpaces('', 12) // 315 a 326: 1ª Mensagem
    const cepClean = (t.cep || '').replace(/\D/g, '')
    d += padLeftZeros(cepClean.slice(0, 5), 5) // 327 a 331: CEP
    d += padLeftZeros(cepClean.slice(5, 8), 3) // 332 a 334: Sufixo do CEP
    d += padRightSpaces(config.instrucoes_cobranca_1 || '', 60) // 335 a 394: Sacador/Avalista ou 2ª Mensagem
    d += padLeftZeros(seqRegistro++, 6) // 395 a 400: Sequencial do Registro no Arquivo
    lines.push(d.padEnd(400, ' ').slice(0, 400))
  }

  // 3. TRAILER (Registro 9)
  let tr = ''
  tr += '9' // 001: Identificação do Registro (9 = Trailer)
  tr += padRightSpaces('', 393) // 002 a 394: Complemento do Registro
  tr += padLeftZeros(seqRegistro, 6) // 395 a 400: Sequencial do Registro no Arquivo
  lines.push(tr.padEnd(400, ' ').slice(0, 400))

  const filename = `CB${padLeftZeros(config.banco_codigo, 3)}_${formatCnabDate6()}_${padLeftZeros(sequencialArquivo, 4)}.REM`
  return {
    content: lines.join('\r\n') + '\r\n',
    filename,
    totalValor,
    countTitulos: titulos.length,
  }
}
