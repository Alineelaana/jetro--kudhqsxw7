routerAdd(
  'POST',
  '/backend/v1/chat/spellcheck',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var text = (body.text || '').trim()

      if (!text) return e.badRequestError('text is required')
      if (!e.auth) return e.unauthorizedError('auth required')

      try {
        var reply = $ai.chat({
          model: 'fast',
          messages: [
            {
              role: 'system',
              content:
                'Voce e um corretor ortografico. Corrija apenas erros de ortografia e gramatica do texto em portugues brasileiro. Preserve o significado, emojis e a pontuacao. Retorne APENAS o texto corrigido, sem explicacoes ou comentarios.',
            },
            { role: 'user', content: text },
          ],
        })
        var corrected = reply.choices[0].message.content.trim()
        return e.json(200, { corrected: corrected })
      } catch (err) {
        return e.json(200, { corrected: text })
      }
    } catch (err) {
      return e.json(500, { error: 'Erro ao corrigir texto' })
    }
  },
  $apis.requireAuth(),
)
