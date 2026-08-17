// Transforme un libellé ("En pause", "À jour"...) en slug utilisable comme
// classe CSS ("en-pause", "a-jour"...), sans accents.
export function slugify(value = '') {
  return value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatEuros(value) {
  return Number(value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €'
}
