migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'document_generations',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.role = 'SUP'",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'document_type', type: 'text', required: true },
          { name: 'module', type: 'text', required: true },
          { name: 'title', type: 'text', required: true },
          {
            name: 'format',
            type: 'select',
            required: true,
            maxSelect: 1,
            values: ['pdf', 'png', 'jpg', 'svg', 'excel', 'csv', 'print', 'html'],
          },
          { name: 'data_source', type: 'text' },
          { name: 'applied_filters', type: 'json' },
          { name: 'record_count', type: 'number' },
          {
            name: 'status',
            type: 'select',
            required: true,
            maxSelect: 1,
            values: ['queued', 'processing', 'completed', 'failed', 'cancelled'],
          },
          {
            name: 'output_file',
            type: 'file',
            maxSelect: 1,
            maxSize: 52428800,
            mimeTypes: [
              'application/pdf',
              'image/png',
              'image/jpeg',
              'image/svg+xml',
              'application/vnd.ms-excel',
              'text/csv',
              'text/html',
            ],
          },
          { name: 'file_name', type: 'text' },
          { name: 'empresa', type: 'text' },
          { name: 'filial', type: 'text' },
          { name: 'requesting_user', type: 'text' },
          { name: 'requesting_user_name', type: 'text' },
          { name: 'requested_at', type: 'text' },
          { name: 'completed_at', type: 'text' },
          { name: 'generation_time_ms', type: 'number' },
          {
            name: 'request_origin',
            type: 'select',
            maxSelect: 1,
            values: ['frontend', 'api', 'automation', 'ai'],
          },
          { name: 'template_id', type: 'text' },
          { name: 'document_version', type: 'text' },
          { name: 'total_pages', type: 'number' },
          { name: 'checksum', type: 'text' },
          { name: 'validation_link', type: 'text' },
          { name: 'qr_code', type: 'text' },
          { name: 'cache_key', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_docgen_status ON document_generations (status)',
          'CREATE INDEX idx_docgen_module ON document_generations (module)',
          'CREATE INDEX idx_docgen_format ON document_generations (format)',
          'CREATE INDEX idx_docgen_empresa ON document_generations (empresa)',
          'CREATE INDEX idx_docgen_filial ON document_generations (filial)',
          'CREATE INDEX idx_docgen_user ON document_generations (requesting_user)',
          'CREATE INDEX idx_docgen_created ON document_generations (created)',
        ],
      }),
    )
    console.log('0137: document_generations collection created')
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('document_generations'))
    } catch (_) {}
  },
)
