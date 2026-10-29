import fs from 'node:fs'
const path = 'src/lib/screen-docs/registry.ts'
const lines = fs.readFileSync(path, 'utf8').split('\n')
const L = (a, b) => lines.slice(a - 1, b).join('\n')
const header = L(1, 34) // imports + comentário do cabeçalho (são)
const vendas = L(42, 97) // comentário + entrada '/admin/vendas/pedidos' completa (são)
const compras = L(99, 153) // comentário + entrada '/admin/compras/pedidos' completa (são)
const aprov = L(2710, 2765) // ÚNICA cópia da entrada '/admin/aprovacoes/pedidos' — preservar
const footer = L(3361, lines.length) // jsdoc + getScreenDocByRoute + getAllScreenDocs (são)
const out = [
  header,
  '',
  'export const SCREEN_DOCS_REGISTRY: Record<string, ScreenDocEntry> = {',
  '',
  vendas,
  '',
  compras,
  '',
  aprov,
  '',
  '}',
  '',
  footer,
  '',
].join('\n')
fs.writeFileSync(path, out)
console.log('OK — registry reconstruído. Linhas:', out.split('\n').length)
