/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // Atualiza Gran Romano: instagram correto @granromanofoods
    try {
      const gran = app.findFirstRecordByFilter('site_clients', "nome ~ 'Gran Romano'")
      if (gran) {
        gran.set('instagram', 'granromanofoods')
        app.save(gran)
      }
    } catch (e) {
      // ignora se não encontrar
    }

    // Desativa Velora Digital Commerce da vitrine pública (ativo = false)
    try {
      const velora = app.findFirstRecordByFilter('site_clients', "nome ~ 'Velora'")
      if (velora) {
        velora.set('ativo', false)
        app.save(velora)
      }
    } catch (e) {}

    // Desativa RBJ da vitrine pública (ativo = false)
    try {
      const rbj = app.findFirstRecordByFilter('site_clients', "nome ~ 'RBJ'")
      if (rbj) {
        rbj.set('ativo', false)
        app.save(rbj)
      }
    } catch (e) {}
  },
  (app) => {
    // rollback no-op
  },
)
