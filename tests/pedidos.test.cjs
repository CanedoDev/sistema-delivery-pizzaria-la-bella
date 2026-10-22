// Run from the project: node --test tests/pedidos.test.cjs
// Runs the real catalog, combo engine, cart renderer and checkout callback.
// DOM/animations are simulated; window.open is intercepted and never navigates.
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/cardapio.js'), 'utf8').replace(/\r\n/g, '\n');
const reports = [];
function extract(name) {
    const start = source.indexOf('const ' + name + ' =');
    assert.ok(start >= 0, name);
    const end = source.indexOf('\n}', start);
    assert.ok(end >= 0, name);
    return source.slice(start, end + 2) + ';';
}
function setup(day = 4) {
    const elements = new Map();
    class Element {
        constructor() { this.innerHTML = ''; this.style = {}; this.value = ''; this.listeners = {}; this.classList = { add() {}, remove() {} }; }
        querySelector(key) { if (!this.children) this.children = new Map(); if (!this.children.has(key)) this.children.set(key, new Element()); return this.children.get(key); }
        querySelectorAll() { return []; }
        cloneNode() { return new Element(); }
        addEventListener(event, fn) { this.listeners[event] = fn; }
        append(item) { (this.items ||= []).push(item); }
        focus() {}
    }
    const get = key => { if (!elements.has(key)) elements.set(key, new Element()); return elements.get(key); };
    const opened = [];
    const alerts = [];
    const ctx = vm.createContext({ console, document: { querySelector: get, querySelectorAll: () => [], addEventListener() {} }, window: { open: url => opened.push(url), isFeriadoOuVespera: () => false }, setTimeout: () => {}, alert: text => alerts.push(text), day });
    const run = code => vm.runInContext(code, ctx);
    run(fs.readFileSync(path.join(root, 'js/pizzaJson.js'), 'utf8'));
    run(`let cart=[]; let pizzaPromoQuartaUm=[2,6,4,5,7,8,11,14,15,20,24]; let pizzaPromoQuartaDois=[26,39,29,32,42]; const getPromocaoStatus=()=>({quartaFeira:day===3}); const seleciona=s=>document.querySelector(s); const selecionaTodos=()=>[]; const formatoReal=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); const arredondarMoeda=v=>Math.round((v+Number.EPSILON)*100)/100; const mostrarCarrinho=()=>{}; const fecharModalMeioAMeio=()=>{}; const fecharCheckout=()=>{}; const mostrarPopupAvisoPromo=()=>{}; const tamanhosMeio=[{key:'M'},{key:'G'},{key:'S'},{key:'MX'}]; let meioState={};`);
    run(fs.readFileSync(path.join(root, 'js/combos.js'), 'utf8'));
    run('window.TESTE_DIA_SEMANA=day;');
    // Category configuration used by the real half-and-half adder.
    const configStart = source.indexOf('const CONFIG_MEIO =');
    const configEnd = source.indexOf('\n};', configStart);
    run(source.slice(configStart, configEnd + 3));
    for (const name of ['nomeBebidaPedido','formatarMensagemPedido','capturarDadosDoPedido','atualizarCarrinho','obterPrecoPizzaNoTamanho','adicionarMeioAoCarrinho','configurarCheckout']) run(extract(name));
    const data = {nome:'Cliente Teste', telefone:'24999990000', endereco:'Rua de Teste', numero:'10', bairro:'Centro', tipo:'Casa', complemento:'Portão azul', pagamento:'Pix'};
    ctx.dadosTeste = data;
    const add = (id,size,qt=1,extra={}) => {
        ctx.extra = extra;
        run(`{const p=pizzaJson.find(p=>p.id===${id}); const si=p.category==='Bebidas'?p.sizes.indexOf('${size}'):({M:0,G:1,S:2,MX:3}['${size}']); cart.push({identificador:'item_'+cart.length,id:p.id,size:'${size}',sizeIndex:si,qt:${qt},price:p.price[si],...extra});}`);
    };
    const half = (id1,id2,size,qt=1,tipo='salgada') => run(`meioState={sabor1:pizzaJson.find(p=>p.id===${id1}),sabor2:pizzaJson.find(p=>p.id===${id2}),sizeIndex:{M:0,G:1,S:2,MX:3}['${size}'],sizeKey:'${size}',sizeName:{M:'Média (30 cm)',G:'Grande (35 cm)',S:'Super (40 cm)',MX:'Max (45 cm)'}['${size}'],qt:${qt},tipo:'${tipo}'}; adicionarMeioAoCarrinho();`);
    const combo = (id,ids,qt=1) => {
        ctx.ids = ids;
        run(`{const combo=combosJson.find(c=>c.id===${id}); const pizzas=combo.rules.pizzas.map((r,i)=>{const p=pizzaJson.find(p=>p.id===ids[i]);return {id:p.id,name:p.name,size:r.size,sizeName:r.sizeName,price:p.price[r.sizeIndex]};}); const drinks=combo.rules.drinks.map(d=>({name:d.name,size:d.size,price:d.estimatedPrice})); const original=pizzas.reduce((t,p)=>t+p.price,0)+drinks.reduce((t,d)=>t+d.price,0); cart.push({identificador:'combo_'+cart.length,isCombo:true,comboId:combo.id,name:combo.name,pizzas,drinks,price:combo.price,originalPrice:original,discount:Math.max(0,original-combo.price),qt:${qt}});}`);
    };
    const verify = (name,expected,required=[]) => {
        run('atualizarCarrinho();');
        const pedido = JSON.parse(run('JSON.stringify(capturarDadosDoPedido())'));
        assert.equal(pedido.total,expected);
        const message = run('formatarMensagemPedido(capturarDadosDoPedido(),dadosTeste)');
        assert.doesNotMatch(message,/\bnull\b|\bundefined\b|NaN/);
        assert.ok(message.includes(run(`formatoReal(${expected})`)));
        assert.equal(get('.total span:last-child').innerHTML,run(`formatoReal(${expected})`));
        for (const text of required) assert.ok(message.includes(text), text + '\n' + message);
        assert.equal(decodeURIComponent(encodeURIComponent(message)),message);
        assert.equal(opened.length,0);
        reports.push({name,pedido,message});
        return {pedido,message};
    };
    return {run,add,half,combo,verify,get,opened,alerts};
}
test('01 — pizza normal média',()=>{const s=setup();s.add(1,'M');s.verify('Pizza média',54.90,['Muçarela']);});
test('02 — quantidades e centavos com bebida Zero',()=>{const s=setup();s.add(1,'M',3);s.add(69,'600ml',2,{customName:'Coca-Cola Zero'});s.verify('3 pizzas + 2 bebidas',180.70,['3x Muçarela','2x Coca-Cola Zero']);});
test('03 — meio a meio cobra o sabor mais caro',()=>{const s=setup();s.half(1,26,'G',2);s.verify('Meio a meio salgada x2',153.80,['½ Muçarela + ½ À Moda do Cheff']);});
test('04 — meio a meio doce',()=>{const s=setup();s.half(53,57,'M',1,'doce');s.verify('Meio a meio doce',49.90,['½ Brigadeiro + ½ Festa']);});
test('05 — gourmet usa o preço grande apesar do índice 1',()=>{const s=setup();s.half(60,64,'G',1,'gourmet');s.verify('Meio a meio gourmet',104.90,['½ Abobrinha Natural + ½ Margherita de Sevóia']);});
test('06 — Super com brinde inválido recebe descrição válida',()=>{const s=setup();s.get('.meioInfo--refriSelect').value='null';s.half(1,2,'S',2);s.verify('Meio a meio Super + brinde',173.80,['Brinde: 2x Guaraná Antarctica 2L']);});
test('07 — combo 01 composição e preço fixo',()=>{const s=setup();s.combo(101,[26,57]);s.verify('Combo 01',134.90,['Pizza: À Moda do Cheff — Super','Pizza: Festa — Média','Bebida inclusa: Refri ou Mate 1.5L']);});
test('08 — combo 02 quantidade dois',()=>{const s=setup();s.combo(102,[26,39],2);s.verify('Combo 02 x2',265.80,['Composição acima por combo.','Preço unitário:']);});
test('09 — combo com pizza avulsa e bebida',()=>{const s=setup();s.combo(101,[26,57]);s.add(1,'G');s.add(69,'2L',1,{customName:'Coca-Cola Zero'});s.verify('Combo + pizza + bebida',214.80,['Coca-Cola Zero (2L)','Muçarela (G)']);});
test('10 — combo com meio a meio preserva os dois sabores',()=>{const s=setup();s.combo(102,[26,39]);s.half(1,26,'M');s.verify('Combo + meio a meio',201.80,['½ Muçarela + ½ À Moda do Cheff']);});
test('11 — quarta aplica um único desconto para duas pizzas',()=>{const s=setup(3);s.add(2,'G',2);const r=s.verify('Quarta quantidade dois',129.80,['Desconto aplicado:']);assert.equal(r.pedido.desconto,10);assert.equal(r.pedido.itens[0].totalPizza-r.pedido.itens[0].desconto,129.8);});
test('12 — quarta não desconta meio a meio nem rouba desconto da avulsa',()=>{const s=setup(3);s.half(2,26,'G');s.add(26,'G');s.verify('Quarta meio a meio + avulsa',142.80);});
test('13 — terça converte duas avulsas em combo sem duplicar detalhes',()=>{const s=setup(2);s.add(2,'G',2);const r=s.verify('Terça duas grandes',129.90);assert.equal(r.pedido.itens.length,1);assert.ok(r.pedido.itens[0].isCombo);assert.equal((r.message.match(/Pizza: Atum/g)||[]).length,2);});
test('14 — conversão automática preserva variante e volume da bebida',()=>{const s=setup();s.add(2,'G',2);s.add(69,'1.5L',1,{customName:'Coca-Cola Zero'});const r=s.verify('Combo automático com Coca Zero',132.90,['Bebida inclusa: Coca-Cola Zero 1.5L']);assert.equal(r.pedido.itens.length,1);});
test('15 — sem bebida não inventa combo nem bebida',()=>{const s=setup();s.add(26,'G',2);const r=s.verify('Duas grandes sem bebida',153.80);assert.equal(r.pedido.itens[0].isCombo,false);assert.doesNotMatch(r.message,/Bebida inclusa/);});
test('16 — terça preserva meio a meio em vez de converter pelo primeiro sabor',()=>{const s=setup(2);s.half(1,26,'G',2);const r=s.verify('Terça meio a meio x2',153.80,['½ Muçarela + ½ À Moda do Cheff']);assert.ok(r.pedido.itens[0].isMeioAMeio);});
test('17 — checkout real: campos obrigatórios e URL interceptada, sem abrir WhatsApp',()=>{
    const s=setup();s.combo(101,[26,57]);s.add(1,'M');
    s.run('configurarCheckout()');
    const confirm=s.get('.checkoutInfo--confirmButton').listeners.click;
    confirm();assert.equal(s.alerts.length,1);assert.equal(s.opened.length,0);
    const values={nome:'Cliente Teste',telefone:'24999990000',endereco:'Rua de Teste',numero:'10',bairro:'Centro','tipo-residencia':'Casa',complemento:'Portão azul',pagamento:'Pix'};
    for(const [id,value] of Object.entries(values))s.get('#checkout-'+id).value=value;
    const r=s.verify('Checkout real combo + pizza',189.80,['Complemento: Portão azul']);
    confirm();assert.equal(s.opened.length,1);
    const url=new URL(s.opened[0]);assert.equal(url.hostname,'wa.me');assert.equal(url.searchParams.get('text'),r.message);
    assert.equal(s.run('cart.length'),0);
});

