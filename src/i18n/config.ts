import type { en } from './locales/en'

/** Available locales (code -> display name). */
export const LOCALES = {
  en: 'English',
  es: 'Español',
} as const

/** Default locale. */
export const DEFAULT_LOCALE = 'en' satisfies keyof typeof LOCALES

/** Dictionary shape, defined by the default locale. */
export type Translations = typeof en

/**
 * false: omit its prefix; default routes use `/...`, others use `/<locale>/...`; use `[...lang]`.
 * true: every locale uses `/<locale>/...`; use `[lang]`.
 */
export const PREFIX_DEFAULT_LOCALE = false

/** Astro i18n configuration. */
export const i18nConfig = {
  defaultLocale: DEFAULT_LOCALE,
  locales: Object.keys(LOCALES),
  routing: {
    prefixDefaultLocale: PREFIX_DEFAULT_LOCALE,
  },
}
