onRecordAfterCreateSuccess((e) => {
  var title = e.record.getString('title') || ''
  var summary = e.record.getString('summary') || ''
  var content = e.record.getString('content') || ''
  var text = (title + '\n\n' + summary + '\n\n' + content).trim()
  if (!text) return e.next()

  try {
    var paragraphs = text.split(/\n\n+/)
    var chunkIndex = 0
    var chunkCol = $app.findCollectionByNameOrId('blueprint_chunks')

    for (var i = 0; i < paragraphs.length; i++) {
      var para = paragraphs[i].trim()
      if (!para) continue

      var pieces = []
      if (para.length > 1000) {
        pieces = para.match(/[\s\S]{1,1000}/g) || []
      } else {
        pieces = [para]
      }

      for (var j = 0; j < pieces.length; j++) {
        var chunkText = pieces[j].trim()
        if (!chunkText) continue
        try {
          var embedRes = $ai.embed({ input: chunkText })
          var rec = new Record(chunkCol)
          rec.set('chapter_id', e.record.id)
          rec.set('chunk_text', chunkText)
          rec.set('chunk_index', chunkIndex)
          rec.set(
            'metadata',
            JSON.stringify({
              title: title,
              code: e.record.getString('code') || '',
            }),
          )
          rec.set('embedding', embedRes.data[0].embedding)
          $app.save(rec)
          chunkIndex++
        } catch (embedErr) {
          $app.logger().error('blueprint chunk embed failed', 'error', String(embedErr))
        }
      }
    }

    $app.logger().info('blueprint chunks created', 'chapter', e.record.id, 'count', chunkIndex)
  } catch (err) {
    $app.logger().error('blueprint embed create failed', 'error', String(err))
  }

  return e.next()
}, 'blueprint_chapters')
