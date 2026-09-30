# Catálogo de 200+ productos

La web conserva el diseño negro y dorado, sus tarjetas y su modal. Ahora consulta 12 productos por página; el administrador consulta 25. Búsqueda, categoría, subcategoría, estado, precio y orden se aplican en Supabase. El carrito conserva los productos añadidos al cambiar de página.

## Orden de instalación

1. Antes de ejecutar SQL en producción, guarda una copia de seguridad de la base de datos y registra `select count(*) from public.products;`. Exporta también los productos a CSV desde Supabase. Conserva la versión anterior de la web para una posible reversión. Revisa las políticas personalizadas: esta migración reemplaza las políticas de `products`, `categories` y `subcategories`.
2. Prueba primero en un proyecto Supabase de ensayo con una copia de tus datos. Ejecuta **completo** `supabase/migrations/202609300001_catalog.sql` en SQL Editor con el rol propietario (`postgres`). Para instalaciones nuevas puedes ejecutar `supabase/schema.sql`, que contiene el mismo SQL; no necesitas ejecutar ambos. No vuelvas a ejecutar el schema de la versión anterior.
3. Crea/invita tu cuenta de administrador en Authentication > Users. Copia su UUID y ejecuta, sustituyendo el ejemplo:

   ```sql
   insert into public.catalog_admins (user_id)
   values ('UUID-REAL-DE-TU-USUARIO'::uuid)
   on conflict do nothing;
   ```

   No se promueve automáticamente a ningún usuario. Para revocar acceso, elimina su fila de `catalog_admins` desde SQL Editor. El siguiente acceso a datos se deniega por RLS aunque conserve una sesión abierta. Nunca pongas una clave `service_role` en HTML/JavaScript.

4. Comprueba que el número de productos se conserva y revisa los códigos ajustados:

   ```sql
   select count(*) as total, count(*) filter (where activo) as activos from public.products;
   select p.id, a.original_codigo, p.codigo, a.original_categoria, p.categoria
   from public.products p join public.catalog_migration_audit a on a.product_id = p.id
   where p.codigo is distinct from a.original_codigo
      or p.categoria is distinct from a.original_categoria
   order by p.id;
   select * from public.categories order by nombre;
   select * from public.subcategories order by category_id, nombre;
   ```

5. Despliega los archivos de esta rama **después** del SQL y de registrar el administrador. Inicia sesión en `/admin/`. La configuración pública existente en `js/supabase.js` sigue siendo válida para el proyecto actual; cambia URL/clave pública al probar en otro proyecto. Mantén el límite de filas de la API en al menos 1000 (el valor habitual), para que conteos de coincidencias del CSV y páginas de 25 filas no sean truncados por el servidor.
6. Verifica con sesión anónima que solo aparecen productos activos. Con una cuenta autenticada que no esté en `catalog_admins`, comprueba que no puede administrar ni subir imágenes. Con el administrador, prueba crear, editar, importar y desactivar un producto de ensayo.

**Esta rama no ejecuta la migración en tu proyecto ni despliega la web automáticamente.** Integrar el PR y aplicar la migración son pasos separados.

## Qué preserva la migración

- Mantiene IDs, nombres, precios, descripciones, imágenes, destacados y el estado activo existente. Agrega `activo = true` a tablas que aún no lo tengan; convierte estados nulos a activos.
- Convierte cada categoría antigua en una categoría normalizada. Une diferencias de mayúsculas y espacios exteriores; una categoría vacía pasa a «Sin categoría». No adivina si un broche es de metal o plástico. Las subcategorías se asignan después desde el administrador o CSV.
- Conserva `categoria` como texto compatible con el frontend anterior; un trigger lo sincroniza al guardar un producto. Las relaciones nuevas usan `category_id` y `subcategory_id`. Una subcategoría de otra categoría es rechazada por una clave foránea compuesta.
- Los códigos se recortan y pasan a mayúsculas. Un código vacío, inválido o repetido recibe `LEGACY-<id>` (con sufijo si ya existe). Entre duplicados se conserva el producto con el ID menor. La tabla privada `catalog_migration_audit` guarda los valores originales. Revisar esos códigos antes de preparar actualizaciones masivas.
- El formato de código admitido es de 1 a 64 caracteres: empieza por letra/número y permite letras ASCII, números, punto, guion, guion bajo y `/`. La base de datos normaliza y exige unicidad, incluso con dos administradores guardando simultáneamente.
- Si solo existe `productos`, la renombra a `products` sin borrar filas. Ese camino exige las columnas del esquema original de este repositorio (ID bigint y campos documentados). Si el esquema real difiere, la transacción falla sin aplicarse: adapta la migración en ensayo. Si existen ambas tablas, se detiene antes de cambiar nada; deben reconciliarse explícitamente, nunca se fusionan a ciegas.
- Se ejecuta en una transacción y puede repetirse. No hace `TRUNCATE`. Toma un bloqueo de escritura breve: programa su aplicación fuera de una carga masiva.

## Cargar los 200+ productos

