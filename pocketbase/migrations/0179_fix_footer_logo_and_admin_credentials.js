migrate(
  (app) => {
    // 1. Ensure the admin user exists with jetrosup / jetroadm / SUP / active
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      var adminUser = null

      // Try by email first
      try {
        adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'jetrosup@jetro.com.br')
      } catch (_) {}

      // Try by username
      if (!adminUser) {
        try {
          adminUser = app.findFirstRecordByData('users', 'username', 'jetrosup')
        } catch (_) {}
      }

      // Try legacy email
      if (!adminUser) {
        try {
          adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'veloralog@veloralog.com')
        } catch (_) {}
      }

      if (adminUser) {
        adminUser.set('username', 'jetrosup')
        adminUser.setEmail('jetrosup@jetro.com.br')
        adminUser.setPassword('jetroadm')
        adminUser.set('role', 'SUP')
        adminUser.set('active', true)
        adminUser.set('name', 'Jetro Admin')
        adminUser.setVerified(true)
        app.save(adminUser)
      } else {
        var record = new Record(usersCol)
        record.setEmail('jetrosup@jetro.com.br')
        record.setPassword('jetroadm')
        record.setVerified(true)
        record.set('username', 'jetrosup')
        record.set('name', 'Jetro Admin')
        record.set('role', 'SUP')
        record.set('active', true)
        app.save(record)
      }
    } catch (e) {
      console.log('Migration 0179 admin user notice:', e)
    }

    // 2. Update settings for footer logo reference (idempotent)
    var jetroLogoFilename = 'whatsapp-image-2026-08-09-at-23.25.57-64131.jpeg'

    try {
      if (app.hasTable('settings')) {
        app
          .db()
          .newQuery(
            `UPDATE settings 
             SET value = {:logo} 
             WHERE key IN ('footer_logo', 'company_logo', 'pdf_logo', 'budget_pdf_logo', 'logo', 'orcamentos_logo', 'header_logo')`,
          )
          .bind({ logo: jetroLogoFilename })
          .execute()
      }
    } catch (e) {
      console.log('Migration 0179 settings update notice:', e)
    }

    // 3. Update empresas collection logo reference (idempotent)
    try {
      if (app.hasTable('empresas')) {
        app
          .db()
          .newQuery(
            `UPDATE empresas 
             SET logo = {:logo} 
             WHERE logo LIKE '%velora%' 
                OR logo LIKE '%whatsapp-image-2026-08-09-at-23.25.57-1%' 
                OR logo IS NULL 
                OR logo = ''`,
          )
          .bind({ logo: jetroLogoFilename })
          .execute()
      }
    } catch (e) {
      console.log('Migration 0179 empresas update notice:', e)
    }

    // 4. Update document_templates logo reference (idempotent)
    try {
      if (app.hasTable('document_templates')) {
        app
          .db()
          .newQuery(
            `UPDATE document_templates 
             SET logo = {:logo} 
             WHERE logo LIKE '%velora%' 
                OR logo LIKE '%whatsapp-image-2026-08-09-at-23.25.57-1%' 
                OR logo IS NULL 
                OR logo = ''`,
          )
          .bind({ logo: jetroLogoFilename })
          .execute()
      }
    } catch (e) {
      console.log('Migration 0179 document_templates update notice:', e)
    }
  },
  (app) => {},
)
