/**
 * Motor de Determinação de CFOP por Item - Arquitetura HURAM
 *
 * Camadas:
 * 1. Grupo Gerencial (Vendas, Devoluções, Transferências, Perdas, Remessas)
 * 2. Operação de Negócio / CGO (Venda Normal, Bonificação, etc.)
 * 3. Matriz Fiscal (Resolução por item cruzando emitente, procedência, destino e vigência)
 *
 * Regras Obrigatórias:
 * - Resolução POR ITEM
 * - Explicação transparente da regra usada
 * - Bloqueio estrito de ambiguidade (conflito ou ausência)
 * - Multiempresa: procedência relativa à empresa emitente (fabricação própria vs revenda de terceiros)
 * - Rastreabilidade: gravação da versão e id da regra aplicada
 * - Imutabilidade: documentos emitidos/anteriores nunca são recalculados por mudança cadastral
 */

export interface FiscalOperation {
  id: string
  codigo: string
  nome: string
  grupo_gerencial: 'vendas' | 'devolucoes' | 'transferencias' | 'perdas' | 'remessas' | 'outros'
  descricao?: string
  empresa_id?: string
  filial_id?: string
  efeito_estoque?: 'baixa' | 'entrada' | 'nenhum' | 'reserva'
  efeito_financeiro?: 'gera_receber' | 'gera_pagar' | 'nenhum'
  efeito_comissao?: boolean
  efeito_contabilizacao?: string
  movimento_comercial?: boolean
  finalidade_nfe?: '1' | '2' | '3' | '4'
  ativa: boolean
}

export interface FiscalCfopRule {
  id: string
  operacao_codigo: string
  empresa_id?: string
  filial_id?: string
  procedencia_item: 'producao_propria' | 'mercadoria_terceiros' | 'materia_prima' | 'qualquer'
  destino_tipo: 'dentro_estado' | 'fora_estado' | 'exterior' | 'qualquer'
  uf_origem?: string
  uf_destino?: string
  cfop_resultado: string
  descricao_cfop?: string
  cst_padrao?: string
  prioridade?: number
  vigencia_inicio?: string
  vigencia_fim?: string
  ativa: boolean
  versao?: number
  explicacao_padrao?: string
  is_exemplo_didatico?: boolean
  validado_responsavel_fiscal?: boolean
  validado_por?: string
  validado_em?: string
  observacoes?: string
}

export interface DetermineCfopInputItem {
  item_id?: string
  codigo?: string
  descricao?: string
  /**
   * Procedência do item para a empresa emitente específica.
   * Ex: No Gran Romano o produto é 'producao_propria'; na Dec Eldorado o mesmo produto é 'mercadoria_terceiros'.
   */
  procedencia?: 'producao_propria' | 'mercadoria_terceiros' | 'materia_prima'
  quantidade?: number
  valor_unitario?: number
}

export interface DetermineCfopParams {
  operacao_codigo: string
  empresa_id?: string
  uf_emitente?: string
  uf_destinatario?: string
  is_exterior?: boolean
  data_competencia?: string // YYYY-MM-DD (defaults to today)
  itens: DetermineCfopInputItem[]
}

export interface ItemDeterminationResult {
  item_id?: string
  codigo?: string
  descricao?: string
  procedencia_usada: string
  destino_classificado: 'dentro_estado' | 'fora_estado' | 'exterior'
  cfop: string | null
  descricao_cfop?: string
  cst_padrao?: string
  regra_id?: string
  regra_versao?: number
  prioridade?: number
  is_exemplo_didatico?: boolean
  validado_fiscal?: boolean
  status: 'sucesso' | 'ambiguidade_conflito' | 'regra_nao_encontrada'
  explicacao: string
  regras_conflitantes?: FiscalCfopRule[]
}

export interface DeterminationOutput {
  sucesso: boolean
  operacao: FiscalOperation | null
  total_itens: number
  total_resolvidos: number
  tem_bloqueio: boolean
  motivo_bloqueio?: string
  itens: ItemDeterminationResult[]
}

/**
 * Classifica se a operação é interna (mesmo estado), interestadual ou exterior
 */
export function classifyDestination(
  ufOrigem?: string,
  ufDestino?: string,
  isExterior?: boolean,
): 'dentro_estado' | 'fora_estado' | 'exterior' {
  if (isExterior) return 'exterior'
  if (!ufOrigem || !ufDestino) return 'dentro_estado'
  const orig = ufOrigem.trim().toUpperCase()
  const dest = ufDestino.trim().toUpperCase()
  if (dest === 'EX') return 'exterior'
  return orig === dest ? 'dentro_estado' : 'fora_estado'
}

