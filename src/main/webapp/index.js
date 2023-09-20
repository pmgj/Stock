let columns = [
    { header: 'Preço', xpath: '//*[@id="cards-ticker"]/div[1]/div[2]/div/span', type: 'currency', f: null },
    { header: 'VPA', xpath: '//*[@id="table-indicators"]/div[17]/div[1]/span', type: 'currency', f: null },
    { header: 'LPA', xpath: '//*[@id="table-indicators"]/div[18]/div[1]/span', type: 'currency', f: null },
    { header: 'Dividendos', xpath: null, type: 'currency', f: getMinYearDividends },
    { header: 'Quantidade', xpath: null, type: 'number', f: computeStockQuantity },
    { header: 'Valor Corrente', xpath: null, type: 'currency', f: currentValue },
    { header: 'Preço Alvo Bazil', xpath: null, type: 'currency', f: precoAlvoBazin },
];
let cFormatter = new Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' });
let nFormatter = new Intl.NumberFormat('pt-br', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 });
async function addTicker(type, ticker) {
    const url = new URL("http://localhost:8080/Stock/webresources/stock");
    url.searchParams.append("ticker", ticker);
    url.searchParams.append("type", type);
    const response = await fetch(url.href);
    const html = await response.text();
    let doc = createDoc(html);
    return createColumns(ticker, doc);
}
function createColumns(ticker, doc) {
    let info = {};
    info.ticker = ticker.toUpperCase();
    info.values = new Map();
    columns.forEach(obj => {
        if (obj.xpath) {
            const iterator = doc.evaluate(obj.xpath, doc, null, XPathResult.ANY_TYPE, null);
            let element = iterator.iterateNext();
            let number = element.textContent.replace(/[^0-9,.]/g, '').replace(',', '.');
            info.values.set(obj.header, { v: +number, t: obj.type });
        }
        if (obj.f) {
            info.values.set(obj.header, { v: obj.f(doc, info), t: obj.type });
        }
    });
    return info;
}
function getMinYearDividends(doc) {
    const iterator = doc.evaluate('//*[@id="table-dividends-history"]/tbody', doc, null, XPathResult.ANY_TYPE, null);
    let table = iterator.iterateNext();
    let map = new Map();
    [...table.rows].forEach(tr => {
        let data = tr.cells[2].textContent;
        const [day, month, year] = data.split('/');
        const date = new Date(+year, +month - 1, +day);
        let divi = tr.cells[3].textContent.replace(',', '.');
        let dividendos = Number(divi);
        let fyear = date.getFullYear();
        if (map.has(fyear)) {
            let n = map.get(fyear);
            n += dividendos;
            map.set(fyear, n);
        } else {
            map.set(fyear, dividendos);
        }
    });
    let today = new Date();
    let cYear = today.getFullYear();
    let div = [];
    for (let index = cYear - 6; index < cYear - 1; index++) {
        div.push(map.get(index));
    }
    div.sort((a, b) => a - b);
    return div.shift();
}
function createDoc(html) {
    let parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
}
function computeStockQuantity(doc, info) {
    let salary = document.querySelector("#salario").valueAsNumber;
    let dividendos = info.values.get("Dividendos").v;
    return 12 * salary / (dividendos === 0 ? 0.01 : dividendos);
}
function currentValue(doc, info) {
    let preco = info.values.get("Preço").v;
    let quantidade = info.values.get("Quantidade").v;
    return preco * quantidade;
}
function precoAlvoBazin(doc, info) {
    let dividendos = info.values.get("Dividendos").v;
    let rentabilidade = document.querySelector("#rentabilidade").valueAsNumber;
    return 100 * dividendos / rentabilidade;
}
onload = () => {
    let thead = document.querySelector("thead");
    let tr = document.createElement("tr");
    thead.appendChild(tr);
    let th = document.createElement("th");
    tr.appendChild(th);
    th.textContent = "Ticker";
    columns.forEach(obj => {
        let th = document.createElement("th");
        tr.appendChild(th);
        th.textContent = obj.header;
    });
    let matrix = [];
    matrix.push(addTicker("acoes", "sanb11"));
    matrix.push(addTicker("acoes", "brsr6"));
    matrix.push(addTicker("acoes", "taee11"));
    Promise.all(matrix).then(array => {
        let tbody = document.querySelector("tbody");
        array.forEach(value => {
            let tr = document.createElement("tr");
            tbody.appendChild(tr);
            let td = tr.insertCell(-1);
            td.textContent = value.ticker;
            value.values.forEach(elem => {
                let td = tr.insertCell(-1);
                if (elem.t === 'currency') {
                    td.textContent = cFormatter.format(elem.v);
                } else {
                    td.textContent = nFormatter.format(elem.v);
                }
            });
        });
    });
};