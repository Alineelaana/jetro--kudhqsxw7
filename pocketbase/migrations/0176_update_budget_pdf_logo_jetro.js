migrate(
  (app) => {
    const jetroLogoFilename = 'whatsapp-image-2026-08-09-at-23.25.57-c8e57.jpeg'

    // 1. Update document_templates collection for orcamentos category
    try {
      if (app.hasTable('document_templates')) {
        app
          .db()
          .newQuery(
            `UPDATE document_templates 
             SET logo = {:logo}, 
                 content = replace(replace(CAST(content AS TEXT), 'Velora Log', 'Jetro'), 'Veloralog', 'Jetro'), 
                 header_html = replace(replace(CAST(header_html AS TEXT), 'Velora Log', 'Jetro'), 'Veloralog', 'Jetro'), 
                 footer_html = replace(replace(CAST(footer_html AS TEXT), 'Velora Log', 'Jetro'), 'Veloralog', 'Jetro') 
             WHERE category = 'orcamentos' 
                OR type = 'orcamentos' 
                OR title LIKE '%Orçamento%' 
                OR CAST(content AS TEXT) LIKE '%Velora%' 
                OR CAST(header_html AS TEXT) LIKE '%Velora%' 
                OR logo LIKE '%velora%' 
                OR logo LIKE '%e0712%' 
                OR logo IS NULL 
                OR logo = ''`,
          )
          .bind({ logo: jetroLogoFilename })
          .execute()
      }
    } catch (e) {
      console.log('Migration 0176 document_templates update notice:', e)
    }

    // 2. Update empresas collection to ensure default logo is the new Jetro image
    try {
      if (app.hasTable('empresas')) {
        app
          .db()
          .newQuery(
            `UPDATE empresas 
             SET logo = {:logo}, 
                 name = replace(replace(name, 'Velora Log', 'Jetro'), 'Veloralog', 'Jetro'), 
                 razao_social = replace(replace(razao_social, 'Velora Log', 'Jetro - Plataforma Inteligente de Gestão Empresarial'), 'Veloralog', 'Jetro'), 
                 nome_fantasia = replace(replace(nome_fantasia, 'Velora Log', 'Jetro'), 'Veloralog', 'Jetro') 
             WHERE name LIKE '%Velora%' 
                OR razao_social LIKE '%Velora%' 
                OR nome_fantasia LIKE '%Velora%' 
                OR logo LIKE '%velora%' 
                OR logo LIKE '%e0712%' 
                OR logo IS NULL 
                OR logo = ''`,
          )
          .bind({ logo: jetroLogoFilename })
          .execute()
      }
    } catch (e) {
      console.log('Migration 0176 empresas update notice:', e)
    }

    // 3. Update settings collection for system default pdf / company logos
    try {
      if (app.hasTable('settings')) {
        app
          .db()
          .newQuery(
            `UPDATE settings 
             SET value = {:logo} 
             WHERE key IN ('company_logo', 'pdf_logo', 'budget_pdf_logo', 'logo', 'orcamentos_logo')`,
          )
          .bind({ logo: jetroLogoFilename })
          .execute()

        app
          .db()
          .newQuery(
            `UPDATE settings 
             SET value = replace(replace(value, 'Velora Log', 'Jetro'), 'Veloralog', 'Jetro') 
             WHERE value LIKE '%Velora%'`,
          )
          .execute()
      }
    } catch (e) {
      console.log('Migration 0176 settings update notice:', e)
    }
  },
  (app) => {},
)
