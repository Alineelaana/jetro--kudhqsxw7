import jetroLogoUrl from '@/assets/whatsapp-image-2026-08-09-at-23.25.57-c8e57.jpeg'

export const DEFAULT_CORPORATE_IDENTITY = {
  name: 'Jetro',
  razaoSocial: 'Jetro - Plataforma Inteligente de Gestão Empresarial',
  nomeFantasia: 'Jetro',
  cnpj: '12.345.678/0001-90',
  logo: jetroLogoUrl,
  slogan: 'Inteligência que Conecta. Tecnologia que Evolui. Resultados que Transformam.',
  address: 'Vitória, ES - Brasil',
  phone: '(27) 99999-9999',
  email: 'contato@jetrolog.com.br',
  website: 'https://jetrolog.com.br',
}

export const CORPORATE_IDENTITY = {
  ...DEFAULT_CORPORATE_IDENTITY,
  brandName: 'Jetro',
  systemName: 'Jetro',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  primaryColor: '#005B2E',
  primaryDarkColor: '#01361D',
  goldColor: '#C89B3C',
  textColor: '#1a1a1a',
  mutedTextColor: '#666666',
  bgColor: '#FFFFFF',
  altRowColor: '#F5F5F5',
}

export function getLogoUrl(): string {
  return CORPORATE_IDENTITY.logo || jetroLogoUrl
}

export function getHtmlStyles(): string {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${CORPORATE_IDENTITY.fontFamily}; color: ${CORPORATE_IDENTITY.textColor}; background-color: ${CORPORATE_IDENTITY.bgColor}; font-size: 12px; line-height: 1.5; padding: 20px; }
    .stripe-top { height: 6px; background: linear-gradient(90deg, ${CORPORATE_IDENTITY.primaryColor}, ${CORPORATE_IDENTITY.goldColor}); margin-bottom: 20px; }
    .content { max-width: 1000px; margin: 0 auto; position: relative; }
    .module-badge { display: inline-block; background-color: ${CORPORATE_IDENTITY.primaryDarkColor}; color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .header img { max-height: 48px; object-fit: contain; }
    .header h1 { font-size: 20px; font-weight: bold; color: ${CORPORATE_IDENTITY.primaryColor}; flex: 1; margin: 0 16px; }
    .header .meta { font-size: 10px; color: ${CORPORATE_IDENTITY.mutedTextColor}; text-align: right; }
    .gold-divider { height: 2px; background: ${CORPORATE_IDENTITY.goldColor}; margin: 16px 0 24px 0; }
    .section-title { font-size: 14px; font-weight: bold; color: ${CORPORATE_IDENTITY.primaryColor}; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin: 20px 0 12px 0; text-transform: uppercase; }
    .summary { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
    .summary-item { background-color: ${CORPORATE_IDENTITY.altRowColor}; padding: 10px 14px; border-radius: 6px; border-left: 3px solid ${CORPORATE_IDENTITY.goldColor}; flex: 1; min-width: 140px; }
    .summary-label { display: block; font-size: 10px; color: ${CORPORATE_IDENTITY.mutedTextColor}; margin-bottom: 2px; }
    .summary-value { display: block; font-size: 14px; font-weight: bold; color: ${CORPORATE_IDENTITY.primaryColor}; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
    th { background-color: ${CORPORATE_IDENTITY.primaryColor}; color: #ffffff; text-align: left; padding: 8px 10px; font-weight: 600; }
    td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
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
