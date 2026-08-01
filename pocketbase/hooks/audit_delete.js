onRecordDeleteRequest(
  (e) => {
    var ip = ''
    var ua = ''
    var authUser = null
    try {
      ip = e.request.remoteAddr || ''
    } catch (_) {}
    try {
      ua = (e.requestInfo().headers || {})['user_agent'] || ''
    } catch (_) {}
    try {
      authUser = e.auth
    } catch (_) {}

    var collection = e.record.collectionName
    var AUDITED = [
      'users',
      'partners',
      'partner_types',
      'budget_requests',
      'budget_form_fields',
      'settings',
      'cms_content',
      'cms_versions',
      'cms_history',
      'cms_media',
      'cms_publication',
      'vitrine_items',
      'ai_training',
      'chat_conversations',
      'services_offered',
    ]
    if (AUDITED.indexOf(collection) === -1) {
      e.next()
      return
    }

    var FIELDS = [
      'name',
      'email',
      'role',
      'active',
      'cpf',
      'attendant_status',
      'full_name',
      'company_name',
      'trade_name',
      'cnpj',
      'partner_type',
      'person_type',
      'blocked',
      'financial_restriction',
      'phone',
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
      'key',
      'value',
      'label',
      'type',
      'options',
      'required',
      'order',
      'section_key',
      'draft_data',
      'published_data',
      'version_data',
      'version_number',
      'published_at',
      'field_name',
      'old_value',
      'new_value',
      'action',
      'file',
      'alt_text',
      'folder',
      'title',
      'subtitle',
      'description',
      'image_desktop',
      'image_mobile',
      'button_text',
      'button_link',
      'display_page',
      'display_order',
      'start_date',
      'end_date',
      'click_destination',
      'has_publish_history',
      'content',
      'last_published_at',
      'pending_changes',
      'last_message_at',
      'closed',
      'client_id',
      'observations',
      'financial_history',
      'max_discount',
    ]

    function snap(rec) {
      var d = { id: rec.id }
      for (var i = 0; i < FIELDS.length; i++) {
        try {
          var v = rec.get(FIELDS[i])
          if (v !== null && v !== undefined && v !== '') d[FIELDS[i]] = v
        } catch (_) {}
      }
      return d
    }

    var prevSnap = snap(e.record)

    var summary = e.record.id
    var fNames = [
      'name',
      'full_name',
      'company_name',
      'client_name',
      'section_key',
      'key',
      'title',
      'label',
    ]
    for (var fi = 0; fi < fNames.length; fi++) {
      try {
        var sv = e.record.getString(fNames[fi])
        if (sv) {
          summary = sv
          break
        }
      } catch (_) {}
    }

    e.next()

    try {
      var MOD_MAP = {
        users: 'users',
        partners: 'partners',
        partner_types: 'partners',
        budget_requests: 'budgets',
        budget_form_fields: 'settings',
        settings: 'settings',
        cms_content: 'site_management',
        cms_versions: 'site_management',
        cms_history: 'site_management',
        cms_media: 'files',
        cms_publication: 'site_management',
        vitrine_items: 'vitrine',
        ai_training: 'settings',
        chat_conversations: 'settings',
        services_offered: 'services_offered',
      }
      var mod = MOD_MAP[collection] || 'settings'

      var action = 'delete'
      if (collection === 'cms_media') action = 'delete_file'

      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(auditCol)
      log.set('user_id', authUser ? authUser.id : '')
      log.set('user_name', authUser ? authUser.getString('name') || authUser.email || '' : '')
      log.set('user_role', authUser ? authUser.getString('role') : '')
      log.set('action', action)
      log.set('module', mod)
      log.set('target_collection', collection)
      log.set('target_id', e.record.id)
      log.set('target_summary', summary)
      log.set('previous_value', prevSnap)
      log.set('new_value', null)
      log.set('ip_address', ip)
      log.set('user_agent', ua)
      $app.save(log)
    } catch (err) {
      $app.logger().error('audit delete log failed', 'error', String(err))
    }
  },
  'users',
  'partners',
  'partner_types',
  'budget_requests',
  'budget_form_fields',
  'settings',
  'cms_content',
  'cms_versions',
  'cms_history',
  'cms_media',
  'cms_publication',
  'vitrine_items',
  'ai_training',
  'chat_conversations',
  'services_offered',
)
