import * as XLSX from 'xlsx'
import pb from '@/lib/pocketbase/client'
import { validarCNPJ, formatarCNPJ } from '@/services/cnpj-service'
import { registerAuditLog } from '@/services/audit-logs'
import { createCadastro, listCadastros } from '@/services/cadastros'
import type { CadastroConfig, CadastroField, CadastroRecord } from '@/lib/cadastros-types'

export interface ValidRowItem {
  rowNumber: number
  data: Record<string, unknown>
  summary: string
}

export interface InvalidRowItem {
  rowNumber: number
  data: Record<string, unknown>
  errors: string[]
  isDuplicate?: boolean
}

export interface ValidationResult {
  totalRows: number
  validRows: ValidRowItem[]
  invalidRows: InvalidRowItem[]
  duplicatesCount: number
  warning?: string
}

export interface ImportExecutionResult {
  total: number
  successCount: number
  errorCount: number
  errors: Array<{ rowNumber: number; message: string }>
}

/**
 * Validação dos dígitos verificadores do CPF brasileiro (módulo 11)
 */
export function validarCPF(raw: string): boolean {
  if (!raw) return false
  const clean = String(raw).replace(/\D/g, '')
  if (clean.length !== 11) return false
  if (/^(\d)\1{10}$/.test(clean)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += parseInt(clean.charAt(i), 10) * (10 - i)
  }
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(clean.charAt(9), 10)) return false

  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += parseInt(clean.charAt(i), 10) * (11 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(clean.charAt(10), 10)) return false

  return true
}

/**
 * Validação unificada de CPF ou CNPJ pelo comprimento
 */
export function validarCpfCnpj(raw: string): boolean {
  if (!raw) return false
  const clean = String(raw).replace(/\D/g, '')
  if (clean.length === 11) return validarCPF(clean)
  if (clean.length === 14) return validarCNPJ(clean)
  return false
}

/**
 * Validação simples de formato de e-mail
 */
