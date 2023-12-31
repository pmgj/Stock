import { MinFiveYear } from "./Dividends.js";

class GUI {
    constructor() {
        this.COLUMNS = [
            { header: "Ticker", prop: "ticker", type: 'string', f: this.upperCase },
            { header: 'Preço', prop: "preco", type: 'currency', f: this.identity },
            { header: 'VPA', prop: "vpa", type: 'currency', f: this.identity },
            { header: 'LPA', prop: "lpa", type: 'currency', f: this.identity },
            { header: 'P/L', type: 'number', f: this.pl.bind(this) },
            { header: 'P/VP', type: 'number', f: this.pvp.bind(this) },
            { header: 'Dividendos', prop: "dividendos", type: 'currency', f: this.computeDividends.bind(this) },
            { header: 'Quantidade', type: 'number', f: this.computeStockQuantity.bind(this) },
            { header: 'Valor Corrente', type: 'currency', f: this.computeCurrentValue.bind(this) },
            { header: 'Preço Alvo Bazin', type: 'currency', f: this.computePrecoAlvoBazin.bind(this) },
            { header: 'Preço Alvo Graham', type: 'currency', f: this.computePrecoAlvoGraham.bind(this) },
        ];
        this.DIVIDENDS = [new MinFiveYear()];
    }
    async addTicker(ticker) {
        const url = new URL("http://localhost:8080/Stock/webresources/stock");
        url.searchParams.append("ticker", ticker);
        const response = await fetch(url.href);
        const json = await response.json();
        let tbody = document.querySelector("tbody");
        let tr = tbody.insertRow(-1);
        let formatters = {
            "currency": new Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' }),
            "number": new Intl.NumberFormat('pt-br', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            "percent": new Intl.NumberFormat('pt-br', { style: 'percent' })
        };
        this.COLUMNS.forEach(obj => {
            let td = tr.insertCell(-1);
            let result = obj.prop ? obj.f(json[obj.prop]) : obj.f(json);
            td.textContent = formatters[obj.type] ? formatters[obj.type].format(result) : result;
        });
    }
    pl(obj) {
        let preco = obj.preco;
        let lpa = obj.lpa;
        return preco / lpa;
    }
    pvp(obj) {
        let preco = obj.preco;
        let vpa = obj.vpa;
        return preco / vpa;
    }
    upperCase(v) {
        return v.toUpperCase();
    }
    identity(v) {
        return v;
    }
    computeDividends(dividendos) {
        let index = parseInt(document.querySelector("#dividendos").value);
        let obj = this.DIVIDENDS[index];
        obj.setMatrix(dividendos);
        return obj.compute();
    }
    computeStockQuantity(obj) {
        let salary = document.querySelector("#salario").valueAsNumber;
        let dividendos = this.computeDividends(obj.dividendos);
        return 12 * salary / (dividendos === 0 ? 0.01 : dividendos);
    }
    computeCurrentValue(obj) {
        let preco = obj.preco;
        let quantidade = this.computeStockQuantity(obj);
        return preco * quantidade;
    }
    computePrecoAlvoBazin(obj) {
        let dividendos = this.computeDividends(obj.dividendos);
        let rentabilidade = document.querySelector("#rentabilidade").valueAsNumber;
        return 100 * dividendos / rentabilidade;
    }
    computePrecoAlvoGraham(obj) {
        let pl = document.querySelector("#pl").valueAsNumber;
        let pa = document.querySelector("#pa").valueAsNumber;
        return Math.sqrt(pl * pa * obj.vpa * obj.lpa);
    }
    init() {
        let select = document.querySelector("#dividendos");
        this.DIVIDENDS.forEach((v, i) => select.add(new Option(v.toString(), i)));
        let thead = document.querySelector("thead");
        let tr = thead.insertRow(-1);
        this.COLUMNS.forEach(obj => {
            let th = document.createElement("th");
            tr.appendChild(th);
            th.textContent = obj.header;
        });
        let stocks = ["sanb11", "brsr6", "taee11", "bbas3", "petr4", "sapr11", "cmig4", "pssa3", "itsa4", "trpl4",
            "bbse3", "bbdc4", "cxse3", "csmg3", "vale3", "klbn11", "csan3", "irbr3", "cple6", "cpfe3", "enbr3", "sbsp3",
            "aesb3", "eqtl3", "abcb4"];
        stocks.forEach(stock => this.addTicker(stock));
        let newTableObject = document.querySelector("table");
        sorttable.makeSortable(newTableObject);
    }
}
let gui = new GUI();
gui.init();