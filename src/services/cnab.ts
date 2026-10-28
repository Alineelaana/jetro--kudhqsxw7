/**
 * Serviço de Integração CNAB para o ERP HURAM
 * Conecta o Frontend com as coleções PocketBase cnab_configs, cnab_remessas, cnab_retornos
 * e reutiliza o fluxo nativo de baixa de títulos em financial_receivables.
 */

import pb from '@/lib/pocketbase/client'
import type {
  CnabConfig,
  CnabRemessaRecord,
  CnabRetornoRecord,
  CnabTituloRemessa,
  CnabEventoRetorno,
} from '@/lib/cnab/types'
import { generateCnab240Remessa } from '@/lib/cnab/cnab240-generator'
import { generateCnab400Remessa } from '@/lib/cnab/cnab400-generator'
import { parseCnab240Retorno } from '@/lib/cnab/cnab240-parser'
import { parseCnab400Retorno } from '@/lib/cnab/cnab400-parser'
import { simpleChecksum } from '@/lib/cnab/formatters'

export const CnabService = {
  // --- CONFIGURAÇÕES CNAB ---
  async listConfigs(): Promise<CnabConfig[]> {
    try {
      const records = await pb.collection('cnab_configs').getFullList<CnabConfig>({
        sort: '-created',
      })
      return records
    } catch (err) {
      console.error('Erro ao listar configurações CNAB:', err)
      return []
    }
  },

  async saveConfig(data: Partial<CnabConfig>): Promise<CnabConfig> {
    const user = pb.authStore.record
    const payload = {
      ...data,
      empresa: data.empresa || (user?.empresa as string) || '',
      filial: data.filial || (user?.filial as string) || '',
      empresa_id: data.empresa_id || (user?.empresa_id as string) || '',
      filial_id: data.filial_id || (user?.filial_id as string) || '',
    }

    if (data.id) {
      return await pb.collection('cnab_configs').update<CnabConfig>(data.id, payload)
    } else {
      return await pb.collection('cnab_configs').create<CnabConfig>(payload)
    }
  },

  async deleteConfig(id: string): Promise<boolean> {
    try {
      await pb.collection('cnab_configs').delete(id)
      return true
    } catch (err) {
      console.error('Erro ao excluir configuração CNAB:', err)
      throw err
    }
  },

  // --- TÍTULOS DISPONÍVEIS PARA REMESSA ---
  async getTitulosElegiveisParaRemessa(): Promise<CnabTituloRemessa[]> {
    try {
      // Busca recebíveis em aberto (não pagos e não cancelados)
      const records = await pb.collection('financial_receivables').getFullList({
        filter:
          'status != "Recebido" && status != "Pago" && status != "Cancelado" && status != "Cancelada"',
        sort: 'data_vencimento',
      })

      // Busca IDs de títulos já inclusos em remessas geradas/enviadas ativas
      const remessasAtivas = await pb.collection('cnab_remessas').getFullList({
        filter: 'status != "cancelado"',
      })

      const idsRemetidos = new Set<string>()
      remessasAtivas.forEach((r) => {
        const ids = (r.titulos_ids as string[]) || []
        ids.forEach((id) => idsRemetidos.add(id))
      })

      return records
        .filter((r) => !idsRemetidos.has(r.id))
        .map((r) => ({
          id: r.id,
          numero_titulo:
            (r.numero_titulo as string) || (r.numero_documento as string) || r.id.slice(0, 8),
          cliente: (r.cliente as string) || (r.sacado as string) || 'Cliente não identificado',
          cpf_cnpj: (r.cpf_cnpj as string) || (r.documento_sacado as string) || '',
          endereco: (r.endereco as string) || '',
          cep: (r.cep as string) || '',
          cidade: (r.cidade as string) || '',
          uf: (r.uf as string) || 'SP',
          data_emissao: (r.data_emissao as string) || (r.created as string)?.slice(0, 10) || '',
          data_vencimento: (r.data_vencimento as string) || '',
          valor_original: String(r.valor_original || r.valor || '0.00'),
          nosso_numero: (r.nosso_numero as string) || '',
          numero_documento: (r.numero_documento as string) || (r.numero_titulo as string) || '',
          status: (r.status as string) || 'Aberto',
        }))
    } catch (err) {
      console.error('Erro ao buscar títulos elegíveis para remessa:', err)
      return []
    }
  },

  // --- GERAÇÃO DE REMESSA ---
  async gerarRemessa(
    config: CnabConfig,
    titulos: CnabTituloRemessa[],
  ): Promise<{ remessaRecord: CnabRemessaRecord; fileContent: string; fileName: string }> {
    const user = pb.authStore.record
    const sequencial =
      config.sequencial_remessa && config.sequencial_remessa > 0 ? config.sequencial_remessa : 1

    let generated: { content: string; filename: string; totalValor: number; countTitulos: number }

    if (config.layout_padrao === 'CNAB 400') {
      generated = generateCnab400Remessa(config, titulos, sequencial)
    } else {
      generated = generateCnab240Remessa(config, titulos, sequencial)
    }

    const checksum = simpleChecksum(generated.content)

    const payload = {
      config_id: config.id,
      banco_codigo: config.banco_codigo,
      layout: config.layout_padrao,
      sequencial_arquivo: sequencial,
      nome_arquivo: generated.filename,
      empresa: (user?.empresa as string) || config.empresa || '',
      filial: (user?.filial as string) || config.filial || '',
      usuario_nome: (user?.name as string) || (user?.email as string) || 'Usuário Atual',
      usuario_id: user?.id || '',
      data_geracao: new Date().toISOString(),
      quantidade_titulos: generated.countTitulos,
      valor_total: generated.totalValor.toFixed(2),
      titulos_ids: titulos.map((t) => t.id),
      titulos_detalhes: titulos,
      checksum_conteudo: checksum,
      conteudo_arquivo: generated.content,
      status: 'gerado',
    }

    // Cria registro de remessa no banco
    const remessaRecord = await pb.collection('cnab_remessas').create<CnabRemessaRecord>(payload)

    // Atualiza status local nos recebíveis para rastreabilidade informativa
    for (const t of titulos) {
      try {
        await pb.collection('financial_receivables').update(t.id, {
          observacoes: `Remessa CNAB gerada: ${generated.filename} (Lote #${sequencial})`,
        })
      } catch (upErr) {
        console.warn(`Aviso: não foi possível anotar recebível ${t.id}`, upErr)
      }
    }

    return {
      remessaRecord,
      fileContent: generated.content,
      fileName: generated.filename,
    }
  },

  async listRemessas(): Promise<CnabRemessaRecord[]> {
    try {
      return await pb.collection('cnab_remessas').getFullList<CnabRemessaRecord>({
        sort: '-created',
      })
    } catch (err) {
      console.error('Erro ao listar remessas:', err)
      return []
    }
  },

  async cancelarRemessa(remessaId: string, motivo: string): Promise<boolean> {
    try {
      await pb.collection('cnab_remessas').update(remessaId, {
        status: 'cancelado',
        motivo_cancelamento: motivo,
      })
      return true
    } catch (err) {
      console.error('Erro ao cancelar remessa:', err)
      throw err
    }
  },

  // --- PROCESSAMENTO DE RETORNO ---
  async parseArquivoRetorno(
    fileContent: string,
    fileName: string,
  ): Promise<{
    layout: 'CNAB 240' | 'CNAB 400'
    bancoCodigo: string
    bancoNome: string
    dataGravacao: string
    totalRegistros: number
    eventos: CnabEventoRetorno[]
  }> {
    const firstLine = fileContent.split(/\r?\n/)[0] || ''
    const lineLength = firstLine.trimEnd().length

    let parsedResult
    if (lineLength >= 350) {
      parsedResult = parseCnab400Retorno(fileContent)
    } else {
      parsedResult = parseCnab240Retorno(fileContent)
    }

    // Busca recebíveis existentes no sistema para fazer a conciliação / conferência cruzada
    const titulosExistentes = await pb.collection('financial_receivables').getFullList()

    // Mapeamento por numero_titulo e por nosso_numero
    const mapaTitulosPorNumero = new Map<string, any>()
    const mapaTitulosPorNossoNumero = new Map<string, any>()

    titulosExistentes.forEach((rec) => {
      const numT = String(rec.numero_titulo || rec.numero_documento || '')
        .trim()
        .toUpperCase()
      const nNum = String(rec.nosso_numero || '')
        .trim()
        .replace(/\D/g, '')
      if (numT) mapaTitulosPorNumero.set(numT, rec)
      if (nNum) mapaTitulosPorNossoNumero.set(nNum, rec)
    })

    // Realiza a conferência de cada evento
    const eventosConferidos = parsedResult.eventos.map((evt) => {
      const numRet = evt.numero_titulo_retorno.trim().toUpperCase()
      const nosRet = evt.nosso_numero.replace(/\D/g, '')

      let titleMatch = mapaTitulosPorNumero.get(numRet)
      if (!titleMatch && nosRet) {
        titleMatch = mapaTitulosPorNossoNumero.get(nosRet)
      }

      if (!titleMatch) {
        return {
          ...evt,
          status_conferencia: 'nao_encontrado' as const,
          divergencia_motivo: 'Título não localizado no sistema por número ou nosso número.',
        }
      }

      const st = String(titleMatch.status || '')
      if (st === 'Recebido' || st === 'Pago') {
        return {
          ...evt,
          titulo_sistema_id: titleMatch.id,
          status_conferencia: 'ja_baixado' as const,
          divergencia_motivo: `Título já baixado/liquidado anteriormente em ${titleMatch.data_recebimento || 'data não informada'}.`,
        }
      }

      const valorSistema = parseFloat(String(titleMatch.valor_original || titleMatch.valor || '0'))
      const diferenca = Math.abs(valorSistema - evt.valor_pago)

      // Se a diferença for superior a 5 centavos (descontos e juros explicados mantêm como compatível)
      if (
        evt.tipo_evento === 'liquidacao' &&
        diferenca > 0.05 &&
        evt.valor_desconto === 0 &&
        evt.valor_juros_multa === 0
      ) {
        return {
          ...evt,
          titulo_sistema_id: titleMatch.id,
          status_conferencia: 'divergente' as const,
          divergencia_motivo: `Valor pago no retorno (R$ ${evt.valor_pago.toFixed(2)}) diverge do esperado no sistema (R$ ${valorSistema.toFixed(2)}).`,
        }
      }

      return {
        ...evt,
        titulo_sistema_id: titleMatch.id,
        status_conferencia: 'compativel' as const,
      }
    })

    return {
      ...parsedResult,
      eventos: eventosConferidos,
    }
  },

  // Executa a baixa de recebíveis compatíveis reutilizando o fluxo nativo do ERP
  async aplicarBaixaCompativel(
    eventos: CnabEventoRetorno[],
    nomeArquivoRetorno: string,
  ): Promise<{ baixados: number; pendentes: number; erros: string[] }> {
    let baixados = 0
    let pendentes = 0
    const erros: string[] = []

    for (const evt of eventos) {
      if (
        evt.tipo_evento === 'liquidacao' &&
        evt.status_conferencia === 'compativel' &&
        evt.titulo_sistema_id
      ) {
        try {
          // Reutiliza o formato nativo de baixa do módulo de recebíveis
          await pb.collection('financial_receivables').update(evt.titulo_sistema_id, {
            status: 'Recebido',
            data_recebimento:
              evt.data_credito || evt.data_ocorrencia || new Date().toISOString().slice(0, 10),
            valor_recebido: evt.valor_pago.toFixed(2),
            desconto: evt.valor_desconto > 0 ? evt.valor_desconto.toFixed(2) : undefined,
            juros_multa: evt.valor_juros_multa > 0 ? evt.valor_juros_multa.toFixed(2) : undefined,
            observacoes: `Baixa automática via Retorno CNAB: ${nomeArquivoRetorno} - Ocorrência ${evt.codigo_ocorrencia} (${evt.descricao_ocorrencia})`,
          })
          baixados++
        } catch (err: any) {
          erros.push(
            `Falha ao liquidar título ${evt.numero_titulo_retorno}: ${err?.message || String(err)}`,
          )
          pendentes++
        }
      } else {
        pendentes++
      }
    }

    return { baixados, pendentes, erros }
  },

  // Salva o histórico do processamento do retorno
  async registrarRetorno(data: Partial<CnabRetornoRecord>): Promise<CnabRetornoRecord> {
    const user = pb.authStore.record
    const payload = {
      ...data,
      empresa: (user?.empresa as string) || '',
      filial: (user?.filial as string) || '',
      usuario_nome: (user?.name as string) || (user?.email as string) || 'Usuário Atual',
      usuario_id: user?.id || '',
      data_processamento: new Date().toISOString(),
    }

    return await pb.collection('cnab_retornos').create<CnabRetornoRecord>(payload)
  },

  async listRetornos(): Promise<CnabRetornoRecord[]> {
    try {
      return await pb.collection('cnab_retornos').getFullList<CnabRetornoRecord>({
        sort: '-created',
      })
    } catch (err) {
      console.error('Erro ao listar históricos de retorno:', err)
      return []
    }
  },
}
