let columns = [
    { header: 'Preço', xpath: '//*[@id="cards-ticker"]/div[1]/div[2]/div/span', type: 'currency', f: null },
    { header: 'VPA', xpath: '//*[@id="table-indicators"]/div[17]/div[1]/span', type: 'currency', f: null },
    { header: 'LPA', xpath: '//*[@id="table-indicators"]/div[18]/div[1]/span', type: 'currency', f: null },
    { header: 'Dividendos', xpath: null, type: 'currency', f: getMinYearDividends },
];
let formatter = new Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' });
async function logMovies(type, ticker) {
    const url = new URL("http://localhost:8080/Stock/webresources/stock");
    url.searchParams.append("ticker", ticker);
    url.searchParams.append("type", type);
    const response = await fetch(url.href);
    const html = await response.text();
    let doc = createDoc(html);
    let thead = document.querySelector("thead");
    if (!thead.rows[0]) {
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
    }
    createColumns(ticker, doc);
}
function createColumns(ticker, doc) {
    let tbody = document.querySelector("tbody");
    let tr = document.createElement("tr");
    tbody.appendChild(tr);
    let td = tr.insertCell(-1);
    td.textContent = ticker.toUpperCase();
    columns.forEach(obj => {
        let td = tr.insertCell(-1);
        if (obj.xpath) {
            const iterator = doc.evaluate(obj.xpath, doc, null, XPathResult.ANY_TYPE, null);
            let element = iterator.iterateNext();
            let number = element.textContent.replace(/[^0-9,.]/g, '').replace(',', '.');
            if (obj.type === 'currency') {
                td.textContent = formatter.format(number);
            } else {
                td.textContent = number;
            }
        }
        if (obj.f) {
            obj.f(doc, td);
        }
    });
}
function getMinYearDividends(doc, td) {
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
    let n = div.shift();
    td.textContent = formatter.format(n);
}
function createDoc(html) {
    let parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
}
logMovies("acoes", "sanb11");
logMovies("acoes", "brsr6");
logMovies("acoes", "taee11");