export function validarEmail(raw: string): boolean {
  if (!raw) return false
  const trimmed = String(raw).trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

/**
 * Exemplos realistas para geração de planilhas modelo
 */
function getSampleRows(config: CadastroConfig): Array<Record<string, unknown>> {
  const nameLabel = config.nameLabel || 'Nome'

  switch (config.key) {
    case 'empresas':
      return [
        {
          code: 'EMP-001',
          name: 'HURAM MATRIZ TECNOLOGIA LTDA',
          razao_social: 'HURAM MATRIZ TECNOLOGIA LTDA',
          nome_fantasia: 'HURAM MATRIZ',
          cnpj: '11.222.333/0001-81',
          tipo_unidade: 'Matriz',
          inscricao_estadual: '123456789',
          inscricao_municipal: '987654',
          address: 'Av. Paulista, 1000 - Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          cep: '01310-100',
          phone: '(11) 3333-4444',
          email: 'contato@huram.com.br',
          regime_tributario: 'Lucro Presumido',
          site: 'https://huram.com.br',
          responsavel_legal: 'Carlos Eduardo',
          contador: 'Marcos Silva CRC/SP 123456',
        },
        {
          code: 'EMP-002',
          name: 'HURAM FILIAL RIO LTDA',
          razao_social: 'HURAM FILIAL RIO DE JANEIRO LTDA',
          nome_fantasia: 'HURAM RIO',
          cnpj: '11.222.333/0002-62',
          tipo_unidade: 'Filial',
          inscricao_estadual: '789123456',
          inscricao_municipal: '654321',
          address: 'Av. Rio Branco, 500 - Centro',
          city: 'Rio de Janeiro',
          state: 'RJ',
          cep: '20040-002',
          phone: '(21) 2222-3333',
          email: 'rio@huram.com.br',
          regime_tributario: 'Lucro Presumido',
          site: 'https://huram.com.br',
          responsavel_legal: 'Fernanda Lima',
          contador: 'Marcos Silva CRC/SP 123456',
        },
      ]

    case 'filiais':
      return [
        {
          code: 'FIL-001',
          name: 'Filial Campinas',
          empresa_name: 'HURAM MATRIZ TECNOLOGIA LTDA',
          cnpj: '11.222.333/0003-43',
          inscricao_estadual: '998877665',
          address: 'Rua Barão de Jaguara, 100 - Centro',
          city: 'Campinas',
          state: 'SP',
          phone: '(19) 3232-1111',
          responsible: 'Roberto Prado',
        },
        {
          code: 'FIL-002',
          name: 'Filial Curitiba',
          empresa_name: 'HURAM MATRIZ TECNOLOGIA LTDA',
          cnpj: '11.222.333/0004-24',
          inscricao_estadual: '887766554',
          address: 'Rua XV de Novembro, 200 - Centro',
          city: 'Curitiba',
          state: 'PR',
          phone: '(41) 3333-2222',
          responsible: 'Juliana Costa',
        },
      ]

    case 'transportadoras':
      return [
        {
          code: 'TRA-001',
          name: 'TRANSLOG LOGISTICA EXPRESS LTDA',
          razao_social: 'TRANSLOG LOGISTICA EXPRESS LTDA',
          nome_fantasia: 'TRANSLOG EXPRESS',
          cnpj: '00.000.000/0001-91',
          phone: '(11) 4004-9988',
          email: 'operacional@translog.com.br',
          tipo_transporte: 'Rodoviário Fracionado',
          regioes: 'Sul e Sudeste',
          prazo_medio: '3',
        },
        {
          code: 'TRA-002',
          name: 'RAPIDO BRASIL TRANSPORTES S/A',
          razao_social: 'RAPIDO BRASIL TRANSPORTES S/A',
          nome_fantasia: 'RAPIDO BRASIL',
          cnpj: '02.449.992/0001-64',
          phone: '(11) 3214-5566',
          email: 'cargas@rapidobrasil.com.br',
          tipo_transporte: 'Carga Fechada / Lotação',
          regioes: 'Todo o Brasil',
          prazo_medio: '5',
        },
      ]

    case 'vendedores':
      return [
        {
          code: 'VEN-001',
          name: 'Mariana Duarte',
          cpf_cnpj: '382.492.178-04',
          tipo: 'Interno',
          regiao: 'Grande São Paulo',
          supervisor: 'Ricardo Santos',
          comissao: '3.5',
          phone: '(11) 98888-1111',
          email: 'mariana.duarte@empresa.com.br',
        },
        {
          code: 'VEN-002',
          name: 'Lucas Nogueira',
          cpf_cnpj: '246.810.128-40',
          tipo: 'Externo',
          regiao: 'Interior de SP (Campinas e Vale)',
          supervisor: 'Ricardo Santos',
          comissao: '5.0',
          phone: '(19) 97777-2222',
          email: 'lucas.nogueira@empresa.com.br',
        },
      ]

    case 'representantes':
      return [
        {
          code: 'REP-001',
          name: 'ALFA REPRESENTACOES COMERCIAIS LTDA',
          cpf_cnpj: '33.000.111/0001-20',
          tipo: 'Comercial',
          regiao: 'Região Sul (PR, SC, RS)',
          supervisor: 'Diretoria Comercial',
          comissao: '6.0',
          phone: '(41) 3456-7890',
          email: 'contato@alfarepresentacoes.com.br',
        },
        {
          code: 'REP-002',
          name: 'BETA TECNICA E VENDAS ME',
          cpf_cnpj: '12.345.678/0001-95',
          tipo: 'Técnico',
          regiao: 'Minas Gerais e Centro-Oeste',
          supervisor: 'Diretoria Comercial',
          comissao: '7.0',
          phone: '(31) 3322-1100',
          email: 'atendimento@betatecnica.com.br',
        },
      ]

    case 'perfis_permissoes':
      return [
        {
          code: 'PRF-001',
          name: 'Analista Financeiro Pleno',
          description: 'Acesso às rotinas de Contas a Pagar, Receber e Conciliação Bancária',
          permissions: '{"financial":{"read":true,"write":true},"reports":{"read":true}}',
        },
        {
          code: 'PRF-002',
          name: 'Assistente Comercial',
          description: 'Acesso a Pedidos, Clientes e visualização de Tabelas de Preço',
          permissions: '{"commercial":{"read":true,"write":true}}',
        },
      ]

    case 'categorias':
      return [
        {
          code: 'CAT-001',
          name: 'Matérias-Primas',
          description: 'Insumos brutos para transformação na fábrica',
        },
        {
          code: 'CAT-002',
          name: 'Produtos Acabados',
          description: 'Itens prontos para faturamento e distribuição',
        },
        {
          code: 'CAT-003',
          name: 'Embalagens e Descartáveis',
          description: 'Caixas de papelão, fitas e embalagens de proteção',
        },
      ]

    case 'subcategorias':
      return [
        {
          code: 'SUB-001',
          name: 'Aços e Perfis Metálicos',
          category_name: 'Matérias-Primas',
          description: 'Chapas laminadas e perfis estruturais de aço',
        },
        {
          code: 'SUB-002',
          name: 'Polímeros Termoplásticos',
          category_name: 'Matérias-Primas',
          description: 'Grânulos e resinas plásticas para injeção',
        },
      ]

    case 'marcas':
      return [
        {
          code: 'MRC-001',
          name: 'Huram Pro',
          description: 'Linha premium industrial e alta performance',
        },
        {
          code: 'MRC-002',
          name: 'Huram Eco',
          description: 'Linha sustentável com materiais reciclados',
        },
      ]

    case 'unidades_medida':
      return [
        {
          code: 'UND-001',
          name: 'Unidade',
          description: 'Unidade de contagem individual',
          abbreviation: 'UN',
        },
        {
          code: 'UND-002',
          name: 'Quilograma',
          description: 'Medida de massa e peso',
          abbreviation: 'KG',
        },
        {
          code: 'UND-003',
          name: 'Metro',
          description: 'Medida de comprimento linear',
          abbreviation: 'M',
        },
      ]

    case 'centros_custo':
      return [
        {
          code: 'CC-001',
          name: 'Produção e Usinagem',
          empresa_name: 'HURAM MATRIZ TECNOLOGIA LTDA',
          filial_name: 'Filial Campinas',
          responsible: 'Eduardo Martins',
        },
        {
          code: 'CC-002',
          name: 'Administração Geral',
          empresa_name: 'HURAM MATRIZ TECNOLOGIA LTDA',
          filial_name: '',
          responsible: 'Patricia Rocha',
        },
      ]

    case 'plano_contas':
      return [
        {
          code: '1.01.01',
          name: 'Caixa Geral',
          type: 'Ativo',
          parent_code: '1.01',
          natureza: 'Devedora',
          aceita_lancamentos: 'Sim',
        },
        {
          code: '3.01.01',
          name: 'Receita Bruta de Vendas',
          type: 'Receita',
          parent_code: '3.01',
          natureza: 'Credora',
          aceita_lancamentos: 'Sim',
        },
      ]

    case 'bancos':
      return [
        {
          code: '001',
          name: 'Banco do Brasil S.A.',
        },
        {
          code: '033',
          name: 'Banco Santander Brasil S.A.',
        },
        {
          code: '341',
          name: 'Itaú Unibanco S.A.',
        },
      ]

    case 'contas_bancarias':
      return [
        {
          code: 'CTA-001',
          name: 'Conta Corrente Principal - Itaú',
          banco_name: 'Itaú Unibanco S.A.',
          agencia: '1234',
          conta: '56789-0',
          tipo: 'Corrente',
          empresa_name: 'HURAM MATRIZ TECNOLOGIA LTDA',
          filial_name: '',
          saldo_inicial: '15000.00',
        },
        {
          code: 'CTA-002',
          name: 'Conta Aplicação Santander',
          banco_name: 'Banco Santander Brasil S.A.',
          agencia: '0987',
          conta: '43210-9',
          tipo: 'Poupança',
          empresa_name: 'HURAM MATRIZ TECNOLOGIA LTDA',
          filial_name: '',
          saldo_inicial: '50000.00',
        },
      ]

    case 'formas_pagamento':
      return [
        {
          code: 'FP-001',
          name: 'PIX Cobrança Instantâneo',
          tipo: 'PIX',
          gera_financeiro: 'Sim',
        },
        {
          code: 'FP-002',
          name: 'Boleto Bancário Registrado',
          tipo: 'Boleto',
          gera_financeiro: 'Sim',
        },
        {
          code: 'FP-003',
          name: 'Cartão de Crédito Corporativo',
          tipo: 'Cartão Crédito',
          gera_financeiro: 'Sim',
        },
      ]

    case 'condicoes_pagamento':
      return [
        {
          code: 'CP-001',
          name: 'À Vista 1x',
          parcelas: 1,
          intervalo: 0,
          entrada: '100',
        },
        {
          code: 'CP-002',
          name: '30 / 60 / 90 Dias',
          parcelas: 3,
          intervalo: 30,
          entrada: '0',
        },
        {
          code: 'CP-003',
          name: 'Entrada 50% + 30 Dias',
          parcelas: 2,
          intervalo: 30,
          entrada: '50',
        },
      ]

    default: {
      const row1: Record<string, unknown> = {
        code: `${config.collection.slice(0, 3).toUpperCase()}-001`,
        name: `Exemplo 1 de ${config.label}`,
      }
      const row2: Record<string, unknown> = {
        code: `${config.collection.slice(0, 3).toUpperCase()}-002`,
        name: `Exemplo 2 de ${config.label}`,
      }
      config.fields.forEach((fld) => {
        if (fld.name === 'name' || fld.name === 'code') return
        if (fld.type === 'switch') {
          row1[fld.name] = 'Sim'
          row2[fld.name] = 'Não'
        } else if (fld.type === 'number') {
          row1[fld.name] = 10
          row2[fld.name] = 20
        } else if (fld.type === 'select' && fld.options && fld.options.length > 0) {
          row1[fld.name] = fld.options[0]
          row2[fld.name] = fld.options[1] || fld.options[0]
        } else {
          row1[fld.name] = `Dado de ${fld.label}`
          row2[fld.name] = `Outro dado de ${fld.label}`
        }
      })
      return [row1, row2]
    }
  }
}

/**
 * Monta as colunas da planilha modelo a partir de cadastros-config
 */
function getTemplateColumns(
  config: CadastroConfig,
): Array<{ key: string; label: string; required: boolean; field?: CadastroField }> {
  const nameLabel = config.nameLabel || 'Nome'
  const cols: Array<{ key: string; label: string; required: boolean; field?: CadastroField }> = [
    { key: 'code', label: 'Código', required: false },
    { key: 'name', label: nameLabel, required: true },
  ]

  // Campos de custo protegidos que NUNCA devem ser expostos em templates de importação
  const PROTECTED_COST_FIELDS = new Set([
    'cost_price',
    'last_cost',
    'cost_origin',
    'cost_locked',
    'cost_type',
  ])

  for (const field of config.fields) {
    if (field.name === 'code' || field.name === 'name') continue
    if (PROTECTED_COST_FIELDS.has(field.name)) continue
    cols.push({
      key: field.name,
      label: field.label,
      required: !!field.required,
      field,
    })
  }

  return cols
}

/**
 * 1. GERAÇÃO DE PLANILHA MODELO (.XLSX)
 */
export function downloadTemplateExcel(config: CadastroConfig): void {
  const cols = getTemplateColumns(config)
  const sampleRows = getSampleRows(config)

  // Header com destaque visual para campos obrigatórios (sufixo ' *')
  const headerLabels = cols.map((c) => `${c.label}${c.required ? ' *' : ''}`)

  // Montagem da aba "Dados"
  const dataRows: (string | number | boolean)[][] = [headerLabels]
  for (const sample of sampleRows) {
    const rowValues = cols.map((col) => {
      const val = sample[col.key]
      if (val === undefined || val === null) return ''
      return val as string | number | boolean
    })
    dataRows.push(rowValues)
  }

  const wsDados = XLSX.utils.aoa_to_sheet(dataRows)

  // Ajuste de largura das colunas
  wsDados['!cols'] = cols.map((c) => ({
    wch: Math.max(c.label.length + 6, 18),
  }))

  // Montagem da aba "Instruções"
  const instructionsAoa: (string | number)[][] = [
    ['INSTRUÇÕES DE PREENCHIMENTO DA IMPORTAÇÃO EXCEL', '', '', ''],
    [`Cadastro: ${config.label} (Coleção: ${config.collection})`, '', '', ''],
    ['Data de Emissão:', new Date().toLocaleString('pt-BR'), '', ''],
    ['', '', '', ''],
    ['1. REGRAS GERAIS DE PREENCHIMENTO', '', '', ''],
    [
      '• Mantenha o cabeçalho original da aba "Dados" sem renomear nem excluir colunas.',
      '',
      '',
      '',
    ],
    ['• Campos com asterisco (*) são de preenchimento estritamente obrigatório.', '', '', ''],
    [
      '• O campo "Código" pode ficar em branco para geração sequencial automática do sistema.',
      '',
      '',
      '',
    ],
    [
      '• Nada é alterado ou excluído no banco: a importação é estritamente ADITIVA (apenas inclui novos registros).',
      '',
      '',
      '',
    ],
    [
      '• Registros já existentes no banco (mesmo Código, CNPJ ou Nome) serão identificados e ignorados como duplicados com aviso legível.',
      '',
      '',
      '',
    ],
    [
      '• Duplicidades dentro da própria planilha serão barradas na validação prévia antes de qualquer gravação.',
      '',
      '',
      '',
    ],
    [
      '• Vínculos relacionais (Empresa, Filial, Categoria, Banco, etc.) devem referenciar nomes ou códigos previamente cadastrados no ERP.',
      '',
      '',
      '',
    ],
    ['', '', '', ''],
    ['2. DICIONÁRIO DE CAMPOS E VALORES PERMITIDOS', '', '', ''],
    ['Coluna', 'Obrigatório?', 'Tipo de Dado', 'Valores Permitidos / Orientações'],
  ]

  // Linhas da tabela de dicionário
  cols.forEach((col) => {
    let tipoFormat = 'Texto'
    let orientacoes = 'Texto livre'

    if (col.key === 'code') {
      tipoFormat = 'Texto / Alfanumérico'
      orientacoes = 'Opcional. Se vazio, o ERP gerará o código automaticamente.'
    } else if (col.key === 'name') {
      tipoFormat = 'Texto'
      orientacoes = `Identificador principal do registro (${col.label}). Não pode ficar em branco.`
    } else if (col.field) {
      const f = col.field
      switch (f.type) {
        case 'email':
          tipoFormat = 'E-mail'
          orientacoes = 'Formato válido: usuario@dominio.com.br'
          break
        case 'tel':
          tipoFormat = 'Telefone'
          orientacoes = 'Ex: (11) 98888-7777 ou (11) 3333-4444'
          break
        case 'number':
          tipoFormat = 'Numérico'
          orientacoes = 'Apenas números inteiros ou decimais'
          break
        case 'date':
          tipoFormat = 'Data'
          orientacoes = 'Formato: DD/MM/AAAA ou AAAA-MM-DD'
          break
        case 'switch':
          tipoFormat = 'Booleano / Lógico'
          orientacoes = 'Valores aceitos: Sim, Não, Verdadeiro, Falso, 1, 0'
          break
        case 'select':
          tipoFormat = 'Lista Suspensa (Opção Fixa)'
          orientacoes =
            f.options && f.options.length > 0
              ? `Valores exatos permitidos: ${f.options.join(' | ')}`
              : 'Selecione uma opção cadastrada'
          break
        default:
          if (f.name.includes('cnpj')) {
            tipoFormat = 'CNPJ (14 dígitos)'
            orientacoes = 'Válido perante a Receita Federal (dígitos verificadores conferidos)'
          } else if (f.name.includes('cpf')) {
            tipoFormat = 'CPF (11 dígitos)'
            orientacoes = 'Válido com dígitos verificadores conferidos'
          } else if (f.name.includes('empresa')) {
            orientacoes =
              'Informe a Razão Social ou Nome Fantasia da empresa previamente cadastrada'
          } else if (f.name.includes('filial')) {
            orientacoes = 'Informe o Nome da filial previamente cadastrada'
          } else if (f.name.includes('category')) {
            orientacoes = 'Informe o Nome da Categoria mãe existente'
          } else if (f.name.includes('banco')) {
            orientacoes = 'Informe o Nome do Banco cadastrado no ERP'
          }
      }
    }

    instructionsAoa.push([
      `${col.label}${col.required ? ' *' : ''}`,
      col.required ? 'SIM' : 'NÃO',
      tipoFormat,
      orientacoes,
    ])
  })

  const wsInstrucoes = XLSX.utils.aoa_to_sheet(instructionsAoa)
  wsInstrucoes['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 65 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsDados, 'Dados')
  XLSX.utils.book_append_sheet(wb, wsInstrucoes, 'Instruções')

  const dateStr = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `modelo_importacao_${config.collection}_${dateStr}.xlsx`)
}

/**
 * 2. LEITURA E VALIDAÇÃO COMPLETA DA PLANILHA (.XLSX)
 */
export async function parseAndValidateExcel(
  file: File,
  config: CadastroConfig,
): Promise<ValidationResult> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })

  // Prioriza aba "Dados", caso contrário utiliza a primeira aba
  const sheetName = wb.SheetNames.includes('Dados') ? 'Dados' : wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  if (!ws) {
    throw new Error('A planilha selecionada está vazia ou não contém abas válidas.')
  }

  const rawRows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' })
  if (!rawRows || rawRows.length < 2) {
    throw new Error('A planilha não possui dados além da linha de cabeçalho.')
  }

  const headerRow = (rawRows[0] || []).map((h) => String(h || '').trim())
  const templateCols = getTemplateColumns(config)

  // Mapeia colunas encontradas no cabeçalho para os campos declarativos
  const colMapping: Array<{
    index: number
    key: string
    label: string
    required: boolean
    field?: CadastroField
  }> = []

  // Rastreia e avisa sobre tentativa de envio de colunas de custo bloqueadas
  const COST_COLUMN_PATTERNS = [
    'cost_price',
    'last_cost',
    'cost_origin',
    'cost_locked',
    'cost_type',
    'custo',
    'preço de custo',
    'preco de custo',
    'ultimo custo',
    'último custo',
  ]
  const ignoredCostHeaders: string[] = []

  headerRow.forEach((header, index) => {
    const cleanHeader = header.replace(/\*/g, '').trim().toLowerCase()
    if (!cleanHeader) return

    // Verifica se é uma coluna de custo protegida
    const isCostCol = COST_COLUMN_PATTERNS.some(
      (p) => cleanHeader === p || cleanHeader.includes('custo'),
    )
    if (isCostCol && config.collection === 'products') {
      ignoredCostHeaders.push(header)
      return // Não mapeia no importador
    }

    // Tenta casar com as colunas configuradas
    const match = templateCols.find((c) => {
      const cleanColLabel = c.label.toLowerCase()
      const cleanColKey = c.key.toLowerCase()
      return cleanColLabel === cleanHeader || cleanColKey === cleanHeader
    })

    if (match) {
      colMapping.push({
        index,
        key: match.key,
        label: match.label,
        required: match.required,
        field: match.field,
      })
    }
  })

  // Validação: a coluna identificadora primária (name) precisa estar mapeada
  const nameMapped = colMapping.some((c) => c.key === 'name')
  if (!nameMapped) {
    throw new Error(
      `Coluna obrigatória "${config.nameLabel || 'Nome'}" não foi identificada no cabeçalho da planilha. Baixe o modelo oficial e utilize as colunas originais.`,
    )
  }

  // 1. Carrega dados existentes no banco para checagem de duplicidade e resolução de vínculos
  const existingRecords = await listCadastros(config.collection).catch(() => [] as CadastroRecord[])

  const existingCodes = new Set<string>()
  const existingNames = new Set<string>()
  const existingCnpjs = new Set<string>()
  const existingCpfs = new Set<string>()

  existingRecords.forEach((r) => {
    if (r.code) existingCodes.add(String(r.code).trim().toLowerCase())
    if (r.name) existingNames.add(String(r.name).trim().toLowerCase())
    if (r.cnpj) existingCnpjs.add(String(r.cnpj).replace(/\D/g, ''))
    if (r.cpf) existingCpfs.add(String(r.cpf).replace(/\D/g, ''))
    if (r.cpf_cnpj) {
      const clean = String(r.cpf_cnpj).replace(/\D/g, '')
      if (clean.length === 11) existingCpfs.add(clean)
      if (clean.length === 14) existingCnpjs.add(clean)
    }
  })

  // 2. Carrega cadastros de apoio para validação de vínculos
  const foreignReferences: Record<string, Set<string>> = {}

  // Se houver vínculo de empresas
  if (templateCols.some((c) => c.key === 'empresa_name' || c.key === 'matriz_id')) {
    try {
      const empresas = await listCadastros('empresas')
      const empSet = new Set<string>()
      empresas.forEach((e) => {
        if (e.name) empSet.add(e.name.trim().toLowerCase())
        if (e.razao_social) empSet.add(String(e.razao_social).trim().toLowerCase())
        if (e.nome_fantasia) empSet.add(String(e.nome_fantasia).trim().toLowerCase())
        if (e.code) empSet.add(e.code.trim().toLowerCase())
      })
      foreignReferences['empresa_name'] = empSet
    } catch {
      /* ignore */
    }
  }

  // Se houver vínculo de filiais
  if (templateCols.some((c) => c.key === 'filial_name')) {
    try {
      const filiais = await listCadastros('filiais')
      const filSet = new Set<string>()
      filiais.forEach((f) => {
        if (f.name) filSet.add(f.name.trim().toLowerCase())
        if (f.code) filSet.add(f.code.trim().toLowerCase())
      })
      foreignReferences['filial_name'] = filSet
    } catch {
      /* ignore */
    }
  }

  // Se houver vínculo de categorias
  if (templateCols.some((c) => c.key === 'category_name')) {
    try {
      const categorias = await listCadastros('categorias')
      const catSet = new Set<string>()
      categorias.forEach((c) => {
        if (c.name) catSet.add(c.name.trim().toLowerCase())
        if (c.code) catSet.add(c.code.trim().toLowerCase())
      })
      foreignReferences['category_name'] = catSet
    } catch {
      /* ignore */
    }
  }

  // Se houver vínculo de bancos
  if (templateCols.some((c) => c.key === 'banco_name')) {
    try {
      const bancos = await listCadastros('bancos')
      const bncSet = new Set<string>()
      bancos.forEach((b) => {
        if (b.name) bncSet.add(b.name.trim().toLowerCase())
        if (b.code) bncSet.add(b.code.trim().toLowerCase())
      })
      foreignReferences['banco_name'] = bncSet
    } catch {
      /* ignore */
    }
  }

  // Se houver vínculo de conta pai (plano de contas)
  if (templateCols.some((c) => c.key === 'parent_code')) {
    try {
      const contas = await listCadastros('plano_contas')
      const ctaSet = new Set<string>()
      contas.forEach((c) => {
        if (c.code) ctaSet.add(c.code.trim().toLowerCase())
      })
      foreignReferences['parent_code'] = ctaSet
    } catch {
      /* ignore */
    }
  }

  // Rastreamento de duplicados DENTRO do arquivo
  const fileSeenCodes = new Map<string, number>()
  const fileSeenNames = new Map<string, number>()
  const fileSeenCnpjs = new Map<string, number>()
  const fileSeenCpfs = new Map<string, number>()

  const validRows: ValidRowItem[] = []
  const invalidRows: InvalidRowItem[] = []
  let duplicatesCount = 0

  // 3. Itera por cada linha de dados (linha 2 em diante no Excel -> index 1)
  for (let i = 1; i < rawRows.length; i++) {
    const rawRow = rawRows[i]
    const rowNumber = i + 1 // número legível de linha da planilha

    // Ignora linhas totalmente vazias
    if (!rawRow || rawRow.every((val: any) => val === '' || val === null || val === undefined)) {
      continue
    }

    const rowErrors: string[] = []
    const parsedData: Record<string, unknown> = {}

    // Extrai valores mapeados
    colMapping.forEach((col) => {
      let rawVal = rawRow[col.index]
      if (typeof rawVal === 'string') rawVal = rawVal.trim()
      parsedData[col.key] = rawVal
    })

    const code = String(parsedData.code || '').trim()
    const name = String(parsedData.name || '').trim()

    // Validação a) Campos obrigatórios gerais
    if (!name) {
      rowErrors.push(`O campo "${config.nameLabel || 'Nome'}" é de preenchimento obrigatório.`)
    }

    colMapping.forEach((col) => {
      if (col.key === 'name' || col.key === 'code') return
      const val = parsedData[col.key]
      const isEmpty = val === undefined || val === null || String(val).trim() === ''

      if (col.required && isEmpty) {
        rowErrors.push(`O campo obrigatório "${col.label}" não foi informado.`)
      }

      // Validação de tipos e formatos
      if (!isEmpty && col.field) {
        const valStr = String(val).trim()
        if (col.field.type === 'email' && !validarEmail(valStr)) {
          rowErrors.push(`E-mail inválido no campo "${col.label}": "${valStr}".`)
        } else if (col.field.type === 'number') {
          const num = Number(String(val).replace(',', '.'))
          if (isNaN(num)) {
            rowErrors.push(`Valor numérico inválido no campo "${col.label}": "${valStr}".`)
          } else {
            parsedData[col.key] = num
          }
        } else if (col.field.type === 'switch') {
          const lower = valStr.toLowerCase()
          if (['sim', 's', 'true', '1', 'verdadeiro', 'ativo'].includes(lower)) {
            parsedData[col.key] = true
          } else if (['não', 'nao', 'n', 'false', '0', 'falso', 'inativo'].includes(lower)) {
            parsedData[col.key] = false
          } else {
            rowErrors.push(`Valor booleano inválido no campo "${col.label}". Use "Sim" ou "Não".`)
          }
        } else if (
          col.field.type === 'select' &&
          col.field.options &&
          col.field.options.length > 0
        ) {
          const matchedOpt = col.field.options.find(
            (opt) => opt.toLowerCase() === valStr.toLowerCase(),
          )
          if (!matchedOpt) {
            rowErrors.push(
              `Valor "${valStr}" não permitido para "${col.label}". Opções válidas: ${col.field.options.join(', ')}.`,
            )
          } else {
            parsedData[col.key] = matchedOpt
          }
        }
      }
    })

    // Validação b) CPF / CNPJ com dígito verificador
    const rawCnpj = String(parsedData.cnpj || '').trim()
    if (rawCnpj) {
      const cleanCnpj = rawCnpj.replace(/\D/g, '')
      if (!validarCNPJ(cleanCnpj)) {
        rowErrors.push(`CNPJ com dígitos verificadores inválidos: "${rawCnpj}".`)
      } else {
        parsedData.cnpj = formatarCNPJ(cleanCnpj)
      }
    }

    const rawCpf = String(parsedData.cpf || '').trim()
    if (rawCpf) {
      const cleanCpf = rawCpf.replace(/\D/g, '')
      if (!validarCPF(cleanCpf)) {
        rowErrors.push(`CPF com dígitos verificadores inválidos: "${rawCpf}".`)
      }
    }

    const rawCpfCnpj = String(parsedData.cpf_cnpj || '').trim()
    if (rawCpfCnpj) {
      const cleanDoc = rawCpfCnpj.replace(/\D/g, '')
      if (!validarCpfCnpj(cleanDoc)) {
        rowErrors.push(`CPF/CNPJ inválido (dígitos incorretos): "${rawCpfCnpj}".`)
      } else if (cleanDoc.length === 14) {
        parsedData.cpf_cnpj = formatarCNPJ(cleanDoc)
      }
    }

    // Validação c) Duplicados DENTRO do arquivo
    if (code) {
      const cleanCode = code.toLowerCase()
      if (fileSeenCodes.has(cleanCode)) {
        rowErrors.push(
          `Código duplicado dentro da planilha: "${code}" já informado na linha ${fileSeenCodes.get(cleanCode)}.`,
        )
      } else {
        fileSeenCodes.set(cleanCode, rowNumber)
      }
    }

    if (name) {
      const cleanName = name.toLowerCase()
      if (fileSeenNames.has(cleanName)) {
        rowErrors.push(
          `Nome duplicado dentro da planilha: "${name}" já informado na linha ${fileSeenNames.get(cleanName)}.`,
        )
      } else {
        fileSeenNames.set(cleanName, rowNumber)
      }
    }

    if (rawCnpj) {
      const cleanCnpj = rawCnpj.replace(/\D/g, '')
      if (cleanCnpj.length === 14) {
        if (fileSeenCnpjs.has(cleanCnpj)) {
          rowErrors.push(
            `CNPJ duplicado dentro da planilha: "${rawCnpj}" já informado na linha ${fileSeenCnpjs.get(cleanCnpj)}.`,
          )
        } else {
          fileSeenCnpjs.set(cleanCnpj, rowNumber)
        }
      }
    }

    if (rawCpfCnpj) {
      const cleanDoc = rawCpfCnpj.replace(/\D/g, '')
      if (cleanDoc.length === 14) {
        if (fileSeenCnpjs.has(cleanDoc)) {
          rowErrors.push(
            `CNPJ duplicado dentro da planilha: "${rawCpfCnpj}" já informado na linha ${fileSeenCnpjs.get(cleanDoc)}.`,
          )
        } else {
          fileSeenCnpjs.set(cleanDoc, rowNumber)
        }
      } else if (cleanDoc.length === 11) {
        if (fileSeenCpfs.has(cleanDoc)) {
          rowErrors.push(
            `CPF duplicado dentro da planilha: "${rawCpfCnpj}" já informado na linha ${fileSeenCpfs.get(cleanDoc)}.`,
          )
        } else {
          fileSeenCpfs.set(cleanDoc, rowNumber)
        }
      }
    }

    // Validação c) Duplicados CONTRA o banco de dados (registro já existente NÃO é sobrescrito)
    let isDbDuplicate = false
    if (code && existingCodes.has(code.toLowerCase())) {
      isDbDuplicate = true
      rowErrors.push(
        `Duplicidade no banco: Código "${code}" já existe no sistema. Não será sobrescrito.`,
      )
    }
    if (rawCnpj && existingCnpjs.has(rawCnpj.replace(/\D/g, ''))) {
      isDbDuplicate = true
      rowErrors.push(
        `Duplicidade no banco: CNPJ "${rawCnpj}" já cadastrado no ERP. Não será sobrescrito.`,
      )
    }
    if (rawCpfCnpj) {
      const cleanDoc = rawCpfCnpj.replace(/\D/g, '')
      if (cleanDoc.length === 14 && existingCnpjs.has(cleanDoc)) {
        isDbDuplicate = true
        rowErrors.push(
          `Duplicidade no banco: CNPJ "${rawCpfCnpj}" já cadastrado no ERP. Não será sobrescrito.`,
        )
      }
      if (cleanDoc.length === 11 && existingCpfs.has(cleanDoc)) {
        isDbDuplicate = true
        rowErrors.push(
          `Duplicidade no banco: CPF "${rawCpfCnpj}" já cadastrado no ERP. Não será sobrescrito.`,
        )
      }
    }

    // Validação d) Vínculos relacionais (empresa, filial, categoria, banco, conta pai)
    if (parsedData.empresa_name) {
      const empName = String(parsedData.empresa_name).trim().toLowerCase()
      const empSet = foreignReferences['empresa_name']
      if (empSet && empSet.size > 0 && !empSet.has(empName)) {
        rowErrors.push(
          `Vínculo inexistente: Empresa "${parsedData.empresa_name}" não foi encontrada no cadastro de empresas.`,
        )
      }
    }

    if (parsedData.filial_name) {
      const filName = String(parsedData.filial_name).trim().toLowerCase()
      const filSet = foreignReferences['filial_name']
      if (filSet && filSet.size > 0 && !filSet.has(filName)) {
        rowErrors.push(
          `Vínculo inexistente: Filial "${parsedData.filial_name}" não foi encontrada no cadastro de filiais.`,
        )
      }
    }

    if (parsedData.category_name) {
      const catName = String(parsedData.category_name).trim().toLowerCase()
      const catSet = foreignReferences['category_name']
      if (catSet && catSet.size > 0 && !catSet.has(catName)) {
        rowErrors.push(
          `Vínculo inexistente: Categoria "${parsedData.category_name}" não foi encontrada no cadastro de categorias.`,
        )
      }
    }

    if (parsedData.banco_name) {
      const bncName = String(parsedData.banco_name).trim().toLowerCase()
      const bncSet = foreignReferences['banco_name']
      if (bncSet && bncSet.size > 0 && !bncSet.has(bncName)) {
        rowErrors.push(
          `Vínculo inexistente: Banco "${parsedData.banco_name}" não foi encontrado no cadastro de bancos.`,
        )
      }
    }

    if (parsedData.parent_code) {
      const pCode = String(parsedData.parent_code).trim().toLowerCase()
      const pSet = foreignReferences['parent_code']
      if (pSet && pSet.size > 0 && !pSet.has(pCode)) {
        rowErrors.push(
          `Vínculo inexistente: Conta Pai "${parsedData.parent_code}" não foi encontrada no Plano de Contas.`,
        )
      }
    }

    if (isDbDuplicate) {
      duplicatesCount++
    }

    if (rowErrors.length > 0) {
      invalidRows.push({
        rowNumber,
        data: parsedData,
        errors: rowErrors,
        isDuplicate: isDbDuplicate,
      })
    } else {
      validRows.push({
        rowNumber,
        data: parsedData,
        summary: `${name}${code ? ` (${code})` : ''}`,
      })
    }
  }

  return {
    totalRows: validRows.length + invalidRows.length,
    validRows,
    invalidRows,
    duplicatesCount,
    warning:
      ignoredCostHeaders.length > 0
        ? `Colunas de custo ignoradas (${ignoredCostHeaders.join(', ')}) — calculadas exclusivamente pelo sistema.`
        : undefined,
  }
}

