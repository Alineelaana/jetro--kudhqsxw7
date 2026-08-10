migrate(
  (app) => {
    const jetroLogoFilename = 'whatsapp-image-2026-08-09-at-23.25.57-64131.jpeg'

    // 1. Update empresas collection to ensure active company default logo is updated to the original Jetro logo
    try {
      if (app.hasTable('empresas')) {
        app
          .db()
          .newQuery(
            `UPDATE empresas 
             SET logo = {:logo} 
             WHERE logo LIKE '%whatsapp%' 
                OR logo LIKE '%velora%' 
                OR logo IS NULL 
                OR logo = ''`,
          )
          .bind({ logo: jetroLogoFilename })
          .execute()
      }
    } catch (e) {
      console.log('Migration 0178 empresas update notice:', e)
    }

    // 2. Update document_templates collection for pdfs and documents header
    try {
      if (app.hasTable('document_templates')) {
        app
          .db()
          .newQuery(
            `UPDATE document_templates 
             SET logo = {:logo} 
             WHERE logo LIKE '%whatsapp%' 
                OR logo LIKE '%velora%' 
                OR logo IS NULL 
                OR logo = ''`,
          )
          .bind({ logo: jetroLogoFilename })
          .execute()
      }
    } catch (e) {
      console.log('Migration 0178 document_templates update notice:', e)
    }

    // 3. Update settings collection for header and default system logo
    try {
      if (app.hasTable('settings')) {
        app
          .db()
          .newQuery(
            `UPDATE settings 
             SET value = {:logo} 
             WHERE key IN ('company_logo', 'pdf_logo', 'budget_pdf_logo', 'logo', 'orcamentos_logo', 'header_logo')`,
          )
          .bind({ logo: jetroLogoFilename })
          .execute()
      }
    } catch (e) {
      console.log('Migration 0178 settings update notice:', e)
    }
  },
  (app) => {},
)
