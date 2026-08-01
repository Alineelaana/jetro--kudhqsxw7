migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'vitrine_items',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: "@request.auth.role = 'SUP'",
        updateRule: "@request.auth.role = 'SUP'",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'name', type: 'text', required: true },
          {
            name: 'type',
            type: 'select',
            required: true,
            values: [
              'banner_principal',
              'banner_interno',
              'campanha_promocional',
              'destaque_servico',
              'chamada_orcamento',
              'imagem_texto',
              'bloco_promocional',
              'aviso',
            ],
            maxSelect: 1,
          },
          { name: 'title', type: 'text' },
          { name: 'subtitle', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'image_desktop', type: 'text' },
          { name: 'image_mobile', type: 'text' },
          { name: 'image_alt', type: 'text' },
          { name: 'button_text', type: 'text' },
          { name: 'button_link', type: 'text' },
          { name: 'text_color', type: 'text' },
          { name: 'bg_color', type: 'text' },
          { name: 'overlay_color', type: 'text' },
          { name: 'opacity', type: 'number', onlyInt: true },
          {
            name: 'text_position',
            type: 'select',
            values: ['left', 'center', 'right'],
            maxSelect: 1,
          },
          {
            name: 'display_page',
            type: 'select',
            required: true,
            values: [
              'home_banner',
              'home_middle',
              'home_footer',
              'services_page',
              'institutional_page',
              'specific_page',
              'all_pages',
            ],
            maxSelect: 1,
          },
          { name: 'specific_page_url', type: 'text' },
          { name: 'display_order', type: 'number', onlyInt: true },
          { name: 'start_date', type: 'text' },
          { name: 'end_date', type: 'text' },
          { name: 'active', type: 'bool' },
          { name: 'linked_services', type: 'json' },
          {
            name: 'click_destination',
            type: 'select',
            values: [
              'service_page',
              'budget_form',
              'internal_page',
              'external_link',
              'whatsapp',
              'client_area',
            ],
            maxSelect: 1,
          },
          {
            name: 'status',
            type: 'select',
            values: ['rascunho', 'agendada', 'publicada', 'inativa', 'encerrada'],
            maxSelect: 1,
          },
          { name: 'has_publish_history', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_vitrine_items_status ON vitrine_items (status)',
          'CREATE INDEX idx_vitrine_items_display_page ON vitrine_items (display_page)',
          'CREATE INDEX idx_vitrine_items_type ON vitrine_items (type)',
          'CREATE INDEX idx_vitrine_items_active ON vitrine_items (active)',
        ],
      }),
    )

    try {
      app.findFirstRecordByData('vitrine_items', 'name', 'Banner Principal - Hero')
    } catch (_) {
      const col = app.findCollectionByNameOrId('vitrine_items')
      const seed = new Record(col)
      seed.set('name', 'Banner Principal - Hero')
      seed.set('type', 'banner_principal')
      seed.set('title', 'Soluções Logísticas de Excelência no Espírito Santo')
      seed.set('subtitle', 'Operações integradas com tecnologia WMS')
      seed.set('description', 'Armazenagem, transporte e distribuição com tecnologia de ponta.')
      seed.set('button_text', 'Solicitar Orçamento')
      seed.set('button_link', '#orcamento')
      seed.set('text_color', '#FFFFFF')
      seed.set('bg_color', '#005B2E')
      seed.set('overlay_color', '#000000')
      seed.set('opacity', 40)
      seed.set('text_position', 'center')
      seed.set('display_page', 'home_banner')
      seed.set('display_order', 1)
      seed.set('active', true)
      seed.set('linked_services', ['armazenagem-estoque', 'transporte-cargas'])
      seed.set('click_destination', 'budget_form')
      seed.set('status', 'publicada')
      seed.set('has_publish_history', true)
      app.save(seed)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('vitrine_items'))
    } catch (_) {}
  },
)
