migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('products')

    var textFields = [
      'manufacturer_code',
      'subcategory',
      'cost_price',
      'profit_margin',
      'commission',
      'max_discount',
      'cest',
      'cfop',
      'origin',
      'cst_csosn',
      'icms_aliquot',
      'ipi',
      'pis',
      'cofins',
      'location',
      'lot',
      'validity',
      'main_supplier',
      'supplier_product_code',
      'last_cost',
      'last_purchase',
      'replenishment_time',
      'internal_observations',
    ]
    for (var i = 0; i < textFields.length; i++) {
      if (!col.fields.getByName(textFields[i])) {
        col.fields.add(new TextField({ name: textFields[i] }))
      }
    }

    if (!col.fields.getByName('max_stock')) {
      col.fields.add(new NumberField({ name: 'max_stock', min: 0, onlyInt: true }))
    }

    var boolFields = ['allow_lot_control', 'allow_validity_control', 'allow_serial_number']
    for (var j = 0; j < boolFields.length; j++) {
      if (!col.fields.getByName(boolFields[j])) {
        col.fields.add(new BoolField({ name: boolFields[j] }))
      }
    }

    if (!col.fields.getByName('main_photo')) {
      col.fields.add(
        new FileField({
          name: 'main_photo',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    if (!col.fields.getByName('technical_sheet')) {
      col.fields.add(
        new FileField({
          name: 'technical_sheet',
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        }),
      )
    }
    if (!col.fields.getByName('documents')) {
      col.fields.add(
        new FileField({
          name: 'documents',
          maxSelect: 20,
          maxSize: 10485760,
          mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }

    app.save(col)

    app.db().newQuery('UPDATE products SET max_stock = 0 WHERE max_stock IS NULL').execute()
    app
      .db()
      .newQuery('UPDATE products SET allow_lot_control = 0 WHERE allow_lot_control IS NULL')
      .execute()
    app
      .db()
      .newQuery(
        'UPDATE products SET allow_validity_control = 0 WHERE allow_validity_control IS NULL',
      )
      .execute()
    app
      .db()
      .newQuery('UPDATE products SET allow_serial_number = 0 WHERE allow_serial_number IS NULL')
      .execute()
  },
  (app) => {
    var col = app.findCollectionByNameOrId('products')
    var fieldsToRemove = [
      'manufacturer_code',
      'subcategory',
      'cost_price',
      'profit_margin',
      'commission',
      'max_discount',
      'cest',
      'cfop',
      'origin',
      'cst_csosn',
      'icms_aliquot',
      'ipi',
      'pis',
      'cofins',
      'max_stock',
      'location',
      'lot',
      'validity',
      'allow_lot_control',
      'allow_validity_control',
      'allow_serial_number',
      'main_supplier',
      'supplier_product_code',
      'last_cost',
      'last_purchase',
      'replenishment_time',
      'main_photo',
      'technical_sheet',
      'documents',
      'internal_observations',
    ]
    for (var i = 0; i < fieldsToRemove.length; i++) {
      var f = col.fields.getByName(fieldsToRemove[i])
      if (f) col.fields.remove(f.id)
    }
    app.save(col)
  },
)
