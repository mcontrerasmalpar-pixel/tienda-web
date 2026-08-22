# 🧵 Gin&Jes — Tienda de Costura y Confección

Sitio web oficial de **Gin&Jes**, tienda de accesorios para costura y confección de alta calidad con 2 locales en Lima, Perú.

## 📍 Locales
- **CC. Virrey Amot** — Puesto 223 | +51 920 884 528
- **CC. Perú Futuro** — Puesto 309-310 | +51 909 001 592

## ✨ Características
- Catálogo dinámico cargado desde **Supabase**
- Filtros por categoría (Hilos, Agujas, Telas, Kits, Botones, Cierres, Encajes)
- Modal de producto con descripción completa
- Carrito de compras con sidebar
- Diseño luxury: **fondo negro + detalles dorados**
- Sección "Encuéntranos" con links a WhatsApp por local
- Mobile-first con Tailwind CSS

## 🚀 Setup Supabase (para fotos y datos reales)

### 1. Crear proyecto
Ve a [supabase.com](https://supabase.com) → New Project (es gratis)

### 2. Crear tabla de productos
En **SQL Editor**, pega y ejecuta el contenido de `supabase/schema.sql`

### 3. Subir fotos
- Ve a **Storage** → **New Bucket** → nombre: `productos` → marcar como **Public**
- Sube tus fotos (puedes organizarlas por carpetas: `hilos/`, `telas/`, etc.)
- Copia la ruta del archivo (ej: `hilos/hilo-rojo.jpg`)

### 4. Agregar producto con foto
En **Table Editor** → tabla `productos` → Insert row:
```
nombre:      "Hilo Rojo Premium"
descripcion: "Hilo de algodón rojo brillante..."
precio:      12.50
categoria:   "Hilos"
imagen_url:  "hilos/hilo-rojo.jpg"   ← ruta del archivo en Storage
destacado:   false
activo:      true
```

### 5. Conectar tu web
En `js/supabase.js` reemplaza:
```js
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
```
Encuéntralos en: **Settings → API**

## 🌐 Deploy en Vercel
```bash
# Instala Vercel CLI
npm i -g vercel
vercel --prod
```

## 🎨 Tecnologías
- HTML5 + JavaScript Vanilla
- [Tailwind CSS](https://tailwindcss.com/) via CDN
- [Supabase](https://supabase.com/) — Base de datos + Storage de fotos
- Google Fonts (Playfair Display + Inter)
