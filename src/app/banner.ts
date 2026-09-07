/**
 * What the alert banner says, and in what order it is painted.
 *
 * The distance is painted last, at the bottom, against the sheet. Everything
 * above it is a caption; the number is the only line a driver at 90 km/h has to
 * read, and it is the line an iPhone ate (issue 20). `viewport-fit=cover` lays
 * the page out under Safari's own bars, `env(safe-area-inset-top)` reads 0 in a
 * portrait tab, and a banner pinned to the top of the page lost its first
 * ~100 px — the kind, the number and the place — leaving the driver the list of
 * what the camera catches and no idea how far away it is.
 *
 * So the banner no longer touches an edge a browser can cover: it is anchored to
 * the top of the sheet and grows upward into the map. That fixes the number's
 * position on screen however long the lines above it run, and it puts the two
 * least useful lines nearest the only edge still in reach.
 *
 * The lines come back in the order they should be *read*, number first, and
 * `.banner` paints them with `flex-direction: column-reverse` so the number
 * still lands at the bottom. The two orders have to differ: `#banner` is
 * `aria-live="assertive"` and is rewritten on every position fix, about once a
 * second, so whatever is last in the DOM is spoken last and the next fix cuts
 * it off. Painted last, announced first — the driver who is listening and the
 * driver who is looking get the same number.
 */
import type { ActiveAlert } from '../domain/types'
import { formatDistance, shortName } from './format'
import { functionLabel, t, type Lang } from './i18n'

/** The class each line carries. Painted bottom-to-top, in this order. */
export type BannerRole = 'dist' | 'what' | 'where' | 'kind'

export interface BannerLine {
  role: BannerRole
  text: string
}

/** As many enforcement functions as can be read in a glance. */
export const MAX_FUNCTIONS = 3

export function bannerLines(alert: ActiveAlert, lang: Lang): BannerLine[] {
  const inside = alert.phase === 'INSIDE'
  const kind = inside
    ? t('inSection', lang)
    : alert.kind === 'section'
      ? t('sectionAhead', lang)
      : t('radarAhead', lang)
  const what = alert.location.functions
    .slice(0, MAX_FUNCTIONS)
    .map((f) => functionLabel(f, lang))
    .join(' · ')

  const tail = inside ? ` ${t('toEnd', lang)}` : ''
  const lines: BannerLine[] = [
    { role: 'dist', text: `${formatDistance(alert.distanceM, lang)}${tail}` },
  ]
  // A location with nothing listed gets no strip of empty colour.
  if (what) lines.push({ role: 'what', text: what })
  lines.push({ role: 'where', text: shortName(alert.location.name) })
  lines.push({ role: 'kind', text: kind })
  return lines
}
