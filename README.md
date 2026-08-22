# 🧵 Gin&Jes — Tienda de Costura y Confección

Sitio web oficial de **Gin&Jes**, tienda de accesorios y materiales para costura y confección de alta calidad.

## ✨ Características

- Catálogo de productos con filtros por categoría
- Carrito de compras con sidebar deslizable
- Branding personalizado Gin&Jes (colores ámbar/dorado)
- Diseño mobile-first con Tailwind CSS
- Secciones: Hero, Categorías, Catálogo, Nosotros, Contacto

## 🚀 Cómo usar

```bash
git clone https://github.com/mcontrerasmalpar-pixel/tienda-web.git
cd tienda-web
# Abrir index.html con Live Server en VS Code
```

## 📸 Agregar fotos reales del catálogo

En el archivo `js/products.js`, reemplaza los valores de `image:` con las URLs directas de tus fotos:

```js
{
  id: 1,
  name: "Nombre real del producto",
  price: 25.00,
  image: "URL_DE_TU_FOTO",  // ← Pegar aquí la URL de Google Drive o subir a /img
  category: "Hilos",
  description: "Descripción del producto"
}
```

### Opción A: Subir imágenes al repo
1. Crea una carpeta `img/` en el repositorio
2. Sube tus fotos del catálogo
3. Usa rutas relativas: `image: "img/producto1.jpg"`

### Opción B: Google Drive (URL pública)
1. Click derecho en la foto → Compartir → "Cualquiera con el enlace"
2. Obtén el ID del archivo de la URL
3. Usa: `https://drive.google.com/uc?export=view&id=TU_ID`

## 🛠️ Próximos pasos

- [ ] Agregar fotos reales del catálogo Gin&Jes
- [ ] Actualizar precios y descripciones reales
- [ ] Conectar WhatsApp para pedidos
- [ ] Desplegar en Vercel (gratis)
- [ ] Conectar Supabase para gestión de productos
- [ ] Integrar pasarela de pago (Culqi / MercadoPago)

## 🎨 Tecnologías

- HTML5 + JavaScript Vanilla
- [Tailwind CSS](https://tailwindcss.com/) via CDN
- Google Fonts (Playfair Display + Inter)
