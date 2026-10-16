export { LOCALES, DEFAULT_LOCALE, PREFIX_DEFAULT_LOCALE, i18nConfig } from './config'
export type { Translations } from './config'

export {
    getI18n,
    getLocaleFromUrl,
    getLocaleStaticPaths,
    interpolate,
    isLocaleCode,
    stripLocale,
    localizeUrl,
    localizePath,
    LOCALE_CODES,
    type Locale,
    type Template,
} from './utils'
export type { I18n } from './utils'
