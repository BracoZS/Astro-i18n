// @ts-check
import { defineConfig } from 'astro/config';
import { i18nConfig } from './src/i18n/config.ts';

// https://astro.build/config
export default defineConfig({
	i18n: i18nConfig,
});
