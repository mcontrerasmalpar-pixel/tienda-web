-- =============================================
-- SEED — Hebillas Gin&Jes
-- Rutas exactas según Supabase Storage bucket: productos
-- Ejecutar en: Supabase → SQL Editor
-- =============================================

-- Limpiar productos anteriores
TRUNCATE public.productos RESTART IDENTITY;

INSERT INTO public.productos
  (nombre, precio, imagen_url, categoria, descripcion, codigo, destacado, activo)
VALUES

  -- ────────────────────────────────────────────────
  -- PEGAPEGA  (carpeta: pegapega/)
  -- Subcarpetas: americano | gradob
  -- ────────────────────────────────────────────────
  -- NOTA: reemplaza "imagen.jpg" por el nombre real del archivo
  -- dentro de cada subcarpeta (ej: americano.jpg, gradob.png, etc.)
  ('Pegapega Americano',
   0.00, 'pegapega/americano/americano.jpg',
   'Insumos Galvánicos y Otros',
   'Pegamento americano de alta resistencia para cuero y textil.',
   'PEG-AMERIC', true, true),

  ('Pegapega Grado B',
   0.00, 'pegapega/gradob/gradob.jpg',
   'Insumos Galvánicos y Otros',
   'Pegamento industrial Grado B para herrajes, plantillas y calzado.',
   'PEG-GRADOB', false, true),

  -- ────────────────────────────────────────────────
  -- PRODUCTOS METALES  (carpeta: productos metales/)
  -- Archivos: argollas | aro mosqueton | base de llavero |
  --           broche iman | broche7050 | ganchos |
  --           media luna | mosquetones | reguladores
  -- ────────────────────────────────────────────────
  -- NOTA: usa la extensión real (.jpg, .png, .webp)
  -- del archivo subido. Ej: 'productos metales/argollas.jpg'
  ('Argollas',
   0.00, 'productos metales/argollas.jpg',
   'Aplicaciones',
   'Argollas metálicas de zamak para bolsos, correas y accesorios.',
   'MET-ARGOLL', false, true),

  ('Aro Mosquetón',
   0.00, 'productos metales/aro mosqueton.jpg',
   'Aplicaciones',
   'Aro tipo mosquetón metálico para llaveros y accesorios.',
   'MET-AROMOSQ', false, true),

  ('Base de Llavero',
   0.00, 'productos metales/base de llavero.jpg',
   'Aplicaciones',
   'Base metálica para llavero, acabado niquelado o dorado.',
   'MET-BASLLAV', false, true),

  ('Broche Imán',
   0.00, 'productos metales/broche iman.jpg',
   'Aplicaciones',
   'Broche de imán para bolsos y carteras, zamak con acabado premium.',
   'MET-BRIMAN', true, true),

  ('Broche 7050',
   0.00, 'productos metales/broche7050.jpg',
   'Aplicaciones',
   'Broche modelo 7050 de zamak para carteras y marroquinería.',
   'MET-BR7050', false, true),

  ('Ganchos',
   0.00, 'productos metales/ganchos.jpg',
   'Aplicaciones',
   'Ganchos metálicos para correas, bolsos y accesorios de cuero.',
   'MET-GANCHO', false, true),

  ('Media Luna',
   0.00, 'productos metales/media luna.jpg',
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

  -- ────────────────────────────────────────────────
  -- PRODUCTOS PLÁSTICOS  (carpeta: productos plasticos/)
  -- Archivos: mosquetones | reguladores | tiptop
  -- ────────────────────────────────────────────────
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
   0.00, 'productos plasticos/tiptop.jpg',
   'Insumos Galvánicos y Otros',
   'Tiptop modelo sapito en plástico para calzado infantil y casual.',
   'PLAS-TIPSAP', true, true);


-- =============================================
-- PASO 2: ACTUALIZAR PRECIOS
-- Descomenta y completa con los precios reales
-- =============================================
-- UPDATE public.productos SET precio = 0.00 WHERE codigo = 'PEG-AMERIC';
-- UPDATE public.productos SET precio = 0.00 WHERE codigo = 'PEG-GRADOB';
-- UPDATE public.productos SET precio = 0.00 WHERE codigo = 'MET-ARGOLL';
-- UPDATE public.productos SET precio = 0.00 WHERE codigo = 'MET-AROMOSQ';
-- UPDATE public.productos SET precio = 0.00 WHERE codigo = 'MET-BASLLAV';
-- UPDATE public.productos SET precio = 0.00 WHERE codigo = 'MET-BRIMAN';
-- UPDATE public.productos SET precio = 0.00 WHERE codigo = 'MET-BR7050';
-- UPDATE public.productos SET precio = 0.00 WHERE codigo = 'MET-GANCHO';
-- UPDATE public.productos SET precio = 0.00 WHERE codigo = 'MET-MEDLUN';
-- UPDATE public.productos SET precio = 0.00 WHERE codigo = 'MET-MOSQUT';
-- UPDATE public.productos SET precio = 0.00 WHERE codigo = 'MET-REGULA';
-- UPDATE public.productos SET precio = 0.00 WHERE codigo = 'PLAS-MOSQUT';
-- UPDATE public.productos SET precio = 0.00 WHERE codigo = 'PLAS-REGULA';
-- UPDATE public.productos SET precio = 0.00 WHERE codigo = 'PLAS-TIPSAP';


-- =============================================
-- VERIFICAR
-- =============================================
SELECT id, codigo, nombre, categoria, imagen_url, precio, destacado
FROM public.productos
ORDER BY categoria, nombre;