1. En `/admin/`, abre **Importar productos desde CSV** y descarga la plantilla. Quita las filas de ejemplo y añade tus 200+ productos, una fila por código. También puedes abrir `docs/plantilla-productos.csv` en Excel o LibreOffice.
2. Guarda como **CSV UTF-8**. Se admiten separadores coma o punto y coma, BOM, celdas entre comillas, comillas escapadas como `""` y saltos de línea dentro de una celda entre comillas. Los números de registro mostrados cuentan filas CSV lógicas incluyendo la cabecera (no líneas físicas dentro de una descripción).
3. Columnas obligatorias: `codigo,nombre,categoria,precio`. Opcionales: `subcategoria,descripcion,imagen_url,destacado,activo`. No repitas encabezados ni agregues columnas desconocidas.
4. Usa `0` para «Consultar precio». Precio sin separador de miles, máximo dos decimales: `12.50`; también `"12,50"` en una celda CSV correctamente entrecomillada. Para booleanos usa `true/false`, `sí/no` o `1/0`. `activo` vacío se convierte en `true`; `destacado` vacío, en `false`.
5. Selecciona **Solo crear** para una primera carga. Pulsa **Validar archivo**: revisa errores, conteos y los primeros 10 productos. Ningún producto se guarda en esta fase. Los códigos se comprueban contra el archivo y contra la base existente mediante consultas de hasta 100 códigos, sin descargar todo el catálogo.
6. Pulsa **Importar archivo validado** y confirma el resumen. El servidor vuelve a validar y procesa todo el archivo en una única transacción. Si encuentra un error o un código duplicado por una operación concurrente, revierte productos, categorías y subcategorías del archivo completo. Corrige el archivo y valida otra vez. Si se corta la conexión, el navegador no puede asegurar si el servidor llegó a confirmar la transacción: revisa los códigos en el catálogo antes de reintentar. Límite: 1000 registros y 5 MB por archivo; para 200+ no hace falta dividirlo.
7. Para actualizar por código, elige **Crear y reemplazar por código**. Conserva el ID del producto existente, pero sustituye **todos** sus campos importables. Un campo opcional vacío o una columna opcional omitida borra descripción, imagen o subcategoría; también se aplican los valores booleanos por defecto. Incluye la ruta actual de imagen si quieres conservarla. No uses este modo con un CSV parcial de solo precios. Para pequeños cambios usa edición individual o masiva.

Las categorías y subcategorías que aparezcan en un CSV válido se crean automáticamente, sin duplicados por mayúsculas/espacios. También puedes crearlas desde el formulario de producto con los botones `+ Categoría` y `+ Subcategoría`.

## Selección y cambios masivos

Selecciona filas de la página actual (máximo 25), elige activar/desactivar, destacar/quitar destacado o cambiar categoría/subcategoría y confirma. La selección se limpia al cambiar de página, filtrar o recargar, para evitar modificar productos ocultos. Cambiar categoría sin subcategoría borra la subcategoría anterior. No hay borrado masivo; desactivar conserva el registro y lo oculta al público.

## Imágenes y permisos

El bucket sigue siendo **`product-images`**. La migración no mueve ni elimina objetos ni cambia URLs existentes. Mantiene la configuración de un bucket ya existente; uno nuevo se crea público. Para rutas relativas se necesita ese bucket público, como en la instalación original.

- `metales/broche-18.jpg` o `product-images/metales/broche-18.jpg` se resuelven en ese bucket.
- Una URL completa `https://...` se conserva, incluidas imágenes alojadas antes en otro bucket.
- El CSV referencia imágenes; **no sube archivos**. Sube primero las fotos desde Supabase Storage o usa la subida individual en `/admin/` (JPG/PNG/WEBP, máximo 5 MB).
- Solo UUIDs registrados en `catalog_admins` pueden escribir productos, categorías, subcategorías e imágenes. Las políticas restrictivas impiden que una política permisiva antigua de Storage abra escritura a este bucket. No alteran permisos de otros buckets.
- Público y usuarios ordinarios ven solo productos activos; administradores ven todos. Taxonomía y archivos de un bucket público siguen siendo públicos: desactivar un producto no convierte su imagen en privada.
- Borrar o reemplazar un producto no borra su imagen anterior, porque puede estar compartida. Revisa manualmente objetos sin uso. Si guardar falla después de una subida nueva, el administrador intenta limpiar solo ese archivo recién subido.

## Seed, recuperación y pruebas

`supabase/seed.sql` es **opcional**: añade 17 ejemplos a `products`, omite códigos existentes y nunca vacía ni reemplaza productos. Las rutas de ejemplo necesitan sus respectivos archivos en `product-images`.

Si falla el SQL, la transacción revierte automáticamente; no continúes con el despliegue hasta corregir el error. Después de una aplicación correcta, la reversión completa requiere la copia de seguridad previa. Revertir solo el frontend puede mantener la lectura de productos activos gracias al campo `categoria`; el administrador anterior no soporta los nuevos campos ni la validación de códigos. No restaures sus políticas permisivas. Para deshacer una importación ya confirmada utiliza una exportación previa y revisión de los códigos afectados; la importación no guarda un historial de cambios.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm exec playwright install chromium
pnpm test:ui
```

Requiere Node.js 24 y pnpm 11. Las pruebas de base usan PostgreSQL embebido (PGlite), con `auth.uid()`, roles y tablas Storage de prueba. Cubren migración con datos previos, reejecución, renombrado, dos tablas ambiguas, unicidad, relaciones, importación de 250 filas, rollback, upsert, RLS y Storage. El navegador usa el cliente Supabase 2.45.4 del sitio y respuestas HTTP simuladas: paginación, búsqueda, errores, carrito, administración, CSV y vista móvil. Estas pruebas **no sustituyen** la comprobación en un Supabase de ensayo con PostgREST/Auth/Storage reales. No utilizan cuentas ni datos de producción.

Referencias: [RLS y permisos](https://supabase.com/docs/guides/database/postgres/row-level-security), [eventos de autenticación](https://supabase.com/docs/reference/javascript/auth-onauthstatechange).
