/*
 * Migration 0169 — Blueprint Collections (Revised)
 *
 * BEFORE → AFTER DIFF:
 *   REMOVED: blueprint_adrs collection (was 12th collection)
 *   REMOVED: superseded_by self-ref field on blueprint_adrs
 *   REMOVED: previous_adr_id self-ref field on blueprint_adrs
 *   ADDED:   tenant_id on 9 collections (sections, versions, relations,
 *            screen_links, chunks, packages, gaps, coverage, certifications)
 *   ADDED:   visibility_scope on 5 collections (volumes, sections, versions,
 *            chunks, packages) — chapters already had it
 *   ADDED:   slug on 3 collections (volumes, chapters, sections)
 *   CHANGED: list/view rules → multitenant deny-by-default
 *            (tenant + visibility_scope + permission, not just auth)
 *   CHANGED: write rules → SUP-only (explicit)
 *   ADDED:   unique indexes: (tenant_id, slug), (volume_id, slug),
 *            (chapter_id, slug), (chapter_id, version_number),
 *            (source_id, target_id, relation_type),
 *            (screen_route, chapter_id, section_id)
 *   ADDED:   indexes on tenant_id and visibility_scope where present
 *   KEPT:    'adr' as conceptual type in blueprint_relations selects
 *   KEPT:    parent_chapter_id, parent_section_id, previous_version_id
 *   EXCLUDED: seeds, RAG, embeddings, vector fields, content generation
 *
 * Collections created: exactly 11
 *   1. blueprint_volumes       7. blueprint_chunks
 *   2. blueprint_chapters      8. blueprint_packages
 *   3. blueprint_sections      9. blueprint_gaps
 *   4. blueprint_versions     10. blueprint_coverage
 *   5. blueprint_relations    11. blueprint_certifications
 *   6. blueprint_screen_links
 *
 * STATUS: APROVADO PARA APLICAÇÃO (pending owner authorization)
 */
