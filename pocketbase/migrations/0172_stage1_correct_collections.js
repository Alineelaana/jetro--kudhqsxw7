migrate(
  (app) => {
    // ── 1. Drop blueprint_adrs (12th collection from 0169 — not part of the 11 approved) ──
    try {
      var adrCol = app.findCollectionByNameOrId('blueprint_adrs')
      app.delete(adrCol)
    } catch (_) {}

    // ── 2. Update blueprint_volumes access rules (has tenant_id, no visibility_scope) ──
    var volCol = app.findCollectionByNameOrId('blueprint_volumes')
    var volReadRule =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || tenant_id = '' || tenant_id = @request.auth.empresa_id)"
    volCol.listRule = volReadRule
    volCol.viewRule = volReadRule
    volCol.createRule = "@request.auth.role = 'SUP'"
    volCol.updateRule = "@request.auth.role = 'SUP'"
    volCol.deleteRule = "@request.auth.role = 'SUP'"
    volCol.addIndex('idx_bp_vol_tenant', false, 'tenant_id', '')
    app.save(volCol)

    // ── 3. Update blueprint_chapters access rules (has tenant_id AND visibility_scope) ──
    var chCol = app.findCollectionByNameOrId('blueprint_chapters')
    var chReadRule =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || ((tenant_id = '' || tenant_id = @request.auth.empresa_id) && visibility_scope != 'restrito' && visibility_scope != 'arquitetura' && visibility_scope != 'administrativo'))"
    chCol.listRule = chReadRule
    chCol.viewRule = chReadRule
    chCol.createRule = "@request.auth.role = 'SUP'"
    chCol.updateRule = "@request.auth.role = 'SUP'"
    chCol.deleteRule = "@request.auth.role = 'SUP'"
    chCol.addIndex('idx_bp_ch_tenant', false, 'tenant_id', '')
    chCol.addIndex('idx_bp_ch_visibility', false, 'visibility_scope', '')
    app.save(chCol)

    // ── 4. Update remaining collections: write = SUP only, read = authenticated ──
    var remainingCols = [
      'blueprint_sections',
      'blueprint_versions',
      'blueprint_relations',
      'blueprint_screen_links',
      'blueprint_chunks',
      'blueprint_packages',
      'blueprint_gaps',
      'blueprint_coverage',
      'blueprint_certifications',
    ]
    for (var i = 0; i < remainingCols.length; i++) {
      try {
        var col = app.findCollectionByNameOrId(remainingCols[i])
        col.listRule = "@request.auth.id != ''"
        col.viewRule = "@request.auth.id != ''"
        col.createRule = "@request.auth.role = 'SUP'"
        col.updateRule = "@request.auth.role = 'SUP'"
        col.deleteRule = "@request.auth.role = 'SUP'"
        app.save(col)
      } catch (_) {}
    }

    // ── 5. Add identity constraint: unique (chapter_id, version_number) on blueprint_versions ──
    var verCol = app.findCollectionByNameOrId('blueprint_versions')
    verCol.addIndex('idx_bp_ver_ch_num_unique', true, 'chapter_id, version_number', '')
    app.save(verCol)

    // ── 6. Add identity constraint: unique (source_id, target_id, relation_type) on blueprint_relations ──
    var relCol = app.findCollectionByNameOrId('blueprint_relations')
    relCol.addIndex('idx_bp_rel_triple_unique', true, 'source_id, target_id, relation_type', '')
    app.save(relCol)

    console.log(
      'BLUEPRINT-0172: Stage 1 corrections — dropped blueprint_adrs, applied multitenant deny-by-default rules, added identity constraints',
    )
  },
  (app) => {
    // Down: restore original rules (cannot re-create blueprint_adrs — requires full 0169 schema)
    try {
      var volCol = app.findCollectionByNameOrId('blueprint_volumes')
      volCol.listRule = "@request.auth.id != ''"
      volCol.viewRule = "@request.auth.id != ''"
      volCol.createRule = "@request.auth.role = 'SUP'"
      volCol.updateRule = "@request.auth.role = 'SUP'"
      volCol.deleteRule = "@request.auth.role = 'SUP'"
      volCol.removeIndex('idx_bp_vol_tenant')
      app.save(volCol)
    } catch (_) {}
    try {
      var chCol = app.findCollectionByNameOrId('blueprint_chapters')
      chCol.listRule = "@request.auth.id != ''"
      chCol.viewRule = "@request.auth.id != ''"
      chCol.createRule = "@request.auth.role = 'SUP'"
      chCol.updateRule = "@request.auth.role = 'SUP'"
      chCol.deleteRule = "@request.auth.role = 'SUP'"
      chCol.removeIndex('idx_bp_ch_tenant')
      chCol.removeIndex('idx_bp_ch_visibility')
      app.save(chCol)
    } catch (_) {}
    try {
      var verCol = app.findCollectionByNameOrId('blueprint_versions')
      verCol.removeIndex('idx_bp_ver_ch_num_unique')
      app.save(verCol)
    } catch (_) {}
    try {
      var relCol = app.findCollectionByNameOrId('blueprint_relations')
      relCol.removeIndex('idx_bp_rel_triple_unique')
      app.save(relCol)
    } catch (_) {}
  },
)
