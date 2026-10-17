/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // 1. Coleção para os dados da Tabela Mãe GR (linhas e dados dinâmicos)
    // ATENÇÃO: Nasce 100% VAZIA de produtos/linhas conforme exigência mandatória de compliance.
    const tabelaMaeCol = new Collection({
      name: 'tabela_mae_gr',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'sheet_name', type: 'text', required: true },
        { name: 'row_index', type: 'number', required: true },
        { name: 'data', type: 'json', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_tb_mae_sheet ON tabela_mae_gr (sheet_name)',
        'CREATE INDEX idx_tb_mae_row ON tabela_mae_gr (sheet_name, row_index)',
      ],
    })
    app.save(tabelaMaeCol)

    // 2. Coleção de Snapshots de Planilhas Convertidas
    // Armazena o workbook completo serializado (abas, células, fórmulas, estilos, ordem e colunas)
    // Permite autosave resiliente, concorrência otimista (version) e restauração instantânea.
    const workbookSnapshotsCol = new Collection({
      name: 'planilhas_workbooks',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'slug', type: 'text', required: true }, // ex: 'comparativo-margens-gr' | 'tabela-mae-gr'
        { name: 'titulo', type: 'text', required: true },
        { name: 'workbook_data', type: 'json', required: true }, // { sheets: [...], activeSheetIndex: 0 }
        { name: 'version', type: 'number', required: true },
        { name: 'updated_by_id', type: 'text', required: false },
        { name: 'updated_by_name', type: 'text', required: false },
        { name: 'updated_by_email', type: 'text', required: false },
        { name: 'change_summary', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_planilhas_wb_slug ON planilhas_workbooks (slug)',
        'CREATE INDEX idx_planilhas_wb_version ON planilhas_workbooks (version)',
      ],
    })
    app.save(workbookSnapshotsCol)

    // 3. Coleção de Histórico de Versões das Planilhas Convertidas
    // Armazena snapshots anteriores com carimbo de tempo, usuário e descrição para rollback
    const workbookVersionsCol = new Collection({
      name: 'planilhas_versoes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'slug', type: 'text', required: true },
        { name: 'version_number', type: 'number', required: true },
        { name: 'workbook_data', type: 'json', required: true },
        { name: 'author_id', type: 'text', required: false },
        { name: 'author_name', type: 'text', required: false },
        { name: 'description', type: 'text', required: false },
        { name: 'origin', type: 'text', required: false }, // 'manual' | 'autosave' | 'import' | 'rollback'
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_planilhas_ver_slug ON planilhas_versoes (slug, version_number DESC)',
        'CREATE INDEX idx_planilhas_ver_created ON planilhas_versoes (created DESC)',
      ],
    })
    app.save(workbookVersionsCol)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('tabela_mae_gr')
      if (col) app.delete(col)
    } catch {}
    try {
      const col = app.findCollectionByNameOrId('planilhas_workbooks')
      if (col) app.delete(col)
    } catch {}
    try {
      const col = app.findCollectionByNameOrId('planilhas_versoes')
      if (col) app.delete(col)
    } catch {}
  },
)
