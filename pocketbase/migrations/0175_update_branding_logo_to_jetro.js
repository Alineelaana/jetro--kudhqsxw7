migrate(
  (app) => {
    // 1. Update document_templates collection if present
    try {
      if (app.hasTable('document_templates')) {
        app
          .db()
          .newQuery(
            "UPDATE document_templates SET logo = 'whatsapp-image-2026-08-09-at-23.25.57-e0712.jpeg', content = replace(CAST(content AS TEXT), 'Velora Log', 'Jetro'), header_html = replace(CAST(header_html AS TEXT), 'Velora Log', 'Jetro'), footer_html = replace(CAST(footer_html AS TEXT), 'Velora Log', 'Jetro') WHERE CAST(content AS TEXT) LIKE '%Velora%' OR CAST(header_html AS TEXT) LIKE '%Velora%' OR CAST(footer_html AS TEXT) LIKE '%Velora%' OR logo LIKE '%velora%' OR logo IS NULL OR logo = ''",
          )
          .execute()
      }
    } catch (_) {}

    // 2. Update empresas collection
    try {
      if (app.hasTable('empresas')) {
        app
          .db()
          .newQuery(
            "UPDATE empresas SET logo = 'whatsapp-image-2026-08-09-at-23.25.57-e0712.jpeg', name = replace(name, 'Velora Log', 'Jetro'), razao_social = replace(razao_social, 'Velora Log', 'Jetro - Plataforma Inteligente de Gestão Empresarial'), nome_fantasia = replace(nome_fantasia, 'Velora Log', 'Jetro') WHERE name LIKE '%Velora%' OR razao_social LIKE '%Velora%' OR nome_fantasia LIKE '%Velora%' OR logo LIKE '%velora%' OR logo IS NULL OR logo = ''",
          )
          .execute()
      }
    } catch (_) {}

    // 3. Update settings collection
    try {
      app
        .db()
        .newQuery(
          "UPDATE settings SET value = replace(value, 'Velora Log', 'Jetro - Plataforma Inteligente de Gestão Empresarial') WHERE value LIKE '%Velora%'",
        )
        .execute()
      app
        .db()
        .newQuery(
          "UPDATE settings SET value = replace(value, 'Veloralog', 'Jetro') WHERE value LIKE '%Veloralog%'",
        )
        .execute()
    } catch (_) {}

    // 4. Update cms_content collection
    try {
      app
        .db()
        .newQuery(
          "UPDATE cms_content SET draft_data = replace(CAST(draft_data AS TEXT), 'Velora Log', 'Jetro - Plataforma Inteligente de Gestão Empresarial'), published_data = replace(CAST(published_data AS TEXT), 'Velora Log', 'Jetro - Plataforma Inteligente de Gestão Empresarial') WHERE CAST(draft_data AS TEXT) LIKE '%Velora%' OR CAST(published_data AS TEXT) LIKE '%Velora%'",
        )
        .execute()
      app
        .db()
        .newQuery(
          "UPDATE cms_content SET draft_data = replace(CAST(draft_data AS TEXT), 'Veloralog', 'Jetro'), published_data = replace(CAST(published_data AS TEXT), 'Veloralog', 'Jetro') WHERE CAST(draft_data AS TEXT) LIKE '%Veloralog%' OR CAST(published_data AS TEXT) LIKE '%Veloralog%'",
        )
        .execute()
    } catch (_) {}

    // 5. Update vitrine_items collection
    try {
      app
        .db()
        .newQuery(
          "UPDATE vitrine_items SET title = replace(title, 'Velora Log', 'Jetro'), description = replace(description, 'Velora Log', 'Jetro - Plataforma Inteligente de Gestão Empresarial') WHERE title LIKE '%Velora%' OR description LIKE '%Velora%'",
        )
        .execute()
    } catch (_) {}

    // 6. Update system_parameters collection if present
    try {
      if (app.hasTable('system_parameters')) {
        app
          .db()
          .newQuery(
            "UPDATE system_parameters SET value = replace(value, 'Velora Log', 'Jetro - Plataforma Inteligente de Gestão Empresarial') WHERE value LIKE '%Velora%'",
          )
          .execute()
        app
          .db()
          .newQuery(
            "UPDATE system_parameters SET value = replace(value, 'Veloralog', 'Jetro') WHERE value LIKE '%Veloralog%'",
          )
          .execute()
      }
    } catch (_) {}
  },
  (app) => {},
)
