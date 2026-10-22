const seleciona = (elemento) => document.querySelector(elemento)
const selecionaTodos = (elemento) => document.querySelectorAll(elemento)

let modalKey = 0

let quantPizzas = 1

let cart = []

let pizzaPromoQuartaUm = [2, 6, 4, 5, 7, 8, 11, 14, 15, 20, 24]
let pizzaPromoQuartaDois = [26, 39, 29, 32, 42]

let termoAtual = ''

let categoriaAtual = 'all'

const formatoReal = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const formatoMonetario = (valor) => {
    if (valor) {
        return valor.toFixed(2)
    }
}

const feriadosCache = {};

function calcularPascoa(ano) {
    const a = ano % 19;
    const b = Math.floor(ano / 100);
    const c = ano % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31);
    const dia = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(ano, mes - 1, dia);
}

function getFeriadosPetropolis() {
    return ['16/03', '29/06'];
}

function getFeriadosFallbackAno(ano) {
    const feriados = [];
    const fmt = (d, m) => String(d).padStart(2, '0') + '/' + String(m).padStart(2, '0');

    feriados.push(fmt(1, 1));
    feriados.push(fmt(21, 4));
    feriados.push(fmt(1, 5));
    feriados.push(fmt(7, 9));
    feriados.push(fmt(12, 10));
    feriados.push(fmt(2, 11));
    feriados.push(fmt(15, 11));
    feriados.push(fmt(20, 11));
    feriados.push(fmt(25, 12));

    feriados.push(...getFeriadosPetropolis());

    const pascoa = calcularPascoa(ano);

    const carnavalSeg = new Date(pascoa);
    carnavalSeg.setDate(pascoa.getDate() - 48);
    feriados.push(fmt(carnavalSeg.getDate(), carnavalSeg.getMonth() + 1));

    const carnavalTer = new Date(pascoa);
    carnavalTer.setDate(pascoa.getDate() - 47);
    feriados.push(fmt(carnavalTer.getDate(), carnavalTer.getMonth() + 1));

    const sextaSanta = new Date(pascoa);
    sextaSanta.setDate(pascoa.getDate() - 2);
    feriados.push(fmt(sextaSanta.getDate(), sextaSanta.getMonth() + 1));

    feriados.push(fmt(pascoa.getDate(), pascoa.getMonth() + 1));

    const corpusChristi = new Date(pascoa);
    corpusChristi.setDate(pascoa.getDate() + 60);
    feriados.push(fmt(corpusChristi.getDate(), corpusChristi.getMonth() + 1));

    return Array.from(new Set(feriados));
}

async function sincronizarFeriadosBrasilAPI(ano) {
    if (!ano) ano = new Date().getFullYear();
    const cacheKey = `feriados_brasilapi_${ano}`;

    try {
        const cacheLocal = localStorage.getItem(cacheKey);
        if (cacheLocal) {
            feriadosCache[ano] = JSON.parse(cacheLocal);
        }
    } catch (e) {}

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const dados = await response.json();
            const feriadosFormatados = dados.map(item => {
                const parts = item.date.split('-');
                return parts[2] + '/' + parts[1];
            });

            getFeriadosPetropolis().forEach(f => {
                if (!feriadosFormatados.includes(f)) feriadosFormatados.push(f);
            });

            feriadosCache[ano] = feriadosFormatados;
            try {
                localStorage.setItem(cacheKey, JSON.stringify(feriadosFormatados));
            } catch (e) {}
            return feriadosFormatados;
        }
    } catch (err) {
        console.warn(`[La Bella Pizza] BrasilAPI offline/timeout para ${ano}. Utilizando fallback algorítmico perpétuo.`, err);
    }

    return getFeriadosAno(ano);
}

function getFeriadosAno(ano) {
    if (feriadosCache[ano] && feriadosCache[ano].length > 0) {
        return feriadosCache[ano];
    }

    try {
        const cacheLocal = localStorage.getItem(`feriados_brasilapi_${ano}`);
        if (cacheLocal) {
            feriadosCache[ano] = JSON.parse(cacheLocal);
            return feriadosCache[ano];
        }
    } catch (e) {}

    return getFeriadosFallbackAno(ano);
}

(function initFeriados() {
    const runSync = () => {
        const anoAtual = new Date().getFullYear();
        sincronizarFeriadosBrasilAPI(anoAtual);
    };
    if (typeof window !== 'undefined') {
        window.addEventListener('load', () => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(runSync, { timeout: 3000 });
            } else {
                setTimeout(runSync, 2500);
            }
        });
    } else {
        runSync();
    }
})();

function isFeriadoOuVespera(dateObj) {
    const data = dateObj || new Date();
    const ano = data.getFullYear();
    const feriados = getFeriadosAno(ano);
    const fmt = (dia, m) => String(dia).padStart(2, '0') + '/' + String(m).padStart(2, '0');

    const diaHoje = fmt(data.getDate(), data.getMonth() + 1);
    if (feriados.includes(diaHoje)) {
        return true;
    }

    const amanha = new Date(data);
    amanha.setDate(data.getDate() + 1);
    const feriadosAmanha = (amanha.getFullYear() === ano) ? feriados : getFeriadosAno(amanha.getFullYear());
    const diaAmanha = fmt(amanha.getDate(), amanha.getMonth() + 1);

    return feriadosAmanha.includes(diaAmanha);
}

const getPromocaoStatus = () => {
    const agora = typeof getDiaAtualData === 'function' ? getDiaAtualData() : new Date();
    const ehFeriadoOuVespera = isFeriadoOuVespera(agora);
    const diaDaSemana = typeof getDiaAtual === 'function' ? getDiaAtual() : agora.getDay();
    return {
        diaDaSemana,
        ehFeriadoOuVespera,
        tercaFeira: (diaDaSemana === 2) && !ehFeriadoOuVespera,
        quartaFeira: (diaDaSemana === 3) && !ehFeriadoOuVespera
    };
};

window.isFeriadoOuVespera = isFeriadoOuVespera;
window.getPromocaoStatus = getPromocaoStatus;
window.sincronizarFeriadosBrasilAPI = sincronizarFeriadosBrasilAPI;

let modalStack = [];
let ignorarProximoPopstate = false;

window.pushModalState = (tipoModal) => {
    if (modalStack[modalStack.length - 1] !== tipoModal) {
        history.pushState({ modalOpen: tipoModal }, '');
        modalStack.push(tipoModal);
    }
};

window.popModalState = (tipoModal) => {
    const idx = modalStack.lastIndexOf(tipoModal);
    if (idx > -1) {
        modalStack.splice(idx, 1);
        ignorarProximoPopstate = true;
        history.back();
    }
};

window.addEventListener('popstate', () => {
    if (ignorarProximoPopstate) {
        ignorarProximoPopstate = false;
        return;
    }

    const flavorArea = document.querySelector('.flavorPickerWindowArea');
    const meioArea = document.querySelector('.meioWindowArea');
    const checkoutArea = document.querySelector('.checkoutWindowArea');
    const comboArea = document.querySelector('.comboWindowArea');
    const pizzaArea = document.querySelector('.pizzaWindowArea');
    const cartAside = document.querySelector('aside');

    if (flavorArea && flavorArea.style.display === 'flex') {
        modalStack = modalStack.filter(m => m !== 'flavorPicker');
        if (typeof fecharFlavorPicker === 'function') fecharFlavorPicker(false);
        return;
    }

    if (meioArea && meioArea.style.display === 'flex') {
        modalStack = modalStack.filter(m => m !== 'meio');
        if (typeof fecharModalMeioAMeio === 'function') fecharModalMeioAMeio(false);
        return;
    }

    if (checkoutArea && checkoutArea.style.display === 'flex' && checkoutArea.style.opacity !== '0') {
        modalStack = modalStack.filter(m => m !== 'checkout');
        fecharCheckout(false);
        setTimeout(() => {
            mostrarCarrinho();
        }, 300);
        return;
    }

    if (comboArea && comboArea.style.display === 'flex') {
        modalStack = modalStack.filter(m => m !== 'combo');
        if (typeof fecharModalCombo === 'function') fecharModalCombo(false);
        return;
    }

    if (pizzaArea && pizzaArea.style.display === 'flex') {
        modalStack = modalStack.filter(m => m !== 'pizza');
        fecharModal(false);
        return;
    }

    if (cartAside && cartAside.classList.contains('show')) {
        modalStack = modalStack.filter(m => m !== 'cart');
        esconderCarrinho(false);
        return;
    }
});

const abrirModal = () => {
    const area = seleciona('.pizzaWindowArea');
    const body = seleciona('.pizzaWindowBody');

    area.style.display = 'flex';

    gsap.to(area, { opacity: 1, duration: 0.3 });

    gsap.fromTo(body,
        { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.9, ease: "elastic.out(1, 0.4)" }
    );

    window.pushModalState('pizza');
}

const fecharModal = (syncHistory = true) => {
    const area = seleciona('.pizzaWindowArea');
    const body = seleciona('.pizzaWindowBody');

    gsap.to(body, {
        scale: 0.8,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in"
    });

    gsap.to(area, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            area.style.display = 'none';
        }
    });

    if (syncHistory) {
        window.popModalState('pizza');
    }
}

const botoesFechar = () => {
    selecionaTodos('.pizzaInfo--cancelButton, .pizzaInfo--cancelMobileButton').forEach((item) => {
        item.addEventListener('click', fecharModal)
    })

    const pizzaArea = seleciona('.pizzaWindowArea')
    if (pizzaArea) {
        pizzaArea.addEventListener('click', (e) => {
            if (e.target.classList.contains('pizzaWindowArea')) {
                fecharModal()
            }
        })
    }

    selecionaTodos('.comboInfo--cancelButton, .combo--cancelButton, .comboInfo--cancelMobileButton').forEach((item) => {
        item.addEventListener('click', () => {
            if (typeof fecharModalCombo === 'function') fecharModalCombo()
        })
    })

    const comboArea = seleciona('.comboWindowArea')
    if (comboArea) {
        comboArea.addEventListener('click', (e) => {
            if (e.target.classList.contains('comboWindowArea')) {
                if (typeof fecharModalCombo === 'function') fecharModalCombo()
            }
        })
    }

    const btnAddCombo = seleciona('.comboInfo--addButton, .combo--addButton')
    if (btnAddCombo) {
        btnAddCombo.onclick = () => {
            if (typeof confirmarAdicaoCombo === 'function') confirmarAdicaoCombo()
        }
    }

    selecionaTodos('.meioInfo--cancelButton, .meioInfo--cancelMobileButton').forEach((item) => {
        item.addEventListener('click', () => {
            if (typeof fecharModalMeioAMeio === 'function') fecharModalMeioAMeio()
        })
    })

    const meioArea = seleciona('.meioWindowArea')
    if (meioArea) {
        meioArea.addEventListener('click', (e) => {
            if (e.target.classList.contains('meioWindowArea')) {
                if (typeof fecharModalMeioAMeio === 'function') fecharModalMeioAMeio()
            }
        })
    }

    selecionaTodos('.flavorPickerCloseBtn, .flavorPickerBackBtn').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (typeof fecharFlavorPicker === 'function') fecharFlavorPicker()
        })
    })

    const flavorArea = seleciona('.flavorPickerWindowArea')
    if (flavorArea) {
        flavorArea.addEventListener('click', (e) => {
            if (e.target.classList.contains('flavorPickerWindowArea')) {
                if (typeof fecharFlavorPicker === 'function') fecharFlavorPicker()
            }
        })
    }
}

const formatarTituloCard = (nome) => {
    if (!nome) return '';
    if (nome.includes(' - ')) {
        const parts = nome.split(' - ');
        return `<span class="card-title-name">${parts[0]}</span><span class="card-title-details">- ${parts.slice(1).join(' - ')}</span>`;
    }
    if (nome.includes(' (')) {
        const idx = nome.indexOf(' (');
        const main = nome.substring(0, idx);
        const details = nome.substring(idx + 1);
        return `<span class="card-title-name">${main}</span><span class="card-title-details">${details}</span>`;
    }
    return nome;
};

