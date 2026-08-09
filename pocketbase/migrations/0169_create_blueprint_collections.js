migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var RS = "@request.auth.role = 'SUP'"

    function AD() {
      return [
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ]
    }

    function mk(name, fields, indexes) {
      try {
        return app.findCollectionByNameOrId(name)
      } catch (_) {}
      var col = new Collection({
        name: name,
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: RS,
        updateRule: RS,
        deleteRule: RS,
        fields: fields.concat(AD()),
        indexes: indexes || [],
      })
      app.save(col)
      return col
    }

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
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_vol_code ON blueprint_volumes (code)',
        'CREATE INDEX idx_bp_vol_order ON blueprint_volumes (display_order)',
      ],
    )
    var volId = volCol.id

    var chCol = mk(
      'blueprint_chapters',
      [
        { name: 'volume_id', type: 'relation', collectionId: volId, maxSelect: 1 },
        { name: 'code', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'summary', type: 'text' },
        { name: 'content', type: 'text' },
        { name: 'stable_id', type: 'text' },
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
        {
          name: 'visibility_scope',
          type: 'select',
          values: [
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
          ],
          maxSelect: 1,
        },
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
        'CREATE INDEX idx_bp_ch_vol ON blueprint_chapters (volume_id)',
        'CREATE INDEX idx_bp_ch_status ON blueprint_chapters (editorial_status)',
        'CREATE INDEX idx_bp_ch_validity ON blueprint_chapters (technical_validity)',
        'CREATE INDEX idx_bp_ch_order ON blueprint_chapters (display_order)',
      ],
    )
    var chId = chCol.id

    var secCol = mk(
      'blueprint_sections',
      [
        { name: 'chapter_id', type: 'relation', collectionId: chId, maxSelect: 1 },
        { name: 'code', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'text' },
        { name: 'display_order', type: 'number' },
        { name: 'stable_id', type: 'text' },
        { name: 'active', type: 'bool' },
      ],
      [
        'CREATE INDEX idx_bp_sec_ch ON blueprint_sections (chapter_id)',
        'CREATE INDEX idx_bp_sec_order ON blueprint_sections (display_order)',
      ],
    )
    var secId = secCol.id

    mk(
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
      ],
      [
        'CREATE INDEX idx_bp_ver_ch ON blueprint_versions (chapter_id)',
        'CREATE INDEX idx_bp_ver_num ON blueprint_versions (version_number)',
      ],
    )

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
      ],
      [
        'CREATE INDEX idx_bp_rel_src ON blueprint_relations (source_id)',
        'CREATE INDEX idx_bp_rel_tgt ON blueprint_relations (target_id)',
        'CREATE INDEX idx_bp_rel_type ON blueprint_relations (relation_type)',
      ],
    )

    mk(
      'blueprint_screen_links',
      [
        { name: 'screen_route', type: 'text', required: true },
        { name: 'screen_label', type: 'text' },
        { name: 'chapter_id', type: 'relation', collectionId: chId, maxSelect: 1 },
        { name: 'section_id', type: 'relation', collectionId: secId, maxSelect: 1 },
        { name: 'module_origin', type: 'text' },
        { name: 'has_documentation', type: 'bool' },
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_sl_route ON blueprint_screen_links (screen_route)',
        'CREATE INDEX idx_bp_sl_ch ON blueprint_screen_links (chapter_id)',
      ],
    )

    mk(
      'blueprint_chunks',
      [
        { name: 'chapter_id', type: 'relation', collectionId: chId, maxSelect: 1 },
        { name: 'section_id', type: 'relation', collectionId: secId, maxSelect: 1 },
        { name: 'chunk_text', type: 'text' },
        { name: 'chunk_index', type: 'number' },
        { name: 'metadata', type: 'json' },
      ],
      [
        'CREATE INDEX idx_bp_chunk_ch ON blueprint_chunks (chapter_id)',
        'CREATE INDEX idx_bp_chunk_sec ON blueprint_chunks (section_id)',
      ],
    )

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
      ],
      ['CREATE INDEX idx_bp_pkg_status ON blueprint_packages (status)'],
    )

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
      ],
      [
        'CREATE INDEX idx_bp_gap_type ON blueprint_gaps (gap_type)',
        'CREATE INDEX idx_bp_gap_status ON blueprint_gaps (status)',
      ],
    )

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
      ],
      [
        'CREATE INDEX idx_bp_cov_type ON blueprint_coverage (entity_type)',
        'CREATE INDEX idx_bp_cov_entity ON blueprint_coverage (entity_id)',
      ],
    )

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
      ],
      [
        'CREATE INDEX idx_bp_cert_ch ON blueprint_certifications (chapter_id)',
        'CREATE INDEX idx_bp_cert_status ON blueprint_certifications (status)',
      ],
    )

    mk(
      'blueprint_adrs',
      [
        { name: 'code', type: 'text' },
        { name: 'title', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['proposta', 'aceita', 'rejeitada', 'substituída', 'obsoleta', 'superseded'],
          maxSelect: 1,
        },
        { name: 'decision', type: 'text' },
        { name: 'motive', type: 'text' },
        { name: 'alternatives', type: 'json' },
        { name: 'approver', type: 'text' },
        { name: 'effective_date', type: 'text' },
        { name: 'impacted_modules', type: 'json' },
        { name: 'chapter_id', type: 'relation', collectionId: chId, maxSelect: 1 },
        { name: 'relation_ids', type: 'json' },
        { name: 'author', type: 'text' },
        { name: 'version', type: 'text' },
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_adr_code ON blueprint_adrs (code)',
        'CREATE INDEX idx_bp_adr_status ON blueprint_adrs (status)',
      ],
    )

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
    var adrC = app.findCollectionByNameOrId('blueprint_adrs')
    var adrId = adrC.id
    if (!adrC.fields.getByName('superseded_by')) {
      adrC.fields.add(
        new RelationField({ name: 'superseded_by', collectionId: adrId, maxSelect: 1 }),
      )
      app.save(adrC)
    }
    if (!adrC.fields.getByName('previous_adr_id')) {
      adrC.fields.add(
        new RelationField({ name: 'previous_adr_id', collectionId: adrId, maxSelect: 1 }),
      )
      app.save(adrC)
    }

    console.log('BLUEPRINT-0169: 12 collections created with frozen schema')
  },
  (app) => {
    var cols = [
      'blueprint_adrs',
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
      } catch (_) {}
    }
  },
)
