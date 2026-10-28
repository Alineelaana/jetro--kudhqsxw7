/**
 * Parser de Arquivo de Retorno CNAB 240 (Padrão FEBRABAN)
 * Decodifica segmentos T (Dados do Título no Retorno) e U (Dados de Liquidação/Pagamento)
 * ou segmento J para pagamentos.
 */

import type { CnabEventoRetorno, CnabLayout } from './types'
import { parseCnabDate, parseCnabCurrency } from './formatters'

// Códigos de movimento FEBRABAN para retorno
const OCORRENCIAS_240: Record<string, { desc: string; tipo: CnabEventoRetorno['tipo_evento'] }> = {
  '02': { desc: 'Entrada Confirmada', tipo: 'outros' },
  '03': { desc: 'Entrada Rejeitada', tipo: 'rejeicao' },
  '04': { desc: 'Transferência de Carteira/Entrada', tipo: 'outros' },
  '05': { desc: 'Transferência de Carteira/Baixa', tipo: 'baixa' },
  '06': { desc: 'Liquidação Normal', tipo: 'liquidacao' },
  '07': { desc: 'Confirmação do Recebimento da Instrução de Desconto', tipo: 'desconto' },
  '08': { desc: 'Confirmação do Cancelamento do Desconto', tipo: 'outros' },
  '09': { desc: 'Baixa Simples', tipo: 'baixa' },
  '10': { desc: 'Baixa Solicitada / Instrução Confirmada', tipo: 'baixa' },
  '11': { desc: 'Títulos em Carteira (Em Ser)', tipo: 'outros' },
  '12': { desc: 'Confirmação Recebimento Instrução de Abatimento', tipo: 'abatimento' },
  '13': { desc: 'Confirmação Cancelamento Instrução de Abatimento', tipo: 'outros' },
  '14': { desc: 'Confirmação Recebimento Instrução Alteração de Vencimento', tipo: 'outros' },
  '15': { desc: 'Franco de Pagamento', tipo: 'outros' },
  '17': { desc: 'Liquidação Após Baixa ou Título Não Registrado', tipo: 'liquidacao' },
  '19': { desc: 'Confirmação Recebimento Instrução de Protesto', tipo: 'cartorio' },
  '20': {
    desc: 'Confirmação Recebimento Instrução de Sustação/Cancelamento Protesto',
    tipo: 'outros',
  },
  '23': { desc: 'Remessa a Cartório / Encaminhado a Protesto', tipo: 'cartorio' },
  '24': { desc: 'Retirada de Cartório / Sustado', tipo: 'outros' },
  '25': { desc: 'Protestado e Baixado', tipo: 'cartorio' },
  '26': { desc: 'Instrução Rejeitada', tipo: 'rejeicao' },
  '27': { desc: 'Confirmação do Pedido de Alteração de Outros Dados', tipo: 'outros' },
  '28': { desc: 'Débito de Tarifas/Custas', tipo: 'outros' },
  '30': { desc: 'Alteração de Dados Rejeitada', tipo: 'rejeicao' },
  '44': { desc: 'Título Pago com Cheque Devolvido', tipo: 'devolucao' },
  '45': { desc: 'Título Pago com Cheque Compensado', tipo: 'liquidacao' },
}

