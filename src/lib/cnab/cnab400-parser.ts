/**
 * Parser de Arquivo de Retorno CNAB 400
 * Decodifica Registro 1 (Detalhe do Título) e ocorrências bancárias
 */

import type { CnabEventoRetorno, CnabLayout } from './types'
import { parseCnabDate, parseCnabCurrency } from './formatters'

const OCORRENCIAS_400: Record<string, { desc: string; tipo: CnabEventoRetorno['tipo_evento'] }> = {
  '02': { desc: 'Entrada Confirmada', tipo: 'outros' },
  '03': { desc: 'Entrada Rejeitada', tipo: 'rejeicao' },
  '06': { desc: 'Liquidação Normal', tipo: 'liquidacao' },
  '07': { desc: 'Liquidação por Conta / Parcial', tipo: 'liquidacao' },
  '08': { desc: 'Liquidação por Saldo', tipo: 'liquidacao' },
  '09': { desc: 'Baixa Simples', tipo: 'baixa' },
  '10': { desc: 'Baixa Solicitada', tipo: 'baixa' },
  '11': { desc: 'Em Ser', tipo: 'outros' },
  '12': { desc: 'Abatimento Concedido', tipo: 'abatimento' },
  '13': { desc: 'Abatimento Cancelado', tipo: 'outros' },
  '14': { desc: 'Vencimento Alterado', tipo: 'outros' },
  '15': { desc: 'Liquidação em Cartório', tipo: 'cartorio' },
  '16': { desc: 'Confirmação Alteração de Outros Dados', tipo: 'outros' },
  '17': { desc: 'Liquidação Após Baixa', tipo: 'liquidacao' },
  '19': { desc: 'Recebimento de Instrução de Protesto', tipo: 'cartorio' },
  '20': { desc: 'Recebimento de Sustação de Protesto', tipo: 'outros' },
  '23': { desc: 'Entrada de Título em Cartório', tipo: 'cartorio' },
  '24': { desc: 'Entrada Rejeitada pelo Cartório', tipo: 'rejeicao' },
  '27': { desc: 'Baixa por Devolução', tipo: 'devolucao' },
  '28': { desc: 'Débito de Tarifas', tipo: 'outros' },
  '30': { desc: 'Alteração de Dados Rejeitada', tipo: 'rejeicao' },
}

export function parseCnab400Retorno(content: string): {
  layout: CnabLayout
  bancoCodigo: string
  bancoNome: string
  dataGravacao: string
  totalRegistros: number
  eventos: CnabEventoRetorno[]
} {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length >= 400)
  const eventos: CnabEventoRetorno[] = []
  let bancoCodigo = ''
  let bancoNome = ''
  let dataGravacao = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const tipoRegistro = line.slice(0, 1)

    // Header
    if (tipoRegistro === '0') {
      bancoCodigo = line.slice(76, 79).trim()
      bancoNome = line.slice(79, 94).trim()
      dataGravacao = parseCnabDate(line.slice(94, 100))
      continue
    }

    // Detalhe do Título (Registro 1)
    if (tipoRegistro === '1') {
      const numeroTituloEmpresa = line.slice(37, 62).trim()
      const nossoNumero = line.slice(70, 81).trim()
      const codOcorrencia = line.slice(108, 110)
      const dataOcorrencia = parseCnabDate(line.slice(110, 116))
      const dataVencimento = parseCnabDate(line.slice(146, 152))
      const valorNominal = parseCnabCurrency(line.slice(152, 165))
      const bancoRecebedor = line.slice(165, 168)
      const agenciaRecebedora = line.slice(168, 173)
      const valorAbatimento = parseCnabCurrency(line.slice(227, 240))
      const valorDesconto = parseCnabCurrency(line.slice(240, 253))
      const valorPago = parseCnabCurrency(line.slice(253, 266))
      const valorJurosMulta = parseCnabCurrency(line.slice(266, 279))
      const dataCredito = parseCnabDate(line.slice(295, 301))

      // Motivos de rejeição (posições 318 a 328, até 5 pares)
      const motivosRaw = line.slice(318, 328)
      const motivosRejeicao: string[] = []
      for (let m = 0; m < motivosRaw.length; m += 2) {
        const par = motivosRaw.slice(m, m + 2).trim()
        if (par && par !== '00') motivosRejeicao.push(par)
      }

      const infoOcorrencia = OCORRENCIAS_400[codOcorrencia] || {
        desc: `Ocorrência ${codOcorrencia}`,
        tipo: 'outros',
      }

      eventos.push({
        numero_titulo_retorno: numeroTituloEmpresa,
        nosso_numero: nossoNumero,
        codigo_ocorrencia: codOcorrencia,
        descricao_ocorrencia: infoOcorrencia.desc,
        tipo_evento: infoOcorrencia.tipo,
        motivos_rejeicao: motivosRejeicao,
        data_ocorrencia: dataOcorrencia || dataVencimento,
        data_credito: dataCredito,
        valor_titulo: valorNominal,
        valor_pago:
          valorPago > 0 ? valorPago : infoOcorrencia.tipo === 'liquidacao' ? valorNominal : 0,
        valor_desconto: valorDesconto + valorAbatimento,
        valor_juros_multa: valorJurosMulta,
        valor_liquido: valorPago > 0 ? valorPago : valorNominal,
        banco_recebedor: bancoRecebedor,
        agencia_recebedora: agenciaRecebedora,
        status_conferencia: 'compativel',
      })
    }
  }

  return {
    layout: 'CNAB 400',
    bancoCodigo,
    bancoNome,
    dataGravacao,
    totalRegistros: lines.length,
    eventos,
  }
}