migrate(
  (app) => {
    var RS = "@request.auth.role = 'SUP'"

    var readTV =
      "@request.auth.id != '' && (" +
      "@request.auth.role = 'SUP' || " +
      "((tenant_id = '' || tenant_id = @request.auth.empresa_id) && " +
      "visibility_scope != 'restrito' && " +
      "visibility_scope != 'arquitetura' && " +
      "visibility_scope != 'administrativo')" +
      ')'

    var readT =
      "@request.auth.id != '' && (" +
      "@request.auth.role = 'SUP' || " +
      "(tenant_id = '' || tenant_id = @request.auth.empresa_id)" +
      ')'

    var visScope = [
      'público',
      'cliente',
      'usuário interno',
      'implantação',
      'suporte',
      'consultoria',
      'desenvolvimento',
      'arquitetura',
      'administrativo',
      'restrito',
    ]

    var autoFields = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]

    var mk = function (name, fields, indexes, lr, vr) {
      try {
        return app.findCollectionByNameOrId(name)
      } catch (e) {}
      var allFields = []
      for (var i = 0; i < fields.length; i++) {
        allFields.push(fields[i])
      }
      for (var j = 0; j < autoFields.length; j++) {
        allFields.push(autoFields[j])
      }
      var col = new Collection({
        name: name,
        type: 'base',
        listRule: lr,
        viewRule: vr,
        createRule: RS,
        updateRule: RS,
        deleteRule: RS,
        fields: allFields,
        indexes: indexes || [],
      })
      app.save(col)
      return col
    }

    // 1. blueprint_volumes
    var volCol = mk(
      'blueprint_volumes',
      [
        { name: 'code', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'display_order', type: 'number' },
        { name: 'active', type: 'bool' },
        { name: 'tenant_id', type: 'text' },
        { name: 'locale', type: 'text' },
        { name: 'slug', type: 'text' },
        { name: 'visibility_scope', type: 'select', values: visScope, maxSelect: 1 },
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_vol_code ON blueprint_volumes (code)',
        'CREATE UNIQUE INDEX idx_bp_vol_tenant_slug ON blueprint_volumes (tenant_id, slug)',
        'CREATE INDEX idx_bp_vol_order ON blueprint_volumes (display_order)',
        'CREATE INDEX idx_bp_vol_tenant ON blueprint_volumes (tenant_id)',
        'CREATE INDEX idx_bp_vol_vis ON blueprint_volumes (visibility_scope)',
      ],
      readTV,
      readTV,
    )
    var volId = volCol.id

    // 2. blueprint_chapters
    var chCol = mk(
      'blueprint_chapters',
      [
        { name: 'volume_id', type: 'relation', collectionId: volId, maxSelect: 1 },
        { name: 'code', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'summary', type: 'text' },
        { name: 'content', type: 'text' },
        { name: 'stable_id', type: 'text' },
        { name: 'slug', type: 'text' },
        { name: 'display_order', type: 'number' },
        {
          name: 'editorial_status',
          type: 'select',
          values: ['Rascunho', 'Em Revisão', 'Publicado'],
          maxSelect: 1,
        },
        {
          name: 'technical_validity',
          type: 'select',
          values: ['Vigente', 'Em validação', 'Desatualizado', 'Substituído', 'Obsoleto'],
          maxSelect: 1,
        },
        { name: 'version_number', type: 'text' },
        {
          name: 'content_type',
          type: 'select',
          values: [
            'Arquitetura',
            'Processos',
            'Políticas',
            'Procedimentos',
            'Normas',
            'Integrações',
            'APIs',
            'Entidades',
            'Casos de Uso',
            'Fluxos BPM',
            'Regras de Negócio',
            'Guias de Implantação',
            'Guias de Parametrização',
            'Guias Operacionais',
            'Guias Técnicos',
            'Tutoriais',
            'FAQ',
            'Runbooks',
            'Playbooks',
            'Checklists',
            'Troubleshooting',
            'Release Notes',
          ],
          maxSelect: 1,
        },
        {
          name: 'knowledge_type',
          type: 'select',
          values: [
            'funcional',
            'técnico',
            'arquitetural',
            'operacional',
            'implantação',
            'suporte',
            'legal',
            'histórico',
          ],
          maxSelect: 1,
        },
        {
          name: 'content_nature',
          type: 'select',
          values: [
            'regra oficial',
            'requisito',
            'explicação',
            'procedimento',
            'recomendação',
            'decisão arquitetural',
            'histórico',
            'exemplo',
            'treinamento',
          ],
          maxSelect: 1,
        },
        { name: 'authority_level', type: 'number' },
        {
          name: 'confidence_level',
          type: 'select',
          values: [
            'Confirmado',
            'Validado',
            'Em revisão',
            'Hipótese',
            'Experimental',
            'Descontinuado',
          ],
          maxSelect: 1,
        },
        {
          name: 'maturity_level',
          type: 'select',
          values: ['Inicial', 'Parcial', 'Completo', 'Certificado', 'Corporativo'],
          maxSelect: 1,
        },
        {
          name: 'perspective',
          type: 'select',
          values: ['Usuário', 'Funcional', 'Técnico', 'Arquitetura', 'Implantação', 'Suporte'],
          maxSelect: 1,
        },
        { name: 'obsolescence_risk', type: 'text' },
        { name: 'last_validated_at', type: 'text' },
        { name: 'last_used_at', type: 'text' },
        { name: 'release_introduced', type: 'text' },
        { name: 'release_modified', type: 'text' },
        { name: 'release_discontinued', type: 'text' },
        { name: 'validity_start', type: 'text' },
        { name: 'validity_end', type: 'text' },
        { name: 'visibility_scope', type: 'select', values: visScope, maxSelect: 1 },
        { name: 'tenant_id', type: 'text' },
        { name: 'locale', type: 'text' },
        { name: 'api_enabled', type: 'bool' },
        { name: 'author', type: 'text' },
        { name: 'owner_funcional', type: 'text' },
        { name: 'owner_tecnico', type: 'text' },
        { name: 'revisores', type: 'json' },
        { name: 'aprovador', type: 'text' },
        { name: 'proxima_revisao', type: 'text' },
        {
          name: 'review_frequency',
          type: 'select',
          values: ['trimestral', 'semestral', 'anual', 'após mudança relevante'],
          maxSelect: 1,
        },
        { name: 'last_reviewed_at', type: 'text' },
        { name: 'orgao', type: 'text' },
        { name: 'norma', type: 'text' },
        { name: 'versao_norma', type: 'text' },
        { name: 'publicacao', type: 'text' },
        { name: 'vigencia_norma', type: 'text' },
        { name: 'fonte_oficial', type: 'text' },
        { name: 'data_ultima_validacao', type: 'text' },
        { name: 'workflow_id', type: 'text' },
        { name: 'knowledge_health_score', type: 'number' },
        { name: 'active', type: 'bool' },
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_ch_code ON blueprint_chapters (code)',
        'CREATE UNIQUE INDEX idx_bp_ch_stable ON blueprint_chapters (stable_id)',
        'CREATE UNIQUE INDEX idx_bp_ch_vol_slug ON blueprint_chapters (volume_id, slug)',
        'CREATE INDEX idx_bp_ch_vol ON blueprint_chapters (volume_id)',
        'CREATE INDEX idx_bp_ch_status ON blueprint_chapters (editorial_status)',
        'CREATE INDEX idx_bp_ch_validity ON blueprint_chapters (technical_validity)',
        'CREATE INDEX idx_bp_ch_order ON blueprint_chapters (display_order)',
        'CREATE INDEX idx_bp_ch_tenant ON blueprint_chapters (tenant_id)',
        'CREATE INDEX idx_bp_ch_vis ON blueprint_chapters (visibility_scope)',
      ],
      readTV,
      readTV,
    )
    var chId = chCol.id

    // 3. blueprint_sections
    var secCol = mk(
      'blueprint_sections',
      [
        { name: 'chapter_id', type: 'relation', collectionId: chId, maxSelect: 1 },
        { name: 'code', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'text' },
        { name: 'display_order', type: 'number' },
        { name: 'stable_id', type: 'text' },
        { name: 'slug', type: 'text' },
        { name: 'active', type: 'bool' },
        { name: 'tenant_id', type: 'text' },
        { name: 'visibility_scope', type: 'select', values: visScope, maxSelect: 1 },
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_sec_ch_slug ON blueprint_sections (chapter_id, slug)',
        'CREATE INDEX idx_bp_sec_ch ON blueprint_sections (chapter_id)',
        'CREATE INDEX idx_bp_sec_order ON blueprint_sections (display_order)',
        'CREATE INDEX idx_bp_sec_tenant ON blueprint_sections (tenant_id)',
        'CREATE INDEX idx_bp_sec_vis ON blueprint_sections (visibility_scope)',
      ],
      readTV,
      readTV,
    )
    var secId = secCol.id

    // 4. blueprint_versions
    var verCol = mk(
      'blueprint_versions',
      [
        { name: 'chapter_id', type: 'relation', collectionId: chId, maxSelect: 1 },
        { name: 'version_number', type: 'text' },
        { name: 'version_label', type: 'text' },
        { name: 'content_snapshot', type: 'text' },
        { name: 'content', type: 'text' },
        { name: 'author', type: 'text' },
        { name: 'approver', type: 'text' },
        { name: 'motivo', type: 'text' },
        { name: 'change_type', type: 'select', values: ['MAJOR', 'MINOR'], maxSelect: 1 },
        { name: 'affected_relations', type: 'json' },
        { name: 'published_at', type: 'text' },
        { name: 'tenant_id', type: 'text' },
        { name: 'visibility_scope', type: 'select', values: visScope, maxSelect: 1 },
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_ver_ch_num ON blueprint_versions (chapter_id, version_number)',
        'CREATE INDEX idx_bp_ver_ch ON blueprint_versions (chapter_id)',
        'CREATE INDEX idx_bp_ver_num ON blueprint_versions (version_number)',
        'CREATE INDEX idx_bp_ver_tenant ON blueprint_versions (tenant_id)',
        'CREATE INDEX idx_bp_ver_vis ON blueprint_versions (visibility_scope)',
      ],
      readTV,
      readTV,
    )

    // 5. blueprint_relations
    mk(
      'blueprint_relations',
      [
        { name: 'source_id', type: 'text' },
        {
          name: 'source_type',
          type: 'select',
          values: ['chapter', 'section', 'adr', 'volume'],
          maxSelect: 1,
        },
        { name: 'target_id', type: 'text' },
        {
          name: 'target_type',
          type: 'select',
          values: ['chapter', 'section', 'adr', 'volume'],
          maxSelect: 1,
        },
        {
          name: 'relation_type',
          type: 'select',
          values: [
            'governed_by',
            'replaces',
            'superseded_by',
            'depends_on',
            'relates_to',
            'references',
            'extends',
            'contradicts',
          ],
          maxSelect: 1,
        },
        { name: 'description', type: 'text' },
        { name: 'created_by', type: 'text' },
        { name: 'tenant_id', type: 'text' },
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_rel_trip ON blueprint_relations (source_id, target_id, relation_type)',
        'CREATE INDEX idx_bp_rel_src ON blueprint_relations (source_id)',
        'CREATE INDEX idx_bp_rel_tgt ON blueprint_relations (target_id)',
        'CREATE INDEX idx_bp_rel_type ON blueprint_relations (relation_type)',
        'CREATE INDEX idx_bp_rel_stype ON blueprint_relations (source_type)',
        'CREATE INDEX idx_bp_rel_ttype ON blueprint_relations (target_type)',
        'CREATE INDEX idx_bp_rel_tenant ON blueprint_relations (tenant_id)',
      ],
      readT,
      readT,
    )

    // 6. blueprint_screen_links
    mk(
      'blueprint_screen_links',
      [
        { name: 'screen_route', type: 'text', required: true },
        { name: 'screen_label', type: 'text' },
        { name: 'chapter_id', type: 'relation', collectionId: chId, maxSelect: 1 },
        { name: 'section_id', type: 'relation', collectionId: secId, maxSelect: 1 },
        { name: 'module_origin', type: 'text' },
        { name: 'has_documentation', type: 'bool' },
        { name: 'tenant_id', type: 'text' },
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_sl_ctx ON blueprint_screen_links (screen_route, chapter_id, section_id)',
        'CREATE INDEX idx_bp_sl_ch ON blueprint_screen_links (chapter_id)',
        'CREATE INDEX idx_bp_sl_tenant ON blueprint_screen_links (tenant_id)',
      ],
      readT,
      readT,
    )

    // 7. blueprint_chunks (NO vector/embedding field — inert)
    mk(
      'blueprint_chunks',
      [
        { name: 'chapter_id', type: 'relation', collectionId: chId, maxSelect: 1 },
        { name: 'section_id', type: 'relation', collectionId: secId, maxSelect: 1 },
        { name: 'chunk_text', type: 'text' },
        { name: 'chunk_index', type: 'number' },
        { name: 'metadata', type: 'json' },
        { name: 'tenant_id', type: 'text' },
        { name: 'visibility_scope', type: 'select', values: visScope, maxSelect: 1 },
      ],
      [
        'CREATE INDEX idx_bp_chunk_ch ON blueprint_chunks (chapter_id)',
        'CREATE INDEX idx_bp_chunk_sec ON blueprint_chunks (section_id)',
        'CREATE INDEX idx_bp_chunk_tenant ON blueprint_chunks (tenant_id)',
        'CREATE INDEX idx_bp_chunk_vis ON blueprint_chunks (visibility_scope)',
      ],
      readTV,
      readTV,
    )

    // 8. blueprint_packages
    mk(
      'blueprint_packages',
      [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'package_type',
          type: 'select',
          values: ['implantação', 'treinamento', 'operação', 'suporte'],
          maxSelect: 1,
        },
        { name: 'chapter_ids', type: 'json' },
        { name: 'status', type: 'select', values: ['rascunho', 'ativo', 'inativo'], maxSelect: 1 },
        { name: 'version', type: 'text' },
        { name: 'tenant_id', type: 'text' },
        { name: 'visibility_scope', type: 'select', values: visScope, maxSelect: 1 },
      ],
      [
        'CREATE INDEX idx_bp_pkg_status ON blueprint_packages (status)',
        'CREATE INDEX idx_bp_pkg_tenant ON blueprint_packages (tenant_id)',
        'CREATE INDEX idx_bp_pkg_vis ON blueprint_packages (visibility_scope)',
      ],
      readTV,
      readTV,
    )

    // 9. blueprint_gaps
    mk(
      'blueprint_gaps',
      [
        {
          name: 'gap_type',
          type: 'select',
          values: [
            'screen',
            'collection',
            'endpoint',
            'api',
            'module',
            'entity',
            'workflow',
            'report',
            'dashboard',
            'process',
            'service',
          ],
          maxSelect: 1,
        },
        { name: 'gap_key', type: 'text' },
        { name: 'gap_label', type: 'text' },
        { name: 'description', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['pendente', 'em_tratamento', 'resolvido'],
          maxSelect: 1,
        },
        { name: 'detected_at', type: 'text' },
        { name: 'resolved_at', type: 'text' },
        { name: 'resolved_by', type: 'text' },
        { name: 'tenant_id', type: 'text' },
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_gap_key ON blueprint_gaps (gap_type, gap_key)',
        'CREATE INDEX idx_bp_gap_type ON blueprint_gaps (gap_type)',
        'CREATE INDEX idx_bp_gap_status ON blueprint_gaps (status)',
        'CREATE INDEX idx_bp_gap_tenant ON blueprint_gaps (tenant_id)',
      ],
      readT,
      readT,
    )

    // 10. blueprint_coverage
    mk(
      'blueprint_coverage',
      [
        { name: 'entity_type', type: 'text' },
        { name: 'entity_id', type: 'text' },
        { name: 'entity_label', type: 'text' },
        { name: 'has_documentation', type: 'bool' },
        { name: 'coverage_percent', type: 'number' },
        { name: 'last_checked_at', type: 'text' },
        { name: 'details', type: 'json' },
        { name: 'tenant_id', type: 'text' },
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_cov_entity ON blueprint_coverage (entity_type, entity_id)',
        'CREATE INDEX idx_bp_cov_type ON blueprint_coverage (entity_type)',
        'CREATE INDEX idx_bp_cov_entity_id ON blueprint_coverage (entity_id)',
        'CREATE INDEX idx_bp_cov_tenant ON blueprint_coverage (tenant_id)',
      ],
      readT,
      readT,
    )

    // 11. blueprint_certifications
    mk(
      'blueprint_certifications',
      [
        { name: 'chapter_id', type: 'relation', collectionId: chId, maxSelect: 1 },
        {
          name: 'certification_type',
          type: 'select',
          values: ['structural', 'persistence', 'functional', 'integration', 'architectural'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: ['pendente', 'em_homologacao', 'homologado', 'reprovado'],
          maxSelect: 1,
        },
        { name: 'evidence', type: 'text' },
        { name: 'certified_by', type: 'text' },
        { name: 'certified_at', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'tenant_id', type: 'text' },
      ],
      [
        'CREATE INDEX idx_bp_cert_ch ON blueprint_certifications (chapter_id)',
        'CREATE INDEX idx_bp_cert_status ON blueprint_certifications (status)',
        'CREATE INDEX idx_bp_cert_tenant ON blueprint_certifications (tenant_id)',
      ],
      readT,
      readT,
    )

    // Cross-reference self-relation fields (no ADR references)
    var chC = app.findCollectionByNameOrId('blueprint_chapters')
    if (!chC.fields.getByName('parent_chapter_id')) {
      chC.fields.add(
        new RelationField({ name: 'parent_chapter_id', collectionId: chId, maxSelect: 1 }),
      )
      app.save(chC)
    }
    var secC = app.findCollectionByNameOrId('blueprint_sections')
    if (!secC.fields.getByName('parent_section_id')) {
      secC.fields.add(
        new RelationField({ name: 'parent_section_id', collectionId: secId, maxSelect: 1 }),
      )
      app.save(secC)
    }
    var verC = app.findCollectionByNameOrId('blueprint_versions')
    var verId = verC.id
    if (!verC.fields.getByName('previous_version_id')) {
      verC.fields.add(
        new RelationField({ name: 'previous_version_id', collectionId: verId, maxSelect: 1 }),
      )
      app.save(verC)
    }

    console.log('BLUEPRINT-0169: 11 collections created with multitenant deny-by-default')
  },
  (app) => {
    var cols = [
      'blueprint_certifications',
      'blueprint_coverage',
      'blueprint_gaps',
      'blueprint_packages',
      'blueprint_chunks',
      'blueprint_screen_links',
      'blueprint_relations',
      'blueprint_versions',
      'blueprint_sections',
      'blueprint_chapters',
      'blueprint_volumes',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (e) {}
    }
  },
)