/**
 * Valida se a regra está vigente na data informada
 */
export function isRuleInVigency(rule: FiscalCfopRule, dateStr: string): boolean {
  if (!rule.ativa) return false
  const target = dateStr.slice(0, 10)
  if (rule.vigencia_inicio && target < rule.vigencia_inicio.slice(0, 10)) {
    return false
  }
  if (rule.vigencia_fim && target > rule.vigencia_fim.slice(0, 10)) {
    return false
  }
  return true
}

/**
 * Calcula a pontuação de especificidade de uma regra para desempate / ordenação
 * - Regra com empresa específica ganha +100
 * - Regra com UF destino específica ganha +50
 * - Regra com procedência exata ganha +20
 * - Prioridade cadastrada adiciona seu valor numérico
 */
function calculateRuleWeight(rule: FiscalCfopRule, empresaId?: string, ufDestino?: string): number {
  let score = Number(rule.prioridade || 0)

  // Escopo de empresa: regra específica da empresa tem precedência sobre compartilhada
  if (rule.empresa_id && empresaId && rule.empresa_id === empresaId) {
    score += 1000
  } else if (!rule.empresa_id) {
    score += 100 // regra compartilhada
  }

  // UF específica
  if (rule.uf_destino && ufDestino && rule.uf_destino.toUpperCase() === ufDestino.toUpperCase()) {
    score += 200
  }

  // Procedência específica vs 'qualquer'
  if (rule.procedencia_item && rule.procedencia_item !== 'qualquer') {
    score += 50
  }

  return score
}

/**
 * Motor de Avaliação: Resolve o CFOP para a lista de itens
 */
