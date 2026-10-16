import { DEFAULT_LOCALE, LOCALES, PREFIX_DEFAULT_LOCALE, type Translations } from './config'

/** A locale code available on the site. */
export type Locale = keyof typeof LOCALES

/** i18n context resolved for a page. */
export interface I18n {
    locale: Locale
    messages: Translations
    href(path: string, locale?: Locale): string
    switchPageHref(locale: Locale): string
}

/** Locale codes derived from the locale label map. */
export const LOCALE_CODES = Object.keys(LOCALES) as Locale[]

const localeModules = import.meta.glob<Record<string, Translations>>('./locales/*.ts')
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '')
const PASSTHROUGH = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i

/** Narrow a value to a valid locale. */
export function isLocaleCode(value: unknown): value is Locale {
    return typeof value === 'string' && LOCALE_CODES.includes(value as Locale)
}

/** Locale from the first URL segment; falls back to the default locale. */
export function getLocaleFromUrl(url: URL): Locale {
    const [, segment] = stripBase(url.pathname).split('/')
    return isLocaleCode(segment) ? segment : DEFAULT_LOCALE
}

function stripBase(pathname: string): string {
    if (BASE && (pathname === BASE || pathname.startsWith(`${BASE}/`))) {
        return pathname.slice(BASE.length) || '/'
    }
    return pathname
}

/** '/en/about' -> '/about'. Expects a path without `base` and with a leading slash. */
export function stripLocale(path: string): string {
    const [, segment, ...rest] = path.split('/')
    return isLocaleCode(segment) ? `/${rest.join('/')}` : path
}

/** Localized path; respects `base`, query, hash and the supplied trailing slash. */
export function localizePath(path: string, locale: Locale = DEFAULT_LOCALE): string {
    if (PASSTHROUGH.test(path)) return path
    const [, pathname = '', suffix = ''] = path.match(/^([^?#]*)(.*)$/) ?? []
    const clean = stripLocale(pathname.startsWith('/') ? pathname : `/${pathname}`)
    const prefix = locale === DEFAULT_LOCALE && !PREFIX_DEFAULT_LOCALE ? '' : `/${locale}`
    return `${BASE}${prefix}${clean}${suffix}`
}

/** Same page as `url`, in another locale. */
export function localizeUrl(url: URL, locale: Locale): string {
    return `${localizePath(stripBase(url.pathname), locale)}${url.search}${url.hash}`
}

/** Generate locale paths for `[lang]` or `[...lang]`, matching `prefixDefaultLocale`. */
export function getLocaleStaticPaths() {
    return LOCALE_CODES.map((lang) => ({
        params: {
            // Omit the default locale only when Astro serves it without a prefix.
            lang: lang === DEFAULT_LOCALE && !PREFIX_DEFAULT_LOCALE ? undefined : lang,
        },
    }))
}

/** Load the dictionary for the URL locale and expose localized URL helpers. */
export async function getI18n(url: URL): Promise<I18n> {
    const locale = getLocaleFromUrl(url)
    const loadLocale = localeModules[`./locales/${locale}.ts`]

    if (!loadLocale) {
        throw new Error(`No translation file found for locale "${locale}".`)
    }

    const messages = (await loadLocale())[locale]
    if (!messages) {
        throw new Error(`Translation file for locale "${locale}" must export "${locale}".`)
    }

    return {
        locale,
        messages,
        href: (path, targetLocale = locale) => localizePath(path, targetLocale),
        switchPageHref: (targetLocale) => localizeUrl(url, targetLocale),
    }
}

type ExtractKeys<S extends string> = S extends `${string}{${infer K}}${infer Rest}`
    ? K | ExtractKeys<Rest>
    : never

/** A template function typed from its `{placeholders}`. */
export interface Template<K extends string = never> {
    (params: { [P in K]: string | number }): string
    readonly __keys?: (key: K) => K
}

/** Turn a string with `{placeholders}` into a typed template function. */
export function interpolate<S extends string>(template: S): Template<ExtractKeys<S>> {
    const render = (params: Record<string, string | number>) =>
        template.replace(/\{(\w+)\}/g, (match, key: string) =>
            Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match,
        )
    return render as unknown as Template<ExtractKeys<S>>
}
