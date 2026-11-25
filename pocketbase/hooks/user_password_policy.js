// Política de senha forte (cadastro/edição de usuários) — v0.0.737+
// Regra: mínimo 10 caracteres, ao menos 1 maiúscula, 1 minúscula e 1 número.
// Aplica-se APENAS quando a senha está sendo DEFINIDA (create com senha, ou update
// em que o campo password veio preenchido no corpo da requisição). Usuários já
// existentes com senha antiga fraca NÃO são afetados em updates sem troca de senha.
// IMPORTANTE: hook de banco v0.23+ — SEMPRE chama e.next(); só recusa com e.next(err)
// quando a senha realmente viola a regra (evita "sucesso falso" da v0.0.696).
// Regra da JSVM: nada de funções/constantes de nível superior referenciadas dentro
// dos callbacks — toda a lógica de validação fica INLINE no corpo de cada hook.

onRecordCreate((e) => {
  var record = e.record
  var senha = String(record.getString('password') || '')

  if (senha.length > 0) {
    var faltas = []
    if (senha.length < 10) faltas.push('mínimo de 10 caracteres')
    if (!/[A-Z]/.test(senha)) faltas.push('ao menos 1 letra maiúscula')
    if (!/[a-z]/.test(senha)) faltas.push('ao menos 1 letra minúscula')
    if (!/[0-9]/.test(senha)) faltas.push('ao menos 1 número')

    if (faltas.length > 0) {
      return e.next(
        new BadRequestError(
          'Senha inválida: a senha deve ter ' +
            faltas.join(', ') +
            '. Regra: mínimo 10 caracteres, com 1 maiúscula, 1 minúscula e 1 número.',
        ),
      )
    }
  }

  e.next()
}, 'users')

onRecordUpdate((e) => {
  var record = e.record
  var senha = String(record.getString('password') || '')

  // Em update, o campo password só chega preenchido quando o cliente está TROCANDO a senha.
  // Updates normais (sem alteração de senha) não enviam password → validação não roda
  // e usuários já existentes com senha antiga fraca continuam funcionando normalmente.
  if (senha.length > 0) {
    var faltas = []
    if (senha.length < 10) faltas.push('mínimo de 10 caracteres')
    if (!/[A-Z]/.test(senha)) faltas.push('ao menos 1 letra maiúscula')
    if (!/[a-z]/.test(senha)) faltas.push('ao menos 1 letra minúscula')
    if (!/[0-9]/.test(senha)) faltas.push('ao menos 1 número')

    if (faltas.length > 0) {
      return e.next(
        new BadRequestError(
          'Senha inválida: a senha deve ter ' +
            faltas.join(', ') +
            '. Regra: mínimo 10 caracteres, com 1 maiúscula, 1 minúscula e 1 número.',
        ),
      )
    }
  }

  e.next()
}, 'users')