const preencheDadosPizza = (pizzaItem, item, index) => {
    pizzaItem.setAttribute('data-key', index);
    const pizzaImg = pizzaItem.querySelector(".card-pizza-img");
    const mobImg = item.img.replace('.webp', '-mob.webp');
    pizzaImg.srcset = `${mobImg} 480w, ${item.img} 706w`;
    pizzaImg.sizes = "(max-width: 768px) 120px, 200px";
    pizzaImg.src = mobImg;
    pizzaImg.alt = `Pizza ${item.name} artesanal`;
    pizzaImg.loading = "lazy";
    pizzaImg.decoding = "async";
    pizzaImg.width = 140;
    pizzaImg.height = 93;
    pizzaItem.querySelector(".card-title").innerHTML = formatarTituloCard(item.name);
    pizzaItem.querySelector(".card-price").innerHTML = `R$ ${item.price[0].toFixed(2).replace('.', ',')}`;
}

const preencherDadosModal = (item) => {
    seleciona('.pizzaBig img').src = item.img
    if (item.name && item.name.includes(' - ')) {
        const parts = item.name.split(' - ');
        seleciona('.pizzaInfo h1').innerHTML = `<span class="pizza-title-name">${parts[0]}</span><span class="pizza-title-details">- ${parts.slice(1).join(' - ')}</span>`;
    } else if (item.name && item.name.includes(' (')) {
        const idx = item.name.indexOf(' (');
        const main = item.name.substring(0, idx);
        const details = item.name.substring(idx + 1);
        seleciona('.pizzaInfo h1').innerHTML = `<span class="pizza-title-name">${main}</span><span class="pizza-title-details">${details}</span>`;
    } else {
        seleciona('.pizzaInfo h1').innerHTML = item.name;
    }
    seleciona('.pizzaInfo--desc').innerHTML = item.description
    seleciona('.pizzaInfo--actualPrice').innerHTML = formatoReal(item.price[0])

    let tagText = 'TRADICIONAL'
    let tagClass = 'tag-tradicional'
    if (item.category === 'Pizzas Especiais') {
        tagText = 'ESPECIAL'
        tagClass = 'tag-especial'
    } else if (item.category === 'Pizzas Doces') {
        tagText = 'DOCE'
        tagClass = 'tag-doce'
    } else if (item.category === 'Pizzas Gourmet') {
        tagText = 'GOURMET'
        tagClass = 'tag-gourmet'
    } else if (item.category === 'Bebidas') {
        tagText = 'BEBIDA GELADA'
        tagClass = 'tag-bebida'
    }

    const tagEl = seleciona('.pizzaTag')
    if (tagEl) {
        tagEl.innerText = tagText
        tagEl.className = `pizzaTag ${tagClass}`
    }
}

const pegarKey = (e) => {

    let key = e.target.closest('.card').getAttribute('data-key')

    quantPizzas = 1

    modalKey = key

    return key
}

const atualizarBonusRefri = () => {
    const bonusRefriEl = seleciona('.pizzaInfo--bonusRefri')
    const selectedSize = seleciona('.pizzaInfo--size.selected')
    if (!bonusRefriEl) return
    const currentItem = pizzaJson[modalKey]
    if (currentItem && currentItem.category === 'Bebidas') {
        bonusRefriEl.style.display = 'none'
        return
    }
    const key = selectedSize ? selectedSize.getAttribute('data-key') : ''
    if (key === 'S' || key === 'MX') {
        bonusRefriEl.style.display = 'flex'
    } else {
        bonusRefriEl.style.display = 'none'
    }
}

const preencherTiposBebida = (key) => {
    const typeArea = seleciona('.pizzaInfo--typearea');
    if (!typeArea) return;
    const typesContainer = typeArea.querySelector('.pizzaInfo--types');
    const item = pizzaJson[key];

    if (item && item.types && item.types.length > 0) {
        typeArea.style.display = 'block';
        typesContainer.innerHTML = '';
        item.types.forEach((type, index) => {
            const typeDiv = document.createElement('div');
            typeDiv.className = `pizzaInfo--type ${index === 0 ? 'selected' : ''}`;
            typeDiv.setAttribute('data-type', type);
            let label = type;
            if (type === 'Comum') label = 'Comum';
            else if (type === 'Zero') label = 'Zero Açúcar';
            else if (type === 'Black') label = 'Black';
            typeDiv.innerText = label;
            typeDiv.addEventListener('click', () => {
                typesContainer.querySelectorAll('.pizzaInfo--type').forEach(t => t.classList.remove('selected'));
                typeDiv.classList.add('selected');
                ajustarTamanhosPorTipo(key);
            });
            typesContainer.appendChild(typeDiv);
        });
    } else {
        typeArea.style.display = 'none';
        typesContainer.innerHTML = '';
    }
};

const ajustarTamanhosPorTipo = (key) => {
    const item = pizzaJson[key];
    if (!item) return;

    const selectedTypeEl = seleciona('.pizzaInfo--type.selected');
    const selectedType = selectedTypeEl ? selectedTypeEl.getAttribute('data-type') : null;

    let availableSizes = item.sizes;
    if (item.typeRules && selectedType && item.typeRules[selectedType]) {
        availableSizes = item.typeRules[selectedType].sizes;
    }

    const allSizes = selecionaTodos('.pizzaInfo--size');
    allSizes.forEach((sizeEl, sIdx) => {
        if (availableSizes && availableSizes[sIdx]) {
            sizeEl.style.display = 'block';
            sizeEl.innerHTML = availableSizes[sIdx];
        } else {
            sizeEl.style.display = 'none';
        }
    });

    const currentSelected = seleciona('.pizzaInfo--size.selected');
    if (!currentSelected || currentSelected.style.display === 'none') {
        const firstVisible = [...allSizes].find(s => s.style.display !== 'none');
        if (firstVisible) firstVisible.classList.add('selected');
    }

    atualizaPreco();
};

const obterInfoTamanho = (str) => {
    if (!str) return { key: 'G', label: 'GRANDE', name: 'Grande' };
    const s = str.toLowerCase();
    if (s.includes('grande') || s.includes('35')) {
        return { key: 'G', label: 'GRANDE', name: 'Grande' };
    }
    if (s.includes('média') || s.includes('media') || s.includes('30')) {
        return { key: 'M', label: 'MÉDIA', name: 'Média' };
    }
    if (s.includes('super') || s.includes('40')) {
        return { key: 'S', label: 'SUPER', name: 'Super' };
    }
    if (s.includes('max') || s.includes('45')) {
        return { key: 'MX', label: 'MAX', name: 'Max' };
    }
    return { key: 'G', label: 'GRANDE', name: 'Grande' };
};

const preencherTamanhos = (key) => {
    let currentSelected = seleciona('.pizzaInfo--size.selected');
    if (currentSelected) currentSelected.classList.remove('selected');

    const item = pizzaJson[key];
    const isBebida = item && item.category === 'Bebidas';

    const sectorEl = seleciona('.pizzaInfo--sizearea .pizzaInfo--sector');
    if (sectorEl) sectorEl.innerText = isBebida ? 'Volume' : 'Tamanho';

    const selectedTypeEl = seleciona('.pizzaInfo--type.selected');
    const selectedType = (isBebida && selectedTypeEl) ? selectedTypeEl.getAttribute('data-type') : null;

    let availableSizes = item ? item.sizes : [];
    if (item && item.typeRules && selectedType && item.typeRules[selectedType]) {
        availableSizes = item.typeRules[selectedType].sizes;
    }

    selecionaTodos('.pizzaInfo--size').forEach((size, sizeIndex) => {
        if (availableSizes && availableSizes[sizeIndex]) {
            size.style.display = 'block';
            if (isBebida) {
                size.setAttribute('data-key', availableSizes[sizeIndex]);
                size.innerHTML = availableSizes[sizeIndex];
            } else {
                const info = obterInfoTamanho(availableSizes[sizeIndex]);
                size.setAttribute('data-key', info.key);
                size.innerHTML = `${info.label} <span>${availableSizes[sizeIndex]}</span>`;
            }
        } else {
            size.style.display = 'none';
        }
    });

    let allSizes = selecionaTodos('.pizzaInfo--size');
    const grandeBtn = [...allSizes].find(s => s.style.display !== 'none' && s.getAttribute('data-key') === 'G');
    if (grandeBtn) {
        grandeBtn.classList.add('selected');
    } else {
        const firstVisible = [...allSizes].find(s => s.style.display !== 'none');
        if (firstVisible) firstVisible.classList.add('selected');
        else if (allSizes[0]) allSizes[0].classList.add('selected');
    }

    atualizarBonusRefri();
    atualizaPreco();
};

const atualizaPreco = () => {
    const item = pizzaJson[modalKey];
    if (!item) return;

    let sizeIndex = [...selecionaTodos('.pizzaInfo--size')].findIndex(size => size.classList.contains('selected'))
    if (sizeIndex === -1) sizeIndex = 0;

    let precoOriginal = item.price[sizeIndex] !== undefined ? item.price[sizeIndex] : item.price[0];

    const selectedTypeEl = seleciona('.pizzaInfo--type.selected');
    const selectedType = selectedTypeEl ? selectedTypeEl.getAttribute('data-type') : null;
    if (item.typeRules && selectedType && item.typeRules[selectedType]) {
        precoOriginal = item.typeRules[selectedType].price[sizeIndex] !== undefined
            ? item.typeRules[selectedType].price[sizeIndex]
            : item.typeRules[selectedType].price[0];
    }

    const { quartaFeira } = getPromocaoStatus()
    let descontoPromo = 0

    if (quartaFeira && sizeIndex === 1) {
        if (pizzaPromoQuartaUm.includes(item.id)) {
            descontoPromo = 10
        } else if (pizzaPromoQuartaDois.includes(item.id)) {
            descontoPromo = 11
        }
    }

    let total = Math.max(0, (precoOriginal * quantPizzas) - descontoPromo)

    seleciona('.pizzaInfo--actualPrice').innerHTML = formatoReal(total)
}

const escolherTamanho = (key) => {
    selecionaTodos('.pizzaInfo--size').forEach((size, sizeIndex) => {
        size.addEventListener('click', (e) => {
            seleciona('.pizzaInfo--size.selected').classList.remove('selected')

            size.classList.add('selected')

            atualizarBonusRefri()
            atualizaPreco()
        })
    })
}

const mudarQuantidadeModal = () => {

    seleciona('.pizzaInfo--qtmais').addEventListener('click', () => {
        quantPizzas++
        seleciona('.pizzaInfo--qt').innerHTML = quantPizzas
        atualizaPreco()
    })

    seleciona('.pizzaInfo--qtmenos').addEventListener('click', () => {
        if (quantPizzas > 0) {
            quantPizzas--
            seleciona('.pizzaInfo--qt').innerHTML = quantPizzas
            atualizaPreco()

        }
    })

}

const mostrarCarrinho = (syncHistory = true) => {
    seleciona('aside').classList.add('show');
    if (syncHistory) {
        window.pushModalState('cart');
    }
};

const esconderCarrinho = (syncHistory = true) => {
    seleciona('aside').classList.remove('show');
    if (syncHistory) {
        window.popModalState('cart');
    }
};

const abrirCarrinho = () => {
    if (cart.length > 0) {
        mostrarCarrinho();
    }
    seleciona('.menu-openner').addEventListener('click', () => {
        mostrarCarrinho();
    });
};

const fecharCarrinho = () => {

    seleciona('.menu-closer').addEventListener('click', () => {
        esconderCarrinho();
    });

    document.addEventListener('click', (e) => {
        const carrinhoAberto = seleciona('aside').classList.contains('show');

        if (carrinhoAberto) {
            if (!document.body.contains(e.target)) return;

            const clicouForaDoCarrinho = !e.target.closest('aside');

            const clicouNoBotaoAbrirCarrinho = e.target.closest('.menu-openner');
            const clicouNoAdicionar = e.target.closest('.pizzaInfo--addButton');

            if (clicouForaDoCarrinho && !clicouNoBotaoAbrirCarrinho && !clicouNoAdicionar) {
                esconderCarrinho();
            }
        }
    });

    const pedirMaisBtn = seleciona('.cart--pedirmais');
    if (pedirMaisBtn) {
        pedirMaisBtn.addEventListener('click', () => {
            esconderCarrinho();
        });
    }
};

