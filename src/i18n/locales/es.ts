import type { Translations } from '../config'
import { interpolate } from '../utils'

// Always use `satisfies Translations` to validate the translation structure.
export const es =
{
    site:
    {
        brand: 'Mi Marca',
        tagline: 'Haz más'
    },

    hero:
    {
        title: 'Bienvenido',
        subtitle: 'Construye rápido',
        description: interpolate('¡Hola {name}! Bienvenido a nuestro sitio web.'),
        example: interpolate('Prueba {foo} y {bar}')
    },

    about:
    {
        title: 'Acerca de',
        description: 'Esta pagina demuestra una ruta localizada simple usando el mismo modulo i18n.'
    }
} satisfies Translations;
