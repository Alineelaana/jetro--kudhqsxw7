import {
  type MargemCalculadaRow,
  type MargemResumo,
  type MargemParametros,
  formatCurrencyBRL,
  formatPercent,
  formatPercentDirect,
} from '@/lib/margens-gr-engine'

// Definição das colunas para exportação
export const MARGENS_COLUNAS_EXCEL = [
  'Produto',
  'CMV (R$)',
  'Preço Rivoli (R$)',
  'Preço mínimo c/ tributos (R$)',
  'ICMS (R$)',
  'PIS (R$)',
  'COFINS (R$)',
  'Comissão 3% (R$)',
  'Frete 3% (R$)',
  'Margem final R$',
  'Margem final %',
]

/**
 * Escapa strings para formato CSV
 */
function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return '""'
  const str = String(val).replace(/"/g, '""')
  return `"${str}"`
}

/**
 * Exporta para arquivo .csv (compatível com Excel / UTF-8 com BOM)
 */
export function exportMargensToExcel(
  linhas: MargemCalculadaRow[],
  resumo: MargemResumo,
  filename = 'comparativo_margens_gr.csv',
) {
  const lines: string[] = []

  // Bloco cabeçalho
  lines.push(escapeCsv('GRAN ROMANO — MARGEM FINAL VENDENDO AO PREÇO RIVOLI') + ';;;;;;;;;;')
  lines.push(
    escapeCsv(
      'Nota: comissão e frete são calculados diretamente sobre o PREÇO RIVOLI, assim como ICMS, PIS e COFINS.',
    ) + ';;;;;;;;;;',
  )
  lines.push('')

  // Linha de cabeçalho das colunas
  lines.push(
    [
      'Produto',
      'CMV',
      'Preço Rivoli',
      'Preço mínimo c/ tributos',
      'ICMS',
      'PIS',
      'COFINS',
      'Comissão s/ Rivoli',
      'Frete s/ Rivoli',
      'Margem final R$',
      'Margem final %',
    ]
      .map(escapeCsv)
      .join(';'),
  )

  // Linhas de dados
  for (const r of linhas) {
    const rowValues = [
      r.produto,
      r.cmv.toFixed(2).replace('.', ','),
      r.preco_rivoli.toFixed(2).replace('.', ','),
      r.precoMinimoComTributos.toFixed(4).replace('.', ','),
      r.icmsValor.toFixed(4).replace('.', ','),
      r.pisValor.toFixed(4).replace('.', ','),
      r.cofinsValor.toFixed(4).replace('.', ','),
      r.comissaoValor.toFixed(4).replace('.', ','),
      r.freteValor.toFixed(4).replace('.', ','),
      r.margemFinalRs.toFixed(4).replace('.', ','),
      (r.margemFinalPercentual * 100).toFixed(2).replace('.', ',') + '%',
    ]
    lines.push(rowValues.map(escapeCsv).join(';'))
  }

  // Bloco RESUMO
  lines.push('')
  lines.push(escapeCsv('RESUMO') + ';' + escapeCsv('Valor') + ';' + escapeCsv('Leitura'))
  lines.push(
    escapeCsv('Tributos') +
      ';' +
      escapeCsv(resumo.totalTributosPercentual.toFixed(2).replace('.', ',') + '%') +
      ';' +
      escapeCsv(
        'ICMS + PIS + COFINS = ' +
          resumo.totalTributosPercentual.toFixed(2).replace('.', ',') +
          '%',
      ),
  )
  lines.push(
    escapeCsv('Comissão + frete') +
      ';' +
      escapeCsv(resumo.totalComissaoFretePercentual.toFixed(2).replace('.', ',') + '%') +
      ';' +
      escapeCsv('Calculados diretamente sobre o preço Rivoli'),
  )
  lines.push(
    escapeCsv('Margem média final') +
      ';' +
      escapeCsv((resumo.margemMediaFinalPercentual * 100).toFixed(2).replace('.', ',') + '%') +
      ';' +
      escapeCsv('após CMV + tributos + comissão + frete'),
  )
  lines.push(
    escapeCsv('SKUs com margem negativa') +
      ';' +
      escapeCsv(resumo.skusNegativosCount) +
      ';' +
      escapeCsv(`de ${resumo.totalSkus} SKUs`),
  )

  // UTF-8 BOM para garantir correta acentuação no Excel
  const csvContent = '\uFEFF' + lines.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Exporta para PDF gerando janela estilizada com padrão JETRO para impressão/salvamento.
 */
export function exportMargensToPdf(
  linhas: MargemCalculadaRow[],
  resumo: MargemResumo,
  parametros: MargemParametros,
) {
  const win = window.open('', '_blank')
  if (!win) {
    alert('Por favor, permita pop-ups para gerar a versão PDF.')
    return
  }

  const esc = (s: string) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  const linhasHtml = linhas
    .map((l) => {
      const isNeg = l.isMargemNegativa
      const negClass = isNeg
        ? 'style="color: #b91c1c; font-weight: bold; background-color: #fef2f2;"'
        : ''
      return `
      <tr>
        <td style="text-align: left; font-weight: 500;">${esc(l.produto)}</td>
        <td style="text-align: right;">${formatCurrencyBRL(l.cmv)}</td>
        <td style="text-align: right; font-weight: 600;">${formatCurrencyBRL(l.preco_rivoli)}</td>
        <td style="text-align: right; color: #4b5563;">${formatCurrencyBRL(l.precoMinimoComTributos)}</td>
        <td style="text-align: right;">${formatCurrencyBRL(l.icmsValor)}</td>
        <td style="text-align: right;">${formatCurrencyBRL(l.pisValor)}</td>
        <td style="text-align: right;">${formatCurrencyBRL(l.cofinsValor)}</td>
        <td style="text-align: right;">${formatCurrencyBRL(l.comissaoValor)}</td>
        <td style="text-align: right;">${formatCurrencyBRL(l.freteValor)}</td>
        <td style="text-align: right;" ${negClass}>${formatCurrencyBRL(l.margemFinalRs)}</td>
        <td style="text-align: right;" ${negClass}>${formatPercent(l.margemFinalPercentual)}</td>
      </tr>`
    })
    .join('')

  const dataEmissao = new Date().toLocaleString('pt-BR')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Comparativo Margens GR — Jetro ERP</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 20px;
      color: #1f2937;
      background: #fff;
      font-size: 10px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #005B2E;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand {
      background: #005B2E;
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      padding: 6px 16px;
      border-radius: 4px;
      letter-spacing: 1px;
    }
    .brand span { color: #C9A227; }
    h1 {
      font-size: 16px;
      margin: 0;
      color: #005B2E;
      font-weight: bold;
    }
    .subtitle {
      font-size: 11px;
      color: #4b5563;
      margin-top: 2px;
    }
    .meta {
      font-size: 10px;
      color: #6b7280;
      text-align: right;
    }
    .notice {
      background: #F4FBF7;
      border-left: 4px solid #005B2E;
      padding: 8px 12px;
      font-size: 10px;
      margin-bottom: 14px;
      color: #14532d;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      margin-top: 10px;
    }
    th {
      background: #005B2E;
      color: #fff;
      text-align: right;
      padding: 6px 5px;
      border: 1px solid #004523;
      font-weight: 600;
    }
    th:first-child { text-align: left; }
    td {
      padding: 5px 5px;
      border: 1px solid #e5e7eb;
    }
    tr:nth-child(even) td { background-color: #f9fafb; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 20px;
    }
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px;
      border-top: 3px solid #005B2E;
    }
    .summary-card.alert {
      border-top-color: #dc2626;
      background: #fef2f2;
    }
    .summary-card .label {
      font-size: 9px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .summary-card .val {
      font-size: 15px;
      font-weight: bold;
      color: #0f172a;
    }
    .summary-card .desc {
      font-size: 8.5px;
      color: #64748b;
      margin-top: 2px;
    }
    @media print {
      body { margin: 8mm; }
      @page { size: A4 landscape; margin: 8mm; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-wrap">
      <div class="brand">JETRO<span>.</span></div>
      <div>
        <h1>GRAN ROMANO — MARGEM FINAL VENDENDO AO PREÇO RIVOLI</h1>
        <div class="subtitle">Módulo Planilhas Convertidas • Comparativo Margens GR</div>
      </div>
    </div>
    <div class="meta">
      <div><strong>Emissão:</strong> ${dataEmissao}</div>
      <div><strong>Total de Itens:</strong> ${linhas.length} SKU(s)</div>
      <div><strong>Alíquotas:</strong> Trib: ${formatPercentDirect(resumo.totalTributosPercentual)} | Com+Frete: ${formatPercentDirect(resumo.totalComissaoFretePercentual)}</div>
    </div>
  </div>

  <div class="notice">
    <strong>Premissa Documental da Planilha:</strong> Comissão de ${formatPercentDirect(parametros.comissaoPercentual)} e Frete de ${formatPercentDirect(parametros.fretePercentual)} são calculados diretamente sobre o <strong>PREÇO RIVOLI</strong> (preço efetivo de venda), assim como ICMS (${formatPercentDirect(parametros.icmsPercentual)}), PIS (${formatPercentDirect(parametros.pisPercentual)}) e COFINS (${formatPercentDirect(parametros.cofinsPercentual)}). O Preço Mínimo Tributado considera CMV + Tributos.
  </div>

  <table>
    <thead>
      <tr>
        <th>Produto</th>
        <th>CMV</th>
        <th>Preço Rivoli</th>
        <th>Preço Mín. c/ Trib.</th>
        <th>ICMS (${formatPercentDirect(parametros.icmsPercentual)})</th>
        <th>PIS (${formatPercentDirect(parametros.pisPercentual)})</th>
        <th>COFINS (${formatPercentDirect(parametros.cofinsPercentual)})</th>
        <th>Comissão (${formatPercentDirect(parametros.comissaoPercentual)})</th>
        <th>Frete (${formatPercentDirect(parametros.fretePercentual)})</th>
        <th>Margem Final R$</th>
        <th>Margem Final %</th>
      </tr>
    </thead>
    <tbody>
      ${linhasHtml}
    </tbody>
  </table>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">Tributos Totais</div>
      <div class="val">${formatPercentDirect(resumo.totalTributosPercentual)}</div>
      <div class="desc">ICMS + PIS + COFINS</div>
    </div>
    <div class="summary-card">
      <div class="label">Comissão + Frete</div>
      <div class="val">${formatPercentDirect(resumo.totalComissaoFretePercentual)}</div>
      <div class="desc">Calculados sobre Rivoli</div>
    </div>
    <div class="summary-card">
      <div class="label">Margem Média Final</div>
      <div class="val" style="color: #005B2E;">${formatPercent(resumo.margemMediaFinalPercentual)}</div>
      <div class="desc">Média sobre todos os SKUs</div>
    </div>
    <div class="summary-card ${resumo.skusNegativosCount > 0 ? 'alert' : ''}">
      <div class="label">SKUs c/ Margem Negativa</div>
      <div class="val" style="color: ${resumo.skusNegativosCount > 0 ? '#b91c1c' : '#059669'};">
        ${resumo.skusNegativosCount} <span style="font-size: 11px; font-weight: normal; color: #64748b;">de ${resumo.totalSkus}</span>
      </div>
      <div class="desc">${resumo.skusNegativosCount > 0 ? 'Atenção para risco de margem' : 'Nenhum SKU negativo'}</div>
    </div>
  </div>

  <script>
    window.onload = function () {
      setTimeout(function () {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`

  win.document.open()
  win.document.write(html)
  win.document.close()
}