const mostrarPopupAvisoPromo = () => {
    const popup = seleciona('#promoAlertModal')
    if (popup) {
        popup.style.display = 'flex'
        popup.style.opacity = '1'
    }
}

const configurarPopupAvisoPromo = () => {
    const popup = seleciona('#promoAlertModal')
    const btnClose = seleciona('#promoAlertCloseBtn')
    if (btnClose && popup) {
        btnClose.addEventListener('click', () => {
            popup.style.display = 'none'
        })
    }
    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.style.display = 'none'
            }
        })
    }
}

const adicionarNoCarrinho = () => {
    seleciona('.pizzaInfo--addButton').addEventListener('click', () => {

        const itemAtual = pizzaJson[modalKey];
        const isBebida = itemAtual && itemAtual.category === 'Bebidas';

        let sizeIndex = [...selecionaTodos('.pizzaInfo--size')].findIndex(size => size.classList.contains('selected'));
        if (sizeIndex === -1) sizeIndex = 0;

        const selectedTypeEl = seleciona('.pizzaInfo--type.selected');
        const selectedType = (isBebida && selectedTypeEl) ? selectedTypeEl.getAttribute('data-type') : null;

        let availableSizes = itemAtual.sizes;
        let availablePrices = itemAtual.price;
        if (itemAtual.typeRules && selectedType && itemAtual.typeRules[selectedType]) {
            availableSizes = itemAtual.typeRules[selectedType].sizes;
            availablePrices = itemAtual.typeRules[selectedType].price;
        }

        let size = isBebida
            ? (availableSizes[sizeIndex] || availableSizes[0])
            : seleciona('.pizzaInfo--size.selected').getAttribute('data-key');

        let price = availablePrices[sizeIndex] !== undefined ? availablePrices[sizeIndex] : availablePrices[0];

        let refriEscolhido = null;
        if (!isBebida && (size === 'S' || size === 'MX')) {
            const selectRefriEl = seleciona('.pizzaInfo--refriSelect');
            const refriVal = selectRefriEl && selectRefriEl.value ? selectRefriEl.value.trim() : 'Guaraná Antarctica 2L';
            if (refriVal && refriVal.toLowerCase() !== 'null' && refriVal.toLowerCase() !== 'undefined') {
                refriEscolhido = `${refriVal} (Sujeito a estoque)`;
            } else {
                refriEscolhido = 'Guaraná Antarctica 2L (Sujeito a estoque)';
            }
        }

        let identificador = itemAtual.id + 't' + size + (selectedType ? '_' + selectedType : '') + (refriEscolhido ? '_' + refriEscolhido.replace(/\s+/g, '_') : '');

        let nomeFinalItem = itemAtual.name;
        if (isBebida && itemAtual.baseName) {
            nomeFinalItem = selectedType ? `${itemAtual.baseName} ${selectedType}` : itemAtual.baseName;
        }

        const { quartaFeira } = getPromocaoStatus()
        const ehPromoAtual = quartaFeira && (size === 'G' || sizeIndex === 1) &&
            (pizzaPromoQuartaUm.includes(itemAtual.id) || pizzaPromoQuartaDois.includes(itemAtual.id))

        if (ehPromoAtual) {
            const promoExistente = cart.reduce((acc, it) => {
                const eh = quartaFeira && (it.size === 'G' || it.sizeIndex === 1) &&
                    (pizzaPromoQuartaUm.includes(it.id) || pizzaPromoQuartaDois.includes(it.id))
                return eh ? acc + it.qt : acc
            }, 0)

            if (promoExistente >= 1 || quantPizzas > 1) {
                mostrarPopupAvisoPromo()
            }
        }

        let enderecoDaPizza = cart.findIndex((item) => !item.isCombo && item.identificador == identificador)

        if (enderecoDaPizza > -1) {
            cart[enderecoDaPizza].qt += quantPizzas
        } else {
            let pizzaNoCarrinho = {
                identificador,
                id: itemAtual.id,
                customName: isBebida ? nomeFinalItem : null,
                selectedType: selectedType,
                size: size,
                sizeIndex: sizeIndex,
                qt: quantPizzas,
                price: price,
                refrigerante: refriEscolhido
            }
            cart.push(pizzaNoCarrinho)
        }

        if (typeof detectarEAplicarCombos === 'function') {
            detectarEAplicarCombos(cart)
        }

        fecharModal(false);
        mostrarCarrinho();
        atualizarCarrinho();

    })
}

const atualizarCarrinho = () => {
    let subtotal = 0
    let desconto = 0
    let total = 0

    const { quartaFeira } = getPromocaoStatus()
    let descontoPromoAplicado = false
    let totalPizzasPromoNoCarrinho = 0

    if (typeof detectarEAplicarCombos === 'function') {
        detectarEAplicarCombos(cart)
    }

    if (cart.length > 0) {
        seleciona('aside').classList.add('show')

        seleciona('.cart').innerHTML = ''

        cart.forEach((itemDoCarrinho) => {
            let cartItem = seleciona('.models .cart--item').cloneNode(true)

            if (itemDoCarrinho.isCombo) {

                cartItem.classList.add('is-combo')
                cartItem.querySelector('.cart--item img').src = itemDoCarrinho.img || 'assets/img/banner-promocao-combo-pizza.webp'

                const precoOriginalItem = Math.max(itemDoCarrinho.originalPrice || itemDoCarrinho.price, itemDoCarrinho.price) * itemDoCarrinho.qt
                const precoFinalItem = itemDoCarrinho.price * itemDoCarrinho.qt
                const economiaItem = (itemDoCarrinho.discount || 0) * itemDoCarrinho.qt

                cartItem.querySelector('.cart--item-nome').innerHTML = `
                    <span class="cart--item-tag-combo">Combo</span>
                    <div class="cart--item-combo-title">${itemDoCarrinho.name}</div>
                    <div class="cart--item-combo-sub">${itemDoCarrinho.dynamicName || ''}</div>
                    <div class="cart--item-prices-combo">
                        ${economiaItem > 0.009 ? `<s>${formatoReal(precoOriginalItem)}</s>` : ''}
                        <strong>${formatoReal(precoFinalItem)}</strong>
                        ${economiaItem > 0.009 ? `<span class="economy-tag">Economia de ${formatoReal(economiaItem)}</span>` : ''}
                    </div>
                `
                cartItem.querySelector('.cart--item--qt').innerHTML = itemDoCarrinho.qt

                subtotal += precoOriginalItem
                desconto += economiaItem
            } else if (itemDoCarrinho.isMeioAMeio) {

                cartItem.classList.add('is-meio-a-meio');
                cartItem.querySelector('.cart--item img').src = itemDoCarrinho.img || 'assets/img/pizzas/pizza-calabresa.webp';

                let refriBadge = '';
                if (itemDoCarrinho.refrigerante) {
                    refriBadge = `<div class="cart--item-refri">Brinde: ${itemDoCarrinho.refrigerante}</div>`;
                }

                let tagBg = 'linear-gradient(135deg, #DE4E45 50%, #64B95F 50%)';
                let tagNome = 'Meio a Meio';
                if (itemDoCarrinho.tipoMeio === 'gourmet') {
                    tagBg = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                    tagNome = 'Gourmet';
                } else if (itemDoCarrinho.tipoMeio === 'doce') {
                    tagBg = 'linear-gradient(135deg, #B45309 0%, #D97706 100%)';
                    tagNome = 'Doce';
                }

                const nomeTitulo = itemDoCarrinho.name || `Pizza Meio a Meio (${itemDoCarrinho.sizeName || itemDoCarrinho.size})`;

                cartItem.querySelector('.cart--item-nome').innerHTML = `
                    <span class="cart--item-tag-combo" style="background: ${tagBg};">${tagNome}</span>
                    <div class="cart--item-combo-title">${nomeTitulo}</div>
                    <div class="cart--item-combo-sub">½ ${itemDoCarrinho.sabor1.name} + ½ ${itemDoCarrinho.sabor2.name}</div>
                    ${refriBadge}
                `;
                cartItem.querySelector('.cart--item--qt').innerHTML = itemDoCarrinho.qt;

                let itemTotal = itemDoCarrinho.qt * itemDoCarrinho.price;
                subtotal += itemTotal;

            } else {

                let pizzaItem = pizzaJson.find((item) => item.id == itemDoCarrinho.id)
                let displayName = itemDoCarrinho.customName || (pizzaItem ? pizzaItem.name : 'Item')
                let pizzaName = `${displayName} (${itemDoCarrinho.size})`

                let refriBadge = ''
                if (itemDoCarrinho.size === 'S' || itemDoCarrinho.size === 'MX') {
                    const nomeRefri = itemDoCarrinho.refrigerante || 'Refri 2L (Sujeito a estoque)'
                    refriBadge = `<div class="cart--item-refri">Brinde: ${nomeRefri}</div>`
                }

                cartItem.querySelector('.cart--item img').src = pizzaItem ? pizzaItem.img : 'assets/img/logo-la-bella-pizza.webp'
                cartItem.querySelector('.cart--item-nome').innerHTML = `
                    <div>${pizzaName}</div>
                    ${refriBadge}
                `
                cartItem.querySelector('.cart--item--qt').innerHTML = itemDoCarrinho.qt

                let itemTotal = itemDoCarrinho.qt * itemDoCarrinho.price
                subtotal += itemTotal

                const ehItemPromo = !itemDoCarrinho.isMeioAMeio && quartaFeira && (itemDoCarrinho.size === 'G' || itemDoCarrinho.sizeIndex === 1) &&
                    (pizzaPromoQuartaUm.includes(itemDoCarrinho.id) || pizzaPromoQuartaDois.includes(itemDoCarrinho.id))

                if (ehItemPromo) {
                    totalPizzasPromoNoCarrinho += itemDoCarrinho.qt
                    if (!descontoPromoAplicado) {
                        if (pizzaPromoQuartaUm.includes(itemDoCarrinho.id)) {
                            desconto += 10
                        } else if (pizzaPromoQuartaDois.includes(itemDoCarrinho.id)) {
                            desconto += 11
                        }
                        descontoPromoAplicado = true
                    }
                }
            }

            seleciona('.menu-openner span').innerHTML = cart.length

            cartItem.querySelector('.cart--item-qtmais').addEventListener('click', () => {
                const ehItemPromo = !itemDoCarrinho.isMeioAMeio && quartaFeira && (itemDoCarrinho.size === 'G' || itemDoCarrinho.sizeIndex === 1) &&
                    (pizzaPromoQuartaUm.includes(itemDoCarrinho.id) || pizzaPromoQuartaDois.includes(itemDoCarrinho.id))
                if (ehItemPromo) {
                    mostrarPopupAvisoPromo()
                }
                itemDoCarrinho.qt++
                atualizarCarrinho()
            })

            cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', () => {
                if (itemDoCarrinho.qt > 1) {
                    itemDoCarrinho.qt--
                } else {
                    let indexDoItem = cart.findIndex(cartItem => cartItem.identificador === itemDoCarrinho.identificador)
                    if (indexDoItem > -1) {
                        cart.splice(indexDoItem, 1)
                    }
                }
                atualizarCarrinho()
            })

            seleciona('.cart').append(cartItem)
        })

        const promoAlertEl = seleciona('.cart--promo-alert')
        if (promoAlertEl) {
            promoAlertEl.style.display = totalPizzasPromoNoCarrinho > 1 ? 'block' : 'none'
        }

        const resumo = capturarDadosDoPedido()
        subtotal = resumo.subtotal
        desconto = resumo.desconto
        total = resumo.total

        seleciona('.menu-openner span').innerHTML = cart.length
        seleciona('.subtotal span:last-child').innerHTML = formatoReal(subtotal)
        seleciona('.desconto span:last-child').innerHTML = formatoReal(desconto)
        seleciona('.total span:last-child').innerHTML = formatoReal(total)
    } else {
        const promoAlertEl = seleciona('.cart--promo-alert')
        if (promoAlertEl) {
            promoAlertEl.style.display = 'none'
        }
        seleciona('aside').classList.remove('show')
        seleciona('.cart').innerHTML = ''
        seleciona('.menu-openner span').innerHTML = 0
        seleciona('.subtotal span:last-child').innerHTML = 'R$ --'
        seleciona('.desconto span:last-child').innerHTML = 'R$ --'
        seleciona('.total span:last-child').innerHTML = 'R$ --'
    }

}

