/*
 * Migration 0169 — Blueprint Collections (Revised)
 *
 * Collections created: exactly 11
 *   1. blueprint_volumes       7. blueprint_chunks
 *   2. blueprint_chapters      8. blueprint_packages
 *   3. blueprint_sections      9. blueprint_gaps
 *   4. blueprint_versions     10. blueprint_coverage
 *   5. blueprint_relations    11. blueprint_certifications
 *   6. blueprint_screen_links
 */
migrate(
  (app) => {
    var RS = "@request.auth.role = 'SUP'"
    var readTV = "@request.auth.id != ''"
    var readT = "@request.auth.id != ''"

    var AF = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]

    function mk(name, fields, indexes, lr, vr) {
      try {
        return app.findCollectionByNameOrId(name)
      } catch (e) {}
      var nonRel = []
      var rels = []
      for (var i = 0; i < fields.length; i++) {
        if (fields[i].type === 'relation') {
          rels.push(fields[i])
        } else {
          nonRel.push(fields[i])
        }
      }
      var col = new Collection({
        name: name,
        type: 'base',
        listRule: lr,
        viewRule: vr,
        createRule: RS,
        updateRule: RS,
        deleteRule: RS,
        fields: nonRel.concat(AF),
        indexes: indexes || [],
      })
      app.save(col)
      col = app.findCollectionByNameOrId(name)
      if (rels.length > 0) {
        for (var j = 0; j < rels.length; j++) {
          if (!col.fields.getByName(rels[j].name) && rels[j].collectionId) {
            col.fields.add(
              new RelationField({
                name: rels[j].name,
                collectionId: rels[j].collectionId,
                maxSelect: rels[j].maxSelect || 1,
              }),
            )
          }
        }
        app.save(col)
      }
      return app.findCollectionByNameOrId(name)
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
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_sec_code ON blueprint_sections (code)',
        'CREATE UNIQUE INDEX idx_bp_sec_stable ON blueprint_sections (stable_id)',
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
    mk(
      'blueprint_versions',
      [
        { name: 'chapter_id', type: 'relation', collectionId: chId, maxSelect: 1 },
        { name: 'section_id', type: 'relation', collectionId: secId, maxSelect: 1 },
        { name: 'version_number', type: 'text' },
        { name: 'content', type: 'text' },
        { name: 'change_summary', type: 'text' },
        { name: 'author', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['Rascunho', 'Publicado', 'Arquivado'],
          maxSelect: 1,
        },
        { name: 'previous_version_id', type: 'text' },
        { name: 'tenant_id', type: 'text' },
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
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_ver_ch_ver ON blueprint_versions (chapter_id, version_number)',
        'CREATE INDEX idx_bp_ver_ch ON blueprint_versions (chapter_id)',
        'CREATE INDEX idx_bp_ver_sec ON blueprint_versions (section_id)',
        'CREATE INDEX idx_bp_ver_status ON blueprint_versions (status)',
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
        {
          name: 'source_type',
          type: 'select',
          values: ['chapter', 'section', 'volume', 'version', 'adr'],
          maxSelect: 1,
        },
        { name: 'source_id', type: 'text' },
        {
          name: 'target_type',
          type: 'select',
          values: ['chapter', 'section', 'volume', 'version', 'adr'],
          maxSelect: 1,
        },
        { name: 'target_id', type: 'text' },
        {
          name: 'relation_type',
          type: 'select',
          values: [
            'governed_by',
            'implemented_by',
            'validated_by',
            'tested_by',
            'deployed_in',
            'depends_on',
            'replaces',
            'superseded_by',
            'relates_to',
          ],
          maxSelect: 1,
        },
        { name: 'description', type: 'text' },
        { name: 'tenant_id', type: 'text' },
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
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_rel_src_tgt ON blueprint_relations (source_id, target_id, relation_type)',
        'CREATE INDEX idx_bp_rel_source ON blueprint_relations (source_id)',
        'CREATE INDEX idx_bp_rel_target ON blueprint_relations (target_id)',
        'CREATE INDEX idx_bp_rel_type ON blueprint_relations (relation_type)',
        'CREATE INDEX idx_bp_rel_tenant ON blueprint_relations (tenant_id)',
        'CREATE INDEX idx_bp_rel_vis ON blueprint_relations (visibility_scope)',
      ],
      readTV,
      readTV,
    )

    // 6. blueprint_screen_links
    mk(
      'blueprint_screen_links',
      [
        { name: 'screen_route', type: 'text' },
        { name: 'chapter_id', type: 'relation', collectionId: chId, maxSelect: 1 },
        { name: 'section_id', type: 'relation', collectionId: secId, maxSelect: 1 },
        { name: 'title', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'display_order', type: 'number' },
        { name: 'active', type: 'bool' },
        { name: 'tenant_id', type: 'text' },
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
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_sl_route_ch_sec ON blueprint_screen_links (screen_route, chapter_id, section_id)',
        'CREATE INDEX idx_bp_sl_route ON blueprint_screen_links (screen_route)',
        'CREATE INDEX idx_bp_sl_ch ON blueprint_screen_links (chapter_id)',
        'CREATE INDEX idx_bp_sl_sec ON blueprint_screen_links (section_id)',
        'CREATE INDEX idx_bp_sl_tenant ON blueprint_screen_links (tenant_id)',
        'CREATE INDEX idx_bp_sl_vis ON blueprint_screen_links (visibility_scope)',
      ],
      readTV,
      readTV,
    )

    // 7. blueprint_chunks
    mk(
      'blueprint_chunks',
      [
        { name: 'chapter_id', type: 'relation', collectionId: chId, maxSelect: 1 },
        { name: 'section_id', type: 'relation', collectionId: secId, maxSelect: 1 },
        { name: 'chunk_index', type: 'number' },
        { name: 'content', type: 'text' },
        { name: 'token_count', type: 'number' },
        { name: 'metadata', type: 'json' },
        { name: 'tenant_id', type: 'text' },
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
      ],
      [
        'CREATE INDEX idx_bp_ck_ch ON blueprint_chunks (chapter_id)',
        'CREATE INDEX idx_bp_ck_sec ON blueprint_chunks (section_id)',
        'CREATE INDEX idx_bp_ck_idx ON blueprint_chunks (chunk_index)',
        'CREATE INDEX idx_bp_ck_tenant ON blueprint_chunks (tenant_id)',
        'CREATE INDEX idx_bp_ck_vis ON blueprint_chunks (visibility_scope)',
      ],
      readTV,
      readTV,
    )

    // 8. blueprint_packages
    mk(
      'blueprint_packages',
      [
        { name: 'code', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'chapter_ids', type: 'json' },
        { name: 'section_ids', type: 'json' },
        { name: 'version', type: 'text' },
        { name: 'active', type: 'bool' },
        { name: 'tenant_id', type: 'text' },
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
      ],
      [
        'CREATE UNIQUE INDEX idx_bp_pkg_code ON blueprint_packages (code)',
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
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'chapter_id', type: 'relation', collectionId: chId, maxSelect: 1 },
        { name: 'section_id', type: 'relation', collectionId: secId, maxSelect: 1 },
        {
          name: 'gap_type',
          type: 'select',
          values: [
            'missing_content',
            'outdated_content',
            'broken_link',
            'inconsistency',
            'missing_relation',
          ],
          maxSelect: 1,
        },
        {
          name: 'severity',
          type: 'select',
          values: ['Baixa', 'Média', 'Alta', 'Crítica'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: ['Aberto', 'Em Análise', 'Resolvido', 'Ignorado'],
          maxSelect: 1,
        },
        { name: 'detected_by', type: 'text' },
        { name: 'resolution', type: 'text' },
        { name: 'tenant_id', type: 'text' },
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
      ],
      [
        'CREATE INDEX idx_bp_gap_ch ON blueprint_gaps (chapter_id)',
        'CREATE INDEX idx_bp_gap_sec ON blueprint_gaps (section_id)',
        'CREATE INDEX idx_bp_gap_sev ON blueprint_gaps (severity)',
        'CREATE INDEX idx_bp_gap_status ON blueprint_gaps (status)',
        'CREATE INDEX idx_bp_gap_tenant ON blueprint_gaps (tenant_id)',
        'CREATE INDEX idx_bp_gap_vis ON blueprint_gaps (visibility_scope)',
      ],
      readTV,
      readTV,
    )

    // 10. blueprint_coverage
    mk(
      'blueprint_coverage',
      [
        { name: 'chapter_id', type: 'relation', collectionId: chId, maxSelect: 1 },
        { name: 'section_id', type: 'relation', collectionId: secId, maxSelect: 1 },
        {
          name: 'metric_type',
          type: 'select',
          values: ['content_coverage', 'relation_coverage', 'gap_count', 'chunk_coverage'],
          maxSelect: 1,
        },
        { name: 'metric_value', type: 'number' },
        { name: 'coverage_percent', type: 'number' },
        { name: 'details', type: 'json' },
        { name: 'tenant_id', type: 'text' },
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
      ],
      [
        'CREATE INDEX idx_bp_cov_ch ON blueprint_coverage (chapter_id)',
        'CREATE INDEX idx_bp_cov_sec ON blueprint_coverage (section_id)',
        'CREATE INDEX idx_bp_cov_type ON blueprint_coverage (metric_type)',
        'CREATE INDEX idx_bp_cov_tenant ON blueprint_coverage (tenant_id)',
        'CREATE INDEX idx_bp_cov_vis ON blueprint_coverage (visibility_scope)',
      ],
      readTV,
      readTV,
    )

    // 11. blueprint_certifications
    mk(
      'blueprint_certifications',
      [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'chapter_id', type: 'relation', collectionId: chId, maxSelect: 1 },
        { name: 'section_id', type: 'relation', collectionId: secId, maxSelect: 1 },
        { name: 'certified_by', type: 'text' },
        { name: 'certified_at', type: 'text' },
        { name: 'expires_at', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['Pendente', 'Certificado', 'Rejeitado', 'Expirado'],
          maxSelect: 1,
        },
        { name: 'tenant_id', type: 'text' },
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
      ],
      [
        'CREATE INDEX idx_bp_cert_ch ON blueprint_certifications (chapter_id)',
        'CREATE INDEX idx_bp_cert_sec ON blueprint_certifications (section_id)',
        'CREATE INDEX idx_bp_cert_status ON blueprint_certifications (status)',
        'CREATE INDEX idx_bp_cert_tenant ON blueprint_certifications (tenant_id)',
        'CREATE INDEX idx_bp_cert_vis ON blueprint_certifications (visibility_scope)',
      ],
      readTV,
      readTV,
    )
  },
  (app) => {
    var names = [
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
    for (var i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (e) {}
    }
  },
)
