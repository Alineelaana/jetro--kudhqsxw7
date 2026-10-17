migrate(
  (app) => {
    // 1. Atualizar modelos de e-mail (email_templates)
    try {
      if (app.hasTable('email_templates')) {
        // Atualizar sender noreply@veloralog.com.br -> noreply@jetro.com.br
        app
          .db()
          .newQuery(
            "UPDATE email_templates SET sender = replace(sender, 'noreply@veloralog.com.br', 'noreply@jetro.com.br') WHERE sender LIKE '%veloralog%'",
          )
          .execute()

        // Atualizar sender generico caso haja
        app
          .db()
          .newQuery(
            "UPDATE email_templates SET sender = replace(replace(sender, 'VeloraLog', 'Jetro'), 'Velora Log', 'Jetro') WHERE sender LIKE '%velora%'",
          )
          .execute()

        // Atualizar subject
        app
          .db()
          .newQuery(
            "UPDATE email_templates SET subject = replace(replace(replace(subject, 'Velora Log', 'Jetro'), 'VeloraLog', 'Jetro'), 'veloralog', 'jetro') WHERE subject LIKE '%velora%'",
          )
          .execute()

        // Atualizar body
        app
          .db()
          .newQuery(
            "UPDATE email_templates SET body = replace(replace(replace(body, 'Velora Log', 'Jetro'), 'VeloraLog', 'Jetro'), 'veloralog.com.br', 'jetro.com.br') WHERE body LIKE '%velora%'",
          )
          .execute()
      }
    } catch (_) {}

    // 2. Atualizar apresentação de treinamento da IA (ai_training)
    try {
      if (app.hasTable('ai_training')) {
        app
          .db()
          .newQuery(
            "UPDATE ai_training SET title = replace(replace(title, 'VeloraLog', 'Jetro'), 'Velora Log', 'Jetro'), content = replace(replace(replace(content, 'A VeloraLog é uma empresa de operações logísticas no Espírito Santo.', 'A Jetro é uma empresa de operações logísticas e gestão integrada no Espírito Santo.'), 'VeloraLog', 'Jetro'), 'Velora Log', 'Jetro') WHERE title LIKE '%velora%' OR content LIKE '%velora%'",
          )
          .execute()
      }
    } catch (_) {}

    // 3. Atualizar configurações de sistema (system_parameters)
    try {
      if (app.hasTable('system_parameters')) {
        app
          .db()
          .newQuery(
            "UPDATE system_parameters SET value = replace(replace(replace(value, 'noreply@veloralog.com.br', 'noreply@jetro.com.br'), 'VeloraLog', 'Jetro'), 'Velora Log', 'Jetro') WHERE value LIKE '%velora%'",
          )
          .execute()
      }
    } catch (_) {}

    // 4. Atualizar settings se houver
    try {
      if (app.hasTable('settings')) {
        app
          .db()
          .newQuery(
            "UPDATE settings SET value = replace(replace(replace(value, 'noreply@veloralog.com.br', 'noreply@jetro.com.br'), 'VeloraLog', 'Jetro'), 'Velora Log', 'Jetro') WHERE value LIKE '%velora%'",
          )
          .execute()
      }
    } catch (_) {}

    // 5. Atualizar backups (ex: versão inicial "VeloraLog v1.0" -> "Jetro v1.0")
    try {
      if (app.hasTable('backups')) {
        app
          .db()
          .newQuery(
            "UPDATE backups SET version_name = replace(replace(version_name, 'VeloraLog', 'Jetro'), 'Velora Log', 'Jetro'), observations = replace(replace(observations, 'VeloraLog', 'Jetro'), 'Velora Log', 'Jetro') WHERE version_name LIKE '%velora%' OR observations LIKE '%velora%'",
          )
          .execute()
      }
    } catch (_) {}

    // 6. Atualizar document_templates se houver
    try {
      if (app.hasTable('document_templates')) {
        app
          .db()
          .newQuery(
            "UPDATE document_templates SET header = replace(replace(header, 'VeloraLog', 'Jetro'), 'Velora Log', 'Jetro'), footer = replace(replace(footer, 'VeloraLog', 'Jetro'), 'Velora Log', 'Jetro') WHERE header LIKE '%velora%' OR footer LIKE '%velora%'",
          )
          .execute()
      }
    } catch (_) {}

    // 7. Atualizar cms_content se houver resquícios em JSON
    try {
      if (app.hasTable('cms_content')) {
        app
          .db()
          .newQuery(
            "UPDATE cms_content SET draft_data = replace(replace(replace(CAST(draft_data AS TEXT), 'Velora Log', 'Jetro'), 'VeloraLog', 'Jetro'), 'veloralog', 'jetro'), published_data = replace(replace(replace(CAST(published_data AS TEXT), 'Velora Log', 'Jetro'), 'VeloraLog', 'Jetro'), 'veloralog', 'jetro') WHERE CAST(draft_data AS TEXT) LIKE '%velora%' OR CAST(published_data AS TEXT) LIKE '%velora%'",
          )
          .execute()
      }
    } catch (_) {}
  },
  (app) => {
    // Reversão básica opcional (no-op para idempotência)
  },
)
