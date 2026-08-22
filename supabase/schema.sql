-- =============================================
-- ESQUEMA SUPABASE — Hebillas Ginjes
-- Ejecuta en: Supabase > SQL Editor > Run
-- =============================================

CREATE TABLE IF NOT EXISTS productos (
  id           BIGSERIAL PRIMARY KEY,
  nombre       TEXT NOT NULL,
  descripcion  TEXT,
  precio       NUMERIC(10,2) NOT NULL DEFAULT 0,
  categoria    TEXT NOT NULL,
  codigo       TEXT,              -- código interno ej: HCORC-00024
  imagen_url   TEXT,              -- ruta en Storage o URL externa
  stock        INTEGER DEFAULT 0,
  destacado    BOOLEAN DEFAULT false,
  activo       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Datos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, categoria, codigo, destacado) VALUES
  ('Hebilla para Correa',      'Hebilla metálica para correa de cuero. Alta resistencia.',           5.50, 'Hebillas',            'HCORC-00024', true),
  ('Hebilla Rodillo',          'Hebilla tipo rodillo de zamak para cinturones y correas.',           6.00, 'Hebillas rodillo',    'HROD-00001',  false),
  ('Placa Decorativa',         'Placa de zamak para bolsos y calzado. Varios motivos.',              3.50, 'Placas',              'PLAC-00001',  false),
  ('Jalador de Cierre',        'Jalador en zamak compatible con cierres estándar.',                  2.80, 'Jaladores',           'JAL-00001',   false),
  ('Listón Decorativo',        'Listón para calzado y accesorios. Acabado niquelado.',               4.20, 'Listones',            'LISTD-00014', true),
  ('Pasante Simple 25mm',      'Pasante metálico para correas. Ancho 25mm.',                         1.50, 'Pasantes',            'PAS-00001',   false),
  ('Adorno con Remaches',      'Adorno decorativo con remaches para bolsos y ropa.',                 7.00, 'Adornos con remaches','ADOCR-00015', true),
  ('Ovalín Dorado',            'Ovalines metálicos para carteras y bolsos. Acabado dorado.',         3.00, 'Ovalines',            'OVA-00001',   false);

-- Acceso público de lectura
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública" ON productos FOR SELECT USING (true);

-- =============================================
-- STORAGE para fotos
-- =============================================
-- 1. Supabase > Storage > New Bucket
-- 2. Nombre: "productos" | Marcar como PUBLIC ✅
-- 3. Subir fotos organizadas por carpeta:
--    hebillas/foto.jpg
--    placas/foto.jpg
--    etc.
-- 4. En la tabla, campo imagen_url = 'hebillas/foto.jpg'
-- La URL pública se genera automáticamente en getImageUrl()
