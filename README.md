# Astro i18n

A lightweight Astro i18n module with typed translations, localized routes, and URL helpers.

## Features

- Translation shape inferred from the default locale and checked in other locales.
- Locale dictionaries loaded on demand in Astro frontmatter.
- Static pages generated for each configured locale.
- Typed interpolation for strings such as `Hello {name}!`.
- URL helpers preserve the current page, query, hash, and Astro `base` path.

## Structure

```txt
src/i18n/
  config.ts     # Locales, default locale, and Astro i18n config
  index.ts      # Public exports
  utils.ts      # Dictionary, route, URL, and interpolation helpers
  locales/      # One dictionary per locale
```

## Configuration

The supported locales, default language, and default-locale prefix are defined in `src/i18n/config.ts`. Change `PREFIX_DEFAULT_LOCALE` there; the exported `i18nConfig` passes the same setting to Astro:

```js
import { defineConfig } from 'astro/config';
import { i18nConfig } from './src/i18n/config.ts';

export default defineConfig({
  i18n: i18nConfig,
});
```

The current locales are `en` and `es`. When `PREFIX_DEFAULT_LOCALE` is `false`, the default locale uses `/` and the other locales keep their prefixes (for example, `/es/`); use `[...lang]` because the default locale has no path segment. When it is `true`, both locales are prefixed (`/en/` and `/es/`); use `[lang]` or `[...lang]`.

## Translations

The shape of the default dictionary (`en`) defines the `Translations` type. Other locale files use `satisfies Translations` to check their keys and interpolation placeholders. For example, the existing dictionaries export `en` and `es` from `src/i18n/locales/`.

To add a locale:

1. Add its code and display name to `LOCALES` in `src/i18n/config.ts`.
2. Create `src/i18n/locales/<code>.ts` and export a dictionary named after its locale code, typed with `Translations`.
3. Match the default dictionary's keys and interpolation placeholders.

To change the default locale, update `DEFAULT_LOCALE` and the type-only locale import used to define `Translations` in `config.ts`.

## Pages

Place localized pages under `src/pages/[lang]/` when `PREFIX_DEFAULT_LOCALE` is `true`; every locale has a required path segment. When it is `false`, use `src/pages/[...lang]/` so the default locale can omit that segment. `getLocaleStaticPaths` generates parameters to match the configured mode, and `getI18n(Astro.url)` loads the matching dictionary.

```astro
---
import Layout from '../../layouts/Layout.astro';
import { getI18n, getLocaleStaticPaths } from '../../i18n';

export const getStaticPaths = getLocaleStaticPaths;
const i18n = await getI18n(Astro.url);
---

<Layout lang={i18n.locale}>
  <h1>{i18n.messages.hero.title}</h1>
  <p>{i18n.messages.hero.description({ name: 'Astro' })}</p>
  <a href={i18n.href('/about/')}>About</a>
</Layout>
```

Use `i18n.locale` for the document's `<html lang>` attribute in the layout. Keep dictionary loading in frontmatter so translation data is not sent to client-side hydration.

## Localized URLs

Use `i18n.href(path, locale?)` for links in the current or another locale. Use `i18n.switchPageHref(locale)` or `localizeUrl(Astro.url, locale)` to switch languages while keeping the current page. `localizePath` and `localizeUrl` also account for Astro's `base` setting and preserve query strings and hashes.

For example, render a link to the current page in each locale:

```astro
---
import { getI18n, LOCALE_CODES } from '../../i18n';

const i18n = await getI18n(Astro.url);
---

<nav aria-label="Language">
  {LOCALE_CODES.map((locale) => (
    <a href={i18n.switchPageHref(locale)}>{locale}</a>
  ))}
</nav>
```

`getLocaleFromUrl` reads the locale from the first path segment and falls back to `en` when the path has no locale prefix. `getLocaleStaticPaths` and `localizePath` both follow `PREFIX_DEFAULT_LOCALE`, so generated routes and links stay in sync.