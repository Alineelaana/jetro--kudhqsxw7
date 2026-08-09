migrate(
  (app) => {
    $ai.agents.putTools(app, 'bi-adapta', [
      { collection: 'strategic_initiatives', perms: { list: true, read: true }, actAs: 'admin' },
      { collection: 'strategic_okrs', perms: { list: true, read: true }, actAs: 'admin' },
      { collection: 'strategic_key_results', perms: { list: true, read: true }, actAs: 'admin' },
      { collection: 'strategic_roadmap', perms: { list: true, read: true }, actAs: 'admin' },
      { collection: 'strategic_projects', perms: { list: true, read: true }, actAs: 'admin' },
      { collection: 'business_cases', perms: { list: true, read: true }, actAs: 'admin' },
      { collection: 'growth_experiments', perms: { list: true, read: true }, actAs: 'admin' },
      { collection: 'market_intelligence', perms: { list: true, read: true }, actAs: 'admin' },
      { collection: 'strategic_decisions', perms: { list: true, read: true }, actAs: 'admin' },
      { collection: 'strategic_indicators', perms: { list: true, read: true }, actAs: 'admin' },
    ])
  },
  (app) => {
    $ai.agents.deleteTools(app, 'bi-adapta', [
      'strategic_initiatives',
      'strategic_okrs',
      'strategic_key_results',
      'strategic_roadmap',
      'strategic_projects',
      'business_cases',
      'growth_experiments',
      'market_intelligence',
      'strategic_decisions',
      'strategic_indicators',
    ])
  },
)
