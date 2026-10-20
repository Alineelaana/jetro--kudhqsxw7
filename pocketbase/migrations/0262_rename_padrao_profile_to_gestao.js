/// <reference types="pocketbase" />

/**
 * Migration 0262: Renomear Perfil "PADRAO" (Usuário Padrão) para "Gestão"
 * Preserva id existente, código PADRAO e permissões intactas.
 * Idempotente: atualiza o registro na coleção perfis_permissoes.
 */
migrate(
  (app) => {
    try {
      const padraoRecord = app.findFirstRecordByData('perfis_permissoes', 'code', 'PADRAO')
      if (padraoRecord) {
        padraoRecord.set('name', 'Gestão')
        padraoRecord.set(
          'description',
          'Perfil de Gestão — acesso operacional e tático do Jetro ERP',
        )
        app.save(padraoRecord)
      } else {
        const collection = app.findCollectionByNameOrId('perfis_permissoes')
        const Record = Record || $app.findRecordById?.constructor || Object
        // Se por ventura não existir, cria garantindo integridade
        const newRecord = new Record(collection)
        newRecord.set('code', 'PADRAO')
        newRecord.set('name', 'Gestão')
        newRecord.set('description', 'Perfil de Gestão — acesso operacional e tático do Jetro ERP')
        newRecord.set('active', true)
        newRecord.set('permissions', { 'supplier_allowance.view': true })
        app.save(newRecord)
      }
    } catch (e) {
      // Ignora erro se já estiver atualizado ou app em execução isolada
    }
  },
  (app) => {
    try {
      const padraoRecord = app.findFirstRecordByData('perfis_permissoes', 'code', 'PADRAO')
      if (padraoRecord) {
        padraoRecord.set('name', 'Padrao')
        padraoRecord.set('description', 'Perfil padrao com acesso basico')
        app.save(padraoRecord)
      }
    } catch {
      // noop
    }
  },
)
