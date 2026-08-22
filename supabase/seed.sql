-- =============================================
-- SEED CORREGIDO — Hebillas Gin&Jes
-- Rutas exactas según bucket "productos" en Supabase Storage
-- Ejecutar en: Supabase → SQL Editor → Run
-- =============================================

TRUNCATE public.productos RESTART IDENTITY;

INSERT INTO public.productos
  (nombre, precio, imagen_url, categoria, descripcion, codigo, destacado, activo)
VALUES

  -- ── PEGAPEGA ──────────────────────────────────────────────
  ('Pegapega Americano',
   0.00, 'pegapega/americano/americano.jpg',
   'Pegapega',
   'Pegamento americano de alta resistencia para cuero y textil.',
   'PEG-AMERIC', true, true),

  ('Pegapega Grado B',
   0.00, 'pegapega/gradob/gradob.jpg',
   'Pegapega',
   'Pegamento industrial Grado B para herrajes y calzado.',
   'PEG-GRADOB', false, true),

  -- ── BROCHES / IMÁN ────────────────────────────────────────
  ('Broche Imán para Coser',
   0.00, 'productos metales/broche iman/broche iman coser.jpg',
   'Broches',
   'Broche de imán para coser en bolsos y carteras.',
   'MET-BRIMAN-COS', true, true),

  ('Imán Dorado 18mm',
   0.00, 'productos metales/broche iman/iman dorado 18.png',
   'Broches',
   'Imán dorado de 18mm para bolsos y accesorios.',
   'MET-IMAN-D18', false, true),

  ('Imán Níquel 10mm',
   0.00, 'productos metales/broche iman/iman niquel 10mm.png',
   'Broches',
   'Imán niquelado de 10mm.',
   'MET-IMAN-N10', false, true),

  ('Imán Níquel 18mm',
   0.00, 'productos metales/broche iman/iman niquel 18.png',
   'Broches',
   'Imán niquelado de 18mm.',
   'MET-IMAN-N18', false, true),

  ('Imán Plano 16mm',
   0.00, 'productos metales/broche iman/iman plano 16.png',
   'Broches',
   'Imán plano de 16mm para cierre de bolsos.',
   'MET-IMAN-P16', false, true),

  ('Imán Plano 18mm',
   0.00, 'productos metales/broche iman/iman plano 18.png',
   'Broches',
   'Imán plano de 18mm.',
   'MET-IMAN-P18', false, true),

  -- ── BROCHES 7050 ──────────────────────────────────────────
  ('Broche 7050',
   0.00, 'productos metales/broche7050/broche 7050.webp',
   'Broches',
   'Broche modelo 7050 de zamak para carteras y marroquinería.',
   'MET-BR7050', false, true),

  -- ── GANCHOS ───────────────────────────────────────────────
  ('Gancho Rino',
   0.00, 'productos metales/ganchos/gancho rino/gancho rino.jpg',
   'Ganchos',
   'Gancho metálico tipo Rino para correas y bolsos.',
   'MET-GANCH-RINO', false, true),

  -- ── HERRAJES METÁLICOS ────────────────────────────────────
  ('Media Luna',
   0.00, 'productos metales/media luna/media luna.jpg',
   'Herrajes Metálicos',
   'Herraje media luna de zamak para bolsos y marroquinería.',
   'MET-MEDLUN', false, true),

  -- ── MOSQUETONES ───────────────────────────────────────────
  ('Mosquetón Fotochek',
   0.00, 'productos metales/mosquetones/mosqueton fotockeck.jpg',
   'Mosquetones',
   'Mosquetón tipo fotochek para llaveros y accesorios.',
   'MET-MOSQ-FOTO', true, true),

  ('Mosquetón Giratorio',
   0.00, 'productos metales/mosquetones/mosqueton giratorio.jpg',
   'Mosquetones',
   'Mosquetón giratorio metálico de alta resistencia.',
   'MET-MOSQ-GIR', false, true),

  ('Mosquetón Simple',
   0.00, 'productos metales/mosquetones/mosqueton simple.jpg',
   'Mosquetones',
   'Mosquetón simple para llaveros y correas.',
   'MET-MOSQ-SIMP', false, true),

  -- ── REGULADORES ───────────────────────────────────────────
  ('Regulador Escalera',
   0.00, 'productos metales/reguladores/regulador escalera.jpg',
   'Reguladores',
   'Regulador tipo escalera metálico para correas.',
   'MET-REG-ESC', false, true),

  ('Regulador Plástico',
   0.00, 'productos metales/reguladores/regulador plastico.jpg',
   'Reguladores',
   'Regulador en plástico para correas y mochilas.',
   'PLAS-REG', false, true),

  -- ── TIPTOP (PLÁSTICOS) ────────────────────────────────────
  ('Tiptop Sapito',
   0.00, 'productos plasticos/tiptop/sapito/tiptopsapito.jpg',
   'Tiptop',
   'Tiptop modelo sapito en plástico para calzado.',
   'PLAS-TIPSAP', true, true);


-- =============================================
-- VERIFICAR
-- =============================================
SELECT id, codigo, nombre, categoria, imagen_url
FROM public.productos
ORDER BY categoria, nombre;
