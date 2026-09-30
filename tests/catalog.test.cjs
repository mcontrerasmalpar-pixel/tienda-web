const {test} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../js/catalog.js');

test('CSV accepts BOM, semicolon, quoted commas/newlines and escaped quotes', () => {
  const result = C.validateCSV('\uFEFFcodigo;nombre;categoria;precio;descripcion;activo\r\nabc-1;"Broche; azul";Metales;"1,50";"Línea 1\nLínea ""2""";no');
  assert.deepEqual(result.errors, []);
  assert.equal(result.rows[0].codigo, 'ABC-1');
  assert.equal(result.rows[0].precio, 1.5);
  assert.equal(result.rows[0].activo, false);
  assert.equal(result.rows[0].descripcion, 'Línea 1\nLínea "2"');
});
test('CSV rejects bad quoting, missing/duplicate headers, invalid prices and booleans', () => {
  assert.throws(() => C.parseCSV('a,b\n"open'), /comillas/);
  assert.throws(() => C.parseCSV('a,b\n"closed"x,z'), /Comillas/);
  assert.throws(() => C.validateCSV('codigo,nombre\na,b'), /Faltan/);
  assert.throws(() => C.validateCSV('codigo,codigo\na,b'), /Encabezados/);
  const prefix = 'codigo,nombre,categoria,precio,activo\n';
  for (const row of ['A,Nombre,Cat,-1,true','A,Nombre,Cat,1.123,true','A,Nombre,Cat,abc,true','A,Nombre,Cat,1,quizá','A,Nombre,Cat,100000000,true']) assert.equal(C.validateCSV(prefix + row).errors.length, 1);
});
test('CSV rejects case-insensitive duplicate codes and unsafe image URLs', () => {
  assert.match(C.validateCSV('codigo,nombre,categoria,precio\na,Uno,Cat,0\nA,Dos,Cat,0').errors[0], /repetido/);
  assert.equal(C.validateCSV('codigo,nombre,categoria,precio,imagen_url\na,Uno,Cat,0,javascript:alert(1)').errors.length, 1);
});
test('250 rows validate and >1000 are refused', () => {
  const csv = n => 'codigo,nombre,categoria,precio\n' + Array.from({length:n}, (_,i) => `C-${i},Producto ${i},Metales,0`).join('\n');
  assert.equal(C.validateCSV(csv(250)).rows.length, 250);
  assert.throws(() => C.validateCSV(csv(1001)), /1000/);
});
test('queries apply server filters, stable sorting, inclusive range and literal search', () => {
  const calls = [];
  const query = new Proxy({}, {get: (_,key) => (...args) => {calls.push([key,...args]); return query;}});
  C.productQuery({from: table => {assert.equal(table, 'products'); return query;}}, {page:3, size:12, category:2, subcategory:4, search:'a,b%_"()', min:0,max:0,sort:'price-desc'});
  assert.deepEqual(calls.at(-1), ['range',24,35]);
  assert(calls.some(c => c[0] === 'eq' && c[1] === 'activo' && c[2] === true));
  assert(calls.some(c => c[0] === 'lte' && c[2] === 0));
  assert.deepEqual(calls.at(-2), ['order','id',{ascending:true}]);
  assert(calls.find(c => c[0] === 'or')[1].startsWith('nombre.ilike."%a,b'));
  assert(!calls.some(c => c[0] === 'select' && c[1] === '*'));
});
test('images preserve full legacy URLs and resolve bucket-prefixed paths', () => {
  const client = {storage: {from: name => {assert.equal(name,'product-images'); return {getPublicUrl: path => ({data: {publicUrl:'https://example.test/' + path}})};}}};
  assert.equal(C.imageUrl(client,'https://old.test/productos/image.jpg'), 'https://old.test/productos/image.jpg');
  assert.equal(C.imageUrl(client,'product-images/foo.jpg'), 'https://example.test/foo.jpg');
  assert.equal(C.imageUrl(client,'javascript:alert(1)','fallback'), 'fallback');
});
