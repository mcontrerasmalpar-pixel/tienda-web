// Browser integration against a deterministic HTTP fixture, never production Supabase.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve('.');
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync('node_modules/.cache/ms-playwright')) process.env.PLAYWRIGHT_BROWSERS_PATH = path.resolve('node_modules/.cache/ms-playwright');
const {chromium, expect} = require('@playwright/test');
const categories = [{id:1,nombre:'Metales'},{id:2,nombre:'Plásticos'}];
const subcategories = [{id:1,category_id:1,nombre:'Broches'},{id:2,category_id:2,nombre:'Reguladores'}];
let products = Array.from({length:250},(_,i) => ({id:i+1,codigo:`PR-${String(i+1).padStart(3,'0')}`,nombre:`Producto ${String(i+1).padStart(3,'0')}`,categoria:i%2 ? 'Plásticos' : 'Metales',category_id:i%2+1,subcategory_id:i%2+1,precio:i%20,descripcion:'Producto para bolsos',imagen_url:'folder/image.jpg',destacado:i<2,activo:i<240}));
const errors = [], requests = []; let failNext = false, admin = true, uiImportCalls = 0;
const user = {id:'11111111-1111-1111-1111-111111111111',email:'admin@example.test',aud:'authenticated',role:'authenticated',app_metadata:{provider:'email'},user_metadata:{},created_at:'2026-01-01T00:00:00Z'};
const jwt = [Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'})).toString('base64url'),'fixture'].join('.');
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.csv':'text/csv','.mp4':'video/mp4'};
const server = http.createServer((req,res) => {
  let file = path.resolve(root, '.' + new URL(req.url,'http://localhost').pathname);
  if (!file.startsWith(root + path.sep) && file !== root) {res.writeHead(403);return res.end();}
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file,'index.html');
  if (!fs.existsSync(file)) {res.writeHead(404);return res.end();}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream'}); fs.createReadStream(file).pipe(res);
});
function match(record, key, value) {
  if (value.startsWith('eq.')) return String(record[key]) === value.slice(3);
  if (value.startsWith('gte.')) return record[key] >= Number(value.slice(4));
  if (value.startsWith('lte.')) return record[key] <= Number(value.slice(4));
  if (value.startsWith('in.')) return value.slice(4,-1).split(',').map(x => x.replace(/^"|"$/g,'')).includes(String(record[key]));
  return true;
}
async function main() {
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless:true});
  try {
    const context = await browser.newContext({viewport:{width:1440,height:1000}});
    await context.route('**/*', async route => {
      const req = route.request(), url = new URL(req.url());
      if (url.hostname === '127.0.0.1') return route.continue();
      if (url.hostname === 'cdn.jsdelivr.net') return route.fulfill({contentType:'text/javascript',body:fs.readFileSync('node_modules/@supabase/supabase-js/dist/umd/supabase.js','utf8')});
      if (!url.hostname.endsWith('.supabase.co')) return route.fulfill({status:200,body:''});
      const respond = (body,status=200,extra={}) => route.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-expose-headers':'content-range',...extra},body:JSON.stringify(body)});
      if (url.pathname.startsWith('/auth/v1/token')) {admin = req.postDataJSON().email.startsWith('admin'); return respond({access_token:jwt,token_type:'bearer',expires_in:3600,refresh_token:'fixture',user});}
      if (url.pathname.startsWith('/auth/v1/logout')) return respond({});
      if (url.pathname.startsWith('/auth/v1/user')) return respond(user);
      if (url.pathname.startsWith('/storage/')) return route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#171713"/><circle cx="100" cy="100" r="50" fill="none" stroke="#c9a84c" stroke-width="15"/></svg>'});
      const table = url.pathname.split('/').at(-1), params = url.searchParams;
      if (table === 'is_catalog_admin') return respond(admin);
      if (table === 'import_catalog') {
        uiImportCalls++;
        const payload = req.postDataJSON();
        if (payload.mode === 'insert' && payload.rows.some(r => products.some(p => p.codigo === r.codigo))) return respond({message:'Código existente'},400);
        for (const row of payload.rows) {
          let category = categories.find(c => c.nombre === row.categoria);
          if (!category) {category = {id:categories.length+1,nombre:row.categoria}; categories.push(category);}
          const existing = products.find(p => p.codigo === row.codigo);
          if (existing) Object.assign(existing,row,{category_id:category.id});
          else products.push({...row,id:products.length+1,category_id:category.id,subcategory_id:null});
        }
        return respond(payload.rows.length);
      }
      if (!['products','categories','subcategories'].includes(table)) return respond({message:'Unknown route'},400);
      if (table === 'products' && failNext) {failNext = false;return respond({message:'Fallo de prueba'},500);}
      const source = table === 'products' ? products : table === 'categories' ? categories : subcategories;
      let result = source.filter(r => [...params].every(([k,v]) => ['select','order','offset','limit','or'].includes(k) || match(r,k,v)));
      if (params.has('or')) {
        const literal = params.get('or').match(/nombre\.ilike\.("(?:\\.|[^"])*")/)[1];
        const pattern = JSON.parse(literal).slice(1,-1).replace(/\\([%_\\])/g,'$1').toLowerCase();
        if (pattern === 'producto 010') await new Promise(r => setTimeout(r,400));
        result = result.filter(p => `${p.nombre} ${p.codigo} ${p.descripcion}`.toLowerCase().includes(pattern));
      }
      if (req.method() === 'PATCH') {result.forEach(p => {Object.assign(p,req.postDataJSON());p.categoria = categories.find(c => c.id === p.category_id).nombre;});return respond(result.map(p => ({id:p.id})));}
      if (req.method() === 'DELETE') {products = products.filter(p => !result.includes(p));return respond(result.map(p => ({id:p.id})));}
      if (req.method() === 'POST') {
        const payload = req.postDataJSON();
        if (table === 'products' && products.some(p => p.codigo === payload.codigo)) return respond({code:'23505',message:'duplicate key'},409);
        const row = {...payload,id:source.length+1};
        if (table === 'products') row.categoria = categories.find(c => c.id === row.category_id).nombre;
        source.push(row); return respond(params.get('select') && req.headers().accept?.includes('vnd.pgrst.object') ? row : [row]);
      }
      const total = result.length;
      const order = params.get('order')?.split(',') || [];
      result.sort((a,b) => {for (const entry of order) {const [key,direction] = entry.split('.'); const sign = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0; if (sign) return direction === 'desc' ? -sign : sign;}return 0;});
      const offset = Number(params.get('offset') || 0), limit = Number(params.get('limit') || 1000);
      result = result.slice(offset,offset+limit);
      requests.push({table,limit:params.get('limit'),count:result.length,method:req.method(),params:params.toString()});
      return respond(req.method() === 'HEAD' ? null : result,200,{'content-range':`${offset}-${offset+result.length-1}/${total}`});
    });
    const page = await context.newPage();
    page.on('pageerror',e => errors.push(e.message)); page.on('dialog',dialog => dialog.accept());
    await page.goto(origin);
    await expect(page.locator('.pcard')).toHaveCount(12);
    await expect(page.locator('#results-count')).toContainText('240 productos');
    await page.locator('.pcard-add').first().click();
    await expect(page.locator('#cart-count')).toHaveText('1');
    await page.evaluate(() => closeCart());
    await page.getByRole('button',{name:'2',exact:true}).click();
    await expect(page.locator('#results-count')).toContainText('13–24');
    await page.locator('.pcard-add').first().click(); await expect(page.locator('#cart-count')).toHaveText('2'); await page.evaluate(() => closeCart());
    await page.locator('#search-input').fill('PR-200'); await expect(page.locator('.pcard')).toHaveCount(1); await expect(page.locator('.pcard-code')).toHaveText('PR-200');
    await page.locator('.pcard').click(); await expect(page.locator('#modal-name')).toHaveText('Producto 200'); await page.evaluate(() => closeModal());
    await page.locator('#search-input').fill('sin coincidencias'); await expect(page.locator('#product-grid')).toContainText('No se encontraron');
    await page.locator('#search-input').fill(''); await page.getByRole('button',{name:'Metales',exact:true}).click();
    await expect(page.locator('#results-count')).toContainText('120 productos');
    await page.locator('#subcategory-filter').selectOption('1'); await expect(page.locator('.pcard')).toHaveCount(12);
    await page.locator('#price-max').fill('0'); await page.getByRole('button',{name:'Aplicar filtro'}).click(); await expect(page.locator('#results-count')).toContainText('12 productos');
    await page.locator('#price-max').fill(''); await page.getByRole('button',{name:'Todos',exact:true}).click();
    await expect(page.locator('#results-count')).toContainText('240 productos');
    await page.evaluate(() => {searchProducts('Producto 010');}); await page.waitForTimeout(320);
    await page.evaluate(() => searchProducts('Producto 020')); await expect(page.locator('.pcard')).toHaveCount(1); await expect(page.locator('.pcard-code')).toHaveText('PR-020'); await page.waitForTimeout(450); await expect(page.locator('.pcard-code')).toHaveText('PR-020');
    failNext = true; await page.locator('#search-input').fill('error'); await expect(page.locator('#product-grid')).toContainText('No se pudieron');
    await page.locator('#search-input').fill(''); await page.getByRole('button',{name:'Reintentar',exact:true}).click(); await expect(page.locator('.pcard')).toHaveCount(12);
    fs.mkdirSync('test-results',{recursive:true}); await page.locator('#tienda').screenshot({animations:'disabled',path:'test-results/catalog-desktop.png'});
    await page.setViewportSize({width:390,height:844}); await page.locator('.mobile-filters-toggle').click(); await expect(page.locator('#catalog-filters')).toBeVisible(); await page.locator('#sidebar-cats').getByRole('button',{name:'Metales',exact:true}).click(); await page.locator('#subcategory-filter').selectOption('1'); await expect(page.locator('#results-count')).toContainText('120 productos'); await page.locator('#sidebar-cats').getByRole('button',{name:'Todos',exact:true}).click(); await expect(page.locator('#results-count')).toContainText('240 productos'); await page.locator('.mobile-filters-toggle').click(); await expect(page.locator('#catalog-filters')).not.toBeVisible(); await page.locator('#tienda').screenshot({animations:'disabled',path:'test-results/catalog-mobile.png'});
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    console.log('PASS storefront: paging, search/races, taxonomy, zero price, errors/retry, modal, cart, mobile');
    await page.setViewportSize({width:1440,height:1000}); await page.goto(origin + '/admin/');
    await page.locator('#login-email').fill('admin@example.test'); await page.locator('#login-password').fill('fixture'); await page.getByRole('button',{name:'Iniciar sesión'}).click();
    await expect(page.locator('.product-row')).toHaveCount(25); await expect(page.locator('#total-products')).toHaveText('250');
    await page.locator('#next-page').click(); await expect(page.locator('#page-label')).toHaveText('Página 2 de 10');
    await page.locator('#active-filter').selectOption('false'); await expect(page.locator('.product-row')).toHaveCount(10);
    await page.locator('#select-page').check(); await page.locator('#bulk-action').selectOption('activate'); await page.locator('#bulk-apply').click();
    await expect(page.locator('#products-list')).toContainText('No hay productos');
    await page.locator('#active-filter').selectOption(''); await expect(page.locator('.product-row')).toHaveCount(25);
    await page.locator('[data-edit]').first().click(); await page.locator('#product-name').fill('Nombre editado'); await page.getByRole('button',{name:'Guardar producto'}).click();
    await expect(page.locator('#product-dialog')).not.toBeVisible(); await expect(page.locator('#products-list')).toContainText('Nombre editado');
    await page.locator('#new-product-btn').click(); await page.locator('#product-name').fill('Nuevo producto'); await page.locator('#product-code').fill('NEW-1'); await page.locator('#product-category').selectOption('1'); await page.getByRole('button',{name:'Guardar producto'}).click(); await expect(page.locator('#total-products')).toHaveText('251');
    await page.getByText('Importar productos desde CSV',{exact:true}).click();
    const validCSV = 'codigo,nombre,categoria,precio\nCSV-UI-1,Importado,Metales,3.50\nCSV-UI-2,Importado 2,Metales,0';
    await page.locator('#csv-file').setInputFiles({name:'bad.csv',mimeType:'text/csv',buffer:Buffer.from('codigo,nombre,categoria,precio\nA,Uno,Metales,abc')}); await page.locator('#csv-validate').click(); await expect(page.locator('#csv-preview')).toContainText('errores'); await expect(page.locator('#csv-import')).toBeDisabled();
    await page.locator('#csv-file').setInputFiles({name:'good.csv',mimeType:'text/csv',buffer:Buffer.from(validCSV)}); await page.locator('#csv-validate').click(); await expect(page.locator('#csv-import')).toBeEnabled();
    await page.locator('#csv-import').click(); await expect(page.locator('#csv-preview')).toContainText('2 productos importados correctamente'); await expect(page.locator('#total-products')).toHaveText('253');
    await page.locator('#csv-file').setInputFiles({name:'same.csv',mimeType:'text/csv',buffer:Buffer.from(validCSV)}); await page.locator('#csv-validate').click(); await expect(page.locator('#csv-preview')).toContainText('Ya existen'); await expect(page.locator('#csv-import')).toBeDisabled();
    await page.locator('#csv-mode').selectOption('upsert'); await page.locator('#csv-validate').click(); await expect(page.locator('#csv-preview')).toContainText('2 para reemplazar'); await page.locator('#csv-import').click(); await expect(page.locator('#csv-preview')).toContainText('2 productos importados correctamente');
    assert.equal(uiImportCalls,2);
    await page.screenshot({animations:'disabled',path:'test-results/admin-desktop.png',fullPage:true});
    await page.setViewportSize({width:390,height:844}); await page.screenshot({animations:'disabled',path:'test-results/admin-mobile.png',fullPage:true}); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.locator('#logout-btn').click(); await expect(page.locator('#auth-view')).toBeVisible();
    await page.locator('#login-email').fill('ordinary@example.test'); await page.locator('#login-password').fill('fixture'); await page.getByRole('button',{name:'Iniciar sesión'}).click(); await expect(page.locator('#login-error')).toContainText('no tiene permiso'); await expect(page.locator('#dashboard-view')).not.toBeVisible();
    console.log('PASS admin: auth/denial, paging, bulk edit, create/edit, CSV errors/preview/create/upsert, mobile');
    assert.deepEqual(errors,[]);
    assert(requests.filter(r => r.table === 'products' && r.method === 'GET' && !r.params.includes('codigo=in')).every(r => ['12','25'].includes(r.limit)));
    console.log('PASS no unbounded product list downloads; no browser exceptions');
    await context.close();
  } finally {await browser.close(); await new Promise(resolve => server.close(resolve));}
}
main().catch(error => {console.error(error); server.close(); process.exitCode = 1;});