const arredondarMoeda = valor => Math.round((valor + Number.EPSILON) * 100) / 100;

const nomeBebidaPedido = (nome, tamanho = '', fallback = 'Bebida a confirmar com o atendente') => {
    const limpo = String(nome || '').replace(/\b(null|undefined)\b/gi, '').replace(/\s+/g, ' ').trim();
    if (!limpo || /^bebida$/i.test(limpo)) return fallback;
    return tamanho && !limpo.toLowerCase().includes(tamanho.toLowerCase()) ? limpo + ' ' + tamanho : limpo;
};

const formatarMensagemPedido = (pedido, dados) => {
    const linhas = ['🍕 *NOVO PEDIDO — LA BELLA PIZZA*', '', '*ITENS DO PEDIDO*'];
    pedido.itens.forEach((item, index) => {
        const tamanho = !item.isCombo && !item.isMeioAMeio && item.tamanho ? ' (' + item.tamanho + ')' : '';
        linhas.push('', (index + 1) + '. *' + item.quantidade + 'x ' + item.nome + tamanho + '*');
        if (item.isCombo) {
            item.pizzas.forEach(p => {
                linhas.push('• Pizza: ' + p.name + ' — ' + (p.sizeName || p.size));
                if (p.refrigerante) linhas.push('• Brinde da pizza: ' + nomeBebidaPedido(p.refrigerante));
            });
            item.drinks.forEach(d => linhas.push('• Bebida inclusa: ' + nomeBebidaPedido(d.name, d.size)));
            if (!item.pizzas.length && !item.drinks.length && item.detalhes) linhas.push('• ' + item.detalhes);
            if (item.quantidade > 1) linhas.push('Composição acima por combo.');
        } else if (item.detalhes) {
            linhas.push('• ' + item.detalhes);
        }
        if (item.brindeRefri) linhas.push('• Brinde: ' + item.quantidade + 'x ' + nomeBebidaPedido(item.refrigeranteNome));
        const valorFinal = arredondarMoeda(item.totalPizza - (item.isCombo ? 0 : item.desconto));
        if (item.quantidade > 1) linhas.push('Preço unitário: ' + formatoReal(item.preco));
        linhas.push('Total do item: *' + formatoReal(valorFinal) + '*');
        if (item.desconto > 0) linhas.push((item.isCombo ? 'Economia' : 'Desconto aplicado') + ': ' + formatoReal(item.desconto));
    });
    linhas.push('', '*RESUMO DO PEDIDO*', 'Subtotal antes dos descontos: ' + formatoReal(pedido.subtotal));
    if (pedido.desconto > 0) linhas.push('Descontos/economia: -' + formatoReal(pedido.desconto));
    linhas.push('*Total dos itens: ' + formatoReal(pedido.total) + '*', 'Entrega: taxa a confirmar com o atendente.',
        'Total a pagar: total dos itens + taxa de entrega.', '', '*DADOS PARA ENTREGA*',
        'Nome: ' + dados.nome, 'Telefone: ' + dados.telefone,
        'Endereço: ' + dados.endereco + ', nº ' + dados.numero + ' — ' + dados.bairro,
        'Tipo de imóvel: ' + dados.tipo);
    if (dados.complemento) linhas.push('Complemento: ' + dados.complemento);
    linhas.push('Pagamento: ' + dados.pagamento);
    return linhas.join('\n');
};

const capturarDadosDoPedido = () => {
    let pedido = {
        itens: [],
        subtotal: 0,
        desconto: 0,
        total: 0
    }

    const { quartaFeira } = getPromocaoStatus()
    let descontoPromoAplicado = false

    cart.forEach((itemDoCarrinho) => {
        if (itemDoCarrinho.isCombo) {
            const precoFinal = itemDoCarrinho.price * itemDoCarrinho.qt
            const precoOriginal = Math.max(itemDoCarrinho.originalPrice || itemDoCarrinho.price, itemDoCarrinho.price) * itemDoCarrinho.qt
            const economia = (itemDoCarrinho.discount || 0) * itemDoCarrinho.qt

            pedido.itens.push({
                isCombo: true,
                comboCode: itemDoCarrinho.comboCode,
                comboId: itemDoCarrinho.comboId,
                nome: itemDoCarrinho.name,
                detalhes: itemDoCarrinho.dynamicName || '',
                pizzas: itemDoCarrinho.pizzas || [],
                drinks: itemDoCarrinho.drinks || [],
                tamanho: 'Combo',
                quantidade: itemDoCarrinho.qt,
                preco: itemDoCarrinho.price,
                totalPizza: precoFinal,
                desconto: economia,
                brindeRefri: false
            })

            pedido.subtotal += precoOriginal
            pedido.desconto += economia
        } else {
            let pizzaItem = pizzaJson.find((item) => item.id == itemDoCarrinho.id)
            let pizzaName = itemDoCarrinho.customName || (pizzaItem ? pizzaItem.name : 'Item')
            let pizzaSize = itemDoCarrinho.size
            let pizzasQt = itemDoCarrinho.qt
            let pizzaPrice = itemDoCarrinho.price
            let pizzaTotal = pizzasQt * pizzaPrice
            let itemDesconto = 0

            const ehItemPromo = !itemDoCarrinho.isMeioAMeio && quartaFeira && (itemDoCarrinho.size === 'G' || itemDoCarrinho.sizeIndex === 1) &&
                (pizzaPromoQuartaUm.includes(itemDoCarrinho.id) || pizzaPromoQuartaDois.includes(itemDoCarrinho.id))

            if (ehItemPromo && !descontoPromoAplicado) {
                if (pizzaPromoQuartaUm.includes(itemDoCarrinho.id)) {
                    itemDesconto = 10
                } else if (pizzaPromoQuartaDois.includes(itemDoCarrinho.id)) {
                    itemDesconto = 11
                }
                descontoPromoAplicado = true
                pedido.desconto += itemDesconto
            }

            const brindeRefri = ((itemDoCarrinho.size === 'S' || itemDoCarrinho.size === 'MX') || !!itemDoCarrinho.refrigerante) && (!pizzaItem || (pizzaItem.category !== 'Bebidas' && pizzaItem.category !== 'Combos'))
            let refriNomeLimpo = nomeBebidaPedido(itemDoCarrinho.refrigerante, '', 'Guaraná Antarctica 2L (Sujeito a estoque)')
            if (brindeRefri && !refriNomeLimpo) {
                refriNomeLimpo = 'Guaraná Antarctica 2L (Sujeito a estoque)'
            }

            pedido.itens.push({
                isCombo: false,
                isMeioAMeio: !!itemDoCarrinho.isMeioAMeio,
                nome: itemDoCarrinho.isMeioAMeio ? (itemDoCarrinho.name || `Pizza Meio a Meio (${itemDoCarrinho.sizeName || itemDoCarrinho.size})`) : pizzaName,
                detalhes: itemDoCarrinho.isMeioAMeio ? `½ ${itemDoCarrinho.sabor1.name} + ½ ${itemDoCarrinho.sabor2.name}` : '',
                tamanho: itemDoCarrinho.sizeName || itemDoCarrinho.size,
                quantidade: pizzasQt,
                preco: pizzaPrice,
                totalPizza: pizzaTotal,
                desconto: itemDesconto,
                brindeRefri: brindeRefri,
                refrigeranteNome: refriNomeLimpo
            })

            pedido.subtotal += pizzaTotal
        }
    })

    pedido.itens.forEach(item => {
        item.totalPizza = arredondarMoeda(item.totalPizza)
        item.desconto = arredondarMoeda(item.desconto)
    })
    pedido.subtotal = arredondarMoeda(pedido.subtotal)
    pedido.desconto = arredondarMoeda(pedido.desconto)
    pedido.total = arredondarMoeda(Math.max(0, pedido.subtotal - pedido.desconto))
    return pedido
}

const abrirCheckout = () => {

    esconderCarrinho(false);

    seleciona('.checkoutWindowArea').style.opacity = 0;
    seleciona('.checkoutWindowArea').style.display = 'flex';

    setTimeout(() => {
        seleciona('.checkoutWindowArea').style.opacity = 1;

        seleciona('#checkout-nome').focus();
    }, 200);

    window.pushModalState('checkout');
};

const fecharCheckout = (syncHistory = true) => {

    seleciona('.checkoutWindowArea').style.opacity = 0;

    setTimeout(() => {
        seleciona('.checkoutWindowArea').style.display = 'none';
    }, 500);

    if (syncHistory) {
        window.popModalState('checkout');
    }
};

const configurarCheckout = () => {

    let inputsFormulario = document.querySelectorAll('.checkout-form input, .checkout-form select')
    inputsFormulario.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault()

                if (index < inputsFormulario.length - 1) {
                    inputsFormulario[index + 1].focus()
                } else {

                    seleciona('.checkoutInfo--confirmButton').click()
                }
            }
        })
    })

    seleciona('.checkoutInfo--cancelMobileButton').addEventListener('click', () => {
        fecharCheckout();
        setTimeout(() => {
            mostrarCarrinho();
        }, 300);
    });

    seleciona('.checkoutInfo--cancelButton').addEventListener('click', () => {
        fecharCheckout();
        setTimeout(() => {
            mostrarCarrinho();
        }, 300);
    });

    let campoCep = seleciona('#checkout-cep')

    campoCep.addEventListener('input', () => {
        campoCep.value = campoCep.value.replace(/[^0-9]/g, "")
    })

    campoCep.addEventListener('blur', () => {
        if (campoCep.value.length !== 8) {
            alert('CEP inválido! O CEP deve conter 8 números.')
            return
        } else {
            fetch(`https://viacep.com.br/ws/${campoCep.value}/json/`)
                .then(resposta => {
                    if (!resposta.ok) {
                        throw new Error('Erro no status do servidor: ' + resposta.status)
                    }
                    return resposta.json();
                })
                .then(data => {
                    if (data.erro) {
                        alert('CEP não encontrado!')
                        return
                    } else {

                        seleciona('#checkout-endereco').value = data.logradouro
                        seleciona('#checkout-bairro').value = data.bairro

                        seleciona('#checkout-numero').focus()
                    }
                })
        }
    })

    seleciona('.checkoutInfo--confirmButton').addEventListener('click', () => {

        let nomePessoa = (seleciona('#checkout-nome')?.value || '').trim()
        let telefonePessoa = (seleciona('#checkout-telefone')?.value || '').trim()
        let enderecoPessoa = (seleciona('#checkout-endereco')?.value || '').trim()
        let numeroCasaPessoa = (seleciona('#checkout-numero')?.value || '').trim()
        let bairroPessoa = (seleciona('#checkout-bairro')?.value || '').trim()
        let tipoResidencia = (seleciona('#checkout-tipo-residencia')?.value || '').trim()
        let complementoPessoa = (seleciona('#checkout-complemento')?.value || '').trim()
        let formaPagamento = (seleciona('#checkout-pagamento')?.value || '').trim()

        if (!nomePessoa || !telefonePessoa || !enderecoPessoa || !numeroCasaPessoa || !bairroPessoa || !tipoResidencia || !formaPagamento) {
            alert('Atenção: Por favor, preencha todos os campos obrigatórios (incluindo tipo de imóvel e forma de pagamento).')
            return
        }

        let pedido = capturarDadosDoPedido()

        const mensagem = formatarMensagemPedido(pedido, {
            nome: nomePessoa, telefone: telefonePessoa, endereco: enderecoPessoa,
            numero: numeroCasaPessoa, bairro: bairroPessoa, tipo: tipoResidencia,
            complemento: complementoPessoa, pagamento: formaPagamento
        })

        let mensagemFinal = encodeURIComponent(mensagem)

        let url = `https://wa.me/5524999323962?text=${mensagemFinal}`

        window.open(url, '_blank')

        cart = []
        fecharCheckout()
        atualizarCarrinho()
    })

}

