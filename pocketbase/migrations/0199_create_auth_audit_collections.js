/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // 1. Coleção auth_events (Eventos detalhados e imutáveis de autenticação)
    const authEventsCol = new Collection({
      name: 'auth_events',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'SUP' || user_id = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'SUP' || user_id = @request.auth.id)",
      createRule: "@request.auth.id != ''",
      updateRule: null, // Imutável - não sobrescrever registros de auditoria
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'SUP'",
      fields: [
        { name: 'user_id', type: 'text', required: false },
        { name: 'user_name', type: 'text', required: false },
        { name: 'user_email', type: 'text', required: false },
        { name: 'user_role', type: 'text', required: false },
        {
          name: 'event_type',
          type: 'select',
          required: true,
          values: [
            'login',
            'login_failed',
            'logout',
            'session_expired',
            'session_terminated',
            'blocked_attempt',
            'session_activity',
            'additional_auth',
          ],
          maxSelect: 1,
        },
        {
          name: 'result',
          type: 'select',
          required: true,
          values: ['sucesso', 'falha'],
          maxSelect: 1,
        },
        { name: 'failure_reason', type: 'text', required: false },
        { name: 'session_id', type: 'text', required: false },
        { name: 'auth_method', type: 'text', required: false }, // senha, mfa, sso, etc
        { name: 'ip_address', type: 'text', required: false },
        { name: 'ip_version', type: 'text', required: false }, // IPv4, IPv6
        { name: 'device_type', type: 'text', required: false }, // Desktop, Mobile, Tablet, Desconhecido
        { name: 'os_name', type: 'text', required: false }, // Windows, macOS, Android, iOS, Linux
        { name: 'browser_name', type: 'text', required: false }, // Chrome, Edge, Firefox, Safari
        { name: 'user_agent', type: 'text', required: false },
        {
          name: 'location_origin',
          type: 'select',
          required: false,
          values: ['geolocalizacao_autorizada', 'ip', 'nao_disponivel'],
          maxSelect: 1,
        },
        { name: 'latitude', type: 'number', required: false },
        { name: 'longitude', type: 'number', required: false },
        { name: 'accuracy_meters', type: 'number', required: false },
        { name: 'city', type: 'text', required: false },
        { name: 'state', type: 'text', required: false },
        { name: 'country', type: 'text', required: false },
        { name: 'isp_network', type: 'text', required: false },
        { name: 'session_ended_at', type: 'text', required: false },
        { name: 'metadata', type: 'json', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_authev_user_created ON auth_events (user_id, created DESC)',
        'CREATE INDEX idx_authev_session ON auth_events (session_id)',
        'CREATE INDEX idx_authev_type ON auth_events (event_type)',
        'CREATE INDEX idx_authev_result ON auth_events (result)',
        'CREATE INDEX idx_authev_ip ON auth_events (ip_address)',
      ],
    })
    app.save(authEventsCol)

    // 2. Atualizar ou garantir campos em audit_sessions
    try {
      const sessCol = app.findCollectionByNameOrId('audit_sessions')
      let changed = false
      if (!sessCol.fields.getByName('last_activity')) {
        sessCol.fields.add(new TextField({ name: 'last_activity' }))
        changed = true
      }
      if (!sessCol.fields.getByName('ended_by')) {
        sessCol.fields.add(new TextField({ name: 'ended_by' }))
        changed = true
      }
      if (!sessCol.fields.getByName('terminated_reason')) {
        sessCol.fields.add(new TextField({ name: 'terminated_reason' }))
        changed = true
      }
      if (!sessCol.fields.getByName('is_invalidated')) {
        sessCol.fields.add(new BoolField({ name: 'is_invalidated' }))
        changed = true
      }
      if (!sessCol.fields.getByName('location_origin')) {
        sessCol.fields.add(new TextField({ name: 'location_origin' }))
        changed = true
      }
      if (!sessCol.fields.getByName('city')) {
        sessCol.fields.add(new TextField({ name: 'city' }))
        changed = true
      }
      if (!sessCol.fields.getByName('state')) {
        sessCol.fields.add(new TextField({ name: 'state' }))
        changed = true
      }
      if (!sessCol.fields.getByName('country')) {
        sessCol.fields.add(new TextField({ name: 'country' }))
        changed = true
      }
      if (changed) {
        app.save(sessCol)
      }
    } catch (_) {}

    // 3. Coleção audit_access_logs (Auditoria de quem consultou coordenadas precisas ou histórico restrito - LGPD)
    const accessLogsCol = new Collection({
      name: 'audit_access_consultations',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.role = 'SUP'",
      viewRule: "@request.auth.id != '' && @request.auth.role = 'SUP'",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'operator_id', type: 'text', required: true },
        { name: 'operator_name', type: 'text', required: true },
        { name: 'operator_role', type: 'text', required: false },
        { name: 'target_user_id', type: 'text', required: true },
        { name: 'target_user_name', type: 'text', required: false },
        {
          name: 'action_consulted',
          type: 'select',
          required: true,
          values: [
            'visualizar_coordenadas_precisas',
            'consultar_historico_acessos',
            'exportar_relatorio_acessos',
            'encerrar_sessao_remota',
          ],
          maxSelect: 1,
        },
        { name: 'justification', type: 'text', required: false },
        { name: 'ip_address', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_aac_target ON audit_access_consultations (target_user_id, created DESC)',
        'CREATE INDEX idx_aac_operator ON audit_access_consultations (operator_id)',
      ],
    })
    app.save(accessLogsCol)

    // 4. Coleção auth_retention_policy (Política de retenção LGPD configurável)
    const retentionCol = new Collection({
      name: 'auth_retention_policies',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.role = 'SUP'",
      viewRule: "@request.auth.id != '' && @request.auth.role = 'SUP'",
      createRule: "@request.auth.id != '' && @request.auth.role = 'SUP'",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'SUP'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'SUP'",
      fields: [
        { name: 'retention_days', type: 'number', required: true }, // ex: 90, 180, 365
        { name: 'anonymize_ip_after_days', type: 'number', required: false }, // anonimização de IPs
        { name: 'delete_precise_coords_after_days', type: 'number', required: false }, // exclusão de coords precisas
        { name: 'legal_basis', type: 'text', required: false }, // LGPD Art. 7, legítimo interesse, segurança
        { name: 'auto_purge_enabled', type: 'bool', required: false },
        { name: 'last_purged_at', type: 'text', required: false },
        { name: 'updated_by_id', type: 'text', required: false },
        { name: 'updated_by_name', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(retentionCol)

    // Seed padrão da política de retenção inicial se não existir
    try {
      const rec = new Record(retentionCol)
      rec.set('retention_days', 365)
      rec.set('anonymize_ip_after_days', 180)
      rec.set('delete_precise_coords_after_days', 90)
      rec.set(
        'legal_basis',
        'LGPD Art. 7º IX - Legítimo Interesse para Prevenção à Fraude e Segurança de Redes',
      )
      rec.set('auto_purge_enabled', true)
      app.save(rec)
    } catch (_) {}
  },
  (app) => {
    try {
      const col1 = app.findCollectionByNameOrId('auth_events')
      app.delete(col1)
    } catch {}
    try {
      const col2 = app.findCollectionByNameOrId('audit_access_consultations')
      app.delete(col2)
    } catch {}
    try {
      const col3 = app.findCollectionByNameOrId('auth_retention_policies')
      app.delete(col3)
    } catch {}
  },
)
