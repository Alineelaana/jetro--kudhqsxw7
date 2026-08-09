#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const STABLE_ROUTES = [
  '/admin',
  '/admin/notificacoes',
  '/admin/atendimento',
  '/admin/vendas',
  '/admin/produtos',
  '/admin/cadastros',
  '/admin/tabelas-precos',
  '/admin/crm',
  '/admin/promocoes',
  '/admin/financeiro',
  '/admin/logistica',
  '/admin/transporte',
  '/admin/estoque',
  '/admin/industria',
  '/admin/fiscal',
  '/admin/conformidade',
  '/admin/rh',
  '/admin/dp',
  '/admin/sst',
  '/admin/bi',
  '/admin/ia/dashboard',
  '/admin/remuneracao',
  '/admin/configuracoes',
  '/admin/phase0-foundation',
  '/admin/platform-layer',
  '/admin/precificacao',
  '/admin/auditoria',
  '/admin/controladoria',
  '/admin/verbas-fornecedores',
]
const ALL_ALLOWED = [...STABLE_ROUTES]

const STABLE_PERM_KEYS = [
  'dashboard',
  'budgets',
  'services',
  'chat',
  'notifications',
  'partners',
  'cadastros',
  'products',
  'sales',
  'stock',
  'contracts',
  'purchasing',
  'pricing',
  'price_tables',
  'users',
  'cms',
  'audit',
  'backups',
  'ai_training',
  'configuracoes',
  'ai_module',
  'wms_consultar',
  'wms_recebimento',
  'wms_conferencia',
  'wms_aprovar_divergencia',
  'wms_enderecamento',
  'wms_armazenagem',
  'wms_reabastecimento',
  'wms_criar_ondas',
  'wms_liberar_ondas',
  'wms_separar',
  'wms_conferir_expedicao',
  'wms_liberar_expedicao',
  'wms_inventario',
  'wms_aprovar_inventario',
  'wms_transferencias',
  'wms_bloquear_lotes',
  'wms_liberar_lotes',
  'wms_custos',
  'wms_exportar',
  'wms_parametros',
  'log_consultar',
  'log_criar_rotas',
  'log_alterar_rotas',
  'log_planejar',
  'log_liberar_carregamento',
  'log_confirmar_saida',
  'log_atualizar_entregas',
  'log_registrar_ocorrencias',
  'log_aprovar_fretes',
  'log_alterar_valores_frete',
  'log_cadastrar_veiculos',
  'log_cadastrar_motoristas',
  'log_consultar_custos',
  'log_consultar_rastreamento',
  'log_consultar_comprovantes',
  'log_cancelar_entregas',
  'log_exportar',
  'fin_consultar',
  'fin_saldos',
  'fin_custos',
  'fin_criar_titulos',
  'fin_editar_titulos',
  'fin_aprovar_pagamentos',
  'fin_realizar_pagamentos',
  'fin_realizar_recebimentos',
  'fin_aplicar_descontos',
  'fin_alterar_vencimentos',
  'fin_renegociar',
  'fin_estornar',
  'fin_cancelar',
  'fin_emitir_boletos',
  'fin_gerar_pix',
  'fin_conciliar',
  'fin_abrir_caixa',
  'fin_fechar_caixa',
  'fin_reabrir_periodo',
  'fin_exportar',
  'fin_todas_empresas',
  'ind_access',
  'ind_engineering',
  'ind_production',
  'ind_planning',
  'ind_costs',
  'ind_quality',
  'ind_maintenance',
  'ind_kpis',
  'ind_traceability',
  'ind_executive',
]

const menuPath = resolve(root, 'src/lib/admin-menu-config.ts')
const permPath = resolve(root, 'src/lib/permission-matrix.ts')

let hasFailures = false

console.log('\n🔍 NAVIGATION CONTRACT VALIDATION')
console.log('   Baseline: OFFICIAL BASELINE (28 routes: 24 stable + 4 recovered)')
console.log('   No additions allowed — pure baseline only\n')

if (!existsSync(menuPath)) {
  console.error('❌ Cannot find admin-menu-config.ts')
  process.exit(1)
}

