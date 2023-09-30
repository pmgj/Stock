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
            let dateString = tr.ed;
            let [day, month, year] = dateString.split('/');
            const date = new Date(+year, +month - 1, +day);
            let dividendos = tr.v;
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
export class MinFiveYear extends Dividends {
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