export function prettyDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short' }).format(date)
}

export function isWithinHours(value: string, hours: number) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const diff = date.getTime() - Date.now()
  return diff >= 0 && diff <= hours * 60 * 60 * 1000
}
