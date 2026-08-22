-- =============================================
-- SEED — Hebillas Gin&Jes
-- Productos reales basados en Storage bucket
-- Ejecutar en: Supabase → SQL Editor
-- =============================================

-- Limpiar productos de prueba anteriores
TRUNCATE public.productos RESTART IDENTITY;

-- =============================================
-- INSERTAR PRODUCTOS REALES
-- =============================================
INSERT INTO public.productos
  (nombre, precio, imagen_url, categoria, descripcion, codigo, destacado, activo)
VALUES

  -- ── LOGO (referencia interna, no producto) ──────────────────────────────
  -- logo/ → solo para uso interno del sitio

  -- ── PEGAPEGA ────────────────────────────────────────────────────────────
  ('Pegapega Grado B',
   0.00, 'pegapega/pegapega-grado-b.jpg',
   'Insumos Galvánicos y Otros',
   'Pegamento industrial Grado B para herrajes, plantillas y calzado.',
   'PEG-GRADOB', false, true),

  ('Pegapega Americano',
   0.00, 'pegapega/pegapega-americano.jpg',
   'Insumos Galvánicos y Otros',
   'Pegamento americano de alta resistencia para cuero y textil.',
   'PEG-AMERIC', true, true),

  -- ── PRODUCTOS METALES ───────────────────────────────────────────────────
  ('Argollas',
   0.00, 'productos metales/argollas.jpg',
   'Aplicaciones',
   'Argollas metálicas de zamak para bolsos, correas y accesorios.',
   'MET-ARGOLL', false, true),

  ('Aro Mosquetón',
   0.00, 'productos metales/aro-mosqueton.jpg',
   'Aplicaciones',
   'Aro tipo mosquetón metálico para llaveros y accesorios.',
   'MET-AROMOSQ', false, true),

  ('Base de Llavero',
   0.00, 'productos metales/base-de-llavero.jpg',
   'Aplicaciones',
   'Base metálica para llavero, acabado niquelado o dorado.',
   'MET-BASLLAV', false, true),

  ('Broche Imán',
   0.00, 'productos metales/broche-iman.jpg',
   'Aplicaciones',
   'Broche de imán para bolsos y carteras, zamak con acabado premium.',
   'MET-BRIMAN', true, true),

  ('Broche 7050',
   0.00, 'productos metales/broche-7050.jpg',
   'Aplicaciones',
   'Broche modelo 7050 de zamak para carteras y marroquinería.',
   'MET-BR7050', false, true),

  ('Ganchos',
   0.00, 'productos metales/ganchos.jpg',
   'Aplicaciones',
   'Ganchos metálicos para correas, bolsos y accesorios de cuero.',
   'MET-GANCHO', false, true),

  ('Media Luna',
   0.00, 'productos metales/media-luna.jpg',
   'Aplicaciones',
   'Herraje media luna de zamak para bolsos y marroquinería.',
   'MET-MEDLUN', false, true),

  ('Mosquetones (Metal)',
   0.00, 'productos metales/mosquetones.jpg',
   'Aplicaciones',
   'Mosquetones metálicos de alta resistencia para llaveros y correas.',
   'MET-MOSQUT', true, true),

  ('Reguladores (Metal)',
   0.00, 'productos metales/reguladores.jpg',
   'Aplicaciones',
   'Reguladores metálicos para correas y tirantes de bolsos.',
   'MET-REGULA', false, true),

  -- ── PRODUCTOS PLÁSTICOS ─────────────────────────────────────────────────
  ('Mosquetones (Plástico)',
   0.00, 'productos plasticos/mosquetones.jpg',
   'Insumos Galvánicos y Otros',
   'Mosquetones plásticos livianos para bolsos, mochilas y accesorios.',
   'PLAS-MOSQUT', false, true),

  ('Reguladores (Plástico)',
   0.00, 'productos plasticos/reguladores.jpg',
   'Insumos Galvánicos y Otros',
   'Reguladores plásticos para correas y mochilas.',
   'PLAS-REGULA', false, true),

  ('Tiptop Sapito',
   0.00, 'productos plasticos/tiptop-sapito.jpg',
   'Insumos Galvánicos y Otros',
   'Tiptop modelo sapito en plástico para calzado infantil y casual.',
   'PLAS-TIPSAP', true, true);

-- =============================================
-- ACTUALIZAR PRECIOS (completar con precios reales)
-- Ejemplo:
-- UPDATE public.productos SET precio = 3.50 WHERE codigo = 'MET-BRIMAN';
-- =============================================

-- VERIFICAR RESULTADO
SELECT id, codigo, nombre, categoria, imagen_url, destacado
FROM public.productos
ORDER BY categoria, nombre;
