import type { MargemCalculadaRow, MargemParametros } from '@/lib/margens-gr-engine'
import type { SheetData, WorkbookData } from '@/types/spreadsheet'
import { colIndexToLetter } from '@/lib/spreadsheet-formula-engine'

/**
 * Converte os dados do Comparativo de Margens GR em um WorkbookData totalmente funcional
 * com fórmulas reais nas colunas calculadas.
 *
 * Colunas na aba Comparativo:
 * A: Produto
 * B: CMV
 * C: Preço Rivoli
 * D: Preço mínimo c/ tributos -> =B{r}+(C{r}*'Premissas & Parâmetros'!B6)
 * E: ICMS -> =C{r}*'Premissas & Parâmetros'!B1
 * F: PIS -> =C{r}*'Premissas & Parâmetros'!B2
 * G: COFINS -> =C{r}*'Premissas & Parâmetros'!B3
 * H: Comissão 3% s/ Rivoli -> =C{r}*'Premissas & Parâmetros'!B4
 * I: Frete 3% s/ Rivoli -> =C{r}*'Premissas & Parâmetros'!B5
 * J: Margem final R$ -> =C{r}-B{r}-E{r}-F{r}-G{r}-H{r}-I{r}
 * K: Margem final % -> =SE(C{r}>0; J{r}/C{r}; 0)
 */
