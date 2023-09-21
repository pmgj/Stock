let columns = [
    { header: "Ticker", prop: "ticker", type: 'string', f: upperCase },
    { header: 'Preço', prop: "preco", type: 'currency', f: identity },
    { header: 'VPA', prop: "vpa", type: 'currency', f: identity },
    { header: 'LPA', prop: "lpa", type: 'currency', f: identity },
    { header: 'Dividendos', prop: "dividendos", type: 'currency', f: getMinYearDividends },
    { header: 'Quantidade', type: 'number', f:  computeStockQuantity},
    { header: 'Valor Corrente', type: 'currency', f: currentValue },
    { header: 'Preço Alvo Bazin', type: 'currency', f: precoAlvoBazin },
    { header: 'Preço Alvo Graham', type: 'currency', f: precoAlvoGraham },
];
let cFormatter = new Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' });
let nFormatter = new Intl.NumberFormat('pt-br', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 });
async function addTicker(ticker) {
    const url = new URL("http://localhost:8080/Stock/webresources/stock");
    url.searchParams.append("ticker", ticker);
    const response = await fetch(url.href);
    const json = await response.json();
    return json;
}
function upperCase(v) {
    return v.toUpperCase();
}
function identity(v) {
    return v;
}
function getMinYearDividends(dividendos) {
    let map = new Map();
    dividendos.forEach(tr => {
        let data = tr.payDate;
        const date = new Date(data);
        let dividendos = tr.value;
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
    for (let index = cYear - 5; index <= cYear - 1; index++) {
        div.push(map.get(index));
    }
    div.sort((a, b) => a - b);
    return div.shift();
}
function computeStockQuantity(obj) {
    let salary = document.querySelector("#salario").valueAsNumber;
    let dividendos = getMinYearDividends(obj.dividendos);
    return 12 * salary / (dividendos === 0 ? 0.01 : dividendos);
}
function currentValue(obj) {
    let preco = obj.preco;
    let quantidade = computeStockQuantity(obj);
    return preco * quantidade;
}
function precoAlvoBazin(obj) {
    let dividendos = getMinYearDividends(obj.dividendos);
    let rentabilidade = document.querySelector("#rentabilidade").valueAsNumber;
    return 100 * dividendos / rentabilidade;
}
function precoAlvoGraham(obj) {
    let pl = document.querySelector("#pl").valueAsNumber;
    let pa = document.querySelector("#pa").valueAsNumber;
    return Math.sqrt(pl * pa * obj.vpa * obj.lpa);
}
onload = () => {
    let thead = document.querySelector("thead");
    let tr = thead.insertRow(-1);
    columns.forEach(obj => {
        let th = document.createElement("th");
        tr.appendChild(th);
        th.textContent = obj.header;
    });
    let matrix = [];
    matrix.push(addTicker("sanb11"));
    matrix.push(addTicker("brsr6"));
    matrix.push(addTicker("taee11"));
    Promise.all(matrix).then(array => {
        let tbody = document.querySelector("tbody");
        array.forEach(value => {
            let tr = tbody.insertRow(-1);
            columns.forEach(obj => {
                let td = tr.insertCell(-1);
                let result = (obj.prop) ? obj.f(value[obj.prop]) : obj.f(value);
                td.textContent = (obj.type === 'currency') ? cFormatter.format(result) : (obj.type === 'number') ? nFormatter.format(result) : result;
            });
        });
    });
};