migrate(
  (app) => {
    const conversations = new Collection({
      name: 'chat_conversations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '',
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.role = 'SUP'",
      fields: [
        { name: 'client_name', type: 'text' },
        { name: 'client_email', type: 'text' },
        { name: 'client_phone', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'last_message_at', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_chat_conversations_status ON chat_conversations (status)',
        'CREATE INDEX idx_chat_conversations_created ON chat_conversations (created)',
      ],
    })
    app.save(conversations)

    const convId = app.findCollectionByNameOrId('chat_conversations').id

    const messages = new Collection({
      name: 'chat_messages',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '',
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.role = 'SUP'",
      fields: [
        {
          name: 'conversation_id',
          type: 'relation',
          required: true,
          collectionId: convId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'sender',
          type: 'select',
          required: true,
          values: ['client', 'attendant', 'ai'],
          maxSelect: 1,
        },
        { name: 'content', type: 'text', required: true },
        { name: 'author_name', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_chat_messages_conversation ON chat_messages (conversation_id, created)',
      ],
    })
    app.save(messages)

    try {
      app.findFirstRecordByData('chat_conversations', 'client_name', 'João Silva')
    } catch (_) {
      const col = app.findCollectionByNameOrId('chat_conversations')
      const conv = new Record(col)
      conv.set('client_name', 'João Silva')
      conv.set('client_email', 'joao.silva@email.com')
      conv.set('client_phone', '31999887766')
      conv.set('status', 'active')
      conv.set('last_message_at', new Date().toISOString())
      app.save(conv)

      const msgCol = app.findCollectionByNameOrId('chat_messages')
      const m1 = new Record(msgCol)
      m1.set('conversation_id', conv.id)
      m1.set('sender', 'client')
      m1.set('content', 'Olá! Gostaria de saber sobre serviços de armazenagem.')
      m1.set('author_name', 'João Silva')
      app.save(m1)

      const m2 = new Record(msgCol)
      m2.set('conversation_id', conv.id)
      m2.set('sender', 'ai')
      m2.set(
        'content',
        'Olá, João! Bem-vindo à VeloraLog. No momento não temos atendentes disponíveis, mas pode deixar seu contato que retornaremos assim que possível. Obrigado!',
      )
      m2.set('author_name', 'Srta. Velora (IA)')
      app.save(m2)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('chat_messages'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('chat_conversations'))
    } catch (_) {}
  },
)
