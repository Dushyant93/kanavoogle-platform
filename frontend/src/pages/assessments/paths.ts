// URLs for the assessment screens. Other screens should link here with these
// helpers instead of typing the paths, so a route change only happens in one place.
export const assessmentPaths = {
  list: '/tests',
  start: '/tests/new',
  take: (id: string) => `/tests/take?id=${encodeURIComponent(id)}`,
  result: (id: string) => `/tests/result?id=${encodeURIComponent(id)}`,
  dashboard: '/student',
  vault: '/wallet',
} as const

export function idFromUrl() {
  return new URLSearchParams(window.location.search).get('id') ?? ''
}
