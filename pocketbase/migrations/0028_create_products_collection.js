migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'products',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text', required: true },
          { name: 'ncm', type: 'text', required: true },
          { name: 'ean', type: 'text', required: true },
          { name: 'code', type: 'text' },
          { name: 'unit', type: 'text' },
          { name: 'price', type: 'text' },
          { name: 'brand', type: 'text' },
          { name: 'category', type: 'text' },
          { name: 'active', type: 'bool' },
          {
            name: 'photos',
            type: 'file',
            maxSelect: 20,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          "CREATE UNIQUE INDEX idx_products_code ON products (code) WHERE code != ''",
          'CREATE INDEX idx_products_ean ON products (ean)',
          'CREATE INDEX idx_products_ncm ON products (ncm)',
          'CREATE INDEX idx_products_name ON products (name)',
          'CREATE INDEX idx_products_active ON products (active)',
        ],
      }),
    )

    var settingsCol = app.findCollectionByNameOrId('settings')
    var col = app.findCollectionByNameOrId('products')
    var year = new Date().getFullYear()

    var seedProducts = [
      {
        name: 'Caixa de Papelao Ondulado 40x30x30',
        description:
          'Caixa de papelao ondulado para armazenagem e transporte, dimensoes 40x30x30cm.',
        ncm: '4819.10.00',
        ean: '7891234567890',
        code: 'PROD-' + year + '-0001',
        unit: 'un',
        price: '8,50',
        brand: 'PackLog',
        category: 'Embalagens',
        active: true,
      },
      {
        name: 'Pallet de Madeira PBR 1m x 1,2m',
        description: 'Pallet de madeira PBR padrao para armazenagem e logistica.',
        ncm: '4415.20.00',
        ean: '7891234567891',
        code: 'PROD-' + year + '-0002',
        unit: 'un',
        price: '95,00',
        brand: 'MadeiraLog',
        category: 'Equipamentos',
        active: true,
      },
      {
        name: 'Stretch Filme PVC 500mm x 300m',
        description: 'Filme stretch PVC para envelopamento de cargas, 500mm x 300m.',
        ncm: '3923.29.90',
        ean: '7891234567892',
        code: 'PROD-' + year + '-0003',
        unit: 'rolo',
        price: '42,00',
        brand: 'PackLog',
        category: 'Insumos',
        active: true,
      },
      {
        name: 'Fita Adesiva Empacotamento 48mm x 100m',
        description: 'Fita adesiva transparente para empacotamento e fechamento de caixas.',
        ncm: '3919.10.20',
        ean: '7891234567893',
        code: 'PROD-' + year + '-0004',
        unit: 'rolo',
        price: '6,80',
        brand: 'AdesivaLog',
        category: 'Insumos',
        active: true,
      },
    ]

    for (var i = 0; i < seedProducts.length; i++) {
      try {
        app.findFirstRecordByData('products', 'code', seedProducts[i].code)
      } catch (_) {
        var rec = new Record(col)
        rec.set('name', seedProducts[i].name)
        rec.set('description', seedProducts[i].description)
        rec.set('ncm', seedProducts[i].ncm)
        rec.set('ean', seedProducts[i].ean)
        rec.set('code', seedProducts[i].code)
        rec.set('unit', seedProducts[i].unit)
        rec.set('price', seedProducts[i].price)
        rec.set('brand', seedProducts[i].brand)
        rec.set('category', seedProducts[i].category)
        rec.set('active', seedProducts[i].active)
        app.save(rec)
      }
    }

    try {
      app.findFirstRecordByData('settings', 'key', 'product_sequence')
    } catch (_) {
      var counter = new Record(settingsCol)
      counter.set('key', 'product_sequence')
      counter.set('value', String(seedProducts.length))
      app.save(counter)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('products'))
    } catch (_) {}
  },
)