const enviarPedido = () => {
    seleciona('.cart--finalizar').addEventListener('click', () => {
        if (cart.length > 0) {
            abrirCheckout()
        }
    })
    configurarCheckout()
}

const limparCarrinho = () => {
    const btnLimpar = seleciona('.cart--limpar')
    if (btnLimpar) {
        btnLimpar.addEventListener('click', () => {
            cart = []
            seleciona('.menu-openner span').innerHTML = 0
            atualizarCarrinho()
        })
    }
}

const pesquisar = () => {
    const searchBar = seleciona('.search-bar')
    const searchInput = seleciona('#search-input')
    const searchOpenner = seleciona('.search-openner')
    const searchCloser = seleciona('.search-closer')
    const navActions = seleciona('.nav-actions')

    searchOpenner.addEventListener('click', () => {
        searchBar.style.display = 'flex'
        navActions.classList.add('search-active')
        setTimeout(() => {
            searchBar.classList.add('show')
            searchInput.focus()
        }, 10)
    })

    searchInput.addEventListener('input', (e) => {
        termoAtual = e.target.value
        carregarPizzas(termoAtual)
    })

    searchCloser.addEventListener('click', () => {
        searchBar.classList.remove('show')
        navActions.classList.remove('search-active')
        searchInput.value = ''
        termoAtual = ''
        carregarPizzas()
        setTimeout(() => {
            searchBar.style.display = 'none'
        }, 400)
    })
}

const filtro = () => {
    let botoes = selecionaTodos('.category-button');

    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            const isCurrentlyActive = botao.classList.contains('active');

            botoes.forEach(b => b.classList.remove('active'));

            if (isCurrentlyActive) {

                categoriaAtual = 'all';
                const btnTodos = [...botoes].find(b => b.getAttribute('data-filter') === 'all');

                if (btnTodos) btnTodos.classList.add('active');

            } else {

                botao.classList.add('active');
                categoriaAtual = botao.getAttribute('data-filter');
            }

            carregarPizzas();

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
}

const CONFIG_MEIO = {
    salgada: {
        tipo: 'salgada',
        tituloCard: 'Meio a Meio',
        precoMinimo: 'A partir de R$ 54,90',
        badge: 'Tradicionais & Especiais',
        imgCard: 'assets/img/pizzas/pizza-calabresa.webp',
        imgMob: 'assets/img/pizzas/pizza-calabresa-mob.webp',
        alt: 'Pizza Meio a Meio Tradicional e Especial',
        classesCard: ['card-meio-a-meio', 'card-meio-salgada', 'pizzas-tradicionais', 'pizzas-especiais'],
        modalTag: 'TRADICIONAIS & ESPECIAIS',
        modalTitulo: 'Pizza Meio a Meio',
        modalDesc: 'Escolha metade um sabor e metade outro entre Pizzas Tradicionais e Especiais. O preço prevalecente é o da metade de maior valor no tamanho selecionado.',
        tamanhos: ['M', 'G', 'S', 'MX'],
        defaultSizeKey: 'G',
        allowedCategories: ['Pizzas Tradicionais', 'Pizzas Especiais'],
        defaultSabor1Id: 1, // Muçarela
        defaultSabor2Id: 4, // Calabresa
        cartTag: 'Meio a Meio',
        cartName: (sizeName) => `Pizza Meio a Meio (${sizeName})`
    },
    gourmet: {
        tipo: 'gourmet',
        tituloCard: 'Meio a Meio Gourmet',
        precoMinimo: 'A partir de R$ 98,90',
        badge: 'Pizzas Gourmet',
        imgCard: 'assets/img/pizzas/pizza-burrata.webp',
        imgMob: 'assets/img/pizzas/pizza-burrata.webp',
        alt: 'Pizza Meio a Meio Gourmet',
        classesCard: ['card-meio-a-meio', 'card-meio-gourmet', 'pizzas-gourmet'],
        modalTag: 'GOURMET · 2 SABORES',
        modalTitulo: 'Meio a Meio Gourmet',
        modalDesc: 'Escolha metade um sabor e metade outro da nossa linha exclusiva Gourmet. O preço prevalecente é o da metade de maior valor no tamanho Grande (35 cm).',
        tamanhos: ['G'],
        defaultSizeKey: 'G',
        allowedCategories: ['Pizzas Gourmet'],
        defaultSabor1Id: 60, // Abobrinha Natural
        defaultSabor2Id: 61, // Burrata
        cartTag: 'Gourmet',
        cartName: (sizeName) => `Pizza Meio a Meio Gourmet (${sizeName})`
    },
    doce: {
        tipo: 'doce',
        tituloCard: 'Meio a Meio Doce',
        precoMinimo: 'A partir de R$ 44,90',
        badge: 'Pizzas Doces',
        imgCard: 'assets/img/pizzas/pizza-chocolate-morango.webp',
        imgMob: 'assets/img/pizzas/pizza-chocolate-morango.webp',
        alt: 'Pizza Meio a Meio Doce',
        classesCard: ['card-meio-a-meio', 'card-meio-doce', 'pizzas-doces'],
        modalTag: 'DOCES · 2 SABORES',
        modalTitulo: 'Meio a Meio Doce',
        modalDesc: 'Escolha metade um sabor e metade outro da nossa linha Doce. O preço prevalecente é o da metade de maior valor no tamanho selecionado.',
        tamanhos: ['M', 'G'],
        defaultSizeKey: 'G',
        allowedCategories: ['Pizzas Doces'],
        defaultSabor1Id: 55, // Chocolate c/ Banana
        defaultSabor2Id: 56, // Chocolate c/ Morango
        cartTag: 'Doces',
        cartName: (sizeName) => `Pizza Meio a Meio Doce (${sizeName})`
    }
};

const carregarPizzas = () => {
    let grid = seleciona('.cards-grid');

    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach(st => {
            if (st.trigger && grid.contains(st.trigger)) {
                st.kill();
            }
        });
    }

    grid.innerHTML = '';

    const { diaDaSemana, ehFeriadoOuVespera, tercaFeira, quartaFeira } = getPromocaoStatus();

    const promoSection = document.querySelector('.promocao');
    if (promoSection) {
        if (termoAtual.trim() !== '' || categoriaAtual !== 'all') {
            promoSection.style.display = 'none';
        } else {
            promoSection.style.display = '';
        }
    }

    let pizzasPromo = [];
    let pizzasNormais = [];

    const destacarOfertasDoDia = quartaFeira && categoriaAtual === 'all' && termoAtual.trim() === '';

    pizzaJson.forEach((item, originalIndex) => {
        let ehPromo = destacarOfertasDoDia && (pizzaPromoQuartaUm.includes(item.id) || pizzaPromoQuartaDois.includes(item.id));
        if (ehPromo) {
            pizzasPromo.push({ item, index: originalIndex });
        } else {
            pizzasNormais.push({ item, index: originalIndex });
        }
    });

    let ultimaCategoria = '';
    let cardsMeioInseridos = { salgada: false, gourmet: false, doce: false };

    const fragment = document.createDocumentFragment();

    const desenharCardMeio = (tipo) => {
        if (cardsMeioInseridos[tipo]) return;
        if (categoriaAtual === 'combos' || categoriaAtual === 'bebidas') return;

        const config = CONFIG_MEIO[tipo];
        if (!config) return;

        if (termoAtual !== '') {
            const t = termoAtual.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const palavrasBase = ['meio', 'misto', 'mista', 'metade', 'dois', 'sabores', 'personalizada', 'custom', 'pizza'];
            let palavrasEspecificas = [];
            if (tipo === 'salgada') palavrasEspecificas = ['tradicional', 'especial', 'calabresa', 'mussarela', 'salgada'];
            else if (tipo === 'gourmet') palavrasEspecificas = ['gourmet', 'burrata', 'parma', 'abobrinha'];
            else if (tipo === 'doce') palavrasEspecificas = ['doce', 'doces', 'chocolate', 'brigadeiro', 'banana', 'morango'];

            const todasPalavras = [...palavrasBase, ...palavrasEspecificas];
            const bate = todasPalavras.some(p => p.includes(t) || t.includes(p));
            if (!bate) return;
        }

        let cardItem = seleciona('.models .card').cloneNode(true);
        cardItem.removeAttribute('data-st-active');
        cardItem.classList.add('card-white', 'card-meio-a-meio', `card-meio-${tipo}`);
        config.classesCard.forEach(c => cardItem.classList.add(c));

        const pizzaImg = cardItem.querySelector(".card-pizza-img");
        if (pizzaImg) {
            pizzaImg.srcset = `${config.imgMob} 480w, ${config.imgCard} 706w`;
            pizzaImg.sizes = "(max-width: 768px) 120px, 200px";
            pizzaImg.src = config.imgMob;
            pizzaImg.alt = config.alt;
            pizzaImg.loading = "lazy";
            pizzaImg.decoding = "async";
            pizzaImg.width = 140;
            pizzaImg.height = 93;
        }

        const titleEl = cardItem.querySelector(".card-title");
        if (titleEl) titleEl.innerHTML = config.tituloCard;

        const priceEl = cardItem.querySelector(".card-price");
        if (priceEl) priceEl.innerHTML = config.precoMinimo;

        const cardBtn = cardItem.querySelector('.card-btn');
        if (cardBtn) {
            cardBtn.innerText = "Montar Pizza";
            cardBtn.setAttribute('aria-label', `Montar ${config.tituloCard}`);
            cardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                abrirModalMeioAMeio(tipo);
            });
        }

        fragment.append(cardItem);
        cardsMeioInseridos[tipo] = true;
        if (window.observeCard) window.observeCard(cardItem);
    };

    const desenharCard = ({ item, index }, ehPromoSection) => {
        const categoriaSlug = item.category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

        let nomeBate = item.name.toLowerCase().includes(termoAtual.toLowerCase());
        let categoriaBate = categoriaAtual === 'all' || categoriaAtual === categoriaSlug;

        if (!nomeBate || !categoriaBate) {
            return;
        }

        let pizzaItem = seleciona('.models .card').cloneNode(true);
        pizzaItem.removeAttribute('data-st-active');
        pizzaItem.classList.add(categoriaSlug);

        if (!ehPromoSection) {
            if (item.category && item.category !== ultimaCategoria) {
                ultimaCategoria = item.category;

                let titulo = document.createElement('h2');
                titulo.classList.add('category-title');
                titulo.classList.add(categoriaSlug);
                titulo.innerHTML = ultimaCategoria;
                fragment.append(titulo);
                if (window.animateTitle) window.animateTitle(titulo);

                if (ultimaCategoria === 'Pizzas Tradicionais') {
                    desenharCardMeio('salgada');
                } else if (ultimaCategoria === 'Pizzas Especiais' && !cardsMeioInseridos.salgada && categoriaAtual === 'pizzas-especiais') {
                    desenharCardMeio('salgada');
                } else if (ultimaCategoria === 'Pizzas Doces') {
                    desenharCardMeio('doce');
                } else if (ultimaCategoria === 'Pizzas Gourmet') {
                    desenharCardMeio('gourmet');
                }
            }
        }

        const cores = ['card-red', 'card-white', 'card-green'];
        const cor = cores[index % 3];
        pizzaItem.classList.add(cor);

        if (cor === 'card-white') {
            const btn = pizzaItem.querySelector('.card-btn');
            if (btn) btn.classList.add('btn-outline');
        }

        fragment.append(pizzaItem);
        if (window.observeCard) window.observeCard(pizzaItem);

        preencheDadosPizza(pizzaItem, item, index);

        if (ehPromoSection) {
            let precoBase = item.price[1] || item.price[0];
            if (pizzaPromoQuartaUm.includes(item.id)) {
                precoBase -= 10;
            } else if (pizzaPromoQuartaDois.includes(item.id)) {
                precoBase -= 11;
            }

            pizzaItem.querySelector(".card-price").innerHTML = `R$ ${precoBase.toFixed(2).replace('.', ',')}`;
        }

        pizzaItem.querySelector('.card-btn').addEventListener('click', (e) => {
            e.preventDefault();

            if (item.category === 'Combos' || item.comboId) {
                const comboObj = (typeof combosJson !== 'undefined')
                    ? combosJson.find(c => c.id === item.comboId || c.id === item.id) || item
                    : item;
                if (typeof abrirModalCombo === 'function') {
                    abrirModalCombo(comboObj);
                    botoesFechar();
                    return;
                }
            }

            let chave = pegarKey(e);
            abrirModal();
            preencherDadosModal(item);
            preencherTiposBebida(chave);
            preencherTamanhos(chave);
            seleciona('.pizzaInfo--qt').innerHTML = quantPizzas;
            escolherTamanho(chave);
            atualizaPreco();
        });

        botoesFechar();
    };

    if (tercaFeira && typeof combosJson !== 'undefined' && termoAtual.trim() === '') {
        const combosTerca = combosJson.filter(c => c.category === 'PromocaoTerca');
        if (combosTerca.length > 0 && categoriaAtual === 'all') {
            let tituloTerca = document.createElement('h2');
            tituloTerca.classList.add('category-title');
            tituloTerca.innerHTML = "La Bella em Dobro";
            fragment.append(tituloTerca);
            if (window.animateTitle) window.animateTitle(tituloTerca);

            combosTerca.forEach((combo, idx) => {
                let comboItem = seleciona('.models .card').cloneNode(true);
                comboItem.removeAttribute('data-st-active');
                const coresTerca = ['card-red', 'card-white', 'card-green'];
                const corTerca = coresTerca[idx % coresTerca.length];
                comboItem.classList.add('combos', corTerca);

                if (corTerca === 'card-white') {
                    const btnCard = comboItem.querySelector('.card-btn');
                    if (btnCard) btnCard.classList.add('btn-outline');
                }

                const comboImg = comboItem.querySelector(".card-pizza-img");
                const mobComboImg = combo.img.replace('.webp', '-mob.webp');
                comboImg.srcset = `${mobComboImg} 480w, ${combo.img} 706w`;
                comboImg.sizes = "(max-width: 768px) 120px, 200px";
                comboImg.src = mobComboImg;
                comboImg.alt = combo.name;
                comboImg.loading = "lazy";
                comboImg.decoding = "async";
                comboImg.width = 140;
                comboImg.height = 93;
                comboItem.querySelector(".card-title").innerHTML = formatarTituloCard(combo.name);
                comboItem.querySelector(".card-price").innerHTML = `R$ ${combo.price.toFixed(2).replace('.', ',')}`;

                const btn = comboItem.querySelector('.card-btn');
                btn.innerText = "Montar Promoção";
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (typeof abrirModalCombo === 'function') {
                        abrirModalCombo(combo);
                        botoesFechar();
                    }
                });

                fragment.append(comboItem);
                if (window.observeCard) window.observeCard(comboItem);
            });
        }
    }

    if (pizzasPromo.length > 0 && termoAtual.trim() === '' && categoriaAtual === 'all') {
        let temPromoPraMostrar = pizzasPromo.some(({ item }) => {
            return item.name.toLowerCase().includes(termoAtual.toLowerCase());
        });

        if (temPromoPraMostrar) {
            let tituloPromo = document.createElement('h2');
            tituloPromo.classList.add('category-title', 'ofertas-do-dia');
            tituloPromo.innerHTML = "Ofertas do Dia";
            fragment.append(tituloPromo);
            if (window.animateTitle) window.animateTitle(tituloPromo);

            pizzasPromo.forEach(obj => desenharCard(obj, true));
        }
    }

    pizzasNormais.forEach(obj => desenharCard(obj, false));

    // Se o usuário buscou por termo relacionado a meio a meio e os cards ainda não foram inseridos
    if (termoAtual.trim() !== '' && categoriaAtual !== 'combos' && categoriaAtual !== 'bebidas') {
        const t = termoAtual.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const palavrasMeio = ['meio', 'misto', 'mista', 'metade', 'dois', 'sabores', 'personalizada', 'custom', 'pizza'];
        const querMeio = palavrasMeio.some(p => p.includes(t) || t.includes(p));

        if (querMeio) {
            if (!cardsMeioInseridos.salgada && (categoriaAtual === 'all' || categoriaAtual === 'pizzas-tradicionais' || categoriaAtual === 'pizzas-especiais')) {
                desenharCardMeio('salgada');
            }
            if (!cardsMeioInseridos.doce && (categoriaAtual === 'all' || categoriaAtual === 'pizzas-doces')) {
                desenharCardMeio('doce');
            }
            if (!cardsMeioInseridos.gourmet && (categoriaAtual === 'all' || categoriaAtual === 'pizzas-gourmet')) {
                desenharCardMeio('gourmet');
            }
        }
    }

    // Monta todos os cards em um único reflow no DOM
    grid.append(fragment);

    if (typeof ScrollTrigger !== 'undefined') {
        requestAnimationFrame(() => ScrollTrigger.refresh());
    }
}

