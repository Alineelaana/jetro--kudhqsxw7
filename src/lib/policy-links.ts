export interface PolicyLink {
  label: string
  to: string
}

export const POLICY_LINKS: PolicyLink[] = [
  { label: 'Política de Privacidade', to: '/politica-de-privacidade' },
  { label: 'Política Comercial', to: '/politica-comercial' },
  { label: 'Termos de Uso', to: '/termos-de-uso' },
  { label: 'Política de Cookies', to: '/politica-de-cookies' },
  { label: 'SLA', to: '/politica-de-sla' },
  { label: 'Segurança da Informação', to: '/politica-de-seguranca' },
  { label: 'Licenciamento', to: '/politica-de-licenciamento' },
  { label: 'Central de Privacidade', to: '/central-de-privacidade' },
]
