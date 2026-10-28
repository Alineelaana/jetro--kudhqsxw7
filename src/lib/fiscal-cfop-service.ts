import pb from '@/lib/pocketbase/client'
import {
  FiscalOperation,
  FiscalCfopRule,
  DetermineCfopParams,
  DeterminationOutput,
  evaluateCfopMatrix,
} from './fiscal-cfop-engine'
import { validateFiscalCfopRules, CfopValidationReport } from './fiscal-cfop-validator'

/**
 * Serviço de Integração com PocketBase para CFOP e CGO
 */
/**
 * Atalhos auxiliares para resolução de CFOP a partir do serviço fiscal
 */
export async function resolveCfopByOperation(
  params: DetermineCfopParams,
): Promise<DeterminationOutput> {
  return fiscalCfopService.determineCfop(params)
}

export async function findMatchingCfop(params: DetermineCfopParams): Promise<string> {
  const result = await fiscalCfopService.determineCfop(params)
  if (result.itens && result.itens.length > 0 && result.itens[0].cfop) {
    return result.itens[0].cfop
  }
  return '5102'
}

export async function determineCfop(params: DetermineCfopParams): Promise<DeterminationOutput> {
  return fiscalCfopService.determineCfop(params)
}

export const fiscalCfopService = {
  /**
   * Busca todas as operações ativas (ou todas para administração)
   */
  async getOperations(empresaId?: string, apenasAtivas = false): Promise<FiscalOperation[]> {
    try {
      const filters: string[] = []
      if (apenasAtivas) filters.push('ativa = true')
      if (empresaId) {
        filters.push(`(empresa_id = "" || empresa_id = "${empresaId}")`)
      }
      const filterStr = filters.length > 0 ? filters.join(' && ') : undefined

      const records = await pb.collection('fiscal_operations').getFullList<FiscalOperation>({
        filter: filterStr,
        sort: 'codigo',
      })
      return records
    } catch (err) {
      console.error('Erro ao buscar operações fiscais:', err)
      return []
    }
  },

  /**
   * Busca as regras da matriz de CFOP
   */
  async getCfopRules(empresaId?: string, operacaoCodigo?: string): Promise<FiscalCfopRule[]> {
    try {
      const filters: string[] = []
      if (operacaoCodigo) {
        filters.push(`operacao_codigo = "${operacaoCodigo}"`)
      }
      if (empresaId) {
        filters.push(`(empresa_id = "" || empresa_id = "${empresaId}")`)
      }
      const filterStr = filters.length > 0 ? filters.join(' && ') : undefined

      const records = await pb.collection('fiscal_cfop_rules').getFullList<FiscalCfopRule>({
        filter: filterStr,
        sort: '-prioridade,operacao_codigo,cfop_resultado',
      })
      return records
    } catch (err) {
      console.error('Erro ao buscar regras da matriz de CFOP:', err)
      return []
    }
  },

  /**
   * Executa a resolução de CFOP usando os dados do banco
   */
  async determineCfop(params: DetermineCfopParams): Promise<DeterminationOutput> {
    const [operations, rules] = await Promise.all([
      this.getOperations(params.empresa_id, true),
      this.getCfopRules(params.empresa_id, params.operacao_codigo),
    ])

    // Determinação considera exclusivamente regras com ativo = true
    const activeRules = rules.filter((r) => r.ativa)

    return evaluateCfopMatrix(params, operations, activeRules)
  },

  /**
   * Registra uma exceção manual auditada quando autorizada por perfil gestor
   */
  async registerManualException(payload: {
    documento_tipo: string
    documento_id?: string
    empresa_id: string
    item_codigo?: string
    item_descricao?: string
    cfop_sugerido_matriz?: string
    regra_matriz_id?: string
    regra_versao?: number
    cfop_aplicado_manual: string
    justificativa: string
    autorizado_por_id: string
    autorizado_por_nome: string
    autorizado_por_perfil: string
  }) {
    return pb.collection('fiscal_rule_exceptions').create({
      ...payload,
      status: 'aprovada',
    })
  },

  /**
   * Validação fiscal de uma regra de exemplo didático
   */
  async validateRuleAsFiscal(ruleId: string, responsavelNome: string) {
    return pb.collection('fiscal_cfop_rules').update(ruleId, {
      validado_responsavel_fiscal: true,
      validado_por: responsavelNome,
      validado_em: new Date().toISOString(),
      is_exemplo_didatico: false,
    })
  },

  /**
   * Executa a auditoria e validação automática de consistência de todas as regras de CFOP
   */
  async runCfopRulesValidation(empresaId?: string): Promise<CfopValidationReport> {
    const [rules, ops] = await Promise.all([
      this.getCfopRules(empresaId),
      this.getOperations(empresaId),
    ])
    return validateFiscalCfopRules(rules, ops)
  },
}
