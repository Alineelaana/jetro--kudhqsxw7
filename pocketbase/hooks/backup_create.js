routerAdd(
  'POST',
  '/backend/v1/backup/create',
  (e) => {
    var body = e.requestInfo().body || {}
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')
    if (authUser.getString('role') !== 'SUP') return e.forbiddenError('SUP only')

    var backupType = body.backup_type || 'full'
    var versionName = body.version_name || 'Backup ' + new Date().toISOString()
    var observations = body.observations || ''
    var ip = '',
      ua = ''
    try {
      ip = e.request.remoteAddr || ''
    } catch (_) {}
    try {
      ua = (e.requestInfo().headers || {})['user_agent'] || ''
    } catch (_) {}

    var CF = {
      users: ['name', 'email', 'cpf', 'attendant_status', 'active', 'role'],
      settings: ['key', 'value'],
      budget_form_fields: ['name', 'label', 'type', 'options', 'required', 'order', 'active'],
      budget_requests: [
        'data',
        'client_name',
        'client_email',
        'client_phone',
        'service',
        'status',
        'status_history',
        'responsible_email',
        'responsible_phone',
        'quote_created_at',
        'budget_number',
      ],
      partner_types: ['name'],
      partners: [
        'partner_type',
        'person_type',
        'active',
        'blocked',
        'observations',
        'financial_history',
        'email',
        'phone',
        'address',
        'reference_point',
        'cep',
        'full_name',
        'cpf',
        'birth_date',
        'marital_status',
        'profession',
        'monthly_income',
        'rg_cnh',
        'company_name',
        'trade_name',
        'cnpj',
        'state_registration',
        'client_id',
        'address_number',
        'address_complement',
        'address_district',
        'address_city',
        'address_state',
        'document_number',
        'document_issuer',
        'document_issue_date',
        'document_validity',
        'restriction_reason',
        'document_type',
        'financial_restriction',
        'restriction_history',
        'documents_metadata',
      ],
      ai_training: ['title', 'content', 'type'],
      cms_content: ['section_key', 'draft_data', 'published_data', 'status', 'updated_by'],
      cms_versions: [
        'section_key',
        'version_data',
        'version_number',
        'published_by',
        'published_at',
        'label',
      ],
      cms_history: ['section_key', 'field_name', 'old_value', 'new_value', 'changed_by', 'action'],
      cms_media: [
        'name',
        'file',
        'type',
        'dimensions',
        'size',
        'alt_text',
        'caption',
        'folder',
        'usage_locations',
        'uploaded_by',
      ],
      cms_publication: [
        'status',
        'last_published_at',
        'last_published_by',
        'pending_changes',
        'scheduled_at',
      ],
      vitrine_items: [
        'name',
        'type',
        'title',
        'subtitle',
        'description',
        'image_desktop',
        'image_mobile',
        'image_alt',
        'button_text',
        'button_link',
        'text_color',
        'bg_color',
        'overlay_color',
        'opacity',
        'text_position',
        'display_page',
        'specific_page_url',
        'display_order',
        'start_date',
        'end_date',
        'active',
        'linked_services',
        'click_destination',
        'status',
        'has_publish_history',
      ],
      chat_conversations: [
        'client_name',
        'client_email',
        'client_phone',
        'status',
        'last_message_at',
        'attendant_id',
        'closed',
      ],
      chat_messages: ['conversation_id', 'content', 'sender', 'author_name'],
      chat_ratings: ['conversation', 'attendant', 'rating', 'comment'],
    }
    var DB_COLS = Object.keys(CF)
    var CONFIG_COLS = [
      'settings',
      'budget_form_fields',
      'partner_types',
      'cms_content',
      'cms_publication',
      'vitrine_items',
      'ai_training',
    ]
    var FILE_COLS = {
      users: ['avatar'],
      partners: ['income_proof', 'address_proof', 'rg_cnh_doc', 'attachments'],
      cms_media: ['file'],
    }

    function exportCol(colName) {
      var fields = CF[colName]
      if (!fields) return []
      try {
        var records = $app.findRecordsByFilter(colName, "id != ''", '', 100000, 0)
        var result = []
        for (var i = 0; i < records.length; i++) {
          var rec = records[i]
          var data = { id: rec.id }
          for (var j = 0; j < fields.length; j++) {
            try {
              var v = rec.get(fields[j])
              if (v !== null && v !== undefined && v !== '') data[fields[j]] = v
            } catch (_) {}
          }
          result.push(data)
        }
        return result
      } catch (_) {
        return []
      }
    }

    var backupData = {
      version: versionName,
      type: backupType,
      timestamp: new Date().toISOString(),
      created_by: authUser.getString('name') || authUser.email || 'Sistema',
      collections: {},
    }

    if (backupType === 'full' || backupType === 'database') {
      for (var i = 0; i < DB_COLS.length; i++)
        backupData.collections[DB_COLS[i]] = exportCol(DB_COLS[i])
    } else if (backupType === 'config') {
      for (var i = 0; i < CONFIG_COLS.length; i++)
        backupData.collections[CONFIG_COLS[i]] = exportCol(CONFIG_COLS[i])
    }

    if (backupType === 'full' || backupType === 'files') {
      backupData.files = {}
      for (var fc in FILE_COLS) {
        var ff = FILE_COLS[fc]
        var frecs = []
        try {
          frecs = $app.findRecordsByFilter(fc, "id != ''", '', 100000, 0)
        } catch (_) {}
        var flist = []
        for (var i = 0; i < frecs.length; i++) {
          var fe = { id: frecs[i].id, collection: fc, files: {} }
          for (var j = 0; j < ff.length; j++) {
            try {
              var fv = frecs[i].getString(ff[j])
              if (fv) fe.files[ff[j]] = fv
            } catch (_) {}
          }
          flist.push(fe)
        }
        backupData.files[fc] = flist
      }
    }

    var jsonStr = JSON.stringify(backupData)
    var fileName =
      'backup_' + versionName.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Date.now() + '.json'
    var file = $filesystem.fileFromBytes(jsonStr, fileName)

    var backupCol = $app.findCollectionByNameOrId('backups')
    var record = new Record(backupCol)
    record.set('version_name', versionName)
    record.set('backup_type', backupType)
    record.set('backup_data', jsonStr)
    record.set('file', file)
    record.set('file_size', jsonStr.length)
    record.set('observations', observations)
    record.set('status', 'active')
    record.set('created_by_id', authUser.id)
    record.set('created_by_name', authUser.getString('name') || authUser.email || '')
    record.set('created_by_role', authUser.getString('role'))
    record.set('auto_generated', body.auto_generated || false)
    $app.save(record)

    try {
      var aCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(aCol)
      log.set('user_id', authUser.id)
      log.set('user_name', authUser.getString('name') || authUser.email || '')
      log.set('user_role', authUser.getString('role'))
      log.set('action', 'create')
      log.set('module', 'backup')
      log.set('target_collection', 'backups')
      log.set('target_id', record.id)
      log.set('target_summary', versionName + ' (' + backupType + ')')
      log.set('previous_value', null)
      log.set('new_value', { version: versionName, type: backupType, size: jsonStr.length })
      log.set('ip_address', ip)
      log.set('user_agent', ua)
      $app.save(log)
    } catch (_) {}

    return e.json(200, {
      success: true,
      id: record.id,
      version_name: versionName,
      file_size: jsonStr.length,
    })
  },
  $apis.requireAuth(),
)
