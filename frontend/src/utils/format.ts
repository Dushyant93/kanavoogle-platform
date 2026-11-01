export function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return 'Pending'
  return `${Math.round(value * 10) / 10}%`
}

export function formatDate(value: string | null | undefined) {
  if (!value) return 'Pending'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Pending'
  return date.toLocaleDateString()
}

export function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