const promocoes = () => {

}

const tratarParametrosURL = () => {
    const params = new URLSearchParams(window.location.search);

    const filtroParams = params.get('filter');
    if (filtroParams) {
        let categoriaSlug = `pizzas-${filtroParams}`;
        let botaoCorrespondente = [...selecionaTodos('.category-button')].find(b => b.getAttribute('data-filter') === categoriaSlug);

        if (botaoCorrespondente) {
            selecionaTodos('.category-button').forEach(b => b.classList.remove('active'));
            botaoCorrespondente.classList.add('active');
            categoriaAtual = categoriaSlug;

            carregarPizzas();
        }
    }

    const promoParams = params.get('promo');
    if (promoParams) {
        const status = typeof getPromocaoStatus === 'function' ? getPromocaoStatus() : {
            tercaFeira: new Date().getDay() === 2,
            quartaFeira: new Date().getDay() === 3
        };

        if (promoParams === 'terca' && status.tercaFeira) {
            let btnCombos = [...selecionaTodos('.category-button')].find(b => b.getAttribute('data-filter') === 'combos');
            if (btnCombos) {
                selecionaTodos('.category-button').forEach(b => b.classList.remove('active'));
                btnCombos.classList.add('active');
                categoriaAtual = 'combos';
                carregarPizzas();
                setTimeout(() => {
                    const alvo = seleciona('.cardapio');
                    if (alvo) alvo.scrollIntoView({ behavior: 'smooth' });
                }, 200);
            }
        } else if (promoParams === 'quarta' && status.quartaFeira) {
            let btnTodos = [...selecionaTodos('.category-button')].find(b => b.getAttribute('data-filter') === 'all');
            if (btnTodos) {
                selecionaTodos('.category-button').forEach(b => b.classList.remove('active'));
                btnTodos.classList.add('active');
                categoriaAtual = 'all';
                carregarPizzas();
                setTimeout(() => {
                    const alvo = seleciona('.ofertas-do-dia') || seleciona('.cardapio');
                    if (alvo) alvo.scrollIntoView({ behavior: 'smooth' });
                }, 200);
            }
        } else {
            setTimeout(() => {
                const alvo = seleciona('.cardapio');
                if (alvo) alvo.scrollIntoView({ behavior: 'smooth' });
            }, 200);
        }
    }

    const modalParams = params.get('modal');
    if (modalParams) {

        let pizzaNomeBuscado = modalParams.replace(/-/g, ' ');
        const normalizeStr = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        pizzaNomeBuscado = normalizeStr(pizzaNomeBuscado);

        let indexAchado = pizzaJson.findIndex(item => {
            let nomeItem = normalizeStr(item.name);
            return nomeItem === pizzaNomeBuscado;
        });

        if (indexAchado > -1) {
            let item = pizzaJson[indexAchado];
            quantPizzas = 1;
            modalKey = indexAchado;

            abrirModal();
            preencherDadosModal(item);
            preencherTamanhos(indexAchado);
            seleciona('.pizzaInfo--qt').innerHTML = quantPizzas;
            escolherTamanho(indexAchado);
        }
    }
}

/* ==========================================================================
   PIZZA MEIO A MEIO & SELETOR DE SABORES (MODAL DEDICADO)
   ========================================================================== */

let meioState = {
    tipo: 'salgada', // 'salgada' | 'gourmet' | 'doce'
    sabor1: null,
    sabor2: null,
    sizeIndex: 1, // 0: Média (30cm), 1: Grande (35cm), 2: Super (40cm), 3: Max (45cm)
    sizeKey: 'G',
    sizeName: 'Grande (35 cm)',
    qt: 1,
    refrigerante: 'Guaraná Antarctica 2L'
};

const tamanhosMeio = [
    { key: 'M', name: 'Média (30 cm)', index: 0, hasSoda: false },
    { key: 'G', name: 'Grande (35 cm)', index: 1, hasSoda: false },
    { key: 'S', name: 'Super (40 cm)', index: 2, hasSoda: true },
    { key: 'MX', name: 'Max (45 cm)', index: 3, hasSoda: true }
];

const obterPrecoPizzaNoTamanho = (pizza, sizeIndex, sizeKey) => {
    if (!pizza || !pizza.price || !pizza.price.length) return 0;

    const key = sizeKey || (tamanhosMeio[sizeIndex] ? tamanhosMeio[sizeIndex].key : null);

    if (pizza.category === 'Pizzas Gourmet') {
        return pizza.price[0];
    }

    if (pizza.category === 'Pizzas Doces') {
        if (key === 'M' || sizeIndex === 0) return pizza.price[0];
        if (key === 'G' || sizeIndex === 1) return pizza.price[1] !== undefined ? pizza.price[1] : pizza.price[0];
        return pizza.price[pizza.price.length - 1];
    }

    // Tradicionais e Especiais
    if (key) {
        const map = { 'M': 0, 'G': 1, 'S': 2, 'MX': 3 };
        const idx = typeof map[key] !== 'undefined' ? map[key] : 1;
        if (typeof pizza.price[idx] !== 'undefined') return pizza.price[idx];
    }

    if (typeof sizeIndex === 'number' && typeof pizza.price[sizeIndex] !== 'undefined') {
        return pizza.price[sizeIndex];
    }

    return pizza.price[pizza.price.length - 1];
};

const atualizarPrecoMeio = () => {
    if (!meioState.sabor1 || !meioState.sabor2) return;

    const preco1 = obterPrecoPizzaNoTamanho(meioState.sabor1, meioState.sizeIndex, meioState.sizeKey);
    const preco2 = obterPrecoPizzaNoTamanho(meioState.sabor2, meioState.sizeIndex, meioState.sizeKey);
    const precoPrevalecente = Math.max(preco1, preco2);

    const nomePrevalecente = preco1 >= preco2 ? meioState.sabor1.name : meioState.sabor2.name;

    const actualPriceEl = seleciona('.meioInfo--actualPrice');
    const prevailingNameEl = seleciona('.meioInfo--prevailingName');

    if (actualPriceEl) actualPriceEl.innerText = formatoReal(precoPrevalecente);
    if (prevailingNameEl) prevailingNameEl.innerText = `${nomePrevalecente} (${formatoReal(precoPrevalecente)})`;

    // Atualizar preços nos cards de cada metade
    const slot1PriceEl = document.querySelector('.meio-slot[data-slot-index="0"] .meio-slot-price');
    const slot2PriceEl = document.querySelector('.meio-slot[data-slot-index="1"] .meio-slot-price');
    if (slot1PriceEl) slot1PriceEl.innerText = formatoReal(preco1);
    if (slot2PriceEl) slot2PriceEl.innerText = formatoReal(preco2);

    // Bônus refrigerante: apenas para tipo salgada e tamanhos Super (40cm) e Max (45cm)
    const bonusRefriEl = seleciona('.meioInfo--bonusRefri');
    if (bonusRefriEl) {
        const temRefri = (meioState.tipo === 'salgada' && (meioState.sizeKey === 'S' || meioState.sizeKey === 'MX'));
        bonusRefriEl.style.display = temRefri ? 'flex' : 'none';
    }
};

