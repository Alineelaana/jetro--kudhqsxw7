migrate(
  (app) => {
    // Update settings collection where key or value references Velora Log
    try {
      app
        .db()
        .newQuery(
          "UPDATE settings SET value = replace(value, 'Velora Log', 'Jetro - Plataforma Inteligente de Gestão Empresarial') WHERE value LIKE '%Velora Log%'",
        )
        .execute()
    } catch (_) {}

    // Update cms_content collection
    try {
      app
        .db()
        .newQuery(
          "UPDATE cms_content SET draft_data = replace(CAST(draft_data AS TEXT), 'Velora Log', 'Jetro - Plataforma Inteligente de Gestão Empresarial'), published_data = replace(CAST(published_data AS TEXT), 'Velora Log', 'Jetro - Plataforma Inteligente de Gestão Empresarial') WHERE CAST(draft_data AS TEXT) LIKE '%Velora Log%' OR CAST(published_data AS TEXT) LIKE '%Velora Log%'",
        )
        .execute()
    } catch (_) {}

    // Update vitrine_items collection
    try {
      app
        .db()
        .newQuery(
          "UPDATE vitrine_items SET title = replace(title, 'Velora Log', 'Jetro'), description = replace(description, 'Velora Log', 'Jetro - Plataforma Inteligente de Gestão Empresarial') WHERE title LIKE '%Velora Log%' OR description LIKE '%Velora Log%'",
        )
        .execute()
    } catch (_) {}

    // Update empresas collection if present
    try {
      if (app.hasTable('empresas')) {
        app
          .db()
          .newQuery(
            "UPDATE empresas SET name = replace(name, 'Velora Log', 'Jetro'), razao_social = replace(razao_social, 'Velora Log', 'Jetro - Plataforma Inteligente de Gestão Empresarial'), nome_fantasia = replace(nome_fantasia, 'Velora Log', 'Jetro') WHERE name LIKE '%Velora Log%' OR razao_social LIKE '%Velora Log%' OR nome_fantasia LIKE '%Velora Log%'",
          )
          .execute()
      }
    } catch (_) {}

    // Update system_parameters if present
    try {
      if (app.hasTable('system_parameters')) {
        app
          .db()
          .newQuery(
            "UPDATE system_parameters SET value = replace(value, 'Velora Log', 'Jetro - Plataforma Inteligente de Gestão Empresarial') WHERE value LIKE '%Velora Log%'",
          )
          .execute()
      }
    } catch (_) {}
  },
  (app) => {
    try {
      app
        .db()
        .newQuery(
          "UPDATE settings SET value = replace(value, 'Jetro - Plataforma Inteligente de Gestão Empresarial', 'Velora Log') WHERE value LIKE '%Jetro%'",
        )
        .execute()
    } catch (_) {}
  },
)
