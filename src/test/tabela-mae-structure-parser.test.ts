import { describe, it, expect } from 'vitest'
import { analyzeSheetStructure, normalizar } from '@/lib/tabela-mae-structure-parser'
import type { ExtractedSheetInfo } from '@/lib/spreadsheet-file-utils'

describe('tabela-mae-structure-parser', () => {
  it('normaliza strings corretamente removendo acentos e espaços', () => {
    expect(normalizar('CÓD SANKHYA')).toBe('cod sankhya')
    expect(normalizar('DESCRIÇÃO DO PRODUTO')).toBe('descricao do produto')
    expect(normalizar('SACHÊ 80/100G')).toBe('sache 80/100g')
  })

  it('detecta cabeçalhos em 2 linhas (grupo + campo) e preserva dados', () => {
    // Matriz sintética: Linha 1 = grupos, Linha 2 = campos, Linhas 3 e 4 = dados sintéticos
    const syntheticMatrix = [
      ['', '', '', '', 'UNIDADES', '', '', 'CAIXA'],
      ['CÓD', 'COD SANKHYA', 'PRODUTO', 'CUSTO NOVO', 'MARGEM', 'VAREJO', 'PV CX'],
      ['101', '9001', 'ITEM DE TESTE A', '10.50', '0.45', '19.00', '190.00'],
      ['102', '9002', 'ITEM DE TESTE B', '20.00', '0.45', '36.00', '360.00'],
    ]

    const sheetInfo: ExtractedSheetInfo = {
      index: 0,
      sheetId: 'sheet-test-1',
      name: 'TABELA MÃE TESTE',
      sheetPath: 'xl/worksheets/sheet1.xml',
      cells: {},
      maxCol: 6,
      maxRow: 4,
      totalNonEmptyCells: 20,
      totalNonEmptyRows: 4,
      rawMatrix: syntheticMatrix,
      formulaCount: 0,
      unsupportedFormulas: [],
    }

    const analysis = analyzeSheetStructure(sheetInfo)

    expect(analysis.headerRowsCount).toBe(2)
    expect(analysis.dataRowsCount).toBe(2)
    expect(analysis.columns.length).toBeGreaterThanOrEqual(7)
    // Verifica que reconheceu campo CÓD / COD SANKHYA
    const hasCod = analysis.columns.some((c) => c.normalizedHeader.includes('cod'))
    expect(hasCod).toBe(true)
  })

  it('detecta coluna com título repetido e a marca como excluída por padrão', () => {
    // Linha 1: Cabeçalhos reais, exceto coluna 0 que tem título longo de estado repetido em 5 linhas
    const titleRepetido = 'TABELA ESTADUAL - VAREJO REGIAO SUDESTE ATUALIZADA 2026'
    const syntheticMatrix = [
      [titleRepetido, 'COD SANKHYA', 'PRODUTO', 'CÓD. EAN', 'CÓD. DUN', 'PRECO CX'],
      [titleRepetido, '1111', 'PRODUTO SINTÉTICO 1', '7891234567890', '17891234567897', '50.00'],
      [titleRepetido, '2222', 'PRODUTO SINTÉTICO 2', '7891234567891', '17891234567898', '60.00'],
      [titleRepetido, '3333', 'PRODUTO SINTÉTICO 3', '7891234567892', '17891234567899', '70.00'],
      [titleRepetido, '4444', 'PRODUTO SINTÉTICO 4', '7891234567893', '17891234567890', '80.00'],
    ]

    const sheetInfo: ExtractedSheetInfo = {
      index: 1,
      sheetId: 'sheet-test-2',
      name: 'TAB VAREJO TESTE',
      sheetPath: 'xl/worksheets/sheet2.xml',
      cells: {},
      maxCol: 5,
      maxRow: 5,
      totalNonEmptyCells: 25,
      totalNonEmptyRows: 5,
      rawMatrix: syntheticMatrix,
      formulaCount: 0,
      unsupportedFormulas: [],
    }

    const analysis = analyzeSheetStructure(sheetInfo)

    // Coluna 0 deve ser detectada como constante / título repetido
    expect(analysis.columns[0].isConstantTitle).toBe(true)
    expect(analysis.columns[0].included).toBe(false)

    // Colunas de EAN e DUN devem ser detectadas com tipo code_ean_dun
    const eanCol = analysis.columns.find((c) => c.normalizedHeader.includes('ean'))
    expect(eanCol).toBeDefined()
    expect(eanCol?.detectedType).toBe('code_ean_dun')
  })

  it('detecta blocos de seção no meio dos dados e os preserva estilizados', () => {
    // Matriz com separadores verticais no meio dos dados
    const syntheticMatrix = [
      ['COD', 'PRODUTO', 'CUSTO'],
      ['VIDRO 200/160G', '', ''], // Linha de Seção 1
      ['1001', 'ITEM A', '5.00'],
      ['1002', 'ITEM B', '6.00'],
      ['SACHÊ 80/100G', '', ''], // Linha de Seção 2
      ['2001', 'ITEM C', '1.50'],
    ]

    const sheetInfo: ExtractedSheetInfo = {
      index: 2,
      sheetId: 'sheet-test-3',
      name: 'CMV TESTE',
      sheetPath: 'xl/worksheets/sheet3.xml',
      cells: {},
      maxCol: 2,
      maxRow: 6,
      totalNonEmptyCells: 14,
      totalNonEmptyRows: 6,
      rawMatrix: syntheticMatrix,
      formulaCount: 0,
      unsupportedFormulas: [],
    }

    const analysis = analyzeSheetStructure(sheetInfo)

    expect(analysis.hasSections).toBe(true)
    expect(analysis.sectionRowsCount).toBe(2)
    expect(analysis.dataRowsCount).toBe(3)
    expect(analysis.detectedSections).toContain('VIDRO 200/160G')
    expect(analysis.detectedSections).toContain('SACHÊ 80/100G')
  })
})
