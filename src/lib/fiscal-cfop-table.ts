/**
 * Tabela Oficial de CFOPs de Saída (Convênio S/Nº de 1970 / Ajustes SINIEF / Receita Federal / SEFAZ)
 * Inclui os principais CFOPs de Saída para o comércio e indústria (Grupos 5.xxx, 6.xxx e 7.xxx).
 */

export interface OfficialCfopInfo {
  codigo: string // 4 dígitos sem ponto (ex: '5101')
  formatado: string // '5.101'
  descricao: string
  grupo: '5' | '6' | '7' // 5 = Estadual / Interno, 6 = Interestadual, 7 = Exterior
  tipoOperacao: 'venda' | 'remessa' | 'devolucao' | 'transferencia' | 'retorno' | 'outros'
  natureza: 'producao_propria' | 'mercadoria_terceiros' | 'materia_prima' | 'indiferente'
  detalhesLegislacao?: string
}

export const OFFICIAL_OUTBOUND_CFOPS: Record<string, OfficialCfopInfo> = {
  // --- GRUPO 5: OPERAÇÕES DENTRO DO ESTADO (INTERNAS) ---
  '5101': {
    codigo: '5101',
    formatado: '5.101',
    descricao: 'Venda de produção do estabelecimento',
    grupo: '5',
    tipoOperacao: 'venda',
    natureza: 'producao_propria',
    detalhesLegislacao:
      'Classificam-se neste código as vendas de produtos industrializados pelo próprio estabelecimento.',
  },
  '5102': {
    codigo: '5102',
    formatado: '5.102',
    descricao: 'Venda de mercadoria adquirida ou recebida de terceiros',
    grupo: '5',
    tipoOperacao: 'venda',
    natureza: 'mercadoria_terceiros',
    detalhesLegislacao:
      'Classificam-se neste código as vendas de mercadorias adquiridas de terceiros para revenda, que não tenham passado por processo de industrialização no estabelecimento.',
  },
  '5103': {
    codigo: '5103',
    formatado: '5.103',
    descricao: 'Venda de produção do estabelecimento efetuada fora do estabelecimento',
    grupo: '5',
    tipoOperacao: 'venda',
    natureza: 'producao_propria',
    detalhesLegislacao:
      'Vendas de produtos industrializados pelo estabelecimento efetuadas em feiras, ambulantes ou depósitos fechados.',
  },
  '5104': {
    codigo: '5104',
    formatado: '5.104',
    descricao:
      'Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento',
    grupo: '5',
    tipoOperacao: 'venda',
    natureza: 'mercadoria_terceiros',
    detalhesLegislacao:
      'Vendas de mercadorias adquiridas de terceiros para revenda realizadas fora do estabelecimento.',
  },
  '5105': {
    codigo: '5105',
    formatado: '5.105',
    descricao: 'Venda de produção do estabelecimento que não deva por ele transitar',
    grupo: '5',
    tipoOperacao: 'venda',
    natureza: 'producao_propria',
  },
  '5106': {
    codigo: '5106',
    formatado: '5.106',
    descricao:
      'Venda de mercadoria adquirida ou recebida de terceiros, que não deva por ele transitar',
    grupo: '5',
    tipoOperacao: 'venda',
    natureza: 'mercadoria_terceiros',
  },
  '5109': {
    codigo: '5109',
    formatado: '5.109',
    descricao:
      'Venda de produção do estabelecimento destinada à Zona Franca de Manaus ou Áreas de Livre Comércio',
    grupo: '5',
    tipoOperacao: 'venda',
    natureza: 'producao_propria',
  },
  '5110': {
    codigo: '5110',
    formatado: '5.110',
    descricao:
      'Venda de mercadoria adquirida de terceiros destinada à Zona Franca de Manaus ou ALC',
    grupo: '5',
    tipoOperacao: 'venda',
    natureza: 'mercadoria_terceiros',
  },
  '5116': {
    codigo: '5116',
    formatado: '5.116',
    descricao: 'Venda de produção do estabelecimento originada de encomenda para entrega futura',
    grupo: '5',
    tipoOperacao: 'venda',
    natureza: 'producao_propria',
  },
  '5117': {
    codigo: '5117',
    formatado: '5.117',
    descricao:
      'Venda de mercadoria adquirida de terceiros, originada de encomenda para entrega futura',
    grupo: '5',
    tipoOperacao: 'venda',
    natureza: 'mercadoria_terceiros',
  },
  '5151': {
    codigo: '5151',
    formatado: '5.151',
    descricao: 'Transferência de produção do estabelecimento',
    grupo: '5',
    tipoOperacao: 'transferencia',
    natureza: 'producao_propria',
  },
  '5152': {
    codigo: '5152',
    formatado: '5.152',
    descricao: 'Transferência de mercadoria adquirida ou recebida de terceiros',
    grupo: '5',
    tipoOperacao: 'transferencia',
    natureza: 'mercadoria_terceiros',
  },
  '5201': {
    codigo: '5201',
    formatado: '5.201',
    descricao: 'Devolução de compra para industrialização ou produção rural',
    grupo: '5',
    tipoOperacao: 'devolucao',
    natureza: 'materia_prima',
  },
  '5202': {
    codigo: '5202',
    formatado: '5.202',
    descricao: 'Devolução de compra para comercialização',
    grupo: '5',
    tipoOperacao: 'devolucao',
    natureza: 'mercadoria_terceiros',
  },
  '5401': {
    codigo: '5401',
    formatado: '5.401',
    descricao:
      'Venda de produção do estabelecimento em operação com produto sujeito a substituição tributária (ST)',
    grupo: '5',
    tipoOperacao: 'venda',
    natureza: 'producao_propria',
  },
  '5402': {
    codigo: '5402',
    formatado: '5.402',
    descricao: 'Venda de produção sujeita a ST, fora do estabelecimento',
    grupo: '5',
    tipoOperacao: 'venda',
    natureza: 'producao_propria',
  },
  '5403': {
    codigo: '5403',
    formatado: '5.403',
    descricao:
      'Venda de mercadoria adquirida de terceiros sujeita a ST, na condição de contribuinte substituto',
    grupo: '5',
    tipoOperacao: 'venda',
    natureza: 'mercadoria_terceiros',
  },
  '5405': {
    codigo: '5405',
    formatado: '5.405',
    descricao:
      'Venda de mercadoria adquirida de terceiros em operação com produto sujeito a ST, como contribuinte substituído',
    grupo: '5',
    tipoOperacao: 'venda',
    natureza: 'mercadoria_terceiros',
  },
  '5901': {
    codigo: '5901',
    formatado: '5.901',
    descricao: 'Remessa para industrialização por encomenda',
    grupo: '5',
    tipoOperacao: 'remessa',
    natureza: 'indiferente',
  },
  '5902': {
    codigo: '5902',
    formatado: '5.902',
    descricao: 'Retorno de mercadoria utilizada na industrialização por encomenda',
    grupo: '5',
    tipoOperacao: 'retorno',
    natureza: 'indiferente',
  },
  '5910': {
    codigo: '5910',
    formatado: '5.910',
    descricao: 'Remessa em bonificação, doação ou brinde',
    grupo: '5',
    tipoOperacao: 'remessa',
    natureza: 'indiferente',
  },
  '5911': {
    codigo: '5911',
    formatado: '5.911',
    descricao: 'Remessa de amostra grátis',
    grupo: '5',
    tipoOperacao: 'remessa',
    natureza: 'indiferente',
  },
  '5912': {
    codigo: '5912',
    formatado: '5.912',
    descricao: 'Remessa de mercadoria ou bem para demonstração',
    grupo: '5',
    tipoOperacao: 'remessa',
    natureza: 'indiferente',
  },
  '5915': {
    codigo: '5915',
    formatado: '5.915',
    descricao: 'Remessa de mercadoria ou bem para conserto ou reparo',
    grupo: '5',
    tipoOperacao: 'remessa',
    natureza: 'indiferente',
  },
  '5922': {
    codigo: '5922',
    formatado: '5.922',
    descricao:
      'Lançamento efetuado a título de simples faturamento decorrente de venda para entrega futura',
    grupo: '5',
    tipoOperacao: 'remessa',
    natureza: 'indiferente',
  },
  '5949': {
    codigo: '5949',
    formatado: '5.949',
    descricao: 'Outra saída de mercadoria ou prestação de serviço não especificado',
    grupo: '5',
    tipoOperacao: 'outros',
    natureza: 'indiferente',
  },

  // --- GRUPO 6: OPERAÇÕES INTERESTADUAIS (OUTRO ESTADO) ---
  '6101': {
    codigo: '6101',
    formatado: '6.101',
    descricao: 'Venda de produção do estabelecimento para outro estado',
    grupo: '6',
    tipoOperacao: 'venda',
    natureza: 'producao_propria',
    detalhesLegislacao:
      'Classificam-se neste código as vendas interestaduais de produtos industrializados pelo próprio estabelecimento.',
  },
  '6102': {
    codigo: '6102',
    formatado: '6.102',
    descricao: 'Venda de mercadoria adquirida ou recebida de terceiros para outro estado',
    grupo: '6',
    tipoOperacao: 'venda',
    natureza: 'mercadoria_terceiros',
    detalhesLegislacao:
      'Classificam-se neste código as vendas interestaduais de mercadorias adquiridas de terceiros para revenda.',
  },
  '6103': {
    codigo: '6103',
    formatado: '6.103',
    descricao: 'Venda de produção efetuada fora do estabelecimento (interestadual)',
    grupo: '6',
    tipoOperacao: 'venda',
    natureza: 'producao_propria',
  },
  '6104': {
    codigo: '6104',
    formatado: '6.104',
    descricao:
      'Venda de mercadoria adquirida de terceiros, efetuada fora do estabelecimento (interestadual)',
    grupo: '6',
    tipoOperacao: 'venda',
    natureza: 'mercadoria_terceiros',
  },
  '6105': {
    codigo: '6105',
    formatado: '6.105',
    descricao:
      'Venda de produção do estabelecimento que não deva por ele transitar (interestadual)',
    grupo: '6',
    tipoOperacao: 'venda',
    natureza: 'producao_propria',
  },
  '6106': {
    codigo: '6106',
    formatado: '6.106',
    descricao:
      'Venda de mercadoria adquirida de terceiros, que não deva por ele transitar (interestadual)',
    grupo: '6',
    tipoOperacao: 'venda',
    natureza: 'mercadoria_terceiros',
  },
  '6107': {
    codigo: '6107',
    formatado: '6.107',
    descricao: 'Venda de produção do estabelecimento destinada a não contribuinte',
    grupo: '6',
    tipoOperacao: 'venda',
    natureza: 'producao_propria',
  },
  '6108': {
    codigo: '6108',
    formatado: '6.108',
    descricao: 'Venda de mercadoria adquirida de terceiros destinada a não contribuinte',
    grupo: '6',
    tipoOperacao: 'venda',
    natureza: 'mercadoria_terceiros',
  },
  '6116': {
    codigo: '6116',
    formatado: '6.116',
    descricao: 'Venda de produção originada de encomenda para entrega futura (interestadual)',
    grupo: '6',
    tipoOperacao: 'venda',
    natureza: 'producao_propria',
  },
  '6117': {
    codigo: '6117',
    formatado: '6.117',
    descricao:
      'Venda de mercadoria adquirida de terceiros originada de encomenda para entrega futura (interestadual)',
    grupo: '6',
    tipoOperacao: 'venda',
    natureza: 'mercadoria_terceiros',
  },
  '6151': {
    codigo: '6151',
    formatado: '6.151',
    descricao: 'Transferência de produção do estabelecimento para outro estado',
    grupo: '6',
    tipoOperacao: 'transferencia',
    natureza: 'producao_propria',
  },
  '6152': {
    codigo: '6152',
    formatado: '6.152',
    descricao: 'Transferência de mercadoria adquirida ou recebida de terceiros para outro estado',
    grupo: '6',
    tipoOperacao: 'transferencia',
    natureza: 'mercadoria_terceiros',
  },
  '6201': {
    codigo: '6201',
    formatado: '6.201',
    descricao: 'Devolução de compra para industrialização ou produção rural (interestadual)',
    grupo: '6',
    tipoOperacao: 'devolucao',
    natureza: 'materia_prima',
  },
  '6202': {
    codigo: '6202',
    formatado: '6.202',
    descricao: 'Devolução de compra para comercialização (interestadual)',
    grupo: '6',
    tipoOperacao: 'devolucao',
    natureza: 'mercadoria_terceiros',
  },
  '6401': {
    codigo: '6401',
    formatado: '6.401',
    descricao:
      'Venda de produção do estabelecimento em operação com produto sujeito a ST (interestadual)',
    grupo: '6',
    tipoOperacao: 'venda',
    natureza: 'producao_propria',
  },
  '6403': {
    codigo: '6403',
    formatado: '6.403',
    descricao:
      'Venda de mercadoria adquirida de terceiros sujeita a ST, como contribuinte substituto (interestadual)',
    grupo: '6',
    tipoOperacao: 'venda',
    natureza: 'mercadoria_terceiros',
  },
  '6404': {
    codigo: '6404',
    formatado: '6.404',
    descricao:
      'Venda de mercadoria sujeita a ST cujo imposto já tenha sido retido anteriormente (interestadual)',
    grupo: '6',
    tipoOperacao: 'venda',
    natureza: 'mercadoria_terceiros',
  },
  '6901': {
    codigo: '6901',
    formatado: '6.901',
    descricao: 'Remessa para industrialização por encomenda (interestadual)',
    grupo: '6',
    tipoOperacao: 'remessa',
    natureza: 'indiferente',
  },
  '6910': {
    codigo: '6910',
    formatado: '6.910',
    descricao: 'Remessa em bonificação, doação ou brinde para outro estado',
    grupo: '6',
    tipoOperacao: 'remessa',
    natureza: 'indiferente',
  },
  '6912': {
    codigo: '6912',
    formatado: '6.912',
    descricao: 'Remessa de mercadoria ou bem para demonstração (interestadual)',
    grupo: '6',
    tipoOperacao: 'remessa',
    natureza: 'indiferente',
  },
  '6915': {
    codigo: '6915',
    formatado: '6.915',
    descricao: 'Remessa de mercadoria ou bem para conserto ou reparo (interestadual)',
    grupo: '6',
    tipoOperacao: 'remessa',
    natureza: 'indiferente',
  },
  '6922': {
    codigo: '6922',
    formatado: '6.922',
    descricao: 'Lançamento a título de simples faturamento para entrega futura (interestadual)',
    grupo: '6',
    tipoOperacao: 'remessa',
    natureza: 'indiferente',
  },
  '6949': {
    codigo: '6949',
    formatado: '6.949',
    descricao: 'Outra saída de mercadoria ou prestação de serviço não especificado (interestadual)',
    grupo: '6',
    tipoOperacao: 'outros',
    natureza: 'indiferente',
  },

  // --- GRUPO 7: OPERAÇÕES COM O EXTERIOR (EXPORTAÇÃO) ---
  '7101': {
    codigo: '7101',
    formatado: '7.101',
    descricao: 'Venda de produção do estabelecimento para o exterior',
    grupo: '7',
    tipoOperacao: 'venda',
    natureza: 'producao_propria',
  },
  '7102': {
    codigo: '7102',
    formatado: '7.102',
    descricao: 'Venda de mercadoria adquirida ou recebida de terceiros para o exterior',
    grupo: '7',
    tipoOperacao: 'venda',
    natureza: 'mercadoria_terceiros',
  },
  '7201': {
    codigo: '7201',
    formatado: '7.201',
    descricao: 'Devolução de compra para industrialização (exterior)',
    grupo: '7',
    tipoOperacao: 'devolucao',
    natureza: 'materia_prima',
  },
  '7202': {
    codigo: '7202',
    formatado: '7.202',
    descricao: 'Devolução de compra para comercialização (exterior)',
    grupo: '7',
    tipoOperacao: 'devolucao',
    natureza: 'mercadoria_terceiros',
  },
  '7949': {
    codigo: '7949',
    formatado: '7.949',
    descricao: 'Outra saída de mercadoria ou prestação de serviço para o exterior',
    grupo: '7',
    tipoOperacao: 'outros',
    natureza: 'indiferente',
  },
}

/**
 * Normaliza um código CFOP para 4 dígitos limpos (ex: '5.101' -> '5101')
 */
export function normalizeCfopCode(code: string | null | undefined): string {
  if (!code) return ''
  return String(code).replace(/\D/g, '').trim()
}

/**
 * Formata um CFOP de 4 dígitos para exibição pontuada (ex: '5101' -> '5.101')
 */
export function formatCfopCode(code: string | null | undefined): string {
  const norm = normalizeCfopCode(code)
  if (norm.length !== 4) return code || ''
  return `${norm[0]}.${norm.slice(1)}`
}

/**
 * Busca dados oficiais do CFOP
 */
export function getOfficialCfop(code: string | null | undefined): OfficialCfopInfo | null {
  const norm = normalizeCfopCode(code)
  return OFFICIAL_OUTBOUND_CFOPS[norm] || null
}