const atualizarSlotsMeioUI = () => {
    if (!meioState.sabor1 || !meioState.sabor2) return;

    const slot0 = document.querySelector('.meio-slot[data-slot-index="0"]');
    const slot1 = document.querySelector('.meio-slot[data-slot-index="1"]');

    if (slot0) {
        const img = slot0.querySelector('.meio-slot-img');
        const name = slot0.querySelector('.meio-slot-name');
        if (img) img.src = meioState.sabor1.img;
        if (name) name.innerText = meioState.sabor1.name;
    }
    if (slot1) {
        const img = slot1.querySelector('.meio-slot-img');
        const name = slot1.querySelector('.meio-slot-name');
        if (img) img.src = meioState.sabor2.img;
        if (name) name.innerText = meioState.sabor2.name;
    }

    atualizarPrecoMeio();
};

const abrirModalMeioAMeio = (tipo = 'salgada') => {
    const config = CONFIG_MEIO[tipo] || CONFIG_MEIO.salgada;
    meioState.tipo = tipo;

    // Configurar sabores padrão pertencentes à categoria permitida
    if (!meioState.sabor1 || !config.allowedCategories.includes(meioState.sabor1.category)) {
        meioState.sabor1 = pizzaJson.find(p => p.id === config.defaultSabor1Id) || pizzaJson.find(p => config.allowedCategories.includes(p.category)) || pizzaJson[0];
    }
    if (!meioState.sabor2 || !config.allowedCategories.includes(meioState.sabor2.category)) {
        meioState.sabor2 = pizzaJson.find(p => p.id === config.defaultSabor2Id) || pizzaJson.find(p => config.allowedCategories.includes(p.category) && p.id !== meioState.sabor1.id) || meioState.sabor1;
    }

    meioState.qt = 1;
    const qtEl = seleciona('.meioInfo--qt');
    if (qtEl) qtEl.innerText = 1;

    // Configurar tamanho padrão do modo
    meioState.sizeKey = config.defaultSizeKey;
    const sizeObj = tamanhosMeio.find(t => t.key === meioState.sizeKey) || { name: 'Grande (35 cm)', index: 1 };
    meioState.sizeName = sizeObj.name;
    meioState.sizeIndex = sizeObj.index;

    // Atualizar textos e imagens do modal
    const tagEl = seleciona('.meioTag');
    if (tagEl) tagEl.innerText = config.modalTag;

    const tituloEl = seleciona('.meioInfo h1');
    if (tituloEl) tituloEl.innerText = config.modalTitulo;

    const descEl = seleciona('.meioInfo--desc');
    if (descEl) descEl.innerText = config.modalDesc;

    const bigImg = seleciona('.meioBig img');
    if (bigImg) {
        bigImg.src = config.imgCard;
        bigImg.alt = config.alt;
    }

    // Gerenciar visibilidade dos botões de tamanho no modal
    selecionaTodos('.meioInfo--size').forEach(btn => {
        const key = btn.getAttribute('data-key');
        if (config.tamanhos.includes(key)) {
            btn.style.display = 'block';
            btn.classList.toggle('selected', key === meioState.sizeKey);
        } else {
            btn.style.display = 'none';
            btn.classList.remove('selected');
        }
    });

    const refriSelect = seleciona('#meio-refri-select') || seleciona('.meioInfo--refriSelect');
    if (refriSelect) meioState.refrigerante = refriSelect.value;

    atualizarSlotsMeioUI();

    const area = seleciona('.meioWindowArea');
    const body = seleciona('.meioWindowBody');
    if (area && body) {
        area.style.display = 'flex';
        gsap.to(area, { opacity: 1, duration: 0.3 });
        gsap.fromTo(body,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.4)" }
        );
        window.pushModalState('meio');
    }
};

const fecharModalMeioAMeio = (syncHistory = true) => {
    const area = seleciona('.meioWindowArea');
    const body = seleciona('.meioWindowBody');
    if (!area) return;

    gsap.to(body, {
        scale: 0.85,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in"
    });

    gsap.to(area, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            area.style.display = 'none';
        }
    });

    if (syncHistory) {
        window.popModalState('meio');
    }
};

const adicionarMeioAoCarrinho = () => {
    if (!meioState.sabor1 || !meioState.sabor2) return;

    const config = CONFIG_MEIO[meioState.tipo] || CONFIG_MEIO.salgada;
    const preco1 = obterPrecoPizzaNoTamanho(meioState.sabor1, meioState.sizeIndex, meioState.sizeKey);
    const preco2 = obterPrecoPizzaNoTamanho(meioState.sabor2, meioState.sizeIndex, meioState.sizeKey);
    const precoFinal = Math.max(preco1, preco2);

    const temRefri = (meioState.tipo === 'salgada' && (meioState.sizeKey === 'S' || meioState.sizeKey === 'MX'));
    let refriEscolhido = null;
    if (temRefri) {
        const selectRefriEl = seleciona('.meioInfo--refriSelect');
        const refriVal = selectRefriEl && selectRefriEl.value ? selectRefriEl.value.trim() : 'Guaraná Antarctica 2L';
        if (refriVal && refriVal.toLowerCase() !== 'null' && refriVal.toLowerCase() !== 'undefined') {
            refriEscolhido = `${refriVal} (Sujeito a estoque)`;
        } else {
            refriEscolhido = 'Guaraná Antarctica 2L (Sujeito a estoque)';
        }
    }

    const idsOrdenados = [meioState.sabor1.id, meioState.sabor2.id].sort((a, b) => a - b).join('-');
    const identificador = `meio_${meioState.tipo}@${idsOrdenados}@${meioState.sizeKey}@${refriEscolhido || 'semRefri'}`;

    const itemExistenteIndex = cart.findIndex(item => item.identificador === identificador);

    if (itemExistenteIndex > -1) {
        cart[itemExistenteIndex].qt += meioState.qt;
    } else {
        cart.push({
            identificador: identificador,
            isMeioAMeio: true,
            tipoMeio: meioState.tipo,
            id: meioState.sabor1.id,
            name: config.cartName(meioState.sizeName),
            img: config.imgCard,
            sabor1: {
                id: meioState.sabor1.id,
                name: meioState.sabor1.name,
                img: meioState.sabor1.img,
                category: meioState.sabor1.category,
                price: preco1
            },
            sabor2: {
                id: meioState.sabor2.id,
                name: meioState.sabor2.name,
                img: meioState.sabor2.img,
                category: meioState.sabor2.category,
                price: preco2
            },
            size: meioState.sizeKey,
            sizeIndex: meioState.sizeIndex,
            sizeName: meioState.sizeName,
            price: precoFinal,
            qt: meioState.qt,
            refrigerante: refriEscolhido
        });
    }

    fecharModalMeioAMeio();
    atualizarCarrinho();
    mostrarCarrinho();
};

const configurarModalMeioAMeio = () => {
    // Seleção de tamanho
    selecionaTodos('.meioInfo--size').forEach(btn => {
        btn.addEventListener('click', () => {
            selecionaTodos('.meioInfo--size').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            const key = btn.getAttribute('data-key');
            const sIndex = parseInt(btn.getAttribute('data-size-index'));
            meioState.sizeKey = key;
            meioState.sizeIndex = sIndex;
            const sizeObj = tamanhosMeio.find(t => t.key === key);
            meioState.sizeName = sizeObj ? sizeObj.name : 'Grande (35 cm)';
            atualizarPrecoMeio();
        });
    });

    // Quantidade
    const btnMenos = seleciona('.meioInfo--qtmenos');
    const btnMais = seleciona('.meioInfo--qtmais');
    const qtEl = seleciona('.meioInfo--qt');

    if (btnMenos) {
        btnMenos.addEventListener('click', () => {
            if (meioState.qt > 1) {
                meioState.qt--;
                if (qtEl) qtEl.innerText = meioState.qt;
            }
        });
    }

    if (btnMais) {
        btnMais.addEventListener('click', () => {
            meioState.qt++;
            if (qtEl) qtEl.innerText = meioState.qt;
        });
    }

    // Botão Adicionar
    const btnAdd = seleciona('.meioInfo--addButton');
    if (btnAdd) {
        btnAdd.addEventListener('click', adicionarMeioAoCarrinho);
    }

    // Slots individuais
    const slot0 = document.querySelector('.meio-slot[data-slot-index="0"]');
    const slot1 = document.querySelector('.meio-slot[data-slot-index="1"]');

    if (slot0) {
        slot0.addEventListener('click', () => {
            const config = CONFIG_MEIO[meioState.tipo] || CONFIG_MEIO.salgada;
            if (typeof window.abrirSeletorSaboresUnico === 'function') {
                window.abrirSeletorSaboresUnico({
                    title: `Escolha a 1ª Metade (${config.tituloCard})`,
                    stepText: "1ª Metade",
                    subtitle: "Toque no sabor para selecionar",
                    allowedCategories: config.allowedCategories,
                    sizeIndex: meioState.sizeIndex,
                    sizeKey: meioState.sizeKey,
                    selectedId: meioState.sabor1 ? meioState.sabor1.id : null,
                    onSelect: (pizza) => {
                        meioState.sabor1 = pizza;
                        atualizarSlotsMeioUI();
                    }
                });
            }
        });
    }

    if (slot1) {
        slot1.addEventListener('click', () => {
            const config = CONFIG_MEIO[meioState.tipo] || CONFIG_MEIO.salgada;
            if (typeof window.abrirSeletorSaboresUnico === 'function') {
                window.abrirSeletorSaboresUnico({
                    title: `Escolha a 2ª Metade (${config.tituloCard})`,
                    stepText: "2ª Metade",
                    subtitle: "Toque no sabor para selecionar",
                    allowedCategories: config.allowedCategories,
                    sizeIndex: meioState.sizeIndex,
                    sizeKey: meioState.sizeKey,
                    selectedId: meioState.sabor2 ? meioState.sabor2.id : null,
                    onSelect: (pizza) => {
                        meioState.sabor2 = pizza;
                        atualizarSlotsMeioUI();
                    }
                });
            }
        });
    }

    // Botão "Escolher os 2 Sabores"
    const btnChooseAll = seleciona('.meioInfo--slotsArea .meio-choose-all-btn');
    if (btnChooseAll) {
        btnChooseAll.addEventListener('click', () => {
            const config = CONFIG_MEIO[meioState.tipo] || CONFIG_MEIO.salgada;
            if (typeof window.iniciarFluxoSelecaoSabores === 'function') {
                window.iniciarFluxoSelecaoSabores({
                    steps: [
                        {
                            title: `Escolha a 1ª Metade (${config.tituloCard})`,
                            stepText: "Passo 1 de 2",
                            subtitle: "Selecione o sabor da primeira metade",
                            allowedCategories: config.allowedCategories,
                            sizeIndex: meioState.sizeIndex,
                            sizeKey: meioState.sizeKey,
                            selectedId: meioState.sabor1 ? meioState.sabor1.id : null
                        },
                        {
                            title: `Escolha a 2ª Metade (${config.tituloCard})`,
                            stepText: "Passo 2 de 2",
                            subtitle: "Selecione o sabor da segunda metade",
                            allowedCategories: config.allowedCategories,
                            sizeIndex: meioState.sizeIndex,
                            sizeKey: meioState.sizeKey,
                            selectedId: meioState.sabor2 ? meioState.sabor2.id : null
                        }
                    ],
                    onComplete: (sabores) => {
                        if (sabores[0]) meioState.sabor1 = sabores[0];
                        if (sabores[1]) meioState.sabor2 = sabores[1];
                        atualizarSlotsMeioUI();
                    }
                });
            }
        });
    }
};

/* ==========================================================================
   MODAL DE SELEÇÃO DE SABORES (Cards Simplificados, Filtro, Pesquisa)
   ========================================================================== */

let flavorPickerState = {
    isOpen: false,
    activeStepIndex: 0,
    steps: [],
    selectedFlavors: [],
    currentFilterCat: 'all',
    searchTerm: '',
    onSelectCallback: null,
    onCompleteCallback: null
};

