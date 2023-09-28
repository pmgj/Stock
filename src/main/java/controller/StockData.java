package controller;

import java.util.List;

public record StockData(String ticker, double preco, double vpa, double lpa, double pvp, List<Dividends> dividendos) {
}