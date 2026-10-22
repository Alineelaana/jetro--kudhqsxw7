// pb_hooks/users_global_login_guard.js
// Valida unicidade global (case-insensitive) do campo 'login' na criação e edição de usuários entre todas as empresas vinculadas.

onRecordCreateRequest((e) => {
  var login = (e.record.getString('login') || '').trim().toLowerCase()
  if (!login) {
    e.next()
    return
  }

  // Normaliza o login gravado sempre em lowercase sem espaços
  e.record.set('login', login)

  // Verifica se já existe qualquer usuário no sistema com este login (case-insensitive)
  var exists = false
  try {
    var existingRecord = $app.findFirstRecordByFilter('users', 'login ~ {:login}', {
      login: login,
    })
    if (existingRecord) {
      var foundLogin = (existingRecord.getString('login') || '').trim().toLowerCase()
      if (foundLogin === login) {
        exists = true
      }
    }
  } catch (_) {
    // Record not found
  }

  if (exists) {
    return e.badRequestError(
      'Este login já está em uso por outra empresa do grupo. Escolha um login diferente.',
      {
        login: {
          code: 'validation_not_unique',
          message:
            'Este login já está em uso por outra empresa do grupo. Escolha um login diferente.',
        },
      },
    )
  }

  e.next()
}, 'users')

onRecordUpdateRequest((e) => {
  var login = (e.record.getString('login') || '').trim().toLowerCase()
  if (!login) {
    e.next()
    return
  }

  // Normaliza o login gravado sempre em lowercase
  e.record.set('login', login)

  var recordId = e.record.id

  var exists = false
  try {
    var existingRecord = $app.findFirstRecordByFilter('users', 'id != {:id} && login ~ {:login}', {
      id: recordId,
      login: login,
    })
    if (existingRecord) {
      var foundLogin = (existingRecord.getString('login') || '').trim().toLowerCase()
      if (foundLogin === login) {
        exists = true
      }
    }
  } catch (_) {
    // Record not found
  }

  if (exists) {
    return e.badRequestError(
      'Este login já está em uso por outra empresa do grupo. Escolha um login diferente.',
      {
        login: {
          code: 'validation_not_unique',
          message:
            'Este login já está em uso por outra empresa do grupo. Escolha um login diferente.',
        },
      },
    )
  }

  e.next()
}, 'users')
