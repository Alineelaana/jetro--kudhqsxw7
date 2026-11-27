// 0365_governance_collections_corrective.js — CORRETIVA
// A migração 0363 está marcada como aplicada no runner, mas NUNCA executou no
// banco vivo (as coleções governance_* não existiam). Esta migração re-aplica
// o mesmo conteúdo de 0363 (idempotente): cria as coleções da governança
// documental AvatarSi, faz os seeds por empresa e o backfill dos documentos
// antigos. Tudo com guardas de existência — rodar de novo é no-op.
//
// IMPORTANTE: cada coleção é criada com um literal `new Collection({...})`
// (nome explícito, regras embutidas) — a criação via spec em variável não é
// reconhecida pela validação do runner ("referenced collection does not exist
// at this point"). Todas as coleções são criadas ANTES de qualquer
// findRecordsByFilter sobre elas (seeds/backfill).
migrate(
  (app) => {
    // ---------------------------------------------------------
    // 1. Documentos (acervo de governança)
    // ---------------------------------------------------------
    try {
      app.findCollectionByNameOrId('governance_documents')
    } catch (_) {
      app.save(
        new Collection({
          name: 'governance_documents',
          type: 'base',
          listRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          viewRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          createRule:
            "@request.auth.role = 'SUP' || @request.auth.empresa_id = @request.body.empresa",
          updateRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          deleteRule: "@request.auth.role = 'SUP'",
          fields: [
            { name: 'empresa', type: 'text', required: true },
            { name: 'filial', type: 'text' },
            { name: 'title', type: 'text', required: true },
            { name: 'template_id', type: 'text' },
            { name: 'project_code', type: 'text' },
            { name: 'type_code', type: 'text' },
            { name: 'doc_code', type: 'text' },
            { name: 'doc_number', type: 'number' },
            { name: 'version_major', type: 'number' },
            { name: 'version_minor', type: 'number' },
            { name: 'version_patch', type: 'number' },
            { name: 'version', type: 'text' },
            { name: 'current_version', type: 'text' },
            {
              name: 'status',
              type: 'select',
              maxSelect: 1,
              values: [
                'em_elaboracao',
                'em_revisao',
                'em_aprovacao',
                'aprovado',
                'publicado',
                'obsoleto',
                'revogado',
              ],
            },
            {
              name: 'classification',
              type: 'select',
              maxSelect: 1,
              values: ['publico', 'interno', 'confidencial', 'restrito'],
            },
            { name: 'author', type: 'text' },
            { name: 'reviewers', type: 'text' },
            { name: 'approver', type: 'text' },
            { name: 'approver_role', type: 'text' },
            { name: 'purpose', type: 'text' },
            { name: 'audience', type: 'text' },
            { name: 'channels', type: 'text' },
            { name: 'approval_evidence', type: 'text' },
            { name: 'change_summary', type: 'text' },
            {
              name: 'current_file',
              type: 'file',
              maxSelect: 10,
              maxSize: 52428800,
              mimeTypes: [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/zip',
                'image/png',
                'image/jpeg',
              ],
            },
            { name: 'released_file_name', type: 'text' },
            { name: 'released_at', type: 'text' },
            { name: 'released_by', type: 'text' },
            { name: 'approved_at', type: 'text' },
            { name: 'pending_review', type: 'bool' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
          indexes: [
            'CREATE UNIQUE INDEX idx_govdoc_number ON governance_documents (doc_number) WHERE doc_number != 0',
            "CREATE UNIQUE INDEX idx_govdoc_empresa_code ON governance_documents (empresa, doc_code) WHERE doc_code != ''",
            'CREATE INDEX idx_govdoc_empresa ON governance_documents (empresa)',
            'CREATE INDEX idx_govdoc_status ON governance_documents (status)',
            'CREATE INDEX idx_govdoc_projtipo ON governance_documents (empresa, project_code, type_code)',
          ],
        }),
      )
      console.log('0365: coleção criada: governance_documents')
    }

    // ---------------------------------------------------------
    // 2. Versões emitidas (histórico preservado)
    // ---------------------------------------------------------
    try {
      app.findCollectionByNameOrId('governance_document_versions')
    } catch (_) {
      app.save(
        new Collection({
          name: 'governance_document_versions',
          type: 'base',
          listRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          viewRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          createRule:
            "@request.auth.role = 'SUP' || @request.auth.empresa_id = @request.body.empresa",
          updateRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          deleteRule: "@request.auth.role = 'SUP'",
          fields: [
            { name: 'empresa', type: 'text', required: true },
            { name: 'document_id', type: 'text', required: true },
            { name: 'doc_code', type: 'text' },
            { name: 'doc_number', type: 'number' },
            { name: 'version', type: 'text' },
            { name: 'status', type: 'text' },
            { name: 'classification', type: 'text' },
            { name: 'change_summary', type: 'text' },
            { name: 'author', type: 'text' },
            { name: 'approver', type: 'text' },
            { name: 'approver_role', type: 'text' },
            { name: 'approved_at', type: 'text' },
            { name: 'released_at', type: 'text' },
            { name: 'released_by', type: 'text' },
            { name: 'file_name', type: 'text' },
            { name: 'created_by', type: 'text' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
          indexes: [
            'CREATE INDEX idx_govver_doc ON governance_document_versions (document_id)',
            'CREATE INDEX idx_govver_empresa ON governance_document_versions (empresa)',
          ],
        }),
      )
      console.log('0365: coleção criada: governance_document_versions')
    }

    // ---------------------------------------------------------
    // 3. Checklist de liberação (confirmação item a item)
    // ---------------------------------------------------------
    try {
      app.findCollectionByNameOrId('governance_release_checklist')
    } catch (_) {
      app.save(
        new Collection({
          name: 'governance_release_checklist',
          type: 'base',
          listRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          viewRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          createRule:
            "@request.auth.role = 'SUP' || @request.auth.empresa_id = @request.body.empresa",
          updateRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          deleteRule: "@request.auth.role = 'SUP'",
          fields: [
            { name: 'empresa', type: 'text', required: true },
            { name: 'document_id', type: 'text', required: true },
            { name: 'version', type: 'text' },
            { name: 'item_key', type: 'text', required: true },
            { name: 'item_label', type: 'text' },
            { name: 'confirmed', type: 'bool' },
            { name: 'confirmed_by', type: 'text' },
            { name: 'confirmed_at', type: 'text' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
          indexes: [
            'CREATE UNIQUE INDEX idx_govchk_item ON governance_release_checklist (document_id, version, item_key)',
            'CREATE INDEX idx_govchk_doc ON governance_release_checklist (document_id)',
          ],
        }),
      )
      console.log('0365: coleção criada: governance_release_checklist')
    }

    // ---------------------------------------------------------
    // 4. Trilha de auditoria da governança
    // ---------------------------------------------------------
    try {
      app.findCollectionByNameOrId('governance_audit_trail')
    } catch (_) {
      app.save(
        new Collection({
          name: 'governance_audit_trail',
          type: 'base',
          listRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          viewRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          createRule:
            "@request.auth.role = 'SUP' || @request.auth.empresa_id = @request.body.empresa",
          updateRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          deleteRule: "@request.auth.role = 'SUP'",
          fields: [
            { name: 'empresa', type: 'text', required: true },
            { name: 'document_id', type: 'text' },
            { name: 'doc_code', type: 'text' },
            { name: 'doc_number', type: 'number' },
            { name: 'version', type: 'text' },
            { name: 'event', type: 'text' },
            { name: 'user_name', type: 'text' },
            { name: 'user_role', type: 'text' },
            { name: 'details', type: 'text' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
          indexes: [
            'CREATE INDEX idx_govaudit_doc ON governance_audit_trail (document_id)',
            'CREATE INDEX idx_govaudit_empresa ON governance_audit_trail (empresa)',
          ],
        }),
      )
      console.log('0365: coleção criada: governance_audit_trail')
    }

    // ---------------------------------------------------------
    // 5. Projetos (código/prefixo por empresa)
    // ---------------------------------------------------------
    try {
      app.findCollectionByNameOrId('governance_projects')
    } catch (_) {
      app.save(
        new Collection({
          name: 'governance_projects',
          type: 'base',
          listRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          viewRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          createRule:
            "@request.auth.role = 'SUP' || @request.auth.empresa_id = @request.body.empresa",
          updateRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          deleteRule: "@request.auth.role = 'SUP'",
          fields: [
            { name: 'empresa', type: 'text', required: true },
            { name: 'code', type: 'text', required: true },
            { name: 'name', type: 'text', required: true },
            { name: 'active', type: 'bool' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
          indexes: [
            'CREATE UNIQUE INDEX idx_govproj_empresa_code ON governance_projects (empresa, code)',
          ],
        }),
      )
      console.log('0365: coleção criada: governance_projects')
    }

    // ---------------------------------------------------------
    // 6. Tipos documentais (por empresa, com catálogo da norma)
    // ---------------------------------------------------------
    try {
      app.findCollectionByNameOrId('governance_document_types')
    } catch (_) {
      app.save(
        new Collection({
          name: 'governance_document_types',
          type: 'base',
          listRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          viewRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          createRule:
            "@request.auth.role = 'SUP' || @request.auth.empresa_id = @request.body.empresa",
          updateRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          deleteRule: "@request.auth.role = 'SUP'",
          fields: [
            { name: 'empresa', type: 'text', required: true },
            { name: 'code', type: 'text', required: true },
            { name: 'name', type: 'text', required: true },
            { name: 'active', type: 'bool' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
          indexes: [
            'CREATE UNIQUE INDEX idx_govtipo_empresa_code ON governance_document_types (empresa, code)',
          ],
        }),
      )
      console.log('0365: coleção criada: governance_document_types')
    }

    // ---------------------------------------------------------
    // 7. Configuração de papéis por empresa
    // ---------------------------------------------------------
    try {
      app.findCollectionByNameOrId('governance_workflow_config')
    } catch (_) {
      app.save(
        new Collection({
          name: 'governance_workflow_config',
          type: 'base',
          listRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          viewRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          createRule:
            "@request.auth.role = 'SUP' || @request.auth.empresa_id = @request.body.empresa",
          updateRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          deleteRule: "@request.auth.role = 'SUP'",
          fields: [
            { name: 'empresa', type: 'text', required: true },
            { name: 'elaboradores', type: 'text' },
            { name: 'revisores_tecnicos', type: 'text' },
            { name: 'revisores_identidade', type: 'text' },
            { name: 'revisor_juridico', type: 'text' },
            { name: 'revisor_fiscal', type: 'text' },
            { name: 'revisor_financeiro', type: 'text' },
            { name: 'aprovador', type: 'text' },
            { name: 'liberador', type: 'text' },
            { name: 'divulgador', type: 'text' },
            { name: 'observacoes', type: 'text' },
            { name: 'active', type: 'bool' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
          indexes: [
            'CREATE UNIQUE INDEX idx_govwfc_empresa ON governance_workflow_config (empresa)',
          ],
        }),
      )
      console.log('0365: coleção criada: governance_workflow_config')
    }

    // ---------------------------------------------------------
    // 8. Norma de governança e ciência dos integrantes
    // ---------------------------------------------------------
    try {
      app.findCollectionByNameOrId('governance_norms')
    } catch (_) {
      app.save(
        new Collection({
          name: 'governance_norms',
          type: 'base',
          listRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          viewRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          createRule:
            "@request.auth.role = 'SUP' || @request.auth.empresa_id = @request.body.empresa",
          updateRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          deleteRule: "@request.auth.role = 'SUP'",
          fields: [
            { name: 'empresa', type: 'text', required: true },
            { name: 'title', type: 'text', required: true },
            { name: 'content', type: 'text' },
            { name: 'version', type: 'text' },
            { name: 'active', type: 'bool' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
          indexes: ['CREATE INDEX idx_govnorma_empresa ON governance_norms (empresa)'],
        }),
      )
      console.log('0365: coleção criada: governance_norms')
    }

    try {
      app.findCollectionByNameOrId('governance_norm_acknowledgments')
    } catch (_) {
      app.save(
        new Collection({
          name: 'governance_norm_acknowledgments',
          type: 'base',
          listRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          viewRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          createRule:
            "@request.auth.role = 'SUP' || @request.auth.empresa_id = @request.body.empresa",
          updateRule: "@request.auth.role = 'SUP' || @request.auth.empresa_id = empresa",
          deleteRule: "@request.auth.role = 'SUP'",
          fields: [
            { name: 'empresa', type: 'text', required: true },
            { name: 'norma_id', type: 'text', required: true },
            { name: 'norma_version', type: 'text' },
            { name: 'user_name', type: 'text' },
            { name: 'user_function', type: 'text' },
            { name: 'acknowledged_at', type: 'text' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
          indexes: ['CREATE INDEX idx_govack_norma ON governance_norm_acknowledgments (norma_id)'],
        }),
      )
      console.log('0365: coleção criada: governance_norm_acknowledgments')
    }

    // ---------------------------------------------------------
    // 9. Seeds idempotentes por empresa: projeto Geral, tipos da norma e papéis
    // ---------------------------------------------------------
    const TIPOS_NORMA = [
      ['NGD', 'Norma Geral de Documentação'],
      ['POP', 'Procedimento Operacional Padrão'],
      ['COM', 'Comunicado Oficial'],
      ['ATA', 'Ata de Reunião'],
      ['API', 'Apresentação Institucional'],
      ['APC', 'Apresentação Comercial'],
      ['AIN', 'Apresentação para Investidores'],
      ['PLN', 'Plano de Negócios'],
      ['EST', 'Estudo Estratégico'],
      ['FIN', 'Modelagem Financeira'],
      ['TRB', 'Estudo Tributário'],
      ['JUR', 'Documento Jurídico'],
      ['PRO', 'Proposta Comercial'],
      ['TEC', 'Projeto Tecnológico'],
      ['MOP', 'Manual Operacional'],
      ['GOV', 'Documento de Governança'],
      ['MKT', 'Marketing e Comunicação'],
    ]

    let empresas = []
    try {
      empresas = app.findRecordsByFilter('empresas', '', '', 500, 0)
    } catch (_) {
      empresas = []
    }

    for (const emp of empresas) {
      const empId = emp.id

      // Projeto inicial "Geral"
      let projExiste = []
      try {
        projExiste = app.findRecordsByFilter(
          'governance_projects',
          'empresa = "' + empId + '" && code = "GER"',
          '',
          1,
          0,
        )
      } catch (_) {}
      if (projExiste.length === 0) {
        const proj = new Record(app.findCollectionByNameOrId('governance_projects'))
        proj.set('empresa', empId)
        proj.set('code', 'GER')
        proj.set('name', 'Geral')
        proj.set('active', true)
        app.save(proj)
      }

      // Tipos da norma
      for (const t of TIPOS_NORMA) {
        let tipoExiste = []
        try {
          tipoExiste = app.findRecordsByFilter(
            'governance_document_types',
            'empresa = "' + empId + '" && code = "' + t[0] + '"',
            '',
            1,
            0,
          )
        } catch (_) {}
        if (tipoExiste.length === 0) {
          const tipo = new Record(app.findCollectionByNameOrId('governance_document_types'))
          tipo.set('empresa', empId)
          tipo.set('code', t[0])
          tipo.set('name', t[1])
          tipo.set('active', true)
          app.save(tipo)
        }
      }

      // Configuração de papéis (default vazia — a empresa preenche)
      let wfcExiste = []
      try {
        wfcExiste = app.findRecordsByFilter(
          'governance_workflow_config',
          'empresa = "' + empId + '"',
          '',
          1,
          0,
        )
      } catch (_) {}
      if (wfcExiste.length === 0) {
        const wfc = new Record(app.findCollectionByNameOrId('governance_workflow_config'))
        wfc.set('empresa', empId)
        wfc.set('active', true)
        app.save(wfc)
      }
    }

    // ---------------------------------------------------------
    // 10. Backfill: documentos antigos (document_templates) recebem número
    // único uma única vez, códigos históricos preservados, SEM presumir
    // aprovação (status em_elaboracao, pendência sinalizada).
    // ---------------------------------------------------------
    let templates = []
    try {
      templates = app.findRecordsByFilter('document_templates', '', '-created', 5000, 0)
    } catch (_) {
      templates = []
    }

    if (templates.length > 0) {
      let numeroAtual = 0
      try {
        const maximo = app.findRecordsByFilter(
          'governance_documents',
          'doc_number > 0',
          '-doc_number',
          1,
          0,
        )
        if (maximo.length > 0) numeroAtual = maximo[0].get('doc_number') || 0
      } catch (_) {}

      const seqPorChave = {}
      const colDocs = app.findCollectionByNameOrId('governance_documents')

      for (const tpl of templates) {
        let jaTem = []
        try {
          jaTem = app.findRecordsByFilter(
            'governance_documents',
            'template_id = "' + tpl.id + '"',
            '',
            1,
            0,
          )
        } catch (_) {}
        if (jaTem.length > 0) continue

        // Resolve empresa: id direto, nome, ou empresa padrão
        let empId = String(tpl.get('company') || '')
        if (empId) {
          try {
            app.findRecordById('empresas', empId)
          } catch (_) {
            try {
              const porNome = app.findRecordsByFilter(
                'empresas',
                'name = "' + empId.replace(/"/g, '\\"') + '"',
                '',
                1,
                0,
              )
              empId = porNome.length > 0 ? porNome[0].id : ''
            } catch (_) {
              empId = ''
            }
          }
        }
        if (!empId) {
          try {
            const padrao = app.findRecordsByFilter('empresas', 'padrao = true', '', 1, 0)
            empId = padrao.length > 0 ? padrao[0].id : ''
          } catch (_) {}
        }
        if (!empId) continue // sem empresa resolvível: fica de fora do acervo

        const projeto = String(tpl.get('category') || 'outros')
          .toUpperCase()
          .slice(0, 12)
        const tipo = 'MOP'
        numeroAtual += 1

        const chave = empId + '|' + projeto + '|' + tipo
        seqPorChave[chave] = (seqPorChave[chave] || 0) + 1

        const doc = new Record(colDocs)
        doc.set('empresa', empId)
        doc.set('title', String(tpl.get('name') || 'Documento sem título'))
        doc.set('template_id', tpl.id)
        doc.set('project_code', projeto)
        doc.set('type_code', tipo)
        doc.set(
          'doc_code',
          projeto + '_' + tipo + '_' + String(seqPorChave[chave]).padStart(3, '0'),
        )
        doc.set('doc_number', numeroAtual)
        doc.set('version_major', 0)
        doc.set('version_minor', 1)
        doc.set('version_patch', 0)
        doc.set('version', '0.1.0')
        doc.set('current_version', '')
        doc.set('status', 'em_elaboracao')
        doc.set('classification', 'interno')
        doc.set('pending_review', true)
        doc.set(
          'change_summary',
          'Importado do acervo anterior (sem número — backfill 0363). Pendente de revisão e aprovação conforme governança.',
        )
        app.save(doc)
      }
      console.log('0365: backfill de documentos concluído')
    }
  },
  (app) => {
    const nomes = [
      'governance_norm_acknowledgments',
      'governance_norms',
      'governance_workflow_config',
      'governance_document_types',
      'governance_projects',
      'governance_audit_trail',
      'governance_release_checklist',
      'governance_document_versions',
      'governance_documents',
    ]
    for (const n of nomes) {
      try {
        app.delete(app.findCollectionByNameOrId(n))
      } catch (_) {}
    }
  },
)
