# Distribuidora Gin&Jes — tienda y administración del catálogo

Web estática en HTML, CSS y JavaScript, conectada a Supabase. Conserva el diseño negro y dorado y el bucket `product-images`.

## Catálogo

- Categorías y subcategorías normalizadas, códigos únicos y estado activo.
- Búsqueda y filtros en Supabase; 12 productos por página en la tienda y 25 en `/admin/`.
- Formulario individual, selección por página y cambios masivos de estado, destacado y clasificación.
- Importación CSV UTF-8 con vista previa, validación y escritura atómica de hasta 1000 productos.
- Administración restringida a los usuarios registrados en `catalog_admins`, incluidos los permisos de Storage.

## Instalación o actualización

Sigue [la guía completa de migración y carga de 200+ productos](docs/catalogo-migracion.md).

1. Guarda una copia de seguridad y prueba en un Supabase de ensayo.
2. Ejecuta completo `supabase/migrations/202609300001_catalog.sql` en SQL Editor. Para una instalación nueva, `supabase/schema.sql` contiene el mismo SQL.
3. Registra explícitamente el UUID de cada administrador en `public.catalog_admins`.
4. Configura URL y clave pública en `js/supabase.js`. Nunca uses la clave `service_role` en el navegador.
5. Publica los archivos estáticos después de aplicar la migración. El PR no publica ni migra producción automáticamente.
6. Entra a `/admin/` y descarga la [plantilla CSV](docs/plantilla-productos.csv).

`supabase/seed.sql` es opcional: agrega ejemplos sin eliminar ni sobrescribir productos. Tabla correcta: `public.products`. Bucket: `product-images`.

## Desarrollo y pruebas

No hay compilación ni dependencias de ejecución locales: sirve esta carpeta con un servidor HTTP estático. Para las pruebas, usa Node.js 24 y pnpm 11:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm exec playwright install chromium
pnpm test:ui
```

Las pruebas SQL usan PostgreSQL embebido con roles de prueba. Las pruebas de navegador usan respuestas Supabase simuladas y no tocan producción. Antes de aplicar la migración real, verifica también en un proyecto Supabase de ensayo. Consulta la guía para respaldos, permisos, compatibilidad de imágenes y recuperación.