export function buildComparativoWorkbook(
  items: Array<{ produto: string; cmv: number; preco_rivoli: number }>,
  params: MargemParametros,
): WorkbookData {
  // 1. Aba Premissas & Parâmetros
  const paramCells: SheetData['cells'] = {
    A1: { raw: 'ICMS sobre preço Rivoli', style: { bold: true } },
    B1: { raw: (params.icmsPercentual / 100).toString(), style: { format: 'percent' } },

    A2: { raw: 'PIS sobre preço Rivoli', style: { bold: true } },
    B2: { raw: (params.pisPercentual / 100).toString(), style: { format: 'percent' } },

    A3: { raw: 'COFINS sobre preço Rivoli', style: { bold: true } },
    B3: { raw: (params.cofinsPercentual / 100).toString(), style: { format: 'percent' } },

    A4: { raw: 'Comissão sobre preço Rivoli', style: { bold: true } },
    B4: { raw: (params.comissaoPercentual / 100).toString(), style: { format: 'percent' } },

    A5: { raw: 'Frete sobre preço Rivoli', style: { bold: true } },
    B5: { raw: (params.fretePercentual / 100).toString(), style: { format: 'percent' } },

    A6: { raw: 'Tributos somados (ICMS+PIS+COFINS)', style: { bold: true } },
    B6: { raw: '=B1+B2+B3', formula: 'B1+B2+B3', style: { format: 'percent', bold: true } },

    A7: { raw: 'Total deduções sobre preço Rivoli', style: { bold: true } },
    B7: {
      raw: '=B1+B2+B3+B4+B5',
      formula: 'B1+B2+B3+B4+B5',
      style: { format: 'percent', bold: true },
    },
  }

  const sheetParametros: SheetData = {
    id: 'sheet-parametros',
    name: 'Premissas & Parâmetros',
    cells: paramCells,
    columns: [
      { id: 'A', width: 280, title: 'Premissa' },
      { id: 'B', width: 140, title: 'Alíquota' },
    ],
    rowsCount: 20,
    order: 1,
  }

  // 2. Aba Comparativo
  const comparativoCells: SheetData['cells'] = {}

  // Linha 1: Cabeçalho
  const headers = [
    { id: 'A', title: 'Produto', width: 240 },
    { id: 'B', title: 'CMV (R$)', width: 110 },
    { id: 'C', title: 'Preço Rivoli (R$)', width: 120 },
    { id: 'D', title: 'Preço mín. c/ tributos', width: 140 },
    { id: 'E', title: 'ICMS 1,20%', width: 100 },
    { id: 'F', title: 'PIS 1,45%', width: 100 },
    { id: 'G', title: 'COFINS 6,68%', width: 110 },
    { id: 'H', title: 'Comissão 3%', width: 100 },
    { id: 'I', title: 'Frete 3%', width: 100 },
    { id: 'J', title: 'Margem final R$', width: 120 },
    { id: 'K', title: 'Margem final %', width: 110 },
  ]

  headers.forEach((h) => {
    comparativoCells[`${h.id}1`] = {
      raw: h.title,
      style: {
        bold: true,
        align: 'center',
        bgColor: '#01361D',
        textColor: '#FFFFFF',
      },
    }
  })

  // Linhas de dados (se houver items cadastrados)
  items.forEach((item, idx) => {
    const r = idx + 2 // Linha 2 em diante
    comparativoCells[`A${r}`] = { raw: item.produto, style: { bold: false, align: 'left' } }
    comparativoCells[`B${r}`] = {
      raw: item.cmv.toString(),
      style: { format: 'currency', align: 'right', bgColor: '#FFFBEB' },
    }
    comparativoCells[`C${r}`] = {
      raw: item.preco_rivoli.toString(),
      style: { format: 'currency', align: 'right', bgColor: '#FFFBEB', bold: true },
    }

    // Fórmulas dinâmicas das colunas calculadas
    // Preço mínimo c/ tributos: B{r} + (C{r} * 'Premissas & Parâmetros'!B6)
    comparativoCells[`D${r}`] = {
      raw: `=B${r}+(C${r}*'Premissas & Parâmetros'!B6)`,
      formula: `B${r}+(C${r}*'Premissas & Parâmetros'!B6)`,
      style: { format: 'currency', align: 'right', bgColor: '#F8FAFC' },
    }

    // ICMS
    comparativoCells[`E${r}`] = {
      raw: `=C${r}*'Premissas & Parâmetros'!B1`,
      formula: `C${r}*'Premissas & Parâmetros'!B1`,
      style: { format: 'currency', align: 'right' },
    }

    // PIS
    comparativoCells[`F${r}`] = {
      raw: `=C${r}*'Premissas & Parâmetros'!B2`,
      formula: `C${r}*'Premissas & Parâmetros'!B2`,
      style: { format: 'currency', align: 'right' },
    }

    // COFINS
    comparativoCells[`G${r}`] = {
      raw: `=C${r}*'Premissas & Parâmetros'!B3`,
      formula: `C${r}*'Premissas & Parâmetros'!B3`,
      style: { format: 'currency', align: 'right' },
    }

    // COMISSÃO
    comparativoCells[`H${r}`] = {
      raw: `=C${r}*'Premissas & Parâmetros'!B4`,
      formula: `C${r}*'Premissas & Parâmetros'!B4`,
      style: { format: 'currency', align: 'right' },
    }

    // FRETE
    comparativoCells[`I${r}`] = {
      raw: `=C${r}*'Premissas & Parâmetros'!B5`,
      formula: `C${r}*'Premissas & Parâmetros'!B5`,
      style: { format: 'currency', align: 'right' },
    }

    // MARGEM FINAL R$
    comparativoCells[`J${r}`] = {
      raw: `=C${r}-B${r}-E${r}-F${r}-G${r}-H${r}-I${r}`,
      formula: `C${r}-B${r}-E${r}-F${r}-G${r}-H${r}-I${r}`,
      style: { format: 'currency', align: 'right', bold: true, bgColor: '#F0FDF4' },
    }

    // MARGEM FINAL %
    comparativoCells[`K${r}`] = {
      raw: `=SE(C${r}>0; J${r}/C${r}; 0)`,
      formula: `SE(C${r}>0; J${r}/C${r}; 0)`,
      style: { format: 'percent', align: 'right', bold: true, bgColor: '#F0FDF4' },
    }
  })

  // Se houver itens, adiciona linha de resumo com fórmulas SOMA e MÉDIA
  if (items.length > 0) {
    const summaryRow = items.length + 2
    comparativoCells[`A${summaryRow}`] = {
      raw: `Totais (${items.length} itens)`,
      style: { bold: true, align: 'left', bgColor: '#F1F5F9' },
    }
    comparativoCells[`B${summaryRow}`] = {
      raw: `=SOMA(B2:B${summaryRow - 1})`,
      formula: `SOMA(B2:B${summaryRow - 1})`,
      style: { format: 'currency', align: 'right', bold: true, bgColor: '#F1F5F9' },
    }
    comparativoCells[`C${summaryRow}`] = {
      raw: `=SOMA(C2:C${summaryRow - 1})`,
      formula: `SOMA(C2:C${summaryRow - 1})`,
      style: { format: 'currency', align: 'right', bold: true, bgColor: '#F1F5F9' },
    }
    comparativoCells[`J${summaryRow}`] = {
      raw: `=SOMA(J2:J${summaryRow - 1})`,
      formula: `SOMA(J2:J${summaryRow - 1})`,
      style: { format: 'currency', align: 'right', bold: true, bgColor: '#F1F5F9' },
    }
    comparativoCells[`K${summaryRow}`] = {
      raw: `=MEDIA(K2:K${summaryRow - 1})`,
      formula: `MEDIA(K2:K${summaryRow - 1})`,
      style: { format: 'percent', align: 'right', bold: true, bgColor: '#F1F5F9' },
    }
  }

  const sheetComparativo: SheetData = {
    id: 'sheet-comparativo',
    name: 'Comparativo',
    cells: comparativoCells,
    columns: headers.map((h) => ({ id: h.id, width: h.width, title: h.title })),
    rowsCount: Math.max(items.length + 15, 30),
    order: 0,
  }

  return {
    sheets: [sheetComparativo, sheetParametros],
    activeSheetIndex: 0,
  }
}
