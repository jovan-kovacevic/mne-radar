import type { Lang } from './i18n'

export function formatDistance(metres: number, lang: Lang): string {
  if (metres < 1000) return `${Math.round(metres / 10) * 10} ${lang === 'me' ? 'm' : 'm'}`
  return `${(metres / 1000).toFixed(metres < 10000 ? 1 : 0)} km`
}

/** Trim the road prose to something readable on a banner at speed. */
export function shortName(name: string): string {
  const withoutParens = name.replace(/\s*\([^)]*\)\s*$/, '').trim()
  const parts = withoutParens.split(' - ')
  const head = parts[0] ?? withoutParens
  return head.length > 42 ? `${head.slice(0, 40).trimEnd()}…` : head
}
