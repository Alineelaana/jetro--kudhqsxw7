/**
 * Motor de Validação Automática de Regras Fiscais de CFOP
 *
 * Categorias de validação / achados fiscais:
 * a) Código CFOP inexistente ou malformado (contra lista oficial 5.xxx, 6.xxx, 7.xxx)
 * b) Duplicidade de regras: duas regras ativas no mesmo escopo casam exatamente o mesmo item/operação/destino
 * c) Conflito de prioridade: regras de mesma prioridade no mesmo escopo sugerindo CFOPs diferentes
 * d) Incoerência origem x CFOP: regra 'producao_propria' apontando CFOP de revenda (ex: 5.102/6.102) e vice-versa
 * e) Incoerência destino x CFOP: 1º dígito incompatível com destino da regra (5=dentro_estado, 6=fora_estado, 7=exterior)
 * f) Vigências sobrepostas no mesmo escopo
 * g) Regras vencidas ainda ativas
 */

import { FiscalCfopRule, FiscalOperation } from './fiscal-cfop-engine'
import { OFFICIAL_OUTBOUND_CFOPS, normalizeCfopCode, formatCfopCode } from './fiscal-cfop-table'

export type ValidationSeverity = 'erro' | 'aviso' | 'info'

export type ValidationFindingCategory =
  | 'cfop_invalido' // Código CFOP inexistente ou malformado
  | 'duplicidade_regra' // Duas regras ativas que casam o mesmo escopo
  | 'conflito_prioridade' // Regras com mesma prioridade competindo
  | 'incoerencia_origem' // Produção própria com CFOP de revenda (ou vice-versa)
  | 'incoerencia_destino' // Primeiro dígito incompatível com o destino
  | 'vigencia_sobreposta' // Vigências sobrepostas no mesmo escopo
  | 'regra_vencida' // Regra vencida ainda ativa

export interface ValidationFinding {
  id: string
  categoria: ValidationFindingCategory
  categoriaLabel: string
  gravidade: ValidationSeverity
  titulo: string
  mensagem: string
  explicacaoFiscal: string
  regrasAfetadas: FiscalCfopRule[]
  cfopsRelacionados: string[]
  sugestaoAcao?: string
}

export interface CfopValidationReport {
  executadoEm: string
  totalRegrasAvaliadas: number
  totalRegrasAtivas: number
  totalAchados: number
  totalErros: number
  totalAvisos: number
  totalInfo: number
  is100PorcentoConsistente: boolean
  achados: ValidationFinding[]
  resumoPorCategoria: Record<ValidationFindingCategory, number>
}

/**
 * Normaliza datas para comparação YYYY-MM-DD
 */
function cleanDate(d?: string): string | null {
  if (!d) return null
  const match = d.match(/^\d{4}-\d{2}-\d{2}/)
  return match ? match[0] : null
}

/**
 * Verifica se dois intervalos de vigência se sobrepõem
 */
function vigenciasOverlap(iniA?: string, fimA?: string, iniB?: string, fimB?: string): boolean {
  const startA = cleanDate(iniA) || '1900-01-01'
  const endA = cleanDate(fimA) || '9999-12-31'
  const startB = cleanDate(iniB) || '1900-01-01'
  const endB = cleanDate(fimB) || '9999-12-31'

  return startA <= endB && endA >= startB
}

/**
 * Validador principal da Matriz de Regras de CFOP
 */
