// Política de senha forte do HURAM — espelho front-end da regra aplicada
// pelo hook de servidor pocketbase/hooks/user_password_policy.js.
// Regra: mínimo 10 caracteres, ao menos 1 maiúscula, 1 minúscula e 1 número.
// O back-end recusa (BadRequestError); o front valida ANTES de enviar para orientar.

export const PASSWORD_MIN_LENGTH = 10

export interface PasswordRuleCheck {
  label: string
  ok: boolean
}

export function getPasswordRuleChecks(senha: string): PasswordRuleCheck[] {
  return [
    { label: 'Mínimo de 10 caracteres', ok: senha.length >= PASSWORD_MIN_LENGTH },
    { label: 'Ao menos 1 letra maiúscula', ok: /[A-Z]/.test(senha) },
    { label: 'Ao menos 1 letra minúscula', ok: /[a-z]/.test(senha) },
    { label: 'Ao menos 1 número', ok: /[0-9]/.test(senha) },
  ]
}

export const PASSWORD_RULE_SUMMARY =
  'A senha deve ter no mínimo 10 caracteres, com ao menos 1 letra maiúscula, 1 minúscula e 1 número.'

/** Retorna null se a senha é válida; caso contrário, a mensagem de erro em pt-BR. */
export function validatePasswordStrength(senha: string): string | null {
  if (!senha) return null
  const faltas = getPasswordRuleChecks(senha)
    .filter((r) => !r.ok)
    .map((r) => r.label.toLowerCase())
  if (faltas.length === 0) return null
  return `Senha inválida: falta ${faltas.join(', ')}. ${PASSWORD_RULE_SUMMARY}`
}