const menuSource = readFileSync(menuPath, 'utf-8')
const routePattern = /route:\s*['"`]([^'"`]+)['"`]/g
const foundRoutes = new Set()
let match
while ((match = routePattern.exec(menuSource)) !== null) {
  foundRoutes.add(match[1])
}

const missingRoutes = STABLE_ROUTES.filter((r) => !foundRoutes.has(r))
const isAllowedRoute = (route) =>
  ALL_ALLOWED.includes(route) || ALL_ALLOWED.some((p) => route.startsWith(p + '/'))
const unauthorizedRoutes = [...foundRoutes].filter((r) => !isAllowedRoute(r))

if (missingRoutes.length > 0 || unauthorizedRoutes.length > 0) {
  hasFailures = true
  console.error('❌ NAVIGATION MENU VALIDATION FAILED')
  if (missingRoutes.length > 0) {
    console.error('   Missing baseline routes:')
    missingRoutes.forEach((r) => console.error(`     - ${r}`))
  }
  if (unauthorizedRoutes.length > 0) {
    console.error('   Unauthorized routes (not in baseline):')
    unauthorizedRoutes.forEach((r) => console.error(`     - ${r}`))
  }
} else {
  console.log('✅ Navigation menu: PASS')
  console.log(`   Baseline routes: ${STABLE_ROUTES.length}`)
  console.log(`   Current routes:  ${foundRoutes.size}`)
  console.log(`   Allowed total:   ${ALL_ALLOWED.length} (+ child routes)`)
}
console.log()

if (!existsSync(permPath)) {
  console.error('❌ Cannot find permission-matrix.ts')
  process.exit(1)
}

const permSource = readFileSync(permPath, 'utf-8')
const keyPattern = /key:\s*['"`]([^'"`]+)['"`]/g
const foundPermKeys = new Set()
while ((match = keyPattern.exec(permSource)) !== null) {
  foundPermKeys.add(match[1])
}

const missingPerms = STABLE_PERM_KEYS.filter((k) => !foundPermKeys.has(k))
const unauthorizedPerms = [...foundPermKeys].filter((k) => !STABLE_PERM_KEYS.includes(k))

if (missingPerms.length > 0 || unauthorizedPerms.length > 0) {
  hasFailures = true
  console.error('❌ PERMISSION MATRIX VALIDATION FAILED')
  if (missingPerms.length > 0) {
    console.error('   Missing baseline permission keys:')
    missingPerms.forEach((k) => console.error(`     - ${k}`))
  }
  if (unauthorizedPerms.length > 0) {
    console.error('   Unauthorized permission keys:')
    unauthorizedPerms.forEach((k) => console.error(`     - ${k}`))
  }
} else {
  console.log('✅ Permission matrix: PASS')
  console.log(`   Baseline keys: ${STABLE_PERM_KEYS.length}`)
  console.log(`   Current keys:  ${foundPermKeys.size}`)
  const additions = [...foundPermKeys].filter((k) => !STABLE_PERM_KEYS.includes(k))
  console.log(`   Additions:     ${additions.length} (should be 0)`)
}
console.log()

const appPath = resolve(root, 'src/App.tsx')
if (existsSync(appPath)) {
  const appSource = readFileSync(appPath, 'utf-8')
  const missingAppRoutes = STABLE_ROUTES.filter(
    (r) => !appSource.includes(`path="${r}"`) && !appSource.includes(`path="${r}" `),
  )
  if (missingAppRoutes.length > 0) {
    hasFailures = true
    console.error('❌ ROUTER VALIDATION FAILED')
    console.error('   Routes missing from App.tsx:')
    missingAppRoutes.forEach((r) => console.error(`     - ${r}`))
  } else {
    console.log('✅ Router (App.tsx): PASS')
    console.log(`   All ${ALL_ALLOWED.length} routes found in router`)
  }
  console.log()
}

if (hasFailures) {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.error('❌ CONTRACT VALIDATION: FAILED')
  console.error('   Build/homologation must NOT proceed.')
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  process.exit(1)
} else {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ CONTRACT VALIDATION: PASSED')
  console.log('   Navigation + permissions are intact.')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  process.exit(0)
}