/**
 * 3. EXECUÇÃO DA IMPORTAÇÃO EM LOTES (CHUNKS) COM AUDITORIA
 */
export async function executeImport(
  config: CadastroConfig,
  validRows: ValidRowItem[],
  user: any,
  onProgress?: (processed: number, total: number) => void,
): Promise<ImportExecutionResult> {
  const userName = user?.name || user?.email || 'Sistema'
  const errors: Array<{ rowNumber: number; message: string }> = []
  let successCount = 0

  const CHUNK_SIZE = 25
  const total = validRows.length

  for (let i = 0; i < total; i += CHUNK_SIZE) {
    const chunk = validRows.slice(i, i + CHUNK_SIZE)

    for (const item of chunk) {
      try {
        const payload: Record<string, unknown> = {
          ...item.data,
          active: item.data.active ?? true,
          responsible_user: userName,
        }

        // Se a coleção for de produtos, expurga qualquer valor acidental de custo
        if (config.collection === 'products') {
          delete payload.cost_price
          delete payload.last_cost
          delete payload.cost_origin
          delete payload.cost_locked
          delete payload.cost_type
        }

        // Se código não informado, gera sequencial automático
        if (!payload.code) {
          payload.code = `${config.collection.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-6)}`
        }

        // Se for empresas e tipo_unidade estiver ausente, padroniza como Matriz
        if (config.collection === 'empresas' && !payload.tipo_unidade) {
          payload.tipo_unidade = 'Matriz'
        }

        await createCadastro(config.collection, payload)
        successCount++
      } catch (err: any) {
        errors.push({
          rowNumber: item.rowNumber,
          message: err?.message || 'Erro inesperado ao gravar no PocketBase.',
        })
      }
    }

    if (onProgress) {
      onProgress(Math.min(i + CHUNK_SIZE, total), total)
    }
  }

  // 4. RASTREABILIDADE: Log de auditoria
  try {
    await registerAuditLog({
      action: 'import_excel',
      module: 'cadastros',
      target_collection: config.collection,
      target_summary: `Importação Excel realizada em "${config.label}": ${successCount} registro(s) incluído(s) com sucesso, ${errors.length} erro(s).`,
      criticidade: 'Média',
      origem: 'Importação',
      new_value: {
        tela: config.label,
        collection: config.collection,
        totalLinhasValidadas: total,
        registrosIncluidos: successCount,
        falhasGravacao: errors.length,
        executadoPor: userName,
      },
      justification: `Carga de dados em lote via importação de planilha Excel (.xlsx)`,
    })
  } catch (auditErr) {
    console.warn('Erro ao salvar auditoria de importação:', auditErr)
  }

  return {
    total,
    successCount,
    errorCount: errors.length,
    errors,
  }
}