export function validateFiscalCfopRules(
  rules: FiscalCfopRule[],
  operations: FiscalOperation[] = [],
  dataReferencia: string = new Date().toISOString().slice(0, 10),
): CfopValidationReport {
  const findings: ValidationFinding[] = []
  let findingCounter = 1

  const addFinding = (finding: Omit<ValidationFinding, 'id'>) => {
    findings.push({
      id: `achado_${findingCounter++}`,
      ...finding,
    })
  }

  const opsMap = new Map<string, FiscalOperation>()
  operations.forEach((op) => opsMap.set(op.codigo.toUpperCase(), op))

  const activeRules = rules.filter((r) => r.ativa)

  // -------------------------------------------------------------
  // a) CFOP inexistente ou malformado
  // -------------------------------------------------------------
  rules.forEach((rule) => {
    const rawCode = rule.cfop_resultado || ''
    const cleanCode = normalizeCfopCode(rawCode)

    if (cleanCode.length !== 4) {
      addFinding({
        categoria: 'cfop_invalido',
        categoriaLabel: 'Código CFOP Inexistente ou Malformado',
        gravidade: 'erro',
        titulo: `CFOP '${rawCode || 'vazio'}' malformado (deve ter 4 dígitos)`,
        mensagem: `A regra ${rule.id} para a operação '${rule.operacao_codigo}' possui CFOP com formato inválido ('${rawCode}').`,
        explicacaoFiscal:
          'A legislação tributária brasileira (Convênio S/Nº de 1970 e Ajustes SINIEF) exige estritamente 4 dígitos numéricos para identificação de operações fiscais.',
        regrasAfetadas: [rule],
        cfopsRelacionados: [rawCode],
        sugestaoAcao:
          'Corrija o código para exatamente 4 dígitos da tabela oficial da Receita Federal.',
      })
      return
    }

    const firstDigit = cleanCode[0]
    if (!['5', '6', '7'].includes(firstDigit)) {
      addFinding({
        categoria: 'cfop_invalido',
        categoriaLabel: 'Código CFOP Inexistente ou Malformado',
        gravidade: 'erro',
        titulo: `CFOP '${cleanCode}' não é de saída (Grupo ${firstDigit})`,
        mensagem: `A regra ${rule.id} aponta o CFOP '${formatCfopCode(cleanCode)}'. CFOPs que iniciam com 1, 2 ou 3 são de ENTRADA no estabelecimento e nunca podem ser emitidos em notas de saída.`,
        explicacaoFiscal:
          'Na Matriz de CFOP de faturamento, apenas os grupos 5 (saídas internas), 6 (saídas interestaduais) e 7 (exportações para o exterior) são permitidos pela SEFAZ.',
        regrasAfetadas: [rule],
        cfopsRelacionados: [cleanCode],
        sugestaoAcao: 'Altere para o CFOP de saída equivalente (iniciando em 5, 6 ou 7).',
      })
      return
    }

    const official = OFFICIAL_OUTBOUND_CFOPS[cleanCode]
    if (!official) {
      addFinding({
        categoria: 'cfop_invalido',
        categoriaLabel: 'Código CFOP Inexistente ou Malformado',
        gravidade: 'aviso',
        titulo: `CFOP '${formatCfopCode(cleanCode)}' não listado no catálogo padrão`,
        mensagem: `O CFOP ${formatCfopCode(cleanCode)} não consta no catálogo padrão das operações mais comuns da Receita Federal.`,
        explicacaoFiscal:
          'Verifique se o código é uma figura especial permitida pelo Regulamento do ICMS do seu Estado ou se houve digitação incorreta.',
        regrasAfetadas: [rule],
        cfopsRelacionados: [cleanCode],
        sugestaoAcao:
          'Confirme com a contabilidade se este CFOP existe na Tabela da SEFAZ para sua atividade econômica.',
      })
    }
  })

  // -------------------------------------------------------------
  // d) Incoerência Origem x CFOP (SEFAZ-SP e SEFAZ-ES multam)
  // Ex: producao_propria apontando 5.102 / 6.102 ou mercadoria_terceiros apontando 5.101 / 6.101
  // -------------------------------------------------------------
  const cfopsProducaoPropriaConhecidos = new Set([
    '5101',
    '6101',
    '7101',
    '5103',
    '6103',
    '5105',
    '6105',
    '5109',
    '6109',
    '5116',
    '6116',
    '5151',
    '6151',
    '5401',
    '6401',
    '5402',
  ])

  const cfopsRevendaTerceirosConhecidos = new Set([
    '5102',
    '6102',
    '7102',
    '5104',
    '6104',
    '5106',
    '6106',
    '5110',
    '6110',
    '5117',
    '6117',
    '5152',
    '6152',
    '5403',
    '6403',
    '5404',
    '6404',
    '5405',
  ])

  rules.forEach((rule) => {
    const cleanCode = normalizeCfopCode(rule.cfop_resultado)
    const proc = rule.procedencia_item

    // Produção própria com CFOP de revenda
    if (proc === 'producao_propria' && cfopsRevendaTerceirosConhecidos.has(cleanCode)) {
      addFinding({
        categoria: 'incoerencia_origem',
        categoriaLabel: 'Incoerência Origem x CFOP',
        gravidade: 'erro',
        titulo: `Produção Própria apontando CFOP de Revenda de Terceiros (${formatCfopCode(cleanCode)})`,
        mensagem: `A regra para ${rule.operacao_codigo} está marcada como 'Produção do Estabelecimento', porém o CFOP resultante ${formatCfopCode(cleanCode)} é exclusivo de mercadorias adquiridas de terceiros.`,
        explicacaoFiscal:
          'ERRO BLOQUEANTE / RISCO DE AUTUAÇÃO SEFAZ: Venda de produto industrializado pela fábrica emitida como 5.102/6.102 gera autuação fiscal por omissão de receita industrial e cálculo incorreto de créditos de insumos.',
        regrasAfetadas: [rule],
        cfopsRelacionados: [cleanCode],
        sugestaoAcao:
          'Altere o CFOP para 5.101 / 6.101 (produção própria) ou corrija a procedência da regra para mercadoria de terceiros.',
      })
    }

    // Mercadoria de terceiros com CFOP de produção própria
    if (proc === 'mercadoria_terceiros' && cfopsProducaoPropriaConhecidos.has(cleanCode)) {
      addFinding({
        categoria: 'incoerencia_origem',
        categoriaLabel: 'Incoerência Origem x CFOP',
        gravidade: 'erro',
        titulo: `Revenda de Terceiros apontando CFOP de Produção Própria (${formatCfopCode(cleanCode)})`,
        mensagem: `A regra para ${rule.operacao_codigo} está marcada como 'Mercadoria de Terceiros (Revenda)', porém o CFOP ${formatCfopCode(cleanCode)} é exclusivo de fabricação própria.`,
        explicacaoFiscal:
          'ERRO BLOQUEANTE / RISCO DE AUTUAÇÃO SEFAZ: Revenda de mercadoria comprada de terceiro emitida como 5.101/6.101 presume atividade industrial indevida e gera cobrança indevida de IPI além de distorcer o SPED Fiscal.',
        regrasAfetadas: [rule],
        cfopsRelacionados: [cleanCode],
        sugestaoAcao:
          'Altere o CFOP para 5.102 / 6.102 (revenda de terceiros) ou corrija a procedência da regra para produção própria.',
      })
    }
  })

  // -------------------------------------------------------------
  // e) Incoerência Destino x CFOP
  // Primeiro dígito incompatível com o destino da regra (5=dentro, 6=fora, 7=exterior)
  // -------------------------------------------------------------
  rules.forEach((rule) => {
    const cleanCode = normalizeCfopCode(rule.cfop_resultado)
    if (cleanCode.length !== 4) return
    const firstDigit = cleanCode[0]
    const dest = rule.destino_tipo

    if (dest === 'dentro_estado' && firstDigit !== '5') {
      addFinding({
        categoria: 'incoerencia_destino',
        categoriaLabel: 'Incoerência Destino x CFOP',
        gravidade: 'erro',
        titulo: `Destino Interno (Dentro do Estado) com CFOP Grupo ${firstDigit} (${formatCfopCode(cleanCode)})`,
        mensagem: `A regra está parametrizada com Destino 'Dentro do Estado', mas o CFOP ${formatCfopCode(cleanCode)} pertence ao Grupo ${firstDigit} (${firstDigit === '6' ? 'Interestadual' : 'Exterior'}).`,
        explicacaoFiscal:
          'REJEIÇÃO SEFAZ (Rejeição 523/524): A SEFAZ rejeita a autorização da NF-e quando a UF do destinatário é igual à do emitente e o CFOP inicia com 6 ou 7.',
        regrasAfetadas: [rule],
        cfopsRelacionados: [cleanCode],
        sugestaoAcao: `Substitua pelo CFOP do Grupo 5 equivalente (ex: 5${cleanCode.slice(1)}).`,
      })
    }

    if (dest === 'fora_estado' && firstDigit !== '6') {
      addFinding({
        categoria: 'incoerencia_destino',
        categoriaLabel: 'Incoerência Destino x CFOP',
        gravidade: 'erro',
        titulo: `Destino Fora do Estado (Interestadual) com CFOP Grupo ${firstDigit} (${formatCfopCode(cleanCode)})`,
        mensagem: `A regra está parametrizada com Destino 'Fora do Estado (Interestadual)', mas o CFOP ${formatCfopCode(cleanCode)} inicia com dígito ${firstDigit}.`,
        explicacaoFiscal:
          'REJEIÇÃO SEFAZ (Rejeição 521/522): A SEFAZ rejeita notas com UF destinatário diferente da UF emitente quando o CFOP inicia com 5 ou 7.',
        regrasAfetadas: [rule],
        cfopsRelacionados: [cleanCode],
        sugestaoAcao: `Substitua pelo CFOP do Grupo 6 equivalente (ex: 6${cleanCode.slice(1)}).`,
      })
    }

    if (dest === 'exterior' && firstDigit !== '7') {
      addFinding({
        categoria: 'incoerencia_destino',
        categoriaLabel: 'Incoerência Destino x CFOP',
        gravidade: 'erro',
        titulo: `Destino Exterior (Exportação) com CFOP Grupo ${firstDigit} (${formatCfopCode(cleanCode)})`,
        mensagem: `A regra está parametrizada com Destino 'Exterior', mas o CFOP ${formatCfopCode(cleanCode)} não inicia com 7.`,
        explicacaoFiscal:
          'REJEIÇÃO SEFAZ: Operações de exportação (UF "EX") exigem estritamente CFOPs iniciados por 7 (Grupo 7.xxx).',
        regrasAfetadas: [rule],
        cfopsRelacionados: [cleanCode],
        sugestaoAcao: `Substitua pelo CFOP do Grupo 7 equivalente (ex: 7${cleanCode.slice(1)}).`,
      })
    }
  })

  // -------------------------------------------------------------
  // g) Regras vencidas ainda ativas
  // -------------------------------------------------------------
  rules.forEach((rule) => {
    if (!rule.ativa) return
    const fim = cleanDate(rule.vigencia_fim)
    if (fim && fim < dataReferencia) {
      addFinding({
        categoria: 'regra_vencida',
        categoriaLabel: 'Regras Vencidas Ainda Ativas',
        gravidade: 'aviso',
        titulo: `Regra CFOP ${formatCfopCode(rule.cfop_resultado)} com vigência expirada (${fim})`,
        mensagem: `A regra ${rule.id} para '${rule.operacao_codigo}' possui vigência final em ${fim}, anterior à data de referência (${dataReferencia}), mas continua marcada como ativa.`,
        explicacaoFiscal:
          'Regras expiradas não devem competir na matriz ativa. Podem causar rejeição de notas ou confusão operacional caso não haja substituta parametrizada.',
        regrasAfetadas: [rule],
        cfopsRelacionados: [rule.cfop_resultado],
        sugestaoAcao:
          'Inative a regra formalmente ou prorrogue a data de vigência final se a operação continuar válida.',
      })
    }
  })

  // -------------------------------------------------------------
  // b) Duplicidade de regras e c) Conflito de prioridade e f) Vigências sobrepostas
  // Agrupar regras ativas pelo mesmo escopo de negócio
  // Escopo: empresa_id + filial_id + operacao_codigo + procedencia_item + destino_tipo + uf_origem + uf_destino
  // -------------------------------------------------------------
  const scopeMap = new Map<string, FiscalCfopRule[]>()

  activeRules.forEach((rule) => {
    // Normalizar escopo
    const emp = rule.empresa_id || '*'
    const fil = rule.filial_id || '*'
    const op = rule.operacao_codigo.toUpperCase()
    const proc = rule.procedencia_item
    const dest = rule.destino_tipo
    const ufOrig = (rule.uf_origem || '*').toUpperCase()
    const ufDest = (rule.uf_destino || '*').toUpperCase()

    const scopeKey = `${emp}|${fil}|${op}|${proc}|${dest}|${ufOrig}|${ufDest}`
    if (!scopeMap.has(scopeKey)) {
      scopeMap.set(scopeKey, [])
    }
    scopeMap.get(scopeKey)!.push(rule)
  })

  scopeMap.forEach((scopedRules, scopeKey) => {
    if (scopedRules.length <= 1) return

    // Comparar aos pares dentro do mesmo escopo
    for (let i = 0; i < scopedRules.length; i++) {
      for (let j = i + 1; j < scopedRules.length; j++) {
        const r1 = scopedRules[i]
        const r2 = scopedRules[j]

        // Verificar se há sobreposição de vigência
        const hasVigenciaOverlap = vigenciasOverlap(
          r1.vigencia_inicio,
          r1.vigencia_fim,
          r2.vigencia_inicio,
          r2.vigencia_fim,
        )

        if (!hasVigenciaOverlap) continue

        const cfop1 = normalizeCfopCode(r1.cfop_resultado)
        const cfop2 = normalizeCfopCode(r2.cfop_resultado)
        const prio1 = Number(r1.prioridade || 0)
        const prio2 = Number(r2.prioridade || 0)

        // b) Duplicidade exata de regras (mesmo CFOP ou escopo redundante)
        if (cfop1 === cfop2) {
          addFinding({
            categoria: 'duplicidade_regra',
            categoriaLabel: 'Duplicidade de Regras Fiscais',
            gravidade: 'aviso',
            titulo: `Duas regras ativas idênticas para CFOP ${formatCfopCode(cfop1)} no mesmo escopo`,
            mensagem: `Existem duas regras ativas configuradas para a operação '${r1.operacao_codigo}', procedência '${r1.procedencia_item}' e destino '${r1.destino_tipo}' apontando o mesmo CFOP ${formatCfopCode(cfop1)}.`,
            explicacaoFiscal:
              'Regras redundantes no mesmo escopo não quebram o cálculo, mas geram ruído cadastral e dificultam a manutenção e governança tributária.',
            regrasAfetadas: [r1, r2],
            cfopsRelacionados: [cfop1],
            sugestaoAcao: 'Inative ou exclua a regra redundante para manter a matriz limpa.',
          })
        } else {
          // CFOPs diferentes no mesmo escopo com vigência sobreposta
          // c) Conflito de prioridade: prioridade igual -> AMBIGUIDADE BLOQUEANTE
          if (prio1 === prio2) {
            addFinding({
              categoria: 'conflito_prioridade',
              categoriaLabel: 'Conflito de Prioridade (Ambiguidade)',
              gravidade: 'erro',
              titulo: `Conflito de Prioridade: CFOP ${formatCfopCode(cfop1)} vs ${formatCfopCode(cfop2)} (Prioridade ${prio1})`,
              mensagem: `As regras competem no mesmo escopo (${r1.operacao_codigo} + ${r1.procedencia_item} + ${r1.destino_tipo}) com a mesma prioridade (${prio1}), sugerindo CFOPs divergentes (${formatCfopCode(cfop1)} e ${formatCfopCode(cfop2)}).`,
              explicacaoFiscal:
                'BLOQUEIO ESTRITO DE AMBIGUIDADE HURAM: O motor de emissão de NF-e bloqueia faturamentos neste escopo para impedir que o sistema adote um CFOP incorreto por arbitrariedade aleatória.',
              regrasAfetadas: [r1, r2],
              cfopsRelacionados: [cfop1, cfop2],
              sugestaoAcao: `Defina prioridades diferentes (ex: ${Math.max(prio1, prio2) + 10} para a regra de maior precedência).`,
            })
          } else {
            // f) Vigências sobrepostas no mesmo escopo (mesmo com prioridades diferentes, é recomendável alertar)
            addFinding({
              categoria: 'vigencia_sobreposta',
              categoriaLabel: 'Vigências Sobrepostas no Mesmo Escopo',
              gravidade: 'info',
              titulo: `Regras sobrepostas no mesmo escopo: ${formatCfopCode(cfop1)} (Prio ${prio1}) sobrepõe ${formatCfopCode(cfop2)} (Prio ${prio2})`,
              mensagem: `Duas regras ativas para '${r1.operacao_codigo}' possuem vigências coincidentes. A regra de prioridade ${Math.max(prio1, prio2)} vencerá o desempate automaticamente.`,
              explicacaoFiscal:
                'O motor aplicará a regra de maior pontuação. Se uma regra veio para substituir a outra por mudança de legislação, recomenda-se preencher a vigência final da regra anterior.',
              regrasAfetadas: [r1, r2],
              cfopsRelacionados: [cfop1, cfop2],
              sugestaoAcao:
                'Se uma regra substitui a outra, preencha a vigência fim na regra antiga.',
            })
          }
        }
      }
    }
  })

  // -------------------------------------------------------------
  // Totais e Indicador de 100% Consistente
  // -------------------------------------------------------------
  const totalErros = findings.filter((f) => f.gravidade === 'erro').length
  const totalAvisos = findings.filter((f) => f.gravidade === 'aviso').length
  const totalInfo = findings.filter((f) => f.gravidade === 'info').length

  const resumoPorCategoria: Record<ValidationFindingCategory, number> = {
    cfop_invalido: 0,
    duplicidade_regra: 0,
    conflito_prioridade: 0,
    incoerencia_origem: 0,
    incoerencia_destino: 0,
    vigencia_sobreposta: 0,
    regra_vencida: 0,
  }

  findings.forEach((f) => {
    resumoPorCategoria[f.categoria] = (resumoPorCategoria[f.categoria] || 0) + 1
  })

  return {
    executadoEm: new Date().toISOString(),
    totalRegrasAvaliadas: rules.length,
    totalRegrasAtivas: activeRules.length,
    totalAchados: findings.length,
    totalErros,
    totalAvisos,
    totalInfo,
    is100PorcentoConsistente: totalErros === 0,
    achados: findings,
    resumoPorCategoria,
  }
}
