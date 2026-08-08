import type { DocumentConfig } from './types'
import { CORPORATE_IDENTITY, getLogoUrl, getHtmlStyles } from './identity'
import { formatStampHtml, getMetaText } from './stamp'

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderSection(section: DocumentConfig['sections'][0]): string {
  let html = `<div class="section-title">${escapeHtml(section.title)}</div>`
  if (section.summary?.length) {
    html += '<div class="summary">'
    for (const s of section.summary) {
      html += `<div class="summary-item"><span class="summary-label">${escapeHtml(s.label)}</span><span class="summary-value">${escapeHtml(String(s.value))}</span></div>`
    }
    html += '</div>'
  }
  if (section.headers?.length && section.rows?.length) {
    const headerHtml = section.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')
    const rowsHtml = section.rows
      .map(
        (row, i) =>
          `<tr class="${i % 2 === 0 ? 'even' : ''}">${row.map((c) => `<td>${escapeHtml(String(c ?? '—'))}</td>`).join('')}</tr>`,
      )
      .join('')
    html += `<table><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>`
  }
  if (section.content) {
    html += section.content
  }
  return html
}

export function generateHtml(config: DocumentConfig): string {
  const logoUrl = config.logoUrl || getLogoUrl()
  const sectionsHtml = config.sections.map(renderSection).join('')
  const stampText = formatStampHtml(config.stamp)
  const metaText = getMetaText(config.stamp)
  const c = CORPORATE_IDENTITY
  const printScript =
    config.format === 'print' || config.format === 'pdf'
      ? '<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>'
      : ''

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>${escapeHtml(config.title)}</title>
<style>${getHtmlStyles()}</style></head><body>
<div class="stripe-top"></div>
<div class="content">
<div class="module-badge">${escapeHtml(config.module)}</div>
<div class="header">
<img src="${logoUrl}" alt="${c.brandName}" />
<h1>${escapeHtml(config.title)}</h1>
<div class="meta">${metaText}</div>
</div>
<div class="gold-divider"></div>
${sectionsHtml}
<div class="stamp">${escapeHtml(stampText)}</div>
</div>
<div class="footer">
<span>${c.systemName}</span>
<span>${escapeHtml(config.stamp.empresa)} | ${escapeHtml(config.stamp.filial)}</span>
<span>${escapeHtml(config.stamp.userName)}</span>
</div>
${printScript}
</body></html>`
}

export function renderHtmlDocument(config: DocumentConfig): string {
  const html = generateHtml(config)
  const slug = config.title.toLowerCase().replace(/\s+/g, '_')

  if (config.format === 'html') {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}_${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return `${slug}.html`
  }

  const win = window.open('', '_blank')
  if (!win) throw new Error('Pop-up bloqueado. Permita pop-ups para gerar o documento.')
  win.document.write(html)
  win.document.close()
  return `${slug}.pdf`
}
