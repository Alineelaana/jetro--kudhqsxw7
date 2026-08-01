migrate(
  (app) => {
    var training = new Collection({
      name: 'ai_training',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'SUP'",
      updateRule: "@request.auth.role = 'SUP'",
      deleteRule: "@request.auth.role = 'SUP'",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['instruction', 'qa', 'template'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_ai_training_type ON ai_training (type)'],
    })
    app.save(training)

    try {
      app.findFirstRecordByData('settings', 'key', 'ai_fulltime_active')
    } catch (_) {
      var settingsCol = app.findCollectionByNameOrId('settings')
      var setting = new Record(settingsCol)
      setting.set('key', 'ai_fulltime_active')
      setting.set('value', 'false')
      app.save(setting)
    }

    try {
      app.findFirstRecordByData('ai_training', 'title', 'Apresentação da VeloraLog')
    } catch (_) {
      var trainCol = app.findCollectionByNameOrId('ai_training')
      var t1 = new Record(trainCol)
      t1.set('title', 'Apresentação da VeloraLog')
      t1.set(
        'content',
        'A VeloraLog é uma empresa de operações logísticas no Espírito Santo. Oferecemos armazenagem, transporte de cargas, distribuição urbana, logística portuária, cross docking e gestão de frota. Atendemos em todo o estado do Espírito Santo com infraestrutura moderna e segura.',
      )
      t1.set('type', 'instruction')
      app.save(t1)

      var t2 = new Record(trainCol)
      t2.set('title', 'Como solicitar orçamento')
      t2.set(
        'content',
        'Quando o cliente quiser solicitar um orçamento, oriente-o a informar: tipo de mercadoria, volume estimado, cidade de origem e destino, e periodicidade da operação. Também informe que é possível solicitar orçamento pelo formulário no site ou pelo WhatsApp.',
      )
      t2.set('type', 'qa')
      app.save(t2)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('ai_training'))
    } catch (_) {}
    try {
      var s = app.findFirstRecordByData('settings', 'key', 'ai_fulltime_active')
      app.delete(s)
    } catch (_) {}
  },
)
