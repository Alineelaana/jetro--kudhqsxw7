import { logoHuramLight } from '@/lib/brand-assets'

export const DEFAULT_CORPORATE_IDENTITY = {
  name: 'HURAM',
  razaoSocial: 'HURAM — Sistema Inteligente de Gestão',
  nomeFantasia: 'HURAM',
  cnpj: '12.345.678/0001-90',
  logo: logoHuramLight,
  slogan: 'Sistema Inteligente de Gestão',
  address: 'Centro Corporativo de Operações',
  phone: '(27) 99999-9999',
  email: 'contato@huram.com.br',
  website: 'https://huram.com.br',
}

export const CORPORATE_IDENTITY = {
  ...DEFAULT_CORPORATE_IDENTITY,
  brandName: 'HURAM',
  systemName: 'HURAM — Sistema Inteligente de Gestão',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  primaryColor: '#063D30',
  primaryDarkColor: '#042820',
  emeraldColor: '#116B50',
  goldColor: '#C69B45',
  orangeColor: '#E87517',
  textColor: '#202B28',
  mutedTextColor: '#66736D',
  bgColor: '#FFFFFF',
  altRowColor: '#F8FAF9',
  borderColor: '#E4EAE6',
}

export function getLogoUrl(): string {
  return CORPORATE_IDENTITY.logo || logoHuramLight
}

export function getHtmlStyles(): string {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${CORPORATE_IDENTITY.fontFamily}; color: ${CORPORATE_IDENTITY.textColor}; background-color: ${CORPORATE_IDENTITY.bgColor}; font-size: 12px; line-height: 1.5; padding: 20px; }
    .stripe-top { height: 6px; background: linear-gradient(90deg, ${CORPORATE_IDENTITY.primaryColor}, ${CORPORATE_IDENTITY.goldColor}); margin-bottom: 20px; }
    .content { max-width: 1000px; margin: 0 auto; position: relative; }
    .module-badge { display: inline-block; background-color: ${CORPORATE_IDENTITY.primaryColor}; color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .header img { max-height: 48px; object-fit: contain; }
    .header h1 { font-size: 20px; font-weight: bold; color: ${CORPORATE_IDENTITY.primaryColor}; flex: 1; margin: 0 16px; }
    .header .meta { font-size: 10px; color: ${CORPORATE_IDENTITY.mutedTextColor}; text-align: right; }
    .gold-divider { height: 2px; background: ${CORPORATE_IDENTITY.goldColor}; margin: 16px 0 24px 0; }
    .section-title { font-size: 14px; font-weight: bold; color: ${CORPORATE_IDENTITY.primaryColor}; border-bottom: 1px solid ${CORPORATE_IDENTITY.borderColor}; padding-bottom: 4px; margin: 20px 0 12px 0; text-transform: uppercase; }
    .summary { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
    .summary-item { background-color: ${CORPORATE_IDENTITY.altRowColor}; padding: 10px 14px; border-radius: 6px; border: 1px solid ${CORPORATE_IDENTITY.borderColor}; border-left: 3px solid ${CORPORATE_IDENTITY.goldColor}; flex: 1; min-width: 140px; }
    .summary-label { display: block; font-size: 10px; color: ${CORPORATE_IDENTITY.mutedTextColor}; margin-bottom: 2px; }
    .summary-value { display: block; font-size: 14px; font-weight: bold; color: ${CORPORATE_IDENTITY.primaryColor}; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
    th { background-color: ${CORPORATE_IDENTITY.primaryColor}; color: #ffffff; text-align: left; padding: 8px 10px; font-weight: 600; }
    td { padding: 8px 10px; border-bottom: 1px solid ${CORPORATE_IDENTITY.borderColor}; color: ${CORPORATE_IDENTITY.textColor}; }
    tr.even { background-color: ${CORPORATE_IDENTITY.altRowColor}; }
    .stamp { font-size: 9px; color: ${CORPORATE_IDENTITY.mutedTextColor}; margin-top: 30px; padding-top: 12px; border-top: 1px dashed #d1d5db; text-align: center; }
    .footer { margin-top: 24px; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10px; color: ${CORPORATE_IDENTITY.mutedTextColor}; border-top: 1px solid #e5e7eb; }
    @media print {
      body { padding: 0; font-size: 10pt; }
      .stripe-top { height: 4px; }
      th { background-color: ${CORPORATE_IDENTITY.primaryColor} !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tr.even { background-color: ${CORPORATE_IDENTITY.altRowColor} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `
}
