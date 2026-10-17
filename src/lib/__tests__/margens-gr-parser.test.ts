import { describe, it, expect } from 'vitest'
import {
  parseNumberBRL,
  normalizarTexto,
  detectarCabecalho,
  processarLinhas,
} from '@/lib/margens-gr-parser'
import {
  calcularLinhaMargem,
  calcularTabelaMargens,
  PARAMETROS_DEFAULT,
  type MargemParametros,
} from '@/lib/margens-gr-engine'

describe('Parser de Planilhas - Comparativo Margens GR', () => {
  it('converte valores em formato brasileiro com vírgula e R$', () => {
    expect(parseNumberBRL('R$ 1.250,50')).toBe(1250.5)
    expect(parseNumberBRL('R$ 12,50')).toBe(12.5)
    expect(parseNumberBRL('  5,90  ')).toBe(5.9)
    expect(parseNumberBRL('12.50')).toBe(12.5)
    expect(parseNumberBRL(18.9)).toBe(18.9)
    expect(parseNumberBRL('')).toBe(0)
    expect(parseNumberBRL(null)).toBe(0)
    expect(parseNumberBRL('Total')).toBe(0)
  })

  it('normaliza strings removendo acentos e espaços', () => {
    expect(normalizarTexto('Preço Rivoli')).toBe('preco rivoli')
    expect(normalizarTexto('Descrição do Produto')).toBe('descricao do produto')
  })

  it('detecta colunas e cabeçalho tolerante a variações', () => {
    const mockMatrix = [
      ['RELATORIO CORPORATIVO DE MARGENS', '', ''],
      ['GERADO EM 01/01/2025', '', ''],
      ['Item', 'Produto / Descrição', 'CMV Unitário', 'Preço Rivoli R$'],
      ['1', 'Azeitona Verde 160g', '3,50', '5,90'],
      ['2', 'Palmito Pupunha 300g', '8,20', '14,50'],
      ['', 'Total Geral', '11,70', '20,40'],
    ]

    const { headerRowIndex, headers, detected } = detectarCabecalho(mockMatrix)

    expect(headerRowIndex).toBe(2)
    expect(headers[1]).toContain('Produto')
    expect(detected.colProduto).toBe(1)
    expect(detected.colCmv).toBe(2)
    expect(detected.colPrecoRivoli).toBe(3)
    expect(detected.colOrdem).toBe(0)

    const { itensValidos, itensIgnorados } = processarLinhas(mockMatrix, headerRowIndex, detected)

    expect(itensValidos.length).toBe(2)
    expect(itensValidos[0].produto).toBe('Azeitona Verde 160g')
    expect(itensValidos[0].cmv).toBe(3.5)
    expect(itensValidos[0].preco_rivoli).toBe(5.9)

    expect(itensValidos[1].produto).toBe('Palmito Pupunha 300g')
    expect(itensValidos[1].cmv).toBe(8.2)
    expect(itensValidos[1].preco_rivoli).toBe(14.5)

    // Linha de "Total Geral" deve ter sido ignorada
    expect(itensIgnorados.length).toBe(1)
    expect(itensIgnorados[0].motivoIgnorado).toContain('totalizador')
  })

  it('recalcula margens através da engine existente', () => {
    const params: MargemParametros = {
      ...PARAMETROS_DEFAULT,
    }

    const itemCalc = calcularLinhaMargem(
      {
        id: '1',
        produto: 'Azeitona Verde 160g',
        cmv: 3.5,
        preco_rivoli: 5.9,
        ativo: true,
        ordem: 1,
      },
      params,
    )

    expect(itemCalc.precoMinimoComTributos).toBeGreaterThan(0)
    expect(itemCalc.margemFinalRs).toBeDefined()
    expect(itemCalc.margemFinalPercentual).toBeGreaterThan(0)

    const { resumo } = calcularTabelaMargens([itemCalc], params)
    expect(resumo.totalSkus).toBe(1)
    expect(resumo.margemMediaFinalPercentual).toBeGreaterThan(0)
  })
})