test('18 — duas Tradicionais sem bebida não viram o Combo 02',()=>{const s=setup();s.add(2,'G',2);const r=s.verify('Tradicionais sem bebida',139.80);assert.equal(r.pedido.itens[0].isCombo,false);});
test('19 — bebida 600ml não satisfaz combo 1.5L',()=>{const s=setup();s.add(2,'G',2);s.add(69,'600ml');const r=s.verify('Volume incompatível',147.80);assert.equal(r.pedido.itens.some(i=>i.isCombo),false);});
test('20 — combo automático 01 exige Super, doce média e bebida 1.5L',()=>{const s=setup();s.add(2,'S');s.add(57,'M');s.add(74,'1.5L',1,{customName:'Mate Leão Limão'});const r=s.verify('Combo 01 automático',134.90,['Mate Leão Limão 1.5L']);assert.equal(r.pedido.itens[0].comboId,101);});
test('21 — quarta: combo fixo e pizza avulsa com desconto próprio',()=>{const s=setup(3);s.add(2,'G',3);s.add(69,'1.5L',1,{customName:'Coca-Cola Zero'});const r=s.verify('Combo + avulsa na quarta',192.80);const combo=r.pedido.itens.find(i=>i.isCombo);const avulsa=r.pedido.itens.find(i=>!i.isCombo);assert.equal(combo.totalPizza,132.90);assert.equal(avulsa.desconto,10);assert.equal(avulsa.totalPizza,69.90);});
test('22 — promoção não é substituída por combo mais caro',()=>{const s=setup(3);s.add(2,'G',2);s.add(74,'1.5L');s.run('combosJson[1].price=145');const r=s.verify('Avulsas promocionais mais baratas',139.80);assert.equal(r.pedido.itens.some(i=>i.isCombo),false);});
test('23 — opções incluem sabores e versões reais do catálogo',()=>{const s=setup();const options=JSON.parse(s.run('JSON.stringify(obterOpcoesBebidaCombo({size:"1.5L"}))'));for(const name of ['Coca-Cola Zero','Pepsi Black','Guaraná Antarctica Zero','Mate Leão Limão','Mate Leão Natural'])assert.ok(options.some(o=>o.name===name));assert.ok(options.every(o=>o.size==='1.5L'&&o.price>0));});
test('24 — quatro pizzas e duas bebidas geram dois combos sem sobras',()=>{const s=setup();s.add(2,'G',4);s.add(69,'1.5L',2,{customName:'Coca-Cola Zero'});const r=s.verify('Dois combos automáticos',265.80);assert.equal(r.pedido.itens.length,2);assert.ok(r.pedido.itens.every(i=>i.isCombo&&i.quantidade===1));});
test('25 — preço sem economia não mostra valor riscado nem badge',()=>{const s=setup();const body=s.get('.comboWindowBody');body.querySelectorAll=()=>[{selectedIndex:0,options:[{getAttribute:()=> '131.80'}]}];s.run('comboAtualModal=combosJson[0]; atualizarResumoPrecoCombo();');assert.equal(s.get('.comboOriginalPrice').hidden,true);assert.equal(s.get('.comboSavingsBadge').hidden,true);});
test('26 — economia positiva é calculada pelos itens selecionados',()=>{const s=setup();const body=s.get('.comboWindowBody');body.querySelectorAll=()=>[86.90,49.90,12].map(value=>({selectedIndex:0,options:[{getAttribute:()=>String(value)}]}));s.run('comboAtualModal=combosJson[0]; atualizarResumoPrecoCombo();');assert.equal(s.get('.comboOriginalPrice').hidden,false);assert.equal(s.get('.comboSavingsBadge').hidden,false);assert.ok(s.get('.comboSavingsBadge').innerHTML.includes('13,90'));});

after(()=>{
    const lines=['# Validação de pedidos — La Bella', '', 'Execução: node --test tests/pedidos.test.cjs', '', 'Catálogo e funções reais do projeto. DOM e animações simulados. O checkout foi executado com window.open interceptado; nenhuma navegação ou envio ao WhatsApp.', '', '| Cenário | Subtotal | Desconto | Total dos itens |','|---|---:|---:|---:|'];
    for(const r of reports) lines.push(`| ${r.name} | ${r.pedido.subtotal.toFixed(2)} | ${r.pedido.desconto.toFixed(2)} | ${r.pedido.total.toFixed(2)} |`);
    for(const r of reports)lines.push('', '## '+r.name, '', '```text',r.message,'```');
    fs.mkdirSync(path.join(root,'docs'),{recursive:true});
    fs.writeFileSync(path.join(root,'docs/qa-pedidos.md'),lines.join('\n')+'\n');
});
