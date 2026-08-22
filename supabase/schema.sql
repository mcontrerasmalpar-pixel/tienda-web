-- =============================================
-- ESQUEMA SUPABASE — Gin&Jes
-- Ejecuta esto en: Supabase > SQL Editor
-- =============================================

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id           BIGSERIAL PRIMARY KEY,
  nombre       TEXT NOT NULL,
  descripcion  TEXT,
  precio       NUMERIC(10,2) NOT NULL,
  categoria    TEXT NOT NULL,
  imagen_url   TEXT,          -- ruta en Storage o URL externa
  stock        INTEGER DEFAULT 0,
  destacado    BOOLEAN DEFAULT false,
  activo       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Datos de ejemplo para empezar
INSERT INTO productos (nombre, descripcion, precio, categoria, destacado) VALUES
  ('Hilo de Seda Premium',    'Hilo de seda suave. Disponible en 24 colores. 200m por carrete.',         12.50, 'Hilos',   false),
  ('Set Agujas Patchwork x12','Set profesional de 12 agujas de acero inoxidable. Incluye estuche.',      18.00, 'Agujas',  false),
  ('Tela Algodón Floral 1m',  'Tela 100% algodón estampado floral vintage. 1m x 1.5m.',                  25.00, 'Telas',   false),
  ('Kit Iniciación Costura',  'Tijeras, agujas, 10 hilos, dedal y centímetro. Ideal como regalo.',       55.00, 'Kits',    true),
  ('Botones Nácar 20mm',      'Pack 10 botones de nácar natural 20mm. Para blusas y camisas finas.',      8.00, 'Botones', false),
  ('Cierre Invisible 30cm',   'Cierre invisible nylon 15 colores. 30cm. Para vestidos y faldas.',         5.50, 'Cierres', false),
  ('Encaje Vintage Blanco 2m','Encaje algodón motivos florales. 2m largo, 8cm ancho.',                   15.00, 'Encajes', false),
  ('Kit Bordado Profesional', 'Bastidor 20cm, 24 hilos DMC, agujas bordado y tijeras. Completo.',        78.00, 'Kits',    true);

-- Permitir lectura pública (sin login)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública" ON productos FOR SELECT USING (true);

-- =============================================
-- STORAGE: Bucket para fotos de productos
-- =============================================
-- En Supabase > Storage > New Bucket:
--   Nombre: productos
--   Public: ✅ SÍ (para que las fotos sean visibles)
--
-- Luego sube tus fotos ahí y copia la ruta al campo imagen_url
-- Ejemplo: '2024/hilo-seda.jpg'
-- La URL pública será automática vía getImageUrl()
