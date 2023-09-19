let map = new Map();
map.set('Preço', '//*[@id="cards-ticker"]/div[1]/div[2]/div/span');
// map.set('P/L', '//*[@id="table-indicators"]/div[1]/div[1]/span');
map.set('VPA', '//*[@id="table-indicators"]/div[17]/div[1]/span');
map.set('LPA', '//*[@id="table-indicators"]/div[18]/div[1]/span');
async function logMovies(type, ticker) {
    const url = new URL("http://localhost:8080/Stock/webresources/stock");
    url.searchParams.append("ticker", ticker);
    url.searchParams.append("type", type);
    const response = await fetch(url.href);
    const html = await response.text();
    let doc = createDoc(html);
    let thead = document.querySelector("thead");
    let tr = document.createElement("tr");
    thead.appendChild(tr);
    let th = document.createElement("th");
    tr.appendChild(th);
    th.textContent = "Ticker";
    map.forEach((value, key) => {
        let th = document.createElement("th");
        tr.appendChild(th);
        th.textContent = key;
    });
    let tbody = document.querySelector("tbody");
    tr = document.createElement("tr");
    tbody.appendChild(tr);
    td = tr.insertCell(-1);
    td.textContent = ticker.toUpperCase();
    map.forEach((value, key, map) => {
        const iterator = doc.evaluate(value, doc, null, XPathResult.ANY_TYPE, null);
        let element = iterator.iterateNext();
        let number = element.textContent.replace(/[^0-9,.]/g, '').replace(',', '.');
        let td = tr.insertCell(-1);
        td.textContent = number;
    });
    const iterator = doc.evaluate('//*[@id="table-dividends-history"]/tbody', doc, null, XPathResult.ANY_TYPE, null);
    let element = iterator.iterateNext();
    getMinYearDividends(element);
}
function getMinYearDividends(table) {
    [...table.rows].forEach(tr => {
        let data = tr.cells[2].textContent;
        const [day, month, year] = data.split('/');
        const date = new Date(+year, +month - 1, +day);
        let divi = tr.cells[3].textContent.replace(',', '.');
        let dividendos = Number(divi);
        console.log(date, dividendos);
    });
}
function createDoc(html) {
    let parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
}
logMovies("acoes", "sanb11");