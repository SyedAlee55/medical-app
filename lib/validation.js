export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false
  const trimmed = email.trim().toLowerCase()
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
  return trimmed.length <= 254 && emailRegex.test(trimmed)
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return { valid: false, reason: 'Password is required' }
  if (password.length < 8) return { valid: false, reason: 'Minimum 8 characters' }
  if (!/[A-Z]/.test(password)) return { valid: false, reason: 'At least one uppercase letter required' }
  if (!/[a-z]/.test(password)) return { valid: false, reason: 'At least one lowercase letter required' }
  if (!/[0-9]/.test(password)) return { valid: false, reason: 'At least one number required' }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return { valid: false, reason: 'At least one special character required' }
  if (/\s/.test(password)) return { valid: false, reason: 'No spaces allowed' }
  return { valid: true }
}

export function sanitizeName(name) {
  if (!name || typeof name !== 'string') return ''
  return name
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/[<>"']/g, '')            // strip injection chars
    .trim()
    .slice(0, 100)
}

export function validatePhone(phone) {
  if (!phone) return true // phone is optional
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase()
}
