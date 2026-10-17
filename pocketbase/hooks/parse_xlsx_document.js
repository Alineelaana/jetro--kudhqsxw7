/// <reference path="../pb_data/types.d.ts" />

routerAdd(
  'POST',
  '/backend/v1/planilhas/convertidas/parse-xlsx',
  (e) => {
    // Apenas usuários autenticados
    if (!e.auth || !e.auth.id) {
      return e.json(401, { error: 'Autenticação necessária' })
    }

    let files = []
    try {
      files = e.findUploadedFiles('arquivo')
    } catch (err) {
      return e.json(400, { error: 'Erro ao processar arquivo enviado: ' + String(err) })
    }

    if (!files || files.length === 0) {
      return e.json(400, { error: 'Nenhum arquivo enviado no campo "arquivo"' })
    }

    const file = files[0]

    try {
      // Converte usando a ferramenta nativa de documentos do Skip Cloud
      const result = $documents.toMarkdown({ file: file })
      const markdown = result && result.markdown ? result.markdown : ''
      const truncated = !!(result && result.truncated)

      return e.json(200, {
        ok: true,
        filename: file.name,
        markdown: markdown,
        truncated: truncated,
      })
    } catch (err) {
      var msg = String(err)
      return e.json(422, {
        ok: false,
        error: 'Falha ao ler planilha via $documents: ' + msg,
      })
    }
  },
  $apis.requireAuth(),
)
