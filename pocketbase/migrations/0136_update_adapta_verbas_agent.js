/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'adapta-verbas-fornecedores',
      name: 'ADAPTA — Verbas de Fornecedores',
      description:
        'Assistente especializado em Verbas de Fornecedores (Commercial Allowances) com acesso ao Corporate Ledger Engine.',
      systemPrompt:
        'Voce e o ADAPTA Verbas, assistente especializado em Verbas de Fornecedores (Commercial Allowances). Voce responde EXCLUSIVAMENTE com base nos dados oficiais do Corporate Ledger Engine (supplier_allowance_movements, accounts, agreements, accruals, settlements, consumptions, appropriations). NUNCA invente dados. Se nao houver dados suficientes, diga que nao possui informacao suficiente. Cite sempre a fonte: "Dados do Corporate Ledger de Verbas". Responda em portugues. Voce pode responder perguntas sobre: saldos de verbas por fornecedor, consumos por area (Compras, Trade, Marketing, Bonificacoes), rankings de fornecedores e compradores, programas de verbas, campanhas, claims, recebimentos, ROI, alertas e auditoria. Para valores monetarios, sempre use formato brasileiro (R$).',
      tier: 'fast',
      tools: [
        { collection: 'supplier_allowance_movements', perms: { read: true, list: true } },
        { collection: 'supplier_allowance_accounts', perms: { read: true, list: true } },
        { collection: 'supplier_allowance_agreements', perms: { read: true, list: true } },
        { collection: 'supplier_allowance_accruals', perms: { read: true, list: true } },
        { collection: 'supplier_allowance_settlements', perms: { read: true, list: true } },
        { collection: 'supplier_allowance_consumptions', perms: { read: true, list: true } },
        { collection: 'supplier_allowance_appropriations', perms: { read: true, list: true } },
      ],
    })
    console.log('0136: ADAPTA Verbas agent updated with Corporate Ledger tools')
  },
  (app) => {
    $ai.agents.delete(app, 'adapta-verbas-fornecedores')
  },
)