export function evaluateCfopMatrix(
  params: DetermineCfopParams,
  availableOperations: FiscalOperation[],
  availableRules: FiscalCfopRule[],
): DeterminationOutput {
  const {
    operacao_codigo,
    empresa_id,
    uf_emitente = 'SP',
    uf_destinatario = 'SP',
    is_exterior = false,
    data_competencia = new Date().toISOString().slice(0, 10),
    itens,
  } = params

  // 1. Localizar a Operação de Negócio (Camada 2)
  const operacao =
    availableOperations.find(
      (op) =>
        op.codigo.toUpperCase() === operacao_codigo.toUpperCase() &&
        op.ativa &&
        (!op.empresa_id || !empresa_id || op.empresa_id === empresa_id),
    ) || null

  const destinoClassificado = classifyDestination(uf_emitente, uf_destinatario, is_exterior)

  if (!operacao) {
    return {
      sucesso: false,
      operacao: null,
      total_itens: itens.length,
      total_resolvidos: 0,
      tem_bloqueio: true,
      motivo_bloqueio: `Operação de negócio '${operacao_codigo}' não encontrada ou inativa para esta empresa.`,
      itens: itens.map((it) => ({
        item_id: it.item_id,
        codigo: it.codigo,
        descricao: it.descricao,
        procedencia_usada: it.procedencia || 'desconhecida',
        destino_classificado: destinoClassificado,
        cfop: null,
        status: 'regra_nao_encontrada',
        explicacao: `Operação de negócio '${operacao_codigo}' inválida ou não configurada.`,
      })),
    }
  }

  // 2. Filtrar regras vigentes e compatíveis com a operação e empresa
  const candidateRules = availableRules.filter((r) => {
    if (!r.ativa) return false
    if (r.operacao_codigo.toUpperCase() !== operacao.codigo.toUpperCase()) return false
    if (!isRuleInVigency(r, data_competencia)) return false

    // Multiempresa: se a regra tem empresa_id, deve coincidir. Se vazia, é modelo compartilhado.
    if (r.empresa_id && empresa_id && r.empresa_id !== empresa_id) return false

    // Destino tipo
    if (r.destino_tipo !== 'qualquer' && r.destino_tipo !== destinoClassificado) return false

    // UF destino específica se informada na regra
    if (r.uf_destino && uf_destinatario) {
      if (r.uf_destino.toUpperCase() !== uf_destinatario.toUpperCase()) return false
    }

    // UF origem se informada na regra
    if (r.uf_origem && uf_emitente) {
      if (r.uf_origem.toUpperCase() !== uf_emitente.toUpperCase()) return false
    }

    return true
  })

  let hasBlock = false
  let blockReason = ''
  let countResolved = 0

  const resolvedItens: ItemDeterminationResult[] = itens.map((item) => {
    // Multiempresa: Procedência do item para ESTA empresa
    // Padrão seguro se não informado: 'mercadoria_terceiros' para distribuidores ou 'producao_propria' para fábricas
    const proc = item.procedencia || 'mercadoria_terceiros'

    // Filtrar candidatos para a procedência do item
    const matching = candidateRules.filter((r) => {
      if (r.procedencia_item === 'qualquer') return true
      return r.procedencia_item === proc
    })

    if (matching.length === 0) {
      hasBlock = true
      blockReason = `Item '${item.descricao || item.codigo || 'S/N'}': Nenhuma regra de CFOP encontrada para a operação '${operacao.nome}', procedência '${proc}' e destino '${destinoClassificado}'. Emissão impedida.`
      return {
        item_id: item.item_id,
        codigo: item.codigo,
        descricao: item.descricao,
        procedencia_usada: proc,
        destino_classificado: destinoClassificado,
        cfop: null,
        status: 'regra_nao_encontrada',
        explicacao: `BLOQUEIO DE AMBIGUIDADE: Nenhuma regra cadastrada na matriz fiscal para ${operacao.nome} + ${proc} + ${destinoClassificado}.`,
      }
    }

    // Ordenar por score de especificidade
    const scored = matching.map((r) => ({
      rule: r,
      weight: calculateRuleWeight(r, empresa_id, uf_destinatario),
    }))
    scored.sort((a, b) => b.weight - a.weight)

    const topWeight = scored[0].weight
    const topMatches = scored.filter((s) => s.weight === topWeight)

    // Detecção de ambiguidade / conflito de regras
    // Se há múltiplas regras no mesmo nível máximo de especificidade propondo CFOPs DIFERENTES
    const distinctCfops = Array.from(new Set(topMatches.map((s) => s.rule.cfop_resultado)))

    if (distinctCfops.length > 1) {
      hasBlock = true
      blockReason = `Item '${item.descricao || item.codigo || 'S/N'}': Conflito de regras fiscais com mesma prioridade propondo CFOPs distintos (${distinctCfops.join(', ')}). Corrija as prioridades na Matriz de CFOP.`
      return {
        item_id: item.item_id,
        codigo: item.codigo,
        descricao: item.descricao,
        procedencia_usada: proc,
        destino_classificado: destinoClassificado,
        cfop: null,
        status: 'ambiguidade_conflito',
        regras_conflitantes: topMatches.map((m) => m.rule),
        explicacao: `BLOQUEIO DE AMBIGUIDADE: Conflito entre ${topMatches.length} regras de mesma prioridade sugerindo CFOPs diferentes (${distinctCfops.join(', ')}).`,
      }
    }

    // Regra vencedora
    const chosen = topMatches[0].rule
    countResolved++

    // Montar explicação detalhada e auditável
    const procLabel =
      proc === 'producao_propria'
        ? 'produção própria do estabelecimento'
        : proc === 'mercadoria_terceiros'
          ? 'mercadoria adquirida de terceiros (revenda)'
          : 'matéria-prima'

    const destLabel =
      destinoClassificado === 'dentro_estado'
        ? `destino interno (${uf_destinatario})`
        : destinoClassificado === 'fora_estado'
          ? `interestadual (${uf_emitente} → ${uf_destinatario})`
          : 'exportação / exterior'

    const scopeLabel = chosen.empresa_id ? 'regra específica da empresa' : 'modelo compartilhado'

    const explanation =
      chosen.explicacao_padrao ||
      `CFOP ${chosen.cfop_resultado} — ${procLabel}, nesta empresa (${scopeLabel}), ${destLabel}. Operação: ${operacao.nome}.`

    return {
      item_id: item.item_id,
      codigo: item.codigo,
      descricao: item.descricao,
      procedencia_usada: proc,
      destino_classificado: destinoClassificado,
      cfop: chosen.cfop_resultado,
      descricao_cfop: chosen.descricao_cfop,
      cst_padrao: chosen.cst_padrao,
      regra_id: chosen.id,
      regra_versao: chosen.versao || 1,
      prioridade: chosen.prioridade,
      is_exemplo_didatico: Boolean(chosen.is_exemplo_didatico),
      validado_fiscal: Boolean(chosen.validado_responsavel_fiscal),
      status: 'sucesso',
      explicacao: explanation,
    }
  })

  return {
    sucesso: !hasBlock && countResolved === itens.length,
    operacao,
    total_itens: itens.length,
    total_resolvidos: countResolved,
    tem_bloqueio: hasBlock,
    motivo_bloqueio: hasBlock ? blockReason : undefined,
    itens: resolvedItens,
  }
}
