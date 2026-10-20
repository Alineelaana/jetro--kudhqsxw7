/**
 * Tema Oficial de Gráficos HURAM
 *
 * Paleta corporativa padronizada para dashboards e relatórios do ERP HURAM:
 * - Série primária / indicador principal: verde institucional #063D30
 * - Série secundária: verde esmeralda #116B50
 * - Série terciária / comparações e metas: dourado #C69B45
 * - Série quaternária / pontos estratégicos: laranja #E87517
 * - Eixos, legendas e textos: grafite #66736D
 * - Grades e linhas de apoio: #E4EAE6
 * - Fundos de gráfico: branco (#FFFFFF) / gelo (#F8FAF9)
 * - Cores semânticas de status preservadas: sucesso #10B981, erro #EF4444, alerta #F59E0B, info #3B82F6
 */

export const HURAM_CHART_COLORS = {
  // Cores de marca / séries
  primary: '#063D30', // Verde institucional HURAM
  secondary: '#116B50', // Verde esmeralda
  tertiary: '#C69B45', // Dourado
  quaternary: '#E87517', // Laranja estratégico

  // Apoio visual / estrutura
  axis: '#66736D', // Grafite para textos, eixos e legendas
  grid: '#E4EAE6', // Linhas e grades de divisão
  border: '#E4EAE6', // Bordas de containers
  bg: '#F8FAF9', // Fundo suave de cards/gráficos
  bgWhite: '#FFFFFF', // Fundo branco puro

  // Cores semânticas preservadas
  success: '#10B981', // Verde sucesso
  danger: '#EF4444', // Vermelho erro / cancelado / atrasado
  warning: '#F59E0B', // Âmbar alerta / pendente
  info: '#3B82F6', // Azul informativo / em andamento
} as const

/**
 * Sequência oficial HURAM para séries e fatias de pizza/rosca.
 * Ordenada estritamente segundo as diretrizes visuais da marca HURAM.
 */
export const HURAM_CHART_SEQUENCE = [
  HURAM_CHART_COLORS.primary, // #063D30
  HURAM_CHART_COLORS.secondary, // #116B50
  HURAM_CHART_COLORS.tertiary, // #C69B45
  HURAM_CHART_COLORS.quaternary, // #E87517
  HURAM_CHART_COLORS.info, // #3B82F6
  HURAM_CHART_COLORS.success, // #10B981
  HURAM_CHART_COLORS.warning, // #F59E0B
  HURAM_CHART_COLORS.axis, // #66736D
] as const

/**
 * Configurações padrão de eixos e grades para Recharts
 */
export const HURAM_RECHARTS_PROPS = {
  cartesianGrid: {
    stroke: HURAM_CHART_COLORS.grid,
    strokeDasharray: '3 3',
  },
  xAxis: {
    stroke: HURAM_CHART_COLORS.axis,
    tick: { fill: HURAM_CHART_COLORS.axis, fontSize: 11 },
    tickLine: false,
  },
  yAxis: {
    stroke: HURAM_CHART_COLORS.axis,
    tick: { fill: HURAM_CHART_COLORS.axis, fontSize: 11 },
    tickLine: false,
  },
} as const