const abrirModalFlavorPicker = () => {
    const area = seleciona('.flavorPickerWindowArea');
    const body = seleciona('.flavorPickerWindowBody');
    if (!area || !body) return;

    flavorPickerState.isOpen = true;
    flavorPickerState.currentFilterCat = 'all';
    flavorPickerState.searchTerm = '';

    const searchInput = seleciona('#flavorPickerSearch');
    if (searchInput) searchInput.value = '';
    const searchClear = seleciona('.flavorPickerSearchClear');
    if (searchClear) searchClear.style.display = 'none';

    area.style.display = 'flex';
    gsap.to(area, { opacity: 1, duration: 0.3 });
    gsap.fromTo(body,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
    );

    window.pushModalState('flavorPicker');
    atualizarEtapaFlavorPicker();
};

const fecharFlavorPicker = (syncHistory = true) => {
    const area = seleciona('.flavorPickerWindowArea');
    const body = seleciona('.flavorPickerWindowBody');
    if (!area) return;

    gsap.to(body, {
        scale: 0.85,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in"
    });

    gsap.to(area, {
        opacity: 0,
        duration: 0.25,
        onComplete: () => {
            area.style.display = 'none';
            flavorPickerState.isOpen = false;
        }
    });

    if (syncHistory) {
        window.popModalState('flavorPicker');
    }
};

const atualizarEtapaFlavorPicker = () => {
    const currentStep = flavorPickerState.steps[flavorPickerState.activeStepIndex];
    if (!currentStep) return;

    // Atualizar Header
    const stepEl = seleciona('.flavorPickerStep');
    const titleEl = seleciona('.flavorPickerTitle');
    const subtitleEl = seleciona('.flavorPickerSubtitle');

    if (stepEl) stepEl.innerText = currentStep.stepText || `Passo ${flavorPickerState.activeStepIndex + 1} de ${flavorPickerState.steps.length}`;
    if (titleEl) titleEl.innerText = currentStep.title || 'Escolha o Sabor';
    if (subtitleEl) subtitleEl.innerText = currentStep.subtitle || 'Toque no sabor para selecionar';

    // Gerenciar visibilidade das abas de categoria conforme allowedCategories
    const catButtons = selecionaTodos('.flavor-cat-btn');
    const allowed = currentStep.allowedCategories || [];

    catButtons.forEach(btn => {
        const cat = btn.getAttribute('data-cat');
        if (allowed.length > 0) {
            if (cat === 'all') {
                btn.style.display = '';
                btn.innerText = (allowed.length === 1 && allowed[0] === 'Pizzas Doces') ? 'Todas Doces' : ((allowed.length === 1 && allowed[0] === 'Pizzas Gourmet') ? 'Todas Gourmet' : 'Todas');
            } else if (allowed.includes(cat)) {
                btn.style.display = '';
            } else {
                btn.style.display = 'none';
            }
        } else {
            btn.style.display = '';
            if (cat === 'all') btn.innerText = 'Todas';
        }
    });

    // Resetar aba ativa para 'all'
    catButtons.forEach(b => b.classList.remove('active'));
    const btnAll = document.querySelector('.flavor-cat-btn[data-cat="all"]');
    if (btnAll) btnAll.classList.add('active');
    flavorPickerState.currentFilterCat = 'all';

    renderizarCardsSabores();
};

const renderizarCardsSabores = () => {
    const grid = seleciona('.flavor-mini-grid');
    const noResultsEl = seleciona('.flavor-no-results');
    if (!grid) return;

    grid.innerHTML = '';

    const currentStep = flavorPickerState.steps[flavorPickerState.activeStepIndex];
    if (!currentStep) return;

    const allowed = currentStep.allowedCategories || [];
    const sizeIndex = (typeof currentStep.sizeIndex !== 'undefined') ? currentStep.sizeIndex : 1;
    const selectedId = currentStep.selectedId || (flavorPickerState.selectedFlavors[flavorPickerState.activeStepIndex] ? flavorPickerState.selectedFlavors[flavorPickerState.activeStepIndex].id : null);

    const normalizar = str => (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const termoBusca = normalizar(flavorPickerState.searchTerm);

    // Filtrar pizzas reais (excluir Bebidas e Combos)
    const pizzasFiltradas = pizzaJson.filter(item => {
        if (item.category === 'Bebidas' || item.category === 'Combos') return false;

        // Se houver restrição de categorias
        if (allowed.length > 0 && !allowed.includes(item.category)) return false;

        // Filtro da aba selecionada
        if (flavorPickerState.currentFilterCat !== 'all' && item.category !== flavorPickerState.currentFilterCat) return false;

        // Filtro de pesquisa
        if (termoBusca !== '') {
            const nomeMatch = normalizar(item.name).includes(termoBusca);
            const descMatch = normalizar(item.description).includes(termoBusca);
            const catMatch = normalizar(item.category).includes(termoBusca);
            if (!nomeMatch && !descMatch && !catMatch) return false;
        }

        return true;
    });

    if (pizzasFiltradas.length === 0) {
        if (noResultsEl) noResultsEl.style.display = 'block';
    } else {
        const todasCores = ['card-red', 'card-white', 'card-green'];

        // Determinar dinamicamente o número de colunas do grid
        let numCols = 3;
        const compCols = window.getComputedStyle(grid).gridTemplateColumns;
        if (compCols && compCols !== 'none') {
            const parsedCols = compCols.trim().split(/\s+/).filter(Boolean).length;
            if (parsedCols > 0) numCols = parsedCols;
        } else {
            const w = grid.clientWidth || window.innerWidth;
            numCols = w < 650 ? 1 : (w < 980 ? 2 : 3);
        }

        // Algoritmo de intercalação 2D aleatório:
        // Garante que nenhum card seja da mesma cor que o vizinho da esquerda NEM que o vizinho de cima (coluna)
        const coresAtribuidas = [];
        pizzasFiltradas.forEach((_, idx) => {
            const col = idx % numCols;
            const row = Math.floor(idx / numCols);

            const corEsquerda = col > 0 ? coresAtribuidas[idx - 1] : null;
            const corCima = row > 0 ? coresAtribuidas[idx - numCols] : null;

            const opcoesValidas = todasCores.filter(c => c !== corEsquerda && c !== corCima);
            const corEscolhida = opcoesValidas[Math.floor(Math.random() * opcoesValidas.length)];
            coresAtribuidas.push(corEscolhida);
        });

        pizzasFiltradas.forEach((pizza, index) => {
            const preco = obterPrecoPizzaNoTamanho(pizza, sizeIndex, currentStep.sizeKey);
            const isSelected = selectedId === pizza.id;
            const cor = coresAtribuidas[index];

            const card = document.createElement('div');
            card.className = `flavor-mini-card ${cor} ${isSelected ? 'selected' : ''}`;
            card.setAttribute('data-id', pizza.id);
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Selecionar ${pizza.name} - ${formatoReal(preco)}`);

            const categoriaSimplificada = pizza.category.replace('Pizzas ', '');

            card.innerHTML = `
                <div class="flavor-mini-img-wrap">
                    <img src="${pizza.img}" alt="${pizza.name}" loading="lazy" />
                </div>
                <div class="flavor-mini-info">
                    <span class="flavor-mini-cat">${categoriaSimplificada}</span>
                    <h4 class="flavor-mini-name">${pizza.name}</h4>
                    <p class="flavor-mini-desc">${pizza.description || ''}</p>
                    <div class="flavor-mini-bottom">
                        <span class="flavor-mini-price">${formatoReal(preco)}</span>
                        <span class="flavor-mini-select-btn">${isSelected ? 'Selecionado &#10003;' : 'Selecionar'}</span>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                selecionarSaborAtual(pizza);
            });

            grid.appendChild(card);
        });
    }
};

const selecionarSaborAtual = (pizza) => {
    flavorPickerState.selectedFlavors[flavorPickerState.activeStepIndex] = pizza;

    // Se é seleção única
    if (flavorPickerState.onSelectCallback) {
        flavorPickerState.onSelectCallback(pizza);
        fecharFlavorPicker();
        return;
    }

    // Se é fluxo multi-passos
    const proximoPasso = flavorPickerState.activeStepIndex + 1;
    if (proximoPasso < flavorPickerState.steps.length) {
        flavorPickerState.activeStepIndex = proximoPasso;
        flavorPickerState.searchTerm = '';
        const searchInput = seleciona('#flavorPickerSearch');
        if (searchInput) searchInput.value = '';
        const searchClear = seleciona('.flavorPickerSearchClear');
        if (searchClear) searchClear.style.display = 'none';

        const listArea = seleciona('.flavorPickerListArea');
        if (listArea) {
            gsap.fromTo(listArea, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.25 });
        }

        atualizarEtapaFlavorPicker();
    } else {
        // Concluiu todos os passos
        if (flavorPickerState.onCompleteCallback) {
            flavorPickerState.onCompleteCallback(flavorPickerState.selectedFlavors);
        }
        fecharFlavorPicker();
    }
};

const voltarEtapaFlavorPicker = () => {
    if (flavorPickerState.activeStepIndex > 0) {
        flavorPickerState.activeStepIndex--;
        flavorPickerState.searchTerm = '';
        const searchInput = seleciona('#flavorPickerSearch');
        if (searchInput) searchInput.value = '';
        const searchClear = seleciona('.flavorPickerSearchClear');
        if (searchClear) searchClear.style.display = 'none';

        const listArea = seleciona('.flavorPickerListArea');
        if (listArea) {
            gsap.fromTo(listArea, { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.25 });
        }

        atualizarEtapaFlavorPicker();
    } else {
        fecharFlavorPicker();
    }
};

const configurarFlavorPicker = () => {
    // Pesquisa
    const searchInput = seleciona('#flavorPickerSearch');
    const searchClear = seleciona('.flavorPickerSearchClear');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            flavorPickerState.searchTerm = e.target.value;
            if (searchClear) {
                searchClear.style.display = flavorPickerState.searchTerm.length > 0 ? 'flex' : 'none';
            }
            renderizarCardsSabores();
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            flavorPickerState.searchTerm = '';
            if (searchInput) searchInput.value = '';
            searchClear.style.display = 'none';
            renderizarCardsSabores();
        });
    }

    // Abas de categorias
    selecionaTodos('.flavor-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selecionaTodos('.flavor-cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            flavorPickerState.currentFilterCat = btn.getAttribute('data-cat');
            renderizarCardsSabores();
        });
    });

    // Botão Voltar
    const backBtn = seleciona('.flavorPickerBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', voltarEtapaFlavorPicker);
    }
};

// Expor funções globais para os outros scripts (ex: combos.js)
window.abrirModalMeioAMeio = abrirModalMeioAMeio;
window.fecharModalMeioAMeio = fecharModalMeioAMeio;
window.fecharFlavorPicker = fecharFlavorPicker;
window.abrirSeletorSaboresUnico = (options) => {
    flavorPickerState = {
        isOpen: true,
        activeStepIndex: 0,
        steps: [
            {
                title: options.title || 'Escolha o Sabor',
                stepText: options.stepText || '1 de 1',
                subtitle: options.subtitle || 'Toque no sabor para selecionar',
                allowedCategories: options.allowedCategories || [],
                sizeIndex: (typeof options.sizeIndex !== 'undefined') ? options.sizeIndex : 1,
                selectedId: options.selectedId || null
            }
        ],
        selectedFlavors: [],
        currentFilterCat: 'all',
        searchTerm: '',
        onSelectCallback: options.onSelect || null,
        onCompleteCallback: null
    };
    abrirModalFlavorPicker();
};
window.iniciarFluxoSelecaoSabores = (options) => {
    flavorPickerState = {
        isOpen: true,
        activeStepIndex: 0,
        steps: options.steps || [],
        selectedFlavors: [],
        currentFilterCat: 'all',
        searchTerm: '',
        onSelectCallback: null,
        onCompleteCallback: options.onComplete || null
    };
    abrirModalFlavorPicker();
};

botoesFechar();
carregarPizzas();
filtro();
pesquisar();
abrirCarrinho();
mudarQuantidadeModal();
adicionarNoCarrinho();
atualizarCarrinho();
fecharCarrinho();
enviarPedido();
limparCarrinho();
configurarPopupAvisoPromo();
tratarParametrosURL();
configurarModalMeioAMeio();
configurarFlavorPicker();
