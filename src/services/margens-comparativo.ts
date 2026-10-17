import pb from '@/lib/pocketbase/client'
import {
  type MargemInputRow,
  type MargemParametros,
  PARAMETROS_DEFAULT,
} from '@/lib/margens-gr-engine'

export interface MargemParametroRecord {
  id: string
  chave: string
  nome: string
  descricao?: string
  aliquota_percentual: number
  base_calculo?: string
  ordem?: number
  updated?: string
}

export interface MargemComparativoRecord {
  id: string
  produto: string
  cmv: number
  preco_rivoli: number
  ativo?: boolean
  ordem?: number
  created?: string
  updated?: string
}

/**
 * Busca todos os registros de produtos para o Comparativo de Margens GR.
 */
export async function getMargensComparativo(): Promise<MargemComparativoRecord[]> {
  const records = await pb
    .collection('margens_comparativo_gr')
    .getFullList<MargemComparativoRecord>({
      sort: 'ordem,produto',
    })
  return records
}

/**
 * Busca todos os parâmetros percentuais configurados.
 */
export async function getMargensParametros(): Promise<MargemParametroRecord[]> {
  const records = await pb.collection('margens_parametros_gr').getFullList<MargemParametroRecord>({
    sort: 'ordem,nome',
  })
  return records
}

/**
 * Converte a lista de parâmetros do banco para o objeto tipado MargemParametros.
 */
export function buildParametrosMap(records: MargemParametroRecord[]): MargemParametros {
  const params: MargemParametros = { ...PARAMETROS_DEFAULT }
  for (const r of records) {
    const aliq = Number(r.aliquota_percentual)
    if (Number.isFinite(aliq)) {
      switch (r.chave) {
        case 'icms':
          params.icmsPercentual = aliq
          break
        case 'pis':
          params.pisPercentual = aliq
          break
        case 'cofins':
          params.cofinsPercentual = aliq
          break
        case 'comissao':
          params.comissaoPercentual = aliq
          break
        case 'frete':
          params.fretePercentual = aliq
          break
      }
    }
  }
  return params
}

/**
 * Atualiza um único item do Comparativo.
 */
export async function updateMargemItem(
  id: string,
  data: Partial<Pick<MargemInputRow, 'cmv' | 'preco_rivoli' | 'produto' | 'ordem'>>,
): Promise<MargemComparativoRecord> {
  return await pb.collection('margens_comparativo_gr').update<MargemComparativoRecord>(id, data)
}

/**
 * Cria um novo item no comparativo.
 */
export async function createMargemItem(
  data: Pick<MargemInputRow, 'produto' | 'cmv' | 'preco_rivoli'> & { ordem?: number },
): Promise<MargemComparativoRecord> {
  return await pb.collection('margens_comparativo_gr').create<MargemComparativoRecord>(data)
}

/**
 * Remove um item do comparativo.
 */
export async function deleteMargemItem(id: string): Promise<boolean> {
  return await pb.collection('margens_comparativo_gr').delete(id)
}

/**
 * Atualiza um parâmetro de alíquota.
 */
export async function updateMargemParametro(
  id: string,
  aliquota_percentual: number,
): Promise<MargemParametroRecord> {
  return await pb
    .collection('margens_parametros_gr')
    .update<MargemParametroRecord>(id, { aliquota_percentual })
}

/**
 * Salva múltiplos itens modificados do comparativo em lote.
 */
export async function saveMultipleMargensItems(
  items: Array<{ id: string; cmv: number; preco_rivoli: number }>,
): Promise<void> {
  for (const item of items) {
    await pb.collection('margens_comparativo_gr').update(item.id, {
      cmv: item.cmv,
      preco_rivoli: item.preco_rivoli,
    })
  }
}

export interface ImportItemPayload {
  produto: string
  cmv: number
  preco_rivoli: number
  ordem?: number
  ativo?: boolean
}

export interface BatchImportResult {
  importados: number
  ignorados: number
  erros: Array<{ linha: number; produto: string; erro: string }>
}

/**
 * Remove todos os registros existentes da coleção margens_comparativo_gr.
 */
export async function clearAllMargensComparativo(): Promise<number> {
  const existing = await pb
    .collection('margens_comparativo_gr')
    .getFullList<{ id: string }>({ fields: 'id' })
  let deletedCount = 0
  for (const item of existing) {
    try {
      await pb.collection('margens_comparativo_gr').delete(item.id)
      deletedCount++
    } catch (err) {
      console.warn(`Erro ao excluir item ${item.id} na limpeza:`, err)
    }
  }
  return deletedCount
}

/**
 * Importa uma lista de itens em lote na coleção margens_comparativo_gr.
 * Suporta opção de substituir todos os registros existentes ou adicionar aos já cadastrados.
 */
export async function batchImportMargens(
  items: ImportItemPayload[],
  mode: 'replace' | 'append',
  onProgress?: (current: number, total: number) => void,
): Promise<BatchImportResult> {
  if (mode === 'replace') {
    await clearAllMargensComparativo()
  }

  let importados = 0
  const erros: Array<{ linha: number; produto: string; erro: string }> = []

  const total = items.length
  for (let i = 0; i < total; i++) {
    const item = items[i]
    try {
      await pb.collection('margens_comparativo_gr').create({
        produto: item.produto,
        cmv: item.cmv,
        preco_rivoli: item.preco_rivoli,
        ordem: item.ordem ?? i + 1,
        ativo: item.ativo ?? true,
      })
      importados++
    } catch (err) {
      erros.push({
        linha: i + 1,
        produto: item.produto,
        erro: err instanceof Error ? err.message : String(err),
      })
    }
    if (onProgress) {
      onProgress(i + 1, total)
    }
  }

  return {
    importados,
    ignorados: erros.length,
    erros,
  }
}
