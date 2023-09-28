import { MinFiveYear } from "./Dividends.js";

class GUI {
    constructor() {
        this.COLUMNS = [
            { header: "Ticker", prop: "ticker", type: 'string', f: this.upperCase },
            { header: 'Preço', prop: "preco", type: 'currency', f: this.identity },
            { header: 'P/VP', prop: "pvp", type: 'number', f: this.identity },
            { header: 'Cotistas', prop: "cotistas", type: 'number', f: this.identity },
            { header: 'Liquidez', prop: "liquidez", type: 'currency', f: this.identity },
            { header: 'Segmento', prop: "segmento", type: 'string', f: this.identity },
            { header: 'Dividendos', prop: "dividendos", type: 'currency', f: this.computeDividends.bind(this) },
            { header: 'Quantidade', type: 'number', f: this.computeStockQuantity.bind(this) },
            { header: 'Valor Corrente', type: 'currency', f: this.computeCurrentValue.bind(this) },
            { header: 'Preço Alvo Bazin', type: 'currency', f: this.computePrecoAlvoBazin.bind(this) },
            { header: 'Desconto', type: 'percent', f: this.computeDiscount.bind(this) },
        ];
        this.DIVIDENDS = [new MinFiveYear()];
    }
    async addTicker(ticker) {
        const url = new URL("http://localhost:8080/Stock/webresources/fii");
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
    computeDiscount(obj) {
        let teto = this.computePrecoAlvoBazin(obj);
        let preco = obj.preco;
        return (preco - teto) / teto;
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
        let fiis = ["KNCR11",
            "HFOF11",
            "VILG11",
            "BRCO11",
            "BTLG11",
            "XPML11",
            "VISC11",
            "PVBI11",
            "HGLG11",
            "XPLG11",
            "LVBI11",
            "HSLG11",
            "GGRC11",
            "TRBL11",
            "RBRL11",
            "XPIN11",
            "HCTR11",
            "MXRF11",
            "IRDM11",
            "RBRF11",
            "JSRE11",
            "KCRE11",
            "KNSC11",
            "RBRY11",
            "KNRI11",
            "VRTA11",
            "HGRE11"];
        fiis.forEach(fii => this.addTicker(fii));
        let newTableObject = document.querySelector("table");
        sorttable.makeSortable(newTableObject);
    }
}
let gui = new GUI();
gui.init();