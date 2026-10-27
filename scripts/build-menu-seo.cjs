const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const catalog = vm.runInNewContext(fs.readFileSync(path.join(root, 'js/pizzaJson.js'), 'utf8') + '\nJSON.parse(JSON.stringify(pizzaJson))');
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groups = new Map();
for (const item of catalog) {
    if (!groups.has(item.category)) groups.set(item.category, []);
    groups.get(item.category).push(item);
}
const categoryFilter = {'Pizzas Tradicionais':'tradicionais','Pizzas Especiais':'especiais','Pizzas Doces':'doces','Pizzas Gourmet':'gourmet','Bebidas':'bebidas','Combos':'combos'};
const itemHref = item => item.name.includes('-') ? '/cardapio?filter=' + (categoryFilter[item.category] || 'all') : '/cardapio?modal=' + encodeURIComponent(item.name);
const sections = [...groups].map(([name, items]) => `                <h3>${escape(name)}</h3>\n                <ul>\n${items.map(item => `                    <li><a href="${escape(itemHref(item))}">${escape(item.name)}</a></li>`).join('\n')}\n                </ul>`).join('\n');
const markup = `<!-- SEO-MENU:START -->
        <section class="menu-text-list" aria-label="Lista de sabores da La Bella Pizza">
            <details>
                <summary>Consultar a lista de sabores e bebidas</summary>
                <p>Cardápio da La Bella Pizza no Bingen, Petrópolis. Escolha um item para consultar suas opções ou categoria no cardápio interativo.
                    Preços, tamanhos e disponibilidade estão no pedido. Se o cardápio não carregar, consulte o
                    <a href="https://wa.me/5524999323962" target="_blank" rel="noopener noreferrer">WhatsApp (24) 99932-3962</a>.</p>
${sections}
            </details>
        </section>
        <!-- SEO-MENU:END -->`;
const target = path.join(root, 'cardapio.html');
const old = fs.readFileSync(target, 'utf8');
if (!old.includes('<!-- SEO-MENU:START -->') || !old.includes('<!-- SEO-MENU:END -->')) throw Error('SEO menu markers not found');
const next = old.replace(/<!-- SEO-MENU:START -->[\s\S]*?<!-- SEO-MENU:END -->/, markup);
if (process.argv.includes('--check')) {
    if (next.replace(/\r\n/g, '\n') !== old.replace(/\r\n/g, '\n')) throw Error('Static menu is stale: run node scripts/build-menu-seo.cjs');
    console.log(`Static menu matches all ${catalog.length} catalog items in ${groups.size} categories.`);
} else {
    fs.writeFileSync(target, next.replace(/\r?\n/g, '\r\n'));
    console.log(`Generated ${catalog.length} crawlable catalog links from pizzaJson.js.`);
}
