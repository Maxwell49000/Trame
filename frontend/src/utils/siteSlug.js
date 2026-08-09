export function generateSlug(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isValidSlug(value = '') {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value))
}