export function parseCnab240Retorno(content: string): {
  layout: CnabLayout
  bancoCodigo: string
  bancoNome: string
  dataGravacao: string
  totalRegistros: number
  eventos: CnabEventoRetorno[]
} {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length >= 240)
  const eventos: CnabEventoRetorno[] = []
  let bancoCodigo = ''
  let bancoNome = ''
  let dataGravacao = ''

  // Guarda dados intermediários do Segmento T para combinar com o Segmento U imediatamente seguinte
  let lastSegT: Partial<CnabEventoRetorno> | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const tipoRegistro = line.slice(7, 8)

    // Header de Arquivo
    if (tipoRegistro === '0') {
      bancoCodigo = line.slice(0, 3)
      bancoNome = line.slice(102, 132).trim()
      dataGravacao = parseCnabDate(line.slice(143, 151))
      continue
    }

    // Detalhe
    if (tipoRegistro === '3') {
      const segmento = line.slice(13, 14).toUpperCase()

      if (segmento === 'T') {
        const codOcorrencia = line.slice(15, 17)
        const ocorrenciaInfo = OCORRENCIAS_240[codOcorrencia] || {
          desc: `Ocorrência ${codOcorrencia}`,
          tipo: 'outros',
        }
        const nossoNumero = line.slice(37, 57).trim()
        const numeroTitulo = line.slice(58, 73).trim()
        const dataVenc = parseCnabDate(line.slice(73, 81))
        const valorNominal = parseCnabCurrency(line.slice(81, 96))
        const bancoRecebedor = line.slice(96, 99)
        const agenciaRecebedora = line.slice(99, 104)

        // Motivos de rejeição (posições 213 a 222, até 5 pares de 2 dígitos)
        const motivosRaw = line.slice(213, 223)
        const motivosRejeicao: string[] = []
        for (let m = 0; m < motivosRaw.length; m += 2) {
          const par = motivosRaw.slice(m, m + 2).trim()
          if (par && par !== '00') motivosRejeicao.push(par)
        }

        lastSegT = {
          numero_titulo_retorno: numeroTitulo,
          nosso_numero: nossoNumero,
          codigo_ocorrencia: codOcorrencia,
          descricao_ocorrencia: ocorrenciaInfo.desc,
          tipo_evento: ocorrenciaInfo.tipo,
          motivos_rejeicao: motivosRejeicao,
          data_ocorrencia: dataVenc,
          valor_titulo: valorNominal,
          banco_recebedor: bancoRecebedor,
          agencia_recebedora: agenciaRecebedora,
        }
      } else if (segmento === 'U' && lastSegT) {
        // Segmento U: valores de liquidação e acréscimos
        const jurosMulta = parseCnabCurrency(line.slice(17, 32))
        const desconto = parseCnabCurrency(line.slice(32, 47))
        const abatimento = parseCnabCurrency(line.slice(47, 62))
        const valorPago = parseCnabCurrency(line.slice(77, 92))
        const valorLiquido = parseCnabCurrency(line.slice(92, 107))
        const dataOcorrencia = parseCnabDate(line.slice(137, 145))
        const dataCredito = parseCnabDate(line.slice(145, 153))

        const eventoCompleto: CnabEventoRetorno = {
          numero_titulo_retorno: lastSegT.numero_titulo_retorno || '',
          nosso_numero: lastSegT.nosso_numero || '',
          codigo_ocorrencia: lastSegT.codigo_ocorrencia || '00',
          descricao_ocorrencia: lastSegT.descricao_ocorrencia || 'Ocorrência Bancária',
          tipo_evento: lastSegT.tipo_evento || 'outros',
          motivos_rejeicao: lastSegT.motivos_rejeicao,
          data_ocorrencia: dataOcorrencia || lastSegT.data_ocorrencia || '',
          data_credito: dataCredito,
          valor_titulo: lastSegT.valor_titulo || 0,
          valor_pago: valorPago > 0 ? valorPago : lastSegT.valor_titulo || 0,
          valor_desconto: desconto + abatimento,
          valor_juros_multa: jurosMulta,
          valor_liquido: valorLiquido > 0 ? valorLiquido : valorPago,
          banco_recebedor: lastSegT.banco_recebedor,
          agencia_recebedora: lastSegT.agencia_recebedora,
          status_conferencia: 'compativel',
        }

        eventos.push(eventoCompleto)
        lastSegT = null
      }
    }
  }

  // Se sobrou algum segmento T sem U
  if (lastSegT) {
    eventos.push({
      numero_titulo_retorno: lastSegT.numero_titulo_retorno || '',
      nosso_numero: lastSegT.nosso_numero || '',
      codigo_ocorrencia: lastSegT.codigo_ocorrencia || '00',
      descricao_ocorrencia: lastSegT.descricao_ocorrencia || 'Entrada',
      tipo_evento: lastSegT.tipo_evento || 'outros',
      motivos_rejeicao: lastSegT.motivos_rejeicao,
      data_ocorrencia: lastSegT.data_ocorrencia || '',
      valor_titulo: lastSegT.valor_titulo || 0,
      valor_pago: 0,
      valor_desconto: 0,
      valor_juros_multa: 0,
      valor_liquido: 0,
      status_conferencia: 'compativel',
    })
  }

  return {
    layout: 'CNAB 240',
    bancoCodigo,
    bancoNome,
    dataGravacao,
    totalRegistros: lines.length,
    eventos,
  }
}
