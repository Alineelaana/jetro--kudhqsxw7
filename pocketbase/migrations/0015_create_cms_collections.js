migrate(
  (app) => {
    const U = '_pb_users_auth_'

    app.save(
      new Collection({
        name: 'cms_content',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: "@request.auth.role = 'SUP'",
        updateRule: "@request.auth.role = 'SUP'",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'section_key', type: 'text', required: true },
          { name: 'draft_data', type: 'json' },
          { name: 'published_data', type: 'json' },
          { name: 'status', type: 'text' },
          { name: 'updated_by', type: 'relation', collectionId: U, maxSelect: 1 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_cms_content_section_key ON cms_content (section_key)'],
      }),
    )

    app.save(
      new Collection({
        name: 'cms_versions',
        type: 'base',
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: "@request.auth.role = 'SUP'",
        updateRule: "@request.auth.role = 'SUP'",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'section_key', type: 'text', required: true },
          { name: 'version_data', type: 'json' },
          { name: 'version_number', type: 'number', onlyInt: true },
          { name: 'published_by', type: 'relation', collectionId: U, maxSelect: 1 },
          { name: 'published_at', type: 'text' },
          { name: 'label', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_cms_versions_section ON cms_versions (section_key, version_number DESC)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'cms_history',
        type: 'base',
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: "@request.auth.role = 'SUP'",
        updateRule: null,
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'section_key', type: 'text', required: true },
          { name: 'field_name', type: 'text' },
          { name: 'old_value', type: 'text' },
          { name: 'new_value', type: 'text' },
          { name: 'changed_by', type: 'relation', collectionId: U, maxSelect: 1 },
          { name: 'action', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_cms_history_section ON cms_history (section_key, created DESC)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'cms_media',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: "@request.auth.role = 'SUP'",
        updateRule: "@request.auth.role = 'SUP'",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'name', type: 'text', required: true },
          {
            name: 'file',
            type: 'file',
            maxSelect: 1,
            maxSize: 52428800,
            mimeTypes: [
              'image/png',
              'image/jpeg',
              'image/jpg',
              'image/webp',
              'image/svg+xml',
              'application/pdf',
              'video/mp4',
            ],
          },
          { name: 'type', type: 'text' },
          { name: 'dimensions', type: 'text' },
          { name: 'size', type: 'number', onlyInt: true },
          { name: 'alt_text', type: 'text' },
          { name: 'caption', type: 'text' },
          { name: 'folder', type: 'text' },
          { name: 'usage_locations', type: 'json' },
          { name: 'uploaded_by', type: 'relation', collectionId: U, maxSelect: 1 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_cms_media_folder ON cms_media (folder)'],
      }),
    )

    app.save(
      new Collection({
        name: 'cms_publication',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: "@request.auth.role = 'SUP'",
        updateRule: "@request.auth.role = 'SUP'",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'status', type: 'text' },
          { name: 'last_published_at', type: 'text' },
          { name: 'last_published_by', type: 'relation', collectionId: U, maxSelect: 1 },
          { name: 'pending_changes', type: 'number', onlyInt: true },
          { name: 'scheduled_at', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_cms_publication_status ON cms_publication (status)'],
      }),
    )
  },
  (app) => {
    ;['cms_content', 'cms_versions', 'cms_history', 'cms_media', 'cms_publication'].forEach((n) => {
      try {
        app.delete(app.findCollectionByNameOrId(n))
      } catch (_) {}
    })
  },
)
