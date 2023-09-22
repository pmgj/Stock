class Dividends {
    constructor(name) {
        this.name = name;
    }
    setMatrix(matrix) {
        this.matrix = matrix;
    }
    getDividendsByYear() {
        let map = new Map();
        this.matrix.forEach(tr => {
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
        return map;
    }
    toString() {
        return this.name;
    }
}
class MinFiveYear extends Dividends {
    constructor() {
        super("Menor dividendos nos últimos 5 anos");
    }
    compute() {
        let map = this.getDividendsByYear();
        let today = new Date();
        let cYear = today.getFullYear();
        let div = [];
        for (let index = cYear - 5; index <= cYear - 1; index++) {
            div.push(map.get(index));
        }
        div.sort((a, b) => a - b);
        return div.shift();
    }
}
let columns = [
    { header: "Ticker", prop: "ticker", type: 'string', f: upperCase },
    { header: 'Preço', prop: "preco", type: 'currency', f: identity },
    { header: 'VPA', prop: "vpa", type: 'currency', f: identity },
    { header: 'LPA', prop: "lpa", type: 'currency', f: identity },
    { header: 'Dividendos', prop: "dividendos", type: 'currency', f: computeDividends },
    { header: 'Quantidade', type: 'number', f: computeStockQuantity },
    { header: 'Valor Corrente', type: 'currency', f: computeCurrentValue },
    { header: 'Preço Alvo Bazin', type: 'currency', f: computePrecoAlvoBazin },
    { header: 'Preço Alvo Graham', type: 'currency', f: computePrecoAlvoGraham },
];
let dividends = [new MinFiveYear()];
let cFormatter = new Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' });
let nFormatter = new Intl.NumberFormat('pt-br', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 });
async function addTicker(ticker) {
    const url = new URL("http://localhost:8080/Stock/webresources/stock");
    url.searchParams.append("ticker", ticker);
    const response = await fetch(url.href);
    const json = await response.json();
    let tbody = document.querySelector("tbody");
    let tr = tbody.insertRow(-1);
    columns.forEach(obj => {
        let td = tr.insertCell(-1);
        let result = obj.prop ? obj.f(json[obj.prop]) : obj.f(json);
        td.textContent = (obj.type === 'currency') ? cFormatter.format(result) : (obj.type === 'number') ? nFormatter.format(result) : result;
    });
}
function upperCase(v) {
    return v.toUpperCase();
}
function identity(v) {
    return v;
}
function computeDividends(dividendos) {
    let index = parseInt(document.querySelector("#dividendos").value);
    let obj = dividends[index];
    obj.setMatrix(dividendos);
    return obj.compute();
}
function computeStockQuantity(obj) {
    let salary = document.querySelector("#salario").valueAsNumber;
    let dividendos = computeDividends(obj.dividendos);
    return 12 * salary / (dividendos === 0 ? 0.01 : dividendos);
}
function computeCurrentValue(obj) {
    let preco = obj.preco;
    let quantidade = computeStockQuantity(obj);
    return preco * quantidade;
}
function computePrecoAlvoBazin(obj) {
    let dividendos = computeDividends(obj.dividendos);
    let rentabilidade = document.querySelector("#rentabilidade").valueAsNumber;
    return 100 * dividendos / rentabilidade;
}
function computePrecoAlvoGraham(obj) {
    let pl = document.querySelector("#pl").valueAsNumber;
    let pa = document.querySelector("#pa").valueAsNumber;
    return Math.sqrt(pl * pa * obj.vpa * obj.lpa);
}
onload = () => {
    let select = document.querySelector("#dividendos");
    dividends.forEach((v, i) => select.add(new Option(v.toString(), i)));
    let thead = document.querySelector("thead");
    let tr = thead.insertRow(-1);
    columns.forEach(obj => {
        let th = document.createElement("th");
        tr.appendChild(th);
        th.textContent = obj.header;
    });
    addTicker("sanb11");
    addTicker("brsr6");
    addTicker("taee11");
};