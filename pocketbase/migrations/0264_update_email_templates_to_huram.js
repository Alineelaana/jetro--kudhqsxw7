migrate(
  (app) => {
    // Atualizar modelos de e-mail (email_templates) de Jetro -> HURAM mantendo destinatários e links operacionais
    try {
      if (app.hasTable('email_templates')) {
        app
          .db()
          .newQuery(
            "UPDATE email_templates SET subject = replace(replace(subject, 'Jetro', 'HURAM'), 'JETRO', 'HURAM'), body = replace(replace(body, 'Jetro', 'HURAM'), 'JETRO', 'HURAM') WHERE subject LIKE '%Jetro%' OR subject LIKE '%JETRO%' OR body LIKE '%Jetro%' OR body LIKE '%JETRO%'",
          )
          .execute()
      }
    } catch (_) {}
  },
  (app) => {
    // Reversão no-op para idempotência
  },
)
