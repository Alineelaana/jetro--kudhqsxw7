import jetroLogoUrl from '@/assets/whatsapp-image-2026-08-09-at-23.25.57-e0712.jpeg'

export const CORPORATE_IDENTITY = {
  systemName: 'Jetro Platform Enterprise',
  brandName: 'Jetro',
  slogan: 'Inteligência que Conecta | Tecnologia que Evolui | Resultados que Transformam',
  primaryColor: '#005B2E',
  primaryDarkColor: '#002817',
  goldColor: '#C89B3C',
  textColor: '#1a1a1a',
  mutedTextColor: '#666666',
  bgColor: '#ffffff',
  altRowColor: '#f7f7f5',
  borderColor: '#e0e0e0',
  fontFamily: "'Segoe UI', Arial, sans-serif",
  logoUrl: jetroLogoUrl,
} as const

export function getLogoUrl(): string {
  if (typeof window !== 'undefined') {
    return new URL(CORPORATE_IDENTITY.logoUrl, window.location.href).href
  }
  return CORPORATE_IDENTITY.logoUrl
}

export function getHtmlStyles(): string {
  const c = CORPORATE_IDENTITY
  return `@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:${c.fontFamily};color:${c.textColor}}
.stripe-top{background:linear-gradient(135deg,${c.primaryColor} 0%,${c.primaryDarkColor} 100%);height:10mm}
.content{padding:8mm 15mm 28mm}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:5mm;border-bottom:2px solid ${c.goldColor};padding-bottom:4mm}
.header img{height:52px;max-width:220px;object-fit:contain;border-radius:4px}
.header h1{flex:1;text-align:center;color:${c.primaryColor};font-size:20px;letter-spacing:1px;font-weight:bold}
.header .meta{font-size:10px;color:${c.mutedTextColor};text-align:right;min-width:120px}
.module-badge{display:inline-block;background:${c.primaryColor};color:#fff;font-size:11px;font-weight:bold;padding:3px 10px;border-radius:3px;margin-bottom:3mm}
.gold-divider{height:2px;background:linear-gradient(90deg,${c.goldColor},transparent);margin:0 0 5mm}
.summary{display:flex;flex-wrap:wrap;gap:10mm;margin-bottom:5mm}
.summary-item{background:${c.altRowColor};border:1px solid ${c.borderColor};padding:3mm 5mm;border-radius:3px}
.summary-label{display:block;font-size:9px;color:${c.mutedTextColor}}
.summary-value{display:block;font-size:14px;font-weight:bold;color:${c.primaryColor}}
.section-title{font-size:12px;font-weight:bold;color:${c.primaryColor};text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;border-bottom:2px solid ${c.goldColor};margin:5mm 0 3mm}
table{width:100%;border-collapse:collapse;font-size:10px}
thead{display:table-header-group}
th{background:${c.primaryColor};color:#fff;padding:6px;text-align:left;font-weight:bold}
td{padding:5px 6px;border-bottom:1px solid ${c.borderColor}}
tr.even{background:${c.altRowColor}}
tr{page-break-inside:avoid}
.footer{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:4mm 15mm;font-size:9px;color:${c.mutedTextColor};border-top:1px solid #ddd;background:#fff}
.footer-logo{height:24px;object-fit:contain}
.stamp{font-size:8px;color:#999;text-align:center;margin-top:3mm}`
}
