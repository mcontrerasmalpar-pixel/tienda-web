/* Shared catalog queries and CSV validation. No privileged keys in the browser. */
(function (root) {
  'use strict';
  const FIELDS = 'id,nombre,codigo,categoria,category_id,subcategory_id,precio,descripcion,imagen_url,destacado,activo';
  const HEADERS = ['codigo', 'nombre', 'categoria', 'subcategoria', 'precio', 'descripcion', 'imagen_url', 'destacado', 'activo'];
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  function imageUrl(client, path, fallback = '') {
    const value = String(path || '').trim();
    if (!value) return fallback;
    if (/^https?:\/\//i.test(value)) return value;
    if (/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('//')) return fallback;
    return client.storage.from('product-images').getPublicUrl(value.replace(/^\/+/, '').replace(/^product-images\//i, '')).data.publicUrl;
  }
  function productQuery(client, options = {}) {
    const {page = 1, size = 12, search = '', category = '', subcategory = '', active = true, sort = 'default', min = '', max = ''} = options;
    let query = client.from('products').select(FIELDS, {count: 'exact'});
    if (active !== '') query = query.eq('activo', active === true || active === 'true');
    if (category) query = query.eq('category_id', category);
    if (subcategory) query = query.eq('subcategory_id', subcategory);
    if (search.trim()) {
      // Quote PostgREST values; escape LIKE wildcards so user input stays literal.
      const pattern = '%' + search.trim().slice(0, 160).replace(/[\\%_]/g, '\\$&') + '%';
      const literal = '"' + pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
      query = query.or(['nombre', 'codigo', 'descripcion'].map(key => `${key}.ilike.${literal}`).join(','));
    }
    if (min !== '' && Number.isFinite(Number(min))) query = query.gte('precio', Number(min));
    if (max !== '' && Number.isFinite(Number(max))) query = query.lte('precio', Number(max));
    if (sort === 'price-asc' || sort === 'price-desc') query = query.order('precio', {ascending: sort === 'price-asc'});
    else if (sort === 'name-asc') query = query.order('nombre', {ascending: true});
    else query = query.order('destacado', {ascending: false});
    return query.order('id', {ascending: true}).range((page - 1) * size, page * size - 1);
  }
  async function taxonomy(client) {
    // Fetch all taxonomy pages as well when a project has a low API row limit.
    async function read(table, fields) {
      const rows = [];
      for (let from = 0; ; ) {
        const result = await client.from(table).select(fields).order('id').range(from, from + 199);
        if (result.error) throw result.error;
        if (!result.data.length) return rows.sort((a,b) => a.nombre.localeCompare(b.nombre));
        rows.push(...result.data); from += result.data.length;
      }
    }
    const [categories, subcategories] = await Promise.all([read('categories', 'id,nombre'), read('subcategories', 'id,category_id,nombre')]);
    return {categories, subcategories};
  }
  function parseCSV(text) {
    text = String(text).replace(/^\uFEFF/, '');
    const first = text.split(/\r?\n/, 1)[0];
    const delimiter = first.includes(';') && !first.includes(',') ? ';' : ',';
    const rows = []; let row = [], cell = '', quoted = false, closed = false;
    const endCell = () => { row.push(cell); cell = ''; closed = false; };
    const endRow = () => { endCell(); if (row.some(v => v.trim())) rows.push(row); row = []; };
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') { quoted = false; closed = true; }
        else cell += c;
      } else if (c === delimiter) endCell();
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; endRow(); }
      else if (c === '"' && !cell && !closed) quoted = true;
      else if (c === '"' || closed) throw new Error(`Comillas inválidas en el registro ${rows.length + 1}.`);
      else cell += c;
    }
    if (quoted) throw new Error('Hay una celda con comillas sin cerrar.');
    if (cell || row.length || closed) endRow();
    return rows;
  }
  function boolean(value, fallback, field) {
    if (!value) return fallback;
    if (/^(true|1|s[ií])$/i.test(value)) return true;
    if (/^(false|0|no)$/i.test(value)) return false;
    throw new Error(`${field}: usa true/false, sí/no o 1/0.`);
  }
  function validateCSV(text) {
    const matrix = parseCSV(text);
    if (matrix.length < 2) throw new Error('El CSV debe contener encabezados y productos.');
    const headers = matrix.shift().map(v => v.trim().toLowerCase());
    if (headers.some(h => !HEADERS.includes(h)) || new Set(headers).size !== headers.length) throw new Error('Encabezados desconocidos o repetidos. Descarga la plantilla.');
    if (['codigo','nombre','categoria','precio'].some(h => !headers.includes(h))) throw new Error('Faltan columnas: codigo, nombre, categoria y precio son obligatorias.');
    if (matrix.length > 1000) throw new Error('Máximo 1000 productos por archivo.');
    const errors = [], rows = [], codes = new Set();
    matrix.forEach((cells, i) => {
      try {
        if (cells.length !== headers.length) throw new Error('La cantidad de columnas no coincide con el encabezado.');
        const row = Object.fromEntries(headers.map((h,j) => [h, cells[j].trim()]));
        row.codigo = row.codigo.toUpperCase();
        if (!/^[A-Z0-9][A-Z0-9._/-]{0,63}$/.test(row.codigo)) throw new Error('Código inválido (1–64 caracteres: letras, números, punto, guion, / o _).');
        if (codes.has(row.codigo)) throw new Error(`Código repetido: ${row.codigo}.`);
        codes.add(row.codigo);
        if (!row.nombre || row.nombre.length > 200) throw new Error('Nombre obligatorio, máximo 200 caracteres.');
        if (!row.categoria || row.categoria.length > 100 || (row.subcategoria || '').length > 100) throw new Error('Categoría obligatoria; categoría/subcategoría: máximo 100 caracteres.');
        const price = row.precio.replace(',', '.');
        if (!/^\d+(\.\d{1,2})?$/.test(price) || Number(price) > 99999999.99) throw new Error('Precio inválido: usa 0 o un importe positivo con hasta dos decimales, sin separador de miles.');
        if ((row.descripcion || '').length > 5000 || (row.imagen_url || '').length > 2048) throw new Error('Descripción o ruta de imagen demasiado larga.');
        if (/^[a-z][a-z\d+.-]*:/i.test(row.imagen_url || '') && !/^https?:\/\//i.test(row.imagen_url)) throw new Error('La URL de imagen debe usar http o https.');
        if ((row.imagen_url || '').startsWith('//')) throw new Error('Usa una URL completa o una ruta del bucket.');
        rows.push({...row, precio: Number(price), subcategoria: row.subcategoria || '', descripcion: row.descripcion || '', imagen_url: row.imagen_url || '', destacado: boolean(row.destacado, false, 'destacado'), activo: boolean(row.activo, true, 'activo')});
      } catch (error) { errors.push(`Registro ${i + 2}: ${error.message}`); }
    });
    return {rows, errors, total: matrix.length};
  }
  root.Catalog = {FIELDS, HEADERS, escapeHtml, imageUrl, productQuery, taxonomy, parseCSV, validateCSV};
  if (typeof module !== 'undefined') module.exports = root.Catalog;
})(typeof window !== 'undefined' ? window : globalThis);
